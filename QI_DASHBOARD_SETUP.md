# QI Dashboard - MongoDB API Integration

The dashboard has been updated to work with the new QI MongoDB API!

## ✅ What's Done

### API Configuration Updated

- **File:** `src/config/api.js`
- **Changed:** All endpoints now point to `/api/qi/*` instead of old endpoints
- **Products:** `/api/qi/products`
- **Categories:** `/api/qi/categories`
- **Presentations:** `/api/qi/presentations`
- **Banners:** `/api/qi/banners`

### Existing Dashboard Features

The dashboard already has:

- ✅ Product list with search and sort
- ✅ Product detail popup
- ✅ Category management
- ✅ Presentation management
- ✅ Banner management
- ✅ Create/Edit/Delete operations
- ✅ Image display
- ✅ Responsive design

## 🚀 Getting Started

### 1. Start the Backend

```bash
cd /Users/ggmj/Development/OregonChemDigital/oregonchem_backend
npm run dev
```

Backend runs on: `http://localhost:5001`

### 2. Start the Dashboard

```bash
cd /Users/ggmj/Development/OregonChemDigital/oregonchem_dashboard
npm run dev
```

Dashboard runs on: `http://localhost:5173` (or similar)

### 3. Login

The dashboard has authentication. Check `.env` for credentials.

## 📋 What Needs Updating

The dashboard pages need to be adapted to work with the new QI MongoDB data structure:

### 1. Product List (`src/pages/Products/AllProductsList.jsx`)

**Current Issues:**

- Expects old data structure with `site1-site5` fields
- Looks for `product.images` as object with site keys
- Expects `presentations` and `categories` as arrays with `name` field

**Needs:**

- Update to use new QI structure:
  - `title` instead of `name`
  - `media.hero` and `media.gallery` for images
  - `presentationIds` (array of IDs) instead of `presentations`
  - `categoryIds` (array of IDs) instead of `categories`
  - `description_html` and `short_html` instead of `descriptions` object
  - `ai.description` and `ai.shortDescription` for AI content
  - `physicalState` field
  - `status` field (draft/published)

### 2. Product Editor (`src/pages/Products/CreateProduct.jsx`)

**Needs:**

- Form fields for new QI structure
- Category selector (fetch from `/api/qi/categories`)
- Presentation selector (fetch from `/api/qi/presentations`)
- Image upload for `media.hero` and `media.gallery`
- AI content display/regeneration
- Physical state selector
- Status toggle (draft/published)
- Tags input
- Related products selector

### 3. Category List (`src/pages/Categories/CategoryList.jsx`)

**Needs:**

- Update to use new structure:
  - `name`, `slug`, `description`
  - `image` object with `url`, `alt`, `width`, `height`
  - `productCount` field

### 4. Presentation List (`src/pages/Presentations/PresentationList.jsx`)

**Needs:**

- Update to use new structure:
  - `qty`, `unit`, `pretty`
  - `image` object
  - `sortOrder`
  - `productCount`

### 5. Banner Management

**Already compatible!** The banner structure matches the QI API.

## 🎨 Recommended Updates

### Priority 1: Product List View

Update `AllProductsList.jsx` to:

1. Display products from QI API correctly
2. Show presentation images or placeholders
3. Display AI-generated descriptions
4. Show physical state indicator
5. Show published/draft status

### Priority 2: Product Editor

Create/update product editor to:

1. Edit all QI product fields
2. Upload images to `media.hero` and `media.gallery`
3. Select categories and presentations
4. Add/edit tags
5. Regenerate AI content
6. Toggle published status

### Priority 3: Category & Presentation Management

Update to work with QI structure and allow:

1. Upload category images
2. Upload presentation images
3. Edit descriptions
4. View product counts

## 📊 Data Structure Reference

### QI Product Structure

```javascript
{
  _id: "...",
  title: "Product Name",
  slug: "product-name",
  sku: "SKU123",
  status: "draft" | "published",
  featured: false,
  categoryIds: ["id1", "id2"],
  presentationIds: ["id1", "id2"],
  relatedProductIds: ["id1", "id2"],
  tags: ["tag1", "tag2"],
  description_html: "<p>HTML description</p>",
  description_text: "Plain text description",
  short_html: "<p>Short HTML</p>",
  short_text: "Short text",
  seo: {
    title: "SEO Title",
    description: "SEO Description",
    keywords: ["keyword1", "keyword2"]
  },
  media: {
    hero: {
      url: "https://...",
      alt: "Alt text",
      width: 800,
      height: 600
    },
    gallery: [
      { url: "https://...", alt: "..." }
    ]
  },
  images: [], // Legacy, usually empty
  ai: {
    description: "AI-generated description",
    shortDescription: "AI-generated short description",
    seoTitle: "AI-generated SEO title",
    seoDescription: "AI-generated SEO description",
    physicalStateReasoning: "AI reasoning for physical state"
  },
  physicalState: "liquido" | "solido" | "polvo" | "granular" | "pasta" | "gas" | "unknown",
  views: 0,
  searches: 0,
  totalQuotes: 0,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### QI Category Structure

```javascript
{
  _id: "...",
  name: "Category Name",
  slug: "category-name",
  description: "Category description",
  image: {
    url: "/images/categories/category-name.png",
    alt: "Alt text",
    width: 1024,
    height: 1024
  },
  parentId: null,
  productCount: 50
}
```

### QI Presentation Structure

```javascript
{
  _id: "...",
  qty: 1,
  unit: "kg",
  pretty: "1kg",
  image: {
    url: "/images/presentations/1kg.png",
    alt: "1kg presentation",
    width: 512,
    height: 512
  },
  sortOrder: 1,
  productCount: 148
}
```

## 🔧 Next Steps

1. **Test the dashboard** - Start it up and see what breaks
2. **Update Product List** - Make it display QI products correctly
3. **Update Product Editor** - Make it work with QI structure
4. **Update Category/Presentation pages** - Adapt to new structure
5. **Add new features:**
   - AI content regeneration button
   - Physical state indicator
   - Publish/unpublish toggle
   - Image upload for presentations
   - Bulk operations

## 📝 Notes

- The dashboard is already built with React, Material-UI, and React Router
- Authentication is already implemented
- The grid/card layout components are reusable
- Image upload functionality exists but needs updating for new structure

---

**Ready to start testing!** 🚀

Run `npm run dev` in the dashboard folder and see what needs fixing!
