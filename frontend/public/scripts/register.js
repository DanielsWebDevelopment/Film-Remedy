import { auth, database } from '../config/config.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const error = document.getElementById('error');

    // validating email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        error.textContent = 'Please enter a valid email address';
        return;
    }

    // checking to see if the passwords a certain length.
    if (password.length < 8) {
        error.textContent = 'Password must be at least 8 characters long';
        return;
    }

    // using regex to check the password.
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        error.textContent = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        return;
    }

    if (password !== confirmPassword) {
        error.textContent = 'Please confirm your password';
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userRef = ref(database, 'users/' + user.uid);
        await set(userRef, {
            email: user.email,
            uid: user.uid
        });

        alert('User registered successfully');
        window.location.href = '/login';
    } catch (error) {
        alert('Registration error: ' + error.message);
    }
});