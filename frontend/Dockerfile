FROM node:20-alpine
WORKDIR /app
COPY package.json /app/package.json
RUN npm ci --silent
COPY . /app
RUN npm run build
ENV PORT 3000
CMD ["npm","start"]
