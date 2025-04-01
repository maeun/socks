// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCG28nrHLu9fDe0UEFyK2m-XE2yn2fZqSc",
  authDomain: "socks-afd28.firebaseapp.com",
  databaseURL: "https://socks-afd28-default-rtdb.firebaseio.com",
  projectId: "socks-afd28",
  storageBucket: "socks-afd28.firebasestorage.app",
  messagingSenderId: "1070022308354",
  appId: "1:1070022308354:web:e644b2ff9f5d86f7916d1b",
  measurementId: "G-JFM44S4L2R",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig); // export하여 사용 표시
export const database = getDatabase(app);
