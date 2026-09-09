FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json tsconfig.json tsconfig.build.json ./
RUN npm install

COPY src ./src
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY .sequelizerc ./
COPY config ./config
COPY migrations ./migrations

RUN mkdir -p uploads

EXPOSE 4000

# Aplica las migraciones pendientes contra la base de datos y recien
# despues arranca el servidor. Asi "docker compose up" deja el esquema
# listo sin ningun paso manual.
CMD ["sh", "-c", "npx sequelize-cli db:migrate --env production && node dist/server.js"]
