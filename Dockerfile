# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Copy start.sh
COPY start.sh /usr/src/app/start.sh
RUN chmod +x /usr/src/app/start.sh

# Expose port
EXPOSE 5001

# Run app with wait-for-postgres
CMD ["/bin/sh", "/usr/src/app/start.sh", "npm", "run", "start:dev"]

