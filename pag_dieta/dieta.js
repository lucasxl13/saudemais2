import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { gerarSidebar } from "../Funcoes/sidebar.js";
import { verificarAutenticacao } from "../Funcoes/autenticacao.js";
import { inicializarNavbarETema } from "../Funcoes/navbar.js";
inicializarNavbarETema();

verificarAutenticacao(API_BASE_URL);
gerarSidebar();
/* ============= Preencher cards ============= */
function preencherCardsComDieta(dieta) {
  $$("[data-dia][data-refeicao]").forEach(btn => {
    const diaAttr = btn.getAttribute("data-dia");
    const refAttr = btn.getAttribute("data-refeicao");

    const chaveDia = Object.keys(dieta)
      .find(k => normalizarTexto(k) === normalizarTexto(diaAttr));

    const refeicoes = chaveDia ? dieta[chaveDia] : null;

    const chaveRef = refeicoes ? Object.keys(refeicoes)
      .find(k => normalizarTexto(k) === normalizarTexto(refAttr)) : null;

    const dado = (refeicoes && refeicoes[chaveRef]) || {
      texto:"Dieta não definida", kcal:0, p:0, c:0, g:0
    };

    const box = btn.closest(".refeicao").querySelector(".refeicao-info");
    box.querySelector(".refeicao-descricao").textContent = dado.texto;
    box.querySelector(".refeicao-macros").textContent =
      `kcal: ${dado.kcal} | P: ${dado.p}g | C: ${dado.c}g | G: ${dado.g}g`;
  });
}

/* ============= Concluir refeições ============= */
function ligarBotoesConcluir(dieta) {
  const concluidos = JSON.parse(localStorage.getItem("concluidos")) || {};

  $$("[data-dia][data-refeicao]").forEach(btn => {
    const dia = btn.getAttribute("data-dia");
    const ref = btn.getAttribute("data-refeicao");

    const concluido = concluidos[dia]?.[ref] || false;

    atualizarBotao(btn, concluido);

    btn.onclick = () => {
      const state = JSON.parse(localStorage.getItem("concluidos")) || {};
      if (!state[dia]) state[dia] = {};
      state[dia][ref] = !state[dia][ref];
      localStorage.setItem("concluidos", JSON.stringify(state));
      atualizarBotao(btn, state[dia][ref]);
      atualizarProgresso();
      atualizarPainelCalorias(dieta);
    };
  });
}

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function normalizarTexto(txt) {
  return (txt || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, "").replace(/\s+/g, "").toLowerCase();
}

function intervaloSemanaAtual() {
  const hoje = new Date();
  const diaSemana = (hoje.getDay() + 6) % 7; 
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - diaSemana);
  const domingo = new Date(segunda);
  domingo.setDate(segunda.getDate() + 6);

  const fmt = d => d.toLocaleDateString("pt-BR", { day:"2-digit", month:"short" });

  return {
    label: `${fmt(segunda)} – ${fmt(domingo)}`
  };
}

const MAP_DIAS_EN_PT = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

/* ============= Dieta temporária ============= */
const dietaTemporaria = {
  Segunda: {
    "Café da Manhã": { texto:"Sem dados", kcal:0, p:0, c:0, g:0 }
  }
};

/* ============= Conversor Structure Diet -> formato interno ============= */
function converterDietaAPIParaInterna(dadosApi) {
  if (!dadosApi || !dadosApi.diet) return dietaTemporaria;

  const interna = {};

  for (const [diaEn, refeicoesArray] of Object.entries(dadosApi.diet)) {
    const diaPt = MAP_DIAS_EN_PT[diaEn] || diaEn;
    interna[diaPt] = {};

    refeicoesArray.forEach(ref => {
      const titulo = ref.title || "Refeição";
      interna[diaPt][titulo] = {
        texto: titulo,
        kcal: ref.calories   || 0,
        p:    ref.protein_g  || 0,
        c:    ref.carbs_g    || 0,
        g:    ref.fat_g      || 0,
        time: ref.time       || null,
        id:   ref.id         || null
      };
    });
  }

  return interna;
}

function preencherCabecalho() {
  const weekLabel = localStorage.getItem("dieta_week_label");

  if (weekLabel) {
    $("#subtitulo-semana").textContent = weekLabel;
  } else {
    const { label } = intervaloSemanaAtual();
    $("#subtitulo-semana").textContent = label;
  }

  const frases = [
    "Você está mais perto do seu objetivo do que ontem!",
    "Consistência vence intensidade.",
    "Hidratação e foco: o combo do sucesso!",
    "Movimente-se, alimente-se bem, durma melhor.",
    "Cada refeição é uma oportunidade de cuidar de você."
  ];

  $("#frase-motivacional").textContent =
    frases[Math.floor(Math.random() * frases.length)];
}

