# Server Configuration

This server uses the following files:

- `index.js`: The main entry point for the server
- `server.js`: Alternative server configuration (not currently used)
- `app.js`: Alternative server configuration (not currently used)

To start the server, use:

```
npm start
```

or for development:

```
npm run dev
```

## Port Configuration

The server runs on port 5001 by default. If you need to change this, update the following files:

1. `server/.env` - Update the PORT variable
2. `config.json` - Update the server.port and api.baseUrl values
3. Root `.env` file - Update the PORT and VITE_API_BASE_URL values

## CORS Configuration

CORS is configured in the `middleware/cors.js` file to allow requests from `http://localhost:8080`.