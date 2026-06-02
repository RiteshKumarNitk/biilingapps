# Migration Plan: Supabase to PostgreSQL/Prisma

## Overview
This document outlines the migration from Supabase to a traditional PostgreSQL database with Prisma ORM, JWT authentication, and REST APIs.

## Current Supabase Usage Analysis

### 1. Files Using Supabase
- **Actions**: All files in `/actions/*` use Supabase server client
- **API Routes**: `/app/auth/callback/route.ts` 
- **Client Components**: Login/Signup pages, user-nav, product-form, profile forms
- **Utils**: `/utils/supabase/client.ts`, `middleware.ts`, `server.ts`
- **Supabase Functions**: PDF generation and payment order functions

### 2. Database Tables Discovered
From `supabase_schema.sql`:
- **Tenants**: Business entities
- **Users_Profile**: User profiles linked to auth users
- **Products**: Inventory items
- **Stock_Movements**: Inventory audit trail
- **Parties**: Customers/Suppliers
- **Invoices**: Sales invoices
- **Invoice_Items**: Invoice line items
- **Payments**: Payment records
- **Ledger_Entries**: Accounting ledger
- **Expenses**: Business expenses
- **Online_Orders**: E-commerce orders
- **Quotations**: Sales estimates
- **Quotation_Items**: Quote line items
- **Credit_Notes**: Refund/credit documents
- **Delivery_Challans**: Delivery documents
- **Purchase_Orders**: Purchase orders
- **PO_Items**: Purchase order line items
- **Bank_Accounts**: Bank account information

### 3. Authentication Flow
- Uses Supabase Auth (email/password, OAuth)
- Session management via cookies
- Auth helpers in middleware
- Role-based access: owner, accountant, sales

### 4. Storage Usage
- User profile avatars (`storage` calls in user-profile-form, settings-form)
- Product images (`storage` calls in product-form)
- Invoice/quotation PDFs (generated and stored)
- Expense receipts

### 5. Realtime Usage
- No explicit realtime subscriptions found in codebase

### 6. Required API Endpoints
Based on Supabase usage patterns:

#### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`
- POST `/api/auth/refresh`

#### Tenants
- GET `/api/tenants`
- GET `/api/tenants/:id`
- PUT `/api/tenants/:id`

#### Products
- GET `/api/products`
- POST `/api/products`
- GET `/api/products/:id`
- PUT `/api/products/:id`
- DELETE `/api/products/:id`
- GET `/api/products/search`

#### Stock Movements
- GET `/api/stock-movements`
- POST `/api/stock-movements`
- GET `/api/stock-movements/:id`

#### Parties
- GET `/api/parties`
- POST `/api/parties`
- GET `/api/parties/:id`
- PUT `/api/parties/:id`
- DELETE `/api/parties/:id`
- GET `/api/parties/:id/transactions`

#### Invoices
- GET `/api/invoices`
- POST `/api/invoices`
- GET `/api/invoices/:id`
- PUT `/api/invoices/:id`
- DELETE `/api/invoices/:id`
- GET `/api/invoices/:id/items`
- GET `/api/invoices/public/:token` (for share token)
- POST `/api/invoices/:id/payments`
- POST `/api/invoices/:id/send`

#### Invoice Items
- GET `/api/invoice-items`
- POST `/api/invoice-items`
- PUT `/api/invoice-items/:id`
- DELETE `/api/invoice-items/:id`

#### Payments
- GET `/api/payments`
- POST `/api/payments`
- GET `/api/payments/:id`
- PUT `/api/payments/:id`
- DELETE `/api/payments/:id`

#### Expenses
- GET `/api/expenses`
- POST `/api/expenses`
- GET `/api/expenses/:id`
- PUT `/api/expenses/:id`
- DELETE `/api/expenses/:id`

#### Quotations
- GET `/api/quotations`
- POST `/api/quotations`
- GET `/api/quotations/:id`
- PUT `/api/quotations/:id`
- DELETE `/api/quotations/:id`
- POST `/api/quotations/:id/convert`

#### Quotation Items
- GET `/api/quotation-items`
- POST `/api/quotation-items`
- PUT `/api/quotation-items/:id`
- DELETE `/api/quotation-items/:id`

#### Purchase Orders
- GET `/api/purchase-orders`
- POST `/api/purchase-orders`
- GET `/api/purchase-orders/:id`
- PUT `/api/purchase-orders/:id`
- DELETE `/api/purchase-orders/:id`
- GET `/api/purchase-orders/:id/items`

#### PO Items
- GET `/api/po-items`
- POST `/api/po-items`
- PUT `/api/po-items/:id`
- DELETE `/api/po-items/:id`

#### Online Orders
- GET `/api/online-orders`
- POST `/api/online-orders`
- GET `/api/online-orders/:id`
- PUT `/api/online-orders/:id`

#### Bank Accounts
- GET `/api/bank-accounts`
- POST `/api/bank-accounts`
- GET `/api/bank-accounts/:id`
- PUT `/api/bank-accounts/:id`
- DELETE `/api/bank-accounts/:id`

#### Reports & Analytics
- GET `/api/reports/dashboard`
- GET `/api/reports/sales`
- GET `/api/reports/purchases`
- GET `/api/reports/inventory`

## Migration Steps

### Phase 1: Preparation
1. Install required dependencies (Prisma, bcrypt, jsonwebtoken, cookie)
2. Create Prisma schema based on Supabase schema
3. Set up environment variables
4. Create database connection

### Phase 2: Database Migration
1. Generate Prisma client
2. Create migration scripts
3. Apply database schema to Neon PostgreSQL
4. Create seed data if needed

### Phase 3: Authentication System
1. Implement JWT utility (sign, verify, refresh)
2. Create auth service (register, login, logout, refresh)
3. Implement password hashing with bcrypt
4. Create auth middleware for route protection
5. Build auth context for frontend

### Phase 4: API Layer Creation
1. Create route handlers for all required endpoints
2. Implement service layer for business logic
3. Create repository layer for data access
4. Build API client for frontend consumption
5. Add proper error handling and validation

### Phase 5: Frontend Migration
1. Replace all Supabase client calls with API service calls
2. Update authentication flows (login, logout, session)
3. Replace storage uploads with API endpoints
4. Update realtime subscriptions (if any) to polling or websockets
5. Modify protected routes to use JWT middleware

### Phase 6: Storage Migration
1. Implement file upload endpoint (local storage or cloud service)
2. Update all storage upload logic
3. Modify file retrieval to use new endpoints

### Phase 7: Testing & Cleanup
1. Test all API endpoints
2. Verify authentication flows
3. Check data integrity and relationships
4. Remove all Supabase dependencies
5. Update documentation and environment files
6. Run linting and type checking

## Deliverables
- Updated folder structure with service/repository layers
- Complete Prisma schema with all relationships
- Fully functional REST API endpoints
- JWT-based authentication system
- Role-based access control middleware
- API service layer for frontend consumption
- Migration guide and documentation
- Updated package.json and .env.example
- Database seed file
- Zero Supabase dependencies