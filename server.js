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
  host: "10.100.63.48",
  user: "root", // Substitua pelo usuário do banco
  password: "BLLtml74124", // Substitua pela senha do banco
  database: "saudemais", // Nome do banco de dados
  
    // host: "localhost",
    // user: "root", // Substitua pelo usuário do banco
    // password: "admin", // Substitua pela senha do banco
    // database: "saudemais", // Nome do banco de dados
});

// Função para garantir que a conexão está ativa
function verificarConexao() {
  return new Promise((resolve, reject) => {
    db.ping((err) => {
      if (err) {
        console.log('Conexão perdida, tentando reconectar...');
        db.connect((err) => {
          if (err) {
            console.error('Erro ao tentar reconectar:', err);
            return reject('Erro ao reconectar ao banco de dados');
          } else {
            console.log('Reconectado ao banco de dados!');
            return resolve();
          }
        });
      } else {
        resolve(); // Se a conexão ainda estiver ativa, resolve a promise
      }
    });
  }); // Aqui estava faltando fechar a chave da função verificarConexao
}

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

app.get("/verificar-usuario/:usuario", async (req, res) => {
  const { usuario } = req.params;

  await verificarConexao();

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

app.get("/verificar-email/:email", async (req, res) => {
  const { email } = req.params;

  await verificarConexao();

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
app.post("/cadastro", async (req, res) => {
  const { usuario, senha, confirmarSenha, email, altura, peso, data, nascimento, sexo, objetivo } = req.body;

  await verificarConexao();

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
app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;

  await verificarConexao();

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
app.get("/dados-usuario", verificarToken, async (req, res) => {
  const usuarioId = req.usuarioId; // 'usuarioId' vem do token JWT

  await verificarConexao();

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


app.post("/atualizar-peso", verificarToken, async (req, res) => {
  const { data, peso, altura } = req.body; // A data, peso e altura (caso fornecido)

  await verificarConexao();

  const usuarioId = req.usuarioId; // 'usuarioId' vem do token JWT

  // Se a altura não for fornecida, buscar a última altura registrada
  let alturaAtual = altura;
  if (!altura) {
    const queryUltimaAltura = "SELECT altura FROM medidas WHERE usuario_id = ? ORDER BY data DESC LIMIT 1";
    await new Promise((resolve, reject) => {
      db.query(queryUltimaAltura, [usuarioId], (err, result) => {
        if (err) {
          reject("Erro ao buscar última altura.");
        }
        if (result.length > 0) {
          alturaAtual = result[0].altura; // Utiliza a última altura registrada
        }
        resolve();
      });
    });
  }

  // Verifica se já existe um registro de peso para a data
  const queryVerificarData = "SELECT id FROM medidas WHERE usuario_id = ? AND data = ?";
  db.query(queryVerificarData, [usuarioId, data], (err, result) => {
    if (err) {
      console.error("Erro ao verificar data:", err);
      return res.status(500).send("Erro ao verificar data.");
    }

    if (result.length > 0) {
      // Se existir, atualiza o peso e mantém a altura
      const queryAtualizarPeso = "UPDATE medidas SET peso = ?, altura = ? WHERE id = ?";
      db.query(queryAtualizarPeso, [peso, alturaAtual, result[0].id], (err, result) => {
        if (err) {
          console.error("Erro ao atualizar peso:", err);
          return res.status(500).send("Erro ao atualizar peso.");
        }
        return res.status(200).send("Peso e altura atualizados com sucesso!");
      });
    } else {
      // Se não existir, cria um novo registro com a altura e o peso
      const queryInserirPeso = "INSERT INTO medidas (usuario_id, peso, altura, data) VALUES (?, ?, ?, ?)";
      db.query(queryInserirPeso, [usuarioId, peso, alturaAtual, data], (err, result) => {
        if (err) {
          console.error("Erro ao inserir peso:", err);
          return res.status(500).send("Erro ao inserir peso.");
        }
        return res.status(200).send("Peso e altura registrados com sucesso!");
      });
    }
  });
});
// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://10.100.39.38:${port}`);
});
