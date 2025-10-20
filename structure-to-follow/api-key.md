# API Key Management System - Backend Implementation Guide

This document provides complete instructions for implementing the backend API key management system for the Olivia Network application.

## 📋 Table of Contents

1. [Database Schema](#database-schema)
2. [API Endpoints](#api-endpoints)
3. [Server Implementation](#server-implementation)
4. [Security Considerations](#security-considerations)
5. [Testing](#testing)
6. [Frontend Integration](#frontend-integration)

## 🗄️ Database Schema

### Supabase Tables to Create

#### 1. `api_keys` Table

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    last_used_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT api_keys_name_client_unique UNIQUE(client_id, name)
);

-- Create indexes
CREATE INDEX idx_api_keys_client_id ON api_keys(client_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

#### 2. `api_key_usage_logs` Table (Optional - for analytics)

```sql
CREATE TABLE api_key_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    response_status INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_api_key_usage_logs_api_key_id ON api_key_usage_logs(api_key_id);
CREATE INDEX idx_api_key_usage_logs_created_at ON api_key_usage_logs(created_at);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on api_keys table
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy for clients to only see their own API keys
CREATE POLICY "Users can view their own API keys" ON api_keys
    FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Users can insert their own API keys" ON api_keys
    FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update their own API keys" ON api_keys
    FOR UPDATE USING (client_id = auth.uid());

CREATE POLICY "Users can delete their own API keys" ON api_keys
    FOR DELETE USING (client_id = auth.uid());
```

## 🔌 API Endpoints

### Base URL Structure
```
/api/v2/api-keys
```

### Endpoint Specifications

#### 1. GET `/api/v2/api-keys/client/:clientId`
**Description:** Fetch all API keys for a client

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "name": "My API Key",
      "key_prefix": "olv_sk_",
      "is_active": true,
      "permissions": ["read:agents", "write:agents"],
      "expires_at": "2024-12-31T23:59:59Z",
      "last_used_at": "2024-06-27T10:30:00Z",
      "created_at": "2024-06-01T09:00:00Z",
      "updated_at": "2024-06-01T09:00:00Z"
    }
  ]
}
```

#### 2. POST `/api/v2/api-keys/client/:clientId`
**Description:** Generate a new API key

**Request Body:**
```json
{
  "name": "My API Key",
  "permissions": ["read:agents", "write:agents"],
  "expires_at": "2024-12-31T23:59:59Z" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "client_id": "uuid",
    "name": "My API Key",
    "key": "olv_sk_1234567890abcdef1234567890abcdef12345678", // Full key only returned once
    "key_prefix": "olv_sk_",
    "is_active": true,
    "permissions": ["read:agents", "write:agents"],
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-06-27T14:00:00Z",
    "updated_at": "2024-06-27T14:00:00Z"
  }
}
```

#### 3. PUT `/api/v2/api-keys/:keyId`
**Description:** Update an API key

**Request Body:**
```json
{
  "name": "Updated API Key Name",
  "is_active": false,
  "permissions": ["read:agents"],
  "expires_at": "2025-01-31T23:59:59Z"
}
```

#### 4. DELETE `/api/v2/api-keys/:keyId`
**Description:** Delete an API key

**Response:**
```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

#### 5. POST `/api/v2/api-keys/:keyId/regenerate`
**Description:** Regenerate an existing API key

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "key": "olv_sk_newkey1234567890abcdef1234567890abcdef", // New full key
    "key_prefix": "olv_sk_",
    "updated_at": "2024-06-27T14:30:00Z"
  }
}
```

## 🖥️ Server Implementation

### Node.js/Express Implementation Example

#### 1. API Key Generation Utility

```javascript
// utils/apiKeyGenerator.js
const crypto = require('crypto');

class ApiKeyGenerator {
  static generateApiKey() {
    const prefix = 'olv_sk_';
    const randomBytes = crypto.randomBytes(32);
    const key = prefix + randomBytes.toString('hex');
    return {
      key,
      prefix,
      hash: this.hashApiKey(key)
    };
  }

