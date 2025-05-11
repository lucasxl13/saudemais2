document.body.classList.toggle('dark-mode');

import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { silhueta } from '../Funcoes/silhueta.js';
import { exibirControleDeDigitos } from '../Funcoes/atualizarMedidas.js';
import { preencherMedidasComNowMax } from '../Funcoes/nowMaxMedidas.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import icones from '../Funcoes/icones.js';


const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://apisaudemais.danielhatz.com.br";

await verificarAutenticacao(API_BASE_URL);

const { dados_usuario } = window.usuarioLogado;
console.log(dados_usuario);

const metricas = window.usuarioLogado?.historico_metricas;
const ultimoRegistro = metricas[metricas.length - 1];
console.log(metricas);

gerarSidebar();
document.getElementById("silhueta_container").classList.add("espacamento-lateral");
silhueta(ultimoRegistro);
preencherMedidasComNowMax(metricas);

const partes = {
  hover_biceps_direito: "BÍCEPS DIREITO",
  p_biceps_direito: "BÍCEPS DIREITO",

  hover_biceps_esquerdo: "BÍCEPS ESQUERDO",
  p_biceps_esquerdo: "BÍCEPS ESQUERDO",

  hover_antebraco_direito: "ANTEBRAÇO DIREITO",
  p_antebraco_direito: "ANTEBRAÇO DIREITO",

  hover_antebraco_esquerdo: "ANTEBRAÇO ESQUERDO",
  p_antebraco_esquerdo: "ANTEBRAÇO ESQUERDO",

  hover_coxa_direita: "COXA DIREITA",
  p_coxa_direita: "COXA DIREITA",

  hover_coxa_esquerda: "COXA ESQUERDA",
  p_coxa_esquerda: "COXA ESQUERDA",

  hover_panturrilha_direita: "PANTURRILHA DIREITA",
  p_panturrilha_direita: "PANTURRILHA DIREITA",

  hover_panturrilha_esquerda: "PANTURRILHA ESQUERDA",
  p_panturrilha_esquerda: "PANTURRILHA ESQUERDA",

  hover_cintura: "CINTURA",
  p_cintura: "CINTURA",

  hover_altura: "ALTURA",
  p_altura: "ALTURA"
};

setTimeout(() => {
  Object.keys(partes).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", () => {
      let nome = partes[id];
      let valor;

      // Pega direto do atributo se for um <p>
      if (id.startsWith("p_")) {
        valor = parseInt(el.getAttribute("data-valor"));
      } else {
        // continua como já estava
        if (id === "hover_altura") {
          valor = ultimoRegistro.altura;
        } else if (id === "hover_cintura") {
          valor = ultimoRegistro.medidas_corporais.cintura;
        } else {
          const chave = id.replace("hover_", "");
          valor = ultimoRegistro.medidas_corporais[chave];
        }
      }
      exibirControleDeDigitos(valor, nome);
    });
  });
}, 500);

let chartGlobal;

function gerarGraficoDeMedidas(metricasFiltradas) {
  const ctx = document.getElementById("graficosMedidas").getContext("2d");

  const labels = metricasFiltradas.map(m => {
    const data = new Date(m.registrado_em);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = String(data.getFullYear()).slice(-2);
    return `${dia}/${mes}/${ano}`;
  });

  const partesAgrupadas = {
    "BÍCEPS": ["biceps_direito", "biceps_esquerdo"],
    "ANTEBRAÇO": ["antebraco_direito", "antebraco_esquerdo"],
    "COXA": ["coxa_direita", "coxa_esquerda"],
    "PANTURRILHA": ["panturrilha_direita", "panturrilha_esquerda"],
    "CINTURA": ["cintura"],
    "ALTURA": ["altura"],
  };

  const cores = [
    'rgb(255, 0, 0)',      // BÍCEPS
    'rgb(255, 255, 255)',  // ANTEBRAÇO
    'rgb(255, 251, 0)',    // COXA
    'rgb(0, 187, 255)',    // PANTURRILHA
    'rgb(255, 0, 136)',    // CINTURA
    'rgb(0, 255, 102)'     // ALTURA
  ];

  const datasets = Object.entries(partesAgrupadas).map(([label, campos], i) => {
    const data = metricasFiltradas.map(m => {
      const soma = campos.reduce((acc, campo) => {
        if (campo === "altura") return acc + (m.altura || 0);
        return acc + (m.medidas_corporais[campo] || 0);
      }, 0);
      const media = soma / campos.length;
      return parseFloat(media.toFixed(2));
    });

    return {
      label,
      data,
      borderColor: cores[i % cores.length],
      fill: false,
      tension: 0.3
    };
  });

  if (chartGlobal) chartGlobal.destroy();

  chartGlobal = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          onClick: (e, legendItem, legend) => {
            const ci = legend.chart;
            const index = legendItem.datasetIndex;
            const isOnlyVisible = ci.data.datasets.every((d, i) =>
              i === index ? ci.isDatasetVisible(i) : !ci.isDatasetVisible(i)
            );

            if (isOnlyVisible) {
              ci.data.datasets.forEach((_, i) => ci.setDatasetVisibility(i, true));
            } else {
              ci.data.datasets.forEach((_, i) => ci.setDatasetVisibility(i, i === index));
            }

            ci.update();
          }
        },
        title: {
          display: true,
          text: 'Histórico de Medidas Corporais (médias)',
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}


