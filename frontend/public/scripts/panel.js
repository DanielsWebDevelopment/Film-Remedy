document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const panelTitle = document.getElementById('panel-title');
    const panelRating = document.getElementById('panel-rating');
    const panelDesc = document.getElementById('panel-desc');
    const cameraButton = document.getElementById('camera-button');
    const closeButton = document.getElementById('close-camera');
    const scanningOverlay = document.getElementById('scanning-overlay');
    const statusMessage = document.getElementById('status-message');

    let stream = null;
    let scanning = false;

    if (cameraButton) {
        cameraButton.addEventListener('click', function() {
            if (window.location.pathname.includes('dashboard')) {
                window.location.href = './panel.html';
            } else {
                startCamera();
            }
        });
    }

    if (window.location.pathname.includes('panel')) {
        startCamera();
    }

    async function startCamera() {
        try {
            hideResult();
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }});
            if (video) {
                video.srcObject = stream;
                video.style.display = 'block';
                video.play();
            }
            if (canvas) {
                canvas.style.display = 'none';
            }
            startScanning();
        } catch (err) {
            console.error('Error accessing camera:', err);
            displayError('Failed to access the camera. Please make sure you have given permission and try again');
        }
    }

    function startScanning() {
        scanning = true;
        if (scanningOverlay) {
            scanningOverlay.style.display = "block";
        }
        hideResult();
        scanFrame();
    }

    function stopScanning() {
        scanning = false;
        if (scanningOverlay) {
            scanningOverlay.style.display = "none";
        }
    }

    async function scanFrame() {
        if (!scanning) return;

        try {
            if (canvas && video) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);

                const imageData = canvas.toDataURL('image/jpeg');
                await recognizeMovie(imageData);
            }
        } catch (error) {
            console.error('Error in scanFrame:', error);
            displayError('An error occurred while scanning. Please try again.');
        }
        setTimeout(scanFrame, 1000);
    }

        async function recognizeMovie(imageData) {
            try {
                displayStatus('Analyzing image...'); 
                const response = await fetch('https://film-remedy.onrender.com/api/movie-capture', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Send the captured image data
                    body: JSON.stringify({ imageData }),
                });
                if (!response.ok) {
                    throw new Error('Movie recognition failed');
                }
                // Parse and handle the response from the server
                const movieInfo = await response.json();
                if (movieInfo.title) {
                    displayResult(movieInfo);
                    stopScanning();
                } else {
                    displayStatus('No movie recognized. Keep scanning...');
                    hideResult();
                }
            } catch (error) {
                console.error('Error recognizing movie:', error);
                displayError('Failed to recognize movie. Please try again.');
            }
    }

    function displayStatus(message) {
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.style.display = 'block';
            statusMessage.style.color = 'black'; 
        }
    }

    function displayError(message) {
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.style.color = 'red';
            statusMessage.style.display = 'block';
        }
    }

    function displayResult(movieInfo) {
        if (panelTitle && panelRating && panelDesc) {
            panelTitle.style.display = "block";
            panelRating.style.display = "block";
            panelDesc.style.display = "block";

            panelTitle.innerHTML = `<strong><p>${movieInfo.title}</p></strong><small>Year: ${movieInfo.year}</small>`;
            panelRating.innerHTML = generateStarRating(movieInfo.rating);
            panelDesc.innerHTML = `<p>${movieInfo.description}</p>`;

            const panelContent = document.getElementById('panel-content');
            if (panelContent) {
                panelContent.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    function hideResult() {
        if (panelTitle) panelTitle.style.display = "none";
        if (panelRating) panelRating.style.display = "none";
        if (panelDesc) panelDesc.style.display = "none";
    }

    function generateStarRating(rating) {
        const fullStars = Math.floor(rating / 2);
        const halfStar = rating % 2 >= 1;
        let starsHtml = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHtml += '<span><i class="fa-solid fa-star"></i></span>';
            } else if (i === fullStars && halfStar) {
                starsHtml += '<span><i class="fa-solid fa-star-half-stroke"></i></span>';
            } else {
                starsHtml += '<span><i class="fa-regular fa-star"></i></span>';
            }
        }
        return starsHtml;
    }

    if (closeButton) {
        closeButton.addEventListener('click', function() {
            stopScanning();
            if (stream) {
                stream.getTracks().forEach(function(track) {
                    track.stop();
                });
            }

            if (video) {
                video.srcObject = null;
                video.style.display = 'none';
            }
            hideResult();
        });
    }
});
