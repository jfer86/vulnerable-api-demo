const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase } = require('./database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware (para ver requests en Burp)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);

// Landing page
app.get('/', (req, res) => {
    res.json({
        message: "🚨 API Vulnerable para Demo de Seguridad QA 🚨",
        version: "1.0.0",
        endpoints: {
            login: "POST /api/auth/login",
            users: "GET /api/users",
            userById: "GET /api/users/:id", 
            comments: "GET /api/comments",
            addComment: "POST /api/comments",
            search: "GET /api/search?q=<query>"
        },
        testPayloads: {
            sqlInjectionLogin: {
                username: "admin' OR '1'='1' --",
                password: "cualquier_cosa"
            },
            sqlInjectionSearch: "/api/search?q=test' UNION SELECT username,password,credit_card,email,role,phone,id FROM users--",
            xssComment: {
                user_id: 1,
                content: "<script>alert('XSS Vulnerability!')</script>"
            }
        },
        note: "⚠️ Esta API es INTENCIONALMENTE vulnerable para propósitos educativos de QA Security"
    });
});

// Initialize database and start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`🔓 API VULNERABLE - Solo para demos de seguridad`);
        console.log(`📋 Visita http://localhost:${PORT} para ver los endpoints disponibles`);
        console.log(`🔧 Configura Burp Suite proxy en 127.0.0.1:8080`);
    });
}).catch((err) => {
    console.error('❌ Error inicializando la base de datos:', err);
});
