import { preencherMedidasComNowMax, atualizarVariacoes } from '../nowMaxMedidas.js';

let chartGlobal;

function calcularAspectRatio() {
  const largura = window.innerWidth;
  if (largura < 400) return 1;
  if (largura < 768) return 1.2;
  if (largura < 1024) return 1.7;
  return 2;
}

function calcularFonte() {
  const largura = window.innerWidth;
  if (largura < 400) return 9.5;
  if (largura < 768) return 11;
  return 12;
}

export function inicializarGraficos(metricas, dataServidor) {
  const botoes = document.querySelectorAll('.periodo');
  const scrollRange = document.getElementById('scrollRange');

  let metricasFiltradas = [...metricas];
  let periodoSelecionado = 'semana';
  let janelaInicio = 0;

  function atualizarGraficoComScroll() {
    const janela = metricasFiltradas.slice(janelaInicio, janelaInicio + 7);
    const formatoData = periodoSelecionado === 'inicio' ? 'dd/mm/aa' : 'dd/mm';
    gerarGraficoDeMedidas(janela, formatoData);
    atualizarVariacoes(metricasFiltradas);
    preencherMedidasComNowMax(metricasFiltradas);
  }

botoes.forEach(botao => {
  botao.addEventListener('click', () => {
    // Salva a posição atual de rolagem
    const scrollY = window.scrollY;

    // Lógica de troca de período
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

    // Restaura a posição anterior de rolagem
    window.scrollTo({ top: scrollY, behavior: 'auto' });
  });
});

  scrollRange.addEventListener('input', (e) => {
    janelaInicio = parseInt(e.target.value, 10);
    atualizarGraficoComScroll();
  });

  document.getElementById("semana").click();
}

function gerarGraficoDeMedidas(metricasFiltradas, formatoData = 'dd/mm') {
  const labels = metricasFiltradas.map(m => {
    const data = new Date(m.registrado_em);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = String(data.getFullYear()).toString().slice(-2);
    return formatoData === 'dd/mm/aa' ? `${dia}/${mes}/${ano}` : `${dia}/${mes}`;
  });

  const partesAgrupadas = {
    "BÍCEPS": ["biceps_direito", "biceps_esquerdo"],
    "ANTEBRAÇO": ["antebraco_direito", "antebraco_esquerdo"],
    "COXA": ["coxa_direita", "coxa_esquerda"],
    "PANTURRILHA": ["panturrilha_direita", "panturrilha_esquerda"],
    "CINTURA": ["cintura"],
    "ALTURA": ["altura"]
  };

  const cores = [
    'rgb(255, 0, 0)',
    'rgb(255, 136, 0)',
    'rgb(209, 206, 43)',
    'rgb(0, 187, 255)',
    'rgb(255, 0, 136)',
    'rgb(0, 185, 74)'
  ];

  const datasets = Object.entries(partesAgrupadas).map(([label, campos], i) => {
    const data = metricasFiltradas.map(m => {
      const soma = campos.reduce((acc, campo) => {
        if (campo === "altura") return acc + (m.altura || 0);
        return acc + (m.medidas_corporais[campo] || 0);
      }, 0);
      return parseFloat((soma / campos.length).toFixed(2));
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

  // Se já existe um gráfico, atualize os dados diretamente
  if (chartGlobal) {
    chartGlobal.data.labels = labels;
    chartGlobal.data.datasets = datasets;
    chartGlobal.update();
    return;
  }

  // Criação inicial (apenas uma vez)
  const ctx = document.getElementById("graficosMedidas").getContext("2d");
  const textoCor = getComputedStyle(document.body).getPropertyValue('--texto').trim();
  const fonteSize = calcularFonte();

  chartGlobal = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      aspectRatio: calcularAspectRatio(),
      plugins: {
        legend: {
          position: 'bottom',
          align: 'center',
          labels: {
            color: textoCor,
            font: { size: fonteSize },
            padding: 10,
            usePointStyle: true,
            boxWidth: 12,
            boxHeight: 12,
            generateLabels(chart) {
              const original = Chart.defaults.plugins.legend.labels.generateLabels;
              return original(chart)
                .map(label => {
                  if (label.text === "OCULTO") return null;
                  return {
                    ...label,
                    strokeStyle: "black",
                    lineWidth: 2
                  };
                })
                .filter(Boolean);
            }
          },
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
        tooltip: {
          titleFont: { size: fonteSize },
          bodyFont: { size: fonteSize },
          footerFont: { size: fonteSize - 1 },
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y ?? '';
              return `${label}: ${value} cm`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: textoCor,
            font: { size: fonteSize }
          }
        },
        x: {
          ticks: {
            color: textoCor,
            font: { size: fonteSize }
          }
        }
      }
    }
  });

  window.chartGlobal = chartGlobal;
}

window.addEventListener('resize', () => {
  if (chartGlobal) {
    chartGlobal.options.aspectRatio = calcularAspectRatio();
    const fonte = calcularFonte();
    chartGlobal.options.scales.x.ticks.font.size = fonte;
    chartGlobal.options.scales.y.ticks.font.size = fonte;
    chartGlobal.options.plugins.legend.labels.font.size = fonte;
    chartGlobal.resize();
  }
});