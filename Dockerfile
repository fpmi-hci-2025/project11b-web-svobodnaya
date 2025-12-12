FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf.template

# Default values (Render sets PORT automatically)
ENV PORT=80
ENV BACKEND_URL=http://backend:8000

EXPOSE 80

# Replace placeholders with env vars at startup
# Extract host from BACKEND_URL (e.g., https://example.com -> example.com)
CMD ["/bin/sh", "-c", "BACKEND_HOST=$(echo $BACKEND_URL | sed -e 's|https://||' -e 's|http://||' -e 's|/.*||') && sed -e \"s|__PORT__|${PORT}|g\" -e \"s|__BACKEND_URL__|${BACKEND_URL}|g\" -e \"s|__BACKEND_HOST__|${BACKEND_HOST}|g\" /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
