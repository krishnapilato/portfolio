FROM node:latest AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --force

COPY . .

RUN npm run build -- --configuration production

FROM node:lts-slim AS production

WORKDIR /app

COPY --from=builder /app/dist/frontend/browser ./dist

RUN npm install -g serve --force

EXPOSE 4200

CMD ["serve", "-s", "dist", "-l", "4200"]