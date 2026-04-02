FROM node:20-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY server.js ./
EXPOSE 7878
CMD ["node", "server.js"]