  static hashApiKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  static validateApiKey(providedKey, storedHash) {
    const hashedProvided = this.hashApiKey(providedKey);
    return crypto.timingSafeEqual(
      Buffer.from(hashedProvided, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  }
}

module.exports = ApiKeyGenerator;
```

#### 2. API Key Controller

```javascript
// controllers/apiKeyController.js
const { supabase } = require('../config/supabase');
const ApiKeyGenerator = require('../utils/apiKeyGenerator');

class ApiKeyController {
  // GET /api/v2/api-keys/client/:clientId
  static async getAllApiKeys(req, res) {
    try {
      const { clientId } = req.params;
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, client_id, name, key_prefix, is_active, permissions, expires_at, last_used_at, created_at, updated_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: data || []
      });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch API keys'
      });
    }
  }

  // POST /api/v2/api-keys/client/:clientId
  static async createApiKey(req, res) {
    try {
      const { clientId } = req.params;
      const { name, permissions, expires_at } = req.body;

      // Validate input
      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          error: 'Name and permissions are required'
        });
      }

      // Generate API key
      const { key, prefix, hash } = ApiKeyGenerator.generateApiKey();

      // Insert into database
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          client_id: clientId,
          name,
          key_hash: hash,
          key_prefix: prefix,
          permissions,
          expires_at: expires_at || null
        })
        .select()
        .single();

      if (error) throw error;

      // Return the full key only once
      res.json({
        success: true,
        data: {
          ...data,
          key // Include the actual key in response
        }
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create API key'
      });
    }
  }

  // PUT /api/v2/api-keys/:keyId
  static async updateApiKey(req, res) {
    try {
      const { keyId } = req.params;
      const updates = req.body;

      const { data, error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', keyId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error updating API key:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update API key'
      });
    }
  }

  // DELETE /api/v2/api-keys/:keyId
  static async deleteApiKey(req, res) {
    try {
      const { keyId } = req.params;

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      res.json({
        success: true,
        message: 'API key deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete API key'
      });
    }
  }

  // POST /api/v2/api-keys/:keyId/regenerate
  static async regenerateApiKey(req, res) {
    try {
      const { keyId } = req.params;

      // Generate new API key
      const { key, prefix, hash } = ApiKeyGenerator.generateApiKey();

      const { data, error } = await supabase
        .from('api_keys')
        .update({
          key_hash: hash,
          key_prefix: prefix,
          updated_at: new Date().toISOString()
        })
        .eq('id', keyId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: {
          ...data,
          key // Include the new key in response
        }
      });
    } catch (error) {
      console.error('Error regenerating API key:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to regenerate API key'
      });
    }
  }
}

module.exports = ApiKeyController;
```

#### 3. API Key Authentication Middleware

```javascript
// middleware/apiKeyAuth.js
const { supabase } = require('../config/supabase');
const ApiKeyGenerator = require('../utils/apiKeyGenerator');

