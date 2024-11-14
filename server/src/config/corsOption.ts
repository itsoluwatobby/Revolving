const allowedOrigins = ['http://localhost:5173', 'ws://127.0.0.1:64521/', 'https://revolving.vercel.app']

export const corsOptions = {
  //"Access-Control-Allow-Origin": "*",
  origin: (origin: string, cb) => {
    allowedOrigins.includes(origin) ? cb(null, true) : cb(null, new Error('NOT ALLOWED BY CORS'))
  },
  credentials: true,
  optionsSuccessStatus: 200
}
