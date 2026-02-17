FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client inside the image
RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
