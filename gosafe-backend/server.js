// server.js (Node.js with Express)
require('dotenv').config(); // Load environment variables from .env
// --- TEMPORARY FIX: Disable strict SSL certificate checking for broken external APIs ---
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const fetch = require('node-fetch').default;
const jwt = require('jsonwebtoken'); 
const User = require('./User'); 
const TravelRecord = require('./TravelRecord'); 
const { OAuth2Client } = require('google-auth-library'); 
const crypto = require('crypto'); 
const path = require('path'); 

const app = express();
const PORT = process.env.PORT || 3000;
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY; 
const JWT_SECRET = process.env.JWT_SECRET; 
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 

// REMOVED: TUGO_API_KEY is no longer used here.

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- Middleware Setup ---
app.use(cors()); 
app.use(express.json()); 

// FIX: SERVE STATIC FILES FROM THE ADJACENT 'frontend' FOLDER
app.use(express.static(path.join(__dirname, '..', 'frontend'))); 

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Function to verify Google ID token
async function verifyGoogleToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: GOOGLE_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    return {
        googleId: payload['sub'], 
        email: payload['email'],
        username: payload['name']
    };
}


// --- Security Middleware (Application-Level API Key) ---
const authenticateApp = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey || apiKey !== process.env.BACKEND_API_KEY) {
        return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    }
    next();
};

// --- Security Middleware (User-Level OAuth 2.0/JWT Validation) ---
const authenticateUser = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
};

// --- USER AUTHENTICATION ENDPOINTS (Unchanged) ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const newUser = new User({ username, password });
        await newUser.save();
        
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            message: 'Registration successful',
            token: token,
            userId: newUser._id
        });

    } catch (error) {
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'User already exists.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            message: 'Login successful',
            token: token,
            userId: user._id
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/auth/google-signin', async (req, res) => {
    try {
        const { id_token } = req.body;
        
        if (!id_token) {
            return res.status(400).json({ message: 'Google ID token required.' });
        }

        const googleUser = await verifyGoogleToken(id_token);
        
        let user = await User.findOne({ username: googleUser.email }); 

        if (!user) {
            user = new User({
                username: googleUser.email, 
                password: crypto.randomBytes(20).toString('hex') 
            });
            await user.save();
        }
        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Google Sign-in successful',
            token: token,
            userId: user._id,
            username: googleUser.username 
        });

    } catch (error) {
        console.error('Google Sign-In Verification Error:', error);
        res.status(401).json({ message: 'Invalid Google token or backend verification failed.' });
    }
});


// --- DATA ENDPOINTS ---

/**
 * Server-side function to fetch Safety Data (Reverted to Travel Advisory Info API)
 */
const fetchSafety = async (safetyCode) => {
    const url = `https://www.travel-advisory.info/api?countrycode=${safetyCode}`; 
    
    console.log("Fetching Travel Advisory Data URL:", url);
    
    try {
        const response = await fetch(url);
        
        // GRACEFUL FAILURE 1: Check if the response content is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.warn("Travel Advisory API returned non-JSON content. Assuming external error.");
            throw new Error("API returned non-JSON response.");
        }
        
        const data = await response.json();
        
        // GRACEFUL FAILURE 2: Check the data payload for errors or missing country data
        if (data.error || !data.data[safetyCode] || !data.data[safetyCode].advisory) {
            console.warn(`Travel Advisory API reported internal error or missing data for ${safetyCode}.`);
            throw new Error("Data missing for country code or API internal error.");
        }
        
        const countryData = data.data[safetyCode];
        
        return { 
            advisory: {
                score: countryData.advisory.score || 0.0,
                message: countryData.advisory.message || "Advisory information not available.",
                source: countryData.advisory.source || "#",
                updated: countryData.advisory.updated || new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('Travel Advisory API Fetch Error:', error.message);
        // Default graceful failure structure
        return { advisory: { score: 0.0, message: `No official advisory found (Reverted API failure: ${error.message}).`, source: "#", updated: new Date().toISOString() } };
    }
};


/**
 * 1. GET /api/data : Endpoint for API Proxy and Aggregation
 */
app.get('/api/data', authenticateApp, async (req, res) => {
    
    const { city, country, safetyCode } = req.query; 

    if (!city || !country || !safetyCode) {
        return res.status(400).json({ message: 'Missing city, country code, or safety code parameters.' });
    }

    // Server-side function to fetch Weather Data (Uses ISO-2 code)
    const fetchWeather = async () => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&appid=${OPENWEATHER_KEY}`;
        const response = await fetch(url);
        if (response.status === 404) throw new Error(`City "${city}" not found.`);
        if (!response.ok) throw new Error('OpenWeatherMap service failed.');
        return response.json();
    };

    try {
        const [weatherData, safetyData] = await Promise.all([
            fetchWeather(),
            fetchSafety(safetyCode) 
        ]);

        const aggregatedResponse = {
            city: city, 
            country: country,
            weather: weatherData,
            safety: safetyData,
            timestamp: new Date().toISOString()
        };

        res.status(200).json(aggregatedResponse);
    } catch (error) {
        console.error('Server Aggregation Error:', error.message);
        res.status(502).json({ message: `Data analysis failed. Check inputs or external API status: ${error.message}` });
    }
});


/**
 * 2. POST /api/records : Endpoint for storing aggregated data (NOW REQUIRES JWT)
 */
app.post('/api/records', authenticateApp, authenticateUser, async (req, res) => {
    try {
        const { locationName, aggregatedData } = req.body;
        
        if (!locationName || !aggregatedData) {
            return res.status(400).json({ message: 'Missing required fields: locationName or aggregatedData' });
        }

        const newRecord = new TravelRecord({
            userId: req.userId,
            locationName: locationName,
            aggregatedData: aggregatedData
        });

        const savedRecord = await newRecord.save();

        res.status(201).json({ 
            message: 'Record successfully saved', 
            record: savedRecord 
        });
    } catch (error) {
        console.error('Error saving record:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * 3. GET /api/records : Endpoint to retrieve stored data (NOW REQUIRES JWT)
 */
app.get('/api/records', authenticateApp, authenticateUser, async (req, res) => {
    try {
        const records = await TravelRecord.find({ userId: req.userId }).sort({ createdAt: -1 });

        res.status(200).json(records); 

    } catch (error) {
        console.error('Error retrieving records:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Ready for communication via HTTPS (required for production)`);
});