# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Run stage
FROM nginx:alpine
COPY --from=build /app/dist/temp-angular-app/browser /usr/share/nginx/html
# Note: Check the path above if build output is different (e.g., /app/dist/...)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
