# Stage 1: Build the React Application
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy dependency files first for caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the production bundle
RUN npm run build

# Stage 2: Serve the Application with Nginx
FROM nginx:stable-alpine AS production-stage

# Copy the build output from the first stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port (Cloud Run defaults to 8080, we will map Nginx to it or configure Nginx for it)
EXPOSE 80

# For Cloud Run, Nginx should listen on $PORT. 
# We use a simple script to replace the port or just use 80 and let Cloud Run handle it.
CMD ["nginx", "-g", "daemon off;"]
