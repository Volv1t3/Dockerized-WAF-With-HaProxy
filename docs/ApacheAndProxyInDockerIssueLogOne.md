This project involved getting a Dockerized HAProxy → ModSecurity (Apache) → Vite/Svelte frontend → Node/Express backend chain working correctly. Initially, HTTPS requests were reaching ModSecurity, but Apache was returning the default “It works!” page instead of the frontend app. Through stepwise debugging, we confirmed that the reverse proxy configuration in the `owasp/modsecurity-crs:apache` image was not being applied correctly, and the frontend dev server was also rejecting requests from the internal Docker hostname. This document describes the problem, requirements, detailed issue, diagnostic steps, and final fixes.

---

### 1. Overview: Problem and Solution

**Problem (high level)**  
You had a Docker Compose stack with four main services:

- `haproxy` handling TLS and routing external requests to ModSecurity/Apache
- `modsecurity` based on the `owasp/modsecurity-crs:apache` image
- `frontend` running a Vite/Svelte app (preview server)
- `backend` running a Node/Express API

Externally, `https://agricommerce.evolvlabs.com` returned **Apache’s default “It works!” page** instead of the frontend app. HAProxy logs showed `200` responses from the `modsecurity` backend, but the content was not your app.

**Root causes**

1. Apache inside the `modsecurity` container was serving from its **default DocumentRoot** (`/usr/local/apache2/htdocs`), not from the reverse proxy to `frontend` and `backend`.  
2. The frontend’s Vite preview server was blocking requests whose Host header was `frontend`, resulting in:
   ```text
   403 Forbidden
   Blocked request. This host ("frontend") is not allowed.
   To allow this host, add "frontend" to `preview.allowedHosts` in vite.config.js.
   ```

**Solution (high level)**

- Replace the default `httpd.conf` inside the `modsecurity` container with a **custom `httpd.conf`** that:
  - Listens on `${PORT}` (8080).
  - Loads ModSecurity, CRS, and core Apache modules.
  - Acts as a **reverse proxy**:
    - `/api/*` → `http://backend:33771`
    - `/` → `http://frontend:34771`
- Mount this `httpd.conf` using Docker volumes in `docker-compose.yml`.
- Adjust the frontend Vite configuration so that the hostnames used inside Docker (`frontend`) and from the outside (`agricommerce.evolvlabs.com`) are allowed.

After these changes, `https://agricommerce.evolvlabs.com` correctly returned the frontend application via the HAProxy → ModSecurity → frontend proxy chain.

---

### 2. Requirements to Solve the Issue

To reproduce the fix, you need:

**Infrastructure and tools**

- Docker and Docker Compose installed.
- A working Docker bridge network (e.g. `svc_net`) where all services (`haproxy`, `modsecurity`, `frontend`, `backend`) are attached.
- Access to the `owasp/modsecurity-crs:apache` image.

**Services (from `docker-compose.yml`)**

- **Backend** listening on `33771` inside the container:
  - Exposed as `33771:33771` on the host.
  - Environment includes `PORT=33771`, `DATABASE_URL`, `JWT_SECRET`, etc.
- **Frontend** listening on `34771` in the container:
  - Exposed as `34771:34771`.
  - Environment includes `BACKEND_URL=http://backend:33771`.
- **HAProxy**:
  - Listens on host `8080` (HTTP) and `443` (HTTPS).
  - Proxies HTTPS traffic to `modsecurity:8080`.
- **ModSecurity/Apache**:
  - Runs the `owasp/modsecurity-crs:apache` image.
  - Receives traffic from HAProxy on port `8080`.
  - Must be configured to reverse proxy to `frontend` and `backend`.

**Configuration files**

- `docker-compose.yml` with appropriate service definitions and volumes.
- Custom Apache config files:
  - `BaseConfigComposeAlternative/modsecurity/apache/httpd.conf` (full main server config and proxy rules).
  - Optionally, `proxy.conf` mounted as `/usr/local/apache2/conf/extra/httpd-vhosts.conf` (not strictly needed once the main `httpd.conf` is used).
- ModSecurity config:
  - `BaseConfigComposeAlternative/modsecurity/modsecurity.conf`
  - `BaseConfigComposeAlternative/modsecurity/crs-setup.conf`
  - `BaseConfigComposeAlternative/modsecurity/rules/` (CRS rules, etc.).
- Logs directory for ModSecurity:
  - `BaseConfigComposeAlternative/logs/modsecurity`.

**Frontend configuration**

- `vite.config.js` (or `vite.config.ts`) with a `preview` block that:
  - Binds to the correct host (`host: true` or `0.0.0.0`).
  - Allows the Docker and external hostnames in `allowedHosts`.

