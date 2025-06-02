import icones from './icones.js';
import { atualizarMetricaNoServidor } from './atualizarMetrica.js';

export function exibirControleDeDigitos(valorInicial, nomeCampo) {
  const container = document.getElementById("info_medida");
  if (!container) return;

  const mapaMaximos = {
    "ALTURA": 250,
    "PESO": 300,
    "CINTURA": 100,
    "BÍCEPS DIREITO": 100,
    "BÍCEPS ESQUERDO": 100,
    "ANTEBRAÇO DIREITO": 100,
    "ANTEBRAÇO ESQUERDO": 100,
    "COXA DIREITA": 100,
    "COXA ESQUERDA": 100,
    "PANTURRILHA DIREITA": 100,
    "PANTURRILHA ESQUERDA": 100
  };

  const mapaCampos = {
    "BÍCEPS DIREITO": "biceps_direito",
    "BÍCEPS ESQUERDO": "biceps_esquerdo",
    "ANTEBRAÇO DIREITO": "antebraco_direito",
    "ANTEBRAÇO ESQUERDO": "antebraco_esquerdo",
    "COXA DIREITA": "coxa_direita",
    "COXA ESQUERDA": "coxa_esquerda",
    "PANTURRILHA DIREITA": "panturrilha_direita",
    "PANTURRILHA ESQUERDA": "panturrilha_esquerda",
    "CINTURA": "cintura",
    "ALTURA": "altura",
    "PESO": "peso"
  };

  const mapaMinimos = {
  "ALTURA": 30,
  "PESO": 20
};

  const valorMax = mapaMaximos[nomeCampo] || 250;
  const valorMin = mapaMinimos[nomeCampo] || 0;
  const usarDecimal = nomeCampo === "PESO";

  let valor;
  if (usarDecimal) {
    const partes = valorInicial.toFixed(1).split(".");
    valor = partes[0].padStart(3, '0').split("").map(Number);
    valor.push(parseInt(partes[1]));
  } else {
    valor = valorInicial.toString().padStart(3, '0').split("").map(Number);
  }

const render = () => {
  const valorAtual = usarDecimal
    ? parseFloat(`${valor.slice(0, 3).join("")}.${valor[3]}`)
    : parseInt(valor.join(""));

  // Prepara a sequência de itens a renderizar
  const digitosRenderizados = valor.map((digito, idx) => ({
    type: "numero",
    valor: digito,
    idx
  }));

  if (usarDecimal) {
    // Insere vírgula visual entre inteiros e decimal (após o idx 2)
    digitosRenderizados.splice(3, 0, {
      type: "virgula"
    });
  }

  container.innerHTML = `
    <h3>${nomeCampo}</h3>
    <div id="ajuste_digitos" style="
      display: flex; 
      gap: 0.05rem;
      font-size: 2rem; 
      justify-content: center; 
      align-items: center; 
      margin-top: 1rem;
    ">
      ${digitosRenderizados.map(dig => {
        if (dig.type === "virgula") {
          return `
            <div style="
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              width: 0.03em;
            ">
              <div style="font-weight: bold;">,</div>
            </div>
          `;
        }

        const idx = dig.idx;
        const copia = [...valor];

        const podeSubir = (() => {
          if (idx === 0) {
            const atual = usarDecimal
              ? parseFloat(`${valor.slice(0, 3).join("")}.${valor[3]}`)
              : parseInt(valor.join(""));
            return atual < valorMax;
          }

          let novo;
          if (usarDecimal) {
            copia[idx] = (copia[idx] + 1) % 10;
            novo = parseFloat(`${copia.slice(0, 3).join("")}.${copia[3]}`);
          } else {
            copia[idx] = (copia[idx] + 1) % 10;
            novo = parseInt(copia.join(""));
          }
          return novo <= valorMax;
        })();

        const podeDescer = (() => {
          const atual = usarDecimal
            ? parseFloat(`${valor.slice(0, 3).join("")}.${valor[3]}`)
            : parseInt(valor.join(""));
          return atual > valorMin;
        })();

        return `
          <div class="digito" data-idx="${idx}" style="
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            width:1.2em;
          ">
            <button class="seta seta-up" data-idx="${idx}" data-op="up" ${!podeSubir ? 'style="visibility:hidden"' : ''}></button>
            <div><strong>${dig.valor}</strong></div>
            <button class="seta seta-down" data-idx="${idx}" data-op="down" ${!podeDescer ? 'style="visibility:hidden"' : ''}></button>
          </div>
        `;
      }).join("")}
    </div>

<p class="valor_atual" style="margin-top: 1rem;">
  VALOR ATUAL:  
  <strong id="valor_atual" class="valor_atual">
    ${usarDecimal ? `${valor.slice(0, 3).join("")},${valor[3]} kg` : `${valor.join("")} cm`}
  </strong>
</p>

<div class="botoes" style="margin-top: 0.2rem; display: flex; justify-content: center; gap: 1.5rem;">
  <button id="btn_confirmar" class="seta"></button>
  <button id="btn_cancelar" class="seta"></button>
</div>
  `;

  document.querySelectorAll(".seta-up").forEach(btn => btn.appendChild(icones.up()));
  document.querySelectorAll(".seta-down").forEach(btn => btn.appendChild(icones.down()));
  document.getElementById("btn_confirmar").appendChild(icones.confirma());
  document.getElementById("btn_cancelar").appendChild(icones.cancela());

  container.addEventListener("click", (e) => {
    const alvo = e.target.closest("#btn_cancelar");
    if (alvo) {
      container.innerHTML = "";
      location.reload();
    }
  });

  const btnConfirmar = document.getElementById("btn_confirmar");
  btnConfirmar.addEventListener("click", () => {
    const valorFinal = usarDecimal
      ? parseFloat(`${valor.slice(0, 3).join("")}.${valor[3]}`)
      : parseInt(valor.join(""));
    const campoBanco = mapaCampos[nomeCampo];

    container.remove();

    setTimeout(async () => {
      try {
        if (nomeCampo === "ALTURA" || nomeCampo === "PESO") {
          await atualizarMetricaNoServidor(campoBanco, valorFinal);
        } else {
          await atualizarMetricaNoServidor("medidas_corporais", { [campoBanco]: valorFinal });
        }
        location.reload();
      } catch (erro) {
        console.error("Erro ao salvar a métrica:", erro);
        alert("Erro ao salvar a métrica. Tente novamente.");
      }
    }, 0);
  });

  container.querySelectorAll("button.seta").forEach(btn => {
    btn.onclick = () => {
      const i = parseInt(btn.dataset.idx);
      const operacao = btn.dataset.op;

      let numeroAtual = usarDecimal
        ? parseFloat(`${valor.slice(0, 3).join("")}.${valor[3]}`)
        : parseInt(valor.join(""));

      let delta;
      if (operacao === "up") {
        if (i === 0) {
          delta = 100;
          if (numeroAtual + delta > valorMax) {
            delta = valorMax - numeroAtual;
          }
        } else {
          delta = usarDecimal && i === 3 ? 0.1 : Math.pow(10, 2 - i);
        }
        numeroAtual = Math.min(numeroAtual + delta, valorMax);
      } else {
        delta = usarDecimal && i === 3 ? 0.1 : Math.pow(10, 2 - i);
        numeroAtual = Math.max(numeroAtual - delta, valorMin);
      }

      if (usarDecimal) {
        const partes = numeroAtual.toFixed(1).split(".");
        valor = partes[0].padStart(3, '0').split("").map(Number);
        valor.push(parseInt(partes[1]));
      } else {
        valor = numeroAtual.toString().padStart(3, '0').split("").map(Number);
      }

      render();
    };
  });
};


  render();
}

