import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET – Estadísticas completas de un autor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          select: { title: true, publishedYear: true, pages: true, genre: true },
        },
      },
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      )
    }

    const books = author.books

    // Libros con año → primer y último libro
    const withYear = books
      .filter((b) => b.publishedYear !== null)
      .sort((a, b) => a.publishedYear! - b.publishedYear!)
    const first = withYear[0]
    const latest = withYear[withYear.length - 1]

    // Libros con páginas → promedio, más largo y más corto
    const withPages = books
      .filter((b) => b.pages !== null)
      .sort((a, b) => a.pages! - b.pages!)
    const averagePages = withPages.length
      ? Math.round(withPages.reduce((sum, b) => sum + b.pages!, 0) / withPages.length)
      : 0
    const shortest = withPages[0]
    const longest = withPages[withPages.length - 1]

    // Géneros únicos
    const genres = [...new Set(books.map((b) => b.genre).filter((g): g is string => !!g))]

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks: books.length,
      firstBook: first ? { title: first.title, year: first.publishedYear } : null,
      latestBook: latest ? { title: latest.title, year: latest.publishedYear } : null,
      averagePages,
      genres,
      longestBook: longest ? { title: longest.title, pages: longest.pages } : null,
      shortestBook: shortest ? { title: shortest.title, pages: shortest.pages } : null,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del autor' },
      { status: 500 }
    )
  }
}
