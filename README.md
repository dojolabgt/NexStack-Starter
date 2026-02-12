Readme mejorado · MD
# NexStack Starter 🚀

**Enterprise-grade fullstack starter for rapid SaaS development**

Un boilerplate moderno y production-ready que combina Next.js 14 y NestJS con autenticación completa, RBAC, y arquitectura escalable. Diseñado para ser **la base sólida de tu próximo proyecto**, ya sea un dashboard corporativo, una aplicación SaaS, o una plataforma web moderna.

> 💡 **Filosofía**: No es un framework opinionado ni un sistema multi-tenant complejo. Es una fundación limpia y profesional que te permite construir **exactamente lo que necesitas** sin restricciones.

🔗 **Repositorio**: [https://github.com/dojolabgt/NexStack-Starter.git](https://github.com/dojolabgt/NexStack-Starter.git)

---

## 🛠 Tech Stack


<div align="center">
  
  ![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  
  ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
  ![TypeORM](https://img.shields.io/badge/TypeORM-FE0902?style=for-the-badge&logo=typeorm&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

  ![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
  ![Shadcn/UI](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
  
</div>

---

## 🚀 Instalación y Puesta en Marcha

Sigue estos pasos para levantar el proyecto en tu entorno local.

### 1. Clonar el Repositorio

```bash
git clone https://github.com/dojolabgt/NexStack-Starter.git
cd NexStack-Starter
```

### 2. Configuración de Variables de Entorno

Copia el archivo de ejemplo para crear tu configuración local:

```bash
cp .env.example .env
```

**Nota**: El archivo `.env.example` ya viene con una configuración funcional para desarrollo local con Docker. Solo asegúrate de cambiar las contraseñas y secretos si vas a desplegar en un entorno compartido.

### 3. Iniciar con Docker Compose

Levanta todos los servicios (Frontend, Backend, Base de Datos) con un solo comando:

```bash
# Iniciar en modo desarrollo (con hot-reload)
docker-compose -f docker-compose.dev.yml up --build
```

**Servicios disponibles:**
- 🎨 **Dashboard**: [http://localhost:3000](http://localhost:3000)
- 🌐 **Sitio Público**: [http://localhost:3001](http://localhost:3001)
- ⚙️ **Backend API**: [http://localhost:4000](http://localhost:4000) (Swagger en `/api/docs` si está habilitado)
- 🗄️ **Base de Datos**: `localhost:5432`

### 4. Cargar Datos Iniciales (Seeds)

Una vez que los contenedores estén corriendo, abre una **nueva terminal** y ejecuta el seed para crear los usuarios por defecto:

```bash
docker-compose -f docker-compose.dev.yml exec backend npm run seed
```

---

## 🔑 Credenciales por Defecto

Estos son los usuarios creados por el script de seed. ¡Cámbialos en producción!

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Admin** | `admin@admin.com` | `admin123` |
| **Team** | `team@team.com` | `team123` |
| **Client** | `client@client.com` | `client123` |

---

## � Comandos Útiles

#### Ver logs del backend
```bash
docker-compose -f docker-compose.dev.yml logs -f backend
```

#### Detener los servicios
```bash
docker-compose -f docker-compose.dev.yml down
```

#### Limpiar todo (incluyendo volúmenes de base de datos)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Siéntete libre de usarlo como base para tus proyectos personales o comerciales.

---

<center>Made with ❤️ by Eklista </center>
