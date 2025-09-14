// ../pag_recuperacao/recuperacao.js

import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { tema } from "../Funcoes/temaNavegador.js";
import { mostrarSenha } from "../Funcoes/mostrarSenha.js";
import { bloquearTecla } from "../Funcoes/teclas.js";
import { mostrarErro, resetErros } from "../Funcoes/errosUI.js";
import { validarSenha } from "../Funcoes/forcaSenha.js"

tema();

mostrarSenha();

bloquearTecla("nova_senha", " ");
bloquearTecla("confirmar_senha", " ");

resetErros(
  ["nova_senha", "confirmar_senha"],
  ["nova_senha_erro", "confirmar_senha_erro"]
);

/* ===== elementos ===== */
const formNovaSenha = document.getElementById("form_nova_senha");
const senha1 = document.getElementById("nova_senha");
const senha2 = document.getElementById("confirmar_senha");


function showErrorBoth(msg) {
  mostrarErro(["nova_senha", "confirmar_senha"], "confirmar_senha_erro", msg);
}

function showErrorFirst(msg) {
  mostrarErro(["nova_senha",], "nova_senha_erro", msg);
}

function showErrorLast(msg) {
  mostrarErro("confirmar_senha", "confirmar_senha_erro", msg);
}

let csrfToken = null;

function erroSessaoExpirada(msg = "Sessão expirada. Gere um novo token.") {
  showErrorBoth(msg);
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

if (formNovaSenha) {
  formNovaSenha.addEventListener("submit", async (e) => {
    e.preventDefault();


    const s1 = (senha1?.value || "").trim();
    const s2 = (senha2?.value || "").trim();

    if (!s1 && !s2) {
      showErrorBoth("Campos obrigatórios .");
      return;
    }
    if (!s1) {
      showErrorFirst("Campo obrigatório.");
      return;
    }
    if (!s2) {
      showErrorBoth("Confirmação obrigatória.");
      return;
    }
    if (s1.length < 8) {
      showErrorBoth("Mínimo de 8 caracteres.");
      return;
    }
    if (s1 !== s2) {
      showErrorLast("As senhas não conferem.");
      return;
    }

    const r = validarSenha(s1);

    if (!r.ok) {
      showErrorBoth(r.msg);
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
  } catch { }
  carregarStatus();
});
