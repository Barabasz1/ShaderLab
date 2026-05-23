FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

RUN npm install -g prisma --legacy-peer-deps

COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /usr/src/app/dist ./dist

RUN chown -R node:node /usr/src/app
USER node
EXPOSE 3000

# Push the schema automatically, then start the app!
CMD ["sh", "-c", "prisma db push && node dist/src/main.js"]