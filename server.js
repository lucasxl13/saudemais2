const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

// Middleware para processar JSON
app.use(bodyParser.json());

// Configurações de CORS
app.use(cors());

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Substitua pelo usuário do banco
  password: "admin", // Substitua pela senha do banco
  database: "saudemais", // Nome do banco de dados
});

// Teste de conexão com o banco
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Conectado ao banco de dados!");
  }
});

// Middleware de autenticação para verificar o token JWT
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Extrair token do cabeçalho

  if (!token) {
    return res.status(403).send("Token JWT não encontrado.");
  }

  jwt.verify(token, 'secreta', (err, decoded) => {
    if (err) {
      return res.status(403).send("Token inválido.");
    }

    req.usuarioId = decoded.id;  // Salva o 'id' do usuário no 'req'
    next();
  });
};

app.get("/verificar-usuario/:usuario", (req, res) => {
  const { usuario } = req.params;

  const query = "SELECT id FROM usuarios WHERE usuario = ?";
  db.query(query, [usuario], (err, result) => {
    if (err) {
      console.error("Erro ao verificar usuário:", err);
      return res.status(500).send("Erro ao verificar usuário.");
    }

    if (result.length > 0) {
      return res.status(200).send({ disponivel: false });
    } else {
      return res.status(200).send({ disponivel: true });
    }
  });
});

app.get("/verificar-email/:email", (req, res) => {
  const { email } = req.params;

  const query = "SELECT id FROM usuarios WHERE email = ?";
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("Erro ao verificar e-mail:", err);
      return res.status(500).send("Erro ao verificar e-mail.");
    }

    if (result.length > 0) {
      return res.status(200).send({ disponivel: false });
    } else {
      return res.status(200).send({ disponivel: true });
    }
  });
});
// Rota de cadastro de usuário
app.post("/cadastro", (req, res) => {
  const { usuario, senha, confirmarSenha, email, altura, peso, data, nascimento, sexo, objetivo } = req.body;

  // Verificar se o usuário já existe
  const queryUsuario = "SELECT id FROM usuarios WHERE usuario = ?";
  db.query(queryUsuario, [usuario], (err, result) => {
    if (err) {
      console.error("Erro ao verificar usuário:", err);
      return res.status(500).send("Erro ao verificar usuário.");
    }

    if (result.length > 0) {
      return res.status(400).send("Usuário já existe.");
    }

    // Verificar se o e-mail já existe
    const queryEmail = "SELECT id FROM usuarios WHERE email = ?";
    db.query(queryEmail, [email], (err, result) => {
      if (err) {
        console.error("Erro ao verificar e-mail:", err);
        return res.status(500).send("Erro ao verificar e-mail.");
      }

      if (result.length > 0) {
        return res.status(400).send("E-mail já cadastrado.");
      }

      // Criptografar a senha
      bcrypt.hash(senha, 10, (err, hashedPassword) => {
        if (err) {
          console.error("Erro ao criptografar a senha:", err);
          return res.status(500).send("Erro ao criptografar a senha.");
        }

        // Inserir usuário no banco de dados
        const queryCadastro = "INSERT INTO usuarios (usuario, senha, email, data_nascimento, sexo, objetivo) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(queryCadastro, [usuario, hashedPassword, email, nascimento, sexo, objetivo], (err, result) => {
          if (err) {
            console.error("Erro ao inserir dados do usuário:", err);
            return res.status(500).send("Erro ao salvar os dados do usuário.");
          }

          const usuarioId = result.insertId;
          const queryMedidas = "INSERT INTO medidas (usuario_id, altura, peso, data) VALUES (?, ?, ?, ?)";
          db.query(queryMedidas, [usuarioId, altura, peso, data], (err, result) => {
            if (err) {
              console.error("Erro ao inserir medidas:", err);
              return res.status(500).send("Erro ao salvar as medidas.");
            }
            res.status(200).send("Cadastro e medidas salvas com sucesso!");
          });
        });
      });
    });
  });
});

// Rota de login
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  const query = "SELECT id, usuario, senha FROM usuarios WHERE usuario = ? OR email = ?";
  db.query(query, [usuario, usuario], (err, results) => {
    if (err) {
      console.error("Erro ao buscar o usuário:", err);
      return res.status(500).send("Erro no servidor.");
    }

    if (results.length === 0) {
      return res.status(401).send("Usuário ou senha inválidos.");
    }

    bcrypt.compare(senha, results[0].senha, (err, isMatch) => {
      if (err) {
        console.error("Erro ao verificar a senha:", err);
        return res.status(500).send("Erro no servidor.");
      }

      if (!isMatch) {
        return res.status(401).send("Usuário ou senha inválidos.");
      }

      // Gerar o token JWT
      const token = jwt.sign({ id: results[0].id }, 'secreta', { expiresIn: '1h' });

      // Retorna o token no corpo da resposta
      res.status(200).json({ token });
    });
  });
});

// Rota para obter dados do usuário
// Endpoint para retornar dados do usuário
app.get("/dados-usuario", verificarToken, (req, res) => {
  const usuarioId = req.usuarioId; // 'usuarioId' vem do token JWT

  const query = `
    SELECT u.usuario, u.email, u.data_nascimento, u.sexo, u.objetivo, m.altura, m.peso, m.data AS data_medida
    FROM usuarios u
    JOIN medidas m ON u.id = m.usuario_id
    WHERE u.id = ?
    ORDER BY m.data ASC
  `;

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar dados do usuário:", err);
      return res.status(500).send("Erro ao buscar dados do usuário.");
    }

    if (results.length === 0) {
      return res.status(404).send("Nenhum dado encontrado para o usuário.");
    }

    res.status(200).send(results); // Envia todos os registros
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
