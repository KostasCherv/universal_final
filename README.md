# TypeScript Express Microservices

Two Express servers with PostgreSQL databases and task-based processing.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env
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

## Test the System

```bash
# Create a task
curl -X POST http://localhost:3001/tasks

# Check task status (replace task-id with actual ID)
curl http://localhost:3001/tasks/task-id

# Get products
curl http://localhost:3002/products

# Health checks
curl http://localhost:3001/health
curl http://localhost:3002/health
```

## Commands

```bash
npm run server1          # Start server 1
npm run server2          # Start server 2
npm run docker:up        # Start databases
npm run docker:down      # Stop databases
npm run build           # Build TypeScript
```