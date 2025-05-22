const corsOptions = {
    origin: [
        'https://borgir-archive-iwo1.vercel.app',
        'https://borgir-archive.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
};

export default corsOptions; 