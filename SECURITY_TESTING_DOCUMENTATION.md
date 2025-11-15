# Security Testing Documentation
## HAProxy + ModSecurity Vulnerability Testing Setup

### Overview
This document outlines the intentionally vulnerable endpoints created in the AgriCommerce backend API for testing HAProxy and ModSecurity security rules. These endpoints are designed to be susceptible to common web application attacks including SQL Injection, XSS, and privilege escalation.

⚠️ **WARNING**: These endpoints are intentionally insecure and should NEVER be deployed in production environments.

---

## Security Modifications Made

### 1. CORS Restrictions Removed
**File**: `backend/src/index.ts`

**Before (Secure)**:
```javascript
app.use(cors({ 
    credentials: true, 
    origin: ['http://localhost:3001', 'http://localhost:5173'],
    optionsSuccessStatus: 200
}));
```

**After (Vulnerable)**:
```javascript
app.use(cors({ 
    credentials: true, 
    origin: true, // Allow all origins
    optionsSuccessStatus: 200
}));
```

**Impact**: Allows requests from any origin, making the API vulnerable to CSRF attacks.

---

## Vulnerable Endpoints Created

### 1. SQL Injection - User Search
**Endpoint**: `GET /api/vulnerable/users`
**Parameters**: `search` (query parameter)

**Vulnerability**: Direct string interpolation in SQL query
```javascript
const query = `SELECT id, email, firstName, lastName, phone, createdAt FROM users WHERE email LIKE '%${search}%' OR firstName LIKE '%${search}%'`;
```

**Attack Examples**:
```bash
# Basic SQL injection
GET /api/vulnerable/users?search=' OR '1'='1

# Union-based injection
GET /api/vulnerable/users?search=' UNION SELECT id,email,passwordHash,firstName,lastName,phone FROM users--

# Information disclosure
GET /api/vulnerable/users?search=' OR 1=1--
```

**Expected Behavior**: Should return all users or expose sensitive data when exploited.

---

### 2. Cross-Site Scripting (XSS) - Comment System
**Endpoint**: `POST /api/vulnerable/comment`
**Body**: `{ "comment": "string", "author": "string" }`

**Vulnerability**: No input sanitization, direct HTML rendering
```javascript
html: `<div class="comment"><strong>${author}</strong>: ${comment}</div>`
```

**Attack Examples**:
```bash
# Stored XSS
POST /api/vulnerable/comment
{
  "author": "<script>alert('XSS')</script>",
  "comment": "Normal comment"
}

# HTML injection
POST /api/vulnerable/comment
{
  "author": "User",
  "comment": "<img src=x onerror=alert('XSS')>"
}
```

**Expected Behavior**: Should execute JavaScript or inject HTML when response is rendered.

---

### 3. Privilege Escalation - Admin Bypass
**Endpoint**: `GET /api/vulnerable/admin-bypass`
**Parameters**: `userId`, `isAdmin` (query parameters)

**Vulnerability**: Trusts client-provided admin status
```javascript
if (isAdmin === 'true') {
    // Returns sensitive data including password hashes
}
```

**Attack Examples**:
```bash
# Privilege escalation
GET /api/vulnerable/admin-bypass?userId=123&isAdmin=true

# Unauthorized data access
GET /api/vulnerable/admin-bypass?isAdmin=true
```

**Expected Behavior**: Should return sensitive user data including password hashes.

---

### 4. SQL Injection - Authentication Bypass
**Endpoint**: `POST /api/vulnerable/login`
**Body**: `{ "email": "string", "password": "string" }`

**Vulnerability**: SQL injection in authentication query
```javascript
const query = `SELECT * FROM users WHERE email = '${email}' AND passwordHash = '${password}'`;
```

**Attack Examples**:
```bash
# Authentication bypass
POST /api/vulnerable/login
{
  "email": "admin@example.com' OR '1'='1'--",
  "password": "anything"
}

# Boolean-based injection
POST /api/vulnerable/login
{
  "email": "' OR 1=1--",
  "password": ""
}
```

**Expected Behavior**: Should authenticate without valid credentials.

---

### 5. Path Traversal - File Reading
**Endpoint**: `GET /api/vulnerable/file-read`
**Parameters**: `file` (query parameter)

**Vulnerability**: No path validation allows directory traversal
```javascript
const content = fs.readFileSync(file, 'utf8');
```

