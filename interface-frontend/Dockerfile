FROM node:20-alpine

WORKDIR /app

# Install dos2unix to handle Windows line endings
RUN apk add --no-cache dos2unix

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy entrypoint script, fix line endings, and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

# Copy application code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run entrypoint script which generates .env and starts dev server
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
