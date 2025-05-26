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

  let avatarURL = dados_usuario.avatar;
  document.getElementById('fotoPerfil').src = avatarURL;
  document.getElementById("nomeUsuario").textContent = dados_usuario.nome;
  document.getElementById("sexoUsuario").textContent = dados_usuario.sexo.toUpperCase();

  async function inicializarStreak(API_BASE_URL) {
    const dataServidor = await obterDataDoServidor(API_BASE_URL);
  
    if (dataServidor) {
      const idade = calcularIdade(dados_usuario.data_nascimento, dataServidor.toISOString());
      document.getElementById("idadeUsuario").textContent = idade;
  
      filtroGraficoPeso(dataServidor, 'semana', 2, null, 'dd/mm');
  
      criarBarrasStreak(dataServidor, metricas); 
    }
  }

  let basal;

  if(dados_usuario.objetivo==1){
    document.getElementById("objetivoUsuario").textContent = "PERCA DE PESO";
    basal = (ultimoRegistro.calorias.meta / 0.8).toFixed(0);
  }else if(dados_usuario.objetivo==2){
    document.getElementById("objetivoUsuario").textContent = "GANHO DE MASSA";
    basal = (ultimoRegistro.calorias.meta / 1.2).toFixed(0);
  }else{
    document.getElementById("objetivoUsuario").textContent = "MANUTENÇÃO DE PESO";
    basal = ultimoRegistro.calorias.meta;
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

document.getElementById("icon_imc").appendChild(icones.imc());
document.getElementById("imc").textContent = ultimoRegistro.imc.toFixed(2);
let status_imc;

if (ultimoRegistro.imc < 18.5) {
  status_imc = "ABAIXO DO PESO";
} else if (ultimoRegistro.imc < 24.9) {
  status_imc = "PESO NORMAL";
} else if (ultimoRegistro.imc < 29.9) {
  status_imc = "SOBREPESO";
} else if (ultimoRegistro.imc < 34.9) {
  status_imc = "OBESIDADE GRAU 1";
} else if (ultimoRegistro.imc < 39.9) {
  status_imc = "OBESIDADE GRAU 2";
} else {
  status_imc = "OBESIDADE GRAU 3";
}

document.getElementById("icon_fogo").appendChild(icones.fire2(0, false));
document.getElementById("taxa_metabolica").textContent = basal + " kCal";

document.getElementById("icon_gordura").appendChild(icones.porcentagem2());
document.getElementById("gordura_corporal").textContent = ultimoRegistro.gordura.toFixed(2) +  "%";

document.getElementById("icon_agua").appendChild(icones.water2(0, false));
document.getElementById("agua_corporal").textContent = ultimoRegistro.agua.toFixed(2) + " kg";

document.getElementById("icon_musculo").appendChild(icones.musculo());
document.getElementById("musculos").textContent = ultimoRegistro.musculo.toFixed(2) + " kg";

document.getElementById("container_usuario").addEventListener("click", function() {
  window.location.href = "../pag_perfil/perfil.html";
});

document.getElementById("container_peso").addEventListener("click", function() {
  window.location.href = "../pag_peso/peso.html";
});

document.getElementById("container_medida").addEventListener("click", function() {
  window.location.href = "../pag_medidas/medidas.html";
});

document.getElementById("container_metricas").addEventListener("click", function() {
  window.location.href = "../pag_metricas/metricas.html";
});