**Attack Examples**:
```bash
# Read sensitive files
GET /api/vulnerable/file-read?file=../../../etc/passwd

# Read application files
GET /api/vulnerable/file-read?file=../package.json

# Windows path traversal
GET /api/vulnerable/file-read?file=..\\..\\..\\windows\\system32\\drivers\\etc\\hosts
```

**Expected Behavior**: Should read arbitrary files from the server filesystem.

---

## ModSecurity Rule Testing

### Custom Rules Location
**File**: `modsecurity/rules/custom.conf`

### Recommended Test Rules

#### 1. SQL Injection Detection
```apache
# Block SQL injection patterns
SecRule ARGS "@detectSQLi" \
  "id:2001,phase:2,deny,status:403,log,auditlog,msg:'SQL Injection Attack Detected',t:urlDecodeUni,t:htmlEntityDecode,t:lowercase"

# Block common SQL keywords
SecRule ARGS "@rx (?i)(union|select|insert|delete|drop|create|alter|exec|script)" \
  "id:2002,phase:2,deny,status:403,log,auditlog,msg:'SQL Keywords Detected'"
```

#### 2. XSS Detection
```apache
# Block XSS patterns
SecRule ARGS "@detectXSS" \
  "id:2003,phase:2,deny,status:403,log,auditlog,msg:'XSS Attack Detected',t:urlDecodeUni,t:htmlEntityDecode"

# Block script tags
SecRule ARGS "@rx (?i)<script[^>]*>.*?</script>" \
  "id:2004,phase:2,deny,status:403,log,auditlog,msg:'Script Tag Detected'"
```

#### 3. Path Traversal Detection
```apache
# Block directory traversal
SecRule ARGS "@rx \.\./|\.\.\\|\.\.\%2f|\.\.\%5c" \
  "id:2005,phase:2,deny,status:403,log,auditlog,msg:'Path Traversal Attack Detected'"
```

#### 4. Privilege Escalation Detection
```apache
# Block admin bypass attempts
SecRule ARGS:isAdmin "@rx ^true$" \
  "id:2006,phase:2,deny,status:403,log,auditlog,msg:'Privilege Escalation Attempt'"
```

---

## Testing Methodology

### 1. Baseline Testing (Without ModSecurity)
1. Deploy application without ModSecurity rules
2. Test each vulnerable endpoint with attack payloads
3. Verify vulnerabilities are exploitable
4. Document successful attacks

### 2. Protection Testing (With ModSecurity)
1. Enable ModSecurity with custom rules
2. Repeat attack tests
3. Verify attacks are blocked (403 responses)
4. Check ModSecurity logs for rule triggers

### 3. HAProxy Integration Testing
1. Configure HAProxy to proxy requests to backend
2. Test attacks through HAProxy
3. Verify ModSecurity integration works correctly
4. Test load balancing with security rules

---

## Expected Test Results

### Without Protection
- **SQL Injection**: Should return unauthorized data
- **XSS**: Should execute malicious scripts
- **Path Traversal**: Should read arbitrary files
- **Privilege Escalation**: Should bypass authorization

### With ModSecurity Protection
- **All Attacks**: Should return 403 Forbidden
- **Logs**: Should show blocked requests with rule IDs
- **Application**: Should remain functional for legitimate requests

---

## Monitoring and Logging

### ModSecurity Logs
- Location: `/var/log/modsec_audit.log`
- Contains: Blocked requests, rule matches, attack details

### Application Logs
- Location: Application console output
- Contains: Error messages, attack attempts, database queries

### HAProxy Logs
- Location: `/var/log/haproxy.log`
- Contains: Request routing, backend health, response codes

---

## Cleanup Instructions

⚠️ **IMPORTANT**: After testing, remove or secure these endpoints:

1. **Remove vulnerable endpoints** from `backend/src/index.ts`
2. **Restore CORS restrictions** to specific origins
3. **Enable input validation** on all endpoints
4. **Review and harden** all existing endpoints
5. **Update documentation** to reflect security improvements

---

## Security Best Practices Violated

This testing setup intentionally violates these security principles:

1. **Input Validation**: No sanitization of user inputs
2. **Output Encoding**: Direct HTML rendering without escaping
3. **Authentication**: SQL injection in login logic
4. **Authorization**: Client-controlled privilege escalation
5. **File Access**: Unrestricted file system access
6. **CORS Policy**: Overly permissive cross-origin requests

These violations provide comprehensive test cases for security rule validation and demonstrate the importance of proper security implementations.