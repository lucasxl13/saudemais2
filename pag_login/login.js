// ../pag_login/login.js
import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { tema } from "../Funcoes/temaNavegador.js";
import { mostrarSenha } from "../Funcoes/mostrarSenha.js";
import { bloquearTecla } from "../Funcoes/teclas.js";
import { mostrarErro, resetErros } from "../Funcoes/errosUI.js";
import { validade_email } from "../Funcoes/validar_email.js";

tema();
bloquearTecla("email", " ");
bloquearTecla("senha", " ");
mostrarSenha();
resetErros(
  ["email", "senha", "email_rec", "token_rec", "#otp_group .otp_input"],
  ["email_erro", "senha_erro", "email_rec_erro", "token_erro"]
);


document.addEventListener("DOMContentLoaded", () => {
  const storedDataLocal = localStorage.getItem("jwt");
  const storedDataSession = sessionStorage.getItem("jwt");

  let tokenData = null;
  if (storedDataLocal) {
    tokenData = JSON.parse(storedDataLocal);
  } else if (storedDataSession) {
    tokenData = { token: storedDataSession };
  }

  if (tokenData) {
    const { token, expiresAt } = tokenData;
    if (expiresAt && Date.now() >= expiresAt) {
      localStorage.removeItem("jwt");
      sessionStorage.removeItem("jwt");
    } else if (token) {
      window.location.href = "../pag_principal/principal.html";
    }
  }
});

// ================== LOGIN ==================
const formLogin = document.getElementById("login");
if (formLogin) {
  formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const email = (formData.get("email") || "").toString().trim();
    const senha = (formData.get("senha") || "").toString();
    const manterConectado = formData.get("lembrar_conectado") !== null;

    let temErro = false;

    if (!email) {
      mostrarErro("email", "email_erro", "Campo obrigatório");
      temErro = true;
    } else if (!validade_email(email)) {
      mostrarErro("email", "email_erro", "Formato de E-mail inválido");
      temErro = true;
    }

    if (!senha) {
      mostrarErro("senha", "senha_erro", "Campo obrigatório");
      temErro = true;
    }

    if (temErro) return;

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        mostrarErro(["email", "senha"], "senha_erro", "E-mail ou senha inválidos");
        return;
      }

      const data = await response.json();
      if (data?.token) {
        if (manterConectado) {
          const expirationTime = Date.now() + 60 * 60 * 1000;
          localStorage.setItem(
            "jwt",
            JSON.stringify({ token: data.token, expiresAt: expirationTime })
          );
        } else {
          sessionStorage.setItem("jwt", data.token);
        }
        window.location.href = "../pag_principal/principal.html";
      } else {
        mostrarErro(["email", "senha"], "senha_erro", "Resposta inválida do servidor");
      }
    } catch (err) {
      console.error("Erro ao tentar fazer login:", err);
      mostrarErro(["email", "senha"], "senha_erro", "Falha de conexão. Tente novamente.");
    }
  });
}

const btnRegistro = document.getElementById("btn_registro");
if (btnRegistro) {
  btnRegistro.addEventListener("click", () => {
    window.location.href = "../pag_cadastro/cadastro.html";
  });
}

// ================== RECUPERAÇÃO ==================
const btnEsqueceu = document.getElementById("btn_esqueceu");
const container_recuperacao = document.getElementById("container_recuperacao");
const fechar = document.getElementById("fechar_recuperacao");
const fechar2 = document.getElementById("fechar_recuperacao2");

const formRecuperacao = document.getElementById("formulario_recuperacao");
const emailRecInput = document.getElementById("email_rec");
const formRecuperacao2 = document.getElementById("formulario_recuperacao2");

const TOKEN_TIMER_KEY = "rec_token_expires_at";
let tokenTimerInterval = null;

const PWD_RESET_EMAIL_KEY = "pwd_reset_email";
function setResetEmail(v) {
  localStorage.setItem(PWD_RESET_EMAIL_KEY, v);
}
function getResetEmail() {
  return localStorage.getItem(PWD_RESET_EMAIL_KEY) || "";
}
function clearResetEmail() {
  localStorage.removeItem(PWD_RESET_EMAIL_KEY);
}

