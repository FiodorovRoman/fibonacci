import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCD2GHupaIClHyaVmoZaz1RK-YU0FhahgE",
  authDomain: "fibonacci-feba2.firebaseapp.com",
  projectId: "fibonacci-feba2",
  storageBucket: "fibonacci-feba2.firebasestorage.app",
  messagingSenderId: "484821611250",
  appId: "1:484821611250:web:b87289961887b16694166b",
  measurementId: "G-V3RJTJ6V0J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
