const allowedOrigins = ['http://localhost:5173'];
export const corsOptions = {
    origin: (origin, cb) => {
        allowedOrigins.includes(origin) ? cb(null, true) : cb(null, new Error('NOT ALLOWED BY CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
};
//# sourceMappingURL=corsOption.js.map