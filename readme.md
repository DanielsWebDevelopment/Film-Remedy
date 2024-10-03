# Welcome to film Remedy
Film Remedy is a web application that allows users to identify movies by capturing images of movie posters or scenes using their device's camera.

## Features Implemented

1. ### **Dashboard Page**
   - Camera button to initiate movie recognition process
   - Redirects to Panel page for image capture

2. ### **Panel Page**
   - Automatic camera activation
   - Image capture functionality
   - Display of recognized movie information

3. ### **Movie Recognition**
   - Integration with Google Cloud Vision API for image analysis
   - Integration with TMDB API for movie information retrieval

4. ### **Server-Side Processing**
   - Express.js server handling API requests
   - Image processing and API integrations

## Technical Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express.js
- APIs: Google Cloud Vision API, TMDB API
- Authentication: Session-based (implemented but not fully integrated)

## Current Status

- Basic functionality implemented
- Camera capture working
- movie recognition - In Progress
- UI elements in place for dashboard and panel pages

## Next Steps

1. Improve error handling and user feedback
2. Enhance UI/UX, especially for mobile devices
3. Add more detailed movie information and recommendations
4. Optimize performance and reduce API calls where possible

## Testing

- Local testing implemented
- Mobile testing - In progress

## Deployment

- Frontend Deployed Via Netlify
- Backend Deployed via Render

## Notes

- Firebase configuration and Google Cloud Vision API setup completed
- Camera functionality needs thorough testing on various devices and browsers