/* ============= API ROTA ============= */
async function buscarDietaProfessor() {
  const container = document.querySelector(".container-backdieta"); // Ajustei para JS puro para garantir compatibilidade
  
  let loadingMsg = document.createElement("p");
  loadingMsg.textContent = "⏳ Carregando dieta...";
  loadingMsg.style.textAlign = "center";
  loadingMsg.style.color = "#aaa";
  if(container) container.appendChild(loadingMsg);

  try {
    // 1. PEGAR O TOKEN
    const token = sessionStorage.getItem("jwt") || (rawLocal ? JSON.parse(rawLocal).token : null);
    if (!token) throw new Error("Token de autenticação não encontrado.");

    // 2. DECODIFICAR O ID (Lógica in-line)
    // Pega a parte do meio do JWT (payload), arruma formatação e decodifica
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    // Tenta pegar o ID (ajuste 'id' ou 'userId' conforme seu backend)
    const userId = payload.id || payload.userId || payload.sub || payload.studentId;

    if (!userId) throw new Error("Não foi possível obter o ID do usuário.");

    // 3. PEGAR OU CALCULAR A SEMANA (Lógica in-line ISO 8601)
    let weekLabel = localStorage.getItem("dieta_week_label");
    
    if (!weekLabel) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      // Ajusta para a Quinta-feira da semana atual
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      // Primeiro dia do ano
      const week1 = new Date(date.getFullYear(), 0, 4);
      // Cálculo matemático da semana
      const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
      
      weekLabel = `S-${weekNumber}`;
    }

    // 4. FAZER A REQUISIÇÃO
    const resp = await fetch(
      `${API_BASE_URL}/alunos/${userId}/dieta/${encodeURIComponent(weekLabel)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    loadingMsg.remove();

    if (!resp.ok) throw new Error("Erro ao buscar dieta");

    const dadosApi = await resp.json();

    if (dadosApi.week_label) {
      localStorage.setItem("dieta_week_label", dadosApi.week_label);
    } else {
      localStorage.setItem("dieta_week_label", weekLabel);
    }

    const dietaNormalizada = converterDietaAPIParaInterna(dadosApi);

    localStorage.setItem("dieta", JSON.stringify(dietaNormalizada));
    return dietaNormalizada;

  } catch (e) {
    console.warn("API indisponível ou erro local:", e);
    loadingMsg.remove();
    // Retorna null ou sua dieta temporária, conforme sua lógica
    return typeof dietaTemporaria !== 'undefined' ? dietaTemporaria : null;
  }
}


function atualizarBotao(botao, concluido) {
  if (concluido) {
    botao.classList.add("btn-concluido");
    botao.innerHTML = "✔ Concluído";
  } else {
    botao.classList.remove("btn-concluido");
    botao.innerHTML = "Concluir";
  }
}

/* ============= Progresso ============= */
function atualizarProgresso() {
  const total = $$("[data-dia][data-refeicao]").length;
  const concl = JSON.parse(localStorage.getItem("concluidos")) || {};
  let done = 0;

  for (const d in concl) {
    for (const r in concl[d]) {
      if (concl[d][r]) done++;
    }
  }

  const pct = total ? Math.round((done/total)*100) : 0;
  $("#progresso-texto").textContent = `Progresso da semana: ${done}/${total} refeições concluídas (${pct}%)`;
  const barra = $("#progresso-barra-inner");
  barra.style.width = pct + "%";
  // cor dinâmica (vermelho→amarelo→verde)
  if (pct < 35) barra.style.backgroundColor = "#ff6b6b";
  else if (pct < 70) barra.style.backgroundColor = "#ffd166";
  else barra.style.backgroundColor = "#66ffcc";
}

/* ============= Painel de calorias ============= */
let grafico;

function atualizarPainelCalorias(dieta) {
  const concluidos = JSON.parse(localStorage.getItem("concluidos")) || {};

  let totalPlanejado = 0, consumido = 0;
  let prot=0, carb=0, gord=0;

  for (const dia in dieta) {
    for (const ref in dieta[dia]) {
      const item = dieta[dia][ref];

      totalPlanejado += item.kcal;
      prot  += item.p;
      carb  += item.c;
      gord  += item.g;

      if (concluidos[dia]?.[ref]) consumido += item.kcal;
    }
  }

  $("#planejado-kcal").textContent = `${totalPlanejado}`;
  $("#consumido-kcal").textContent = `${consumido}`;
  $("#restante-kcal").textContent  = `${totalPlanejado - consumido}`;
  $("#macro-proteina").textContent = `${prot} g`;
  $("#macro-carbo").textContent    = `${carb} g`;
  $("#macro-gordura").textContent  = `${gord} g`;
}

/* ============= Feedback ============= */
function ligarFeedback() {
  $("#feedback-enviar").onclick = async () => {
    const texto = ($("#feedback-texto").value || "").trim();
    if (!texto) return alert("Escreva seu feedback antes de enviar.");
    alert("Feedback enviado!");
    $("#feedback-texto").value = "";
  };
}

/* ============= Inicialização ============= */
document.addEventListener("DOMContentLoaded", async () => {
  preencherCabecalho();

  const dieta = await buscarDietaProfessor();

  preencherCardsComDieta(dieta);
  ligarBotoesConcluir(dieta);
  atualizarProgresso();
  atualizarPainelCalorias(dieta);
  ligarFeedback();
});
