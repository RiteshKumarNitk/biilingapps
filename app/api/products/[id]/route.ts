import { NextResponse, NextRequest } from 'next/server'
import ProductService from '@/lib/services/product.service'
import { requireAuth } from '@/lib/auth-server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const product = await ProductService.getById(id, user.tenantId)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const body = await req.json()
    const result = await ProductService.update(id, user.tenantId, body)

    if (!result) {
      return NextResponse.json({ error: 'Product not found or not updated' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 400 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const result = await ProductService.delete(id, user.tenantId)

    if (!result) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 400 })
  }
}
