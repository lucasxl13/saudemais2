document.body.classList.toggle('dark-mode');  

import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { filtroGraficoPeso } from '../Funcoes/graficos/graficoPeso.js';
import { graficoCaloriasCirculo } from '../Funcoes/graficos/graficoCaloriasCircular.js';
import { graficoHidratacaoCirculo } from '../Funcoes/graficos/graficoHidratacaoCircular.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { calcularIdade } from "../Funcoes/calcularIdade.js";
import { silhueta } from '../Funcoes/silhueta.js';
import { atualizarMetricaNoServidor } from '../Funcoes/atualizarMetrica.js';
import { configurarBotaoIncremento } from '../Funcoes/incrementoGrafico.js';
import icones from '../Funcoes/icones.js';
import { criarBarrasStreak } from '../Funcoes/criarBarrasStreak.js';

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

  let avatarURL = dados_usuario.avatar;
  document.getElementById('fotoPerfil').src = avatarURL;

  document.getElementById("nomeUsuario").textContent = dados_usuario.nome;

  async function inicializarStreak(API_BASE_URL) {
    const dataServidor = await obterDataDoServidor(API_BASE_URL);
  
    if (dataServidor) {
      const idade = calcularIdade(dados_usuario.data_nascimento, dataServidor.toISOString());
      document.getElementById("idadeUsuario").textContent = idade;
  
      filtroGraficoPeso(dataServidor);
  
      criarBarrasStreak(dataServidor, metricas); 
    }
  }

  if(dados_usuario.objetivo==1){
    document.getElementById("objetivoUsuario").textContent = "Perca de peso";
  }else if(dados_usuario.objetivo==2){
    document.getElementById("objetivoUsuario").textContent = "Ganho de massa";
  }else{
    document.getElementById("objetivoUsuario").textContent = "Manutenção do peso";;
  }
  
gerarSidebar();
silhueta(ultimoRegistro);
graficoCaloriasCirculo(ultimoRegistro);
graficoHidratacaoCirculo(ultimoRegistro);

document.querySelectorAll('.container_calorias .botao_aumenta').forEach(botao => {
  configurarBotaoIncremento(botao, 'aumentar', 'calorias', atualizarMetricaNoServidor, graficoCaloriasCirculo);
});
document.querySelectorAll('.container_calorias .botao_diminui').forEach(botao => {
  configurarBotaoIncremento(botao, 'diminuir', 'calorias', atualizarMetricaNoServidor, graficoCaloriasCirculo);
});

document.querySelectorAll('.container_hidratacao .botao_aumenta').forEach(botao => {
  configurarBotaoIncremento(botao, 'aumentar', 'hidratacao', atualizarMetricaNoServidor, graficoHidratacaoCirculo);
});
document.querySelectorAll('.container_hidratacao .botao_diminui').forEach(botao => {
  configurarBotaoIncremento(botao, 'diminuir', 'hidratacao', atualizarMetricaNoServidor, graficoHidratacaoCirculo);
});

const elementoSvg = icones.fire(ultimoRegistro.streak_caloria);
document.getElementById('icone_streak').appendChild(elementoSvg);
const elementoSvg2 = icones.water(ultimoRegistro.streak_hidratacao);
document.getElementById('icone_streak_hidro').appendChild(elementoSvg2);

inicializarStreak(API_BASE_URL);

