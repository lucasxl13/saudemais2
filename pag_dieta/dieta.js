import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { gerarSidebar } from "../Funcoes/sidebar.js";
import { verificarAutenticacao } from "../Funcoes/autenticacao.js";
import { inicializarNavbarETema } from "../Funcoes/navbar.js";
inicializarNavbarETema();

verificarAutenticacao(API_BASE_URL);
gerarSidebar();

/* ============= Helpers gerais ============= */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function normalizarTexto(txt) {
  return (txt || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, "").replace(/\s+/g, "").toLowerCase();
}

function getNumeroSemana(data) {
  const primeiroDiaAno = new Date(data.getFullYear(), 0, 1);
  const diferenca = (data - primeiroDiaAno + 86400000) / 86400000;
  return Math.ceil(diferenca / 7);
}
function verificarSemana() {
  const hoje = new Date();
  const semanaAtual = getNumeroSemana(hoje);
  const ultimaSemana = localStorage.getItem("ultimaSemana");
  if (ultimaSemana !== String(semanaAtual)) {
    localStorage.removeItem("concluidos");
    localStorage.setItem("ultimaSemana", String(semanaAtual));
  }
}
function intervaloSemanaAtual() {
  const hoje = new Date();
  const diaSemana = (hoje.getDay() + 6) % 7; // segunda=0
  const segunda = new Date(hoje); segunda.setDate(hoje.getDate() - diaSemana);
  const domingo = new Date(segunda); domingo.setDate(segunda.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return {segunda, domingo, label:`${fmt(segunda)} a ${fmt(domingo)}`, semNum: getNumeroSemana(hoje)};
}

/* ============= Dieta temporária (com macros) ============= */
const dietaTemporaria = {
  Segunda: {
    "Café da Manhã": { texto: "2 ovos mexidos e 1 fatia de pão integral",  kcal: 300, p:20, c:28, g:12 },
    "Almoço":        { texto: "Arroz, feijão, frango grelhado e salada",   kcal: 600, p:40, c:70, g:15 },
    "Café da Tarde": { texto: "Iogurte natural e frutas vermelhas",        kcal: 250, p:12, c:30, g:8  },
    "Janta":         { texto: "Sopa de legumes e torradas integrais",      kcal: 400, p:18, c:45, g:10 },
  },
  Terca: {
    "Café da Manhã": { texto: "Vitamina de banana com aveia",              kcal: 350, p:15, c:55, g:6  },
    "Almoço":        { texto: "Frango, purê de batata e legumes",          kcal: 550, p:38, c:60, g:12 },
    "Café da Tarde": { texto: "Castanhas e uma maçã",                      kcal: 200, p:6,  c:22, g:10 },
    "Janta":         { texto: "Omelete com legumes",                        kcal: 400, p:25, c:10, g:22 },
  },
  Quarta: {
    "Café da Manhã": { texto: "Pão integral com queijo branco",            kcal: 280, p:14, c:35, g:8  },
    "Almoço":        { texto: "Carne magra, arroz integral e salada",      kcal: 580, p:36, c:65, g:14 },
    "Café da Tarde": { texto: "Tapioca com banana",                        kcal: 260, p:5,  c:52, g:3  },
    "Janta":         { texto: "Peixe grelhado com legumes",                kcal: 420, p:32, c:20, g:18 },
  },
  Quinta: {
    "Café da Manhã": { texto: "Iogurte natural com granola",               kcal: 300, p:16, c:40, g:7  },
    "Almoço":        { texto: "Frango desfiado, arroz e feijão",           kcal: 570, p:35, c:65, g:12 },
    "Café da Tarde": { texto: "Suco natural e biscoito integral",          kcal: 230, p:3,  c:48, g:3  },
    "Janta":         { texto: "Sopa de abóbora",                            kcal: 380, p:10, c:50, g:12 },
  },
  Sexta: {
    "Café da Manhã": { texto: "Ovos e torradas integrais",                 kcal: 320, p:20, c:28, g:12 },
    "Almoço":        { texto: "Carne assada, arroz integral e salada",     kcal: 590, p:40, c:60, g:16 },
    "Café da Tarde": { texto: "Fruta e mix de castanhas",                  kcal: 220, p:6,  c:20, g:12 },
    "Janta":         { texto: "Sanduíche natural de frango",               kcal: 410, p:28, c:40, g:10 },
  },
  Sabado: {
    "Café da Manhã": { texto: "Pão com ovo e suco natural",                kcal: 330, p:16, c:40, g:10 },
    "Almoço":        { texto: "Peixe, purê de batata e salada",            kcal: 560, p:35, c:55, g:16 },
    "Café da Tarde": { texto: "Iogurte e granola",                         kcal: 240, p:12, c:35, g:5  },
    "Janta":         { texto: "Wrap de frango com legumes",                kcal: 420, p:30, c:45, g:10 },
  },
  Domingo: {
    "Café da Manhã": { texto: "Panqueca de aveia e mel",                   kcal: 350, p:12, c:55, g:8  },
    "Almoço":        { texto: "Lasanha de frango com salada",              kcal: 650, p:35, c:70, g:18 },
    "Café da Tarde": { texto: "Bolo integral e café",                      kcal: 280, p:6,  c:45, g:7  },
    "Janta":         { texto: "Crepioca com queijo",                       kcal: 390, p:24, c:30, g:14 },
  },
};

/* ============= Cabeçalho (semana, frase, aluno) ============= */
function preencherCabecalho() {
  const {label, semNum} = intervaloSemanaAtual();
  $("#subtitulo-semana").textContent = `Semana ${semNum} — ${label}`;

  const frases = [
    "Você está mais perto do seu objetivo do que ontem!",
    "Consistência vence intensidade.",
    "Hidratação e foco: o combo do sucesso!",
    "Movimente-se, alimente-se bem, durma melhor.",
    "Cada refeição é uma oportunidade de cuidar de você."
  ];
  $("#frase-motivacional").textContent = frases[Math.floor(Math.random() * frases.length)];
}

/* ============= API: buscar dieta do professor (com fallback) ============= */
async function buscarDietaProfessor() {
  const container = $(".container-backdieta");
  const loadingMsg = document.createElement("p");
  loadingMsg.textContent = "⏳ Carregando dieta...";
  loadingMsg.style.textAlign = "center";
  loadingMsg.style.color = "#aaa";
  container.appendChild(loadingMsg);

  try {
    const resp = await fetch(`${API_BASE_URL}/dieta/aluno`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    loadingMsg.remove();

    if (!resp.ok) throw new Error("Erro ao buscar dieta");
    const dados = await resp.json();

    if (!dados || Object.keys(dados).length === 0) return dietaTemporaria;

    // se API não tiver macros, você pode preenchê-las aqui opcionalmente
    localStorage.setItem("dieta", JSON.stringify(dados));
    return dados;
  } catch (e) {
    console.warn("API indisponível. Usando dieta temporária.", e);
    loadingMsg.remove();
    return dietaTemporaria;
  }
}

/* ============= Progresso (refeições concluídas) ============= */
function atualizarBotao(botao, concluido) {
  if (concluido) {
    botao.classList.add("btn-concluido");
    botao.innerHTML = "✔ Concluído";
  } else {
    botao.classList.remove("btn-concluido");
    botao.innerHTML = "Concluir";
  }
}

function atualizarProgresso() {
  const total = $$("[data-dia][data-refeicao]").length;
  const concl = JSON.parse(localStorage.getItem("concluidos")) || {};
  let done = 0;
  for (const d in concl) for (const r in concl[d]) if (concl[d][r]) done++;

  const pct = total ? Math.round((done/total)*100) : 0;
  $("#progresso-texto").textContent = `Progresso da semana: ${done}/${total} refeições concluídas (${pct}%)`;
  const barra = $("#progresso-barra-inner");
  barra.style.width = pct + "%";
  // cor dinâmica (vermelho→amarelo→verde)
  if (pct < 35) barra.style.backgroundColor = "#ff6b6b";
  else if (pct < 70) barra.style.backgroundColor = "#ffd166";
  else barra.style.backgroundColor = "#66ffcc";
}

/* ============= Painel de calorias + gráfico ============= */
let grafico; // Chart.js instance

function atualizarPainelCalorias(dieta) {
  const concluidos = JSON.parse(localStorage.getItem("concluidos")) || {};
  let totalPlanejado = 0, consumido = 0, totalRefeicoes = 0;
  let prot=0, carb=0, gord=0;

  // somatórios
  for (const dia in dieta) {
    for (const ref in dieta[dia]) {
      const item = dieta[dia][ref] || {};
      const kcal = item.kcal || 0;
      const p = item.p || 0, c = item.c || 0, g = item.g || 0;

      totalPlanejado += kcal;
      prot += p; carb += c; gord += g;
      totalRefeicoes++;

      if (concluidos[dia]?.[ref]) consumido += kcal;
    }
  }

  // meta estimada (500 kcal/ref)
  const meta = totalRefeicoes * 500;
  const restante = Math.max(totalPlanejado - consumido, 0);

  // atualizar textos
  $("#meta-kcal").textContent = `${meta.toLocaleString()} kcal`;
  $("#planejado-kcal").textContent = `${totalPlanejado.toLocaleString()} kcal`;
  $("#consumido-kcal").textContent = `${consumido.toLocaleString()} kcal`;
  $("#restante-kcal").textContent = `${restante.toLocaleString()} kcal`;

  // barra horizontal
  const pct = totalPlanejado ? Math.min(100, Math.round((consumido / totalPlanejado) * 100)) : 0;
  $("#barra-calorias-inner").style.width = pct + "%";

  // label de percentual no centro do gráfico
  const pctLabel = $("#grafico-percentual");
  if (pctLabel) pctLabel.textContent = `${pct}%`;

  // macros
  $("#macro-proteina").textContent = `${prot.toLocaleString()} g`;
  $("#macro-carbo").textContent   = `${carb.toLocaleString()} g`;
  $("#macro-gordura").textContent = `${gord.toLocaleString()} g`;

  // gráfico doughnut (consumido vs restante do planejado)
  const ctx = $("#graficoCalorias").getContext("2d");
  const data = [consumido, Math.max(totalPlanejado - consumido, 0)];
  const labels = ["Consumido", "Restante do planejado"];

  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ["#66ffcc", "#333"],
        borderWidth: 0
      }]
    },
    options: {
      cutout: "65%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      }
    }
  });
}

