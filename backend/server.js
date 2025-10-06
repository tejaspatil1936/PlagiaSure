import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Import routes
import authRoutes from './routes/auth.js';
import assignmentRoutes from './routes/assignments.js';
import reportRoutes from './routes/reports.js';
import billingRoutes from './routes/billing.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Plagiarism AI Checker Backend'
  });
});

// Setup instructions endpoint
app.get('/setup', (req, res) => {
  res.send(`
    <html>
      <head><title>PlagiaSure Setup</title></head>
      <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
        <h1>🚀 PlagiaSure Database Setup Required</h1>
        <p>To complete the setup, please follow these steps:</p>
        <ol>
          <li><strong>Go to your Supabase Dashboard</strong><br>
              Visit <a href="https://supabase.com/dashboard" target="_blank">https://supabase.com/dashboard</a></li>
          <li><strong>Navigate to SQL Editor</strong><br>
              Click on "SQL Editor" in the left sidebar</li>
          <li><strong>Copy the Setup Script</strong><br>
              Copy the content from <code>backend/scripts/setup-database.sql</code></li>
          <li><strong>Execute the Script</strong><br>
              Paste and run the script in the SQL Editor</li>
          <li><strong>Verify Setup</strong><br>
              Visit <a href="/db-check" target="_blank">/db-check</a> to verify the setup</li>
        </ol>
        <h2>Quick Links:</h2>
        <ul>
          <li><a href="/health">Health Check</a></li>
          <li><a href="/db-check">Database Check</a></li>
        </ul>
        <p><em>Once setup is complete, you can use the frontend application!</em></p>
      </body>
    </html>
  `);
});

// Database check endpoint
app.get('/db-check', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return res.status(500).json({ 
        status: 'Database Setup Required', 
        error: 'Database tables not found',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy content from backend/scripts/setup-database.sql',
          '4. Execute the script',
          '5. Refresh this page'
        ]
      });
    }
    
    if (error) {
      return res.status(500).json({ 
        status: 'Database Error', 
        error: error.message,
        code: error.code
      });
    }
    
    res.json({ 
      status: 'Database OK', 
      message: 'Database tables are accessible'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Database Connection Error', 
      error: error.message 
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/billing', billingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;