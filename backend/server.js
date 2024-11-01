import dotenv from 'dotenv';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import vision from '@google-cloud/vision';
import { randomBytes } from 'node:crypto';

const PORT = process.env.PORT || 3001;
const app = express();
dotenv.config();
config();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const generateSecretKey = () => {
    return randomBytes(64).toString('hex');
  };

const secretKey = generateSecretKey();

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
     } 
}));

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const client = new vision.ImageAnnotatorClient({
    credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    } else {
        res.redirect('/');
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use('/scripts', express.static(path.join(__dirname, '../frontend/public/scripts')));
app.use('/config', express.static(path.join(__dirname, '../frontend/public/config')));

// Dashboard route
app.get("/dashboard", isAuthenticated, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/public/dashboard.html"));
});

app.get("/panel", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/public/panel.html"));
});

// Other routes
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/public/index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/public/login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/public/register.html"));
});

app.get("/settings", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/public/settings.html"));
});

app.get("/support", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/public/support.html"));
});

app.post('/api/movie-capture', async (req, res) => {
    const { imageData } = req.body;

    try {
        const image = imageData.split(',')[1];
        const request = {
            image: { content: imageData },
            features: [{ type: 'LABEL_DETECTION' }]
        };
        const [result] = await client.annotateImage(request);
        
        const labels = result.labelAnnotations;
        const searchTerms = labels.slice(0, 5).map(label => label.description);
        const searchQuery = searchTerms.join(' ');

        const tmdbResponse = await axios.get('https://api.themoviedb.org/3/search/multi', {
            params: {
                api_key: TMDB_API_KEY,
                query: searchQuery,
            }
        });
        
        if (tmdbResponse.data.results.length > 0) {
            const item = tmdbResponse.data.results[0];
            let responseData;

            if (item.media_type === 'movie') {
                responseData = {
                    title: item.title,
                    year: new Date(item.release_date).getFullYear(),
                    description: item.overview,
                    rating: item.vote_average,
                    type: 'movie'
                };
            } else if (item.media_type === 'tv') {
                responseData = {
                    title: item.name,
                    year: new Date(item.first_air_date).getFullYear(),
                    description: item.overview,
                    rating: item.vote_average,
                    type: 'tv'
                };
            }

            if (responseData) {
                res.json(responseData);
            } else {
                res.status(404).json({ error: 'No matching movie or TV show found' });
            }
        } else {
            res.status(404).json({ error: 'No matching movie or TV show found' });
        }
    } catch (error) {
        console.error('Error during movie recognition', error);
        res.status(500).json({ error: 'Movie recognition failed' });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