---

### 3. Detailed Description of the Issue

The architecture was:

```text
Browser → HAProxy:443 → modsecurity:8080 (Apache + ModSecurity) → frontend:34771 / backend:33771
```

**Symptoms**

- Browsing `https://agricommerce.evolvlabs.com` returned:

  ```html
  <html><body><h1>It works!</h1></body></html>
  ```

- HAProxy logs showed successful 200 responses from the backend:

  ```text
  haproxy | 172.18.0.1:44488 [..] https_front~ modsecurity_back/modsecurity ... 200 243 ... "GET https://agricommerce.evolvlabs.com/ HTTP/2.0"
  ```

- Direct access to the frontend container showed a Vite host restriction error:

  ```bash
  curl -v http://frontend:34771/
  ```

  Returned:

  ```text
  HTTP/1.1 403 Forbidden
  Blocked request. This host ("frontend") is not allowed.
  To allow this host, add "frontend" to `preview.allowedHosts` in vite.config.js.
  ```

- Direct access to the backend container:

  ```bash
  curl -v http://backend:33771/
  ```

  Returned an Express 404 page:

  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="utf-8">
  <title>Error</title>
  </head>
  <body>
  <pre>Cannot GET /</pre>
  </body>
  </html>
  ```

**Files involved and configuration challenges**

1. **`docker-compose.yml`**

   Relevant sections:

   ```yaml
   modsecurity:
     image: owasp/modsecurity-crs:apache
     container_name: modsecurity
     depends_on:
       - haproxy
     environment:
       - MODSEC_STATUS_ENGINE=On
       - MODSEC_RULE_ENGINE=On
       - PARANOIA_LEVEL=4
       - BACKEND=http://backend:33771
       - PORT=8080
     volumes:
       - ./BaseConfigComposeAlternative/modsecurity/modsecurity.conf:/etc/modsecurity.d/modsecurity.conf
       - ./BaseConfigComposeAlternative/modsecurity/apache/proxy.conf:/usr/local/apache2/conf/extra/httpd-vhosts.conf
       - ./BaseConfigComposeAlternative/modsecurity/apache/httpd.conf:/usr/local/apache2/conf/httpd.conf
       - ./BaseConfigComposeAlternative/modsecurity/crs-setup.conf:/etc/modsecurity.d/crs-setup.conf
       - ./BaseConfigComposeAlternative/modsecurity/rules:/etc/modsecurity.d/rules
       - ./BaseConfigComposeAlternative/logs/modsecurity:/var/log/apache2
     ports:
       - "8080"
       - "8081:8080"
     networks:
       - svc_net
   ```

   The challenge: ensuring that the mounted `httpd.conf` is the one Apache actually uses, and that nothing else overrides or bypasses the reverse proxy configuration.

2. **Apache main config: `/usr/local/apache2/conf/httpd.conf`**

   Initially, the image’s default `httpd.conf`:

   - Listened on `Listen 80` or `Listen ${PORT}`.
   - Set `DocumentRoot "/usr/local/apache2/htdocs"`.
   - Included several extra configs:
     - `Include conf/extra/httpd-ssl.conf`
     - `Include conf/extra/httpd-locations.conf`
     - `Include conf/extra/httpd-modsecurity.conf`
     - Optionally `Include conf/extra/httpd-vhosts.conf`.

   The default configuration meant that if the reverse proxy rules were not applied correctly, Apache would serve static content from `/usr/local/apache2/htdocs` — exactly the “It works!” page.

3. **Vhost/proxy config: `/usr/local/apache2/conf/extra/httpd-vhosts.conf`**

   At one point, you used a vhost file like:

   ```apache
   <VirtualHost *:8080>
       ServerName agricommerce.evolvlabs.com

       ProxyPreserveHost On

       # API requests go to backend
       ProxyPassMatch ^/api/(.*)$ http://backend:33771/api/$1
       ProxyPassReverse ^/api/(.*)$ http://backend:33771/api/$1

       # Everything else goes to frontend
       ProxyPass        / http://frontend:34771/
       ProxyPassReverse / http://frontend:34771/

       RewriteEngine On
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteRule ^ /index.html [L]

       ErrorLog /var/log/apache2/error.log
       CustomLog /var/log/apache2/access.log combined
   </VirtualHost>
   ```

   Apache reported this vhost via `apachectl -S`, but requests were still returning “It works!”. This meant the main server’s `DocumentRoot` was still being used, suggesting either:

   - The vhost was not actually handling the requests (Host mismatch, ordering), or  
   - The rewrite/proxy combination with the default DocumentRoot was interfering.

4. **ModSecurity includes: `/usr/local/apache2/conf/extra/httpd-modsecurity.conf`**

   Contents:

   ```apache
   LoadModule security2_module /usr/local/apache2/modules/mod_security2.so

   Timeout ${TIMEOUT}
   LogLevel ${LOGLEVEL}
   ErrorLog ${ERRORLOG}

   SecServerSignature ${MODSEC_SERVER_SIGNATURE}

   <IfModule reqtimeout_module>
     RequestReadTimeout header=20-40,MinRate=500 body=20,MinRate=500
   </IfModule>

   LogFormat ${APACHE_LOGFORMAT} modsec
   LogFormat ${APACHE_METRICS_LOGFORMAT} metricslog

   CustomLog ${METRICSLOG} metricslog "env=!nologging"

   Include /etc/modsecurity.d/setup.conf
   ```

   This file configures ModSecurity but does not define proxy rules. It must coexist with the reverse proxy setup in `httpd.conf`.

5. **Location config: `/usr/local/apache2/conf/extra/httpd-locations.conf`**

   Only defines special handling for `/healthz` and `/metrics/apache`, not for `/`, so it did not explain the “It works!” behavior.

---

### 4. Steps to Diagnose and Analyze the Issue

This section lists the key diagnostic commands and what each revealed.

#### 4.1. Check Apache vhost configuration

To see which vhosts Apache thinks it has:

```bash
docker exec -u 0 -it modsecurity bash
apachectl -S
```

Output example:

```text
VirtualHost configuration:
*:8080                 agricommerce.evolvlabs.com (/usr/local/apache2/conf/extra/httpd-vhosts.conf:1)
ServerRoot: "/usr/local/apache2"
Main DocumentRoot: "/usr/local/apache2/htdocs"
...
```

This confirmed:

- Apache recognized a vhost on `*:8080` for `agricommerce.evolvlabs.com`.
- The main `DocumentRoot` was `/usr/local/apache2/htdocs`.

#### 4.2. Inspect the active `httpd.conf`

To confirm what Apache config file was actually loaded:

```bash
docker exec -u 0 -it modsecurity bash -c 'cat /usr/local/apache2/conf/httpd.conf | sed -n "1,220p"'
```

This verified:

- The custom `httpd.conf` with `Listen ${PORT}` and the reverse proxy section was in place.
- The proxy rules were present in the main server config.

#### 4.3. Check auxiliary includes

To ensure no other file was overriding proxy behavior:

```bash
docker exec -u 0 -it modsecurity bash -c 'cat /usr/local/apache2/conf/extra/httpd-locations.conf'
docker exec -u 0 -it modsecurity bash -c 'cat /usr/local/apache2/conf/extra/httpd-modsecurity.conf'
```

These showed:

- `/healthz` and `/metrics/apache` locations were configured but not `/`.
- ModSecurity module and logging were configured, but not proxying.

#### 4.4. Test Apache directly inside the container

To see what Apache returns at the HTTP layer, bypassing HAProxy:

```bash
docker exec -u 0 -it modsecurity bash -c 'curl -v http://127.0.0.1:${PORT}/'
```

Result:

```text
HTTP/1.1 200 OK
Content-Type: text/html
...
<html><body><h1>It works!</h1></body></html>
```

This confirmed:

- Apache was serving the **default DocumentRoot**, not the reverse proxy target.

#### 4.5. Test upstream containers from inside ModSecurity

Check frontend:

```bash
docker exec -u 0 -it modsecurity bash -c 'curl -v http://frontend:34771/'
```

Result:

```text
HTTP/1.1 403 Forbidden
Blocked request. This host ("frontend") is not allowed.
To allow this host, add "frontend" to `preview.allowedHosts` in vite.config.js.
```

Check backend:

```bash
docker exec -u 0 -it modsecurity bash -c 'curl -v http://backend:33771/'
```

Result:

- A 404 from Express at `/`, as expected for an API-only backend.

These tests confirmed:

- Network connectivity from `modsecurity` to `frontend` and `backend` was fine.
- The frontend server was actively rejecting the `frontend` hostname, which had to be fixed in Vite.

---

### 5. Steps Taken to Fix the Issue

This section describes the final working setup and the changes applied.

#### 5.1. Replace the default Apache main server with a reverse proxy

A new `httpd.conf` was created and mounted into the `modsecurity` container:

**File:** `BaseConfigComposeAlternative/modsecurity/apache/httpd.conf`  
**Mounted to:** `/usr/local/apache2/conf/httpd.conf`

**Key elements of the file:**

```apache
ServerRoot "/usr/local/apache2"