export function inicializarControlesDeMedidas(metricas) {
  const ultimoRegistro = metricas[metricas.length - 1];

  const partes = {
    hover_biceps_direito: "BÍCEPS DIREITO",
    p_biceps_direito: "BÍCEPS DIREITO",
    hover_biceps_esquerdo: "BÍCEPS ESQUERDO",
    p_biceps_esquerdo: "BÍCEPS ESQUERDO",
    hover_antebraco_direito: "ANTEBRAÇO DIREITO",
    p_antebraco_direito: "ANTEBRAÇO DIREITO",
    hover_antebraco_esquerdo: "ANTEBRAÇO ESQUERDO",
    p_antebraco_esquerdo: "ANTEBRAÇO ESQUERDO",
    hover_coxa_direita: "COXA DIREITA",
    p_coxa_direita: "COXA DIREITA",
    hover_coxa_esquerda: "COXA ESQUERDA",
    p_coxa_esquerda: "COXA ESQUERDA",
    hover_panturrilha_direita: "PANTURRILHA DIREITA",
    p_panturrilha_direita: "PANTURRILHA DIREITA",
    hover_panturrilha_esquerda: "PANTURRILHA ESQUERDA",
    p_panturrilha_esquerda: "PANTURRILHA ESQUERDA",
    hover_cintura: "CINTURA",
    p_cintura: "CINTURA",
    hover_altura: "ALTURA",
    p_altura: "ALTURA"
  };

  Object.keys(partes).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", () => {
      const nome = partes[id];
      let valor;

      if (id.startsWith("p_")) {
        valor = parseInt(el.getAttribute("data-valor"));
      } else {
        if (id === "hover_altura") {
          valor = ultimoRegistro.altura;
        } else if (id === "hover_cintura") {
          valor = ultimoRegistro.medidas_corporais.cintura;
        } else {
          const chave = id.replace("hover_", "");
          valor = ultimoRegistro.medidas_corporais[chave];
        }
      }

      exibirControleDeDigitos(valor, nome);
    });
  });
}