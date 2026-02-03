# Dashboard Alignment Analysis

**Date:** January 5, 2026  
**Purpose:** Comprehensive audit of backend ↔ frontend ↔ dashboard alignment for Química Industrial

---

## Executive Summary

### Current State

- ✅ **Backend:** Deployed and working (oregonchem-backend.onrender.com)
- ✅ **Frontend:** Deployed and working perfectly (quimicaindustrial.pe)
- ⚠️ **Dashboard:** Deployed but misaligned with backend/frontend structure

### Critical Finding

**The dashboard product form contains legacy multi-frontend logic that does NOT match the current backend Product model.** This creates a serious risk of data corruption and broken functionality if used in production.

---

## Backend Product Model (Source of Truth)

### File: `/oregonchem_backend/src/models/QI/Product.js`

#### Core Fields (REQUIRED)

```javascript
{
  title: String (required),
  slug: String (required, unique),
  status: 'draft' | 'published' (default: 'draft'),
  categoryIds: [ObjectId] (ref: Category),
  presentationIds: [ObjectId] (ref: CanonicalPresentation)
}
```

#### Optional Fields (SUPPORTED)

```javascript
{
  // Identity
  sourceId: Number,
  sku: String,
  brand: String,
  wpType: String (default: 'simple'),

  // Publishing
  featured: Boolean (default: false),
  publishedAt: Date,

  // Taxonomy
  tags: [String],
  relatedProductIds: [ObjectId],
  relatedProducts: [{ productId: ObjectId, reason: String }],

  // Content
  description_html: String,
  description_text: String,
  short_html: String,
  short_text: String,

  // SEO
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },

  // Media (LEGACY - not used by frontend)
  media: {
    hero: { url, alt, width, height, hash },
    gallery: [{ url, alt, width, height, hash }]
  },
  images: [{ url, alt, width, height, hash }],

  // Presentations (DEPRECATED - use presentationIds instead)
  presentations: [{ qty, unit, pretty }],
  defaultPresentation: { qty, unit, pretty },

  // Metrics
  views: Number (default: 0),
  searches: Number (default: 0),
  totalQuotes: Number (default: 0),

  // Stock
  stock_status: String,

  // AI Content
  ai: {
    description: String,
    shortDescription: String,
    seoTitle: String,
    seoDescription: String,
    physicalStateReasoning: String
  },

  // Physical State
  physicalState: 'liquido' | 'solido' | 'polvo' | 'granular' | 'pasta' | 'gas' | 'unknown',

  // Legacy
  sourceUrl: String,
  related_source_ids: [Number],
  sourceMeta: Mixed
}
```

### Backend REST API Endpoints

#### Products

- `GET /api/qi/products` - List products (with filters, search, pagination)
- `GET /api/qi/products/:id` - Get product by ID
- `GET /api/qi/products/slug/:slug` - Get product by slug
- `GET /api/qi/products/featured` - Get featured products
- `GET /api/qi/products/:id/related` - Get related products
- `POST /api/qi/products` - Create product
- `PUT /api/qi/products/:id` - Update product
- `DELETE /api/qi/products/:id` - Delete product
- `PATCH /api/qi/products/:id/publish` - Toggle publish status

#### Categories

- `GET /api/qi/categories` - List categories
- `GET /api/qi/categories/:id` - Get category by ID
- `GET /api/qi/categories/slug/:slug` - Get category by slug
- `GET /api/qi/categories/:id/products` - Get products in category
- `POST /api/qi/categories` - Create category
- `PUT /api/qi/categories/:id` - Update category
- `DELETE /api/qi/categories/:id` - Delete category

#### Presentations

- `GET /api/qi/presentations` - List presentations
- `GET /api/qi/presentations/:id` - Get presentation by ID
- `GET /api/qi/presentations/:id/products` - Get products with presentation
- `POST /api/qi/presentations` - Create presentation
- `PUT /api/qi/presentations/:id` - Update presentation
- `DELETE /api/qi/presentations/:id` - Delete presentation
- `PATCH /api/qi/presentations/:id/image` - Update presentation image
- `POST /api/qi/presentations/sync-counts` - Sync product counts

#### Banners

- `GET /api/qi/banners` - List banners
- `GET /api/qi/banners/active/:placement` - Get active banners for placement
- `GET /api/qi/banners/:id` - Get banner by ID
- `POST /api/qi/banners` - Create banner
- `PUT /api/qi/banners/:id` - Update banner
- `DELETE /api/qi/banners/:id` - Delete banner
- `PATCH /api/qi/banners/:id/toggle` - Toggle active status
- `POST /api/qi/banners/:id/impression` - Track impression
- `POST /api/qi/banners/:id/click` - Track click

