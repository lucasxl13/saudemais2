function formatDate(dataISO) {
  const data = new Date(dataISO);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

function calcularAspectRatio() {
  const largura = window.innerWidth;
  if (largura < 500) return 1;
  if (largura < 768) return 1.8;
  if (largura < 1024) return 2.5;
  return 3.2;
}

function gerarGraficoMetricas({
  idCanvas,
  titulo,
  corBarra,
  corPreenchimento,
  unidade,
  dadosConsumidos,
  dadosMeta,
  datas
}) {
  const ctx = document.getElementById(idCanvas).getContext('2d');

  if (window[idCanvas] && typeof window[idCanvas].destroy === 'function') {
    window[idCanvas].destroy();
  }

  const textoColor = getComputedStyle(document.body).getPropertyValue('--texto');
  const larguraTela = window.innerWidth;

  let fontSizeBase = 11;
  if (larguraTela < 500) fontSizeBase = 10;
  else if (larguraTela < 768) fontSizeBase = 12;
  else if (larguraTela > 1200) fontSizeBase = 14;

  const fontInterno = fontSizeBase + 2;

  const maxValor = Math.max(...dadosConsumidos.map((v, i) => Math.max(v, dadosMeta[i])));
  const step = Math.ceil(maxValor / 10);
  const limiteY = Math.ceil(maxValor / step) * step;

  const pluginPreenchimento = {
    id: 'preenchimentoInterno',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const metaDataset = chart.getDatasetMeta(0);

      ctx.save();
      ctx.font = `bold ${fontInterno}px Arial, sans-serif`;
      ctx.textAlign = 'center';

      metaDataset.data.forEach((bar, i) => {
        const consumido = dadosConsumidos[i];
        const meta = dadosMeta[i];
        const maxEscala = chart.scales.y.max;
        const porcentagem = Math.min(consumido / maxEscala, 1);

        const { x, base, width } = bar;
        const alturaTotal = base - chart.scales.y.getPixelForValue(maxEscala);
        const alturaPreenchida = alturaTotal * porcentagem;
        const yPreenchido = base - alturaPreenchida;

        const left = x - width / 2 + 1;
        const right = x + width / 2 - 1;

        ctx.fillStyle = corPreenchimento;
        ctx.fillRect(left, yPreenchido, width - 2, alturaPreenchida);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, yPreenchido);
        ctx.lineTo(right, yPreenchido);
        ctx.lineTo(right, base);
        ctx.moveTo(left, yPreenchido);
        ctx.lineTo(left, base);
        ctx.stroke();

        const porcentagemMeta = Math.round((consumido / meta) * 100);
        const texto = `${porcentagemMeta}%`;
        const yTexto = base - alturaPreenchida / 2;

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.strokeText(texto, x, yTexto);
        ctx.fillStyle = 'white';
        ctx.fillText(texto, x, yTexto);
      });

      ctx.restore();
    }
  };

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datas,
      datasets: [{
        label: 'Meta',
        data: dadosMeta,
        backgroundColor: corBarra,
        borderColor: 'black',
        borderWidth: 1,
        maxBarThickness: 40 
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: calcularAspectRatio(),
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: { size: fontSizeBase + 1 },
          color: textoColor,
        },
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          bodyFont: { size: fontSizeBase },
          callbacks: {
            label: function (tooltipItem) {
              const i = tooltipItem.dataIndex;
              const consumido = dadosConsumidos[i] ?? 0;
              const meta = dadosMeta[i] ?? 0;
              return `Consumido: ${consumido} ${unidade} / Meta: ${meta} ${unidade}`;
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
            font: { size: fontSizeBase }
          }
        },
        x: {
          type: 'category',
          ticks: {
            color: textoColor,
            font: { size: fontSizeBase }
          }
        }
      }
    },
    plugins: [pluginPreenchimento]
  });

  window[idCanvas] = chart;
if (idCanvas === 'graficoUnificado') {
  window.graficoUnificado = chart; // <== isso é o que o resize vai usar
}
}

// Variáveis globais
window.dadosGraficoUnificado = [];
window.periodoAtualUnificado = 'semana';
window.tipoAtualUnificado = 'calorias';
window.offsetAtualUnificado = null;

// Função principal para filtrar e gerar o gráfico
export function filtroGraficoMetricas(dataServidor, tipo = 'calorias', periodo = 'semana', offset = null) {
  const metricas = window.usuarioLogado?.historico_metricas;
  if (!metricas || !dataServidor) return;

  window.tipoAtualUnificado = tipo;
  window.periodoAtualUnificado = periodo;

  const hoje = new Date(dataServidor);
  let dataInicio = new Date(hoje);

  switch (periodo) {
    case 'semana': dataInicio.setDate(hoje.getDate() - 7); break;
    case 'mes': dataInicio.setDate(hoje.getDate() - 30); break;
    case 'ano': dataInicio.setFullYear(hoje.getFullYear() - 1); break;
    case 'inicio': dataInicio = null; break;
  }

  const dadosFiltrados = dataInicio
    ? metricas.filter(item => {
        const data = new Date(item.registrado_em);
        return data >= dataInicio && data <= hoje;
      })
    : metricas;

  window.dadosGraficoUnificado = dadosFiltrados.map(m => ({
    data: formatDate(m.registrado_em),
    consumido: m[tipo].consumido,
    meta: m[tipo].meta
  }));

  const scroll = document.getElementById("scrollRangeUnificado");
  let offsetCalculado = 0;

  if (scroll) {
    if (periodo === 'semana') {
      scroll.style.visibility = "hidden";
      offsetCalculado = Math.max(0, window.dadosGraficoUnificado.length - 7);
    } else {
      scroll.style.visibility = "visible";
      const maxOffset = Math.max(0, window.dadosGraficoUnificado.length - 7);
      scroll.max = maxOffset;

      if (offset === null) {
        offsetCalculado = maxOffset;
        scroll.value = maxOffset;
      } else {
        offsetCalculado = offset;
        scroll.value = offset;
      }
    }
  }

  // Armazena o offset atual
  window.offsetAtualUnificado = offsetCalculado;

  const visiveis = window.dadosGraficoUnificado.slice(offsetCalculado, offsetCalculado + 7);

  let tituloPersonalizado = '';
  switch (periodo) {
    case 'semana': tituloPersonalizado = 'ÚLTIMA SEMANA'; break;
    case 'mes': tituloPersonalizado = 'ÚLTIMO MÊS'; break;
    case 'ano': tituloPersonalizado = 'ÚLTIMO ANO'; break;
    case 'inicio': tituloPersonalizado = 'DESDE O INÍCIO'; break;
  }

  gerarGraficoMetricas({
    idCanvas: 'graficoUnificado',
    titulo: tituloPersonalizado,
    corBarra: tipo === 'calorias' ? 'rgb(255, 178, 110)' : 'rgb(2, 159, 207)',
    corPreenchimento: tipo === 'calorias' ? 'rgb(255, 115, 0)' : 'rgb(0, 76, 255)',
    unidade: tipo === 'calorias' ? 'Kcal' : 'ml',
    dadosConsumidos: visiveis.map(d => d.consumido),
    dadosMeta: visiveis.map(d => d.meta),
    datas: visiveis.map(d => d.data)
  });
}

// Listener para recriar o gráfico quando a tela for redimensionada
window.addEventListener('resize', () => {
  if (!window.graficoUnificado) return;

  const chart = window.graficoUnificado;

  // Atualiza o aspectRatio dinamicamente
  chart.options.aspectRatio = calcularAspectRatio();

  chart.update(); 
});