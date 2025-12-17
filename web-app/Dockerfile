FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared types first
COPY shared ./shared

# Copy package files
COPY web-app/package*.json ./
COPY web-app/tsconfig.json ./
COPY web-app/tsconfig.node.json ./
COPY web-app/vite.config.ts ./
COPY web-app/tailwind.config.js ./
COPY web-app/postcss.config.js ./

# Install dependencies
RUN npm install

# Copy source code
COPY web-app/src ./src
COPY web-app/index.html ./
COPY web-app/public ./public

# Build with API URL as build arg
ARG VITE_API_URL=http://localhost:4767
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY web-app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

