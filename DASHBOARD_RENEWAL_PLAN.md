# Dashboard Renewal Plan

**Project:** Química Industrial Dashboard Simplification  
**Date:** January 5, 2026  
**Goal:** Align dashboard with single-frontend backend/frontend architecture

---

## Overview

The dashboard was originally designed to manage 5 different frontends. We now have **only 1 frontend** (Química Industrial Perú), and the dashboard must be simplified to reflect this reality.

**Key Principle:** Every change must be verified to ensure it doesn't break the working frontend or backend.

---

## Phase 1: Product Management (PRIORITY)

### Step 1.1: Verify Current QIProductEditor ✅

**File:** `src/pages/Products/QIProductEditor.jsx`

**Actions:**

1. Test creating a new product
2. Test editing an existing product
3. Test deleting a product
4. Verify data appears correctly in MongoDB
5. Verify product displays on frontend

**Success Criteria:**

- Product CRUD operations work without errors
- Data structure matches backend Product model
- Frontend displays product correctly

---

### Step 1.2: Enhance QIProductEditor

**File:** `src/pages/Products/QIProductEditor.jsx`

#### Add Missing Fields

**A. Related Products Selector**

```javascript
// Add to formData state
relatedProductIds: []

// Add UI section after Presentations
<section className="qi-editor-section">
  <h2>Productos Relacionados</h2>
  <div className="qi-related-products-selector">
    {/* Multi-select dropdown or search interface */}
    {/* Show product title + image for each selection */}
  </div>
</section>
```

**B. Brand Field**

```javascript
// Add to formData state
brand: ''

// Add to Basic Info section
<div className="qi-form-group">
  <label>Marca</label>
  <input
    type="text"
    name="brand"
    value={formData.brand}
    onChange={handleChange}
    placeholder="Marca del producto"
  />
</div>
```

**Success Criteria:**

- Can select related products from existing products list
- Brand field saves to backend
- Related products display on frontend product page

---

### Step 1.3: Remove Confusing/Unused Fields

**File:** `src/pages/Products/QIProductEditor.jsx`

#### Remove These Sections

**A. HTML Description Fields**

```javascript
// DELETE lines ~370-400
// - description_html textarea
// - short_html textarea

// KEEP only:
// - description_text
// - short_text
```

**Reason:** Frontend uses text versions, HTML adds complexity without benefit.

**B. Legacy Media Fields**

```javascript
// DELETE lines ~512-543
// - media.hero.url input
// - media.hero.alt input

// Or convert to read-only display if data exists
```

**Reason:** Frontend gets images from CanonicalPresentation, not from product.media.

**Success Criteria:**

- Form is simpler and less confusing
- Only fields that frontend actually uses remain
- No data loss for existing products

---

### Step 1.4: Improve UX

**File:** `src/pages/Products/QIProductEditor.jsx`

#### Enhancements

**A. Field Descriptions**
Add helper text to clarify what each field does:

```javascript
<div className="qi-form-group">
  <label>Descripción Corta (Texto)</label>
  <p className="qi-helper-text">
    Resumen breve que aparece en listados de productos (máx. 220 caracteres)
  </p>
  <textarea ... />
</div>
```

**B. Presentation Preview**
Show presentation images when selected:

```javascript
<div className="qi-presentations-preview">
  {formData.presentationIds.map((id) => {
    const pres = presentations.find((p) => p._id === id);
    return (
      <div key={id} className="qi-pres-preview">
        {pres.image?.url && <img src={pres.image.url} />}
        <span>{pres.pretty}</span>
      </div>
    );
  })}
</div>
```

**C. Validation Feedback**
Add real-time validation:

```javascript
// Check required fields
// Show character count for descriptions
// Validate slug uniqueness
// Show preview of how product will appear on frontend
```

**Success Criteria:**

- Form is intuitive and user-friendly
- Clear guidance on what each field does
- Visual feedback on selections

---

### Step 1.5: Delete Legacy ProductForm

**File:** `src/components/Forms/ProductForm.jsx`

**Actions:**

1. Search codebase for any imports/usage of ProductForm
2. Remove all references
3. Delete the file
4. Delete associated CSS if not shared

**Files to Check:**

- `src/pages/Products/CreateProduct.jsx`
- `src/pages/Products/AllProductsList.jsx`
- Any route files

**Success Criteria:**

- No references to ProductForm remain
- No broken imports
- Application runs without errors

---

## Phase 2: Categories Management

### Step 2.1: Audit QICategoryEditor

**File:** `src/pages/Categories/QICategoryEditor.jsx`

**Verify Against Backend Model:**

```javascript
{
  name: String (required),
  slug: String (required, unique),
  parentId: ObjectId (optional),
  image: { url, alt, width, height, hash },
  description: String,
  legacy: Boolean,
  sourceId: Number,
  sourceMeta: Mixed
}
```

