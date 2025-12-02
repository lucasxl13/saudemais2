import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { gerarSidebar } from "../Funcoes/sidebar.js";
import { verificarAutenticacao } from "../Funcoes/autenticacao.js";
import { inicializarNavbarETema } from "../Funcoes/navbar.js";
inicializarNavbarETema();

verificarAutenticacao(API_BASE_URL);
gerarSidebar();

/* ===================== Helpers ===================== */

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function normalizarTexto(txt) {
  return (txt || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, "").replace(/\s+/g, "").toLowerCase();
}

/* Mapa dias: weekday → PT */
const MAP_WEEKDAY_PT = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
  7: "Domingo"
};

/* Refeições padrão */
const REFEICOES_PADRAO = [
  "Café da Manhã",
  "Almoço",
  "Café da Tarde",
  "Jantar"
];

/* Nomes corrigidos */
const MAP_REF_NORMALIZADO = {
  "janta": "Jantar",
  "jantar": "Jantar",
  "almoco": "Almoço",
  "almoço": "Almoço",
  "cafe da manha": "Café da Manhã",
  "cafe da tarde": "Café da Tarde"
};

/* ===================== Cabeçalho ===================== */

function preencherCabecalho(weekLabel) {
  const subtitulo = document.querySelector("#subtitulo-semana");
  if (!subtitulo) return;

  // se vier algo tipo "S-48" da lógica / localStorage, mostra isso
  if (weekLabel) {
    subtitulo.textContent = weekLabel;
    return;
  }

  // fallback: mostra intervalo da semana atual
  const hoje = new Date();
  const diaSemana = (hoje.getDay() + 6) % 7;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - diaSemana);
  const domingo = new Date(segunda);
  domingo.setDate(segunda.getDate() + 6);

  const fmt = d => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  subtitulo.textContent = `${fmt(segunda)} — ${fmt(domingo)}`;
}

/* ===================== Conversor da API ===================== */

function converterDietaAPIParaInterna(lista) {
  if (!Array.isArray(lista)) return {};

  const interna = {};

  // inicia todos os dias com refeições padrão
  for (let wd = 1; wd <= 7; wd++) {
    const diaPt = MAP_WEEKDAY_PT[wd];
    interna[diaPt] = {};

    REFEICOES_PADRAO.forEach(ref => {
      interna[diaPt][ref] = {
        texto: ref,
        kcal: 0,
        p: 0,
        c: 0,
        g: 0,
        time: null,
        id: null,
        alimentos: []
      };
    });
  }

  // preenche dados reais
  for (const item of lista) {
    const diaPt = MAP_WEEKDAY_PT[item.weekday];
    if (!diaPt) continue;

    const nomeBruto = item.title;
    const norm = normalizarTexto(nomeBruto);
    const nomeFinal = MAP_REF_NORMALIZADO[norm] || nomeBruto;

    const d = item.details || {};

    interna[diaPt][nomeFinal] = {
      texto: nomeFinal,
      kcal: Number(d.calories || 0),
      p: Number(d.protein_g || 0),
      c: Number(d.carbs_g || 0),
      g: Number(d.fat_g || 0),
      time: d.time || null,
      id: item.id,
      alimentos: d.alimentos || []
    };
  }

  return interna;
}

/* ===================== Preencher Cards ===================== */

function preencherCardsComDieta(dieta) {

  $$("[data-dia][data-refeicao]").forEach(btn => {
    const diaAttr = btn.getAttribute("data-dia");
    const refAttr = btn.getAttribute("data-refeicao");

    const diaEncontrado = Object.keys(dieta)
      .find(k => normalizarTexto(k) === normalizarTexto(diaAttr));

    const refeicoes = diaEncontrado ? dieta[diaEncontrado] : null;

    const refEncontrada = refeicoes
      ? Object.keys(refeicoes).find(k =>
          normalizarTexto(k) === normalizarTexto(refAttr)
        )
      : null;

    const dado = (refeicoes && refeicoes[refEncontrada]) || {
      texto:"Dieta não definida", kcal:0, p:0, c:0, g:0, alimentos:[]
    };

    const box = btn.closest(".refeicao").querySelector(".refeicao-info");

    // título/descrição
    box.querySelector(".refeicao-descricao").textContent = dado.texto;

    // macros
    box.querySelector(".refeicao-macros").textContent =
      `kcal: ${dado.kcal} | P: ${dado.p}g | C: ${dado.c}g | G: ${dado.g}g`;

    // alimentos
    const ul = box.querySelector(".refeicao-alimentos");
    if (!ul) return;

    ul.innerHTML = "";

    if (dado.alimentos.length > 0) {
      dado.alimentos.forEach(a => {
        const li = document.createElement("li");
        li.textContent = `${a.nome} — ${a.quantidade_g}`;
        ul.appendChild(li);
      });
    } else {
      ul.innerHTML = `<li style="color:#777;font-size:.85rem;">Nenhum alimento listado</li>`;
    }
  });
}

