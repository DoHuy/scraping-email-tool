# Use official Node.js image as a base
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install -g yarn

# Install dependencies
RUN yarn

# Copy the rest of the application code
COPY . .

# Build TypeScript code
RUN yarn build

# Expose port (matches your app's PORT, default 3000)
EXPOSE 3000


# Start the application
CMD ["node", "dist/src/index.js"]