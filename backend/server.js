import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import chatController from './controllers/chat.controller.js';
import leadController from './controllers/lead.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('MONGODB_URI not provided, running without database for MVP.');
}

// Routes
app.post('/api/chat', chatController.handleChat);
app.post('/api/leads', leadController.createLead);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
