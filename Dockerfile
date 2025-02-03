FROM node:17-alpine
WORKDIR /app
COPY package.json .
RUN mkdir -p /app/node_modules/.cache && chmod -R 777 /app/node_modules
RUN npm install
COPY . .
EXPOSE 8092
CMD ["npm", "start"]