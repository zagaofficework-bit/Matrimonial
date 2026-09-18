import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCfd9x2qGXP3I88MKpHqnZ2AFkfwTeppns",
  authDomain: "vivahsetu-8247a.firebaseapp.com",
  projectId: "vivahsetu-8247a",
  storageBucket: "vivahsetu-8247a.appspot.com",
  messagingSenderId: "314162433068",
  appId: "1:314162433068:web:326c463f474968673a1589"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);



