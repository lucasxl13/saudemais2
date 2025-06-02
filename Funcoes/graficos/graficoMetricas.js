let chartMetricasGerais;

function calcularAspectRatio() {
  const largura = window.innerWidth;
  if (largura < 500) return 1;
  if (largura < 768) return 1.8;
  if (largura < 1024) return 2.5;
  return 3.4;
}

function calcularFonte() {
  const largura = window.innerWidth;
  if (largura < 400) return 9;
  if (largura < 768) return 12;
  return 14;
}

export function graficoMetricas(metricas, dataServidor) {
  const botoes = document.querySelectorAll('.periodo-geral');
  const scrollRange = document.getElementById('scrollRangeGerais');

  let metricasFiltradas = [...metricas];
  let periodoSelecionado = 'semana';
  let janelaInicio = 0;

function gerarGrafico(metricasFiltradas) {
  const ctx = document.getElementById("graficosMetricasGerais").getContext("2d");

  const labels = metricasFiltradas.map(m => {
    const data = new Date(m.registrado_em);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = String(data.getFullYear()).slice(-2);

    return periodoSelecionado === 'inicio' ? `${dia}/${mes}/${ano}` : `${dia}/${mes}`;
  });

  const campos = [
    { label: "IMC", chave: "imc" },
    { label: "MÚSCULO", chave: "musculo" },
    { label: "GORDURA", chave: "gordura" },
    { label: "ÁGUA", chave: "agua" }
  ];

  const cores = [
    'rgb(55, 255, 0)',
    'rgb(255, 0, 0)',
    'rgb(255, 234, 0)',
    'rgb(0, 136, 255)'
  ];

  const datasets = campos.map((campo, i) => {
    const dados = metricasFiltradas.map(m => m[campo.chave] || 0);
    return {
      label: campo.label,
      data: dados,
      borderColor: cores[i % cores.length],
      backgroundColor: cores[i % cores.length],
      fill: false,
      tension: 0.3
    };
  });

  const textoCor = getComputedStyle(document.body).getPropertyValue('--texto').trim();
  const fonteDinamica = calcularFonte();

  if (chartMetricasGerais) {
    chartMetricasGerais.data.labels = labels;
    chartMetricasGerais.data.datasets = datasets;
    chartMetricasGerais.options.aspectRatio = calcularAspectRatio();

    chartMetricasGerais.options.scales.x.ticks.font.size = fonteDinamica;
    chartMetricasGerais.options.scales.y.ticks.font.size = fonteDinamica;
    chartMetricasGerais.options.plugins.legend.labels.font.size = fonteDinamica;
    chartMetricasGerais.options.plugins.tooltip.titleFont.size = fonteDinamica;
    chartMetricasGerais.options.plugins.tooltip.bodyFont.size = fonteDinamica;

    chartMetricasGerais.update();
    return;
  }

  chartMetricasGerais = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      aspectRatio: calcularAspectRatio(),
      plugins: {
        legend: {
          labels: {
            color: textoCor,
            padding: 10,
            usePointStyle: true,
            boxWidth: 14,
            boxHeight: 14,
            font: {
              size: fonteDinamica
            },
            generateLabels(chart) {
              const original = Chart.defaults.plugins.legend.labels.generateLabels;
              const labels = original(chart);
              return labels.map(label => ({
                ...label,
                strokeStyle: "black",
                lineWidth: 2
              }));
            }
          },
          position: 'bottom',
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
          titleFont: {
            size: fonteDinamica
          },
          bodyFont: {
            size: fonteDinamica
          },
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y !== null ? context.parsed.y : '';
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            color: textoCor,
            font: {
              size: fonteDinamica
            }
          }
        },
        x: {
          ticks: {
            color: textoCor,
            font: {
              size: fonteDinamica
            }
          }
        }
      }
    }
  });

  window.chartMetricasGerais = chartMetricasGerais;
}

  function atualizarGraficoComScroll() {
    const janela = metricasFiltradas.slice(janelaInicio, janelaInicio + 7);
    gerarGrafico(janela);
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
        case 'ano':
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

  window.addEventListener('resize', () => {
    if (chartMetricasGerais) {
      const novaFonte = calcularFonte();

      chartMetricasGerais.options.aspectRatio = calcularAspectRatio();
      chartMetricasGerais.options.scales.x.ticks.font.size = novaFonte;
      chartMetricasGerais.options.scales.y.ticks.font.size = novaFonte;
      chartMetricasGerais.options.plugins.legend.labels.font.size = novaFonte;
      chartMetricasGerais.options.plugins.tooltip.titleFont.size = novaFonte;
      chartMetricasGerais.options.plugins.tooltip.bodyFont.size = novaFonte;

      chartMetricasGerais.update();
    }
  });
}
