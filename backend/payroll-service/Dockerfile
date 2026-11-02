FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 4004

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://localhost:4004/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then npx prisma db push --skip-generate --accept-data-loss || true; fi && npm start"]
