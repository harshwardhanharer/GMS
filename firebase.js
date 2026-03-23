import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAkbWNwFiMEyC0mgA4PReCNWL6_-NHPeRg",
    authDomain: "gms-system-29487.firebaseapp.com",
    projectId: "gms-system-29487",
    storageBucket: "gms-system-29487.firebasestorage.app",
    messagingSenderId: "598096046416",
    appId: "1:598096046416:web:d391ce8647ceb69c40a455",
    measurementId: "G-81FYC3CCV1"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
