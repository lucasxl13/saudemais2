let chart = null;

function formatDate(dataISO) {
  const data = new Date(dataISO);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

function gerarGraficoPeso(dates, pesos) {
  const ctx = document.getElementById('graficoPeso').getContext('2d');

  if (chart) {
    chart.destroy();
  }

  const pesoMinimo = Math.ceil(Math.min(...pesos) - 3);
  const pesoMaximo = Math.ceil(Math.max(...pesos) + 3);

  const textoColor = getComputedStyle(document.body).getPropertyValue('--texto')

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Peso',
        data: pesos,
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: 'rgba(0, 255, 140, 0.38)',
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'ÚLTIMOS 7 DIAS',
          font: {
            size: 11,
          },
          color: textoColor,
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return tooltipItem.raw + ' kg';
            }
          }
        }
      },
      scales: {
        y: {
          min: pesoMinimo,
          max: pesoMaximo,
          ticks: {
            stepSize: 1,
            callback: function (value) {
              return value + ' kg';
            }
          },
        }
      }
    }
  });
}

export function filtrarUltimosSeteDias() {
  const metricas = window.usuarioLogado?.historico_metricas;
  if (!metricas) return;

  const hoje = new Date();
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(hoje.getDate() - 7);

  const dadosFiltrados = metricas.filter(item => {
    const data = new Date(item.registrado_em);
    return data >= seteDiasAtras && data <= hoje;
  });

  const datas = dadosFiltrados.map(m => formatDate(m.registrado_em));
  const pesos = dadosFiltrados.map(m => +(parseFloat(m.peso).toFixed(1)));

  gerarGraficoPeso(datas, pesos);
}
