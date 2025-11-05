// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.'));

// Ler dados do JSON
function readData() {
  try {
    const data = fs.readFileSync('data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { recados: [], usuarios: [] };
  }
}

// Escrever dados no JSON
function writeData(data) {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// GET - Listar recados
app.get('/api/recados', (req, res) => {
  const data = readData();
  res.json(data.recados || []);
});

// POST - Adicionar recado
app.post('/api/recados', (req, res) => {
  const data = readData();
  const novoRecado = {
    id: Date.now(),
    texto: req.body.texto,
    data: new Date().toISOString()
  };
  
  data.recados.push(novoRecado);
  writeData(data);
  res.status(201).json(novoRecado);
});

// PUT - Atualizar recado
app.put('/api/recados/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const recadoIndex = data.recados.findIndex(r => r.id === id);
  
  if (recadoIndex === -1) {
    return res.status(404).json({ error: 'Recado não encontrado' });
  }
  
  data.recados[recadoIndex].texto = req.body.texto;
  data.recados[recadoIndex].dataAtualizacao = new Date().toISOString();
  
  writeData(data);
  res.json(data.recados[recadoIndex]);
});

// DELETE - Remover recado
app.delete('/api/recados/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const recadoIndex = data.recados.findIndex(r => r.id === id);
  
  if (recadoIndex === -1) {
    return res.status(404).json({ error: 'Recado não encontrado' });
  }
  
  data.recados.splice(recadoIndex, 1);
  writeData(data);
  res.status(204).send();
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const data = readData();
  const usuario = data.usuarios.find(u => u.username === username && u.password === password);
  
  if (usuario) {
    res.json({ success: true, user: { nome: usuario.nome, nivel: usuario.nivel } });
  } else {
    res.status(401).json({ success: false, error: 'Credenciais inválidas' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});