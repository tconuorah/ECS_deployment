# backend/Dockerfile
FROM node:16

# Create app directory
WORKDIR /app

# Install only production deps first (better caching)
COPY package*.json ./
RUN npm ci 

# Copy the rest of the source
COPY . .

# Make sure your app reads PORT from env (defaults to 8080)
EXPOSE 8080

# If your package.json has "start": "node server.js" (or similar)
CMD ["npm", "start"]
