import { NextResponse } from 'next/server'
import { productService } from '@/lib/services/product.service'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    const product = await productService.getProductById(tenantId, params.id)
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    const body = await req.json()
    const result = await productService.updateProduct(tenantId, params.id, body)
    
    if (result.count === 0) {
      return NextResponse.json({ error: 'Product not found or not updated' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = req.headers.get('x-tenant-id')
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    const result = await productService.deleteProduct(tenantId, params.id)
    
    if (result.count === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
