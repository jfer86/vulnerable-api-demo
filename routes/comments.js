const express = require('express');
const { db } = require('../database');
const router = express.Router();

// 🚨 VULNERABLE: No authentication + Information Disclosure
router.get('/', (req, res) => {
    // VULNERABILITY: No authorization check
    const query = `SELECT c.*, u.username, u.email FROM comments c 
                   LEFT JOIN users u ON c.user_id = u.id 
                   ORDER BY c.created_at DESC`;
    
    console.log('🔓 Query de comentarios sin autenticación:', query);
    
    db.all(query, (err, comments) => {
        if (err) {
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message,
                sqlError: err.code
            });
        }
        
        res.json({
            success: true,
            count: comments.length,
            comments: comments,
            warning: "⚠️ VULNERABILITY: Comentarios sin autenticación"
        });
    });
});

// 🚨 VULNERABLE: XSS + No Input Validation + No Authentication
router.post('/', (req, res) => {
    const { user_id, content } = req.body;
    
    // VULNERABILITY: No input validation, XSS possible
    // VULNERABILITY: No authentication check
    const query = `INSERT INTO comments (user_id, content) VALUES (?, ?)`;
    
    console.log('🔓 Inserting comment (vulnerable to XSS):', { user_id, content });
    
    db.run(query, [user_id, content], function(err) {
        if (err) {
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message,
                sqlError: err.code
            });
        }
        
        res.json({
            success: true,
            comment_id: this.lastID,
            message: 'Comentario agregado exitosamente',
            vulnerability: "⚠️ XSS + No Input Validation + No Authentication",
            xssPayload: "<script>alert('XSS Vulnerability!')</script>",
            hint: "💡 Intenta agregar un comentario con código JavaScript"
        });
    });
});

// 🚨 VULNERABLE: SQL Injection for comment deletion
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // VULNERABILITY: Direct SQL concatenation
    const query = `DELETE FROM comments WHERE id = '${id}'`;
    
    console.log('🔓 Query vulnerable de eliminación:', query);
    
    db.run(query, function(err) {
        if (err) {
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message,
                query: query,
                hint: "💡 Intenta: /api/comments/1'; DROP TABLE comments; --",
                sqlError: err.code
            });
        }
        
        if (this.changes > 0) {
            res.json({
                success: true,
                message: 'Comentario eliminado',
                vulnerability: "⚠️ SQL Injection en DELETE"
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Comentario no encontrado' 
            });
        }
    });
});

module.exports = router; 