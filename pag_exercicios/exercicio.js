import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { inicializarNavbarETema } from '../Funcoes/navbar.js';
inicializarNavbarETema();

const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  // : "https://saude-mais-service-api.vercel.app";
  : "https://apisaudemais.danielhatz.com.br";

// Primeiro autentica, depois monta o menu
verificarAutenticacao(API_BASE_URL);
gerarSidebar();
function adicionarExercicio(grupo) {
  const nome = prompt(`Nome do exercício para ${grupo}?`);
  const reps = prompt("Séries e repetições (Ex: 3x12)?");

  if (!nome || !reps) return;

  const li = document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between align-items-center";
  li.innerHTML = `
    <span><strong>${nome}</strong> – ${reps}</span>
    <button class="btn btn-sm btn-danger">🗑️</button>
  `;

  li.querySelector("button").addEventListener("click", () => li.remove());

  const lista = document.querySelector(`.lista-${grupo}`);
  lista.appendChild(li);
}
const gruposMusculares = [
  { nome: "Peito", cor: "danger", emoji: "🔥" },
  { nome: "Costas", cor: "primary", emoji: "🛡️" },
  { nome: "Pernas", cor: "success", emoji: "🦵" },
  { nome: "Ombros", cor: "warning", emoji: "🏋️‍♂️" },
  { nome: "Bíceps", cor: "info", emoji: "💪" },
  { nome: "Tríceps", cor: "secondary", emoji: "🫱" },
  { nome: "Abdômen", cor: "dark", emoji: "🧱" },
  { nome: "Cardio", cor: "dark", emoji: "🏃‍♂️" }
];

function criarCardTreino(grupo) {
  const card = document.createElement("div");
  card.className = "card card-treino mb-4 grupo-card";
  card.setAttribute("data-grupo", grupo.nome.toLowerCase());

  card.innerHTML = `
    <div class="card-body">
      <h4 class="card-title text-${grupo.cor}">
        <span class="emoji-grupo">${grupo.emoji}</span> ${grupo.nome}
      </h4>
      <div class="exercicios-grid mt-3 lista-${grupo.nome.toLowerCase()}"></div>
      <button class="btn btn-outline-${grupo.cor} btn-sm mt-3" onclick="adicionarExercicio('${grupo.nome.toLowerCase()}')">+ Adicionar</button>
    </div>
  `;

  // Agora todos os cards podem ser clicados para focar
  card.addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn")) { 
      ativarFocoGrupo(grupo.nome.toLowerCase(), card);
    }
  });

  return card;
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
function ativarFocoGrupo(grupoSelecionado, card) {
  const todosGrupos = document.querySelectorAll(".grupo-card");
  todosGrupos.forEach(c => {
    if (c !== card) c.classList.add("oculto");
  });

  card.classList.add("expandido");

  // Cria o overlay (fundo clicável)
  if (!document.getElementById("fundoOverlay")) {
    const overlay = document.createElement("div");
    overlay.id = "fundoOverlay";
    overlay.addEventListener("click", restaurarVisaoGeral);
    document.body.appendChild(overlay);
  }
}


function restaurarVisaoGeral() {
  const todosGrupos = document.querySelectorAll(".grupo-card");
  todosGrupos.forEach(c => {
    c.classList.remove("oculto", "expandido");
  });

  const overlay = document.getElementById("fundoOverlay");
  if (overlay) overlay.remove();
}




