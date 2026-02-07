# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set build-time environment variables for Vite
ARG VITE_OIDC_AUTHORITY=https://oauth-server-542757597043.us-central1.run.app
ARG VITE_API_GATEWAY_HOST=https://gateway-542757597043.us-central1.run.app
ENV VITE_OIDC_AUTHORITY=${VITE_OIDC_AUTHORITY}
ENV VITE_API_GATEWAY_HOST=${VITE_API_GATEWAY_HOST}

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
