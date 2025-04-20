# Focus Scheduler Pro

A modern task management application with AI-powered scheduling capabilities.

## Project Structure

```
focus-scheduler-pro/
├── src/
│   ├── server/              # Backend server code
│   │   ├── config/         # Server configuration
│   │   │   └── database.js # Database configuration
│   │   ├── routes/         # API routes
│   │   │   └── api.js      # API endpoints
│   │   └── index.js        # Server entry point
│   ├── lib/                # Shared utilities
│   │   └── api.ts         # API client configuration
│   ├── components/         # React components
│   ├── pages/             # React pages
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context
│   ├── types/             # TypeScript types
│   ├── styles/            # CSS styles
│   ├── App.tsx            # Main React component
│   └── main.tsx           # React entry point
├── public/                # Static assets
├── .env                   # Environment variables
├── .env.development      # Development environment variables
├── .env.production       # Production environment variables
├── package.json          # Project dependencies
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

- Node.js (v18 or higher)
- MySQL database (Railway)
- Gemini API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api
VITE_SERVER_URL=http://localhost:5001
VITE_GEMINI_API_KEY=your_gemini_api_key

# Database Configuration
MYSQLHOST=your_railway_host
MYSQLUSER=your_railway_user
MYSQLPASSWORD=your_railway_password
MYSQLDATABASE=railway
MYSQLPORT=your_railway_port

# Server Configuration
PORT=5001

# CORS Configuration
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Start the backend server:
   ```bash
   npm run server:dev
   ```

## Production

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run server
   ```

## Testing

Run tests:
```bash
npm test
```

## Features

- Task management with AI-powered scheduling
- Real-time updates
- Modern UI with Tailwind CSS
- Type-safe development with TypeScript
- Secure API endpoints
- Railway database integration
- Gemini AI integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
