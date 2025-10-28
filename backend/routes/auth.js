import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { supabase, supabaseAdmin } from '../server.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// Sign up endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, schoolName, role = 'teacher' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          school_name: schoolName,
          role: role
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in database
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            school_name: schoolName,
            role: role,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    res.status(201).json({
      message: 'User created successfully',
      user: authData.user,
      session: authData.session
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session,
      profile: profile
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint
router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      user: user,
      profile: profile
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user school name endpoint
router.post('/update-school', async (req, res) => {
  try {
    const { schoolName } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Decode the custom token to get user ID
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      const userId = tokenData.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Update user's school name
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ school_name: schoolName || '' })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ School name update error:', updateError);
        return res.status(500).json({ error: 'Failed to update school information' });
      }

      console.log('✅ School name updated for user:', userId);

      res.json({
        message: 'School information updated successfully',
        user: updatedUser
      });

    } catch (tokenError) {
      console.error('❌ Token decode error:', tokenError);
      return res.status(401).json({ error: 'Invalid token format' });
    }

  } catch (error) {
    console.error('❌ Update school error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth login endpoint
router.post('/google', async (req, res) => {
  try {
    console.log('🔍 Google OAuth request received');
    const { credential, schoolName } = req.body;

    if (!credential) {
      console.error('❌ No credential provided');
      return res.status(400).json({ error: 'Google credential is required' });
    }

    console.log('🔐 Verifying Google token...');
    
    // Check if Google Client ID is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('❌ GOOGLE_CLIENT_ID not configured');
      return res.status(500).json({ error: 'Google OAuth not configured on server' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    console.log('✅ Google token verified for:', email);

    if (!email) {
      console.error('❌ No email in Google payload');
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Use supabaseAdmin to bypass RLS for user operations

    // Check if user already exists
    console.log('🔍 Checking if user exists:', email);
    let { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let user;
    let isNewUser = false;

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create new user
      console.log('👤 Creating new user for:', email);
      isNewUser = true;
      
      try {
        // First create auth user in Supabase Auth using admin client
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: crypto.randomUUID(), // Random password for Google users
          email_confirm: true, // Auto-confirm email for Google users
          user_metadata: {
            name,
            picture,
            google_id: googleId,
            school_name: schoolName || '',
            role: 'teacher'
          }
        });

        if (authError) {
          console.error('❌ Auth user creation error:', authError);
          
          // Fallback: Try to create user profile without auth user (simplified approach)
          console.log('🔄 Trying simplified user creation...');
          const userId = crypto.randomUUID();
          
          const { data: fallbackProfileData, error: fallbackProfileError } = await supabaseAdmin
            .from('users')
            .insert([
              {
                id: userId,
                email,
                name,
                picture,
                google_id: googleId,
                school_name: schoolName || '',
                role: 'teacher',
                created_at: new Date().toISOString()
              }
            ])
            .select()
            .single();

          if (fallbackProfileError) {
            console.error('❌ Fallback profile creation error:', fallbackProfileError);
            return res.status(500).json({ error: 'Failed to create user account' });
          }

          user = fallbackProfileData;
          console.log('✅ Fallback user created:', user.id);
        } else {
          console.log('✅ Auth user created:', authData.user.id);
          
          // Now create user profile with the auth user ID
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from('users')
            .insert([
              {
                id: authData.user.id, // Use the auth user ID
                email,
                name,
                picture,
                google_id: googleId,
                school_name: schoolName || '',
                role: 'teacher',
                created_at: new Date().toISOString()
              }
            ])
            .select()
            .single();

          if (profileError) {
            // Check if it's a duplicate key error (user profile already exists)
            if (profileError.code === '23505' && profileError.message.includes('users_pkey')) {
              console.log('⚠️ User profile already exists, fetching existing profile...');
              
              // Fetch the existing user profile
              const { data: existingProfile, error: fetchError } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();

              if (fetchError) {
                console.error('❌ Failed to fetch existing profile:', fetchError);
                return res.status(500).json({ error: 'Failed to retrieve user profile' });
              }

              // Update the existing profile with Google info
              const { data: updatedProfile, error: updateError } = await supabaseAdmin
                .from('users')
                .update({
                  name: name || existingProfile.name,
                  picture: picture || existingProfile.picture,
                  google_id: googleId,
                  school_name: schoolName || existingProfile.school_name
                })
                .eq('id', authData.user.id)
                .select()
                .single();

              if (updateError) {
                console.error('❌ Failed to update existing profile:', updateError);
                return res.status(500).json({ error: 'Failed to update user profile' });
              }

              user = updatedProfile;
              console.log('✅ Existing user profile updated:', user.id);
            } else {
              console.error('❌ Profile creation error:', profileError);
              return res.status(500).json({ error: 'Failed to create user profile' });
            }
          } else {
            user = profileData;
            console.log('✅ New user created:', user.id);
          }
        }
      } catch (createError) {
        console.error('❌ User creation failed:', createError);
        return res.status(500).json({ error: 'Failed to create user account' });
      }
    } else if (existingUser) {
      // User exists, update Google info if needed
      console.log('👤 Updating existing user:', email);
      const updateData = {};
      if (!existingUser.google_id) updateData.google_id = googleId;
      if (!existingUser.name && name) updateData.name = name;
      if (!existingUser.picture && picture) updateData.picture = picture;

      if (Object.keys(updateData).length > 0) {
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('⚠️ User update error:', updateError);
        }

        user = updatedUser || existingUser;
      } else {
        user = existingUser;
      }
      console.log('✅ User updated');
    } else {
      console.error('❌ Failed to process user data');
      return res.status(500).json({ error: 'Failed to process user data' });
    }

    // Generate a simple JWT-like token for the response
    const customToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      googleId: googleId,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64');

    console.log('✅ Google OAuth successful for:', email);

    res.json({
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        school_name: user.school_name,
        role: user.role
      },
      token: customToken,
      isNewUser
    });

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Token used too early')) {
      return res.status(400).json({ error: 'Invalid Google token timing' });
    } else if (error.message && error.message.includes('Invalid token')) {
      return res.status(400).json({ error: 'Invalid Google token' });
    } else if (error.message && error.message.includes('Token used too late')) {
      return res.status(400).json({ error: 'Expired Google token' });
    }
    
    res.status(500).json({ 
      error: 'Google authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    const { error } = await supabase.auth.signOut(token);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;