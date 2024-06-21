# Use the official Node.js image as the base image
FROM node:20.14.0

# Set the working directory inside the container
WORKDIR /

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire 'src' directory
COPY src ./src

# Copy the frontend assets
COPY src/public ./src/public

# Build Tailwind CSS if needed
RUN npm run build:css

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]