# Stage 1: Build the React application
FROM node:21 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN ls
RUN npm run build

# Stage 2: Serve the React application using nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
