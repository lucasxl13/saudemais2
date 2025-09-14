// cadastro.js > ../pag_cadastro/cadastro.js

import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { tema } from "../Funcoes/temaNavegador.js";
import { mostrarSenha } from "../Funcoes/mostrarSenha.js";
import { validade_email } from "../Funcoes/validar_email.js";
import { mostrarErro, resetErros, limparErros } from "../Funcoes/errosUI.js";
import { validarSenha } from "../Funcoes/forcaSenha.js";
import { maskShiftDecimal, maskIntegerWithSuffix } from "../Funcoes/mascarasNumeros.js";
import { bloquearTecla } from "../Funcoes/teclas.js";

// ---------------- Boot ----------------
tema();
mostrarSenha();

const bloquearEspaco = ["username","email","c_email","senha","c_senha","peso","altura"];
bloquearEspaco.forEach(id => bloquearTecla(id, " "));


// ---------------- Erros globais ----------------
const errosId = [
  "username", "email", "c_email", "senha", "c_senha",
  "nascimento", "peso", "altura",
  "f_sexo", "m_sexo",
  "meta", "meta2", "meta3",
  "check_termos"
];
const errosTexto = [
  "user_erro", "email_erro", "cemail_erro",
  "senha_erro", "csenha_erro",
  "nasc_erro", "peso_erro", "altura_erro",
  "sexo_erro", "objetivos_erro",
  "termos_erro"
];

resetErros(errosId, errosTexto);

// ---------------- Sexo ----------------
const btnF = document.getElementById("f_sexo");
const btnM = document.getElementById("m_sexo");
// ATENÇÃO: backend espera "feminino" | "masculino"
let sexo = "";

function setSexo(value) {
  sexo = value; // "feminino" ou "masculino"
  btnF?.classList.remove("ativo");
  btnM?.classList.remove("ativo");
  if (value === "feminino") btnF?.classList.add("ativo");
  if (value === "masculino") btnM?.classList.add("ativo");
  limparErros(["f_sexo", "m_sexo"], ["sexo_erro"]);
  if (currentStep === 4) updateConfirmacao();
}

btnF?.addEventListener("click", () => setSexo("feminino"));
btnM?.addEventListener("click", () => setSexo("masculino"));

// ---------------- Objetivo ----------------
// 1 = perda de peso | 2 = ganho de massa | 3 = manutenção (enviar como string)
const m1 = document.getElementById("meta");
const m2 = document.getElementById("meta2");
const m3 = document.getElementById("meta3");
let objetivo = 0;

function setObjetivo(v) {
  objetivo = v; // 1,2,3
  [m1, m2, m3].forEach(el => el?.classList.remove("ativo"));
  if (v === 1 && m1) m1.classList.add("ativo");
  if (v === 2 && m2) m2.classList.add("ativo");
  if (v === 3 && m3) m3.classList.add("ativo");
  limparErros(["meta", "meta2", "meta3"], ["objetivos_erro"]);
  if (currentStep === 4) updateConfirmacao();
}
m1?.addEventListener("click", () => setObjetivo(1));
m2?.addEventListener("click", () => setObjetivo(2));
m3?.addEventListener("click", () => setObjetivo(3));

// ---------------- Aceite de termos ----------------
const scroll = getComputedStyle(document.documentElement).getPropertyValue('--scroll');
const checkbox = document.getElementById('check_termos');
const scroll_termos = document.getElementById('scroll_termos');

document.getElementById('termos_texto')?.addEventListener('click', function () {
  if (!checkbox) return;
  checkbox.checked = !checkbox.checked;
  if (checkbox.checked) {
    checkbox.style.outline = "none";
    if (scroll_termos) {
      scroll_termos.style.outline = "none";
      scroll_termos.style.background = scroll;
    }
  }
});

function clearTermsErrorUI() {
  if (scroll_termos) {
    scroll_termos.style.background = "";
    scroll_termos.style.outline = "none";
  }
  if (checkbox) {
    checkbox.style.outline = "none";
  }
}

