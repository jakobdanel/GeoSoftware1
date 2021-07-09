FROM node:16-alpine
RUN apk add --no-cache python g++ make
WORKDIR /app
COPY . .
RUN npm install
CMD ["node" ,"server.js"]
EXPOSE 1234