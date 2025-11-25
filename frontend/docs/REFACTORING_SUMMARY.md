# Frontend API Configuration Refactoring Summary

## ✅ Completed

### 1. Centralized API Configuration
- Created `src/config/api.js` with centralized API configuration
- Exports `API_BASE`, `UPLOADS_BASE`, `SERVER_BASE`
- Uses environment variables: `VITE_API_BASE_URL` and `VITE_UPLOADS_BASE_URL`

### 2. Updated Files

#### Services & Utils
- ✅ `src/services/api.jsx` - Updated with axios interceptors for auth tokens
- ✅ `src/utils/permissions.jsx` - Updated to use centralized config

#### Hooks
- ✅ `src/hooks/useBanners.js` - Updated to use centralized config

#### Components (12 files)
- ✅ `src/component/Dashboard.jsx`
- ✅ `src/component/UserManagement.jsx`
- ✅ `src/component/BannerManagement.jsx`
- ✅ `src/component/RegistrationModal.jsx`
- ✅ `src/component/PasswordResetModal.jsx`
- ✅ `src/component/PublicRegistrationForm.jsx`
- ✅ `src/component/OurWorkManager.jsx`
- ✅ `src/component/OurWorkManagement.jsx`
- ✅ `src/component/MediaManager.jsx`
- ✅ `src/component/ImpactDataEditor.jsx`
- ✅ `src/component/AccreditationManagement.jsx`
- ✅ `src/component/RegistrationRequests.jsx`
- ✅ `src/component/LoginPage.jsx`
- ✅ `src/component/AdminLogin.jsx`

#### Pages (17 files)
- ✅ `src/pages/BlogDetails.jsx`
- ✅ `src/pages/Blogs.jsx`
- ✅ `src/pages/Stories.jsx`
- ✅ `src/pages/QualityEducation.jsx`
- ✅ `src/pages/QualityEducationDetail.jsx`
- ✅ `src/pages/Livelihood.jsx`
- ✅ `src/pages/LivelihoodDetail.jsx`
- ✅ `src/pages/Healthcare.jsx`
- ✅ `src/pages/HealthcareDetail.jsx`
- ✅ `src/pages/EnvironmentSustainability.jsx`
- ✅ `src/pages/EnvironmentSustainabilityDetail.jsx`
- ✅ `src/pages/IDP.jsx`
- ✅ `src/pages/IDPDetail.jsx`
- ✅ `src/pages/Events.jsx`
- ✅ `src/pages/Documentaries.jsx`
- ✅ `src/pages/NewsLetters.jsx`
- ✅ `src/pages/LegalReports.jsx`
- ✅ `src/pages/Home.jsx` (partially - banner URLs need update)
- ✅ `src/pages/OurTeam.jsx` (partially - banner URLs need update)
- ✅ `src/pages/About.jsx` (partially - banner URLs need update)
- ✅ `src/pages/DonateNow.jsx` (partially - banner URLs need update)

### 3. Features Added
- ✅ Axios request interceptor for automatic token injection
- ✅ Axios response interceptor for automatic logout on 401
- ✅ Console.log statements disabled in production (using `import.meta.env.DEV`)

## ⚠️ Remaining Work

### Banner Image URLs
Some pages still have hardcoded banner URLs that need to be updated:
- `src/pages/LegalReports.jsx` - Banner URLs
- `src/pages/NewsLetters.jsx` - Banner URLs
- `src/pages/Documentaries.jsx` - Banner URLs
- `src/pages/Events.jsx` - Banner URLs
- `src/pages/IDP.jsx` - Banner URLs
- `src/pages/EnvironmentSustainability.jsx` - Banner URLs
- `src/pages/Healthcare.jsx` - Banner URLs
- `src/pages/Livelihood.jsx` - Banner URLs
- `src/pages/QualityEducation.jsx` - Banner URLs
- `src/pages/Stories.jsx` - Banner URLs
- `src/pages/Home.jsx` - One accreditation URL
- `src/pages/OurTeam.jsx` - Banner URLs

**Pattern to replace:**
```javascript
// Old
src={`https://y4dorg-backend.onrender.com/uploads/banners/${banner.media}`}

// New
src={`${UPLOADS_BASE}/banners/${banner.media}`}
```

## 📝 Environment Variables

### Required Files (Create Manually)
1. **`.env.development`** (for local development):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_UPLOADS_BASE_URL=http://localhost:5000/api/uploads
   ```

2. **`.env.production`** (for QA/production):
   ```env
   VITE_API_BASE_URL=https://y4d.ngo/dev/api
   VITE_UPLOADS_BASE_URL=https://y4d.ngo/dev/api/uploads
   ```

## 🎯 Next Steps

1. Update remaining banner URLs in page files
2. Create `.env.development` and `.env.production` files
3. Test locally with `npm run dev`
4. Test build with `npm run build`
5. Commit changes to `frontend-refactoring` branch

