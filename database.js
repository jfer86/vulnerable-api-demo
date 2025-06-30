const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'demo.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Tabla de usuarios
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                email TEXT,
                role TEXT,
                credit_card TEXT,
                phone TEXT
            )`);

            // Tabla de comentarios
            db.run(`CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Datos de ejemplo
            db.run(`INSERT OR IGNORE INTO users (username, password, email, role, credit_card, phone) VALUES 
                ('admin', 'admin123', 'admin@company.com', 'admin', '4532-1234-5678-9012', '+1234567890'),
                ('testuser', 'password', 'test@company.com', 'user', '4532-9876-5432-1098', '+0987654321'),
                ('qa_user', 'qasecure', 'qa@company.com', 'qa', '4532-1111-2222-3333', '+1122334455')`);

            db.run(`INSERT OR IGNORE INTO comments (user_id, content) VALUES 
                (1, 'Este es un comentario normal'),
                (2, 'Comentario de prueba'),
                (1, 'Sistema funcionando correctamente')`);

            console.log('✅ Base de datos inicializada correctamente');
            resolve();
        });
    });
};

module.exports = { db, initDatabase };
