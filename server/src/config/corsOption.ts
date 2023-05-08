const allowedOrigins = ['http://localhost:5173']

export const corsOptions = {
  origin: (origin: string, cb) => {
    allowedOrigins.includes(origin) ? cb(true, null) : cb(null, new Error('NOT ALLOWED BY CORS'))
  },
  credentials: true,
  optionsSuccessStatus: 200
}