import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyBVvKH4aszJT3ZaSj5qcYxiFHNGRPX5plk",
    authDomain: "film-remedy.firebaseapp.com",
    databaseURL: "https://film-remedy-default-rtdb.firebaseio.com",
    projectId: "film-remedy",
    storageBucket: "film-remedy.appspot.com",
    messagingSenderId: "532406262922",
    appId: "1:532406262922:web:a904d52832f9562b86a173"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };