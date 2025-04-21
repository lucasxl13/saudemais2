// document.body.classList.toggle('dark-mode');  

import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { filtroGraficoPeso } from '../Funcoes/graficos/graficoPeso.js';
import { graficoCaloriasCirculo } from '../Funcoes/graficos/graficoCaloriasCircular.js';
import { graficoHidratacaoCirculo } from '../Funcoes/graficos/graficoHidratacaoCircular.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { calcularIdade } from "../Funcoes/calcularIdade.js";
import { silhueta } from '../Funcoes/silhueta.js';
import { atualizarMetricaNoServidor } from '../Funcoes/atualizarMetrica.js';

const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://saude-mais-service-api.vercel.app";

  await verificarAutenticacao(API_BASE_URL); 

  const { dados_usuario } = window.usuarioLogado;
  const metricas = window.usuarioLogado?.historico_metricas;
  const ultimoRegistro = metricas[metricas.length - 1];

  console.log(dados_usuario);
  console.log(metricas);

  document.getElementById("nomeUsuario").textContent = dados_usuario.nome;

  const dataServidor = await obterDataDoServidor(API_BASE_URL);
    if (dataServidor) {
        const idade = calcularIdade(dados_usuario.data_nascimento, dataServidor.toISOString());
        document.getElementById("idadeUsuario").textContent = idade;

        filtroGraficoPeso(dataServidor);
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

window.diminuirCalorias = async function(valor) {
  const registro = window.usuarioLogado.historico_metricas.at(-1);

  let novoValor = registro.calorias.consumido - valor;

  // Se for menor que 0, zera.
  if (novoValor < 0) {
    novoValor = 0;
  }

  registro.calorias.consumido = novoValor;

  // Atualiza o backend com o valor certo
  await atualizarMetricaNoServidor("calorias_consumido", novoValor);

  // Atualiza visualmente
  graficoCaloriasCirculo(registro);
}

window.aumentarCalorias = async function(valor) {
  const registro = window.usuarioLogado.historico_metricas.at(-1);
  const novoValor = registro.calorias.consumido + valor;

  if (novoValor > 20000) {
    alert("Limite máximo de 20.000 calorias atingido.");
    return;
  }

  registro.calorias.consumido = novoValor;

  await atualizarMetricaNoServidor("calorias_consumido", novoValor);
  graficoCaloriasCirculo(registro);
}



window.diminuirHidratacao = async function(valor) {
  const registro = window.usuarioLogado.historico_metricas.at(-1);

  let novoValor = registro.hidratacao.consumido - valor;

  // Se for menor que 0, zera.
  if (novoValor < 0) {
    novoValor = 0;
  }

  registro.hidratacao.consumido = novoValor;

  // Atualiza o backend com o valor certo
  await atualizarMetricaNoServidor("hidratacao_consumido", novoValor);

  // Atualiza visualmente
  graficoHidratacaoCirculo(registro);
}

window.aumentarHidratacao = async function(valor) {
  const registro = window.usuarioLogado.historico_metricas.at(-1);
  const novoValor = registro.hidratacao.consumido + valor;

  if (novoValor > 20000) {
    alert("Limite máximo de 20.000 calorias atingido.");
    return;
  }

  registro.hidratacao.consumido = novoValor;

  await atualizarMetricaNoServidor("hidratacao_consumido", novoValor);
  graficoHidratacaoCirculo(registro);
}



