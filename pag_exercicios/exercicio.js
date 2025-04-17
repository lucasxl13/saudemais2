import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';

const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://saude-mais-service-api.vercel.app";

// Primeiro autentica, depois monta o menu
verificarAutenticacao(API_BASE_URL);
gerarSidebar();
