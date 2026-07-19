# Stage 1: Build the SolidJS Application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the app for production (outputs to /dist)
RUN npm run build

# Stage 2: Serve the application using Nginx (Lightweight)
FROM nginx:alpine

# Copy the built assets from the builder stage to Nginx's default public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (internal to the container)
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
