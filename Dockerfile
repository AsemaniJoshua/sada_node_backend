# Dockerfile to build the express backend
FROM node:22.12-alpine

# Create app directory
WORKDIR /sada_backend

# copy package.json and package-lock.json to the working directory
COPY package*.json ./

# install dependencies with no cache to reduce image size
RUN npm install --no-cache

# copy the rest of the application code to the working directory
COPY . .

# set the database URL environment variable for Prisma
ENV DATABASE_URL="mysql://avnadmin:AVNS_qFEkifx_DQcfRfCA0U_@mysql-2663df75-joshuaasemani27-1d15.f.aivencloud.com:11169/sada"

# generate prisma client
RUN npx prisma generate

# run database migrations
RUN npx prisma migrate deploy

# expose the port the app runs on
EXPOSE 3000

# start the application
CMD ["node", "start"]