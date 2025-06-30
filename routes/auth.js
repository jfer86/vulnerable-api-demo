const express = require('express');
const { db } = require('../database');
const router = express.Router();

// 🚨 VULNERABLE: SQL Injection + Weak Authentication
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // VULNERABILITY: Direct SQL concatenation (SQL Injection)
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    console.log('🔓 Query vulnerable ejecutada:', query);
    
    db.get(query, (err, user) => {
        if (err) {
            // VULNERABILITY: Error information disclosure
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message,
                query: query,  // ⚠️ ¡Nunca hacer esto en producción!
                sqlError: err.code
            });
        }
        
        if (user) {
            // VULNERABILITY: Weak token (predictable)
            const token = `token_${user.id}_${Date.now()}`;
            
            res.json({
                success: true,
                message: 'Login exitoso',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    // VULNERABILITY: Sensitive data exposure
                    credit_card: user.credit_card,
                    phone: user.phone,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Credenciales inválidas',
                hint: 'Intenta: admin\' OR \'1\'=\'1\' --'
            });
        }
    });
});

module.exports = router;
