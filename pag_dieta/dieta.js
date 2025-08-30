import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { inicializarNavbarETema } from '../Funcoes/navbar.js';
inicializarNavbarETema();


verificarAutenticacao(API_BASE_URL);
gerarSidebar();

let totalCalories = 0;
const calorieGoal = 2000;
let refeicaoAtual = "";

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalAdicionar");

  // Abre modal e armazena a refeição clicada
  document.querySelectorAll('.btn-flutuante').forEach(botao => {
    botao.addEventListener('click', () => {
      refeicaoAtual = botao.getAttribute('data-refeicao');
      modal.style.display = 'flex';
    });
  });

  // Fecha modal
  document.querySelector(".fechar-modal").addEventListener("click", fecharModal);
  window.addEventListener("click", (event) => {
    if (event.target === modal) fecharModal();
  });
});

// Atualiza o anel de calorias
function updateCalorieRing() {
  const circle = document.querySelector('.ring-progress');
  const text = document.getElementById('calorie-text');
  const remaining = document.getElementById('calorie-remaining');

  const percent = Math.min(totalCalories / calorieGoal, 1);
  const offset = 314 - percent * 314;
  circle.style.strokeDashoffset = offset;
  text.textContent = `${totalCalories} / ${calorieGoal} kcal`;
  remaining.textContent = `Calorias restantes: ${calorieGoal - totalCalories}`;
}

// Simula API: gera dados falsos do alimento
async function buscarInformacoesAlimento(nome) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        nome: nome,
        calorias: Math.floor(Math.random() * 300 + 100),
        proteinas: Math.floor(Math.random() * 20),
        gorduras: Math.floor(Math.random() * 15),
        carboidratos: Math.floor(Math.random() * 50)
      });
    }, 500);
  });
}

// Exibe alimento no container da refeição
function atualizarRefeicao(refeicao, dados) {
  const container = Array.from(document.querySelectorAll('.container-refeicao')).find(c => {
    const titulo = c.querySelector('h3')?.textContent?.toLowerCase();
    return titulo?.includes(refeicao.toLowerCase());
  });

  if (!container) return;
  const conteudo = container.querySelector('.conteudo-refeicao');

  const card = document.createElement('div');
  card.classList.add('container-recomendadieta');
  card.innerHTML = `
    <ul>
      <li><strong>Alimento:</strong> ${dados.nome}</li>
      <li><strong>Calorias:</strong> ${dados.calorias} kcal</li>
      <li><strong>Proteínas:</strong> ${dados.proteinas} g</li>
      <li><strong>Gorduras:</strong> ${dados.gorduras} g</li>
      <li><strong>Carboidratos:</strong> ${dados.carboidratos} g</li>
    </ul>
  `;
  conteudo.appendChild(card);
}

// Fecha modal
function fecharModal() {
  document.getElementById('modalAdicionar').style.display = 'none';
  document.getElementById('busca').value = "";
}

// Botão salvar: adiciona alimento na refeição + contador
document.getElementById('btnSalvar').addEventListener('click', async () => {
  const nomeAlimento = document.getElementById('busca').value.trim();

  if (!nomeAlimento) {
    alert("Digite o nome de um alimento.");
    return;
  }

  const dados = await buscarInformacoesAlimento(nomeAlimento);

  // Exibe no HTML
  atualizarRefeicao(refeicaoAtual, dados);

  // Soma as calorias
  totalCalories += dados.calorias;
  updateCalorieRing();

  // Salva no localStorage
  const refeicoes = JSON.parse(localStorage.getItem('refeicoes')) || {};
  if (!refeicoes[refeicaoAtual]) refeicoes[refeicaoAtual] = [];
  refeicoes[refeicaoAtual].push(dados);
  localStorage.setItem('refeicoes', JSON.stringify(refeicoes));

  alert(`"${dados.nome}" adicionado à refeição "${refeicaoAtual}" com sucesso!`);
  fecharModal();
});
