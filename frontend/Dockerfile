FROM node:24.13.0

RUN npm install -g @quasar/cli

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 9000