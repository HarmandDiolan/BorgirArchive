const corsOptions = {
    origin: [
        'https://borgir-archive-iwo1.vercel.app',
        'https://borgir-archive.vercel.app',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

export default corsOptions; 