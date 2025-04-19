document.body.classList.toggle('dark-mode');  

import { gerarSidebar } from '../Funcoes/sidebar.js';
import { verificarAutenticacao } from '../Funcoes/autenticacao.js';
import { filtrarUltimosSeteDias } from '../Funcoes/graficos.js';
import { obterDataDoServidor } from '../Funcoes/dataServidor.js';
import { calcularIdade } from "../Funcoes/calcularIdade.js";
import { silhueta } from '../Funcoes/silhueta.js';

const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://saude-mais-service-api.vercel.app";

  await verificarAutenticacao(API_BASE_URL); 

  const { dados_usuario } = window.usuarioLogado;
  const metricas = window.usuarioLogado?.historico_metricas;
  const ultimoRegistro = metricas[metricas.length - 1];

  console.log(dados_usuario);
  console.log(metricas);

  document.getElementById("nomeUsuario").textContent = dados_usuario.nome;

  const dataServidor = await obterDataDoServidor(API_BASE_URL);
    if (dataServidor) {
        const idade = calcularIdade(dados_usuario.data_nascimento, dataServidor.toISOString());
        document.getElementById("idadeUsuario").textContent = idade;

        filtrarUltimosSeteDias(dataServidor);
    }

  if(dados_usuario.objetivo==1){
    document.getElementById("objetivoUsuario").textContent = "Perca de peso";
  }else if(dados_usuario.objetivo==2){
    document.getElementById("objetivoUsuario").textContent = "Ganho de massa";
  }else{
    document.getElementById("objetivoUsuario").textContent = "Manutenção do peso";;
  }
  
gerarSidebar();
silhueta(ultimoRegistro);

console.log(ultimoRegistro.calorias.meta + "kcal");
