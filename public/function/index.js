const {
    onSchedule
} = require("firebase-functions/v2/scheduler");
const {
    logger
} = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// jalan setiap menit
exports.lockEvent = onSchedule("every 1 minutes", async () => {
    const now = admin.firestore.Timestamp.now();
    const snap = await db.collection("events")
        .where("status", "==", "polling")
        .where("deadline", "<=", now)
        .get();
    for (const doc of snap.docs) {
        // hitung vote
        const pollsSnap = await db.collection("events").doc(doc.id).collection("polls").get();
        const voteCount = {};
        pollsSnap.forEach(p => voteCount[p.id] = p.data().votes || 0);

        const votesSnap = await db.collection("events").doc(doc.id).collection("votes").get();
        const count = {}; // pollId -> total
        votesSnap.forEach(v => {
            const pid = v.data().pollId;
            count[pid] = (count[pid] || 0) + 1;
        });
        // update counts
        const batch = db.batch();
        for (const p of pollsSnap.docs) {
            batch.update(p.ref, {
                votes: count[p.id] || 0
            });
        }
        await batch.commit();

        // tentukan pemenang per type
        const best = {};
        for (const p of pollsSnap.docs) {
            const t = p.data().type;
            if (!best[t] || (count[p.id] || 0) > (count[best[t]] || 0)) best[t] = p.id;
        }
        const final = {};
        for (const t of ["place", "date", "time"]) {
            const pid = best[t];
            if (pid) {
                const ps = pollsSnap.docs.find(x => x.id === pid);
                final[t] = ps.data().value;
            }
        }
        // lock
        await doc.ref.update({
            status: "locked",
            finalSchedule: final
        });
        logger.log("Event locked:", doc.id, final);
    }
});