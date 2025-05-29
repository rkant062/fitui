# FitUI - Fitness and Expense Tracking Application

FitUI is a full-stack web application that helps users track their fitness activities, manage expenses, and maintain daily checklists. The application consists of a React frontend (fitui) and a Node.js/Express backend (fitback).

## Project Structure

```
.
├── fitui/           # React frontend application
├── fitback/         # Node.js/Express backend server
└── .github/         # GitHub configuration files
```

## Features

- User Authentication (Signup/Login)
- Daily Fitness Tracking
- Expense Management
- Task Checklist Management
- Category-based Budgeting
- JWT-based Authentication
- Secure Password Hashing
- MongoDB Database Integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd fitback
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the fitback directory with the following variables:
   ```
   JWT_SECRET=your_jwt_secret_key
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd fitui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### POST /api/create-user
Create a new user account.
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** User object with hashed password

#### POST /api/login
Authenticate user and get JWT token.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** JWT token in cookie

#### POST /api/validate-token
Validate the JWT token.
- **Headers:** Authorization: Bearer <token>
- **Response:** Token validity status

### Data Management Endpoints

#### User Data
- **GET /api/user-data**: Get user profile and settings
- **PUT /api/user-data**: Update user profile
- **GET /api/user-checklist**: Get user's checklist items
- **POST /api/user-checklist**: Add new checklist item
- **PUT /api/user-checklist/:id**: Update checklist item
- **DELETE /api/user-checklist/:id**: Delete checklist item

#### Fitness Tracking
- **POST /api/fitness-data**: Add new fitness record
- **GET /api/fitness-data**: Get fitness history
- **PUT /api/fitness-data/:id**: Update fitness record
- **DELETE /api/fitness-data/:id**: Delete fitness record

#### Expense Management
- **POST /api/expenses**: Add new expense
- **GET /api/expenses**: Get expense history
- **PUT /api/expenses/:id**: Update expense
- **DELETE /api/expenses/:id**: Delete expense

## Database Schema

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String,
  category: [{
    name: String,
    budget: Number
  }],
  checklist: [{
    task: String,
    completed: Boolean,
    priority: Number
  }]
}
```

### Data Schema (Fitness)
```javascript
{
  userId: ObjectId,
  day: String,
  date: Date,
  caloriesBurned: Number,
  checklist: [{
    task: String,
    completed: Boolean,
    priority: Number
  }]
}
```

### Expense Schema
```javascript
{
  userId: ObjectId,
  amount: Number,
  category: String,
  description: String,
  date: Date
}
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- CORS protection
- HTTP-only cookies
- Secure session management

## Development

### Frontend Development
- Built with React
- Uses modern React hooks and functional components
- Implements responsive design
- Uses context for state management

### Backend Development
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- Middleware for request validation
- Error handling middleware

## Deployment

The application can be deployed to any hosting service that supports Node.js applications. For production deployment:

1. Build the frontend:
   ```bash
   cd fitui
   npm run build
   ```

2. Configure environment variables for production
3. Set up MongoDB Atlas cluster
4. Deploy the backend server
5. Configure CORS for production domains

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Environment Configuration

The application uses `dotenv-flow` for environment configuration, supporting multiple environments:

- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Testing environment

### Environment Variables

Create a `.env` file based on `.env.example` with the following variables:

```bash
# Node Environment
NODE_ENV=development

# Server Configuration
PORT=5000

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_min_32_chars_long

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Cookie Configuration
COOKIE_SECRET=your_cookie_secret_key
```

### Environment Validation

The application uses Joi for environment variable validation. Required variables are:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Minimum 32 characters
- `COOKIE_SECRET`: For cookie signing

Optional variables with defaults:
- `NODE_ENV`: development, production, or test (default: development)
- `PORT`: Server port (default: 5000)
- `CORS_ORIGIN`: Allowed CORS origin (default: http://localhost:3000) 