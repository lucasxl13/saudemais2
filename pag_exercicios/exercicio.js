import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { inicializarNavbarETema } from '../Funcoes/navbar.js';
inicializarNavbarETema();


verificarAutenticacao(API_BASE_URL);
gerarSidebar();

const gruposMusculares = [
  { nome: "Livre", cor: "info", emoji: "📝" },
  { nome: "Peito", cor: "danger", emoji: "🔥" },
  { nome: "Costas", cor: "primary", emoji: "🛡️" },
  { nome: "Pernas", cor: "success", emoji: "🦵" },
  { nome: "Ombros", cor: "warning", emoji: "🏋️‍♂️" },
  { nome: "Bíceps", cor: "info", emoji: "💪" },
  { nome: "Tríceps", cor: "secondary", emoji: "🫱" },
  { nome: "Abdômen", cor: "dark", emoji: "🧱" },
  { nome: "Cardio", cor: "dark", emoji: "🏃‍♂️" }
];

const opcoesPorGrupo = {
  livre: ["Alongamento", "Corrida leve", "Mobilidade articular"],
  peito: ["Supino reto", "Supino inclinado", "Crucifixo"],
  costas: ["Remada curvada", "Puxada frente", "Levantamento terra"],
  pernas: ["Agachamento", "Leg press", "Extensora"],
  ombros: ["Desenvolvimento", "Elevação lateral", "Arnold press"],
  bíceps: ["Rosca direta", "Rosca martelo"],
  tríceps: ["Tríceps testa", "Tríceps pulley"],
  abdômen: ["Abdominal reto", "Prancha", "Elevação de pernas"],
  cardio: ["Corrida", "Ciclismo", "Escada", "Remo"]
};

function formatarTempo(min) {
  const m = parseInt(min);
  if (isNaN(m) || m <= 0) return null;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h > 0 && r > 0 ? `${h}h ${r}min` : h > 0 ? `${h}h` : `${r}min`;
}

function extrairMinutos(texto) {
  const minMatch = /(\d+)\s*min/.exec(texto);
  const hrMatch = /(\d+)\s*h/.exec(texto);
  const m = minMatch ? parseInt(minMatch[1]) : 0;
  const h = hrMatch ? parseInt(hrMatch[1]) * 60 : 0;
  return m + h;
}

function salvarTreinosLocal() {
  const data = {};
  document.querySelectorAll(".grupo-card").forEach(card => {
    const grupo = card.getAttribute("data-grupo");
    const lista = card.querySelectorAll(".exercicio-card");
    data[grupo] = Array.from(lista).map(cardEl => ({
      nome: cardEl.querySelector("strong")?.textContent || "",
      desc: cardEl.querySelector(".desc-exercicio")?.textContent || ""
    }));
  });
  localStorage.setItem("treinos_salvos", JSON.stringify(data));
}

