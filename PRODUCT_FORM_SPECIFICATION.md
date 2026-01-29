# Enhanced Product Form Specification

**Date:** January 5, 2026  
**Purpose:** Complete specification for the new/improved product form

---

## Form Structure

### 1. Información Básica / Basic Information

#### 1.1 Nombre del Producto (Required)

- **Field:** `title` (String)
- **Type:** Text input
- **Validation:** Required, min 3 chars
- **Auto-actions:** Generates slug on blur

#### 1.2 Slug (Auto-generated, Editable)

- **Field:** `slug` (String)
- **Type:** Text input
- **Auto-generation:** From title (lowercase, remove accents, replace spaces with hyphens)
- **Validation:** Required, unique, URL-safe characters only
- **Helper text:** "URL amigable para el producto"

#### 1.3 SKU (Optional)

- **Field:** `sku` (String)
- **Type:** Text input
- **Validation:** Optional, alphanumeric
- **Helper text:** "Código interno del producto"

#### 1.4 Estado / Status (Required)

- **Field:** `status` (String)
- **Type:** Select dropdown
- **Options:**
  - `draft` - "Borrador" (default)
  - `published` - "Publicado"
- **Helper text:** "Borrador = no visible en el sitio web"

#### 1.5 Estado Físico / Physical State (Required)

- **Field:** `physicalState` (String)
- **Type:** Select dropdown
- **Options:**
  - `unknown` - "Desconocido" (default)
  - `liquido` - "Líquido"
  - `solido` - "Sólido"
  - `polvo` - "Polvo"
  - `granular` - "Granular"
  - `pasta` - "Pasta"
  - `gas` - "Gas"
- **Helper text:** "Determina la imagen placeholder si no hay imágenes"

#### 1.6 Producto Destacado / Featured (Optional)

- **Field:** `featured` (Boolean)
- **Type:** Checkbox
- **Default:** false
- **Helper text:** "Aparecerá en la sección destacados de la página principal"

---

### 2. Descripciones / Descriptions

**Layout:** Two-column layout with AI generation button at top

#### AI Generation Button

- **Action:** Generate all 4 descriptions from product name
- **API:** POST to backend AI service
- **Behavior:**
  - Shows loading spinner
  - Populates all 4 fields
  - User can edit after generation
  - Button text: "🤖 Generar con IA"

#### 2.1 Descripción Corta (Texto) (Recommended)

- **Field:** `short_text` (String)
- **Type:** Textarea (3 rows)
- **Character limit:** 220 chars (show counter)
- **Helper text:** "Resumen breve para listados de productos"
- **AI-generated:** Yes

#### 2.2 Descripción Corta (HTML) (Optional)

- **Field:** `short_html` (String)
- **Type:** Textarea (4 rows)
- **Helper text:** "Versión HTML de la descripción corta (opcional)"
- **AI-generated:** Yes
- **Note:** Frontend prefers text version

#### 2.3 Descripción Completa (Texto) (Recommended)

- **Field:** `description_text` (String)
- **Type:** Textarea (6 rows)
- **Helper text:** "Descripción detallada del producto"
- **AI-generated:** Yes

#### 2.4 Descripción Completa (HTML) (Optional)

- **Field:** `description_html` (String)
- **Type:** Textarea (8 rows)
- **Helper text:** "Versión HTML de la descripción completa (opcional)"
- **AI-generated:** Yes
- **Note:** Frontend prefers text version

**Design Note:**

- Text fields on left, HTML fields on right
- HTML fields slightly grayed out to indicate "optional"
- Single AI button generates all 4 at once

---

### 3. Categorías / Categories

#### 3.1 Category Selection (Required)

- **Field:** `categoryIds` (Array of ObjectIds)
- **Type:** Checkbox grid
- **Validation:** At least 1 category required
- **Display:**
  - Show category name
  - Show category image thumbnail (if exists)
  - Grid layout (3-4 columns)

#### 3.2 Quick Add Category Button

