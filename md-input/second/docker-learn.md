# Complete Docker Guide for Beginners

## Table of Contents
1. [Introduction to Docker](#introduction-to-docker)
2. [Setting Up Your Environment](#setting-up-your-environment)
3. [Docker Fundamentals](#docker-fundamentals)
4. [Basic Docker Commands](#basic-docker-commands)
5. [Creating Dockerfiles](#creating-dockerfiles)
6. [Docker Compose](#docker-compose)
7. [MERN Stack with Docker](#mern-stack-with-docker)
8. [Python Applications with Docker](#python-applications-with-docker)
9. [Hugo Static Sites with Docker](#hugo-static-sites-with-docker)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Introduction to Docker

Docker is a platform that allows you to package applications and their dependencies into containers that can run anywhere.

### Key Concepts

- **Image**: A read-only template with instructions for creating a container. Think of it as a snapshot or blueprint.
- **Container**: A runnable instance of an image. It's isolated from other containers and the host machine.
- **Dockerfile**: A text file containing commands to build an image.
- **Docker Hub**: A registry where Docker images are stored and shared.
- **Volume**: Persistent storage that containers can use to save data.
- **Network**: Allows containers to communicate with each other.
- **Docker Compose**: A tool for defining and running multi-container applications.

### Why Use Docker?

- **Consistency**: "Works on my machine" becomes "works everywhere"
- **Isolation**: Each container runs independently
- **Portability**: Run anywhere Docker is installed
- **Efficiency**: Lightweight compared to virtual machines
- **Scalability**: Easy to scale applications up or down

---

## Setting Up Your Environment

### Prerequisites

1. **Docker Desktop** installed on your PC
2. **VSCode** installed
3. **VSCode Extensions**:
   - Docker (by Microsoft)
   - Remote - Containers (optional but helpful)
   - Docker Explorer (optional)

### Verify Installation

Open VSCode terminal (`` Ctrl+` `` or Terminal → New Terminal):

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Verify Docker is running
docker ps

# Run hello-world to test
docker run hello-world
```

### Configure Docker in VSCode

1. Install Docker extension from the Extensions marketplace
2. You'll see a Docker icon in the Activity Bar (left sidebar)
3. This shows:
   - Containers
   - Images
   - Registries
   - Networks
   - Volumes

---

## Docker Fundamentals

### Container Lifecycle

```bash
# Pull an image from Docker Hub
docker pull nginx

# Run a container
docker run nginx

# Run in detached mode (background)
docker run -d nginx

# Run with port mapping
docker run -d -p 8080:80 nginx

# Run with a name
docker run -d --name my-nginx nginx

# Stop a container
docker stop my-nginx

# Start a stopped container
docker start my-nginx

# Restart a container
docker restart my-nginx

# Remove a container
docker rm my-nginx

# Remove a running container (force)
docker rm -f my-nginx
```

### Working with Images

```bash
# List images
docker images

# Pull specific version
docker pull node:18-alpine

# Remove an image
docker rmi nginx

# Remove all unused images
docker image prune

# Build an image from Dockerfile
docker build -t myapp:1.0 .

# Tag an image
docker tag myapp:1.0 myapp:latest
```

---

## Basic Docker Commands

### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-id>

# Follow logs in real-time
docker logs -f <container-id>

# Execute command in running container
docker exec -it <container-id> bash

# Copy files to/from container
docker cp file.txt <container-id>:/path/
docker cp <container-id>:/path/file.txt ./

# View container resource usage
docker stats

# Inspect container details
docker inspect <container-id>
```

### System Commands

```bash
# View disk usage
docker system df

# Clean up unused resources
docker system prune

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune
```

### Network Commands

```bash
# List networks
docker network ls

# Create a network
docker network create my-network

# Connect container to network
docker network connect my-network <container-id>

# Inspect network
docker network inspect my-network
```

### Volume Commands

```bash
# List volumes
docker volume ls

# Create a volume
docker volume create my-data

# Remove a volume
docker volume rm my-data

# Inspect volume
docker volume inspect my-data
```

---

## Creating Dockerfiles

### Dockerfile Basics

A Dockerfile contains instructions to build an image.

**Common Instructions:**

- `FROM`: Base image to build upon
- `WORKDIR`: Set working directory
- `COPY`: Copy files from host to container
- `ADD`: Like COPY but can extract archives
- `RUN`: Execute commands during build
- `CMD`: Default command when container starts
- `ENTRYPOINT`: Configure container as executable
- `EXPOSE`: Document which port the container listens on
- `ENV`: Set environment variables
- `ARG`: Define build-time variables
- `VOLUME`: Create mount point for volumes
- `USER`: Set user for subsequent instructions

### Example: Simple Node.js App

**Dockerfile:**
```dockerfile
# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

**Build and run:**
```bash
docker build -t my-node-app .
docker run -p 3000:3000 my-node-app
```

### Multi-stage Builds

Useful for reducing image size:

```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## Docker Compose

Docker Compose allows you to define and run multi-container applications.

### Basic docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - db
  
  db:
    image: postgres:14
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb

volumes:
  postgres-data:
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Build and start
docker-compose up --build

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Execute command in service
docker-compose exec web bash

# List running services
docker-compose ps

# Restart specific service
docker-compose restart web
```

---

## MERN Stack with Docker

Complete setup for MongoDB, Express, React, and Node.js.

### Project Structure

```
mern-app/
├── client/                 # React frontend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── server/                 # Express backend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── docker-compose.yml
```

### Backend Dockerfile (server/Dockerfile)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "run", "dev"]
```

### Frontend Dockerfile (client/Dockerfile)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
```

### Production Frontend Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:6
    container_name: mern_mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=merndb
    volumes:
      - mongo-data:/data/db
    networks:
      - mern-network

  # Express Backend
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: mern_backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGO_URI=mongodb://admin:password@mongodb:27017/merndb?authSource=admin
      - PORT=5000
    volumes:
      - ./server:/app
      - /app/node_modules
    depends_on:
      - mongodb
    networks:
      - mern-network

  # React Frontend
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: mern_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
      - CHOKIDAR_USEPOLLING=true
    volumes:
      - ./client:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - mern-network

networks:
  mern-network:
    driver: bridge

volumes:
  mongo-data:
```

### Usage

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password

# Stop all services
docker-compose down

# Remove volumes as well
docker-compose down -v
```

### Backend Connection Example (server/src/config/db.js)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## Python Applications with Docker

### Flask Application

**Project Structure:**
```
flask-app/
├── app/
│   ├── __init__.py
│   ├── routes.py
│   └── models.py
├── requirements.txt
├── app.py
└── Dockerfile
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=development

# Run application
CMD ["flask", "run", "--host=0.0.0.0"]
```

**requirements.txt:**
```
Flask==3.0.0
Flask-SQLAlchemy==3.0.5
Flask-Cors==4.0.0
python-dotenv==1.0.0
psycopg2-binary==2.9.7
```

**docker-compose.yml for Flask:**
```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: flask_app
    ports:
      - "5000:5000"
    volumes:
      - .:/app
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/flaskdb
    depends_on:
      - db
    networks:
      - flask-network

  db:
    image: postgres:14-alpine
    container_name: flask_db
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=flaskdb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - flask-network

networks:
  flask-network:
    driver: bridge

volumes:
  postgres-data:
```

### Django Application

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD python manage.py migrate && \
    python manage.py runserver 0.0.0.0:8000
```

**docker-compose.yml for Django:**
```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: django_app
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DEBUG=1
      - SECRET_KEY=your-secret-key
      - DATABASE_URL=postgres://user:password@db:5432/djangodb
    depends_on:
      - db
      - redis
    networks:
      - django-network

  db:
    image: postgres:14-alpine
    container_name: django_db
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=djangodb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    networks:
      - django-network

  redis:
    image: redis:7-alpine
    container_name: django_redis
    ports:
      - "6379:6379"
    networks:
      - django-network

  celery:
    build: .
    container_name: django_celery
    command: celery -A myproject worker -l info
    volumes:
      - .:/app
    depends_on:
      - db
      - redis
    networks:
      - django-network

networks:
  django-network:
    driver: bridge

volumes:
  postgres-data:
```

### FastAPI Application

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

**requirements.txt:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-multipart==0.0.6
```

**docker-compose.yml for FastAPI:**
```yaml
version: '3.8'

services:
  api:
    build: .
    container_name: fastapi_app
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/fastapidb
    depends_on:
      - db
    networks:
      - fastapi-network

  db:
    image: postgres:14-alpine
    container_name: fastapi_db
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=fastapidb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - fastapi-network

networks:
  fastapi-network:
    driver: bridge

volumes:
  postgres-data:
```

---

## Hugo Static Sites with Docker

Hugo is a fast static site generator written in Go.

### Basic Hugo Dockerfile

**Dockerfile:**
```dockerfile
FROM klakegg/hugo:0.111.3-ext-alpine AS builder

WORKDIR /src

# Copy Hugo site files
COPY . .

# Build the site
RUN hugo --minify

# Production stage with nginx
FROM nginx:alpine

# Copy built site to nginx
COPY --from=builder /src/public /usr/share/nginx/html

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Development Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  hugo:
    image: klakegg/hugo:0.111.3-ext-alpine
    container_name: hugo_dev
    command: server --bind 0.0.0.0 --buildDrafts
    volumes:
      - .:/src
    ports:
      - "1313:1313"
    environment:
      - HUGO_ENV=development
```

### Production Setup

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  hugo:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hugo_prod
    ports:
      - "80:80"
    restart: unless-stopped
```

### Custom nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Hugo with CI/CD

**Project Structure:**
```
hugo-site/
├── archetypes/
├── content/
├── layouts/
├── static/
├── themes/
├── config.toml
├── Dockerfile
├── docker-compose.yml
└── .dockerignore
```

**.dockerignore:**
```
.git
.gitignore
README.md
.dockerignore
Dockerfile
docker-compose.yml
node_modules
public
resources
```

### Usage Commands

```bash
# Development - start Hugo server
docker-compose up

# Access site at http://localhost:1313

# Production build
docker-compose -f docker-compose.prod.yml up --build -d

# Create new content
docker-compose exec hugo hugo new posts/my-post.md

# Stop services
docker-compose down
```

---

## Best Practices

### Dockerfile Best Practices

1. **Use Official Base Images**
   ```dockerfile
   FROM node:18-alpine  # Official and small
   ```

2. **Minimize Layers**
   ```dockerfile
   # Bad
   RUN apt-get update
   RUN apt-get install -y package1
   RUN apt-get install -y package2
   
   # Good
   RUN apt-get update && apt-get install -y \
       package1 \
       package2 \
       && rm -rf /var/lib/apt/lists/*
   ```

3. **Order Instructions by Frequency of Change**
   ```dockerfile
   # Dependencies change less frequently
   COPY package*.json ./
   RUN npm install
   
   # Source code changes more frequently
   COPY . .
   ```

4. **Use .dockerignore**
   ```
   node_modules
   npm-debug.log
   .git
   .env
   .DS_Store
   ```

5. **Don't Run as Root**
   ```dockerfile
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

6. **Use Multi-stage Builds**
   ```dockerfile
   FROM node:18 AS builder
   # Build steps
   
   FROM node:18-alpine
   COPY --from=builder /app/dist ./dist
   ```

### Docker Compose Best Practices

1. **Use Environment Variables**
   ```yaml
   environment:
     - DATABASE_URL=${DATABASE_URL}
   ```

2. **Use Named Volumes**
   ```yaml
   volumes:
     - postgres-data:/var/lib/postgresql/data
   ```

3. **Set Restart Policies**
   ```yaml
   restart: unless-stopped
   ```

4. **Use Health Checks**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

### Security Best Practices

1. **Never Store Secrets in Images**
   - Use environment variables
   - Use Docker secrets
   - Use .env files (not committed to git)

2. **Scan Images for Vulnerabilities**
   ```bash
   docker scan my-image:latest
   ```

3. **Use Minimal Base Images**
   - Alpine-based images when possible
   - Distroless images for production

4. **Keep Images Updated**
   ```bash
   docker pull node:18-alpine
   docker-compose pull
   ```

### Performance Best Practices

1. **Use Build Cache Effectively**
   - Order Dockerfile instructions strategically
   - Use `--no-cache` when needed

2. **Minimize Image Size**
   - Remove unnecessary files
   - Use multi-stage builds
   - Combine RUN commands

3. **Use Volumes for Development**
   ```yaml
   volumes:
     - .:/app
     - /app/node_modules  # Prevent overwriting
   ```

---

## Troubleshooting

### Common Issues and Solutions

**1. Port Already in Use**
```bash
# Error: Bind for 0.0.0.0:3000 failed: port is already allocated

# Solution: Find and stop the process using the port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Or use a different port
docker run -p 3001:3000 my-app
```

**2. Container Exits Immediately**
```bash
# Check logs
docker logs <container-id>

# Common causes:
# - Application crashes
# - Missing environment variables
# - Syntax errors in code
```

**3. Cannot Connect to Database**
```bash
# Use service name, not localhost
# Bad: mongodb://localhost:27017
# Good: mongodb://mongodb:27017

# Ensure containers are on same network
docker network inspect my-network
```

**4. Permission Denied**
```bash
# Linux: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker ps
```

**5. Slow Build Times**
```bash
# Use .dockerignore
# Use layer caching
# Build specific service
docker-compose build web

# Use BuildKit
DOCKER_BUILDKIT=1 docker build .
```

**6. Out of Disk Space**
```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a
docker volume prune
```

**7. Image Not Found**
```bash
# Pull the image first
docker pull node:18-alpine

# Check image name spelling
docker images
```

**8. Container Can't Access Internet**
```bash
# Restart Docker
# Check DNS settings in Docker Desktop
# Try different DNS servers
docker run --dns 8.8.8.8 my-app
```

### Debugging Tools

**Enter Running Container**
```bash
docker exec -it <container-id> sh
# or
docker exec -it <container-id> bash
```

**View Container Processes**
```bash
docker top <container-id>
```

**Inspect Container**
```bash
docker inspect <container-id>
```

**View Container Changes**
```bash
docker diff <container-id>
```

**Export Container**
```bash
docker export <container-id> > container.tar
```

---

## Additional Resources

### Official Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Hub](https://hub.docker.com/)

### Useful Commands Cheatsheet

```bash
# Build
docker build -t name:tag .
docker-compose build

# Run
docker run -d -p 8080:80 --name web nginx
docker-compose up -d

# Stop
docker stop <container>
docker-compose down

# Logs
docker logs -f <container>
docker-compose logs -f service

# Execute
docker exec -it <container> bash
docker-compose exec service bash

# Clean Up
docker system prune -a
docker volume prune
docker network prune

# Info
docker ps -a
docker images
docker volume ls
docker network ls
```

### Next Steps

1. Practice with simple projects
2. Learn about Docker networks in depth
3. Explore Docker Swarm or Kubernetes for orchestration
4. Learn about CI/CD with Docker
5. Study security best practices
6. Optimize your Dockerfiles for production

---

**Happy Dockerizing! 🐳**