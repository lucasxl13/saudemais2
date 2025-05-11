import { preencherMedidasComNowMax, atualizarVariacoes } from '../nowMaxMedidas.js';

let chartGlobal;

export function inicializarGraficos(metricas, dataServidor) {
  const botoes = document.querySelectorAll('.periodo');
  const scrollRange = document.getElementById('scrollRange');

  let metricasFiltradas = [...metricas];
  let periodoSelecionado = 'semana';
  let janelaInicio = 0;

  function atualizarGraficoComScroll() {
    const janela = metricasFiltradas.slice(janelaInicio, janelaInicio + 7);
    gerarGraficoDeMedidas(janela);
    atualizarVariacoes(metricasFiltradas);
    preencherMedidasComNowMax(metricasFiltradas);
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
    "OCULTO": ["oculto"],
  };

  const cores = [
    'rgb(255, 0, 0)',
    'rgb(255, 136, 0)',
    'rgb(255, 251, 0)',
    'rgb(0, 187, 255)',
    'rgb(255, 0, 136)',
    'rgb(0, 255, 102)'
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
      backgroundColor: cores[i % cores.length],
      fill: false,
      tension: 0.3,
      hidden: label === "OCULTO"
    };
  });

  if (chartGlobal) chartGlobal.destroy();

  const textoCor = getComputedStyle(document.body).getPropertyValue('--texto').trim();

  chartGlobal = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: textoCor, // Cor dinâmica com CSS
            padding: 30,
            usePointStyle: true,
            boxWidth: 14,
            boxHeight: 14,
            generateLabels(chart) {
              const original = Chart.defaults.plugins.legend.labels.generateLabels;
              const labels = original(chart);

              return labels.map(label => {
                if (label.text === "OCULTO") {
                  return {
                    ...label,
                    fontColor: 'rgba(0,0,0,0)',
                    strokeStyle: 'rgba(0,0,0,0)',
                    fillStyle: 'rgba(0,0,0,0)',
                    hidden: true,              // linha oculta
                    lineWidth: 0,              // remove borda
                    pointStyle: false          // remove símbolo
                  };
                }

                return {
                  ...label,
                  strokeStyle: "black",
                  lineWidth: 2
                };
              });
            }
          },
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
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