checkbox?.addEventListener("change", () => {
  clearTermsErrorUI();
  limparErros(["check_termos"], ["termos_erro"]);
});

// ---------------- Datepicker ----------------
try {
  if (window.flatpickr) {
    flatpickr("#nascimento", {
      locale: "pt",
      dateFormat: "d/m/Y",
      maxDate: "today",
      disableMobile: true
    });
  }
} catch { }

// ---------------- Wizard ----------------
const formCadastro = document.getElementById("cadastro");
const steps = Array.from(document.querySelectorAll(".step"));
const dots = Array.from(document.querySelectorAll(".steps_progress .dot"));
const TOTAL_STEPS = 4;
let currentStep = 1;

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

function goTo(stepNum) {
  currentStep = Math.max(1, Math.min(TOTAL_STEPS, stepNum));
  steps.forEach(s => s.classList.toggle("active", s.dataset.step === String(currentStep)));
  dots.forEach(d => d.classList.toggle("current", d.dataset.step === String(currentStep)));
  refreshNavButtons();
  if (currentStep === 4) {
    clearTermsErrorUI();
    updateConfirmacao();
  }
}

function refreshNavButtons() {
  if (currentStep === 1) {
    btnPrev?.setAttribute("aria-label", "Voltar ao login");
    if (btnPrev) btnPrev.innerHTML = `<i class="bi bi-house-door"></i>`;
  } else {
    btnPrev?.setAttribute("aria-label", "Voltar para etapa anterior");
    if (btnPrev) btnPrev.innerHTML = `<i class="bi bi-chevron-left"></i>`;
  }

  if (currentStep === TOTAL_STEPS) {
    if (btnNext) {
      btnNext.innerHTML = `<i class="bi bi-check2"></i>`;
      btnNext.setAttribute("aria-label", "Enviar cadastro");
    }
  } else {
    if (btnNext) {
      btnNext.innerHTML = `<i class="bi bi-chevron-right"></i>`;
      btnNext.setAttribute("aria-label", "Avançar");
    }
  }
}

btnPrev?.addEventListener("click", () => {
  if (currentStep === 1) {
    window.location.href = "../pag_login/login.html";
    return;
  }
  goTo(currentStep - 1);
});

btnNext?.addEventListener("click", async (e) => {
  e.preventDefault();
  if (currentStep === TOTAL_STEPS) {
    if (!validarEtapa4()) return;

    const ok1 = await validarEtapa1();
    const ok2 = validarEtapa2();
    const ok3 = validarEtapa3();
    if (!ok1 || !ok2 || !ok3) {
      if (!ok1) goTo(1);
      else if (!ok2) goTo(2);
      else goTo(3);
      return;
    }
    formCadastro?.requestSubmit();
    return;
  }

  const ok = await validarEtapaAtual(currentStep);
  if (!ok) return;
  setTimeout(() => goTo(currentStep + 1), 0);
});

goTo(1);

// ---------------- Confirmação (etapa 4) ----------------
const objetivoLabel = {
  1: "Perda de peso",
  2: "Ganho de massa",
  3: "Manutenção do peso",
};
const sexoLabel = {
  feminino: "Feminino",
  masculino: "Masculino",
};

function updateConfirmacao() {
  const byId = (id) => document.getElementById(id);

  const username = (document.getElementById("username")?.value || "").trim();
  const email = (document.getElementById("email")?.value || "").trim();
  const nascimento = (document.getElementById("nascimento")?.value || "").trim();

  const pesoExibido = (document.getElementById("peso")?.value || "").trim();
  const alturaExibida = (document.getElementById("altura")?.value || "").trim();

  const cfUsuario = byId("cf_usuario");
  const cfEmail = byId("cf_email");
  const cfNasc = byId("cf_nascimento");
  const cfPeso = byId("cf_peso");
  const cfAltura = byId("cf_altura");
  const cfSexo = byId("cf_sexo");
  const cfObj = byId("cf_objetivo");

  if (cfUsuario) cfUsuario.textContent = username || "—";
  if (cfEmail) cfEmail.textContent = email || "—";
  if (cfNasc) cfNasc.textContent = nascimento || "—";
  if (cfPeso) cfPeso.textContent = pesoExibido || "—";
  if (cfAltura) cfAltura.textContent = alturaExibida || "—";
  if (cfSexo) cfSexo.textContent = sexoLabel[sexo] || "—";
  if (cfObj) cfObj.textContent = objetivoLabel[objetivo] || "—";
}

