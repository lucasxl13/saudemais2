document.body.classList.toggle('dark-mode');  

import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { filtroGraficoPeso } from '../Funcoes/graficos/graficoPeso.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { silhueta } from '../Funcoes/silhueta.js';
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
silhueta(ultimoRegistro);
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



const partes = {
  hover_biceps_direito: "biceps_direito",
  hover_biceps_esquerdo: "biceps_esquerdo",
  hover_antebraco_direito: "antebraco_direito",
  hover_antebraco_esquerdo: "antebraco_esquerdo",
  hover_coxa_direita: "coxa_direita",
  hover_coxa_esquerda: "coxa_esquerda",
  hover_panturrilha_direita: "panturrilha_direita",
  hover_panturrilha_esquerda: "panturrilha_esquerda",
  hover_altura: "altura",
  hover_cintura: "cintura",
  graficoPeso: "peso"
};

const container = document.querySelector(".container_atualizacao");

Object.keys(partes).forEach(id => {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.addEventListener("click", () => {
      const nomeCampo = partes[id];
      container.innerHTML = `
        <p>Manipulando: <strong>${nomeCampo.replaceAll('_', ' ')}</strong></p>
        <input type="number" id="input_valor_metrica" placeholder="Digite o valor em cm..." />
        <button id="btn_salvar_metrica">Salvar</button>
      `;

      document.getElementById("btn_salvar_metrica").addEventListener("click", async () => {
        const valor = parseFloat(document.getElementById("input_valor_metrica").value);
        if (isNaN(valor)) {
          alert("Digite um valor válido.");
          return;
        }

        try {
          if (nomeCampo === "peso") {
            await atualizarMetricaNoServidor("peso", valor);
          } else if (nomeCampo === "altura") {
            await atualizarMetricaNoServidor("altura", valor);
          } else {
            await atualizarMetricaNoServidor("medidas_corporais", { [nomeCampo]: valor });
          }
      
          // Após a atualização bem-sucedida, recarrega a página
          location.reload();
        } catch (erro) {
          console.error("Erro ao atualizar métrica:", erro);
          alert("Erro ao salvar a métrica. Tente novamente.");
        }
      });
    });
  }
});