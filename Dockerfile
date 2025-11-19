FROM apify/actor-node:22
COPY package*.json ./
RUN npm install --only=prod && rm -r ~/.npm
COPY . ./
CMD npm start
