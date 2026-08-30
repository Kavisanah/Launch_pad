import dotenv from "dotenv";

dotenv.config();

const requiredVariables = [
  "PORT",
  "MONGODB_URI",
  "AUTH0_DOMAIN",
  "AUTH0_AUDIENCE",
  "AUTH0_ISSUER",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLIENT_URL",
  "NODE_ENV",
];

requiredVariables.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
});

const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),
  MONGODB_URI: process.env.MONGODB_URI,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  AUTH0_ISSUER: process.env.AUTH0_ISSUER,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
  HTTPS_KEY_PATH: process.env.HTTPS_KEY_PATH || "",
  HTTPS_CERT_PATH: process.env.HTTPS_CERT_PATH || "",
});

export default env;