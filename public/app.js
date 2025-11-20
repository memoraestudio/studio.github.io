import {
    auth,
    db,
    onAuthStateChanged,
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    serverTimestamp
} from "./firebase-config.js";

let userId;
onAuthStateChanged(auth, u => {
    if (!u) return location.href = "index.html";
    userId = u.uid;
    loadEvents();
});

document.getElementById('logout').onclick = () => {
    auth.signOut();
};

function loadEvents() {
    const q = query(collection(db, "events"), where("status", "==", "polling"));
    onSnapshot(q, snap => {
        const box = document.getElementById('eventList');
        box.innerHTML = "";
        snap.forEach(d => renderEvent(d));
    });
}

function renderEvent(docSnap) {
    const ev = docSnap.data();
    const wrap = document.createElement('div');
    wrap.className = "event-card";
    wrap.innerHTML = `<h3>${ev.title}</h3><p>${ev.description}</p>
    <p>Deadline: ${ev.deadline.toDate().toLocaleString()}</p>`;

    // tombol pilihan
    const pollRef = collection(db, "events", docSnap.id, "polls");
    onSnapshot(pollRef, qs => {
        const votes = {}; // pollId -> count
        qs.forEach(p => votes[p.id] = (p.data().votes || 0));

        // cek apakah user sudah vote
        const voteRef = doc(db, "events", docSnap.id, "votes", userId);
        getDoc(voteRef).then(snapVote => {
            const sudah = snapVote.exists;
            wrap.innerHTML += "<hr>";
            qs.forEach(p => {
                const btn = document.createElement('button');
                btn.textContent = `${p.data().type}: ${p.data().value} (${votes[p.id] || 0})`;
                btn.disabled = sudah;
                btn.onclick = async () => {
                    await setDoc(voteRef, {
                        pollId: p.id,
                        votedAt: serverTimestamp()
                    });
                };
                wrap.appendChild(btn);
            });
            if (sudah) wrap.innerHTML += "<small>Kamu sudah memilih</small>";
        });
    });

    document.getElementById('eventList').appendChild(wrap);
}