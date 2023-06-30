FROM node:18

WORKDIR /app

COPY . .
RUN npm ci
RUN npx tsc

CMD ["node", "--experimental-specifier-resolution=node", "server.js"]