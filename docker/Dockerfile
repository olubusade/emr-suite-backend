# Use official Node.js LTS image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; \
    then npm ci --only=production; \
    else npm install; \
    fi

# Copy source
COPY ./src ./src

# Expose port
EXPOSE 5000

# Default command: will be overridden by docker-compose
CMD ["node", "src/server.js"]