---

## Frontend Data Consumption

### File: `/quimicaindustrial-frontend/src/data/qiAdapter.ts`

#### What the Frontend ACTUALLY Uses

**From Product:**

```typescript
{
  _id, // ✅ Used as product.id
    title, // ✅ Used as product.name
    slug, // ✅ Used for URLs
    sku, // ✅ Displayed
    status, // ✅ Filters published products
    featured, // ✅ For featured section
    categoryIds, // ✅ For filtering/display
    presentationIds, // ✅ CRITICAL - used to fetch presentation images
    relatedProductIds, // ✅ For related products
    relatedProducts, // ✅ For AI-generated relationships with reasons
    tags, // ✅ For hero highlights
    description_text, // ✅ Primary description
    short_text, // ✅ Primary summary
    ai.description, // ✅ Preferred over description_text
    ai.shortDescription, // ✅ Preferred over short_text
    physicalState, // ✅ For placeholder images
    views, // ✅ For popularity calculation
    searches, // ✅ For popularity calculation
    totalQuotes, // ✅ For popularity calculation
    createdAt; // ✅ For sorting
}
```

**NOT Used by Frontend:**

```typescript
{
  description_html, // ❌ Not used (text version preferred)
    short_html, // ❌ Not used (text version preferred)
    media, // ❌ LEGACY - frontend uses presentation images
    images, // ❌ LEGACY - frontend uses presentation images
    presentations, // ❌ DEPRECATED - uses presentationIds instead
    defaultPresentation, // ❌ DEPRECATED
    seo, // ❌ Not currently used (could be in future)
    stock_status, // ❌ Not used
    brand, // ❌ Not used
    sourceId, // ❌ Legacy WooCommerce ID
    sourceUrl, // ❌ Legacy
    related_source_ids, // ❌ Legacy
    sourceMeta; // ❌ Legacy
}
```

#### Critical Frontend Logic

**Image Display:**
The frontend gets product images from **CanonicalPresentation** documents, NOT from the product's media/images fields:

```typescript
// From qiAdapter.ts lines 19-73
// 1. Get presentationIds from product
// 2. Fetch CanonicalPresentation documents
// 3. Extract presentation.image.url
// 4. If no images, use placeholder based on physicalState
```

**This means:**

- Product images are stored in the **CanonicalPresentation** collection
- Each presentation (250g, 1kg, etc.) has its own image
- The product document itself doesn't need media/images fields
- Frontend displays presentation images in product gallery

---

## Dashboard Current State (MISALIGNED)

### File: `/oregonchem_dashboard/src/pages/Products/QIProductEditor.jsx`

#### ✅ What's CORRECT in Dashboard

```javascript
{
  title, // ✅ Matches backend
    slug, // ✅ Matches backend (auto-generated)
    sku, // ✅ Matches backend
    status, // ✅ Matches backend
    featured, // ✅ Matches backend
    categoryIds, // ✅ Matches backend (checkbox selection)
    presentationIds, // ✅ Matches backend (checkbox selection)
    tags, // ✅ Matches backend (tag input)
    description_text, // ✅ Matches backend
    description_html, // ✅ Matches backend
    short_text, // ✅ Matches backend
    short_html, // ✅ Matches backend
    seo, // ✅ Matches backend
    physicalState, // ✅ Matches backend
    media.hero; // ✅ Matches backend (optional)
}
```

#### ❌ What's MISSING in Dashboard

```javascript
{
  brand,              // ❌ Not in form (optional field)
  relatedProductIds,  // ❌ Not in form (should add for related products)
  relatedProducts,    // ❌ Not in form (AI-generated relationships)
  ai.*                // ❌ Read-only display only (correct)
}
```

### File: `/oregonchem_dashboard/src/components/Forms/ProductForm.jsx`

#### 🚨 CRITICAL ISSUES - LEGACY MULTI-FRONTEND CODE

This form is **COMPLETELY WRONG** for the current system:

```javascript
// Lines 7-13: WRONG - No longer managing 5 frontends
const FRONTEND_OPTIONS = [
  { id: 'site1', label: 'Química Industrial' },
  { id: 'site2', label: 'Frontend 2' },
  { id: 'site3', label: 'Frontend 3' },
  { id: 'site4', label: 'Frontend 4' },
  { id: 'site5', label: 'Frontend 5' }
];

// Lines 22-25: WRONG - These fields don't exist in backend
selectedFrontends: ['site1'],
descriptions: {},  // Per-frontend descriptions
uses: {},          // Per-frontend uses
prices: {},        // Per-frontend prices

// Lines 26-32: WRONG - Product images per frontend
productImages: [{ site, file, previewUrl }]

// Lines 111-190: WRONG - AI image generation logic
// This generates images but doesn't save to CanonicalPresentation

// Lines 422-449: WRONG - Frontend selection checkboxes
// Lines 451-529: WRONG - Per-frontend descriptions, uses, prices
```

