// /meu-projeto-backend/app.js
const express = require('express');
const db = require('./database'); // Importar a conexão

const app = express();
const PORT = 3000;

// Middleware essencial para APIs
app.use(express.json());

// Middleware personalizado (opcional)
app.use((req, res, next) => {
    console.log('🔔 Alguém visitou a API!');
    console.log('⏰ Horário:', new Date());
    next(); // IMPORTANTE: sempre chamar next()
});

// Middleware para validar ID numérico
function validarId(req, res, next) {
    const { id } = req.params;
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID deve ser um número válido' });
    }
    next();
}

// Middleware para validar dados da tarefa
function validarTarefa(req, res, next) {
    const { titulo } = req.body;
    if (!titulo || titulo.trim() === '') {
        return res.status(400).json({ erro: 'Título é obrigatório' });
    }
    if (titulo.length > 100) {
        return res.status(400).json({ erro: 'Título muito longo (máximo 100 caracteres)' });
    }
    next();
}

// Atualizar as rotas existentes:
app.post('/tarefas', validarTarefa, (req, res) => { /* código existente */ });
app.put('/tarefas/:id', validarId, validarTarefa, (req, res) => { /* código existente */ });
app.delete('/tarefas/:id', validarId, (req, res) => { /* código existente */ });

// Rota de teste
app.get('/', (req, res) => {
    res.json({ mensagem: 'API funcionando! 🚀' });
});

// ✅ AQUI você vai adicionar as operações CRUD nos próximos passos
// === OPERAÇÃO READ (Buscar usuários) ===
app.get('/usuarios', (req, res) => {
    db.all('SELECT * FROM usuarios', (err, rows) => {
        if (err) {
            res.status(500).json({ erro: err.message });
        } else {
            res.json({ usuarios: rows, total: rows.length });
        }
    });
});

// === OPERAÇÃO CREATE (Criar usuário) ===
app.post('/usuarios', (req, res) => {
    const { nome, email } = req.body;

    // Validação básica
    if (!nome || !email) {
        return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
    }

    db.run('INSERT INTO usuarios (nome, email) VALUES (?, ?)', [nome, email], function (err) {
        if (err) {
            res.status(500).json({ erro: 'Erro ao criar usuário' });
        } else {
            res.json({
                id: this.lastID,
                nome,
                email,
                mensagem: 'Usuário criado com sucesso!'
            });
        }
    });
});

// === OPERAÇÃO UPDATE (Atualizar usuário) ===
app.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;

    // Validação
    if (!nome || !email) {
        return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
    }

    db.run('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?', [nome, email, id], function (err) {
        if (err) {
            res.status(500).json({ erro: 'Erro ao atualizar usuário' });
        } else if (this.changes === 0) {
            res.status(404).json({ erro: 'Usuário não encontrado' });
        } else {
            res.json({
                id: parseInt(id),
                nome,
                email,
                mensagem: 'Usuário atualizado com sucesso!'
            });
        }
    });
});

// === OPERAÇÃO DELETE (Remover usuário) ===
app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM usuarios WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ erro: 'Erro ao deletar usuário' });
        } else if (this.changes === 0) {
            res.status(404).json({ erro: 'Usuário não encontrado' });
        } else {
            res.json({
                id: parseInt(id),
                mensagem: 'Usuário deletado com sucesso!'
            });
        }
    });
});

// === ROTAS PARA TAREFAS ===

// Listar todas as tarefas
app.get('/tarefas', (req, res) => {
    db.all('SELECT * FROM tarefas ORDER BY data_criacao DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ erro: err.message });
        } else {
            res.json({ tarefas: rows, total: rows.length });
        }
    });
});

// Criar nova tarefa
app.post('/tarefas', (req, res) => {
    const { titulo, descricao } = req.body;

    // Validação básica
    if (!titulo || titulo.trim() === '') {
        return res.status(400).json({ erro: 'Título é obrigatório' });
    }

    db.run('INSERT INTO tarefas (titulo, descricao) VALUES (?, ?)', [titulo, descricao], function (err) {
        if (err) {
            res.status(500).json({ erro: err.message });
        } else {
            res.json({
                id: this.lastID,
                titulo,
                descricao,
                mensagem: 'Tarefa criada com sucesso!'
            });
        }
    });
});

// Atualizar tarefa (marcar como concluída ou editar)
app.put('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, concluida } = req.body;

    // Validação
    if (!titulo || titulo.trim() === '') {
        return res.status(400).json({ erro: 'Título é obrigatório' });
    }

    db.run(
        'UPDATE tarefas SET titulo = ?, descricao = ?, concluida = ? WHERE id = ?',
        [titulo, descricao, concluida || 0, id],
        function (err) {
            if (err) {
                res.status(500).json({ erro: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ erro: 'Tarefa não encontrada' });
            } else {
                res.json({
                    id: parseInt(id),
                    titulo,
                    descricao,
                    concluida: concluida || 0,
                    mensagem: 'Tarefa atualizada com sucesso!'
                });
            }
        }
    );
});

// Deletar tarefa
app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM tarefas WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ erro: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ erro: 'Tarefa não encontrada' });
        } else {
            res.json({
                id: parseInt(id),
                mensagem: 'Tarefa removida com sucesso!'
            });
        }
    });
});

// Iniciar servidor (sempre por último)
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});