import icones from './icones.js';
import { atualizarMetricaNoServidor } from './atualizarMetrica.js';

export function exibirControleDeDigitos(valorInicial, nomeCampo) {
  const container = document.getElementById("info_medida");
  if (!container) return;

  const mapaMaximos = {
    "ALTURA": 250,
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
    "ALTURA": "altura"
  };

  const valorMax = mapaMaximos[nomeCampo] || 250;
  let valor = valorInicial.toString().padStart(3, '0').split("").map(Number);

  const render = () => {
    const valorAtual = parseInt(valor.join(""));

    container.innerHTML = `
      <h3>${nomeCampo}</h3>
      <div id="ajuste_digitos" style="display: flex; gap: 1rem; font-size: 2rem; justify-content: center; align-items: center; margin-top: 1rem;">
        ${valor.map((digito, idx) => {
          const copia = [...valor];

          const podeSubir = (() => {
            const atual = parseInt(valor.join(""));
            if (atual >= valorMax) return false;

            if (idx === 0) {
              if (valorMax === 100) return atual < 100;
              if (valorMax === 250) return atual < 250;
              return true;
            }

            copia[idx] = (copia[idx] + 1) % 10;
            return parseInt(copia.join("")) <= valorMax;
          })();

          const podeDescer = (() => {
            if (valorAtual === 0) return false;
            if (idx === 0) return valor[0] > 0;
            return true;
          })();

          return `
            <div class="digito" data-idx="${idx}" style="display: flex; flex-direction: column; align-items: center;">
              <button class="seta seta-up" data-idx="${idx}" data-op="up" ${!podeSubir ? 'style="visibility:hidden"' : ''}></button>
              <div><strong>${digito}</strong></div>
              <button class="seta seta-down" data-idx="${idx}" data-op="down" ${!podeDescer ? 'style="visibility:hidden"' : ''}></button>
            </div>
          `;
        }).join("")}
      </div>
      <p style="margin-top: 1rem;">Valor atual: <strong id="valor_atual">${valor.join("")} cm</strong></p>
      <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 2rem;">
        <button id="btn_confirmar" class="seta"></button>
        <button id="btn_cancelar" class="seta"></button>
      </div>
    `;

    // Insere os ícones
    document.querySelectorAll(".seta-up").forEach(btn => btn.appendChild(icones.up()));
    document.querySelectorAll(".seta-down").forEach(btn => btn.appendChild(icones.down()));
    document.getElementById("btn_confirmar").appendChild(icones.confirma());
    document.getElementById("btn_cancelar").appendChild(icones.cancela());

    // Evento do botão CANCELAR
    container.addEventListener("click", (e) => {
      const alvo = e.target.closest("#btn_cancelar");
      if (alvo) {
        location.reload();
      }
    });

    // Evento do botão CONFIRMAR
    const btnConfirmar = document.getElementById("btn_confirmar");
    btnConfirmar.addEventListener("click", async () => {
      const valorFinal = parseInt(valor.join(""));
      const campoBanco = mapaCampos[nomeCampo];

      try {
        if (nomeCampo === "ALTURA") {
          await atualizarMetricaNoServidor("altura", valorFinal);
        } else {
          await atualizarMetricaNoServidor("medidas_corporais", { [campoBanco]: valorFinal });
        }

        location.reload(); // Atualiza a página após salvar
      } catch (erro) {
        console.error("Erro ao salvar a métrica:", erro);
        alert("Erro ao salvar a métrica. Tente novamente.");
      }
    });

    // Eventos dos botões de seta
    container.querySelectorAll("button.seta").forEach(btn => {
      btn.onclick = () => {
        const i = parseInt(btn.dataset.idx);
        const operacao = btn.dataset.op;
        let numeroAtual = parseInt(valor.join(""));
      
        if (operacao === "up") {
          const incremento = Math.pow(10, 2 - i);
          numeroAtual = Math.min(numeroAtual + incremento, valorMax);
        } else {
          const decremento = Math.pow(10, 2 - i);
          numeroAtual = Math.max(numeroAtual - decremento, 0);
        }
      
        valor = numeroAtual.toString().padStart(3, '0').split("").map(Number);
        render();
      };
    });
  };

  render();
}