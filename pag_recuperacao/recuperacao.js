// ../pag_recuperacao/recuperacao.js

import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { tema } from "../Funcoes/temaNavegador.js";
import { mostrarSenha } from "../Funcoes/mostrarSenha.js";
import { bloquearTecla } from "../Funcoes/teclas.js";
import { mostrarErro, limparErros } from "../Funcoes/errosUI.js";

tema();
mostrarSenha();

/* ===== elementos ===== */
const formNovaSenha = document.getElementById("form_nova_senha");
const senha1 = document.getElementById("nova_senha");
const senha2 = document.getElementById("confirmar_senha");

/* ===== helpers de erro (com novos mostrarErro/limparErros) ===== */
const CAMPOS_AMBOS = ["nova_senha", "confirmar_senha"];
const ERRO_SPAN_ID = "confirmar_senha_erro";

// limpa erro dos dois campos e do span
function clearErrors() {
  limparErros(CAMPOS_AMBOS, ERRO_SPAN_ID);
}

// erro que pinta os dois campos
function showErrorBoth(msg) {
  mostrarErro(CAMPOS_AMBOS, ERRO_SPAN_ID, msg);
}

// erro que pinta apenas o segundo campo (quando não confere)
function showErrorLast(msg) {
  mostrarErro("confirmar_senha", ERRO_SPAN_ID, msg);
}

/* ===== UX: bloquear espaços e limpar erros ao digitar ===== */
bloquearTecla("nova_senha", " ");
bloquearTecla("confirmar_senha", " ");

["input", "change"].forEach((evt) => {
  senha1?.addEventListener(evt, clearErrors);
  senha2?.addEventListener(evt, clearErrors);
});

/* ===== status / CSRF ===== */
let csrfToken = null;

function erroSessaoExpirada(msg = "Sessão expirada. Gere um novo token.") {
  showErrorBoth(msg);
  // replace para não manter a página no histórico
  window.location.replace("../pag_login/login.html");
}

async function carregarStatus() {
  try {
    const resp = await fetch(`${API_BASE_URL}/password-reset/status`, {
      credentials: "include",
    });

    if (!resp.ok) {
      if (resp.status === 401) {
        erroSessaoExpirada();
        return;
      }
      showErrorBoth("Falha de conexão. Tente novamente.");
      return;
    }

    const data = await resp.json();
    csrfToken = data?.csrf || null;
  } catch (e) {
    console.error("status error:", e);
    showErrorBoth("Falha de conexão. Tente novamente.");
  }
}

/* ===== validadores ===== */
function temLetra(s) { return /[A-Za-z]/.test(s); }
function temNumero(s) { return /[0-9]/.test(s); }
function temRepeticao5Seguidas(s) { return /(.)\1{3,}/.test(s); } // 4 iguais em sequência

// Sequência monotônica (asc/desc) de 4+ chars, dígitos OU letras
function temSequenciaMaiorQue3(s) {
  const isDigit = (c) => /[0-9]/.test(c);
  const isAlpha = (c) => /[A-Za-z]/.test(c);

  let run = 1;
  let dir = 0;

  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1], b = s[i];

    const sameDigit = isDigit(a) && isDigit(b);
    const sameAlpha = isAlpha(a) && isAlpha(b);
    if (!sameDigit && !sameAlpha) { run = 1; dir = 0; continue; }

    const diff = b.charCodeAt(0) - a.charCodeAt(0);
    const step = (diff === 1 || diff === -1) ? diff : 0;

    if (step !== 0 && (dir === 0 || step === dir)) {
      run += 1;
      dir = step;
      if (run >= 4) return true;
    } else {
      dir = step;
      run = step !== 0 ? 2 : 1;
    }
  }
  return false;
}

/* ===== submit ===== */
if (formNovaSenha) {
  formNovaSenha.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const s1 = (senha1?.value || "").trim();
    const s2 = (senha2?.value || "").trim();

    // === validações locais ===
    if (!s1) {
      showErrorBoth("Senha obrigatória.");
      return;
    }
    if (s1.length < 8) {
      showErrorBoth("Mínimo de 8 caracteres.");
      return;
    }
    if (!s2) {
      showErrorBoth("Confirmação obrigatória.");
      return;
    }
    if (s1 !== s2) {
      // quando não confere, SOMENTE o 2º campo em vermelho
      showErrorLast("As senhas não conferem.");
      return;
    }
    if (!temLetra(s1) || !temNumero(s1)) {
      showErrorBoth("Deve conter números e letras.");
      return;
    }
    if (temRepeticao5Seguidas(s1)) {
      showErrorBoth("Repetição excessiva de caracteres.");
      return;
    }
    if (temSequenciaMaiorQue3(s1)) {
      showErrorBoth("Senha fraca");
      return;
    }

    try {
      const statusResp = await fetch(`${API_BASE_URL}/password-reset/status`, {
        credentials: "include",
      });

      if (!statusResp.ok) {
        if (statusResp.status === 401) {
          erroSessaoExpirada();
          return;
        }
        showErrorBoth("Falha ao validar a sessão. Recarregue a página.");
        return;
      }

      const statusData = await statusResp.json();
      const csrf = statusData?.csrf || "";

      const confirmResp = await fetch(`${API_BASE_URL}/password-reset/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf,
        },
        credentials: "include",
        body: JSON.stringify({ novaSenha: s1 }),
      });

      if (!confirmResp.ok) {
        if (confirmResp.status === 401) {
          erroSessaoExpirada();
          return;
        }
        if (confirmResp.status === 403) {
          showErrorBoth("Requisição inválida. Reabra a página.");
          return;
        }

        try {
          const data = await confirmResp.json();
          if (data?.error === "WEAK_PASSWORD") {
            showErrorBoth("Mínimo de 8 caracteres.");
          } else if (data?.error === "NEEDS_LETTER_AND_DIGIT") {
            showErrorBoth("Deve conter números e letras.");
          } else if (data?.error === "TOO_REPETITIVE") {
            showErrorBoth("Repetição excessiva de caracteres.");
          } else if (data?.error === "SEQUENTIAL") {
            showErrorBoth("Senha fraca");
          } else {
            showErrorBoth("Não foi possível alterar a senha agora.");
          }
        } catch {
          showErrorBoth("Não foi possível alterar a senha agora.");
        }
        return;
      }

      alert("Senha alterada com sucesso!");
      window.location.replace("../pag_login/login.html");
    } catch (err) {
      console.error("confirm error:", err);
      showErrorBoth("Falha de conexão. Tente novamente.");
    }
  });
}

window.addEventListener("pageshow", async (e) => {
  const cameFromBFCache =
    e.persisted ||
    (performance && performance.getEntriesByType &&
      performance.getEntriesByType("navigation")[0]?.type === "back_forward");

  if (cameFromBFCache) {
    try {
      const resp = await fetch(`${API_BASE_URL}/password-reset/status`, {
        credentials: "include",
      });
      if (!resp.ok) {
        window.location.replace("../pag_login/login.html");
        return;
      }

    } catch {
      window.location.replace("../pag_login/login.html");
    }
  }
});

window.addEventListener("popstate", () => {
  window.location.replace("../pag_login/login.html");
});

document.addEventListener("DOMContentLoaded", () => {
  try {
    history.replaceState(null, "", window.location.href);
  } catch {}
  carregarStatus();
});
