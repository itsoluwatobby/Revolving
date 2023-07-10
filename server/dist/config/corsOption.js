const allowedOrigins = ['http://localhost:5173', 'ws://127.0.0.1:64521/'];
export const corsOptions = {
    "Allow-Control-Access-Origin": "*",
    // origin: (origin: string, cb) => {
    //   allowedOrigins.includes(origin) ? cb(null, true) : cb(null, new Error('NOT ALLOWED BY CORS'))
    // },
    credentials: true,
    optionsSuccessStatus: 200
};
//# sourceMappingURL=corsOption.js.map