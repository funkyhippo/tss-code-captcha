FROM node:18

WORKDIR /home/node/tss-code-captcha
COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "index.js"]
