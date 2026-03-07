# Draft Products Feature Documentation

## Overview

The Draft Products feature allows admins to save products as **drafts** or **publish** them immediately. Draft products are only visible to the admin who created them and won't appear to customers.

## Features Implemented

### 1. Backend Changes

#### New API Routes
- **GET** `/api/admin/products/drafts` - Fetch draft products for current admin
- **PUT** `/api/admin/products/:id/publish` - Publish a draft product
- **DELETE** `/api/admin/products/drafts/:id` - Delete single draft
- **POST** `/api/admin/products/drafts/delete-many` - Delete multiple drafts

#### New Controller Methods
- `getDraftProducts()` - Retrieves draft products for the logged-in admin only
- `publishDraft()` - Validates and publishes a draft product
- `deleteDraft()` - Deletes a single draft (with ownership verification)
- `deleteManyDrafts()` - Bulk deletes drafts for current admin

#### Security Features
- All draft operations verify admin ownership
- Admins can only see/edit their own drafts
- Draft products filtered by `createdBy: req.user._id`

### 2. Frontend Changes

#### New Pages
- **Drafts Page**: `/admin/products/drafts`
  - Lists all draft products created by current admin
  - Shows: Product, Price, Stock, Category, Drafted At, Drafted By, Actions
  - Columns match the Published Products page

#### Updated ProductForm
- **"Publish Product"** button → Creates published product (default)
- **"Save as Draft"** button → Creates draft product (only on add, not edit)
- Draft products redirect to `/admin/products/drafts` after save
- Published products redirect to `/admin/products` after save

#### Updated Products Page
- Added **"Draft Products"** button → Links to `/admin/products/drafts`

### 3. Database Changes

Uses existing schema fields:
- `status` - enum: ["draft", "published", "archived"]
- `createdBy` - Admin user ID (set at creation)
- `createdAt` - Auto timestamp

## User Workflow

### Saving as Draft
1. Admin clicks "Add Product" on products page
2. Fills in **any** product information (partial data allowed)
3. Clicks **"Save as Draft"** button
4. Product saved with `status: "draft"`
5. Redirected to `/admin/products/drafts`
6. Admin can edit or publish later

### Publishing from Draft
1. Admin navigates to `/admin/products/drafts`
2. Can edit draft by clicking **"Edit"** button
3. Completes all required fields in ProductForm
4. Clicks **"Publish Product"** button OR **"Save as Draft"** to save more changes
5. When publishing:
   - Validates ALL required fields are filled
   - Checks all variants have at least one image
   - Converts to `status: "published"`
   - Now visible on frontend and in Products page

### Publishing Directly (No Draft)
1. Admin clicks "Add Product"
2. Fills in **all** required fields
3. Clicks **"Publish Product"** button directly
4. Product published immediately with `status: "published"`
5. Redirected to `/admin/products`

## Field Structure

### Draft Products Table Columns
| Field | Description |
|-------|-------------|
| Checkbox | Multi-select for bulk delete |
| Product | Product name + thumbnail |
| Price | Minimum price (₹) |
| Stock | Total stock count |
| Category | Product category |
| Drafted At | Creation date |
| Drafted By | Admin who created it |
| Actions | Publish, Edit, Delete |

## Validation

### Before Saving as Draft
- ❌ NO validation (partial data allowed)
- Saves immediately

### Before Publishing from Draft
- ✅ Product name required
- ✅ Brand required
- ✅ Category required
- ✅ Product details required
- ✅ At least one variant required
- ✅ Each variant must have at least one image
- ✅ Each variant must have at least one size

If validation fails:
```
Error: "All required fields must be filled before publishing"
```

## Ownership & Permissions

### Draft Products are Private
- Each admin only sees drafts they created
- API filters by `createdBy: req.user._id`
- Cannot edit/delete other admin's drafts

### Example
```
Admin A creates draft "Product X"
Admin B logs in → Cannot see "Product X" in their drafts
Admin A can see and manage all their drafts
```

## API Response Examples

### Get Drafts Response
```json
{
  "success": true,
  "drafts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Ultra Comfort Bra",
      "thumbnail": "/uploads/products/images/...",
      "minPrice": 499,
      "totalStock": 50,
      "category": "bra",
      "createdAt": "2026-03-06T10:30:00Z",
      "createdBy": { "_id": "...", "name": "Admin Name" }
    }
  ],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

### Publish Draft Response
```json
{
  "success": true,
  "message": "Product published successfully!",
  "product": { ...full product data }
}
```

## Pages & Routes

### Frontend Routes
- `/admin/products` → Published products list (with link to drafts)
- `/admin/products/add` → Add new product (can save as draft or publish)
- `/admin/products/edit/:id` → Edit product (no draft button, only update)
- `/admin/products/drafts` → Draft products list

### Backend Routes
- `GET /api/admin/products` → Get published products for admin panel
- `GET /api/admin/products/drafts` → Get draft products (admin only)
- `POST /api/admin/products` → Create new product (as published or draft)
- `PUT /api/admin/products/:id` → Update product
- `PUT /api/admin/products/:id/publish` → Publish a draft
- `DELETE /api/admin/products/drafts/:id` → Delete single draft
- `POST /api/admin/products/drafts/delete-many` → Delete multiple drafts

## Features Summary

✅ Save products as draft  
✅ Draft products only visible to creator  
✅ Publish drafts with full validation  
✅ Edit drafts before publishing  
✅ Delete single or multiple drafts  
✅ Drafts don't appear to customers  
✅ Full audit trail (who created, when)  
✅ Ownership verification on all operations  

## File Changes

### Backend
- `routes/adminRoutes.js` - Added draft routes
- `controllers/adminController.js` - Added draft methods

### Frontend
- `app/admin/products/page.jsx` - Added link to drafts
- `app/admin/products/drafts/page.jsx` - NEW draft products list page
- `components/admin/ProductForm.jsx` - Updated button labels & redirect logic

## Testing Checklist

- [ ] Create new draft product with partial data
- [ ] Edit draft and complete fields
- [ ] Publish draft successfully
- [ ] Try to publish incomplete draft (should error)
- [ ] Delete single draft
- [ ] Delete multiple drafts at once
- [ ] Verify other admin cannot see your drafts
- [ ] Verify drafts don't appear on frontend
- [ ] Verify published product appears on frontend
- [ ] Edit published product (no draft button should show)
