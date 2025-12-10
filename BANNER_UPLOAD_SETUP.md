# Banner Image Upload to Firebase Storage

## ✅ What's Been Implemented

### **1. ImageUpload Component**

- **Location**: `/src/components/ImageUpload/ImageUpload.jsx`
- **Features**:
  - Drag & drop file upload
  - Progress indicator
  - Image preview
  - File validation (type & size)
  - Firebase Storage integration
  - Remove uploaded image

### **2. Firebase Configuration**

- **Location**: `/src/config/firebase.js`
- Configured Firebase Storage
- Uses environment variables with fallbacks

### **3. QIBannerEditor Integration**

- **Location**: `/src/pages/Banners/QIBannerEditor.jsx`
- Replaced URL input with ImageUpload component
- Kept URL field as optional override for external images
- Images uploaded to `qi/banners/` path in Firebase Storage

---

## **How It Works**

1. **User clicks "Upload Image"** in banner editor
2. **Selects image file** (PNG, JPG, WEBP, max 5MB)
3. **Image uploads to Firebase Storage** at `qi/banners/{timestamp}_{filename}`
4. **Progress bar shows upload status**
5. **Download URL automatically populates** the image URL field
6. **Preview displays** the uploaded image
7. **User can remove** and re-upload if needed

---

## **Firebase Storage Rules**

Make sure your Firebase Storage rules allow uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /qi/banners/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Or adjust based on your auth
    }
  }
}
```

---

## **Environment Variables** (Optional)

Add to `.env` if you want to override defaults:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## **Usage**

### **Create New Banner**

1. Go to Dashboard → Banners → Create Banner
2. Fill in banner details
3. Click "Upload Image" in the Image section
4. Select your banner image
5. Wait for upload to complete
6. Image URL will be automatically filled
7. Add alt text and other details
8. Click "Save"

### **Edit Existing Banner**

1. Go to Dashboard → Banners → All Banners
2. Click on a banner to edit
3. Current image will be displayed
4. Click remove (trash icon) to delete current image
5. Upload new image if desired
6. Click "Save"

---

## **Features**

✅ **Automatic filename sanitization**  
✅ **Unique filenames** (timestamp prefix)  
✅ **File type validation** (images only)  
✅ **File size validation** (max 5MB)  
✅ **Upload progress indicator**  
✅ **Image preview**  
✅ **Remove/replace functionality**  
✅ **Optional external URL override**

---

## **Storage Path Structure**

```
firebase-storage/
└── qi/
    └── banners/
        ├── 1733849600000_banner-hero.jpg
        ├── 1733849700000_promo-banner.png
        └── 1733849800000_category-banner.webp
```

---

## **Next Steps**

1. **Test the upload** in the dashboard
2. **Verify images appear** on the frontend
3. **Set Firebase Storage rules** for production
4. **Optional**: Add image optimization/resizing

---

## **Troubleshooting**

### **Upload fails**

- Check Firebase Storage rules
- Verify Firebase config is correct
- Check browser console for errors

### **Image doesn't display**

- Verify Firebase Storage URL is public
- Check CORS settings in Firebase
- Ensure image URL is saved correctly

### **"Process is not defined" error**

- This is a linting warning, not a runtime error
- The code will work fine in Create React App
- Environment variables are handled by React build process
