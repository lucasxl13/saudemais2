document.addEventListener("DOMContentLoaded", () => {
  // Verifica se o token está presente no localStorage ou sessionStorage
  const storedDataLocal = localStorage.getItem("jwt");
  const storedDataSession = sessionStorage.getItem("jwt");

  let tokenData = null;
  
  // Verifica qual armazenamento contém um token
  if (storedDataLocal) {
    tokenData = JSON.parse(storedDataLocal);
  } else if (storedDataSession) {
    tokenData = { token: storedDataSession }; // Para sessionStorage, não temos a expiração
  }

  if (tokenData) {
    const { token, expiresAt } = tokenData;

    // Verifica se o token não expirou no caso de estar no localStorage
    if (expiresAt && Date.now() >= expiresAt) {
      // Token expirado, remove do armazenamento e redireciona para login
      localStorage.removeItem("jwt");
      sessionStorage.removeItem("jwt");
      window.location.href = "../pag_login/login.html"; // Redireciona para login
    } else {
      // Token válido, redireciona para a página principal
      window.location.href = "../pag_principal/principal.html";
    }
  } else {
    // Se não houver token, apenas continua no login.
    console.log("Nenhum token encontrado, aguardando login.");
  }
});

// Código para o botão de redirecionamento para o cadastro
document.getElementById('btn-registro').addEventListener('click', function() {
    window.location.href = '../pag_cadastro/cadastro.html'; // Redireciona para a página de cadastro
});

document.getElementById("dados").addEventListener("submit", async (event) => {
  event.preventDefault(); // Evita o envio do formulário

  const usuarioInput = document.getElementById("usuario"); // Referência ao elemento
  const senhaInput = document.getElementById("senha");
  const manterConectado = document.getElementById("manter-conectado").checked; // Verifica se o checkbox está marcado
  const u_erro = document.getElementById('usuario-erro');
  const s_erro = document.getElementById('senha-erro');

  const usuario = usuarioInput.value; // Valor do input
  const senha = senhaInput.value;

  let hasError = false;

  if (usuario === '') { // Verifica se o campo está vazio
    usuarioInput.classList.add('erro'); // Adiciona a classe de erro ao input
    u_erro.style.display = 'block'; // Exibe a mensagem de erro
    u_erro.textContent = 'Campo obrigatório'; // Define o texto do erro
    hasError = true;
  } 

  if (senha === '') { // Verifica se o campo está vazio
    senhaInput.classList.add('erro'); // Adiciona a classe de erro ao input
    s_erro.style.display = 'block'; // Exibe a mensagem de erro
    s_erro.textContent = 'Campo obrigatório'; // Define o texto do erro
    hasError = true;
  }

  if (hasError) return; // Não envia a requisição se houver erros nos campos

  try {
    // Envia os dados do login para o backend

    //http://localhost:3000/login
    //https://apisaudemais.danielhatz.com.br/login
    const response = await fetch("https://apisaudemais.danielhatz.com.br/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usuario, senha }),
    });

    if (!response.ok) {
      // Verifica o tipo de resposta do erro
      const errorText = await response.text(); // Lê como texto
      console.error("Erro no login:", errorText);

      // Adiciona a classe de erro aos campos e exibe mensagem genérica
      usuarioInput.classList.add('erro');
      senhaInput.classList.add('erro');
      s_erro.style.display = 'block';
      s_erro.textContent = 'Usuário ou senha inválidos';
      return; // Encerra a execução aqui
    }

    const data = await response.json(); // Resposta do backend

    if (data.token) {
      // Armazena o token de acordo com a escolha do usuário
      if (manterConectado) {
        // Armazenar no localStorage com tempo de expiração de 1 hora
        const expirationTime = Date.now() + 60 * 60 * 1000; // 1 hora em milissegundos
        localStorage.setItem("jwt", JSON.stringify({ token: data.token, expiresAt: expirationTime }));
      } else {
        // Armazenar no sessionStorage (vai ser apagado ao fechar a aba)
        sessionStorage.setItem("jwt", data.token);
      }

      // Redireciona para a página principal
      window.location.href = "../pag_principal/principal.html";
    }
  } catch (error) {
    console.error("Erro ao tentar fazer login:", error);
  }
});

document.getElementById('usuario').addEventListener('input', function () {
  this.classList.remove('erro');
  document.getElementById('senha').classList.remove('erro');
  document.getElementById('usuario-erro').style.display = 'none';
  document.getElementById('senha-erro').style.display = 'none';
});

document.getElementById('senha').addEventListener('input', function () {
  this.classList.remove('erro');
  document.getElementById('usuario').classList.remove('erro');
  document.getElementById('senha-erro').style.display = 'none';
  document.getElementById('usuario-erro').style.display = 'none';
});