- **Button:** "+ Nueva Categoría Rápida"
- **Action:** Opens modal with category form
- **Modal contains:**
  - Name (required)
  - Slug (auto-generated)
  - Description (optional)
  - Image upload (optional)
  - Parent category (optional)
- **On save:**
  - Creates category via API
  - Automatically selects it in product form
  - Closes modal
  - Shows success message

---

### 4. Presentaciones / Presentations

#### 4.1 Presentation Selection (Required)

- **Field:** `presentationIds` (Array of ObjectIds)
- **Type:** Checkbox grid
- **Validation:** At least 1 presentation required
- **Display:**
  - Show presentation name (pretty: "250 g", "1 kg")
  - Show presentation image thumbnail (if exists)
  - Grid layout (4-5 columns)
  - Visual indicator if presentation has image

#### 4.2 Quick Add Presentation Button

- **Button:** "+ Nueva Presentación Rápida"
- **Action:** Opens modal with presentation form
- **Modal contains:**
  - Cantidad / Quantity (required, number)
  - Unidad / Unit (required, text: "g", "kg", "L", "mL", etc.)
  - Pretty (auto-generated: "250 g")
  - Image upload (optional but recommended)
  - Sort order (optional, default: 0)
- **On save:**
  - Creates presentation via API
  - Automatically selects it in product form
  - Closes modal
  - Shows success message

**Important Note:** Presentation images are what the frontend displays!

---

### 5. Etiquetas / Tags

#### 5.1 Tags Input

- **Field:** `tags` (Array of Strings)
- **Type:** Tag input with autocomplete
- **Behavior:**
  - Type tag and press Enter or comma
  - Shows existing tags as chips
  - Click X to remove tag
  - Autocomplete from existing tags in database
- **Helper text:** "Palabras clave para SEO y filtrado (ej: industrial, limpieza, químico)"
- **Examples shown:** "industrial", "limpieza", "desinfección", "alimenticio"

---

### 6. SEO (Optional but Recommended)

**Layout:** Collapsible section with AI generation button

#### AI Generation Button

- **Action:** Generate SEO fields from product name + short description
- **API:** POST to backend AI service
- **Button text:** "🤖 Generar SEO con IA"

#### 6.1 Título SEO

- **Field:** `seo.title` (String)
- **Type:** Text input
- **Character limit:** 60 chars (show counter with color coding)
- **Helper text:** "Título optimizado para Google (50-60 caracteres)"
- **AI-generated:** Yes
- **Default:** Auto-fill with product name if empty

#### 6.2 Descripción SEO

- **Field:** `seo.description` (String)
- **Type:** Textarea (3 rows)
- **Character limit:** 160 chars (show counter with color coding)
- **Helper text:** "Descripción meta para resultados de búsqueda (150-160 caracteres)"
- **AI-generated:** Yes
- **Default:** Auto-fill with short_text if empty

#### 6.3 Palabras Clave SEO

- **Field:** `seo.keywords` (Array of Strings)
- **Type:** Tag input (same as Tags section)
- **Helper text:** "Palabras clave específicas para SEO"
- **AI-generated:** Yes
- **Note:** Can be same as or different from Tags

**Visual Preview:**

- Show Google search result preview
- Updates in real-time as user types
- Shows: Title (blue link), URL (green), Description (gray)

---

### 7. Imágenes / Images

**Purpose:** Product-specific images (fallback if no presentation images)

#### 7.1 Image Upload Section

- **Field:** `media.hero` (Object: {url, alt, width, height})
- **Field:** `media.gallery` (Array of Objects)
- **Type:** Drag-and-drop file upload
- **Storage:** Firebase Storage
- **Accepted formats:** JPG, PNG, WebP
- **Max size:** 5MB per image
- **Recommended size:** 1200x1200px

#### Upload Interface

```
┌─────────────────────────────────────────┐
│  📸 Imagen Principal (Hero)             │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │   Arrastra imagen aquí          │   │
│  │   o haz clic para seleccionar   │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  [Preview if uploaded]                  │
│  Alt text: [________________]           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🖼️ Galería de Imágenes (Opcional)     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ img │ │ img │ │ img │ │  +  │      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│  [Drag to reorder]                      │
└─────────────────────────────────────────┘
```

