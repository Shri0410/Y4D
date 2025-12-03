# API Routes Testing Guide

## 🧪 Testing Payment, Contact, and Corporate Partnership Routes

This guide helps you test all the newly configured API routes.

## Prerequisites

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Ensure Environment Variables are Set:**
   - `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET` (for payment routes)
   - `HR_EMAIL` and `HR_EMAIL_PASSWORD` (for contact routes)
   - `CORP_MAIL` and `CORP_MAIL_PASSWORD` (for corporate partnership route)

## Automated Testing

Run the test script:

```bash
cd backend
node test-routes.js
```

This will test all routes:
- ✅ Payment - Create Order
- ✅ Payment - Verify Payment
- ✅ Contact - Corporate Partnership
- ✅ Contact - Internship
- ✅ Contact - Volunteer
- ✅ Contact - Enquiry
- ✅ Corporate Partnership (Direct Route)

## Manual Testing with cURL

### 1. Payment - Create Order
```bash
curl -X POST http://localhost:5000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "name": "Test Donor",
    "email": "test@example.com",
    "message": "Test donation"
  }'
```

### 2. Payment - Verify Payment
```bash
curl -X POST http://localhost:5000/api/payment/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_test123",
    "razorpay_order_id": "order_test123",
    "razorpay_signature": "signature_test123"
  }'
```

### 3. Contact - Corporate Partnership
```bash
curl -X POST http://localhost:5000/api/contact/corporate-partnership \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "email": "test@company.com",
    "contact": "1234567890",
    "details": "Partnership inquiry"
  }'
```

### 4. Contact - Internship
```bash
curl -X POST http://localhost:5000/api/contact/internship \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Student",
    "email": "student@example.com",
    "phone": "9876543210",
    "field": "Web Development",
    "message": "Interested in internship"
  }'
```

### 5. Contact - Volunteer
```bash
curl -X POST http://localhost:5000/api/contact/volunteer \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Volunteer",
    "email": "volunteer@example.com",
    "phone": "9876543210",
    "reason": "Want to help the community"
  }'
```

### 6. Contact - Enquiry
```bash
curl -X POST http://localhost:5000/api/contact/enquiry \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "message": "General enquiry"
  }'
```

### 7. Corporate Partnership (Direct Route)
```bash
curl -X POST http://localhost:5000/api/corporate-partnership/corporate-partnership \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Corp",
    "email": "corp@test.com",
    "contact": "1234567890",
    "details": "Partnership details"
  }'
```

## Testing via Swagger UI

1. Start the backend server
2. Open browser: `http://localhost:5000/api-docs`
3. Navigate to:
   - **Payments** section → Test create-order and verify-payment
   - **Contact Forms** section → Test all contact endpoints
   - **Corporate Partnership** section → Test corporate partnership endpoint

## Frontend Testing

### Payment Flow (DonateNow.jsx)
1. Navigate to `/donate-now` page
2. Fill in donation form
3. Click "Donate Now"
4. Should create order and open Razorpay payment gateway

### Contact Forms (Contact.jsx)
1. Navigate to `/contact` page
2. Test each form:
   - Corporate Partnership form
   - Internship form
   - Volunteer form
   - Enquiry form
3. Check browser console for API calls
4. Verify success messages appear

### Corporate Partnership (Corporatepartnership.jsx)
1. Navigate to `/corporate-partnership` page
2. Fill in the form
3. Submit
4. Should see success message

## Expected Responses

### Success Response Format
```json
{
  "success": true,
  "message": "Form submitted successfully"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

## Troubleshooting

### Routes Not Found (404)
- ✅ Check if routes are registered in `routes/index.js`
- ✅ Verify server is running
- ✅ Check API base URL matches route registration

### CORS Errors
- ✅ Check `ALLOWED_ORIGINS` in `.env`
- ✅ Verify frontend origin is in allowed list
- ✅ Check CORS configuration in `server.js`

### Validation Errors (400)
- ✅ Check required fields are provided
- ✅ Verify field formats (email, phone, etc.)
- ✅ Check request body structure

### Email Sending Errors
- ✅ Verify email credentials in `.env`
- ✅ Check SMTP configuration
- ✅ Test email transporter on server startup

## Route Summary

| Route | Method | Endpoint | Status |
|-------|--------|----------|--------|
| Payment - Create Order | POST | `/api/payment/create-order` | ✅ |
| Payment - Verify | POST | `/api/payment/verify-payment` | ✅ |
| Contact - Corporate | POST | `/api/contact/corporate-partnership` | ✅ |
| Contact - Internship | POST | `/api/contact/internship` | ✅ |
| Contact - Volunteer | POST | `/api/contact/volunteer` | ✅ |
| Contact - Enquiry | POST | `/api/contact/enquiry` | ✅ |
| Corporate Partnership | POST | `/api/corporate-partnership/corporate-partnership` | ✅ |