/* ============= Renderizar dieta nos cards ============= */
function preencherCardsComDieta(dieta) {
  $$("[data-dia][data-refeicao]").forEach((btn) => {
    const diaAttr = btn.getAttribute("data-dia");
    const refAttr = btn.getAttribute("data-refeicao");

    // tentar mapear com tolerância de acentos
    const chaveDia = Object.keys(dieta).find(k => normalizarTexto(k) === normalizarTexto(diaAttr));
    const refeicoes = chaveDia ? dieta[chaveDia] : null;
    const chaveRef = refeicoes ? Object.keys(refeicoes).find(k => normalizarTexto(k) === normalizarTexto(refAttr)) : null;

    const dado = (refeicoes && refeicoes[chaveRef]) || { texto: "Dieta não definida", kcal: 0, p:0, c:0, g:0 };

    const box = btn.closest(".refeicao").querySelector(".refeicao-info");
    box.querySelector(".refeicao-descricao").textContent = dado.texto;
    box.querySelector(".refeicao-macros").textContent =
      `kcal: ${dado.kcal || 0} | P: ${dado.p || 0}g | C: ${dado.c || 0}g | G: ${dado.g || 0}g`;
  });
}

/* ============= Concluir / restaurar estados ============= */
function ligarBotoesConcluir(dieta) {
  const concluidos = JSON.parse(localStorage.getItem("concluidos")) || {};
  $$("[data-dia][data-refeicao]").forEach((btn) => {
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

/* ============= Feedback (simulado) ============= */
function ligarFeedback() {
  $("#feedback-enviar").onclick = async () => {
    const texto = ($("#feedback-texto").value || "").trim();
    if (!texto) { alert("Escreva seu feedback antes de enviar 😊"); return; }
    // Simulação: aqui você pode fazer POST para sua API
    // await fetch(`${API_BASE_URL}/dieta/feedback`, { method:'POST', body: JSON.stringify({ texto }) ... })
    alert("Feedback enviado ao professor! Obrigado por compartilhar 🙌");
    $("#feedback-texto").value = "";
  };
}

/* ============= Inicialização ============= */
document.addEventListener("DOMContentLoaded", async () => {
  verificarSemana();
  preencherCabecalho();

  const dieta = await buscarDietaProfessor();          // API ou temporária
  preencherCardsComDieta(dieta);
  ligarBotoesConcluir(dieta);

  atualizarProgresso();
  atualizarPainelCalorias(dieta);
  ligarFeedback();
});
