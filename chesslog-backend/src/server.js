import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { loginController, refreshController, registerController } from './controllers/authcontroller.js';
import { sessionController } from './controllers/sessionController.js';
import getSessions from './controllers/logcontroller.js';

import verifyToken from './middleware/auth.js';

dotenv.config()

const PORT = process.env.PORT;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json())

// POST 
app.post('/register', registerController)
app.post('/login', loginController)
app.post('/refresh', refreshController)
app.post('/add-session', verifyToken, sessionController)

// GET
app.get('/analytics', verifyToken, getSessions)




app.listen(PORT, () => {
    console.log(`Listening on port ${PORT} `);
})



// Credentials - tester1@test.com : password
//  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZW1haWwiOiJ0ZXN0ZXIxQHRlc3QuY29tIiwiaWF0IjoxNzg4NTI3MzQyLCJleHAiOjE3ODg1MjgyNDJ9.XwvSW_pRmcr8_QN19OOE31MZUCTFwDTzagIq-bWYUxs",
//  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZW1haWwiOiJ0ZXN0ZXIxQHRlc3QuY29tIiwiaWF0IjoxNzg4NTI3MzQyLCJleHAiOjE3OTExMTkzNDJ9.no99tbW-HddEGtg_TV_y_eYowVz712EiNAAslWTTuEc",
