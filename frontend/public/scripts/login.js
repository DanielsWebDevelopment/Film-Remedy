import { auth } from '../config/config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const error = document.getElementById('error');

    // validating email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        error.textContent = 'Please enter a valid email address';
        return;
    }


    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            error.textContent = '';
            alert('User logged in successfully');
            window.location.href = '../dashboard.html';
        })
        .catch((error) => {
            alert(error.message);
        });
});