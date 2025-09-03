# Backend Dockerfile
FROM node:22-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy source code
COPY . .

# Entrypoint
COPY docker/entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

EXPOSE 5000

CMD ["sh", "/usr/src/app/entrypoint.sh"]
