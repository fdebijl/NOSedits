FROM node:18-alpine AS base
WORKDIR /usr/src/nosedits
COPY package*.json ./

# Builder image used only for compiling TS files
FROM base as builder
RUN npm ci
COPY . .
RUN npm run compile

# Lean production image that just contains the dist directory and runtime dependencies
FROM base as prod
RUN npm ci --only=production
COPY --from=builder /usr/src/nosedits/dist/ /usr/src/nosedits/
CMD ["npm", "start"]
