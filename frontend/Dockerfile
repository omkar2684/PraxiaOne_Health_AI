# PraxiaOne Frontend Dockerfile
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy all the remaining Next.js source code into the container
COPY . .

# Add ARG and ENV so Next.js can read it during npm run build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the optimal production bundle
RUN npm run build

# Expose the standard Next.js port
EXPOSE 3000

# Start the production Next.js server
CMD ["npm", "start"]
