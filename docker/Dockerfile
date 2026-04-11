# Stage 1: install production deps
# Using a full node image to ensure all native modules (like bcrypt) 
# have the necessary build tools during the 'npm ci' phase.
FROM node:20 AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: runtime
# Using a slim image for the runner to minimize the attack surface 
# and reduce the final image size for faster cloud deployments.
FROM node:20-slim AS runner
WORKDIR /usr/src/app

# install postgresql-client (provides pg_isready used by entrypoint)
# Critical for the entrypoint script to verify DB availability before app start.
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# copy only produced node_modules from deps
# This ensures the final image doesn't contain build-time dependencies or npm cache.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# include entrypoint
# The entrypoint manages the 'Wait-for-DB' logic and database migrations.
COPY docker/entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

EXPOSE 5000
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]