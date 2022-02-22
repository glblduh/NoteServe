FROM node:16-alpine as builder
WORKDIR /noteserve
COPY frontend/ /noteserve/frontend
WORKDIR /noteserve/frontend
RUN yarn install
RUN yarn build

FROM node:16-alpine as prod
COPY --from=builder /noteserve/frontend/dist /noteserve/frontend/dist
COPY backend/ /noteserve/backend
WORKDIR /noteserve/backend
RUN npm install
RUN npm run build
CMD ["node", "index.js"]