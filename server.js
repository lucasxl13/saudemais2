require("dotenv").config(); // Para carregar variáveis de ambiente
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "admin",
  database: process.env.DB_NAME || "saudemais",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Função para executar consultas SQL com Promises
const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Middleware para verificar JWT
const verificarToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).send("Token JWT não encontrado.");

  jwt.verify(token, process.env.JWT_SECRET || "secreta", (err, decoded) => {
    if (err) return res.status(403).send("Token inválido.");
    req.usuarioId = decoded.id;
    next();
  });
};

// Rota para verificar usuário
app.get("/verificar-usuario/:usuario", async (req, res) => {
  try {
    const { usuario } = req.params;
    const result = await queryAsync("SELECT id FROM usuarios WHERE usuario = ?", [usuario]);
    res.status(200).send({ disponivel: result.length === 0 });
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    res.status(500).send("Erro no servidor.");
  }
});

// Rota para verificar e-mail
app.get("/verificar-email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const result = await queryAsync("SELECT id FROM usuarios WHERE email = ?", [email]);
    res.status(200).send({ disponivel: result.length === 0 });
  } catch (error) {
    console.error("Erro ao verificar e-mail:", error);
    res.status(500).send("Erro no servidor.");
  }
});

// Rota de login
app.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    const result = await queryAsync("SELECT id, usuario, senha FROM usuarios WHERE usuario = ? OR email = ?", [usuario, usuario]);

    if (result.length === 0) return res.status(401).send("Usuário ou senha inválidos.");

    const isMatch = await bcrypt.compare(senha, result[0].senha);
    if (!isMatch) return res.status(401).send("Usuário ou senha inválidos.");

    const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET || "secreta", { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).send("Erro no servidor.");
  }
});


app.post("/cadastro", async (req, res) => {
  const { usuario, senha, confirmarSenha, email, altura, peso, data, nascimento, sexo, objetivo } = req.body;

  try {
    // Verificar se o usuário já existe
    const queryUsuario = "SELECT id FROM usuarios WHERE usuario = ?";
    const resultUsuario = await queryAsync(queryUsuario, [usuario]);

    if (resultUsuario.length > 0) {
      return res.status(400).send("Usuário já existe.");
    }

    // Verificar se o e-mail já existe
    const queryEmail = "SELECT id FROM usuarios WHERE email = ?";
    const resultEmail = await queryAsync(queryEmail, [email]);

    if (resultEmail.length > 0) {
      return res.status(400).send("E-mail já cadastrado.");
    }

    // Criptografar a senha
    bcrypt.hash(senha, 10, async (err, hashedPassword) => {
      if (err) {
        console.error("Erro ao criptografar a senha:", err);
        return res.status(500).send("Erro ao criptografar a senha.");
      }

      // Inserir usuário no banco de dados
      const queryCadastro = "INSERT INTO usuarios (usuario, senha, email, data_nascimento, sexo, objetivo) VALUES (?, ?, ?, ?, ?, ?)";
      const resultCadastro = await queryAsync(queryCadastro, [usuario, hashedPassword, email, nascimento, sexo, objetivo]);

      const usuarioId = resultCadastro.insertId;
      const queryMedidas = "INSERT INTO medidas (usuario_id, altura, peso, data) VALUES (?, ?, ?, ?)";
      await queryAsync(queryMedidas, [usuarioId, altura, peso, data]);

      res.status(200).send("Cadastro e medidas salvas com sucesso!");
    });
  } catch (error) {
    console.error("Erro ao processar cadastro:", error);
    res.status(500).send("Erro ao processar o cadastro.");
  }
});


