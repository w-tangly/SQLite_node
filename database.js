// /meu-projeto-backend/database.js
const sqlite3 = require('sqlite3').verbose();

// Criar/conectar com o banco de dados
const db = new sqlite3.Database('meuapp.db', (err) => {
if (err) {
console.error('❌ Erro ao conectar:', err.message);
} else {
console.log('✅ Conectado ao SQLite!');
}
});

// Criar tabela de usuários se não existir
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Adicione esta nova tabela:
db.run(`CREATE TABLE IF NOT EXISTS tarefas (
id INTEGER PRIMARY KEY AUTOINCREMENT,
titulo TEXT NOT NULL,
descricao TEXT,
concluida BOOLEAN DEFAULT 0,
data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

module.exports = db;