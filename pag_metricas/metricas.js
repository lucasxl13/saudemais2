import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { filtroGraficoCalorias } from '../Funcoes/graficos/graficoCalorias.js';
import { filtroGraficoHidratacao } from '../Funcoes/graficos/graficoHidratacao.js';
import { inicializarNavbarETema } from '../Funcoes/navbar.js';
inicializarNavbarETema();

const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  // : "https://saude-mais-service-api.vercel.app";
  : "https://apisaudemais.danielhatz.com.br";

  await verificarAutenticacao(API_BASE_URL); 

  const { dados_usuario } = window.usuarioLogado;
  const metricas = window.usuarioLogado?.historico_metricas;
  const ultimoRegistro = metricas[metricas.length - 1];

  console.log(dados_usuario);
  console.log(metricas);


  const dataServidor = await obterDataDoServidor(API_BASE_URL);
    if (dataServidor) {
      filtroGraficoCalorias(dataServidor);
      filtroGraficoHidratacao(dataServidor);
    }


gerarSidebar();

console.log(ultimoRegistro.calorias.meta + "kcal");

