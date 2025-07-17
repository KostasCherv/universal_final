# TypeScript Express Servers

Two Express servers with PostgreSQL databases and API key authentication.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

3. **Start databases:**
   ```bash
   npm run docker:up
   ```

4. **Run servers:**
   ```bash
   # Terminal 1
   npm run server1
   
   # Terminal 2
   npm run server2
   ```

## API Endpoints

- **Server 1** (Port 3001): `http://localhost:3001/health`
- **Server 2** (Port 3002): `http://localhost:3002/health`

## Features

- ✅ Separate PostgreSQL databases
- ✅ API key authentication
- ✅ Zod validation
- ✅ TypeScript
- ✅ Docker support

## Commands

```bash
npm run server1          # Start server 1
npm run server2          # Start server 2
npm run docker:up        # Start databases
npm run docker:down      # Stop databases
npm run build           # Build TypeScript
npm test               # Run tests
```
```

This README is minimal but covers all the essential information needed to get started with your project.