function atualizarVariacoes(metricasPeriodo) {
  const primeiro = metricasPeriodo[0];
  const ultimo = metricasPeriodo[metricasPeriodo.length - 1];

  if (!primeiro || !ultimo) return;

  const campos = {
    "altura": "porcentagemAltura",
    "cintura": "porcentagemCintura",
    "biceps_direito": "porcentagemBicepsDireito",
    "biceps_esquerdo": "porcentagemBicepsEsquerdo",
    "antebraco_direito": "porcentagemAntebracoDireito",
    "antebraco_esquerdo": "porcentagemAntebracoEsquerdo",
    "coxa_direita": "porcentagemCoxaDireita",
    "coxa_esquerda": "porcentagemCoxaEsquerda",
    "panturrilha_direita": "porcentagemPanturrilhaDireita",
    "panturrilha_esquerda": "porcentagemPanturrilhaEsquerda"
  };

  Object.entries(campos).forEach(([campo, spanId]) => {
    const inicial = campo === "altura" ? primeiro.altura : primeiro.medidas_corporais[campo];
    const final = campo === "altura" ? ultimo.altura : ultimo.medidas_corporais[campo];

    if (inicial != null && final != null && inicial !== 0) {
      const variacao = ((final - inicial) / inicial) * 100;

      // Define cor da classe e cor do ícone
      const corClasse = variacao > 0 ? "variacao-positiva" :
                        variacao < 0 ? "variacao-negativa" : "variacao-neutra";

      let corIcone = "#f9a825"; // amarelo padrão
      if (variacao > 0) corIcone = "#00c853"; // verde
      else if (variacao < 0) corIcone = "#d50000"; // vermelho

      // Escolhe o ícone certo
      const icone = variacao < 0
        ? icones.down(corIcone)
        : variacao > 0
          ? icones.up(corIcone)
          : icones.equal(corIcone);

      icone.style.marginRight = "0.4rem";

      const span = document.getElementById(spanId);
      if (span) {
        span.textContent = ""; // limpa
        span.appendChild(icone);
        span.append(`${variacao.toFixed(1)}%`);

        // Aplica classe de cor
        span.classList.remove("variacao-positiva", "variacao-negativa", "variacao-neutra");
        span.classList.add(corClasse);
      }
    }
  });
}

function configurarFiltrosDePeriodo(dataServidor, metricas) {
  const botoes = document.querySelectorAll('.periodo');
  const scrollRange = document.getElementById('scrollRange');

  let metricasFiltradas = [...metricas];
  let periodoSelecionado = 'semana';
  let janelaInicio = 0;

  function atualizarGraficoComScroll() {
    const janela = metricasFiltradas.slice(janelaInicio, janelaInicio + 7);
    gerarGraficoDeMedidas(janela);
    atualizarVariacoes(metricasFiltradas);
  }

  botoes.forEach(botao => {
    botao.addEventListener('click', () => {
      periodoSelecionado = botao.id;
      let dataLimite;

      switch (periodoSelecionado) {
        case 'semana':
          dataLimite = new Date(dataServidor);
          dataLimite.setDate(dataServidor.getDate() - 7);
          scrollRange.classList.remove('visivel');
          break;
        case 'mes':
          dataLimite = new Date(dataServidor);
          dataLimite.setMonth(dataServidor.getMonth() - 1);
          scrollRange.classList.add('visivel');
          break;
        case 'anos':
          dataLimite = new Date(dataServidor);
          dataLimite.setFullYear(dataServidor.getFullYear() - 1);
          scrollRange.classList.add('visivel');
          break;
        case 'inicio':
        default:
          dataLimite = null;
          scrollRange.classList.add('visivel');
          break;
      }

      botoes.forEach(b => b.classList.remove('ativo'));
      botao.classList.add('ativo');

      metricasFiltradas = !dataLimite
        ? [...metricas]
        : metricas.filter(m => new Date(m.registrado_em) >= dataLimite);

      const maxIndex = Math.max(0, metricasFiltradas.length - 7);
      scrollRange.max = maxIndex;
      scrollRange.value = maxIndex;
      janelaInicio = maxIndex;

      atualizarGraficoComScroll();
    });
  });

  scrollRange.addEventListener('input', (e) => {
    janelaInicio = parseInt(e.target.value, 10);
    atualizarGraficoComScroll();
  });

  document.getElementById("semana").click();
}

// EXECUÇÃO
(async () => {
  const dataServidor = await obterDataDoServidor(API_BASE_URL);
  const metricas = window.usuarioLogado?.historico_metricas;

  if (metricas?.length > 0 && dataServidor) {
    configurarFiltrosDePeriodo(dataServidor, metricas);
  }
})();
