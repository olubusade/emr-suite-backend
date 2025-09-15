# Stage 1: install production deps
FROM node:20 AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: runtime
FROM node:20-slim AS runner
WORKDIR /usr/src/app

# install postgresql-client (provides pg_isready used by entrypoint)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# copy only produced node_modules from deps
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# include entrypoint
COPY docker/entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

EXPOSE 5000
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
