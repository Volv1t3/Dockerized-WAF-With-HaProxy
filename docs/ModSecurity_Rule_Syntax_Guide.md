# ModSecurity Rule Syntax Guide

## Basic Rule Structure

```
SecRule VARIABLES "OPERATOR" "ACTIONS"
```

## Variables

### Request Variables
- `REQUEST_URI` - The request URI
- `REQUEST_METHOD` - HTTP method (GET, POST, etc.)
- `REQUEST_HEADERS` - All request headers
- `REQUEST_HEADERS:header-name` - Specific header
- `REQUEST_BODY` - Request body content
- `REQUEST_BODY:field-name` - Specific form field
- `ARGS` - All arguments (GET/POST)
- `ARGS:parameter-name` - Specific parameter
- `QUERY_STRING` - Query string portion of URI

### Response Variables
- `RESPONSE_STATUS` - HTTP response status
- `RESPONSE_HEADERS` - Response headers
- `RESPONSE_BODY` - Response body content

### Server Variables
- `REMOTE_ADDR` - Client IP address
- `SERVER_NAME` - Server hostname
- `REQUEST_FILENAME` - Requested file path

## Operators

### String Matching
- `@contains string` - Contains substring
- `@beginsWith string` - Starts with string
- `@endsWith string` - Ends with string
- `@streq string` - Exact string match
- `@within string` - Variable is within string

### Pattern Matching
- `@rx pattern` - Regular expression match
- `@detectSQLi` - SQL injection detection (libinjection)
- `@detectXSS` - XSS detection (libinjection)

### Numeric Operations
- `@eq number` - Equals
- `@gt number` - Greater than
- `@lt number` - Less than
- `@ge number` - Greater or equal
- `@le number` - Less or equal

### File Operations
- `@verifyCC` - Credit card verification
- `@validateByteRange` - Byte range validation

## Actions

### Flow Control
- `pass` - Continue processing (don't block)
- `deny` - Block the request
- `drop` - Drop connection
- `redirect:url` - Redirect to URL
- `allow` - Allow and skip remaining rules

### Logging
- `log` - Log to error log
- `auditlog` - Log to audit log
- `nolog` - Don't log
- `msg:'message'` - Custom log message

### Variables
- `setvar:variable=value` - Set variable
- `setvar:variable=+value` - Add to variable
- `setvar:variable=-value` - Subtract from variable

### Chaining
- `chain` - Chain with next rule (AND logic)
- `skip:n` - Skip next n rules
- `skipAfter:id` - Skip to rule after specified ID

## Transformations (t:)

### Case Conversion
- `t:lowercase` - Convert to lowercase
- `t:uppercase` - Convert to uppercase

### Encoding/Decoding
- `t:urlDecode` - URL decode
- `t:urlDecodeUni` - Unicode URL decode
- `t:htmlEntityDecode` - HTML entity decode
- `t:base64Decode` - Base64 decode

### Normalization
- `t:removeWhitespace` - Remove whitespace
- `t:compressWhitespace` - Compress whitespace
- `t:removeNulls` - Remove null bytes
- `t:none` - No transformation

## Rule Phases

- `phase:1` - Request headers
- `phase:2` - Request body
- `phase:3` - Response headers
- `phase:4` - Response body
- `phase:5` - Logging

## Rule Examples

### Basic SQL Injection Detection
```
SecRule ARGS "@detectSQLi" \
    "id:1001,\
    phase:2,\
    deny,\
    msg:'SQL Injection Attack Detected',\
    logdata:'Matched Data: %{MATCHED_VAR} found within %{MATCHED_VAR_NAME}'"
```

### XSS Detection with Chaining
```
SecRule REQUEST_HEADERS:Content-Type "@contains text/html" \
    "id:1002,\
    phase:2,\
    pass,\
    chain"
    
    SecRule ARGS "@detectXSS" \
        "deny,\
        msg:'XSS Attack in HTML Content'"
```

### Rate Limiting by IP
```
SecRule REMOTE_ADDR "@unconditionalMatch" \
    "id:1003,\
    phase:1,\
    pass,\
    setvar:'ip.requests=+1',\
    expirevar:'ip.requests=60'"

SecRule IP:REQUESTS "@gt 100" \
    "id:1004,\
    phase:1,\
    deny,\
    msg:'Rate limit exceeded: %{ip.requests} requests'"
```

### File Upload Restriction
```
SecRule REQUEST_HEADERS:Content-Type "@beginsWith multipart/form-data" \
    "id:1005,\
    phase:2,\
    pass,\
    chain"
    
    SecRule FILES "@rx \.(?:exe|bat|cmd|scr)$" \
        "deny,\
        msg:'Dangerous file upload attempt'"
```

### Geographic Blocking
```
SecRule REMOTE_ADDR "@geoLookup" \
    "id:1006,\
    phase:1,\
    pass,\
    chain"
    
    SecRule GEO:COUNTRY_CODE "@streq CN" \
        "deny,\
        msg:'Request from blocked country'"
```

## Best Practices

### Rule IDs
- Use unique IDs (1000000-1999999 for custom rules)
- Group related rules with similar ID ranges
- Document ID allocation in comments

### Performance
- Use specific variables instead of broad ones
- Place most restrictive rules first
- Use `t:none` when no transformation needed
- Avoid complex regex when simple operators work

### Chaining Rules
```
# Correct chaining syntax
SecRule CONDITION1 "operator1" \
    "id:1001,phase:2,pass,chain"
    
    SecRule CONDITION2 "operator2" \
        "deny,msg:'Both conditions matched'"
```

### Variable Usage
```
# Set and use custom variables
SecRule ARGS:username "@rx ^admin" \
    "id:1001,phase:2,pass,setvar:'tx.admin_attempt=1'"

SecRule TX:ADMIN_ATTEMPT "@eq 1" \
    "id:1002,phase:2,deny,msg:'Admin access attempt'"
```

## Common Patterns

### JSON API Protection
```
SecRule REQUEST_HEADERS:Content-Type "@contains application/json" \
    "id:2001,phase:2,pass,chain"
    
    SecRule REQUEST_BODY "@detectSQLi" \
        "deny,msg:'SQL injection in JSON payload'"
```

### Endpoint-Specific Rules
```
SecRule REQUEST_URI "@beginsWith /api/admin/" \
    "id:2002,phase:1,pass,chain"
    
    SecRule REQUEST_HEADERS:Authorization "!@rx ^Bearer\s+" \
        "deny,status:401,msg:'Missing or invalid authorization'"
```

### Custom Error Pages
```
SecRule REQUEST_URI "@streq /blocked" \
    "id:2003,phase:1,deny,status:403,\
    redirect:'http://example.com/blocked.html'"
```