**This form will NOT work with the current backend API.**

---

## Critical Mismatches & Risks

### 🔴 HIGH RISK - Will Break Production

1. **Multi-Frontend Logic**

   - Dashboard has frontend selection (site1-5)
   - Backend has NO concept of multiple frontends
   - Submitting this form will fail or corrupt data

2. **Per-Frontend Fields**

   - Dashboard collects descriptions[site1], uses[site1], prices[site1]
   - Backend expects single description_text, description_html
   - **Risk:** Data loss, API errors

3. **Image Storage Mismatch**

   - Dashboard uploads images per frontend
   - Frontend expects images in CanonicalPresentation.image
   - **Risk:** Images won't display on frontend

4. **Presentation Image Generation**
   - Dashboard generates AI images but doesn't save to presentations
   - Frontend needs presentation.image.url
   - **Risk:** Generated images are lost

### 🟡 MEDIUM RISK - Missing Features

5. **Related Products**

   - Backend supports relatedProductIds and relatedProducts
   - Dashboard has no UI for managing relationships
   - **Impact:** Can't set up product relationships

6. **Brand Field**
   - Backend supports product.brand
   - Dashboard doesn't expose it
   - **Impact:** Minor - field is optional

### 🟢 LOW RISK - Works But Could Be Better

7. **Legacy Media Fields**

   - Dashboard allows media.hero input
   - Frontend doesn't use it (uses presentation images)
   - **Impact:** Confusing but harmless

8. **HTML Descriptions**
   - Dashboard has description_html and short_html
   - Frontend prefers text versions
   - **Impact:** Extra work, not harmful

---

## What's Working in Production

### Frontend → Backend Communication ✅

The frontend successfully:

- Fetches products via `/api/qi/products`
- Fetches categories via `/api/qi/categories`
- Fetches presentations via `/api/qi/presentations`
- Displays presentation images correctly
- Shows product details on `/products/[slug]`
- Displays featured products on homepage
- Handles quote form submissions
- Sends contact form emails

### Backend API ✅

All REST endpoints are working:

- Products CRUD operations
- Categories CRUD operations
- Presentations CRUD operations
- Banners CRUD operations
- Quote submissions
- Contact form emails
- Analytics tracking

### What's NOT Working

**Dashboard Product Creation/Editing** ⚠️

- Form structure doesn't match backend API
- Will fail or create malformed data
- Images won't be properly associated with presentations

---

## Recommended Dashboard Simplification

### Phase 1: Fix Product Form (CRITICAL)

**Remove:**

- ❌ All multi-frontend logic (FRONTEND_OPTIONS)
- ❌ Per-frontend descriptions, uses, prices
- ❌ Per-frontend image uploads
- ❌ Frontend selection checkboxes
- ❌ AI image generation (move to Presentations)

**Keep:**

- ✅ Single product name (title)
- ✅ Auto-generated slug
- ✅ SKU input
- ✅ Status (draft/published)
- ✅ Featured checkbox
- ✅ Category selection (checkboxes)
- ✅ Presentation selection (checkboxes)
- ✅ Tags input
- ✅ Single description_text
- ✅ Single short_text
- ✅ Physical state dropdown
- ✅ SEO fields

**Add:**

- ➕ Related products selector
- ➕ Brand input (optional)

**Simplify:**

- Remove description_html, short_html (use text only)
- Remove media.hero (not used by frontend)
- Make AI content read-only (already correct)

### Phase 2: Align Other Forms

**Categories Form:**

- Verify matches backend Category model
- Add image upload for category.image

**Presentations Form:**

- Verify matches backend CanonicalPresentation model
- Ensure image upload saves to presentation.image
- Move AI image generation here (not in products)

**Banners Form:**

