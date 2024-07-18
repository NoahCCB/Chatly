import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, Auth, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCBvlxtzsCq_IQ0cIkSAtcDzv-SnAZuQfI",
    authDomain: "chatroom-1f2e9.firebaseapp.com",
    projectId: "chatroom-1f2e9",
    storageBucket: "chatroom-1f2e9.appspot.com",
    messagingSenderId: "334496841828",
    appId: "1:334496841828:web:1b47eee50eca457ed8df71",
    measurementId: "G-PQ8NX2QE1Y"
};  

const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification };    
// export type { User };

