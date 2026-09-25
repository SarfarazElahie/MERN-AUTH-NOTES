import dotenv from "dotenv";

dotenv.config();

// Required env variables — server won't start if any is missing
const required = [
  "MONGO_URI",
  "PORT",
  "CLIENT_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} does not exist in .env`);
  }
}

const config = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  CLIENT_URL: process.env.CLIENT_URL,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default config;