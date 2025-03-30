# Backend Server

## Description

This is a Node.js backend server using Express, Mongoose, and other dependencies.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd backend
   ```

2. Install backend dependencies:

   ```sh
   npm install
   ```

## Running the Server

### Development

To run the server in development mode with hot-reloading using `nodemon`:

```sh
npm run dev
```

### Production

To run the server in production mode:

```sh
npm start
```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```
PORT=5000
NODE_ENV=development
MONGO_URI=<your-production-mongodb-uri>
MONGO_URI_TEST=<your-test-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRATION=<your-token-expiration>
EMAIL_USER=<email_for_otp>
EMAIL_PASS=<your_app_password>
CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_KEY_SECRET=<your-cloudinary-api-secret>
FRONTEND_URL=<your-frontend-url>
```

## API Documentation

For detailed API documentation, visit the `/api-docs` endpoint after running the server.

## Deployment on Render

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Set the Root Directory to "backend"
4. Set the Build Command to "npm run build"
5. Set the Start Command to "npm start"
6. Add all environment variables from .env.example
7. Deploy!

## License

This project is licensed under the ISC License.
