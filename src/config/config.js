import dotenv from "dotenv";
dotenv.config();

const app = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || "development",
};

const db = {
  uri:
    process.env.NODE_ENV === "production"
      ? process.env.MONGO_URI
      : process.env.MONGO_URI_TEST,
};

const jwt = {
  secret: process.env.JWT_SECRET,
  expiration: process.env.JWT_EXPIRATION,
};

const email = {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
};

const chrome = {
  executablePath: process.env.CHROME_EXECUTABLE_PATH,
};

const cloudinary = {
  cloudName: process.env.CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_KEY_SECRET,
};

export {
  app as appConfig,
  db as dbConfig,
  jwt as jwtConfig,
  email as emailConfig,
  chrome as chromeConfig,
  cloudinary as cloudinaryConfig,
};
