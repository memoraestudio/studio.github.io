import {
    auth,
    db,
    onAuthStateChanged,
    collection,
    addDoc,
    serverTimestamp,
    doc,
    query,
    where,
    onSnapshot,
    Timestamp
} from "./firebase-config.js";

let userId;
onAuthStateChanged(auth, u => {
    if (!u) return location.href = "index.html";
    userId = u.uid;
    loadMyEvents();
});

document.getElementById('logout').onclick = () => auth.signOut();

document.getElementById('formEvent').onsubmit = async e => {
    e.preventDefault();
    const f = e.target;
    const menit = Number(f.menit.value);
    const deadline = new Date(Date.now() + menit * 60000);

    // buat event
    const evRef = await addDoc(collection(db, "events"), {
        title: f.title.value,
        description: f.desc.value,
        status: "polling",
        deadline: Timestamp.fromDate(deadline),
        createdBy: userId,
        createdAt: serverTimestamp()
    });

    // buat polls
    const polls = [];
    f.places.value.split("\n").map(v => v.trim()).filter(v => v)
        .forEach(v => polls.push({
            type: "place",
            value: v,
            votes: 0
        }));
    f.dates.value.split("\n").map(v => v.trim()).filter(v => v)
        .forEach(v => polls.push({
            type: "date",
            value: v,
            votes: 0
        }));
    f.times.value.split("\n").map(v => v.trim()).filter(v => v)
        .forEach(v => polls.push({
            type: "time",
            value: v,
            votes: 0
        }));

    const batch = polls.map(p => addDoc(collection(db, "events", evRef.id, "polls"), p));
    await Promise.all(batch);
    f.reset();
};

function loadMyEvents() {
    const q = query(collection(db, "events"), where("createdBy", "==", userId));
    onSnapshot(q, snap => {
        const box = document.getElementById('myEvents');
        box.innerHTML = "";
        snap.forEach(d => {
            const e = d.data();
            box.innerHTML += `<div class="event-card">
        <b>${e.title}</b> – ${e.status} – ${e.deadline.toDate().toLocaleString()}
      </div>`;
        });
    });
}