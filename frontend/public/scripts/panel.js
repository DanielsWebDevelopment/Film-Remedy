document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const panelTitle = document.getElementById('panel-title');
    const panelRating = document.getElementById('panel-rating');
    const panelDesc = document.getElementById('panel-desc');
    const cameraButton = document.getElementById('camera-button');

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
            alert('No movie found.Recognition failed. Please try again.');
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
});








































// document.addEventListener('DOMContentLoaded', function() {
//     const PanelImage = document.getElementById('panel-image');
//     const panelTitle = document.getElementById('panel-title');
//     const panelRating = document.getElementById('panel-rating');
//     const panelDesc = document.getElementById('panel-desc');
//     const cameraButton = document.getElementById('camera-button');

//     const apiKey = '93ae8da6a962b00c7f9b494442c5b320';
    
//     const movieIds = [
//         168530, 323675, 30535, 778106, 1082203, 533535, 365177, 646097, 1022789, 519182, 917496, 573435, 718821, 970347, 
//         1079091, 945961, 831815, 748783, 762441, 1226578, 704239, 1115396, 5492, 1032823, 1130053, 1160018, 653346, 
//         1129598, 1049574, 1094138, 1114513, 950526, 698687, 588648, 826510, 1066262, 1140168, 786892, 14258, 929590, 
//         823464, 1091298, 974262, 1010581, 1311550, 1059064, 1011985, 1134424, 1209290, 404378, 1281826, 1216191, 799583, 
//         804616, 299536, 940551, 748167, 14836, 1174618, 150540, 157336, 348, 1154864, 1104844, 1272228, 938614, 667538, 
//         385687, 1152624, 729165, 569094, 603692, 609681, 634649, 693134, 1147400, 502356, 1207898, 646683, 1184918, 
//         931461, 177572, 787699, 335983, 580489, 675353, 671, 1096342, 1280440, 1227624, 1086747, 9495, 122, 120, 1096197, 
//         3933, 746036, 315162, 1139817, 293660, 969492, 872585, 955555
//     ];

//     const tvShowIds = [
//         63770, 2224, 1508, 65701, 59941, 4551, 31132, 2123, 65763, 30745, 246331, 68073, 4448, 17404, 651, 210078, 39373, 
//         102321, 60694, 1416, 456, 13943, 10382, 1749, 80587, 2734, 4614, 1554, 4239, 4429, 37680, 655, 21755, 1622, 580, 
//         47480, 67136, 62974, 94997, 60625, 2691, 217216, 62201, 72089, 48891, 46910, 88924, 4629, 4630, 1434, 32726, 71712, 
//         32692, 1431, 764, 1920, 2637, 4057, 6145, 4238, 60735, 29173, 4250, 32798, 65334, 67198, 2883, 2612, 96650, 69478, 
//         218643, 2962, 38693, 1855, 4229, 39272, 62286, 2710, 11089, 37606, 1408, 693, 5146, 79061, 209247, 62181, 58841, 
//         314, 153312, 60059, 4033, 79593, 66573, 1667, 120089, 25992, 1400, 45, 1399, 59717, 95, 44006, 4601, 549, 10283, 
//         1620, 63333, 87917, 1405, 71790, 17937, 60989, 39340, 95479, 2191, 4616, 6390, 2190, 79744, 61662, 1433, 32390, 
//         11105, 30703, 31917, 8592, 13319, 75006
//     ];

//     // cameraButton.addEventListener('click', async () => {
        
//     // })
// });
