import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { calcularIdade } from "../Funcoes/calcularIdade.js";
import { gerarSidebar } from '../Funcoes/sidebar.js';
import { mostrarToast } from '../Funcoes/generateToast.js';
import { salvarAvatarNoServidor } from '../Funcoes/atualizarPerfil.js'; // ajuste o caminho se necessário


const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://apisaudemais.danielhatz.com.br";

async function carregarPerfil() {
  await verificarAutenticacao(API_BASE_URL);

  const { dados_usuario, historico_metricas: metricas, streak_caloria, streak_hidratacao } = window.usuarioLogado;
  console.log('window.usuarioLogado:', window.usuarioLogado);

  document.getElementById("nomeUsuario").textContent = dados_usuario.nome;
  document.getElementById("emailUsuario").textContent = dados_usuario.email;
  document.getElementById("sexoUsuario").textContent = dados_usuario.sexo;

  const dataServidor = await obterDataDoServidor(API_BASE_URL);
  if (dataServidor) {
    const idade = calcularIdade(dados_usuario.data_nascimento, dataServidor.toISOString());
    document.getElementById("idadeUsuario").textContent = `${idade}`;
  }

  const objetivos = {
    1: "Perca de peso",
    2: "Ganho de massa",
    3: "Manutenção do peso"
  };

  document.getElementById("objetivoUsuario").textContent = objetivos[dados_usuario.objetivo] || "Não especificado";

  // Agora preencher as Estatísticas Recentes
  document.getElementById("streakCalorias").textContent = streak_caloria || 0;
  document.getElementById("streakHidratacao").textContent = streak_hidratacao || 0;

  const ultimaMetrica = metricas?.[0];

  if (ultimaMetrica) {
    document.getElementById('pesoUsuario').textContent = ultimaMetrica.peso ?? '-';
    document.getElementById('alturaUsuario').textContent = ultimaMetrica.altura ?? '-';

    if (ultimaMetrica.imc != null) {
      const imc = ultimaMetrica.imc.toFixed(1);
      let classificacao = "";

      if (imc < 18.5) classificacao = "Abaixo do peso";
      else if (imc < 24.9) classificacao = "Peso normal";
      else if (imc < 29.9) classificacao = "Sobrepeso";
      else classificacao = "Obesidade";

      document.getElementById('imcUsuario').textContent = `${imc} (${classificacao})`;
    } else {
      document.getElementById('imcUsuario').textContent = "-";
    }
  }

  let avatarURL = dados_usuario.avatar;
  if (avatarURL == null || avatarURL == "" || avatarURL == "0") {
    avatarURL = gerarAvatarAleatorio();
  }
  aplicarAvatar(avatarURL);

  gerarSidebar();
}

function gerarAvatarAleatorio() {
  const seed = Math.random().toString(36).substring(2, 12);
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}

function aplicarAvatar(url) {
  document.getElementById('fotoPerfil').src = url;
}

document.getElementById('gerarAvatar').addEventListener('click', () => {
  const novoAvatar = gerarAvatarAleatorio();
  aplicarAvatar(novoAvatar);
});

document.getElementById('salvarAvatar').addEventListener('click', () => {
  const avatarAtual = document.getElementById('fotoPerfil').src;
  mostrarToast("Avatar salvo com sucesso!");
  salvarAvatarNoServidor(avatarAtual);
});


carregarPerfil();
