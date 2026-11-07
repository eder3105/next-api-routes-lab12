import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const SORT_FIELDS = ['title', 'publishedYear', 'createdAt'] as const
type SortField = (typeof SORT_FIELDS)[number]

// GET – Búsqueda de libros con filtros, ordenamiento y paginación
// Ej: /api/books/search?search=amor&genre=Novela&page=1&limit=10&sortBy=publishedYear&order=desc
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')?.trim()
    const genre = searchParams.get('genre')?.trim()
    const authorName = searchParams.get('authorName')?.trim()
    const authorId = searchParams.get('authorId')?.trim() // extra: usado por el dropdown de autores

    // Paginación: page >= 1, limit entre 1 y 50 (default 10)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10') || 10))

    // Ordenamiento (solo campos permitidos)
    const sortByParam = searchParams.get('sortBy') ?? 'createdAt'
    const sortBy: SortField = (SORT_FIELDS as readonly string[]).includes(sortByParam)
      ? (sortByParam as SortField)
      : 'createdAt'
    const order: Prisma.SortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

    // Filtros dinámicos
    const where: Prisma.BookWhereInput = {
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(genre && { genre }),
      ...(authorId && { authorId }),
      ...(authorName && {
        author: { name: { contains: authorName, mode: 'insensitive' } },
      }),
    }

    // Conteo total y página de resultados en una sola transacción
    const [total, data] = await prisma.$transaction([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al buscar libros' },
      { status: 500 }
    )
  }
}
