const express = require('express');
const { db } = require('../database');
const router = express.Router();

// 🚨 VULNERABLE: No authentication required + Information Disclosure
router.get('/', (req, res) => {
    // VULNERABILITY: No authorization check
    const query = `SELECT * FROM users`;
    
    console.log('🔓 Query sin autenticación ejecutada:', query);
    
    db.all(query, (err, users) => {
        if (err) {
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message,
                sqlError: err.code
            });
        }
        
        // VULNERABILITY: Exposing sensitive data (credit cards, passwords)
        res.json({
            success: true,
            count: users.length,
            users: users,
            warning: "⚠️ VULNERABILITY: Datos sensibles expuestos sin autenticación"
        });
    });
});

// 🚨 VULNERABLE: SQL Injection + IDOR (Insecure Direct Object Reference)
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    // VULNERABILITY: Direct SQL concatenation (SQL Injection)
    const query = `SELECT * FROM users WHERE id = '${id}'`;
    
    console.log('🔓 Query vulnerable por ID ejecutada:', query);
    
    db.get(query, (err, user) => {
        if (err) {
            // VULNERABILITY: Error information disclosure
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message,
                query: query,
                hint: "💡 Intenta: /api/users/1' UNION SELECT username,password,credit_card,email,role,phone,id FROM users--",
                sqlError: err.code
            });
        }
        
        if (user) {
            res.json({
                success: true,
                user: user,
                vulnerability: "⚠️ IDOR + SQL Injection + Sensitive Data Exposure"
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado',
                hint: "💡 Intenta inyección SQL para ver todos los usuarios"
            });
        }
    });
});

module.exports = router; 