// ../Funcoes/errosUI.js

/** Garante que sempre retorna array */
const ensureArray = (v) => (Array.isArray(v) ? v : [v]);

/** Resolve IDs ou seletores em elementos DOM */
function resolveTargets(idsOrSelectors) {
  const items = ensureArray(idsOrSelectors);
  const out = [];

  items.forEach((ref) => {
    if (!ref) return;

    if (ref instanceof HTMLElement) {
      out.push(ref);
      return;
    }

    if (typeof ref === "string") {
      const isSelector =
        ref.startsWith("#") ||
        ref.startsWith(".") ||
        ref.includes(" ") ||
        ref.includes("[") ||
        ref.includes(">") ||
        ref.includes(":");

      if (isSelector) {
        document.querySelectorAll(ref).forEach((el) => out.push(el));
      } else {
        const el = document.getElementById(ref);
        if (el) out.push(el);
      }
    }
  });

  return out;
}

/** Mostra mensagem e aplica classe "falha" */
export function mostrarErro(campoRefs, erroId, mensagem = "") {

  const campos = resolveTargets(campoRefs);
  campos.forEach((el) => el.classList.add("falha"));

  const span = document.getElementById(erroId);
  if (span) {
    span.textContent = mensagem;
    span.classList.add("mostrar");
  }
}

/** Limpa erros (campos e spans) */
export function limparErros(campoRefs, erroRefs) {
  resolveTargets(campoRefs).forEach((el) => el.classList.remove("falha"));

  ensureArray(erroRefs).forEach((id) => {
    const span = document.getElementById(id);
    if (span) {
      span.classList.remove("mostrar");
      span.textContent = "";
    }
  });
}

export function resetErros(campoRefs, erroRefs) {
  const handler = () => limparErros(campoRefs, erroRefs);

  resolveTargets(campoRefs).forEach((el) => {
    // Além de input/change, escute keyup/click/blur
    ["input", "change", "keyup", "click", "blur"].forEach((evt) => {
      el.addEventListener(evt, handler, { passive: true });
    });
  });
}