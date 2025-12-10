# 🚀 Dashboard Deployment to Vercel

## ✅ **QUICK DEPLOYMENT GUIDE**

---

## **STEP 1: Prepare for Deployment**

### **Important: This is the React Dashboard**

- **Dev server:** http://localhost:10001 (Vite)
- **Framework:** React + Vite
- **Deploy to:** Vercel

### **Update .env for Production**

✅ Already done! `.env` now points to production backend:

```env
VITE_API_URL=https://oregonchem-backend.onrender.com
```

**Note:** The `npm run dev` command overrides this with `localhost:5001`, but the build will use the `.env` value.

### **Commit and Push**

```bash
cd /Users/ggmj/Development/OregonChemDigital/oregonchem_dashboard
git add .
git commit -m "Dashboard ready for deployment: Firebase Storage, production API"
git push origin main
```

---

## **STEP 2: Deploy to Vercel**

### **1. Go to Vercel**

- Visit: https://vercel.com/dashboard
- Click **"Add New Project"**

### **2. Import Repository**

- Select: `oregonchem_dashboard` (or your repo name)
- Click **"Import"**

### **3. Configure Project**

- **Framework Preset:** Vite (auto-detected)
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)

### **4. Add Environment Variables**

Click **"Environment Variables"** and add these:

| Variable Name                       | Value                                       |
| ----------------------------------- | ------------------------------------------- |
| `VITE_API_URL`                      | `https://oregonchem-backend.onrender.com`   |
| `VITE_FIREBASE_API_KEY`             | `AIzaSyDDPGR2sp9iThMLH-ziE-02OFh0mEjL7Z8`   |
| `VITE_FIREBASE_AUTH_DOMAIN`         | `oregonchem-pe.firebaseapp.com`             |
| `VITE_FIREBASE_PROJECT_ID`          | `oregonchem-pe`                             |
| `VITE_GOOGLE_CLOUD_STORAGE_BUCKET`  | `oregonchem-pe.appspot.com`                 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `155514741393`                              |
| `VITE_FIREBASE_APP_ID`              | `1:155514741393:web:8b5b5df892bbab8e9f1530` |

### **5. Deploy**

- Click **"Deploy"**
- Wait 2-3 minutes for build to complete
- You'll get a URL like: `oregonchem-dashboard.vercel.app`

---

## **STEP 3: Add Custom Domain (Optional)**

If you want a custom domain like `dashboard.quimicaindustrial.pe`:

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `dashboard.quimicaindustrial.pe`
4. Add DNS records to punto.pe (similar to frontend)

---

## **STEP 4: Test Dashboard**

### **Visit Your Dashboard**

- URL: `https://oregonchem-dashboard.vercel.app` (or your custom domain)

### **Test Features**

- [ ] Dashboard loads
- [ ] Can view products
- [ ] Can view categories
- [ ] Can view banners
- [ ] Can upload banner images to Firebase Storage
- [ ] Can create/edit banners
- [ ] Banner images save correctly

---

## **🔧 TROUBLESHOOTING**

### **Build Fails**

- Check Vercel build logs
- Verify all environment variables are set
- Make sure `package.json` has correct build script

### **API Calls Fail**

- Verify `VITE_API_URL` is set correctly
- Check Render backend is running
- Check browser console for CORS errors

### **Firebase Upload Fails**

- Verify all Firebase environment variables are set
- Check Firebase Storage rules
- Check browser console for errors

---

## **📝 NOTES**

### **Environment Variables**

- All `VITE_*` variables are embedded at build time
- If you change them, you must redeploy
- They're safe to expose (they're public in the browser anyway)

### **Security**

- Dashboard should have authentication (not implemented yet)
- Firebase Storage rules should restrict uploads
- Consider adding password protection via Vercel

### **Local Development**

To switch back to local backend for development:

```env
VITE_API_URL=http://localhost:5001
```

Then restart: `npm start`

---

## **✅ DEPLOYMENT CHECKLIST**

- [ ] `.env` updated to production backend
- [ ] Code committed and pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Dashboard loads correctly
- [ ] Can upload banner images
- [ ] Can create/edit banners
- [ ] Firebase Storage working

---

## **🎉 DONE!**

Your dashboard is now live and can manage:

- ✅ Products
- ✅ Categories
- ✅ Banners (with Firebase Storage upload)
- ✅ Presentations

**Dashboard URL:** `https://oregonchem-dashboard.vercel.app`

---

**Last Updated:** December 10, 2024  
**Status:** Ready to Deploy ✅