/* ===================== Botões concluir ===================== */

function atualizarBotao(botao, concluido) {
  if (concluido) {
    botao.classList.add("btn-concluido");
    botao.innerHTML = "✔ Concluído";
  } else {
    botao.classList.remove("btn-concluido");
    botao.innerHTML = "Concluir";
  }
}

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

/* ===================== Progresso ===================== */

function atualizarProgresso() {
  const total = $$("[data-dia][data-refeicao]").length;
  const concl = JSON.parse(localStorage.getItem("concluidos")) || {};

  let done = 0;

  for (const d in concl)
    for (const r in concl[d])
      if (concl[d][r]) done++;

  const pct = total ? Math.round((done / total) * 100) : 0;

  $("#progresso-texto").textContent =
    `Progresso da semana: ${done}/${total} refeições concluídas (${pct}%)`;

  const barra = $("#progresso-barra-inner");
  barra.style.width = pct + "%";

  if (pct < 35) barra.style.backgroundColor = "#ff6b6b";
  else if (pct < 70) barra.style.backgroundColor = "#ffd166";
  else barra.style.backgroundColor = "#66ffcc";
}

/* ===================== Painel de calorias ===================== */

function atualizarPainelCalorias(dieta) {
  const concluidos = JSON.parse(localStorage.getItem("concluidos")) || {};

  let total = 0, consumido = 0;
  let prot=0, carb=0, gord=0;

  for (const dia in dieta) {
    for (const ref in dieta[dia]) {
      const item = dieta[dia][ref];

      total += item.kcal;
      prot += item.p;
      carb += item.c;
      gord += item.g;

      if (concluidos[dia]?.[ref]) consumido += item.kcal;
    }
  }

  $("#planejado-kcal").textContent = total;
  $("#consumido-kcal").textContent = consumido;
  $("#restante-kcal").textContent = total - consumido;

  $("#macro-proteina").textContent = prot + " g";
  $("#macro-carbo").textContent = carb + " g";
  $("#macro-gordura").textContent = gord + " g";
}

/* ===================== API ===================== */

async function buscarDietaProfessor() {
  const container = document.querySelector(".container-backdieta");

  let loadingMsg = document.createElement("p");
  loadingMsg.textContent = "⏳ Carregando dieta...";
  loadingMsg.style.textAlign = "center";
  loadingMsg.style.color = "#aaa";
  if (container) container.appendChild(loadingMsg);

  try {
    const token = sessionStorage.getItem("jwt");
    if (!token) throw new Error("Sem token");

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id || payload.userId || payload.sub;

    // tenta reaproveitar a semana salva
    let weekLabel = localStorage.getItem("dieta_week_label");

    if (!weekLabel) {
      // cálculo da semana ISO (S-48, S-49, etc.)
      const date = new Date();
      date.setHours(0,0,0,0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      const week1 = new Date(date.getFullYear(),0,4);
      const weekNumber =
        1 + Math.round(((date-week1)/86400000 -3 + (week1.getDay()+6)%7)/7);
      weekLabel = `S-${weekNumber}`;
    }

    const resp = await fetch(
      `${API_BASE_URL}/alunos/${userId}/dieta/${weekLabel}`,
      {
        headers: { "Authorization": `Bearer ${token}` }
      }
    );

    loadingMsg.remove();
    if (!resp.ok) throw new Error("Erro API");

    const dadosApi = await resp.json();

    // garante que S-48 fique salvo e apareça no header
    // localStorage.setItem("dieta_week_label", weekLabel);
    preencherCabecalho(weekLabel);

    return converterDietaAPIParaInterna(dadosApi);

  } catch (e) {
    console.warn("Erro ao buscar dieta:", e);
    loadingMsg.remove();

    // fallback: ainda tenta preencher o cabeçalho com o que tiver no localStorage
    const saved = localStorage.getItem("dieta_week_label");
    preencherCabecalho(saved || null);

    return {};
  }
}

/* ===================== Feedback ===================== */

function ligarFeedback() {
  $("#feedback-enviar").onclick = () => {
    const txt = ($("#feedback-texto").value || "").trim();
    if (!txt) return alert("Escreva algo.");
    alert("Feedback enviado!");
    $("#feedback-texto").value = "";
  };
}

/* ===================== Inicialização ===================== */

document.addEventListener("DOMContentLoaded", async () => {
  // se já tiver algo salvo, já mostra antes da API responder
  const savedWeek = localStorage.getItem("dieta_week_label");
  if (savedWeek) preencherCabecalho(savedWeek);

  const dieta = await buscarDietaProfessor();

  preencherCardsComDieta(dieta);
  ligarBotoesConcluir(dieta);
  atualizarProgresso();
  atualizarPainelCalorias(dieta);
  ligarFeedback();
});
