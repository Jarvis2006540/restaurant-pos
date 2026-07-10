FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose port 5000
EXPOSE 5000

# Set default env variables (can be overridden by Fly.io)
ENV PORT=5000
ENV NODE_ENV=production

# Start the server
CMD [ "npm", "start" ]
