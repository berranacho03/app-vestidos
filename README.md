# App Vestidos - Sistema de Alquiler de Vestidos

Aplicación web para gestión de alquiler de vestidos desarrollada con Next.js 15, React 19 y MySQL.

##  Requisitos Previos

- Docker y Docker Compose instalados
- Puerto 3000 disponible (aplicación web)
- Puerto 13306 disponible (MySQL)

##  Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/berranacho03/app-vestidos.git
cd app-vestidos
```

### 2. Configurar Variables de Entorno

Copiar el archivo de ejemplo y crear el archivo `.env`:

```bash
cp env.example .env
```

El archivo `.env` contiene las siguientes variables de configuración:

```env
# Configuración de MySQL
MYSQL_ROOT_PASSWORD=database_root_password
MYSQL_DATABASE=rentalDB
MYSQL_USER=appuser
MYSQL_PASSWORD=secretpassword
MYSQL_PORT=13306
MYSQL_HOST=127.0.0.1

# Credenciales de administrador
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Configuración de JWT
JWT_SECRET=secretTestingKey
JWT_EXPIRES_IN=24h
```

### 3. Levantar los Contenedores

Iniciar la aplicación con Docker Compose:

```bash
docker-compose up -d
```

Este comando iniciará:
- **Base de datos MySQL** (puerto 13306)
- **Aplicación Next.js** (puerto 3000)

### 4. Verificar el Estado

Comprobar que los contenedores están corriendo:

```bash
docker-compose ps
```

### 5. Acceder a la Aplicación

Una vez levantados los servicios:

- **Aplicación web**: http://localhost:3000
- **Panel de administración**: http://localhost:3000/admin/login

Credenciales por defecto del administrador:
- Usuario: `admin`
- Contraseña: `admin123`

##  Testing

### Ejecutar Tests Unitarios

Para ejecutar los tests unitarios dentro del contenedor:

```bash
docker exec -it appvestidos-web sh -c 'cd /app && npm run test:unit:bundle'
```

### Otros Comandos de Testing Disponibles


## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Ver logs de los contenedores
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f web

# Ver logs solo de la base de datos
docker-compose logs -f db

# Acceder al contenedor de la aplicación
docker exec -it appvestidos-web sh

# Acceder al contenedor de MySQL
docker exec -it appvestidos-db mysql -u appuser -p
```

### Detener y Reiniciar

```bash
# Detener los contenedores
docker-compose down

# Detener y eliminar volúmenes (elimina la base de datos)
docker-compose down -v

# Reiniciar los contenedores
docker-compose restart

# Reconstruir los contenedores
docker-compose up -d --build
```

## 📁 Estructura del Proyecto

```
app-vestidos/
├── src/
│   ├── app/                    # Páginas y rutas de Next.js
│   │   ├── api/               # API routes
│   │   ├── admin/             # Panel de administración
│   │   ├── components/        # Componentes React
│   │   ├── items/             # Página de productos
│   │   └── ...
│   └── __tests__/             # Tests
│       ├── unit/              # Tests unitarios
│       └── integration/       # Tests de integración
├── lib/                       # Librerías y utilidades
├── public/                    # Archivos estáticos
├── scripts/                   # Scripts de base de datos
├── docker-compose.yml         # Configuración de Docker
├── Dockerfile                 # Imagen de Docker
└── package.json              # Dependencias del proyecto
```

##  Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Base de Datos**: MySQL 8.0
- **Autenticación**: JWT, bcryptjs
- **Testing**: Node.js test runner, Playwright
- **Containerización**: Docker, Docker Compose

##  Notas Adicionales

- La base de datos se inicializa automáticamente con el script `scripts/init.sql`
- Los datos se persisten en un volumen de Docker (`db_data`)
- El puerto de MySQL está mapeado a 13306 en el host para evitar conflictos
- La aplicación se recarga automáticamente en modo desarrollo

##  Solución de Problemas

### La aplicación no inicia

```bash
# Verificar logs
docker-compose logs web

# Reconstruir contenedores
docker-compose down
docker-compose up -d --build
```

### Error de conexión a la base de datos

```bash
# Verificar que MySQL esté saludable
docker-compose ps

# Revisar logs de la base de datos
docker-compose logs db

# Probar conexión manualmente
docker exec -it appvestidos-db mysqladmin ping -h localhost
```

### Puerto en uso

Si los puertos 3000 o 13306 están ocupados, modifica el archivo `docker-compose.yml` para usar puertos diferentes.