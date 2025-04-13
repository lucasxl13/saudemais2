import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';

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
  { id: "perfilLink", icon: "perfil", text: "Perfil", href: "../pag_perfil/perfil.html" },
  { id: "logoutLink", icon: "logout", text: "Sair", href: null },
];

// Primeiro autentica, depois monta o menu
verificarAutenticacao(API_BASE_URL);
gerarSidebar(menuItems);