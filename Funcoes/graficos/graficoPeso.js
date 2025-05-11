let graficoPeso = null;

function formatDate(dataISO) {
  const data = new Date(dataISO);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = String(data.getFullYear()).slice(-2); // dd/mm/aa
  return `${dia}/${mes}/${ano}`;
}

export function atualizarGraficoPeso(dados, aspectRatio = 2) {
  const datas = dados.map(m => formatDate(m.registrado_em));
  const pesos = dados.map(m => +(parseFloat(m.peso).toFixed(1)));

  if (!graficoPeso) {
    const ctx = document.getElementById('graficoPeso').getContext('2d');

    graficoPeso = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datas,
        datasets: [{
          label: 'Peso',
          data: pesos,
          borderColor: 'rgb(0, 0, 0)',
          backgroundColor: 'rgb(0, 255, 140)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        aspectRatio,
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.parsed.y} kg`;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  } else {
    graficoPeso.data.labels = datas;
    graficoPeso.data.datasets[0].data = pesos;
    graficoPeso.options.aspectRatio = aspectRatio;
    graficoPeso.update();
  }
}

export function filtroGraficoPeso(dataServidor, tipo = 'semana', aspectRatio = 2, offset = null) {
  const metricas = window.usuarioLogado?.historico_metricas;
  if (!metricas || !dataServidor) return;

  const hoje = new Date(dataServidor);
  let dataInicio = new Date(hoje);

  switch (tipo) {
    case 'semana':
      dataInicio.setDate(hoje.getDate() - 7);
      break;
    case 'mes':
      dataInicio.setDate(hoje.getDate() - 30);
      break;
    case 'ano':
      dataInicio.setFullYear(hoje.getFullYear() - 1);
      break;
    case 'inicio':
      dataInicio = null;
      break;
  }

  const dadosFiltrados = dataInicio
    ? metricas.filter(item => {
        const data = new Date(item.registrado_em);
        return data >= dataInicio && data <= hoje;
      })
    : metricas;

  window.dadosGraficoPeso = dadosFiltrados;

  const scroll = document.getElementById("scrollRangePeso");

  let offsetCalculado = 0;

  if (scroll) {
    if (tipo === 'semana') {
      scroll.style.visibility = "hidden";
      offsetCalculado = Math.max(0, dadosFiltrados.length - 7);
    } else {
      scroll.style.visibility = "visible";
      const maxOffset = Math.max(0, dadosFiltrados.length - 7);
      scroll.max = maxOffset;

      // Se offset não foi passado, começamos do final (mais recente)
      if (offset === null) {
        offsetCalculado = maxOffset;
        scroll.value = maxOffset;
      } else {
        offsetCalculado = offset;
        scroll.value = offset;
      }
    }
  } else {
    // fallback se scroll não existe
    offsetCalculado = Math.max(0, dadosFiltrados.length - 7);
  }

  const dadosVisiveis = dadosFiltrados.slice(offsetCalculado, offsetCalculado + 7);
  atualizarGraficoPeso(dadosVisiveis, aspectRatio);
}
