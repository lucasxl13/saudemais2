import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { filtroGraficoMetricas } from '../Funcoes/graficos/graficoCaloriasHidratacao.js';
import { graficoMetricas } from '../Funcoes/graficos/graficoMetricas.js';
import { inicializarNavbarETema } from '../Funcoes/navbar.js';
import icones from '../Funcoes/icones.js';
import { maior, menor, media, streak } from '../Funcoes/filtroMaiorMenor.js';

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

const dataServidorInicial = await obterDataDoServidor(API_BASE_URL);
if (dataServidorInicial) {
  filtroGraficoMetricas(dataServidorInicial, 'calorias'); // default
  graficoMetricas(metricas, dataServidorInicial);
  atualizarValores("calorias", dataServidorInicial); // ✅ corrigido
}

gerarSidebar();

document.getElementById("icon_fogo").appendChild(icones.fire(ultimoRegistro.streak_caloria));
document.getElementById("calorias_consumidas").textContent = " : " + ultimoRegistro.calorias.consumido;
document.getElementById("calorias_meta").textContent = ultimoRegistro.calorias.meta + " kcal";
document.getElementById("calorias_porcentagem").textContent = "(" + ((ultimoRegistro.calorias.consumido / ultimoRegistro.calorias.meta) * 100).toFixed(0) + "%)";

document.getElementById("icon_agua").appendChild(icones.water(ultimoRegistro.streak_hidratacao));
document.getElementById("agua_consumidas").textContent = " : " + ultimoRegistro.hidratacao.consumido;
document.getElementById("hidratacao_meta").textContent = ultimoRegistro.hidratacao.meta + " ml";
document.getElementById("hidratacao_porcentagem").textContent = "(" + ((ultimoRegistro.hidratacao.consumido / ultimoRegistro.hidratacao.meta) * 100).toFixed(0) + "%)";

document.getElementById("valor_streakAtual").textContent = "ATUAL " + ultimoRegistro.streak_caloria + " Dia(s)";
document.getElementById("valor_streakTotal").textContent = "RECORDE " + maior(metricas, "streak_caloria") + " Dia(s)";

function atualizarValores(tipo, dataServidor) {
  const sufixo = tipo === 'calorias' ? 'kcal' : 'ml';
  const chave = tipo === 'calorias' ? 'calorias.consumido' : 'hidratacao.consumido';
  const streakKey = tipo === 'calorias' ? 'streak_caloria' : 'streak_hidratacao';
  const periodo = window.periodoAtualUnificado;

  const iconMin = document.getElementById("icon_min");
  const iconMax = document.getElementById("icon_max");
  const iconMedia = document.getElementById("icon_media");

  iconMin.innerHTML = ""; // limpa conteúdo anterior
  iconMax.innerHTML = "";
  iconMedia.innerHTML = "";

  iconMin.appendChild(icones.minimo());
  iconMax.appendChild(icones.maximo());
  iconMedia.appendChild(icones.media());

  document.getElementById("valor_min").textContent =
    ` ${menor(metricas, chave, dataServidor, periodo)} ${sufixo}`;

  document.getElementById("valor_max").textContent =
    ` ${maior(metricas, chave, dataServidor, periodo)} ${sufixo}`;

  document.getElementById("valor_media").textContent =
    `${media(metricas, chave, dataServidor, periodo).toFixed(0)} ${sufixo}`;

  document.getElementById("valor_total").textContent =
    `HISTÓRICO (${streak(metricas, streakKey, dataServidor, periodo)}) Dia(s)`;
}

const caloriasEl = document.getElementById("calorias");
const hidratacaoEl = document.getElementById("hidratacao");

caloriasEl.classList.add("ativo");

caloriasEl.addEventListener("click", async () => {
  window.tipoAtualUnificado = 'calorias';
  window.periodoAtualUnificado = 'semana';

  caloriasEl.classList.add("ativo");
  hidratacaoEl.classList.remove("ativo");

  document.querySelectorAll('.periodo-unificado').forEach(b => b.classList.remove('ativo'));
  document.querySelector('[data-periodo="semana"]').classList.add('ativo');

  document.getElementById("valor_streakAtual").textContent = "ATUAL " + ultimoRegistro.streak_caloria + " Dia(s)";
  document.getElementById("valor_streakTotal").textContent = "RECORDE " + maior(metricas, "streak_caloria") + " Dia(s)";

  const dataServidor = await obterDataDoServidor(API_BASE_URL);
  filtroGraficoMetricas(dataServidor, 'calorias', 'semana');
  atualizarValores("calorias", dataServidor); // ✅
});

