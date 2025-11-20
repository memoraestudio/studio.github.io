// ===============  GANTI INI ===============
const firebaseConfig = {
    apiKey: "AIzaSyCJAJR8ODqVXRwUjsIgC1b_Yvdyw6eyJr8",
    authDomain: "bulutangkis-ca92b.firebaseapp.com",
    projectId: "bulutangkis-ca92b",
    storageBucket: "bulutangkis-ca92b.firebasestorage.app",
    messagingSenderId: "1008111745548",
    appId: "1:1008111745548:web:4a1f852caac9a2356a0c29",
    measurementId: "G-B1CK8E3FY0"
};
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export {
    signInAnonymously,
    onAuthStateChanged,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy
};