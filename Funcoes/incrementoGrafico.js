export async function diminuirRegistro(tipo, registro, campo, atualizarFunc, atualizarGrafico) {
  let novoValor = registro[campo].consumido - tipo;
  if (novoValor < 0) novoValor = 0;
  registro[campo].consumido = novoValor;
  await atualizarFunc(`${campo}_consumido`, novoValor);
  atualizarGrafico(registro);
}

export async function aumentarRegistro(tipo, registro, campo, atualizarFunc, atualizarGrafico) {
  let novoValor = registro[campo].consumido + tipo;
  if (novoValor > 20000) {
    alert("Limite máximo de 20.000 atingido.");
    return;
  }
  registro[campo].consumido = novoValor;
  await atualizarFunc(`${campo}_consumido`, novoValor);
  atualizarGrafico(registro);
}

// Controle de incremento contínuo
let intervaloIncremento = null;
let timeoutPressionar = null;
let estaPressionado = false;

const velocidadeInicial = 400;
const fatorAceleracao = 0.85;

function iniciarIncremento(valor, tipoOperacao, campo, atualizarFunc, atualizarGrafico) {
  let delay = velocidadeInicial;
  estaPressionado = true;

  async function repetir() {
    if (!estaPressionado) return;

    const registro = window.usuarioLogado.historico_metricas.at(-1);

    if (tipoOperacao === 'aumentar') {
      await aumentarRegistro(valor, registro, campo, atualizarFunc, atualizarGrafico);
    } else {
      await diminuirRegistro(valor, registro, campo, atualizarFunc, atualizarGrafico);
    }

    delay = Math.max(50, delay * fatorAceleracao);
    intervaloIncremento = setTimeout(repetir, delay);
  }

  repetir();
}

function pararIncremento() {
  estaPressionado = false;
  clearTimeout(intervaloIncremento);
  clearTimeout(timeoutPressionar);
  intervaloIncremento = null;
  timeoutPressionar = null;
}

export function configurarBotaoIncremento(botao, tipoOperacao, campo, atualizarFunc, atualizarGrafico) {
  const valor = parseInt(botao.dataset.valor);

  const iniciar = (e) => {
    e.preventDefault();
    estaPressionado = true;
    timeoutPressionar = setTimeout(() =>
      iniciarIncremento(valor, tipoOperacao, campo, atualizarFunc, atualizarGrafico), 300);
  };

  const parar = async (e) => {
    e.preventDefault();
    if (timeoutPressionar) {
      const registro = window.usuarioLogado.historico_metricas.at(-1);
      if (tipoOperacao === 'aumentar') {
        await aumentarRegistro(valor, registro, campo, atualizarFunc, atualizarGrafico);
      } else {
        await diminuirRegistro(valor, registro, campo, atualizarFunc, atualizarGrafico);
      }
    }
    pararIncremento();
  };

  botao.addEventListener('mousedown', iniciar);
  botao.addEventListener('touchstart', iniciar, { passive: false });

  botao.addEventListener('mouseup', parar);
  botao.addEventListener('mouseleave', pararIncremento);
  botao.addEventListener('touchend', parar, { passive: false });
  botao.addEventListener('touchcancel', pararIncremento); // ESSENCIAL PARA CELULAR
}