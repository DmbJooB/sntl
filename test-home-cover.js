import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    try {
        const docRef = doc(db, 'settings', 'appearance');
        const docSnap = await getDoc(docRef);
        console.log("Appearance settings:", docSnap.data());
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
check();
