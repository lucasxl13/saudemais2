import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { filtroGraficoPeso } from '../Funcoes/graficos/graficoPeso.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { atualizarMetricaNoServidor } from '../Funcoes/atualizarMetrica.js';
import { exibirControleDeDigitos  } from '../Funcoes/atualizarMedidas.js';
import icones from '../Funcoes/icones.js';
import { inicializarNavbarETema } from '../Funcoes/navbar.js';
inicializarNavbarETema();


const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://apisaudemais.danielhatz.com.br";

await verificarAutenticacao(API_BASE_URL); 

const { dados_usuario } = window.usuarioLogado;
const metricas = window.usuarioLogado?.historico_metricas;
const ultimoRegistro = metricas[metricas.length - 1];

console.log(dados_usuario);
console.log(metricas);

gerarSidebar();
inicializarStreak(API_BASE_URL);

async function inicializarStreak(API_BASE_URL) {
  const dataServidor = await obterDataDoServidor(API_BASE_URL);

  if (dataServidor) {
    window.periodoAtualPeso = 'semana'; // default
    window.aspectRatioPeso = 3.7; // default
    filtroGraficoPeso(dataServidor, 'semana', 3.7);
    configurarEventosPeriodo(dataServidor);
  }
}

function configurarEventosPeriodo(dataServidor) {
  const botoes = document.querySelectorAll('.periodo');
  const scroll = document.getElementById("scrollRangePeso");

  botoes.forEach(btn => {
    btn.addEventListener('click', () => {
      botoes.forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');

      const tipo = btn.dataset.periodo;
      window.periodoAtualPeso = tipo;

      // Começar do final ao mudar período
      filtroGraficoPeso(dataServidor, tipo, window.aspectRatioPeso || 3.7, null);
    });
  });

  scroll.addEventListener("input", (e) => {
    const offset = parseInt(e.target.value);
    const tipo = window.periodoAtualPeso || "semana";
    filtroGraficoPeso(dataServidor, tipo, window.aspectRatioPeso || 3.7, offset);
  });

  const btnSemana = document.querySelector('.periodo[data-periodo="semana"]');
  if (btnSemana) btnSemana.classList.add('ativo');
}


const peso = document.getElementById("peso_atual");
peso.textContent = ultimoRegistro.peso.toFixed(1).replace('.', ',') + " kg";

const peso_ideal = document.getElementById("peso_ideal");
const pesoIdeal = 21.75 * ((ultimoRegistro.altura / 100) ** 2);

peso_ideal.textContent = pesoIdeal.toFixed(1).replace('.', ',') + " kg";

const statusPeso = document.getElementById("status_peso");
const diferenca = ultimoRegistro.peso - pesoIdeal;

// Limpa classes anteriores
statusPeso.classList.remove("status-ok", "status-alerta");

if (diferenca < -5.1) {
  statusPeso.textContent = `Você está ${Math.abs(diferenca).toFixed(1).replace('.', ',')} kg abaixo do seu peso ideal`;
  statusPeso.classList.add("status-alerta");
} else if (diferenca > 5) {
  statusPeso.textContent = `Você está ${diferenca.toFixed(1).replace('.', ',')} kg acima do seu peso ideal`;
  statusPeso.classList.add("status-alerta");
} else {
  statusPeso.textContent = "Você está no seu peso ideal";
  statusPeso.classList.add("status-ok");
}

if (peso) {
  peso.addEventListener("click", () => {
    exibirControleDeDigitos(ultimoRegistro.peso, "PESO");
  });
}

const container = document.getElementById("icone_variacaoPeso");
if (container) {
  container.appendChild(icones.peso2("var(--texto)"));
}

const container2 = document.getElementById("icone_variacaoPercentual");
if (container2) {
  const icone = icones.metricas("var(--texto)");
  icone.classList.add("icone_pesoVariacao"); 
  container2.appendChild(icone);
}
