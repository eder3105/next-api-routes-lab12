import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// En Next.js 15+ los params son una Promise, por eso se usa "await params"
type Context = { params: Promise<{ id: string }> }

// Ejercicio 2
// GET /api/authors/[id] – Obtener un autor por ID
export async function GET(request: Request, { params }: Context) {
  try {
    const { id } = await params
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: { orderBy: { publishedYear: 'desc' } },
        _count: { select: { books: true } },
      },
    })

    if (!author) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }

    return NextResponse.json(author)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Error al obtener autor' }, { status: 500 })
  }
}

// PUT /api/authors/[id] – Actualizar un autor
export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, bio, nationality, birthYear } = body

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
      }
    }

    const author = await prisma.author.update({
      where: { id },
      data: {
        name,
        email,
        bio,
        nationality,
        birthYear: birthYear ? parseInt(birthYear) : null,
      },
      include: { books: true },
    })

    return NextResponse.json(author)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025 = registro no encontrado
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
      }
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
      }
    }
    console.log(error)
    return NextResponse.json({ error: 'Error al actualizar autor' }, { status: 500 })
  }
}

// DELETE /api/authors/[id] – Eliminar un autor (sus libros se borran en cascada)
export async function DELETE(request: Request, { params }: Context) {
  try {
    const { id } = await params
    await prisma.author.delete({ where: { id } })

    return NextResponse.json({ message: 'Autor eliminado correctamente' })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }
    console.log(error)
    return NextResponse.json({ error: 'Error al eliminar autor' }, { status: 500 })
  }
}
