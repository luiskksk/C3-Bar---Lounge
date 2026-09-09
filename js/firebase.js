import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyBK63kiX1FILy5gmxf-oN1KYy3UvfVPlos",
    authDomain: "c3-bar-e-lounge.firebaseapp.com",
    projectId: "c3-bar-e-lounge",
    storageBucket: "c3-bar-e-lounge.firebasestorage.app",
    messagingSenderId: "971788505165",
    appId: "1:971788505165:web:170d0c58c0c6c30e208c04"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();


export {
    app,
    auth,
    db,
    googleProvider
};