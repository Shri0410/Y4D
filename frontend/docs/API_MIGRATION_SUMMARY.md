# API Migration Summary

## ✅ Completed: Phase 1 - API Organization

### New Structure Created

```
frontend/src/
├── api/
│   ├── client/
│   │   ├── axiosClient.js          ✅ Created
│   │   ├── requestInterceptor.js   ✅ Created
│   │   └── responseInterceptor.js  ✅ Created
│   ├── services/
│   │   ├── banners.service.js      ✅ Created
│   │   ├── careers.service.js      ✅ Created
│   │   ├── media.service.js        ✅ Created
│   │   ├── impact.service.js       ✅ Created
│   │   ├── accreditations.service.js ✅ Created
│   │   └── index.js                ✅ Created
│   └── endpoints/
│       └── routes.js                ✅ Created
├── hooks/
│   ├── useApi.js                   ✅ Created
│   └── useLoadingState.js          ✅ Created
└── utils/
    └── api/
        └── responseHandler.js      ✅ Created
```

## 📝 How to Use the New API Structure

### 1. Using Services in Components

**Before:**
```javascript
import { getBanners } from '../services/api.jsx';

const fetchBanners = async () => {
  const banners = await getBanners('home', 'hero');
};
```

**After:**
```javascript
import { bannerService } from '../api/services/banners.service';

const fetchBanners = async () => {
  const banners = await bannerService.getBanners('home', 'hero');
};
```

### 2. Using the useApi Hook

**Before:**
```javascript
const [banners, setBanners] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getBanners('home', 'hero');
      setBanners(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchBanners();
}, []);
```

**After:**
```javascript
import { useApi } from '../hooks/useApi';
import { bannerService } from '../api/services/banners.service';

const { data: banners, loading, error, refetch } = useApi(
  () => bannerService.getBanners('home', 'hero'),
  []
);
```

### 3. Using Endpoint Constants

**Before:**
```javascript
const url = `/banners/page/${page}`;
```

**After:**
```javascript
import { API_ROUTES } from '../api/endpoints/routes';

const url = API_ROUTES.BANNERS.BY_PAGE(page);
```

## 🔄 Migration Steps for Existing Code

### Step 1: Update Imports

Replace old imports:
```javascript
// OLD
import { getBanners, getCareers } from '../services/api.jsx';
import api from '../services/api.jsx';
```

With new imports:
```javascript
// NEW
import { bannerService, careersService } from '../api/services';
import apiClient from '../api/client/axiosClient';
```

### Step 2: Update Function Calls

Replace old function calls:
```javascript
// OLD
const banners = await getBanners('home', 'hero');
const careers = await getCareers();
```

With new service calls:
```javascript
// NEW
const banners = await bannerService.getBanners('home', 'hero');
const careers = await careersService.getActiveCareers();
```

### Step 3: Use Hooks for Data Fetching

Replace manual state management:
```javascript
// OLD
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getData();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

With the useApi hook:
```javascript
// NEW
const { data, loading, error, refetch } = useApi(
  () => dataService.getData(),
  []
);
```

## 📋 Available Services

### Banner Service
- `bannerService.getBanners(page, section)`
- `bannerService.getAllBanners(filters)`
- `bannerService.getBannerById(id)`
- `bannerService.getPagesList()`
- `bannerService.createBanner(formData)`
- `bannerService.updateBanner(id, formData)`
- `bannerService.deleteBanner(id)`

### Careers Service
- `careersService.getActiveCareers()`
- `careersService.getCareerById(id)`
- `careersService.applyForJob(formData)`

### Media Service
- `mediaService.getPublishedMedia(type)`
- `mediaService.getMediaById(type, id)`
- `mediaService.getMediaByType(type)`

### Impact Service
- `impactService.getImpactData()`
- `impactService.getManagement()`
- `impactService.getMentors()`
- `impactService.getReports()`

### Accreditations Service
- `accreditationsService.getAccreditations()`

## 🎯 Next Steps

1. **Update existing components** to use new services
2. **Create remaining services** (auth, payment, users, ourwork)
3. **Migrate pages** to use new API structure
4. **Update old services/api.jsx** to re-export from new structure (for backward compatibility)

## 🔗 Backward Compatibility

The old `services/api.jsx` file can be updated to re-export from the new structure:

```javascript
// services/api.jsx (updated for backward compatibility)
export { bannerService as getBanners, getAllBanners } from '../api/services/banners.service';
export { careersService as getCareers, applyForJob } from '../api/services/careers.service';
// ... etc
```

This allows gradual migration without breaking existing code.

