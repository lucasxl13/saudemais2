import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { filtrarUltimosSeteDias } from '../Funcoes/grafico_peso.js';

const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://saude-mais-service-api.vercel.app";

const menuItems = [
  { id: "homeLink", icon: "home", text: "Home", href: "../pag_principal/principal.html" },
  { id: "pesoLink", icon: "peso", text: "Peso", href: "../pag_peso/peso.html" },
  { id: "medidasLink", icon: "medidas", text: "Medidas", href: "../pag_medidas/medidas.html" },
  { id: "metricasLink", icon: "metricas", text: "Metricas", href: "../pag_metricas/metricas.html" },
  { id: "dietaLink", icon: "dieta", text: "Dieta", href: "../pag_dieta/dieta.html" },
  { id: "exercicioLink", icon: "exercicios", text: "Exercicios", href: "../pag_exercicios/exercicio.html" },
  { id: "darkModeToggle", icon: "moon", text: "Modo Escuro" , href: null },
  { id: "perfilLink", icon: "perfil", text: "Perfil", href: "../pag_perfil/perfil.html" },
  { id: "logoutLink", icon: "logout", text: "Sair", href: null },
];

  await verificarAutenticacao(API_BASE_URL); 
  const { dados_usuario } = window.usuarioLogado;

  document.getElementById("nome_usuario").textContent = dados_usuario.nome;
  document.getElementById("email_usuario").textContent = dados_usuario.email;
  document.getElementById("sexo_usuario").textContent = `Sexo: ${dados_usuario.sexo}`;
  document.getElementById("nascimento_usuario").textContent = `Nascimento: ${formatarData(dados_usuario.data_nascimento)}`;

function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR');
}

gerarSidebar(menuItems);
filtrarUltimosSeteDias();





