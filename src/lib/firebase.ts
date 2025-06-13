
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAx2nZmMhxfxCCheNclCxldmqEHRhDx5GE",
  authDomain: "alelinks-ada96.firebaseapp.com",
  databaseURL: "https://alelinks-ada96-default-rtdb.firebaseio.com",
  projectId: "alelinks-ada96",
  storageBucket: "alelinks-ada96.firebasestorage.app",
  messagingSenderId: "47710583890",
  appId: "1:47710583890:web:f7aa2a31fa3ba0d74fb38b",
  measurementId: "G-YGYJCNSWXM"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
