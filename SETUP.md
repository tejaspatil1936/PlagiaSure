# 🚀 Setup Instructions - Plagiarism + AI Content Checker

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Gemini API key (free tier available)
- Git installed

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the `.env` file and update with your credentials:

```bash
# Already configured in backend/.env
SUPABASE_URL=https://gfvnmrcxnzauxkiqjmbq.supabase.co
SUPABASE_ANON_KEY=[YOUR_KEY_IS_ALREADY_SET]
GEMINI_API_KEY=[YOUR_KEY_IS_ALREADY_SET]
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the setup script:

```sql
-- Copy and paste the content from backend/scripts/setup-database.sql
```

### 4. Storage Setup

1. In Supabase dashboard, go to **Storage**
2. Verify the "Data" bucket exists
3. Go to **Storage > Policies**
4. Run the storage policies script:

```sql
-- Copy and paste the content from backend/scripts/setup-storage-policies.sql
```

### 5. Create Admin User

1. First, sign up through the API or frontend
2. Then run this SQL in Supabase to make yourself admin:

```sql
UPDATE users 
SET role = 'admin', is_admin = true 
WHERE email = 'your-email@example.com';
```

### 6. Start Backend Server

```bash
npm run dev
```

Server will start on: http://localhost:5000

## 🧪 Testing

### Test API Endpoints

```bash
node backend/scripts/test-api.js
```

### Manual Testing

1. **Health Check**: GET http://localhost:5000/health
2. **Sign Up**: POST http://localhost:5000/api/auth/signup
3. **Login**: POST http://localhost:5000/api/auth/login
4. **Request Subscription**: POST http://localhost:5000/api/billing/request-subscription

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - User logout

### Assignments
- `POST /api/assignments/upload` - Upload assignment file
- `GET /api/assignments/:id` - Get assignment by ID
- `GET /api/assignments` - Get all user assignments
- `DELETE /api/assignments/:id` - Delete assignment

### Reports
- `POST /api/reports/generate` - Generate AI/plagiarism report
- `GET /api/reports/:id` - Get report by ID
- `GET /api/reports` - Get all user reports

### Billing (Manual Approval)
- `GET /api/billing/plans` - Get available plans
- `POST /api/billing/request-subscription` - Request subscription
- `GET /api/billing/status` - Get subscription status
- `POST /api/billing/cancel-request` - Cancel pending request

### Admin Routes
- `GET /api/billing/admin/requests` - View all subscription requests
- `POST /api/billing/admin/approve/:id` - Approve subscription
- `POST /api/billing/admin/reject/:id` - Reject subscription

## 🔑 Features

### ✅ AI Content Detection
- Uses Google Gemini AI
- Sentence-level highlighting
- Overall probability scoring
- Fallback mock detection

### ✅ Plagiarism Detection (100% Free)
- DuckDuckGo search integration
- Wikipedia content matching
- GitHub code detection
- Reddit/Stack Overflow checking
- Academic database searches
- Pattern-based analysis

### ✅ Subscription Management
- Manual admin approval system
- Usage tracking and limits
- Multiple plan tiers
- Admin dashboard capabilities

### ✅ File Processing
- PDF, DOCX, TXT support
- Text extraction
- Secure file storage
- User-specific folders

## 🚨 Troubleshooting

### Common Issues

1. **Port 5000 in use**
   ```bash
   # Change PORT in .env file
   PORT=5001
   ```

2. **Database connection issues**
   - Verify Supabase URL and key
   - Check if database setup script was run
   - Ensure RLS policies are enabled

3. **File upload issues**
   - Verify storage bucket "Data" exists
   - Check storage policies are applied
   - Ensure user is authenticated

4. **API key issues**
   - Gemini API key should start with "AIza"
   - Hugging Face key should start with "hf_"
   - Keys should be active and have quota

### Debug Mode

Set environment variable for detailed logging:
```bash
NODE_ENV=development
```

## 📈 Next Steps

1. **Frontend Development**: Create React frontend
2. **Admin Dashboard**: Build admin interface
3. **Email Notifications**: Add email alerts
4. **Advanced Analytics**: Usage statistics
5. **Mobile App**: React Native version

## 🆘 Support

If you encounter issues:
1. Check the console logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check Supabase dashboard for errors

## 🎯 Demo Ready

The system is now ready for demonstration with:
- Working AI detection
- Free plagiarism checking
- Admin approval workflow
- File upload capabilities
- Realistic mock data