const apiKeyAuth = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API key required'
        });
      }

      // Hash the provided key
      const hashedKey = ApiKeyGenerator.hashApiKey(apiKey);

      // Find the API key in database
      const { data: keyData, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', hashedKey)
        .eq('is_active', true)
        .single();

      if (error || !keyData) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key'
        });
      }

      // Check if key is expired
      if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
        return res.status(401).json({
          success: false,
          error: 'API key expired'
        });
      }

      // Check permissions
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(permission => 
          keyData.permissions.includes(permission) || keyData.permissions.includes('admin')
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions'
          });
        }
      }

      // Update last_used_at
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyData.id);

      // Add key data to request
      req.apiKey = keyData;
      req.clientId = keyData.client_id;

      next();
    } catch (error) {
      console.error('API key authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  };
};

module.exports = apiKeyAuth;
```

#### 4. Routes Setup

```javascript
// routes/apiKeys.js
const express = require('express');
const ApiKeyController = require('../controllers/apiKeyController');
const { authenticateUser } = require('../middleware/auth'); // Your existing auth middleware

const router = express.Router();

// All routes require user authentication
router.use(authenticateUser);

router.get('/client/:clientId', ApiKeyController.getAllApiKeys);
router.post('/client/:clientId', ApiKeyController.createApiKey);
router.put('/:keyId', ApiKeyController.updateApiKey);
router.delete('/:keyId', ApiKeyController.deleteApiKey);
router.post('/:keyId/regenerate', ApiKeyController.regenerateApiKey);

module.exports = router;
```

#### 5. Usage Example in Protected Routes

```javascript
// routes/agents.js
const express = require('express');
const apiKeyAuth = require('../middleware/apiKeyAuth');

const router = express.Router();

// Protect route with API key authentication
router.get('/agents', apiKeyAuth(['read:agents']), (req, res) => {
  // Route logic here
  // req.clientId contains the client ID from the API key
  res.json({ message: 'Agents data', clientId: req.clientId });
});

router.post('/agents', apiKeyAuth(['write:agents']), (req, res) => {
  // Route logic here
});

module.exports = router;
```

## 🔒 Security Considerations

### 1. API Key Storage
- **Never store plain text keys** - Always hash using SHA-256
- Use `crypto.timingSafeEqual()` for hash comparison to prevent timing attacks
- Store only the hash and prefix in the database

### 2. Key Generation
- Use cryptographically secure random number generation
- Minimum 32 bytes of entropy
- Include recognizable prefix (`olv_sk_`) for easy identification

### 3. Rate Limiting
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiKeyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each API key to 1000 requests per windowMs
  keyGenerator: (req) => req.apiKey?.id || req.ip,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});

module.exports = apiKeyRateLimit;
```

### 4. Permissions System
```javascript
// Available permissions
const PERMISSIONS = {
  READ_AGENTS: 'read:agents',
  WRITE_AGENTS: 'write:agents',
  DELETE_AGENTS: 'delete:agents',
  READ_CONVERSATIONS: 'read:conversations',
  WRITE_CONVERSATIONS: 'write:conversations',
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  READ_METRICS: 'read:metrics',
  ADMIN: 'admin'
};
```

## 🧪 Testing

### 1. Unit Tests Example

```javascript
// tests/apiKey.test.js
const request = require('supertest');
const app = require('../app');

describe('API Key Management', () => {
  test('should create new API key', async () => {
    const response = await request(app)
      .post('/api/v2/api-keys/client/test-client-id')
      .send({
        name: 'Test API Key',
        permissions: ['read:agents']
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.key).toMatch(/^olv_sk_/);
  });

  test('should authenticate with valid API key', async () => {
    // First create an API key
    const createResponse = await request(app)
      .post('/api/v2/api-keys/client/test-client-id')
      .send({
        name: 'Test API Key',
        permissions: ['read:agents']
      });

    const apiKey = createResponse.body.data.key;

    // Then use it to access protected route
    const response = await request(app)
      .get('/api/v2/agents')
      .set('x-api-key', apiKey)
      .expect(200);
  });
});
```

### 2. Manual Testing with curl

```bash
# Create API key
curl -X POST http://localhost:3000/api/v2/api-keys/client/your-client-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Test API Key",
    "permissions": ["read:agents", "write:agents"]
  }'

# Use API key
curl -X GET http://localhost:3000/api/v2/agents \
  -H "x-api-key: olv_sk_your_generated_key"
```

## 🔗 Frontend Integration

The frontend is already implemented and expects these exact endpoint URLs and response formats. Ensure your backend implementation matches the specifications above.

### Key Points:
1. **Endpoint URLs** must match exactly: `/api/v2/api-keys/*`
2. **Response format** must include `success` boolean and `data` object
3. **Error responses** should include `success: false` and `error` message
4. **API key format** should use `olv_sk_` prefix
5. **Permissions array** should match the frontend permission constants

## 📝 Environment Variables

Add these to your `.env` file:

```env
# API Key settings
API_KEY_PREFIX=olv_sk_
API_KEY_HASH_ALGORITHM=sha256

# Rate limiting
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=1000
```

## 🚀 Deployment Checklist

- [ ] Database tables created with proper indexes
- [ ] RLS policies configured
- [ ] API endpoints implemented and tested
- [ ] Authentication middleware configured
- [ ] Rate limiting implemented
- [ ] Error handling and logging in place
- [ ] Environment variables configured
- [ ] Security headers configured
- [ ] API documentation updated

This implementation provides a secure, scalable API key management system that integrates seamlessly with the existing frontend interface.
