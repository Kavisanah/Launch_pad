// Setup test environment variables before loading app config
process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "5001";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/student-showcase-test";
process.env.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || "test.auth0.com";
process.env.AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || "https://test-api";
process.env.AUTH0_ISSUER = process.env.AUTH0_ISSUER || "https://test.auth0.com/";
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dummy";
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "dummy";
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "dummy";
process.env.CLIENT_URL = process.env.CLIENT_URL || "https://localhost:5173";