["username", "email", "nascimento", "peso", "altura"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", () => { if (currentStep === 4) updateConfirmacao(); });
});

// ---------------- Utils ----------------
function parseMaskNumber(str) {
  // remove sufixos e mantém número (aceita vírgula)
  return parseFloat((str || "").toString().replace(/[^\d.,-]+/g, "").replace(",", "."));
}
function ddmmyyyyToISO(str) {
  // "dd/mm/aaaa" -> "aaaa-mm-dd"
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((str || "").trim());
  if (!m) return "";
  const [_, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------- Verificação de e-mail (API) ----------------
async function verificarDisponibilidadeEmail(email) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const url = `${API_BASE_URL}/verificar-email/${encodeURIComponent(email)}`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return false;
    const data = await response.json();
    return !!data.disponivel;
  } catch (error) {
    console.error("Erro ao verificar disponibilidade do e-mail:", error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------- Validações ----------------
async function validarEtapa1() {
  let temErro = false;
  const username = (document.getElementById("username")?.value || "").trim();
  const email = (document.getElementById("email")?.value || "").trim();
  const cemail = (document.getElementById("c_email")?.value || "").trim();
  const senha = (document.getElementById("senha")?.value || "").trim();
  const csenha = (document.getElementById("c_senha")?.value || "").trim();

  if (!username) {
    mostrarErro("username", "user_erro", "Campo obrigatório");
    temErro = true;
  }

  if (!email) {
    mostrarErro("email", "email_erro", "Campo obrigatório");
    temErro = true;
  } else if (!validade_email(email)) {
    mostrarErro("email", "email_erro", "Formato de E-mail inválido");
    temErro = true;
  } else {
    const emailDisponivel = await verificarDisponibilidadeEmail(email);
    if (!emailDisponivel) {
      mostrarErro("email", "email_erro", "E-mail indisponível");
      temErro = true;
    }
  }

  if (!cemail) {
    mostrarErro("c_email", "cemail_erro", "Campo obrigatório");
    temErro = true;
  } else if (!validade_email(cemail)) {
    mostrarErro("c_email", "cemail_erro", "Formato de E-mail inválido");
    temErro = true;
  } else if (email !== cemail) {
    mostrarErro("c_email", "cemail_erro", "E-mails não conferem");
    temErro = true;
  }

  if (!senha) {
    mostrarErro("senha", "senha_erro", "Campo obrigatório");
    temErro = true;
  } else {
    const fSenha = validarSenha(senha);
    if (!fSenha.ok) {
      mostrarErro(["senha", "c_senha"], "csenha_erro", fSenha.msg);
      temErro = true;
    }
  }

  if (!csenha) {
    mostrarErro("c_senha", "csenha_erro", "Campo obrigatório");
    temErro = true;
  } else if (senha !== csenha) {
    mostrarErro("c_senha", "csenha_erro", "Senhas não conferem");
    temErro = true;
  }

  return !temErro;
}

function validarEtapa2() {
  let temErro = false;
  const nasc = (document.getElementById("nascimento")?.value || "").trim();
  const peso = parseMaskNumber(document.getElementById("peso")?.value || "");
  const altura = parseMaskNumber(document.getElementById("altura")?.value || "");

  if (!nasc) {
    mostrarErro("nascimento", "nasc_erro", "Informe sua data de nascimento");
    temErro = true;
  }
  if (!sexo) {
    mostrarErro(["f_sexo", "m_sexo"], "sexo_erro", "Selecione seu sexo");
    temErro = true;
  }
  if (isNaN(peso) || peso < 20 || peso > 400) {
    mostrarErro("peso", "peso_erro", "Peso inválido (20 a 400 kg)");
    temErro = true;
  }
  if (isNaN(altura) || altura < 80 || altura > 250) {
    mostrarErro("altura", "altura_erro", "Altura inválida (80 a 250 cm)");
    temErro = true;
  }
  return !temErro;
}

function validarEtapa3() {
  let temErro = false;
  if (!objetivo) {
    mostrarErro(["meta", "meta2", "meta3"], "objetivos_erro", "Selecione seu objetivo");
    temErro = true;
  }
  return !temErro;
}

function validarEtapa4() {
  let temErro = false;
  if (checkbox && scroll_termos && checkbox.checked === false) {
    scroll_termos.style.background = "rgba(255, 0, 0, 0.055)";
    scroll_termos.style.outline = "2px solid #ff0000";
    checkbox.style.outline = "2px solid #ff0000";
    temErro = true;
  } else {
    clearTermsErrorUI();
  }
  return !temErro;
}

async function validarEtapaAtual(n) {
  switch (n) {
    case 1: return await validarEtapa1();
    case 2: return validarEtapa2();
    case 3: return validarEtapa3();
    case 4: return validarEtapa4();
    default: return true;
  }
}

// ---------------- Máscaras ----------------
const pesoEl = document.getElementById("peso");
if (pesoEl) {
  maskShiftDecimal(pesoEl, {
    suffix: "kg",
    decimals: 1,
    min: 200,   // 20.0 * 10
    max: 4000,  // 400.0 * 10
  });
}

const alturaEl = document.getElementById("altura");
if (alturaEl) {
  maskIntegerWithSuffix(alturaEl, {
    suffix: "cm",
    min: 80,
    max: 250,
  });
}

// ---------------- Submit (POST /cadastro) ----------------
if (formCadastro) {
  formCadastro.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Segurança extra: revalida tudo
    if (!validarEtapa4()) return;
    const ok1 = await validarEtapa1();
    const ok2 = validarEtapa2();
    const ok3 = validarEtapa3();
    if (!ok1 || !ok2 || !ok3) {
      if (!ok1) goTo(1);
      else if (!ok2) goTo(2);
      else goTo(3);
      return;
    }

    const fd = new FormData(event.target);

    // Extrai valores numéricos removendo sufixos
    const pesoNum = parseMaskNumber(fd.get("peso") || "");
    const alturaNum = parseMaskNumber(fd.get("altura") || "");

    // Converte nascimento para ISO
    const nascBr = (fd.get("nascimento") || "").toString().trim();
    const nascimentoISO = ddmmyyyyToISO(nascBr);

    // Monta payload alinhado ao backend
    const payload = {
      nome: (fd.get("username") || "").toString().trim(),
      senha: (fd.get("senha") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      altura: isNaN(alturaNum) ? 0 : alturaNum,    // cm (número)
      peso: isNaN(pesoNum) ? 0 : pesoNum,          // kg (número)
      nascimento: nascimentoISO,                   // "YYYY-MM-DD"
      sexo,                                        // "feminino" | "masculino"
      objetivo: String(objetivo)                   // "1" | "2" | "3"
    };

    // Envia
    const btn = btnNext;
    const originalHTML = btn?.innerHTML;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="bi bi-hourglass-split"></i>`;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        // Tenta mostrar erros em campos relacionados, senão alerta
        if (text?.toLowerCase().includes("e-mail já cadastrado")) {
          mostrarErro("email", "email_erro", "E-mail já cadastrado.");
          goTo(1);
        } else if (text?.toLowerCase().includes("campos obrigatórios")) {
          mostrarErro("username", "user_erro", "Preencha todos os campos obrigatórios.");
          goTo(1);
        } else {
          alert(text || "Erro ao processar o cadastro.");
        }
        return;
      }

      window.location.href = "../pag_login/login.html";

    } catch (err) {
      console.error("Falha na requisição /cadastro:", err);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHTML || `<i class="bi bi-check2"></i>`;
      }
    }
  });
}
