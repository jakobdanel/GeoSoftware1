
#version 
FROM node:13
# Create app directory
RUN mkdir -p /app
WORKDIR /app

#copy local package.json file
copy package.json /app
#install the packages
run npm install
# copy all files from: "node-mongo-api" das ist mein ordner wo alle dateien drin sind
copy . /app
#defined starting app command 
cmd npm start
#my local application  port 
EXPOSE 3000