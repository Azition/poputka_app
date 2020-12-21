FROM node:15
COPY app /app
WORKDIR /app
RUN npm install
CMD ["node", "app.js"]