function setTokenExpiry(ts) {
  localStorage.setItem(TOKEN_TIMER_KEY, String(ts));
}
function getTokenExpiry() {
  const v = localStorage.getItem(TOKEN_TIMER_KEY);
  return v ? parseInt(v, 10) : null;
}
function clearTokenExpiry() {
  localStorage.removeItem(TOKEN_TIMER_KEY);
}

function msToMMSS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function ensureTimerElement() {
  const otpGroup = document.getElementById("otp_group");
  if (!otpGroup) return null;
  let timerEl = document.getElementById("otp_timer");
  if (!timerEl) {
    timerEl = document.createElement("div");
    timerEl.id = "otp_timer";
    timerEl.setAttribute("aria-live", "polite");
    timerEl.style.marginTop = "0.5rem";
    timerEl.style.fontSize = "0.9rem";
    timerEl.style.textAlign = "center";
    otpGroup.after(timerEl);
  }
  return timerEl;
}

function startOrResumeTokenTimer() {
  const exp = getTokenExpiry();
  if (!exp) return;

  let timerEl = ensureTimerElement();
  if (!timerEl) return;

  if (tokenTimerInterval) {
    clearInterval(tokenTimerInterval);
    tokenTimerInterval = null;
  }

  const inputs = Array.from(document.querySelectorAll("#otp_group .otp_input"));

  function attachResendHandler(el) {
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
    timerEl = document.getElementById("otp_timer");
    timerEl?.addEventListener("click", async () => {
      const email =
        getResetEmail() || document.getElementById("email_rec")?.value?.trim() || "";
      if (!email) {
        mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Informe o e-mail novamente.");
        return;
      }
      try {
        const resp = await fetch(`${API_BASE_URL}/password-reset/request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data?.ok) {
          mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Não foi possível reenviar. Tente mais tarde.");
          return;
        }
        const newExp = Date.now() + (data.expiresInSec ?? 300) * 1000;
        setTokenExpiry(newExp);
        inputs.forEach((i) => i.removeAttribute("disabled"));
        startOrResumeTokenTimer();
        focarPrimeiroVazioOTP();
      } catch (err) {
        console.error("resend otp error:", err);
        mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Falha de conexão ao reenviar.");
      }
    });
  }

  function tick() {
    const remaining = exp - Date.now();
    if (remaining <= 0) {
      clearInterval(tokenTimerInterval);
      tokenTimerInterval = null;
      clearTokenExpiry();

      timerEl.textContent = "Reenviar token";
      timerEl.classList.add("reenviar", "acoes");
      timerEl.setAttribute("role", "button");
      timerEl.setAttribute("tabindex", "0");

      inputs.forEach((i) => i.setAttribute("disabled", "true"));
      attachResendHandler(timerEl);
      return;
    }

    timerEl.textContent = msToMMSS(remaining);
    timerEl.classList.remove("reenviar", "acoes");
  }

  inputs.forEach((i) => i.removeAttribute("disabled"));

  tick();
  tokenTimerInterval = setInterval(tick, 1000);
}

function resetRecuperacao() {
  document.getElementById("formulario_recuperacao")?.reset();
  document.getElementById("formulario_recuperacao2")?.reset();
}

function abrirRecuperacao() {
  resetRecuperacao();

  const exp = getTokenExpiry();
  container_recuperacao?.classList.add("ativo");
  if (exp && Date.now() < exp) {
    document.querySelector(".container_recuperacao")?.classList.remove("ativo");
    document.querySelector(".container_recuperacao2")?.classList.add("ativo");
    setupOTP();
    setTimeout(() => focarPrimeiroVazioOTP(), 50);
    startOrResumeTokenTimer();
  } else {
    document.querySelector(".container_recuperacao")?.classList.add("ativo");
    document.querySelector(".container_recuperacao2")?.classList.remove("ativo");
    emailRecInput?.focus();
  }
}

function fecharRecuperacao() {
  container_recuperacao?.classList.remove("ativo");
  document.querySelector(".container_recuperacao")?.classList.remove("ativo");
  document.querySelector(".container_recuperacao2")?.classList.remove("ativo");
  resetRecuperacao();
}

if (btnEsqueceu) btnEsqueceu.addEventListener("click", abrirRecuperacao);
if (fechar) fechar.addEventListener("click", fecharRecuperacao);
if (fechar2) fechar2.addEventListener("click", fecharRecuperacao);
if (container_recuperacao) {
  container_recuperacao.addEventListener("click", (e) => {
    if (e.target === container_recuperacao) fecharRecuperacao();
  });
}

bloquearTecla("email_rec", " "); // espaço
bloquearTecla("token_rec", " "); // espaço

function atualizarHiddenOTP() {
  const inputs = Array.from(document.querySelectorAll("#otp_group .otp_input"));
  const hidden = document.getElementById("token_rec");
  if (!hidden) return;
  hidden.value = inputs.map((i) => i.value || "").join("");
}

function focarPrimeiroVazioOTP() {
  const inputs = Array.from(document.querySelectorAll("#otp_group .otp_input"));
  const alvo = inputs.find((i) => !i.value);
  (alvo || inputs[inputs.length - 1]).focus();
}

function setupOTP() {
  const group = document.getElementById("otp_group");
  if (!group) return;

  const inputs = Array.from(group.querySelectorAll(".otp_input"));
  const hidden = document.getElementById("token_rec");

  inputs.forEach((inp) => {
    inp.value = "";
    inp.removeAttribute("disabled");
    inp.classList.remove("falha");
  });
  if (hidden) hidden.value = "";

  if (inputs.length > 0) inputs[0].focus();

  inputs.forEach((inp, idx) => {
    inp.addEventListener("input", () => {
      inp.value = (inp.value || "").replace(/\D+/g, "");
      if (inp.value && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
        inputs[idx + 1].select?.();
      }
      atualizarHiddenOTP();
    });

    inp.addEventListener("keydown", (e) => {
      const key = e.key;
      if (key === "Backspace") {
        if (!inp.value && idx > 0) {
          e.preventDefault();
          inputs[idx - 1].focus();
          inputs[idx - 1].value = "";
          atualizarHiddenOTP();
        }
      } else if (key === "ArrowLeft" && idx > 0) {
        inputs[idx - 1].focus();
        e.preventDefault();
      } else if (key === "ArrowRight" && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
        e.preventDefault();
      } else if (key.length === 1 && /\D/.test(key)) {
        e.preventDefault();
      }
    });

    inp.addEventListener("focus", () => {
      inp.select?.();
    });
  });

  group.addEventListener("paste", (e) => {
    e.preventDefault();
    const texto = (e.clipboardData || window.clipboardData).getData("text") || "";
    const digits = texto.replace(/\D+/g, "").slice(0, inputs.length).split("");
    inputs.forEach((inp, i) => {
      inp.value = digits[i] || "";
    });
    atualizarHiddenOTP();
    focarPrimeiroVazioOTP();
  });

  ensureTimerElement();
}

function abrirPasso2OTP() {
  document.querySelector(".container_recuperacao")?.classList.remove("ativo");
  document.querySelector(".container_recuperacao2")?.classList.add("ativo");
  setupOTP();

  document.getElementById("email_target").textContent = getResetEmail();

  setTimeout(() => {
    focarPrimeiroVazioOTP();
  }, 50);
  startOrResumeTokenTimer();
}

async function verificarDisponibilidadeEmail(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/verificar-email/${encodeURIComponent(email)}`);
    if (response.status === 409) {
      return { ok: true, disponivel: false };
    }
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return { ok: true, disponivel: !!data.disponivel };
    }
    return { ok: false };
  } catch (error) {
    console.error("Erro ao verificar disponibilidade do e-mail:", error);
    return { ok: false };
  }
}

if (formRecuperacao) {
  formRecuperacao.addEventListener("submit", async (e) => {
    e.preventDefault();


    const fd = new FormData(e.target);
    const email_rec = (fd.get("email_rec") || "").toString().trim();

    let temErro = false;
    if (!email_rec) {
      mostrarErro("email_rec", "email_rec_erro", "Campo obrigatório");
      temErro = true;
    } else if (!validade_email(email_rec)) {
      mostrarErro("email_rec", "email_rec_erro", "Formato de E-mail inválido");
      temErro = true;
    }
    if (temErro) return;

    const submitBtn = formRecuperacao.querySelector('button[type="submit"]');
    submitBtn?.setAttribute("disabled", "true");

    const resultado = await verificarDisponibilidadeEmail(email_rec);
    if (!resultado.ok) {
      submitBtn?.removeAttribute("disabled");
      mostrarErro("email_rec", "email_rec_erro", "Não foi possível validar o e-mail agora");
      return;
    }
    if (resultado.disponivel) {
      submitBtn?.removeAttribute("disabled");
      mostrarErro("email_rec", "email_rec_erro", "E-mail não cadastrado");
      return;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/password-reset/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email_rec }),
      });

      const data = await resp.json().catch(() => ({}));
      submitBtn?.removeAttribute("disabled");

      if (resp.status === 429 && data?.error === "RATE_LIMITED") {
        mostrarErro("email_rec", "email_rec_erro", `Limite diário atingido. Tente novamente amanhã.`);
        return;
      }

      if (!resp.ok || !data?.ok) {
        const reason = data?.error || "UNKNOWN";
        if (reason === "EMAIL_NOT_FOUND") {
          mostrarErro("email_rec", "email_rec_erro", "E-mail não cadastrado");
        } else {
          mostrarErro("email_rec", "email_rec_erro", "Falha ao enviar o token. Tente novamente.");
        }
        return;
      }

      const expiresAt = Date.now() + (data.expiresInSec ?? 300) * 1000;
      setTokenExpiry(expiresAt);
      setResetEmail(email_rec);
      document.getElementById("email_target").textContent = email_rec;

      abrirPasso2OTP();
    } catch (err) {
      submitBtn?.removeAttribute("disabled");
      console.error("password-reset/request error:", err);
      mostrarErro("email_rec", "email_rec_erro", "Falha de conexão. Tente de novo.");
    }
  });
}

