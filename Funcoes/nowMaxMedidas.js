export function preencherMedidasComNowMax(metricas, seletor = '.medidas p') {
  if (!metricas || metricas.length === 0) return;

  const ultimoRegistro = metricas[metricas.length - 1];

  const maioresValores = {
    altura: 0,
    cintura: 0,
    biceps_direito: 0,
    biceps_esquerdo: 0,
    antebraco_direito: 0,
    antebraco_esquerdo: 0,
    coxa_direita: 0,
    coxa_esquerda: 0,
    panturrilha_direita: 0,
    panturrilha_esquerda: 0,
  };

  // Encontra os maiores valores no histórico
  metricas.forEach((registro) => {
    const medidas = registro.medidas_corporais || {};
    Object.keys(maioresValores).forEach((chave) => {
      const valorAtual = chave === "altura" ? registro.altura : medidas[chave];
      if (valorAtual !== undefined && valorAtual > maioresValores[chave]) {
        maioresValores[chave] = valorAtual;
      }
    });
  });

  const ultimoValores = {
    altura: ultimoRegistro.altura,
    cintura: ultimoRegistro.medidas_corporais?.cintura,
    biceps_direito: ultimoRegistro.medidas_corporais?.biceps_direito,
    biceps_esquerdo: ultimoRegistro.medidas_corporais?.biceps_esquerdo,
    antebraco_direito: ultimoRegistro.medidas_corporais?.antebraco_direito,
    antebraco_esquerdo: ultimoRegistro.medidas_corporais?.antebraco_esquerdo,
    coxa_direita: ultimoRegistro.medidas_corporais?.coxa_direita,
    coxa_esquerda: ultimoRegistro.medidas_corporais?.coxa_esquerda,
    panturrilha_direita: ultimoRegistro.medidas_corporais?.panturrilha_direita,
    panturrilha_esquerda: ultimoRegistro.medidas_corporais?.panturrilha_esquerda,
  };

  const nomesChaves = Object.keys(ultimoValores);
  const elementos = document.querySelectorAll(seletor);

  elementos.forEach((el, index) => {
    const chave = nomesChaves[index];
    const atual = ultimoValores[chave];
    const maior = maioresValores[chave];

    if (atual !== undefined) {
      const nomeExibido = el.textContent.split(":")[0];

      // ⚠️ Atualiza apenas o nó de texto antes do span, se existir
      const span = el.querySelector('span');
      if (span) {
        el.childNodes[0].textContent = `${nomeExibido}: ${atual} cm (${maior} cm)`;
      } else {
        el.textContent = `${nomeExibido}: ${atual} cm (${maior} cm)`;
      }

      el.setAttribute("data-nome", chave);
      el.setAttribute("data-valor", atual);
    }
  }); 
}

import icones from './icones.js';

export function atualizarVariacoes(metricasPeriodo) {
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

      const corClasse = variacao > 0 ? "variacao-positiva" :
                        variacao < 0 ? "variacao-negativa" : "variacao-neutra";

      let corIcone = "#f9a825";
      if (variacao > 0) corIcone = "#00c853";
      else if (variacao < 0) corIcone = "#d50000";

      const icone = variacao < 0
        ? icones.down(corIcone)
        : variacao > 0
          ? icones.up(corIcone)
          : icones.equal(corIcone);

      icone.style.marginRight = "0.4rem";

      const span = document.getElementById(spanId);
      if (span) {
        span.textContent = "";
        span.appendChild(icone);
        span.append(`${variacao.toFixed(1)}%`);

        span.classList.remove("variacao-positiva", "variacao-negativa", "variacao-neutra");
        span.classList.add(corClasse);
      }
    }
  });
}