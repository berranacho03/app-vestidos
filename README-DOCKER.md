Setup rápido para usar MySQL con Docker

1) Copia `.env.example` a `.env` y ajusta las contraseñas si quieres:

   cp .env.example .env   # en PowerShell: Copy-Item .env.example .env

2) Levantar MySQL con docker-compose:

   docker-compose up -d

   Nota: El contenedor MySQL ahora expone el puerto del host 13306 (mapeado a 3306 dentro del contenedor)

3) Instala dependencias del proyecto (PowerShell):

   npm install

4) Probar la conexión desde el proyecto (usa .env creado):

   npm run db:test

Ejecutar la app web en Docker (construir y levantar web + db):

   docker compose build --pull
   docker compose up -d

La app web estará disponible en http://localhost:3000

Si quieres ejecutar scripts desde el host contra la base de datos del contenedor, usa el puerto 13306 (ver `.env`).


