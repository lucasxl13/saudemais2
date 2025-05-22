document.body.classList.toggle('dark-mode');  

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

document.addEventListener("DOMContentLoaded", () => {
  const btnAdicionar = document.getElementById("btnAdicionar");
  const btnAdicionar2 = document.getElementById("btnAdicionar2");
  const btnAdicionar3 = document.getElementById("btnAdicionar3");
  const btnAdicionar4 = document.getElementById("btnAdicionar4");
  const modal = document.getElementById("modalAdicionar");
  const btnFechar = document.querySelector(".fechar-modal");
  let totalCalories = 0;
  const calorieGoal = 2000;
  let meals = [];

  btnAdicionar.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  btnAdicionar2.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  btnAdicionar3.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  btnAdicionar4.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  btnFechar.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fechar modal ao clicar fora do conteúdo
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

function abrirModal(refeicao) {
  console.log("Abrindo modal para:", refeicao);
  document.getElementById('modalCadastro').style.display = 'block';
}

async function fetchMealsFromAPI() {
  try {
    const response = await fetch('https://api.edamam.com/api/nutrition-data'); // Troque pela URL real da sua API
    const data = await response.json();

    // Supondo que a resposta venha em um array de objetos com nome, kcal, protein, fat e carbs
    meals = data.map(meal => ({
      name: meal.name,
      kcal: meal.kcal,
      protein: meal.protein,
      fat: meal.fat,
      carbs: meal.carbs
    }));

    renderMealCards();
  } catch (error) {
    console.error('Erro ao buscar refeições da API:', error);
  }
}

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

function renderMealCards() {
  const container = document.getElementById('meal-list');
  container.innerHTML = '';
  totalCalories = 0;

  meals.forEach(meal => {
    totalCalories += meal.kcal;
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.innerHTML = `
      <div class="meal-details">
        <strong>${meal.name}</strong><br/>
        ${meal.kcal} kcal<br/>
        ${meal.protein}g Prot. ${meal.fat}g Gord. ${meal.carbs}g Carb.
      </div>
    `;
    container.appendChild(card);
  });

  updateCalorieRing();
}

function addMeal() {
  const newMeal = {
    name: "Nova Refeição",
    kcal: 300,
    protein: 10,
    fat: 8,
    carbs: 35
  };
  meals.push(newMeal);
  renderMealCards();
}

export async function obterDadosDieta(API_BASE_URL) {
  try {
    const response = await fetch(`${API_BASE_URL}/alimentos-dieta`, {
      method: "GET",
    });

    if (!response.ok) {
      console.error("Erro ao obter dados da dieta:", response.statusText);
      return;
    }

    const dadosDieta = await response.json();
    console.log(dadosDieta);
    return dadosDieta;

  } catch (error) {
    console.error("Erro ao buscar dados da dieta:", error);
  }
}

//Botão de pesquisar

document.getElementById('formulario').addEventListener('submit', async function (e) {
  e.preventDefault();

  const termo = document.getElementById('busca').value.trim();
  const resultadosDiv = document.getElementById('resultados');
  resultadosDiv.innerHTML = 'Carregando...';

  if (!termo) {
    resultadosDiv.innerHTML = 'Digite algo para pesquisar.';
    return;
  }

  try {
    // 🔧 URL da API a ser definida
    const url = `https://suaapi.com/search?query=${encodeURIComponent(termo)}`;
    
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error('Erro na resposta da API');

    const dados = await resposta.json();

    // 🔧 Valide e trate os dados conforme o formato que sua API retornar
    if (!dados || !Array.isArray(dados.resultados)) {
      resultadosDiv.innerHTML = 'Formato de dados inesperado.';
      return;
    }

    // Renderiza os resultados
    resultadosDiv.innerHTML = '';
    dados.resultados.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';

      // 🔧 Ajuste esses campos de acordo com os dados reais da sua API
      div.innerHTML = `
        <h3>${item.nome}</h3>
        <p><strong>Descrição:</strong> ${item.descricao || 'Sem descrição.'}</p>
      `;

      resultadosDiv.appendChild(div);
    });

  } catch (erro) {
    console.error(erro);
    resultadosDiv.innerHTML = 'Erro ao buscar dados. Verifique a API.';
  }
});


// Função que salva o valor do input no Local Storage
function salvarRefeicaoDoModal() {
  const valorInput = document.getElementById('busca').value.trim();

  if (valorInput === "") {
    alert("Digite o nome de um alimento antes de salvar.");
    return;
  }

  // Pega os dados atuais (ou inicia com um array vazio)
  const refeicoesSalvas = JSON.parse(localStorage.getItem('refeicoesModal')) || [];

  // Adiciona novo item
  refeicoesSalvas.push(valorInput);

  // Salva de volta no localStorage
  localStorage.setItem('refeicoesModal', JSON.stringify(refeicoesSalvas));

  alert(`"${valorInput}" salvo com sucesso!`);

  // Limpa o campo de input
  document.getElementById('busca').value = '';
}

// Adiciona o evento ao botão "Salvar"
document.getElementById('btnSalvar').addEventListener('click', salvarRefeicaoDoModal);

let refeicaoAtual = ""; // Qual refeição está sendo editada

// Abrir modal e armazenar qual refeição está sendo modificada
document.querySelectorAll('.btn-flutuante').forEach(botao => {
  botao.addEventListener('click', () => {
    refeicaoAtual = botao.getAttribute('data-refeicao');
    document.getElementById('modalAdicionar').style.display = 'block';
  });
});

// Fechar modal
function fecharModal() {
  document.getElementById('modalAdicionar').style.display = 'none';
  document.getElementById('busca').value = "";
}

// Função simulada para buscar dados do alimento
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

// Função para exibir os dados na refeição correspondente
function atualizarRefeicao(refeicao, dados) {
  const container = Array.from(document.querySelectorAll('.container-refeicao')).find(c => {
    const titulo = c.querySelector('h3')?.textContent?.toLowerCase();
    return titulo?.includes(refeicao.toLowerCase());
  });

  if (!container) return;

  const conteudo = container.querySelector('.conteudo-refeicao');

  // Garante que o título seja exibido apenas uma vez
  if (!conteudo.querySelector('h3')) {
    const titulo = document.createElement('h3');
    titulo.textContent = refeicao;
    conteudo.appendChild(titulo);
  }

  // Cria um novo card para cada alimento
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


// Clique no botão Salvar do modal
document.getElementById('btnSalvar').addEventListener('click', async () => {
  const nomeAlimento = document.getElementById('busca').value.trim();
  irefeicoes[refeicaoAtual] = dados;



  const dados = await buscarInformacoesAlimento(nomeAlimento);

  // Atualiza HTML
  atualizarRefeicao(refeicaoAtual, dados);

  // Salva no localStorage
  const refeicoes = JSON.parse(localStorage.getItem('refeicoes')) || {};
  refeicoes[refeicaoAtual] = dados;
  localStorage.setItem('refeicoes', JSON.stringify(refeicoes));

  alert(`Refeição "${refeicaoAtual}" salva com sucesso!`);
  fecharModal();
});
