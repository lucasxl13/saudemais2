let graficoPeso = null;

// Função para formatar a data conforme o formato escolhido
function formatDate(dataISO, formato = 'dd/mm/aa') {
  const data = new Date(dataISO);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = String(data.getFullYear()).slice(-2);

  if (formato === 'dd/mm') {
    return `${dia}/${mes}`;
  }

  return `${dia}/${mes}/${ano}`;
}


// Atualiza ou cria o gráfico de peso
export function atualizarGraficoPeso(dados, aspectRatio = 2, formatoData = 'dd/mm/aa') {
  const datas = dados.map(m => formatDate(m.registrado_em, formatoData));
  const pesos = dados.map(m => +(parseFloat(m.peso).toFixed(1)));
  const textoCor = getComputedStyle(document.body).getPropertyValue('--texto').trim();

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
          title: { display: false },
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.parsed.y} kg`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              color: textoCor
            }
          },
          x: {
            ticks: {
              color: textoCor
            }
          }
        }
      }
    });

    // Expõe globalmente para atualização futura
    window.graficoPeso = graficoPeso;

  } else {
    graficoPeso.data.labels = datas;
    graficoPeso.data.datasets[0].data = pesos;
    graficoPeso.options.aspectRatio = aspectRatio;

    // Atualiza as cores com base no tema
    graficoPeso.options.scales.y.ticks.color = textoCor;
    graficoPeso.options.scales.x.ticks.color = textoCor;

    graficoPeso.update();
  }
}
export function filtroGraficoPeso(dataServidor, tipo = 'semana', aspectRatio = 2, offset = null, formatoData = 'dd/mm/aa') {
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

      if (offset === null) {
        offsetCalculado = maxOffset;
        scroll.value = maxOffset;
      } else {
        offsetCalculado = offset;
        scroll.value = offset;
      }
    }
  } else {
    offsetCalculado = Math.max(0, dadosFiltrados.length - 7);
  }

  const dadosVisiveis = dadosFiltrados.slice(offsetCalculado, offsetCalculado + 7);
  atualizarGraficoPeso(dadosVisiveis, aspectRatio, formatoData);

  if (dadosFiltrados.length >= 2) {
    const pesoInicial = parseFloat(dadosFiltrados[0].peso);
    const pesoFinal = parseFloat(dadosFiltrados[dadosFiltrados.length - 1].peso);

    const variacao = ((pesoFinal - pesoInicial) / pesoInicial) * 100;
    const variacaoFormatada = variacao.toFixed(1).replace('.', ',');

    const prefixo = variacao > 0 ? '+' : '';
    const spanVariacaoPercentual = document.getElementById('peso_variacaoPercentual');
    if (spanVariacaoPercentual) {
      spanVariacaoPercentual.textContent = `${prefixo}${variacaoFormatada} %`;
      spanVariacaoPercentual.style.color = variacao > 0 ? 'rgb(0, 255, 140)' : variacao < 0 ? 'rgb(255, 0, 0)' : 'var(--texto)';
      spanVariacaoPercentual.style.fontWeight = 'bold';

    }

    const diferencaKg = pesoFinal - pesoInicial;
    const diferencaKgFormatada = diferencaKg.toFixed(1).replace('.', ',');
    const prefixoKg = diferencaKg > 0 ? '+' : '';

    const spanVariacaoKg = document.getElementById('peso_variacao');
    if (spanVariacaoKg) {
      spanVariacaoKg.textContent = `${prefixoKg}${diferencaKgFormatada} kg`;
      spanVariacaoKg.style.color = diferencaKg > 0 ? 'rgb(0, 255, 140)' : diferencaKg < 0 ? 'rgb(255, 0, 0)' : 'var(--texto)';
      spanVariacaoPercentual.style.fontWeight = 'bold';
    }

    const pesosDoPeriodo = dadosFiltrados.map(item => parseFloat(item.peso));
    const somaPesos = pesosDoPeriodo.reduce((acc, peso) => acc + peso, 0);
    const mediaPeso = (somaPesos / pesosDoPeriodo.length).toFixed(1).replace('.', ',');
    const maxPeso = Math.max(...pesosDoPeriodo).toFixed(1).replace('.', ',');
    const minPeso = Math.min(...pesosDoPeriodo).toFixed(1).replace('.', ',');

    const spanMedia = document.getElementById('peso_medio');
    const spanMax = document.getElementById('peso_max');
    const spanMin = document.getElementById('peso_min');

    if (spanMedia) spanMedia.textContent = `${mediaPeso} kg`;
    if (spanMax) spanMax.textContent = `${maxPeso} kg`;
    if (spanMin) spanMin.textContent = `${minPeso} kg`;

    const spanPeriodo = document.getElementById('peso_periodo');
    if (spanPeriodo) {
      const nomes = {
        semana: 'ÚLTIMA SEMANA',
        mes: 'ÚLTIMO MÊS',
        ano: 'ÚLTIMO ANO',
        inicio: 'DESDE O INICIO'
      };
      spanPeriodo.textContent = nomes[tipo] || '';
    }

  }
}

// Redimensiona o gráfico corretamente ao redimensionar a janela
window.addEventListener('resize', () => {
  if (graficoPeso) {
    graficoPeso.resize();
  }
});