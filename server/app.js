import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import auth from './routes/auth.js';
import addUser from './routes/adminRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
const app = express()
dotenv.config()


const port = process.env.PORT

app.use(cors({
    origin: ['https://borgirarchive-1.onrender.com', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
}));

// Add a pre-flight OPTIONS handler for all routes
app.options('*', cors());

app.use(express.json());

app.use('/api/auth', auth);

app.use('/api/admin', addUser)

app.use('/api/videos', videoRoutes)

//Connection
const connect = async () => {
    try{
        await mongoose.connect(process.env.MONGODB)
    }catch(error){
        console.log(error);
    }
}

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB')
})
mongoose.connection.on('connected', () => {
    console.log('Conneceted from MongoDB')
})

app.listen(port, () =>{
    connect();
    console.log(`Connected to PORT ${port}`);
})