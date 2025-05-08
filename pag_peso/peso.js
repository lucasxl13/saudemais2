document.body.classList.toggle('dark-mode');  

import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { filtroGraficoPeso } from '../Funcoes/graficos/graficoPeso.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { atualizarMetricaNoServidor } from '../Funcoes/atualizarMetrica.js';


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

  async function inicializarStreak(API_BASE_URL) {
    const dataServidor = await obterDataDoServidor(API_BASE_URL);
  
    if (dataServidor) {
      filtroGraficoPeso(dataServidor);
    }
  }

  
gerarSidebar();
inicializarStreak(API_BASE_URL);

const pesoIdeal = 21.75 * ((ultimoRegistro.altura / 100) ** 2);
const diferencaPeso = ultimoRegistro.peso - pesoIdeal;
const porcento = (ultimoRegistro.peso / pesoIdeal) * 100 - 100;

document.getElementById("pesos").textContent = `${ultimoRegistro.peso.toFixed(2)} / ${pesoIdeal.toFixed(2)}Kg`;
document.getElementById("variacaoPesos").textContent = `${diferencaPeso.toFixed(2)}kg || ${porcento.toFixed(2)}%`;

const status = Math.abs(diferencaPeso) <= 2
  ? "VOCÊ ESTÁ NO SEU PESO IDEAL"
  : `VOCÊ ESTÁ ${Math.abs(diferencaPeso).toFixed(2)}KG ${diferencaPeso > 0 ? "ACIMA" : "ABAIXO"} DO PESO IDEAL`;

document.getElementById("StatusPesos").textContent = status;
