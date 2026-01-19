FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for proper functionality)
RUN npm ci

# Copy source code
COPY . .

# Create .env file location (will be overwritten by env vars)
RUN touch .env

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
