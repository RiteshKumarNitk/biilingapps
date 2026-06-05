import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') as any || undefined

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const where: any = {
      tenantId,
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
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, ...partyData } = body

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const party = await prisma.party.create({
      data: {
        ...partyData,
        tenantId
      }
    })

    return NextResponse.json(party, { status: 201 })
  } catch (error: any) {
    console.error('Create party error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, tenantId, ...updateData } = body

    if (!id || !tenantId) {
      return NextResponse.json(
        { error: 'Party ID and Tenant ID are required' },
        { status: 400 }
      )
    }

    const party = await prisma.party.update({
      where: { id, tenantId },
      data: updateData
    })

    return NextResponse.json(party, { status: 200 })
  } catch (error: any) {
    console.error('Update party error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const tenantId = searchParams.get('tenantId')

    if (!id || !tenantId) {
      return NextResponse.json(
        { error: 'Party ID and Tenant ID are required' },
        { status: 400 }
      )
    }

    await prisma.party.delete({
      where: { id, tenantId }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Delete party error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}