**Check:**

- [ ] All required fields present
- [ ] Image upload works
- [ ] Parent category selection works
- [ ] Slug auto-generation works

---

### Step 2.2: Enhance Category Form

**Add:**

- Image upload/preview for category.image
- Parent category selector (for hierarchical categories)
- Description rich text editor (optional)

**Remove:**

- Any multi-frontend logic
- Unused legacy fields

---

## Phase 3: Presentations Management

### Step 3.1: Audit QIPresentationEditor

**File:** `src/pages/Presentations/QIPresentationEditor.jsx`

**Verify Against Backend Model:**

```javascript
{
  qty: Number (required),
  unit: String (required),
  pretty: String (required),
  image: { url, alt, width, height, hash },
  sortOrder: Number,
  productCount: Number
}
```

**Check:**

- [ ] qty, unit, pretty fields work
- [ ] Image upload saves to presentation.image
- [ ] sortOrder can be set
- [ ] productCount is read-only

---

### Step 3.2: Add Image Management

**Critical:** Presentation images are what the frontend displays!

**Add:**

- Image upload for presentation.image
- Image preview
- Alt text input
- Image dimensions (optional)

**Consider:**

- Move AI image generation from ProductForm to here
- Allow generating multiple variations
- Save generated images directly to presentation.image

---

## Phase 4: Banners Management

### Step 4.1: Audit QIBannerEditor

**File:** `src/pages/Banners/QIBannerEditor.jsx`

**Verify Against Backend Model:**

```javascript
{
  title: String (required),
  image: { url, alt, width, height, hash } (required),
  link: { url, openInNewTab },
  placement: String (enum),
  active: Boolean,
  startDate: Date,
  endDate: Date,
  sortOrder: Number,
  overlay: { title, subtitle, buttonText, textColor, backgroundColor },
  impressions: Number,
  clicks: Number
}
```

**Check:**

- [ ] Image upload works
- [ ] Placement options match backend enum
- [ ] Date scheduling works
- [ ] Overlay configuration works
- [ ] Analytics (impressions/clicks) display correctly

---

### Step 4.2: Enhance Banner Form

**Add:**

- Visual preview of banner with overlay
- Placement preview (show where it will appear on frontend)
- Schedule validation (endDate > startDate)
- Active/inactive toggle with visual indicator

---

## Phase 5: List Views & Bulk Operations

### Step 5.1: Enhance Product List

**File:** `src/pages/Products/QIProductList.jsx`

**Add:**

- [ ] Bulk publish/unpublish
- [ ] Bulk delete (with confirmation)
- [ ] Bulk category assignment
- [ ] Export to CSV
- [ ] Better filtering (by multiple categories, date range, etc.)
- [ ] Sorting by views, quotes, created date

---

### Step 5.2: Enhance Other Lists

Apply same improvements to:

- Category list
- Presentation list
- Banner list

---

## Phase 6: Testing & Documentation

### Step 6.1: Comprehensive Testing

**Test Matrix:**

| Action               | Dashboard | Backend | Frontend | Status |
| -------------------- | --------- | ------- | -------- | ------ |
| Create Product       | ✓         | ✓       | ✓        | [ ]    |
| Edit Product         | ✓         | ✓       | ✓        | [ ]    |
| Delete Product       | ✓         | ✓       | ✓        | [ ]    |
| Publish Product      | ✓         | ✓       | ✓        | [ ]    |
| Create Category      | ✓         | ✓       | ✓        | [ ]    |
| Edit Category        | ✓         | ✓       | ✓        | [ ]    |
| Delete Category      | ✓         | ✓       | ✓        | [ ]    |
| Create Presentation  | ✓         | ✓       | ✓        | [ ]    |
| Edit Presentation    | ✓         | ✓       | ✓        | [ ]    |
| Delete Presentation  | ✓         | ✓       | ✓        | [ ]    |
| Upload Pres. Image   | ✓         | ✓       | ✓        | [ ]    |
| Create Banner        | ✓         | ✓       | ✓        | [ ]    |
| Edit Banner          | ✓         | ✓       | ✓        | [ ]    |
| Delete Banner        | ✓         | ✓       | ✓        | [ ]    |
| Toggle Banner Active | ✓         | ✓       | ✓        | [ ]    |

---

### Step 6.2: User Documentation

**Create:** `DASHBOARD_USER_GUIDE.md`

**Sections:**

1. **Getting Started**

   - Login process
   - Dashboard overview
   - Navigation

2. **Managing Products**

   - Creating a new product
   - Required vs optional fields
   - Selecting categories and presentations
   - Adding tags
   - SEO best practices
   - Publishing workflow

3. **Managing Categories**

   - Creating categories
   - Uploading category images
   - Organizing hierarchies

