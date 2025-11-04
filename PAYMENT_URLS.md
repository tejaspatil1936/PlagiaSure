# Dynamic Payment URL Configuration

## Overview

The payment system now uses dynamic URL generation instead of hardcoded URLs. This makes the application environment-aware and easier to deploy across different environments.

## How It Works

### Backend Configuration

1. **Environment Variable**: The `FRONTEND_URL` environment variable determines the base URL for all payment redirects
2. **Dynamic Generation**: Payment URLs are generated using the `getPaymentUrls()` function in `backend/services/razorpayService.js`
3. **API Endpoint**: The `/api/payments/config` endpoint provides payment configuration to the frontend

### Frontend Integration

1. **Utility Functions**: The `frontend/src/utils/paymentConfig.js` file provides utilities to fetch and use dynamic URLs
2. **Automatic Fallback**: If the API call fails, the system falls back to using the current domain
3. **Caching**: Payment configuration is cached to avoid repeated API calls

## Environment Configuration

### Development
```env
FRONTEND_URL=http://localhost:5173
```

### Production
```env
FRONTEND_URL=https://yourdomain.com
```

### Staging
```env
FRONTEND_URL=https://staging.yourdomain.com
```

## Generated URLs

Based on the `FRONTEND_URL`, the system automatically generates:

- **Success URL**: `${FRONTEND_URL}/payment/success`
- **Cancel URL**: `${FRONTEND_URL}/payment/cancel`
- **Failure URL**: `${FRONTEND_URL}/payment/failure`

## API Endpoints

### GET /api/payments/config

Returns the complete payment configuration including dynamic URLs:

```json
{
  "success": true,
  "config": {
    "currency": "INR",
    "keyId": "rzp_test_...",
    "urls": {
      "successUrl": "http://localhost:5173/payment/success",
      "cancelUrl": "http://localhost:5173/payment/cancel",
      "failureUrl": "http://localhost:5173/payment/failure"
    },
    "plans": {
      "basic_monthly": { ... },
      "pro_monthly": { ... }
    }
  }
}
```

## Frontend Usage

```javascript
import { createPaymentUrl, getPaymentUrls } from '../utils/paymentConfig';

// Create a URL with query parameters
const successUrl = await createPaymentUrl('success', {
  order_id: 'order_123',
  payment_id: 'pay_456'
});

// Get all payment URLs
const urls = await getPaymentUrls();
console.log(urls.successUrl); // Dynamic success URL
```

## Benefits

1. **Environment Agnostic**: Works across development, staging, and production
2. **No Hardcoding**: URLs are generated dynamically based on environment
3. **Easy Deployment**: Just change the `FRONTEND_URL` environment variable
4. **Fallback Support**: Graceful degradation if API is unavailable
5. **Caching**: Efficient with built-in configuration caching

## Migration Notes

- Removed hardcoded URLs from `.env` files
- Updated PaymentModal to use dynamic URL generation
- Added comprehensive error handling and fallbacks
- Maintained backward compatibility with existing payment flows