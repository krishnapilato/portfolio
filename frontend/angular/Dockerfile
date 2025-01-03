# Use the Node.js LTS image as the base for the build stage
FROM node:lts AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files to install dependencies
COPY package.json package-lock.json ./

# Install dependencies with clean install (forcing for compatibility)
RUN npm ci --force

# Copy the remaining application files
COPY . .

# Build the application for production
RUN npm run build -- --configuration production

# Use the Node.js LTS image as the base for the production stage
FROM node:lts AS production

# Set the working directory for the production environment
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/dist/frontend/browser ./dist

# Install a lightweight static server globally to serve the built application
RUN npm install -g serve --force

# Expose the default port for the application
EXPOSE 4200

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "4200"]
