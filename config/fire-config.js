import firebase from 'firebase';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID
};

try {
    firebase.initializeApp(firebaseConfig);
} catch(err){
if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error', err.stack)}
}
const fire = firebase;
export default fire;