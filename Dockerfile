FROM alpine:3.11

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn \
      # Chinese font support
      font-noto \
      font-noto-cjk

WORKDIR /app

COPY package.json package.json

COPY yarn.lock yarn.lock

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN yarn install

COPY . .

RUN yarn build

ENV PORT=80
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 80

CMD ["node", "dist/server.js"]
