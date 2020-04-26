FROM node:13.8-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/woofbot-image-scraper-api
COPY . .
RUN npm install\
	&& npm install tsc -g
RUN npm run build
CMD ["node", "./build/index.js"]