# Listen on port from environment (PORT=8080)
Listen ${PORT}

# Load required modules (mpm, proxy, http2, ssl, rewrite, etc.)
LoadModule mpm_event_module modules/mod_mpm_event.so
...
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule rewrite_module modules/mod_rewrite.so
...

<IfModule unixd_module>
    User www-data
    Group www-data
</IfModule>

ServerAdmin ${SERVER_ADMIN}
ServerName ${SERVER_NAME}

# Default DocumentRoot (not used logically, but must exist)
DocumentRoot "/usr/local/apache2/htdocs"
<Directory "/usr/local/apache2/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# Logging (with ModSecurity log format)
ErrorLog ${ERRORLOG}
LogLevel warn
<IfModule log_config_module>
    LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
    ...
    CustomLog ${ACCESSLOG} modsec "env=!nologging"
</IfModule>

# Includes from base image
Include conf/extra/httpd-default.conf
<IfModule proxy_html_module>
Include conf/extra/proxy-html.conf
</IfModule>
Include conf/extra/httpd-ssl.conf
Include conf/extra/httpd-locations.conf
Include conf/extra/httpd-modsecurity.conf

# === Reverse proxy for agricommerce ===

ProxyPreserveHost On

# API requests → backend
ProxyPassMatch ^/api/(.*)$ http://backend:33771/api/$1
ProxyPassReverse ^/api/(.*)$ http://backend:33771/api/$1

