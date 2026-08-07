import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = (searchParams.get('type') as any) || undefined

    const where: any = {
      tenantId: user.tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(type && { type })
    }

    const skip = (page - 1) * limit

    const [parties, totalCount] = await Promise.all([
      prisma.party.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.party.count({ where })
    ])

    return NextResponse.json({
      parties,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('Get parties error:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const partyData = await request.json()

    const party = await prisma.party.create({
      data: {
        ...partyData,
        tenantId: user.tenantId
      }
    })

    return NextResponse.json(party, { status: 201 })
  } catch (error: any) {
    console.error('Create party error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Party ID is required' },
        { status: 400 }
      )
    }

    const party = await prisma.party.update({
      where: { id, tenantId: user.tenantId },
      data: updateData
    })

    return NextResponse.json(party, { status: 200 })
  } catch (error: any) {
    console.error('Update party error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Party ID is required' },
        { status: 400 }
      )
    }

    await prisma.party.delete({
      where: { id, tenantId: user.tenantId }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Delete party error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    )
  }
}
