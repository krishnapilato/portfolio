# Use Node.js image as the base for building
FROM node:latest AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available) to leverage caching
COPY package.json package-lock.json* ./

# Install dependencies (this layer will be cached)
RUN npm ci --force

# Copy the rest of the source code
COPY . .

# Build the Angular application in production mode
RUN npm run build -- --configuration production

# Use Node.js image to serve the application
FROM node:latest AS production

# Set the working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist/frontend/browser ./dist

# Install a lightweight HTTP server (e.g., serve)
RUN npm install -g serve --force

# Expose port 4200
EXPOSE 4200

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "4200"]