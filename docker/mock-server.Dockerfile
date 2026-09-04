FROM node:20-slim
WORKDIR /app
COPY mock-server/package.json .
RUN npm install
COPY mock-server/ .
EXPOSE 4000
CMD ["node", "server.js"]
