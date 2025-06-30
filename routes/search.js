const express = require('express');
const { db } = require('../database');
const router = express.Router();

// 🚨 VULNERABLE: SQL Injection + Information Disclosure
router.get('/', (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.status(400).json({ 
            error: 'Query parameter "q" is required',
            example: '/api/search?q=admin',
            sqlInjectionExample: '/api/search?q=test\' UNION SELECT username,password,credit_card,email,role,phone,id FROM users--'
        });
    }
    
    // VULNERABILITY: Direct SQL concatenation (SQL Injection)
    const query = `SELECT c.content, c.created_at, u.username 
                   FROM comments c 
                   LEFT JOIN users u ON c.user_id = u.id 
                   WHERE c.content LIKE '%${q}%'`;
    
    console.log('🔓 Query vulnerable de búsqueda ejecutada:', query);
    
    db.all(query, (err, results) => {
        if (err) {
            // VULNERABILITY: Error information disclosure
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message,
                query: query,
                vulnerability: "⚠️ SQL Injection + Error Information Disclosure",
                payload: "💡 Intenta: test' UNION SELECT username,password,credit_card,email,role,phone,id FROM users--",
                sqlError: err.code
            });
        }
        
        res.json({
            success: true,
            query: q,
            executedSQL: query,
            count: results.length,
            results: results,
            vulnerability: "⚠️ CRITICAL: SQL Injection Vulnerability",
            hint: "💡 Usa UNION SELECT para extraer datos de otras tablas",
            examples: {
                basicInjection: "test' OR '1'='1' --",
                unionSelect: "test' UNION SELECT username,password,credit_card,email,role,phone,id FROM users--",
                databaseInfo: "test' UNION SELECT sql,name,type,NULL,NULL,NULL,NULL FROM sqlite_master--"
            }
        });
    });
});

// 🚨 VULNERABLE: Advanced SQL Injection for database enumeration
router.get('/advanced', (req, res) => {
    const { table, column } = req.query;
    
    if (!table) {
        return res.status(400).json({ 
            error: 'Query parameter "table" is required',
            example: '/api/search/advanced?table=users&column=username',
            hint: '💡 Intenta diferentes tablas y columnas'
        });
    }
    
    // VULNERABILITY: Direct SQL concatenation for table/column access
    const query = column ? 
        `SELECT ${column} FROM ${table} LIMIT 10` : 
        `SELECT * FROM ${table} LIMIT 10`;
    
    console.log('🔓 Query avanzada vulnerable ejecutada:', query);
    
    db.all(query, (err, results) => {
        if (err) {
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message,
                query: query,
                vulnerability: "⚠️ CRITICAL: Direct Table/Column Access",
                sqlError: err.code
            });
        }
        
        res.json({
            success: true,
            table: table,
            column: column || 'all',
            executedSQL: query,
            count: results.length,
            results: results,
            vulnerability: "⚠️ CRITICAL: Unrestricted Database Access",
            warning: "🚨 Esta funcionalidad permite acceso directo a cualquier tabla"
        });
    });
});

module.exports = router; 