function formatDate(dataISO) {
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}`;
  }
  


let graficoHidratacao = null;

function gerarGraficoHidratacao(dates, hidratacaoConsumida, hidratacaoMeta) {
  const ctx = document.getElementById('graficoHidratacao').getContext('2d');

  if (graficoHidratacao) {
    graficoHidratacao.destroy();
  }

  const textoColor = getComputedStyle(document.body).getPropertyValue('--texto');
  const textoColorInverso = getComputedStyle(document.body).getPropertyValue('--textoInverso');

  const larguraTela = window.innerWidth;

  // Fonte responsiva
  let fontSizeBase = 11;
  if (larguraTela < 500) {
    fontSizeBase = 9;
  } else if (larguraTela < 768) {
    fontSizeBase = 10;
  } else if (larguraTela > 1200) {
    fontSizeBase = 13;
  }

  const maxValor = Math.max(...hidratacaoConsumida.map((v, i) => Math.max(v, hidratacaoMeta[i])));
  const step = Math.ceil(maxValor / 10);
  const limiteY = Math.ceil(maxValor / step) * step;

  const pluginPreenchimento = {
    id: 'preenchimentoInterno',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const metaDataset = chart.getDatasetMeta(0);

      ctx.save();

      ctx.font = `bold ${fontSizeBase}px Arial, sans-serif`;
      ctx.textAlign = 'center';

      metaDataset.data.forEach((bar, i) => {
        const consumido = hidratacaoConsumida[i];
        const meta = hidratacaoMeta[i];
        const maxEscala = chart.scales.y.max;
        const porcentagem = Math.min(consumido / maxEscala, 1);

        const { x, base, width } = bar;
        const alturaTotal = base - chart.scales.y.getPixelForValue(maxEscala);
        const alturaPreenchida = alturaTotal * porcentagem;
        const yPreenchido = base - alturaPreenchida;

        const left = x - width / 2 + 1;
        const right = x + width / 2 - 1;

        // Preenchimento da barra consumida
        ctx.fillStyle = 'rgb(0, 76, 255)';
        ctx.fillRect(left, yPreenchido, width - 2, alturaPreenchida);

        // Stroke no topo e laterais
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, yPreenchido);
        ctx.lineTo(right, yPreenchido);
        ctx.lineTo(right, base);
        ctx.moveTo(left, yPreenchido);
        ctx.lineTo(left, base);
        ctx.stroke();

        // Texto de porcentagem
        const porcentagemMeta = Math.round((consumido / meta) * 100);
        const texto = `${porcentagemMeta}%`;
        const yTexto = base - alturaPreenchida / 2;

        ctx.lineWidth = 3;
        ctx.strokeStyle = textoColorInverso;
        ctx.strokeText(texto, x, yTexto); // contorno
        ctx.fillStyle = textoColor;
        ctx.fillText(texto, x, yTexto);   // texto
      });

      ctx.restore();
    }
  };

  graficoHidratacao = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Meta',
          data: hidratacaoMeta,
          backgroundColor: 'rgb(2, 159, 207)',
          borderColor: 'black',
          borderWidth: 1,
          barThickness: hidratacaoConsumida.length < 7 ? 40 : 'flex' 
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'ÚLTIMOS 7 DIAS',
          font: {
            size: fontSizeBase + 1,
          },
          color: textoColor,
        },
        legend: {
          display: false,
          labels: {
            font: {
              size: fontSizeBase
            }
          }
        },
        tooltip: {
          bodyFont: {
            size: fontSizeBase
          },
          callbacks: {
            label: function (tooltipItem) {
              const i = tooltipItem.dataIndex;
              return `Consumido: ${hidratacaoConsumida[i]} ml / Meta: ${hidratacaoMeta[i]} ml`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: limiteY,
          ticks: {
            stepSize: step,
            color: textoColor,
            callback: value => value + ' ml',
            font: {
              size: fontSizeBase
            }
          }
        },
        x: {
          ticks: {
            color: textoColor,
            font: {
              size: fontSizeBase
            }
          }
        }
      }
    },
    plugins: [pluginPreenchimento]
  });
}

  export function filtroGraficoHidratacao(dataServidor) {
    const metricas = window.usuarioLogado?.historico_metricas;
    if (!metricas || !dataServidor) return;
  
    const hoje = new Date(dataServidor);
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 7);
  
    const dadosFiltrados = metricas.filter(item => {
      const data = new Date(item.registrado_em);
      return data >= seteDiasAtras && data <= hoje;
    });
  
    const datas = dadosFiltrados.map(m => formatDate(m.registrado_em));
    const hidratacaoMeta = dadosFiltrados.map(m => m.hidratacao.meta);
    const hidratacaoConsumida = dadosFiltrados.map(m => m.hidratacao.consumido);
    
    gerarGraficoHidratacao(datas, hidratacaoConsumida, hidratacaoMeta);
  }