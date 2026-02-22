const allowedOriginsEnv = process.env.ALLOWED_ORIGINS

const corsOptions = () => {
  const allowedOrigins = allowedOriginsEnv.split(',').map((origin) => origin.trim())
  return {
    origin: allowedOrigins,
    credentials: true,
  }
}

export default corsOptions
