document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const panelTitle = document.getElementById('panel-title');
    const panelRating = document.getElementById('panel-rating');
    const panelDesc = document.getElementById('panel-desc');
    const cameraButton = document.getElementById('camera-button');
    const closeButton = document.getElementById('close-camera');
    const scanningOverlay = document.getElementById('scanning-overlay');

    let stream = null;

    if (cameraButton) {
        cameraButton.addEventListener('click', () => {
            window.location.href = '/panel';
        });
    } else if (video) {
        startCamera();
    }

    async function startCamera() {
        try {
            hideResult();
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }});
            video.srcObject = stream;
            video.style.display = 'block';
            video.play();
            canvas.style.display = 'none';
            canningOverlay.style.display = 'block';
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Failed to access the camera. Please make sure you have given permission and try again');
        }
    }

    if (video) {
        video.addEventListener('click', captureImage);
    }

    function captureImage() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        video.style.display = 'none';
        canvas.style.display = 'block';
        scanningOverlay.style.display = 'none';

        hideResult();
        const imageData = canvas.toDataURL('image/jpeg');
        recognizeMovie(imageData);
    }

    async function recognizeMovie(imageData) {
        try {
            const response = await fetch('/api/movie-capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageData }),
            });

            if (!response.ok) {
                throw new Error('Movie recognition failed');
            }

            const movieInfo = await response.json();

            if (movieInfo.title) {
                displayResult(movieInfo);
            } else {
                throw new Error('No movie found');
            }
        } catch (error) {
            console.error('Error recognizing movie:', error);
            alert('No movie found. Recognition failed. Please try again.');
            hideResult();
        } finally {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }

    function displayResult(movieInfo) {
        panelTitle.style.display ="block";
        panelRating.style.display = "block";
        panelDesc.style.display = "block";
        
        panelTitle.innerHTML = `<strong><p>${movieInfo.title}</p></strong><small>Year: ${movieInfo.year}</small>`;
        panelRating.innerHTML = generateStarRating(movieInfo.rating);
        panelDesc.innerHTML = `<p>${movieInfo.description}</p>`;
    }

     function hideResult() {
        panelTitle.style.display = "none";
        panelRating.style.display = "none";
        panelDesc.style.display = "none";
        scanningOverlay.style.display = "none";
    }

    // This function generates HTML for a star rating based on the movie's rating.
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
            // Stop the video stream
            if (stream) {
                stream.getTracks().forEach(function(track) {
                    track.stop();
                });
            }

            video.srcObject = null;
            videoCamera.style.display = 'none';
        });
    }
});
