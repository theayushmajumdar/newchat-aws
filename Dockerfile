# Step 1: Build the React frontend
FROM node:18 as build-stage
WORKDIR /frontend

# Copy only necessary files for dependency installation
COPY frontend/package*.json ./

# Install dependencies and build the frontend
RUN npm install
COPY frontend/ ./
RUN npm run build

# Step 2: Set up the Node.js backend and serve frontend build
FROM node:18 as production-stage
WORKDIR /app

# Copy backend code and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source files and .env
COPY backend/ .
COPY backend/.env .env

# Copy the built frontend into the backend `public` folder (new path)
COPY --from=build-stage /frontend/build ./public

# Expose port 5000 and start the backend server
EXPOSE 5000
CMD ["node", "server.js"]
