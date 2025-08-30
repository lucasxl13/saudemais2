import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";
import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { silhueta } from '../Funcoes/silhueta.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { inicializarGraficos } from '../Funcoes/graficos/graficosMedidas.js';
import { inicializarControlesDeMedidas } from '../Funcoes/atualizarMedidas.js';
import { inicializarNavbarETema } from '../Funcoes/navbar.js';
inicializarNavbarETema();

await verificarAutenticacao(API_BASE_URL);

const { dados_usuario } = window.usuarioLogado;
const metricas = window.usuarioLogado?.historico_metricas;
const ultimoRegistro = metricas[metricas.length - 1];

gerarSidebar();
silhueta(ultimoRegistro);
inicializarControlesDeMedidas(metricas);


(async () => {
  const dataServidor = await obterDataDoServidor(API_BASE_URL);
  const metricas = window.usuarioLogado?.historico_metricas;

  if (metricas?.length > 0 && dataServidor) {
    inicializarGraficos(metricas, dataServidor);
  }
})();
