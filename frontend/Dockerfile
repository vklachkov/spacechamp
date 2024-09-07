FROM node:alpine AS builder
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci --ignore-scripts
COPY . /app
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/space-fest-admin-panel/browser /usr/share/nginx/html