# Everything else → frontend
ProxyPass        / http://frontend:34771/
ProxyPassReverse / http://frontend:34771/
```

Later, the SPA `RewriteRule` section was removed to avoid conflicts with file existence checks on the Apache filesystem.

#### 5.2. Mount the new `httpd.conf` with Docker Compose

In `docker-compose.yml`:

```yaml
modsecurity:
  image: owasp/modsecurity-crs:apache
  container_name: modsecurity
  depends_on:
    - haproxy
  environment:
    - MODSEC_STATUS_ENGINE=On
    - MODSEC_RULE_ENGINE=On
    - PARANOIA_LEVEL=4
    - BACKEND=http://backend:33771
    - PORT=8080
  volumes:
    - ./BaseConfigComposeAlternative/modsecurity/modsecurity.conf:/etc/modsecurity.d/modsecurity.conf
    - ./BaseConfigComposeAlternative/modsecurity/apache/httpd.conf:/usr/local/apache2/conf/httpd.conf
    - ./BaseConfigComposeAlternative/modsecurity/crs-setup.conf:/etc/modsecurity.d/crs-setup.conf
    - ./BaseConfigComposeAlternative/modsecurity/rules:/etc/modsecurity.d/rules
    - ./BaseConfigComposeAlternative/logs/modsecurity:/var/log/apache2
  ports:
    - "8080"
    - "8081:8080"
  networks:
    - svc_net
```

> Note: The `httpd-vhosts.conf` vhost approach became unnecessary once the main server was configured as the reverse proxy.

After updating the compose file:

```bash
docker compose down
docker compose up -d
```

Then re-check:

```bash
docker exec -u 0 -it modsecurity bash -c 'curl -v http://127.0.0.1:${PORT}/'
```

At this point, once the frontend host issue is fixed, this endpoint should return the frontend app HTML instead of “It works!”.

#### 5.3. Fix the Vite preview host restriction

The frontend Vite preview server refused the `frontend` hostname. The fix is in `vite.config.js` (or `vite.config.ts`):

```js
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  preview: {
    host: true,                   // or '0.0.0.0'
    port: 34771,
    allowedHosts: [
      'frontend',                 // Docker hostname used by Apache proxy
      'agricommerce.evolvlabs.com',
      'localhost',
      '127.0.0.1'
    ]
  }
});
```

After editing this file:

```bash
docker compose build frontend
docker compose up -d
```

Re-test from inside `modsecurity`:

```bash
docker exec -u 0 -it modsecurity bash -c 'curl -v http://frontend:34771/'
docker exec -u 0 -it modsecurity bash -c 'curl -v http://127.0.0.1:${PORT}/'
```

These should now return your Svelte/Vite app HTML, not a 403 or the “It works!” page.

#### 5.4. End-to-end verification via HAProxy

Finally, from the host (Windows PowerShell):

```powershell
curl -vk https://agricommerce.evolvlabs.com/
```

This should show your frontend HTML, confirming:

- TLS termination at HAProxy
- Routing from HAProxy → modsecurity:8080
- Apache/ModSecurity reverse proxy to `frontend:34771` and `backend:33771`

And in a browser, `https://agricommerce.evolvlabs.com` loads the intended application instead of the Apache default page.

---