# Lab 12 – API Routes con App Router y Prisma (Sistema de Biblioteca)

Next.js (App Router) + Prisma 6 + PostgreSQL (Neon / Supabase).

## Cómo ejecutarlo

1. Instalar dependencias: `npm install`
2. Crear el archivo `.env` (copiar `.env.example`) y poner la `DATABASE_URL`.
3. Crear las tablas: `npx prisma db push`
4. Ejecutar: `npm run dev` → http://localhost:3000

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET / POST | `/api/authors` | Listar / crear autores |
| GET / PUT / DELETE | `/api/authors/[id]` | Autor por ID |
| GET | `/api/authors/[id]/books` | Libros de un autor |
| GET | `/api/authors/[id]/stats` | Estadísticas del autor (tarea) |
| GET / POST | `/api/books` | Listar (filtro `?genre=`) / crear libros |
| GET / PUT / DELETE | `/api/books/[id]` | Libro por ID |
| GET | `/api/books/search` | Búsqueda con filtros y paginación (tarea) |

Parámetros de `/api/books/search`: `search`, `genre`, `authorName`, `page` (1), `limit` (10, máx. 50), `sortBy` (`title` \| `publishedYear` \| `createdAt`), `order` (`asc` \| `desc`).

## Páginas

- `/` – Dashboard de autores con estadísticas generales.
- `/books` – Búsqueda de libros con filtros, ordenamiento y paginación.
- `/authors/[id]` – Detalle del autor con estadísticas y sus libros.
