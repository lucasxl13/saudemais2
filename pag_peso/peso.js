import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { filtroGraficoPeso } from '../Funcoes/graficos/graficoPeso.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { atualizarMetricaNoServidor } from '../Funcoes/atualizarMetrica.js';
import { exibirControleDeDigitos  } from '../Funcoes/atualizarMedidas.js';
import icones from '../Funcoes/icones.js';
import { inicializarNavbarETema } from '../Funcoes/navbar.js';

inicializarNavbarETema();

// ⚠️ Adicionamos a função local para calcular o aspectRatio inicial
function calcularAspectRatio() {
  const largura = window.innerWidth;
  if (largura < 390) return 1.3;
  if (largura < 768) return 2.2;
  if (largura < 1024) return 3;
  return 3.7;
}

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
    window.aspectRatioPeso = calcularAspectRatio(); // ✅ uso dinâmico
    filtroGraficoPeso(dataServidor, 'semana', window.aspectRatioPeso, null, 'dd/mm');
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

      const formatoData = tipo === 'inicio' ? 'dd/mm/aa' : 'dd/mm';
      const aspectRatioAtual = calcularAspectRatio(); // ✅ recalcular no clique

      filtroGraficoPeso(dataServidor, tipo, aspectRatioAtual, null, formatoData);
    });
  });

  scroll.addEventListener("input", (e) => {
    const offset = parseInt(e.target.value);
    const tipo = window.periodoAtualPeso || "semana";
    const formatoData = tipo === 'inicio' ? 'dd/mm/aa' : 'dd/mm';
    const aspectRatioAtual = calcularAspectRatio(); // ✅ recalcular no scroll

    filtroGraficoPeso(dataServidor, tipo, aspectRatioAtual, offset, formatoData);
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