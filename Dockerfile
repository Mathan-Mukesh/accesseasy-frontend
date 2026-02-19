# Stage 1: Build the Vue application
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies (incorporating caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for production
# Usage of build arguments to bake in environment variables
ARG VITE_API_URL
ARG VITE_DIRECTUS_URL
ARG VITE_API_TOKEN
ARG VITE_APP_DOMAIN

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DIRECTUS_URL=$VITE_DIRECTUS_URL
ENV VITE_API_TOKEN=$VITE_API_TOKEN
ENV VITE_APP_DOMAIN=$VITE_APP_DOMAIN

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine as production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
