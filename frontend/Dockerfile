FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
RUN npm install -g serve --no-audit --no-fund
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]