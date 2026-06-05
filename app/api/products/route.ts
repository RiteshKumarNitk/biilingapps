import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product.service'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') as any || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc'

    // Validate tenantId
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    // Get products
    const result = await ProductService.getAll({
      tenantId,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, ...productData } = body

    // Validate tenantId
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    // Create product
    const product = await ProductService.create({
      ...productData,
      tenantId
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
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

    // Validate required fields
    if (!id || !tenantId) {
      return NextResponse.json(
        { error: 'Product ID and Tenant ID are required' },
        { status: 400 }
      )
    }

    // Update product
    const product = await ProductService.update(id, tenantId, updateData)

    return NextResponse.json(product, { status: 200 })
  } catch (error: any) {
    console.error('Update product error:', error)
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

    // Validate required fields
    if (!id || !tenantId) {
      return NextResponse.json(
        { error: 'Product ID and Tenant ID are required' },
        { status: 400 }
      )
    }

    // Delete product
    await ProductService.delete(id, tenantId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}