- Verify matches backend Banner model
- Ensure placement options match backend enum

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         DASHBOARD                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Product Form (NEEDS FIX)                           │     │
│  │ - title, slug, sku, status, featured               │     │
│  │ - categoryIds[], presentationIds[]                 │     │
│  │ - description_text, short_text                     │     │
│  │ - tags[], seo{}, physicalState                     │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│                           │ POST/PUT                         │
│                           ▼                                  │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Product Model                                      │     │
│  │ MongoDB: products collection                       │     │
│  │ - All fields from dashboard                        │     │
│  │ - Refs: categoryIds → categories                   │     │
│  │ - Refs: presentationIds → canonicalpresentations   │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│                           │ GET                              │
│                           ▼                                  │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ qiApi.ts → Fetch from /api/qi/products            │     │
│  │ qiAdapter.ts → Transform QIProduct to Product      │     │
│  │                                                     │     │
│  │ Key Logic:                                         │     │
│  │ 1. Get product.presentationIds                     │     │
│  │ 2. Fetch CanonicalPresentation docs                │     │
│  │ 3. Extract presentation.image.url                  │     │
│  │ 4. Display in product gallery                      │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────┘
```

---

## Action Plan

### Immediate (Before Any Dashboard Use)

1. **STOP using ProductForm.jsx** - It will corrupt data
2. **Use QIProductEditor.jsx ONLY** - It's aligned with backend
3. **Verify QIProductEditor** works with backend API
4. **Test create/edit/delete** operations thoroughly

### Short Term (This Week)

1. **Add Related Products UI** to QIProductEditor
2. **Add Brand field** to QIProductEditor
3. **Remove unused fields** (description_html, short_html, media.hero)
4. **Test all CRUD operations** against production backend
5. **Document simplified workflow** for content team

### Medium Term (Next Sprint)

1. **Delete ProductForm.jsx** - Remove legacy code
2. **Audit Category/Presentation/Banner forms**
3. **Add image upload** to Presentation form
4. **Move AI image generation** to Presentation management
5. **Add bulk operations** (publish/unpublish multiple products)

### Long Term (Future)

1. **Add SEO preview** in product editor
2. **Add AI content generation** button in product editor
3. **Add product duplication** feature
4. **Add import/export** functionality
5. **Add version history** for products

---

## Testing Checklist

Before using dashboard in production:

- [ ] Create new product via QIProductEditor
- [ ] Verify product appears in backend database
- [ ] Verify product displays on frontend
- [ ] Verify presentation images display correctly
- [ ] Edit existing product
- [ ] Verify changes reflect on frontend
- [ ] Toggle publish/draft status
- [ ] Verify status change on frontend
- [ ] Delete product
- [ ] Verify product removed from frontend
- [ ] Test category assignment
- [ ] Test presentation assignment
- [ ] Test tag management
- [ ] Test SEO fields
- [ ] Test featured flag

---

## Files Reference

### Backend

- `/oregonchem_backend/src/models/QI/Product.js` - Product model
- `/oregonchem_backend/src/models/QI/Category.js` - Category model
- `/oregonchem_backend/src/models/QI/CanonicalPresentation.js` - Presentation model
- `/oregonchem_backend/src/models/QI/Banner.js` - Banner model
- `/oregonchem_backend/src/controllers/QI/ProductController.js` - Product API
- `/oregonchem_backend/src/routes/qiRoutes.js` - API routes

### Frontend

- `/quimicaindustrial-frontend/src/data/qiApi.ts` - API client
- `/quimicaindustrial-frontend/src/data/qiAdapter.ts` - Data transformation
- `/quimicaindustrial-frontend/src/data/products.ts` - Product data layer
- `/quimicaindustrial-frontend/src/components/ProductDetail.astro` - Product page

### Dashboard

- `/oregonchem_dashboard/src/pages/Products/QIProductEditor.jsx` - ✅ CORRECT
- `/oregonchem_dashboard/src/pages/Products/QIProductList.jsx` - ✅ CORRECT
- `/oregonchem_dashboard/src/components/Forms/ProductForm.jsx` - ❌ LEGACY (DELETE)
- `/oregonchem_dashboard/src/config/api.js` - API endpoints

---

## Conclusion

**Current Status:**

- Backend and Frontend are perfectly aligned and working in production
- Dashboard has TWO product forms:
  - `QIProductEditor.jsx` - ✅ Aligned with backend
  - `ProductForm.jsx` - ❌ Legacy multi-frontend code (DANGEROUS)

**Critical Action:**

- **ONLY use QIProductEditor.jsx** for product management
- **DO NOT use ProductForm.jsx** - it will break production
- **Test thoroughly** before creating/editing products in production

**Next Steps:**

1. Enhance QIProductEditor with missing fields (related products, brand)
2. Remove confusing/unused fields (HTML descriptions, legacy media)
3. Delete ProductForm.jsx to prevent accidental use
4. Document simplified workflow for content team
