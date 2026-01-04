# Remaining Migrations 📋

## Components Still Using Direct Axios Calls

### Admin Components (9 files)

1. **BoardTrustees.jsx** ⚠️
   - Uses: `axios.get()`, `axios.put()`, `axios.post()`, `axios.delete()`
   - Should use: `impactService` (already has methods: `getBoardTrustees`, `createBoardTrustee`, `updateBoardTrustee`, `deleteBoardTrustee`)

2. **RegistrationRequests.jsx** ⚠️
   - Uses: `axios.get()` for requests and stats, `axios.post()` for approval/rejection
   - Needs: New service method or extend existing service

3. **PublicRegistrationForm.jsx** ⚠️
   - Uses: `axios.post()` for registration request
   - Needs: New service method or extend existing service

4. **OurWorkManager.jsx** ⚠️
   - Uses: `axios.get()`, `axios.put()`, `axios.post()`, `axios.delete()`, `axios.patch()`
   - Should use: `ourworkService` (already has all methods)

5. **ImpactDataEditor.jsx** ⚠️
   - Uses: `axios.get()`, `axios.put()` for impact data
   - Should use: `impactService` (already has `getImpactData()`, needs `updateImpactData()`)

6. **AccreditationManagement.jsx** ⚠️
   - Uses: `axios.get()`, `axios.put()`, `axios.post()`, `axios.delete()`, `axios.patch()`
   - Should use: `accreditationsService` (needs CRUD methods added)

7. **PasswordResetPage.jsx** ⚠️
   - Uses: `axios.post()` for password reset requests
   - Should use: `authService` (already has `resetPassword()`)

8. **PasswordResetModal.jsx** ⚠️
   - Uses: `axios.post()` for password reset requests
   - Should use: `authService` (already has `resetPassword()`)

9. **RegistrationModal.jsx** ⚠️
   - Uses: `axios.post()` for registration request
   - Needs: New service method or extend existing service

### Public Pages (12 files)

1. **LegalReports.jsx** ⚠️
   - Uses: `axios.get()` for reports
   - Should use: `impactService.getReports()` or `impactService.getAllReports()`

2. **QualityEducation.jsx** ⚠️
   - Uses: `axios.get()` for our-work items
   - Should use: `ourworkService.getItemsByCategory("quality-education")`

3. **Livelihood.jsx** ⚠️
   - Uses: `axios.get()` for our-work items
   - Should use: `ourworkService.getItemsByCategory("livelihood")`

4. **IDP.jsx** ⚠️
   - Uses: `axios.get()` for our-work items
   - Should use: `ourworkService.getItemsByCategory("idp")`

5. **Healthcare.jsx** ⚠️
   - Uses: `axios.get()` for our-work items
   - Should use: `ourworkService.getItemsByCategory("healthcare")`

6. **EnvironmentSustainability.jsx** ⚠️
   - Uses: `axios.get()` for our-work items
   - Should use: `ourworkService.getItemsByCategory("environmental-sustainability")`

7. **QualityEducationDetail.jsx** ⚠️
   - Uses: `axios.get()` for single item
   - Should use: `ourworkService.getItemById("quality-education", id)`

8. **HealthcareDetail.jsx** ⚠️
   - Uses: `axios.get()` for single item
   - Should use: `ourworkService.getItemById("healthcare", id)`

9. **IDPDetail.jsx** ⚠️
   - Uses: `axios.get()` for single item
   - Should use: `ourworkService.getItemById("idp", id)`

10. **LivelihoodDetail.jsx** ⚠️
    - Uses: `axios.get()` for single item
    - Should use: `ourworkService.getItemById("livelihood", id)`

11. **EnvironmentSustainabilityDetail.jsx** ⚠️
    - Uses: `axios.get()` for single item
    - Should use: `ourworkService.getItemById("environmental-sustainability", id)`

12. **About.jsx** ✅ (Uses `getBanners` from services/api.jsx - already migrated)
13. **OurWork.jsx** ✅ (Uses `getReports` from services/api.jsx - already migrated)
14. **ReachPresence.jsx** ⚠️ (Uses old services/api.jsx - needs check)

### Utils (1 file)

1. **permissions.jsx** ⚠️
   - Uses: `axios.get()` for user permissions
   - Should use: `usersService.getUserPermissions()` (already exists)

## Services That Need Enhancement

### accreditationsService
- ❌ Missing: `createAccreditation()`
- ❌ Missing: `updateAccreditation()`
- ❌ Missing: `deleteAccreditation()`
- ❌ Missing: `toggleAccreditationStatus()`

### impactService
- ❌ Missing: `updateImpactData()`

### authService
- ✅ Has: `resetPassword()` (can be used for password reset pages)

### Registration Service (New)
- ❌ Needs: New service for registration requests
  - `createRegistrationRequest()`
  - `getRegistrationRequests()` (admin)
  - `getRegistrationStats()` (admin)
  - `approveRegistrationRequest()`
  - `rejectRegistrationRequest()`

## Summary

### Total Remaining: ~22 files
- **Admin Components**: 9 files
- **Public Pages**: 12 files (2 already using migrated services)
- **Utils**: 1 file

### Priority Order

1. **High Priority** (Core Admin Features):
   - AccreditationManagement.jsx
   - ImpactDataEditor.jsx
   - OurWorkManager.jsx
   - BoardTrustees.jsx

2. **Medium Priority** (Public Pages):
   - All "Our Work" category pages (QualityEducation, Healthcare, etc.)
   - LegalReports.jsx

3. **Low Priority** (Utility/Auth):
   - Password reset pages (can use existing authService)
   - Registration components (need new service)
   - permissions.jsx

## Next Steps

1. **Enhance Services**:
   - Add CRUD methods to `accreditationsService`
   - Add `updateImpactData()` to `impactService`
   - Create new `registrationService` for registration requests

2. **Migrate Components**:
   - Start with high-priority admin components
   - Then migrate public pages
   - Finally migrate utility components

3. **Clean Up**:
   - Remove old `services/api.jsx` once all migrations complete
   - Update any remaining imports

