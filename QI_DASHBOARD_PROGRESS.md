# QI Dashboard - Simplification Progress

## ✅ What's Done

### 1. API Configuration Updated

- **File:** `src/config/api.js`
- All endpoints now point to QI MongoDB API (`/api/qi/*`)

### 2. New QI Product List Created

- **File:** `src/pages/products/QIProductList.jsx`
- **Features:**
  - ✅ Fetches products from QI MongoDB API
  - ✅ Displays product image (or placeholder based on physical state)
  - ✅ Shows title, SKU, slug
  - ✅ Displays categories and presentations
  - ✅ Shows published/draft status
  - ✅ View count display
  - ✅ Search by name, SKU, or slug
  - ✅ Filter by status (all/published/draft)
  - ✅ Filter by category
  - ✅ Toggle publish/unpublish
  - ✅ Edit button (links to editor)
  - ✅ Delete button
  - ✅ Clean, modern UI with Tailwind-style CSS

### 3. Routes Updated

- `/productos` → QI Product List
- `/productos/todos` → QI Product List
- `/productos/crear` → Create Product (needs update)
- `/productos/editar/:id` → Edit Product (needs update)

## 🚀 Test It Now!

**Dashboard is running at:** `http://localhost:10000/`

1. Login to the dashboard
2. Navigate to "Productos" in the sidebar
3. You should see all 368 products from QI MongoDB!

## 📋 Next Steps

### Priority 1: Product Editor (NEXT)

Create `src/pages/products/QIProductEditor.jsx` with:

- Form for all QI product fields
- Category multi-select
- Presentation multi-select
- Tags input
- Image upload for hero and gallery
- AI content display
- Physical state selector
- Status toggle (draft/published)
- Featured toggle
- Related products selector
- Save/Update functionality

### Priority 2: Bulk Edit Page

Create `src/pages/products/QIBulkEdit.jsx` with:

- Select multiple products
- Bulk operations:
  - Publish/unpublish
  - Add/remove categories
  - Add/remove presentations
  - Add/remove tags
  - Regenerate AI content
  - Delete

### Priority 3: Clean Up Old Code

Remove multi-site complexity:

- Delete old `AllProductsList.jsx`
- Remove site-specific pages
- Remove analytics pages (implement later for QI only)
- Simplify sidebar to show only QI options

## 🎯 Current Focus: QI Only

We're removing all multi-site complexity and focusing ONLY on managing QI data:

- ✅ Products
- ✅ Categories
- ✅ Presentations
- ✅ Banners

No more site1-site5, no more multi-frontend support. Just clean, simple QI management.

## 📊 QI Product Model Reference

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
  description_html: "<p>HTML</p>",
  short_html: "<p>Short</p>",
  seo: { title, description, keywords },
  media: {
    hero: { url, alt, width, height },
    gallery: [{ url, alt }]
  },
  ai: {
    description,
    shortDescription,
    seoTitle,
    seoDescription,
    physicalStateReasoning
  },
  physicalState: "liquido" | "solido" | etc,
  views: 0,
  searches: 0,
  totalQuotes: 0
}
```

---

**Ready to test the new product list!** 🎉

Open `http://localhost:10000/productos` and see your 368 products!
