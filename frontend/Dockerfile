FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 60000 \
 && npm ci --no-audit --no-fund
COPY . .
RUN npm run build
RUN npm install -g serve --no-audit --no-fund
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]