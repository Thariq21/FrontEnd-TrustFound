# Stage 1: Build aset statis
FROM node:20 AS build

WORKDIR /app

# Salin file dependensi
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin seluruh source code
COPY . .

# Build aplikasi untuk produksi
RUN npm run build

# Stage 2: Sajikan menggunakan Node.js (Serve)
FROM node:20

WORKDIR /app

# Install package 'serve' secara global untuk menyajikan file statis
RUN npm install -g serve

# Salin hasil build dari stage sebelumnya
COPY --from=build /app/dist ./dist

# Ekspos port yang digunakan (OpenShift menyukai port > 1024)
EXPOSE 8080

# Jalankan server
# -s: mode single-page application (mengarahkan semua request ke index.html)
# -l: mendengarkan pada port 8080
CMD ["serve", "-s", "dist", "-l", "8080"]