hidratacaoEl.addEventListener("click", async () => {
  window.tipoAtualUnificado = 'hidratacao';
  window.periodoAtualUnificado = 'semana';

  caloriasEl.classList.remove("ativo");
  hidratacaoEl.classList.add("ativo");

  document.querySelectorAll('.periodo-unificado').forEach(b => b.classList.remove('ativo'));
  document.querySelector('[data-periodo="semana"]').classList.add('ativo');

  document.getElementById("valor_streakAtual").textContent = "ATUAL " + ultimoRegistro.streak_hidratacao + " Dia(s)";
  document.getElementById("valor_streakTotal").textContent = "RECORDE " + maior(metricas, "streak_hidratacao") + " Dia(s)";

  const dataServidor = await obterDataDoServidor(API_BASE_URL);
  filtroGraficoMetricas(dataServidor, 'hidratacao', 'semana');
  atualizarValores("hidratacao", dataServidor); // ✅
});

window.tipoAtualUnificado = 'calorias';
window.periodoAtualUnificado = 'semana';
document.querySelector('[data-periodo="semana"]').classList.add('ativo');

document.querySelectorAll('.periodo-unificado').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.periodo-unificado').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');

    const novoPeriodo = btn.dataset.periodo;
    window.periodoAtualUnificado = novoPeriodo;

    const dataServidor = await obterDataDoServidor(API_BASE_URL);
    filtroGraficoMetricas(dataServidor, window.tipoAtualUnificado, novoPeriodo, null);
    atualizarValores(window.tipoAtualUnificado, dataServidor); // ✅ sincronizado
  });
});

document.getElementById("scrollRangeUnificado").addEventListener("input", async (e) => {
  const offset = parseInt(e.target.value);
  const dataServidor = await obterDataDoServidor(API_BASE_URL);
  filtroGraficoMetricas(dataServidor, window.tipoAtualUnificado, window.periodoAtualUnificado, offset);
  atualizarValores(window.tipoAtualUnificado, dataServidor); // ✅ opcional, se quiser atualizar ao scroll
});

let basal;

if (dados_usuario.objetivo == 1) {
  basal = (ultimoRegistro.calorias.meta / 0.8).toFixed(0);
} else if (dados_usuario.objetivo == 2) {
  basal = (ultimoRegistro.calorias.meta / 1.2).toFixed(0);
} else {
  basal = ultimoRegistro.calorias.meta;
}

document.getElementById("icon_imc").appendChild(icones.imc());
document.getElementById("imc").textContent = ultimoRegistro.imc.toFixed(2);
let status_imc;

if (ultimoRegistro.imc < 18.5) {
  status_imc = "ABAIXO DO PESO";
} else if (ultimoRegistro.imc < 24.9) {
  status_imc = "PESO NORMAL";
} else if (ultimoRegistro.imc < 29.9) {
  status_imc = "SOBREPESO";
} else if (ultimoRegistro.imc < 34.9) {
  status_imc = "OBESIDADE GRAU 1";
} else if (ultimoRegistro.imc < 39.9) {
  status_imc = "OBESIDADE GRAU 2";
} else {
  status_imc = "OBESIDADE GRAU 3";
}

document.getElementById("icon_fogo2").appendChild(icones.fire2(0, false));
document.getElementById("taxa_metabolica").textContent = basal + " kCal";

document.getElementById("icon_gordura").appendChild(icones.porcentagem2());
document.getElementById("gordura_corporal").textContent = ultimoRegistro.gordura.toFixed(2) + "%";

document.getElementById("icon_agua2").appendChild(icones.water2(0, false));
document.getElementById("agua_corporal").textContent = ultimoRegistro.agua.toFixed(2) + " kg";

document.getElementById("icon_musculo").appendChild(icones.musculo());
document.getElementById("musculos").textContent = ultimoRegistro.musculo.toFixed(2) + " kg";