function carregarTreinosLocal(grupoId, container, atualizarResumo) {
  const data = JSON.parse(localStorage.getItem("treinos_salvos")) || {};
  const treinos = data[grupoId] || [];
  treinos.forEach(({ nome, desc }) => {
    const card = document.createElement("div");
    card.className = `exercicio-card d-flex flex-column align-items-start border-${grupoId}`;
    card.innerHTML = `
      <strong>${nome}</strong>
      <span class="desc-exercicio text-muted">${desc}</span>
      <button class="btn btn-sm btn-danger mt-2">🗑️ Remover</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      card.remove();
      salvarTreinosLocal();
      atualizarResumo();
    });
    container.appendChild(card);
  });
  atualizarResumo();
}

function criarCardTreino(grupo) {
  const grupoId = grupo.nome.toLowerCase();
  const card = document.createElement("div");
  card.className = "card card-treino mb-4 grupo-card";
  card.setAttribute("data-grupo", grupoId);

  const opcoes = opcoesPorGrupo[grupoId] || ["Exercício genérico"];

  card.innerHTML = `
    <div class="card-body position-relative">
      <h4 class="card-title text-${grupo.cor}">
        <span class="emoji-grupo">${grupo.emoji}</span> ${grupo.nome}
      </h4>
      <div class="resumo-exercicio d-flex justify-content-between small text-muted px-1 mt-2 mb-1">
        <span class="resumo-quantidade">0 exercícios</span>
        <span class="resumo-tempo">⏱ 0min</span>
      </div>
      <div class="exercicios mt-2 lista-${grupoId}"></div>
      <div class="form-container mt-3 d-none">
        <form class="form-add-exercicio d-flex gap-2 flex-wrap">
          <select class="form-select form-select-sm select-exercicio" required style="min-width:160px;">
            <option value="">Escolher exercício</option>
            ${opcoes.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>

          <select class="form-select form-select-sm select-reps" style="width:100px;">
            <option value="">Séries x reps</option>
            <option value="3x12">3x12</option>
            <option value="3x10">3x10</option>
            <option value="4x10">4x10</option>
          </select>

          ${grupoId !== "cardio" ? `
            <select class="form-select form-select-sm select-carga" style="width:80px;">
              <option value="">Carga</option>
              <option value="5kg">5kg</option>
              <option value="10kg">10kg</option>
              <option value="15kg">15kg</option>
              <option value="20kg">20kg</option>
            </select>` : `
            <input type="text" class="form-control form-control-sm input-distancia" placeholder="Distância (km)" style="width:90px;">`
          }

          <input type="number" class="form-control form-control-sm input-tempo" placeholder="Tempo (min)" style="width:90px;">
          <button type="submit" class="btn btn-sm btn-outline-${grupo.cor}">Adicionar</button>
        </form>
      </div>
    </div>
  `;

  const select = card.querySelector(".select-exercicio");
  const selectReps = card.querySelector(".select-reps");
  const selectCarga = card.querySelector(".select-carga");
  const inputDistancia = card.querySelector(".input-distancia");
  const inputTempo = card.querySelector(".input-tempo");
  const container = card.querySelector(`.lista-${grupoId}`);
  const resumoQtd = card.querySelector(".resumo-quantidade");
  const resumoTempo = card.querySelector(".resumo-tempo");
  const formContainer = card.querySelector(".form-container");

  function atualizarResumo() {
    const cards = container.querySelectorAll(".exercicio-card");
    const totalMin = Array.from(cards).reduce((acc, el) => acc + extrairMinutos(el.innerText), 0);
    const tempoFormatado = formatarTempo(totalMin);
    resumoQtd.textContent = `${cards.length} exercício${cards.length !== 1 ? "s" : ""}`;
    resumoTempo.textContent = tempoFormatado ? `⏱ ${tempoFormatado}` : "⏱ 0min";
    resumoQtd.classList.add("sub-titulo-exercicios");
    resumoTempo.classList.add("sub-titulo-exercicios");

  }

  carregarTreinosLocal(grupoId, container, atualizarResumo);

  card.querySelector("form").addEventListener("submit", e => {
    e.preventDefault();
    const nome = select.value.trim();
    const reps = selectReps.value.trim();
    const cargaOuDistancia = grupoId === "cardio"
      ? inputDistancia?.value.trim()
      : selectCarga?.value.trim();
    const tempo = inputTempo.value.trim();

    if (!nome) return;

    const partes = [];
    if (reps) partes.push(reps);
    if (cargaOuDistancia) partes.push(cargaOuDistancia);
    if (tempo) {
      const tempoFormatado = formatarTempo(tempo);
      if (tempoFormatado) partes.push(tempoFormatado);
    }

    const descricao = partes.join(" • ");

    const exercicioCard = document.createElement("div");
    exercicioCard.className = `sub-titulo-exercicios exercicio-card d-flex flex-column align-items-start border-${grupoId}`;
    exercicioCard.innerHTML = `
      <strong>${nome}</strong>
      <span class="sub-titulo-exercicios">${descricao}</span>
      <button class="sub-titulo-exercicios btn btn-sm btn-danger mt-2">🗑️ Remover</button>
    `;

    exercicioCard.querySelector("button").addEventListener("click", () => {
      exercicioCard.remove();
      salvarTreinosLocal();
      atualizarResumo();
    });

    container.appendChild(exercicioCard);
    select.value = "";
    selectReps.value = "";
    if (grupoId === "cardio") inputDistancia.value = "";
    else if (selectCarga) selectCarga.value = "";
    inputTempo.value = "";
    salvarTreinosLocal();
    atualizarResumo();
  });

  card.addEventListener("click", e => {
    if (!e.target.closest("form") && !e.target.classList.contains("btn")) {
      ativarFocoGrupo(grupoId, card);
      formContainer.classList.remove("d-none");
    }
  });

  return card;
}

function ativarFocoGrupo(grupoId, card) {
  document.querySelectorAll(".grupo-card").forEach(c => {
    if (c !== card) c.classList.add("oculto");
  });
  card.classList.add("expandido");

  if (!document.getElementById("fundoOverlay")) {
    const overlay = document.createElement("div");
    overlay.id = "fundoOverlay";
    overlay.addEventListener("click", restaurarVisaoGeral);
    document.body.appendChild(overlay);
  }
}

function restaurarVisaoGeral() {
  document.querySelectorAll(".grupo-card").forEach(c => {
    c.classList.remove("oculto", "expandido");
    c.querySelector(".form-container")?.classList.add("d-none");
  });
  document.getElementById("fundoOverlay")?.remove();
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("gruposTreino");
  gruposMusculares.forEach(grupo => {
    const col = document.createElement("div");
    col.className = "col-md-6";
    col.appendChild(criarCardTreino(grupo));
    container.appendChild(col);
  });
});
