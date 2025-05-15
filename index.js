const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

/** ROTA DE LOGIN **/
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (!fs.existsSync('usuarios.json')) {
    return res.status(500).json({ sucesso: false, mensagem: 'Arquivo de usuários não encontrado.' });
  }

  const usuarios = JSON.parse(fs.readFileSync('usuarios.json', 'utf-8'));
  const usuarioValido = usuarios.find(u => u.usuario === usuario && u.senha === senha);

  if (usuarioValido) {
    res.json({ sucesso: true });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha incorretos' });
  }
});

/** ROTA POST - ENVIAR FEEDBACK **/
app.post('/feedback', (req, res) => {
  const { aluno, mensagem, nota, turma } = req.body;

  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const novoFeedback = { aluno, mensagem, nota, turma, data, hora };

  let feedbacks = [];
  if (fs.existsSync('feedbacks.json')) {
    const dados = fs.readFileSync('feedbacks.json', 'utf-8');
    feedbacks = JSON.parse(dados);
  }

  feedbacks.push(novoFeedback);
  fs.writeFileSync('feedbacks.json', JSON.stringify(feedbacks, null, 2));

  res.json({ mensagem: 'Feedback enviado com sucesso!' });
});

/** ROTA GET - LISTAR FEEDBACKS **/
app.get('/feedbacks', (req, res) => {
  if (fs.existsSync('feedbacks.json')) {
    const dados = fs.readFileSync('feedbacks.json', 'utf-8');
    const feedbacks = JSON.parse(dados);
    res.json(feedbacks); // Envia apenas os feedbacks (como espera o front-end)
  } else {
    res.json([]); // Retorna array vazio se não houver arquivo
  }
});

/** ROTA DELETE - LIMPAR FEEDBACKS **/
app.delete('/feedback', (req, res) => {
  fs.writeFile('feedbacks.json', '[]', (err) => {
    if (err) {
      res.status(500).json({ mensagem: 'Erro ao limpar feedbacks' });
    } else {
      res.json({ mensagem: 'Todos os feedbacks foram apagados com sucesso!' });
    }
  });
});

/** ROTA RAIZ PARA TESTE **/
app.get('/', (req, res) => {
  res.send('Servidor rodando corretamente!');
});

/** INICIAR SERVIDOR **/
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
