# Ordinals React Client

A React-based web application for interacting with Bitcoin Ordinals and the Ord GPT agent.

## Features

- Chat with Ord GPT about Bitcoin Ordinals
- Browse and search for Bitcoin Ordinals inscriptions
- View detailed information about individual inscriptions
- Find rare satoshis based on rarity levels
- View and download inscription content
- Responsive design for desktop and mobile

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- A running Eliza agent with Ord GPT character (on port 3002)

## Setup and Installation

1. Clone this repository
2. Install dependencies:

```bash
cd ordinals-client
npm install
```

## Running the Application

### Development Mode

Run the application in development mode:

```bash
npm start
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Production Build

Build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

### Serving the Production Build

To serve the built application:

```bash
npm run serve
```

This will start a static server for the built application.

## Running 24/7 with PM2

To keep the application running continuously:

1. Install PM2 globally:

```bash
npm install -g pm2
```

2. Start the application with PM2:

```bash
npm run pm2
```

3. To check status:

```bash
pm2 status
```

4. To stop the application:

```bash
pm2 stop ordinals-client
```

5. Make PM2 automatically start on system boot:

```bash
pm2 startup
pm2 save
```

## API Configuration

The client connects to two main services:

1. **Ordinals API**: Default URL is `https://api.hiro.so` (can be configured in the `OrdinalsService.js` file)
2. **Eliza WebSocket**: Default URL is `ws://localhost:3002/ws` (can be configured in the `ElizaService.js` file)

## Deployment Options

### Option 1: Self-hosted Server

1. Build the application as described above
2. Use Nginx or Apache to serve the static files
3. Configure a reverse proxy to handle API requests

### Option 2: Cloud Deployment

Deploy to platforms like:

- Vercel
- Netlify
- AWS Amplify
- GitHub Pages

Example Netlify configuration:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod
```

## Project Structure

- `/public`: Static assets
- `/src`: Source code
  - `/components`: React components
  - `/services`: Service layer for API communication
  - `/context`: React Context for state management
  - `App.js`: Main application component
  - `index.js`: Entry point

## License

MIT