#### Upload Process

1. User selects/drops image
2. Show upload progress bar
3. Upload to Firebase Storage
4. Get download URL
5. Save URL to `media.hero.url` or `media.gallery[].url`
6. Extract dimensions and save
7. Show preview with delete button

#### Helper Text

"Las imágenes de presentaciones se mostrarán primero. Estas imágenes son un respaldo."

---

### 8. Productos Relacionados / Related Products (Optional)

**New Section** - Not in current form but supported by backend

#### 8.1 Related Products Selector

- **Field:** `relatedProductIds` (Array of ObjectIds)
- **Type:** Multi-select searchable dropdown
- **Display:**
  - Search by product name
  - Show product image + name
  - Selected products shown as chips
  - Drag to reorder

#### 8.2 AI-Generated Relationships (Read-only)

- **Field:** `relatedProducts` (Array of {productId, reason})
- **Display:** If exists, show in separate section
- **Format:**
  ```
  🤖 Relaciones generadas por IA:
  - [Product Name] - "Complementario para limpieza industrial"
  - [Product Name] - "Alternativa en diferente presentación"
  ```

---

### 9. Marca / Brand (Optional)

**New Field** - Supported by backend but not in current form

#### 9.1 Brand Input

- **Field:** `brand` (String)
- **Type:** Text input with autocomplete
- **Helper text:** "Marca del producto (ej: Diversey, Ecolab)"
- **Autocomplete:** From existing brands in database

---

### 10. Información de Solo Lectura / Read-Only Info

Display if editing existing product:

#### 10.1 Métricas / Metrics

- **Views:** `views` (Number)
- **Searches:** `searches` (Number)
- **Quotes:** `totalQuotes` (Number)
- **Created:** `createdAt` (Date)
- **Updated:** `updatedAt` (Date)

#### 10.2 AI Content (If exists)

- **AI Description:** `ai.description`
- **AI Short Description:** `ai.shortDescription`
- **AI SEO Title:** `ai.seoTitle`
- **AI SEO Description:** `ai.seoDescription`
- **Physical State Reasoning:** `ai.physicalStateReasoning`

Display in collapsible section with robot icon 🤖

---

### 11. Preview & Save

#### 11.1 Preview Button

- **Button:** "👁️ Vista Previa"
- **Action:** Opens modal showing product as it will appear on frontend
- **Modal contains:**
  - Product card view (as in catalog)
  - Product detail view (as in product page)
  - Tabs to switch between views
  - "Looks good!" button to close

#### 11.2 Save Button

- **Button:** "💾 Guardar"
- **Behavior:**
  1. Validate all required fields
  2. Show confirmation modal with:
     - Summary of product info
     - Preview thumbnail
     - Status indicator (Borrador/Publicado)
     - "Confirmar y Guardar" button
     - "Cancelar" button
  3. On confirm:
     - POST/PUT to API
     - Show success message
     - Redirect to product list OR stay on form (user choice)

#### 11.3 Save & Publish Button (if status = draft)

- **Button:** "✅ Guardar y Publicar"
- **Behavior:** Same as Save but sets status to 'published'
- **Confirmation:** Extra warning if no images uploaded

#### 11.4 Delete Button (Edit mode only)

- **Button:** "🗑️ Eliminar Producto"
- **Position:** Bottom left, danger color
- **Confirmation:** "¿Estás seguro? Esta acción no se puede deshacer."

---

## Form Layout

### Desktop Layout (>1024px)