if (formRecuperacao2) {
  formRecuperacao2.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(e.target);
    const token = (fd.get("token_rec") || "").toString().trim();

    if (!/^\d{6}$/.test(token)) {
      mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Informe o token de 6 dígitos");
      return;
    }

    const exp = getTokenExpiry();
    if (!exp || Date.now() >= exp) {
      mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Token expirado. Clique em Reenviar.");
      return;
    }

    const email = getResetEmail() || document.getElementById("email_rec")?.value?.trim() || "";
    if (!email) {
      mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Algo deu errado. Volte e informe o e-mail.");
      return;
    }

    const btn = formRecuperacao2.querySelector('button[type="submit"]');
    btn?.setAttribute("disabled", "true");

    try {
      const resp = await fetch(`${API_BASE_URL}/password-reset/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, token }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data?.ok) {
        const reason = data?.error;
        if (reason === "TOKEN_EXPIRED") {
          mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Token expirado. Clique em Reenviar.");
        } else if (reason === "TOO_MANY_ATTEMPTS") {
          mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Muitas tentativas. Gere um novo token.");
        } else {
          mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Token inválido.");
        }
        return;
      }

      clearTokenExpiry();
      clearResetEmail();

      window.location.href = "../pag_recuperacao/recuperacao.html";
    } catch (err) {
      console.error("password-reset/verify error:", err);
      mostrarErro(["#otp_group .otp_input", "token_rec"], "token_erro", "Falha de conexão. Tente novamente.");
    } finally {
      btn?.removeAttribute("disabled");
    }
  });
}
