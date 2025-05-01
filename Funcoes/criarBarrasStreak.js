const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

export async function criarBarrasStreak(dataServidor, metricas) {
  criarSegmentos('barraStreakCal', 'segmento_calorias');
  criarSegmentos('barraStreakHidro', 'segmento_hidro');

  atualizarStreakCalorias(dataServidor, metricas);
  atualizarStreakHidratacao(dataServidor, metricas);
}

function criarSegmentos(idBarra, classeEspecifica) {
  const barra = document.getElementById(idBarra);
  if (!barra) return;

  barra.innerHTML = '';

  diasSemana.forEach(dia => {
    const segmento = document.createElement('div');
    segmento.classList.add('segmento_streak', classeEspecifica);
    segmento.textContent = dia;
    barra.appendChild(segmento);
  });
}

function atualizarStreakCalorias(dataServidor, metricas) {
  const segmentos = document.querySelectorAll('#barraStreakCal .segmento_streak');
  const diaSemanaHoje = dataServidor.getDay();

  segmentos.forEach((segmento, index) => {
    const dataDia = new Date(dataServidor);
    const diferencaDias = index - diaSemanaHoje;
    dataDia.setDate(dataServidor.getDate() + diferencaDias);
  
    if (index < diaSemanaHoje) {
      segmento.classList.add('passado');
    } else {
      segmento.classList.remove('passado');
    }
  
    const registro = metricas.find(item => datasIguais(new Date(item.registrado_em), dataDia));
  
    if (!registro || !registro.calorias) {
      segmento.classList.remove('preenchido');
      return;
    }
  
    const { consumido, meta } = registro.calorias;
    if (consumido >= (meta - 100) && consumido <= (meta + 100)) {
      segmento.classList.add('preenchido');
    } else {
      segmento.classList.remove('preenchido');
    }
  });
}

function atualizarStreakHidratacao(dataServidor, metricas) {
  const segmentos = document.querySelectorAll('#barraStreakHidro .segmento_streak');
  const diaSemanaHoje = dataServidor.getDay();

  segmentos.forEach((segmento, index) => {
    const dataDia = new Date(dataServidor);
    const diferencaDias = index - diaSemanaHoje;
    dataDia.setDate(dataServidor.getDate() + diferencaDias);
  
    if (index < diaSemanaHoje) {
      segmento.classList.add('passado');
    } else {
      segmento.classList.remove('passado');
    }
  
    const registro = metricas.find(item => datasIguais(new Date(item.registrado_em), dataDia));
  
    if (!registro || !registro.hidratacao) {
      segmento.classList.remove('preenchido');
      return;
    }
  
    const { consumido, meta } = registro.hidratacao;
    if (consumido >= (meta - 100) && consumido <= (meta + 100)) {
      segmento.classList.add('preenchido');
    } else {
      segmento.classList.remove('preenchido');
    }
  });
}

function datasIguais(data1, data2) {
  return (
    data1.getFullYear() === data2.getFullYear() &&
    data1.getMonth() === data2.getMonth() &&
    data1.getDate() === data2.getDate()
  );
}