```
┌────────────────────────────────────────────────────────┐
│  Header: [Crear/Editar Producto]    [Preview] [Save]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 1. Información Básica                        │    │
│  │ [Fields in 2 columns]                        │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 2. Descripciones        [🤖 Generar con IA] │    │
│  │ ┌──────────────┐  ┌──────────────┐          │    │
│  │ │ Texto        │  │ HTML         │          │    │
│  │ └──────────────┘  └──────────────┘          │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 3. Categorías           [+ Nueva Categoría]  │    │
│  │ [Checkbox grid]                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 4. Presentaciones    [+ Nueva Presentación]  │    │
│  │ [Checkbox grid]                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 5. Etiquetas                                 │    │
│  │ [Tag input]                                  │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 6. SEO (Opcional)       [🤖 Generar SEO]    │    │
│  │ [Collapsible section]                        │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 7. Imágenes                                  │    │
│  │ [Upload interface]                           │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 8. Productos Relacionados (Opcional)         │    │
│  │ [Multi-select]                               │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 9. Marca (Opcional)                          │    │
│  │ [Text input]                                 │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  [Delete]                    [Preview] [Save]        │
└────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

- Single column
- Sticky header with save button
- Collapsible sections
- Floating action button for save

---

## Validation Rules

### Required Fields

- ✅ `title` (min 3 chars)
- ✅ `slug` (unique, URL-safe)
- ✅ `status` (draft or published)
- ✅ `categoryIds` (at least 1)
- ✅ `presentationIds` (at least 1)

### Recommended Fields

- ⚠️ `short_text` (warn if empty)
- ⚠️ `description_text` (warn if empty)
- ⚠️ `seo.title` (warn if empty)
- ⚠️ `seo.description` (warn if empty)

### Optional Fields

- Everything else

### Character Limits

- `short_text`: 220 chars (soft limit, show warning)
- `seo.title`: 60 chars (hard limit, show error)
- `seo.description`: 160 chars (hard limit, show error)

---

## API Integration

### Endpoints Used

#### Products

- `POST /api/qi/products` - Create product
- `PUT /api/qi/products/:id` - Update product
- `GET /api/qi/products/:id` - Get product (edit mode)
- `DELETE /api/qi/products/:id` - Delete product

#### Categories

- `GET /api/qi/categories` - List for selection
- `POST /api/qi/categories` - Quick add

#### Presentations

- `GET /api/qi/presentations` - List for selection
- `POST /api/qi/presentations` - Quick add

#### AI Generation

- `POST /api/ai/generate-descriptions` - Generate descriptions
- `POST /api/ai/generate-seo` - Generate SEO

#### Images

- Firebase Storage SDK - Upload images
- Returns download URL

---

## User Experience Features

### Auto-save Draft

- Save to localStorage every 30 seconds
- Restore on page reload
- Clear on successful save

### Keyboard Shortcuts

- `Cmd/Ctrl + S` - Save
- `Cmd/Ctrl + P` - Preview
- `Esc` - Close modals

### Loading States

- Skeleton loaders while fetching data
- Progress bars for image uploads
- Spinners for AI generation
- Disabled buttons during save

### Error Handling

- Inline validation errors
- Toast notifications for API errors
- Retry button for failed operations
- Detailed error messages

### Success Feedback

- Success toast on save
- Confetti animation on first publish
- Option to create another product
- Option to view on frontend

---

## Accessibility

- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader friendly
- Color contrast compliance
- Error announcements

---

## Performance

- Lazy load images
- Debounce slug generation
- Throttle auto-save
- Optimize re-renders
- Code splitting for modals

---

## Future Enhancements

1. **Bulk Edit Mode** - Edit multiple products at once
2. **Product Templates** - Save common configurations
3. **Version History** - Track changes over time
4. **Duplicate Product** - Clone with modifications
5. **Import/Export** - CSV/Excel support
6. **Advanced AI** - Generate based on industry trends
7. **Image Editing** - Crop, resize, filters
8. **Scheduled Publishing** - Set publish date/time
9. **Multi-language** - Support for multiple languages
10. **Approval Workflow** - Review before publish

---

## Technical Stack

- **Framework:** React
- **Form Library:** React Hook Form (for validation)
- **UI Components:** Custom + existing dashboard components
- **Image Upload:** Firebase Storage SDK
- **API Client:** Fetch with error handling
- **State Management:** React Context + useState
- **Styling:** CSS Modules or existing dashboard styles

---

**Last Updated:** January 5, 2026  
**Status:** Specification Complete - Ready for Implementation
