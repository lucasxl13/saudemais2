// exercicio.js

import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { gerarSidebar } from "../Funcoes/sidebar.js";
import { verificarAutenticacao } from "../Funcoes/autenticacao.js";
import { inicializarNavbarETema } from "../Funcoes/navbar.js";

/* ========= Inicialização global ========= */

inicializarNavbarETema();
verificarAutenticacao(API_BASE_URL);
gerarSidebar();

/* ========= Helpers de data ========= */

const MAP_WEEKDAY_PT = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
  7: "Domingo",
};

function formatarDataBR(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// intervalo da semana a partir das datas dos exercícios
function calcularIntervaloSemana(exercicios, fallbackLabel) {
  if (Array.isArray(exercicios) && exercicios.length > 0) {
    const datas = exercicios.map((e) => new Date(e.entry_date));
    const min = new Date(Math.min(...datas));
    const max = new Date(Math.max(...datas));
    const f = (d) =>
      d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return `${f(min)} — ${f(max)}`;
  }
  return fallbackLabel ? `Semana ${fallbackLabel}` : "";
}

// gera S-49, S-50 etc com base em uma data
function getISOWeekLabel(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNumber =
    1 +
    Math.round(
      ((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    );
  return `S-${weekNumber}`;
}

/* ========= Helpers de agregação ========= */

function agruparPorDia(exercicios) {
  const dias = {};
  exercicios.forEach((ex) => {
    if (!dias[ex.weekday]) dias[ex.weekday] = [];
    dias[ex.weekday].push(ex);
  });
  return dias;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* ========= Estado da página ========= */

let EXERCICIOS_SEMANA = [];
let EXS_BY_DAY = {};
let DIA_SELECIONADO = null;
let CURRENT_WEEK_LABEL = null;

/* ========= API ========= */

async function buscarExerciciosProfessor(weekLabelOptional) {
  const token = sessionStorage.getItem("jwt");
  if (!token) throw new Error("Sem token JWT");

  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id || payload.userId || payload.sub;

  let weekLabel =
    weekLabelOptional ||
    localStorage.getItem("exercicios_week_label") ||
    getISOWeekLabel();

  const resp = await fetch(
    `${API_BASE_URL}/alunos/${userId}/exercicio/${weekLabel}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!resp.ok) {
    throw new Error("Erro ao buscar exercícios");
  }

  const dadosApi = await resp.json(); // é exatamente o array que você mandou

  // guarda a semana atual
  localStorage.setItem("exercicios_week_label", weekLabel);

  return { weekLabel, exercicios: dadosApi };
}

/* ========= Renderização ========= */

function renderDiasSemana() {
  const semanaDias = document.getElementById("semanaDias");
  semanaDias.innerHTML = "";

  EXS_BY_DAY = agruparPorDia(EXERCICIOS_SEMANA);

  // escolha do dia padrão: hoje, se tiver treino; senão, o primeiro dia com treino
  const hoje = new Date();
  let hojeWeekday = hoje.getDay(); // 0=Dom
  hojeWeekday = hojeWeekday === 0 ? 7 : hojeWeekday;

  const diasComTreino = Object.keys(EXS_BY_DAY)
    .map(Number)
    .sort((a, b) => a - b);

  if (!DIA_SELECIONADO) {
    DIA_SELECIONADO = diasComTreino.includes(hojeWeekday)
      ? hojeWeekday
      : diasComTreino[0] || null;
  }

  // cria um botão pra cada dia da semana (1..7)
  for (let dia = 1; dia <= 7; dia++) {
    const label = MAP_WEEKDAY_PT[dia];
    const listaDia = EXS_BY_DAY[dia];

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "btn btn-sm me-1 mb-1 " +
      (dia === DIA_SELECIONADO ? "btn-light" : "btn-outline-light");
    btn.textContent = label;

    if (!listaDia || listaDia.length === 0) {
      btn.disabled = true;
      btn.classList.add("btn-disabled");
    } else {
      btn.addEventListener("click", () => {
        DIA_SELECIONADO = dia;
        // atualiza estilos dos botões
        Array.from(semanaDias.querySelectorAll("button")).forEach((b) => {
          b.classList.remove("btn-light");
          b.classList.add("btn-outline-light");
        });
        btn.classList.remove("btn-outline-light");
        btn.classList.add("btn-light");

        renderExerciciosDoDia();
      });
    }

    semanaDias.appendChild(btn);
  }
}

function renderExerciciosDoDia() {
  const lista = document.getElementById("listaGrupos");
  const tituloDia = document.getElementById("tituloDiaSelecionado");
  const resumoPorGrupo = document.getElementById("resumoPorGrupo");
  const tempoTotalEl = document.getElementById("tempoTotal");
  const volumeTotalEl = document.getElementById("volumeTotal");
  const totalDoneEl = document.getElementById("totalDone");

  lista.innerHTML = "";
  resumoPorGrupo.innerHTML = "";

  const exerciciosDia = EXS_BY_DAY[DIA_SELECIONADO] || [];

  // título do dia
  if (exerciciosDia.length > 0) {
    const nomeDia = MAP_WEEKDAY_PT[DIA_SELECIONADO];
    const dataDia = formatarDataBR(exerciciosDia[0].entry_date);
    tituloDia.textContent = dataDia ? `${nomeDia} (${dataDia})` : nomeDia;

    // também preenche o input date com o dia selecionado
    const isoDate = exerciciosDia[0].entry_date.slice(0, 10);
    const picker = document.getElementById("dataPicker");
    if (picker) picker.value = isoDate;
  } else {
    tituloDia.textContent = "Nenhum exercício neste dia.";
  }

  let tempoTotal = 0;
  let volumeTotal = 0;
  const resumoGrupo = {}; // { grupo: { qtd, volume } }

  exerciciosDia.forEach((ex) => {
    const d = ex.details || {};
    const titulo = d.title || ex.title || "Exercício";
    const musculo = d.muscle_group || "";
    const sets = num(d.sets);
    const reps = num(d.reps);
    const peso = num(d.weight);
    const tempo = num(d.time_minutes);
    const distancia = d.distance_km ? `${d.distance_km} km` : "";
    const descanso = d.rest_seconds ? `${d.rest_seconds}s` : "";
    const descricao = d.descricao || "";

    const volume = sets * reps * peso;
    volumeTotal += volume;
    tempoTotal += tempo;

    if (musculo) {
      if (!resumoGrupo[musculo]) {
        resumoGrupo[musculo] = { qtd: 0, volume: 0 };
      }
      resumoGrupo[musculo].qtd += 1;
      resumoGrupo[musculo].volume += volume;
    }

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="card h-100 ex-card">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h6 class="mb-0">${titulo}</h6>
            ${
              musculo
                ? `<span class="badge bg-success-subtle text-success-emphasis text-uppercase">${musculo}</span>`
                : ""
            }
          </div>

          <div class="text-muted mb-1">
            ${sets || reps ? `${sets} x ${reps} reps` : ""}
            ${peso ? ` • ${peso} kg` : ""}
          </div>

          ${
            tempo || distancia
              ? `
            <div class="text-muted mb-1">
              ${tempo ? `Tempo: ${tempo} min` : ""}
              ${distancia ? ` • Distância: ${distancia}` : ""}
            </div>
          `
              : ""
          }

          ${
            descanso
              ? `
            <div class="text-muted mb-1">
              Descanso: ${descanso}
            </div>
          `
              : ""
          }

          ${
            descricao
              ? `
            <p class="small mt-1 mb-2">${descricao}</p>
          `
              : ""
          }

          <div class="mt-auto d-flex justify-content-between align-items-center small">
            <span>Volume: <strong>${volume} kg</strong></span>
          </div>
        </div>
      </div>
    `;

    lista.appendChild(col);
  });

  // resumo lateral
  totalDoneEl.textContent = "0"; // ainda não controlamos "concluído"
  tempoTotalEl.textContent = `${tempoTotal} min`;
  volumeTotalEl.textContent = `${volumeTotal} kg`;

  Object.entries(resumoGrupo).forEach(([grupo, info]) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="d-flex justify-content-between">
        <span>${grupo}</span>
        <span>${info.qtd} ex • ${info.volume} kg</span>
      </div>
    `;
    resumoPorGrupo.appendChild(div);
  });
}

function atualizarRangeSemana() {
  const rangeSemana = document.getElementById("rangeSemana");
  const texto = calcularIntervaloSemana(EXERCICIOS_SEMANA, CURRENT_WEEK_LABEL);
  if (rangeSemana) rangeSemana.textContent = texto;
}

/* ========= Navegação de semana ========= */

async function carregarSemana(weekLabelOptional) {
  const { weekLabel, exercicios } = await buscarExerciciosProfessor(
    weekLabelOptional
  );
  CURRENT_WEEK_LABEL = weekLabel;
  EXERCICIOS_SEMANA = exercicios;
  DIA_SELECIONADO = null; // força recalcular padrão

  atualizarRangeSemana();
  renderDiasSemana();
  if (DIA_SELECIONADO !== null) {
    renderExerciciosDoDia();
  } else {
    // sem treino na semana
    document.getElementById("listaGrupos").innerHTML =
      '<p class="text-muted small">Nenhum plano de exercícios para esta semana.</p>';
  }
}

/* ========= Boot ========= */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await carregarSemana(); // semana atual
  } catch (err) {
    console.error("Erro ao carregar exercícios:", err);
    document.getElementById("listaGrupos").innerHTML =
      '<p class="text-danger small">Não foi possível carregar o plano de exercícios.</p>';
    return;
  }

  // Botões de navegação de semana
  const btnPrev = document.getElementById("semanaAnterior");
  const btnNext = document.getElementById("semanaSeguinte");
  const btnHoje = document.getElementById("btnHoje");
  const datePicker = document.getElementById("dataPicker");

  if (btnPrev) {
    btnPrev.addEventListener("click", async () => {
      if (!CURRENT_WEEK_LABEL) return;
      const n = parseInt(CURRENT_WEEK_LABEL.split("-")[1] || "1", 10);
      await carregarSemana(`S-${Math.max(n - 1, 1)}`);
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", async () => {
      if (!CURRENT_WEEK_LABEL) return;
      const n = parseInt(CURRENT_WEEK_LABEL.split("-")[1] || "1", 10);
      await carregarSemana(`S-${n + 1}`);
    });
  }

  if (btnHoje) {
    btnHoje.addEventListener("click", async () => {
      await carregarSemana(getISOWeekLabel(new Date()));
    });
  }

  if (datePicker) {
    datePicker.addEventListener("change", async (e) => {
      const val = e.target.value;
      if (!val) return;
      const dt = new Date(`${val}T00:00:00`);
      const label = getISOWeekLabel(dt);
      await carregarSemana(label);

      // tentar selecionar o weekday dessa data
      let wd = dt.getDay(); // 0=Dom
      wd = wd === 0 ? 7 : wd;
      if (EXS_BY_DAY[wd]) {
        DIA_SELECIONADO = wd;
        renderDiasSemana();
        renderExerciciosDoDia();
      }
    });
  }
});