4. **Managing Presentations**

   - Creating presentations
   - Uploading presentation images
   - Understanding qty/unit/pretty

5. **Managing Banners**

   - Creating banners
   - Placement options
   - Scheduling banners
   - Overlay configuration

6. **Best Practices**
   - Image specifications
   - SEO guidelines
   - Content guidelines

---

## Phase 7: Advanced Features (Future)

### Step 7.1: AI Content Generation

**Add to Product Editor:**

- Button to generate description from product name
- Button to generate SEO content
- Button to suggest tags
- Physical state auto-detection

**Integration:**

- Use existing backend AI services
- Show AI suggestions, allow editing before saving
- Track which content is AI-generated vs manual

---

### Step 7.2: Analytics Dashboard

**Create:** `src/pages/Analytics/QIAnalytics.jsx`

**Show:**

- Top viewed products
- Top quoted products
- Category performance
- Search queries
- Banner click-through rates
- Product creation timeline

---

### Step 7.3: Import/Export

**Add:**

- Export products to CSV
- Import products from CSV
- Bulk update via CSV
- Export categories/presentations

---

## Implementation Timeline

### Week 1: Critical Fixes

- ✅ Complete analysis (DONE)
- [ ] Test QIProductEditor thoroughly
- [ ] Add related products field
- [ ] Add brand field
- [ ] Remove HTML description fields
- [ ] Remove legacy media fields
- [ ] Delete ProductForm.jsx

### Week 2: Enhancements

- [ ] Improve QIProductEditor UX
- [ ] Audit and fix Category editor
- [ ] Audit and fix Presentation editor
- [ ] Add presentation image upload

### Week 3: Polish

- [ ] Audit and fix Banner editor
- [ ] Enhance all list views
- [ ] Add bulk operations
- [ ] Comprehensive testing

### Week 4: Documentation

- [ ] User guide
- [ ] Developer documentation
- [ ] Video tutorials (optional)
- [ ] Training for content team

---

## Risk Mitigation

### Before Each Change

1. **Backup Database**

   ```bash
   # MongoDB backup command
   mongodump --uri="mongodb://..." --out=backup-$(date +%Y%m%d)
   ```

2. **Test in Development**

   - Use local backend
   - Test all CRUD operations
   - Verify frontend displays correctly

3. **Incremental Deployment**
   - Deploy one change at a time
   - Test in production after each deployment
   - Have rollback plan ready

### Rollback Plan

If something breaks:

1. **Identify Issue**

   - Check browser console
   - Check backend logs
   - Check MongoDB data

2. **Quick Fix or Rollback**

   - If quick fix available: deploy immediately
   - If not: rollback to previous version

3. **Restore Data (if needed)**
   ```bash
   mongorestore --uri="mongodb://..." backup-YYYYMMDD
   ```

---

## Success Metrics

### Quantitative

- [ ] All CRUD operations work without errors
- [ ] Dashboard load time < 2 seconds
- [ ] Zero data corruption incidents
- [ ] 100% test coverage for critical paths

### Qualitative

- [ ] Content team can use dashboard without training
- [ ] Dashboard is intuitive and professional
- [ ] No confusion about which fields to use
- [ ] Confidence in data integrity

---

## Maintenance Plan

### Weekly

- [ ] Review error logs
- [ ] Check for orphaned data
- [ ] Monitor API performance

### Monthly

- [ ] Review user feedback
- [ ] Plan new features
- [ ] Update documentation

### Quarterly

- [ ] Security audit
- [ ] Performance optimization
- [ ] Dependency updates

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Get approval** to proceed
3. **Set up development environment** with local backend
4. **Start with Phase 1, Step 1.1** - Test current QIProductEditor
5. **Document findings** after each step
6. **Proceed incrementally** with testing at each stage

---

## Questions to Answer Before Starting

1. **Do we have a staging environment?**

   - If yes: test there first
   - If no: consider setting one up

2. **Who will test the dashboard?**

   - Developer testing
   - Content team testing
   - User acceptance testing

3. **What's the deployment process?**

   - Manual deployment
   - CI/CD pipeline
   - Rollback procedure

4. **Do we have database backups?**

   - Automated backups
   - Manual backup before changes
   - Restore procedure tested

5. **What's the communication plan?**
   - Notify content team of changes
   - Training sessions needed
   - Support during transition

---

## Contact & Support

**Developer:** [Your Name]  
**Project Manager:** [PM Name]  
**Content Team Lead:** [Lead Name]

**Resources:**

- Backend API: https://oregonchem-backend.onrender.com
- Frontend: https://quimicaindustrial.pe
- Dashboard: https://dashboard.quimica.pe (or local)
- Documentation: This repository

---

**Last Updated:** January 5, 2026  
**Status:** Planning Phase  
**Next Review:** After Phase 1 completion