app.get("/dados-usuario", verificarToken, async (req, res) => {
  const usuarioId = req.usuarioId;

  const verificarMedidaHoje = `
    SELECT id FROM medidas 
    WHERE usuario_id = ? AND DATE(data) = CURDATE()
  `;

  const ultimaMedidaQuery = `
    SELECT * FROM medidas 
    WHERE usuario_id = ? 
    ORDER BY data DESC LIMIT 1
  `;

  const inserirMedida = `
    INSERT INTO medidas (
      usuario_id, altura, peso, calorias, hidratacao,
      biceps_direito, biceps_esquerdo, antebraco_direito, antebraco_esquerdo,
      coxa_direita, coxa_esquerda, panturilha_direita, panturilha_esquerda,
      cintura, data, streakCal, streakHidratacao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)
  `;

  try {
    // 🔹 Buscar dados básicos do usuário (sexo e nascimento)
    const usuarioInfo = await queryAsync(`
      SELECT data_nascimento, sexo FROM usuarios WHERE id = ?
    `, [usuarioId]);

    if (!usuarioInfo || usuarioInfo.length === 0) {
      return res.status(404).send("Usuário não encontrado.");
    }

    const { data_nascimento, sexo } = usuarioInfo[0];

    // 🔹 Buscar a última medida para pegar altura e peso
    const ultimaMedida = await queryAsync(ultimaMedidaQuery, [usuarioId]);

    if (!ultimaMedida || ultimaMedida.length === 0) {
      return res.status(404).send("Sem medidas registradas.");
    }

    const m = ultimaMedida[0];

    // 🔹 Calcular idade
    function calcularIdade(dataNascStr) {
      const hoje = new Date();
      const nascimento = new Date(dataNascStr);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const m = hoje.getMonth() - nascimento.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      return idade;
    }

    const idade = calcularIdade(data_nascimento);

    // 🔹 Calcular TMB
    let tmb = 0;
    if (sexo === "masculino") {
      tmb = 66 + (13.7 * m.peso) + (5 * m.altura) - (6.8 * idade);
    } else if (sexo === "feminino") {
      tmb = 655 + (9.6 * m.peso) + (1.8 * m.altura) - (4.7 * idade);
    }
    tmb = Math.round(tmb);

    meta_hidratacao = m.peso*35;
    meta_hidratacao = Math.round(meta_hidratacao);

    // 🔹 Verifica se já existe medida de hoje
    const medidaHoje = await queryAsync(verificarMedidaHoje, [usuarioId]);

    if (medidaHoje.length === 0) {
      
      let streakCalNovo = 0;
      let streakHidroNovo = 0;

      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      const dataUltimaMedida = new Date(m.data).toDateString();
      const dataOntem = new Date(Date.now() - 86400000).toDateString();
      
      const pulouOntem = dataUltimaMedida !== dataOntem;
      
      if (!pulouOntem && Math.abs(m.calorias - tmb) <= 100) {
        streakCalNovo = (m.streakCal || 0) + 1;
      }

      if (!pulouOntem && Math.abs(m.hidratacao - meta_hidratacao) <= 100) {
        streakHidroNovo = (m.streakHidratacao || 0) + 1;
      }

      // Inserir nova medida com dados do último dia
      await queryAsync(inserirMedida, [
        usuarioId,
        m.altura, m.peso,
        0, // calorias zeradas
        0, // hidratação zerada
        m.biceps_direito, m.biceps_esquerdo,
        m.antebraco_direito, m.antebraco_esquerdo,
        m.coxa_direita, m.coxa_esquerda,
        m.panturilha_direita, m.panturilha_esquerda,
        m.cintura, streakCalNovo ,streakHidroNovo
      ]);
    }

    // 🔹 Buscar todos os dados para o frontend
    const query = `
      SELECT u.usuario, u.email, u.data_nascimento, u.sexo, u.objetivo, 
             m.altura, m.peso, m.calorias, m.hidratacao, 
             m.biceps_direito, m.biceps_esquerdo, 
             m.antebraco_direito, m.antebraco_esquerdo, 
             m.coxa_direita, m.coxa_esquerda, 
             m.panturilha_direita, m.panturilha_esquerda, 
             m.cintura, m.data AS data_medida,
             m.streakCal, m.streakHidratacao
      FROM usuarios u
      JOIN medidas m ON u.id = m.usuario_id
      WHERE u.id = ?
      ORDER BY m.data ASC
    `;

    const results = await queryAsync(query, [usuarioId]);

    if (results.length === 0) {
      return res.status(404).send("Nenhum dado encontrado para o usuário.");
    }

    res.status(200).send(results);
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return res.status(500).send("Erro ao buscar dados do usuário.");
  }
});


// Rota para atualizar peso
app.post("/atualizar-peso", verificarToken, async (req, res) => {
  try {
    const { data, peso, altura } = req.body;
    const usuarioId = req.usuarioId;

    let alturaAtual = altura;
    if (!altura) {
      const alturaRes = await queryAsync("SELECT altura FROM medidas WHERE usuario_id = ? ORDER BY data DESC LIMIT 1", [usuarioId]);
      if (alturaRes.length > 0) alturaAtual = alturaRes[0].altura;
    }

    const registroExistente = await queryAsync("SELECT id FROM medidas WHERE usuario_id = ? AND data = ?", [usuarioId, data]);
    
    if (registroExistente.length > 0) {
      await queryAsync("UPDATE medidas SET peso = ?, altura = ? WHERE id = ?", [peso, alturaAtual, registroExistente[0].id]);
      return res.status(200).send("Peso atualizado com sucesso.");
    }

    await queryAsync("INSERT INTO medidas (usuario_id, altura, peso, data) VALUES (?, ?, ?, ?)", [usuarioId, alturaAtual, peso, data]);
    res.status(200).send("Novo registro de peso adicionado.");
  } catch (error) {
    console.error("Erro ao atualizar peso:", error);
    res.status(500).send("Erro no servidor.");
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

