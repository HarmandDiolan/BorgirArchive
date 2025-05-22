# Borgir Archive

A full-stack application for managing and archiving content.

## Project Structure

```
BorgirArchive/
├── client/          # Frontend React application
└── server/          # Backend Node.js/Express API
```

## Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## Frontend Setup

1. Navigate to the client directory:
```bash
cd client/borgir
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Deployment

The application is configured for deployment on Vercel. Make sure to set up the following environment variables in your Vercel project:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `NODE_ENV`

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/add-user` - Add new user (admin only)
- `GET /api/videos` - Get all videos
- `POST /api/videos` - Add new video