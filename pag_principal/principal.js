const API_BASE_URL = window.location.hostname === "127.0.0.1"  
    ? "http://localhost:3000"  // Se for localhost, usa o endpoint local
    : "https://apisaudemais.danielhatz.com.br";  // Se não for localhost, usa o endpoint de produção


const campoLogo = document.querySelector('.style_logo');
const itemLogo = document.getElementById('itemMais_logo');
const itemSideBar = document.querySelectorAll('.item__sidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');

const botaoHome = document.getElementById('homeLink');
const botaoPeso = document.getElementById('pesoLink');
const botaoMedidas = document.getElementById('medidasLink');
const botaoMetricas = document.getElementById('metricasLink');
const botaoCalorias = document.getElementById('caloriaLink');
const botaoHidratacao = document.getElementById('hidratacaoLink');
const botaoSono = document.getElementById('sonoLink');
const botaoDieta = document.getElementById('dietaLink');
const botaoExercicio = document.getElementById('exercicioLink');
const botaoPerfil = document.getElementById('perfilLink');
const botaoLogout = document.getElementById('logoutLink');

const container_peso = document.getElementById('container_peso');
const container_medidas = document.getElementById('container_medidas');
const container_metricas = document.getElementById('container_metricas');
const container_calorias = document.getElementById('container_caloria');
const container_hidratacao = document.getElementById('container_hidratacao');
const container_sono = document.getElementById('container_sono');
const container_dieta = document.getElementById('container_dieta');
const container_exercicios = document.getElementById('container_exercicios');

let usuario = null;
let email = null;
let data_nascimento = null;
let sexo = null;
let objetivo = null;
let data_medida = null;
let peso = null;

let altura = null;
let bc_direito = null;
let bc_esquerdo = null;
let atb_direito = null;
let atb_esquerdo = null;
let cx_direito = null;
let cx_esquerdo = null;
let ptr_direito = null;
let ptr_esquerdo = null;
let ctr = null;

let imc = null;
let peso_ideal = null;
let gordura_corporal = null;
let musculo_esqueletico = null;
let agua_massa = null;


let calorias = null;
let idade = null;
let tmb = null;
let streak_cal = null;

let meta_hidratacao = null;
let agua_consumida = null;
let streak_hidro = null;



// Armazenar os dados de peso e datas para o gráfico
let dadosPeso = [];

// Função para formatar datas (dia/mês)
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam em 0

    return `${day}/${month}`;
}

document.addEventListener("DOMContentLoaded", async () => {
    let jwt = null;

    // Verifica se o token está no sessionStorage ou localStorage
    if (sessionStorage.getItem("jwt")) {
        jwt = sessionStorage.getItem("jwt");
    }

    if (!jwt && localStorage.getItem("jwt")) {
        const storedData = JSON.parse(localStorage.getItem("jwt"));

        // Verifica se o token expirou
        if (Date.now() > storedData.expiresAt) {
            localStorage.removeItem("jwt");
            sessionStorage.removeItem("jwt");
            // window.location.href = "../pag_login/login.html";
            return;
        }

        jwt = storedData.token;
    }

    // Se nenhum token válido for encontrado, redireciona para o login
    if (!jwt) {
        window.location.href = "../pag_login/login.html";
        return;
    }

    try {
    const response = await fetch(`${API_BASE_URL}/dados-usuario`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${jwt}`,
        },
    });

    if (!response.ok) {
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
        window.location.href = "../pag_login/login.html";
        return;
    }

    // Corrigido aqui ↓↓↓↓↓
    const data = await response.json();
    const { dados_usuario, metricas } = data;

    usuario = dados_usuario.nome;
    email = dados_usuario.email;
    data_nascimento = dados_usuario.data_nascimento;
    sexo = dados_usuario.sexo;
    objetivo = dados_usuario.objetivo;

    // Mapeando métricas para acesso fácil por tipo
    const metricasMapeadas = {};
    metricas.forEach(m => {
        metricasMapeadas[m.tipo] = {
            ...m.valor,
            registrado_em: m.registrado_em
        };
    });

    altura = metricasMapeadas.altura?.altura || null;
    peso = metricasMapeadas.peso?.peso || null;
    data_medida = metricasMapeadas.peso?.registrado_em || null;

    bc_direito = metricasMapeadas.biceps_direito?.biceps_direito || null;
    bc_esquerdo = metricasMapeadas.biceps_esquerdo?.biceps_esquerdo || null;
    atb_direito = metricasMapeadas.antebraco_direito?.antebraco_direito || null;
    atb_esquerdo = metricasMapeadas.antebraco_esquerdo?.antebraco_esquerdo || null;
    cx_direito = metricasMapeadas.coxa_direita?.coxa_direita || null;
    cx_esquerdo = metricasMapeadas.coxa_esquerda?.coxa_esquerda || null;
    ptr_direito = metricasMapeadas.panturilha_direita?.panturilha_direita || null;
    ptr_esquerdo = metricasMapeadas.panturilha_esquerda?.panturilha_esquerda || null;
    ctr = metricasMapeadas.cintura?.cintura || null;

    gordura_corporal = metricasMapeadas.gordura_corporal?.gordura_corporal || null;
    musculo_esqueletico = metricasMapeadas.musculo_esqueletico?.musculo_esqueletico || null;
    agua_massa = metricasMapeadas.agua_massa?.agua_massa || null;

    calorias = metricasMapeadas.calorias?.calorias || 0;
    streak_cal = metricasMapeadas.calorias?.streakCal || 0;

    agua_consumida = metricasMapeadas.hidratacao?.hidratacao || 0;
    streak_hidro = metricasMapeadas.hidratacao?.streakHidratacao || 0;

    idade = calcularIdade(data_nascimento);

        if (peso && altura) {
            imc = peso / ((altura / 100) * (altura / 100));
            imc = parseFloat(imc).toFixed(2);

            peso_ideal = 21.75 * ((altura / 100) * (altura / 100));
            peso_ideal = parseFloat(peso_ideal).toFixed(2);

            meta_hidratacao = peso * 35;

            if (sexo === "masculino") {
                tmb = (66 + (13.7 * peso) + (5 * altura) - (6.8 * idade));
            } else if (sexo === "feminino") {
                tmb = (655 + (9.6 * peso) + (1.8 * altura) - (4.7 * idade));
            }

            tmb = parseFloat(tmb).toFixed(0);
        
        }
        
        fetch('../Icones/streak.svg')
        .then(response => response.text())
        .then(svg => {
          const container = document.getElementById('streak_icone');
          container.innerHTML = svg;
      
          const svgElement = container.querySelector('svg');
          svgElement.classList.add('streak');
      
          // === Cores principais ===
          const main1 = '#ff0000';  // vermelho
          const main2 = '#ff6200';  // laranja
          const main3 = '#ffb700';  // amarelo
          const main4 = '#ffe680';  // amarelo claro (versão clara do main3)
      
          // === Criar defs com degradês e filtro de glow ===
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      
          function criarGradiente(id, corInicio, corFim) {
            const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
            grad.setAttribute("id", id);
            grad.setAttribute("x1", "0%");
            grad.setAttribute("y1", "0%");
            grad.setAttribute("x2", "100%");
            grad.setAttribute("y2", "100%");
      
            const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop1.setAttribute("offset", "0%");
            stop1.setAttribute("stop-color", corInicio);
      
            const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
            stop2.setAttribute("offset", "100%");
            stop2.setAttribute("stop-color", corFim);
      
            grad.appendChild(stop1);
            grad.appendChild(stop2);
      
            defs.appendChild(grad);
          }
      
          // Criar degradês
          criarGradiente("grad1", main1, main2); // path-1
          criarGradiente("grad2", main2, main3); // path-2
          criarGradiente("grad3", main3, main4); // path-3
      
          // === Criar filtro de glow para o stroke ===
          const glowFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
          glowFilter.setAttribute("id", "filtro-glow");
          glowFilter.setAttribute("x", "-50%");
          glowFilter.setAttribute("y", "-50%");
          glowFilter.setAttribute("width", "200%");
          glowFilter.setAttribute("height", "200%");
      
          const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
          blur.setAttribute("in", "SourceAlpha");
          blur.setAttribute("stdDeviation", "8");
          blur.setAttribute("result", "blur");
      
          const merge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
      
          const mergeNode1 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
          mergeNode1.setAttribute("in", "blur");
      
          const mergeNode2 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
          mergeNode2.setAttribute("in", "SourceGraphic");
      
          merge.appendChild(mergeNode1);
          merge.appendChild(mergeNode2);
      
          glowFilter.appendChild(blur);
          glowFilter.appendChild(merge);
      
          defs.appendChild(glowFilter);
      
          // === Inserir defs no SVG ===
          svgElement.prepend(defs);
      
          // === Aplicar degradês e filtro nos paths ===
          const path1 = svgElement.querySelector('#path-1');
          const path2 = svgElement.querySelector('#path-2');
          const path3 = svgElement.querySelector('#path-3');
      
          if (path1) {
            path1.setAttribute('fill', 'url(#grad1)');
            path1.setAttribute('stroke', 'black');
            path1.setAttribute('stroke-width', '13');
            path1.setAttribute('stroke-linejoin', 'round');
            path1.setAttribute('filter', 'url(#filtro-glow)');
          }
      
          if (path2) {
            path2.setAttribute('fill', 'url(#grad2)');
          }
      
          if (path3) {
            path3.setAttribute('fill', 'url(#grad3)');
          }
      
          // === Adicionar texto no centro ===
          const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
          textElement.setAttribute("x", "36%");
          textElement.setAttribute("y", "60%");
          textElement.setAttribute("text-anchor", "middle");
          textElement.setAttribute("dominant-baseline", "middle");
          textElement.setAttribute("font-size", "4.7rem");
          textElement.setAttribute("font-weight", "bold");
          textElement.setAttribute("fill", "white");
          textElement.setAttribute("stroke", "black"); // cor do contorno
          textElement.setAttribute("stroke-width", "4"); // espessura do contorno
          textElement.textContent = streak_cal;
      
          svgElement.appendChild(textElement);
        });



        fetch('../Icones/streak_hidratacao.svg')
        .then(response => response.text())
        .then(svg => {
          const container = document.getElementById('streakHidratacao_icone');
          container.innerHTML = svg;
      
          const svgElement = container.querySelector('svg');
          svgElement.classList.add('streak');
      
          // === Criar o degradê linear ===
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
          linearGradient.setAttribute("id", "gradienteAzul");
          linearGradient.setAttribute("x1", "0%");
          linearGradient.setAttribute("y1", "0%");
          linearGradient.setAttribute("x2", "0%");
          linearGradient.setAttribute("y2", "100%");
      
          const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
          stop1.setAttribute("offset", "0%");
          stop1.setAttribute("stop-color", "#00e5ff"); // azul claro
          
          const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
          stop2.setAttribute("offset", "50%");
          stop2.setAttribute("stop-color", "#37a2ff"); // azul escuro
      
          const stop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
          stop2.setAttribute("offset", "100%");
          stop2.setAttribute("stop-color", "#0062ff"); // azul escuro
      
          linearGradient.appendChild(stop1);
          linearGradient.appendChild(stop2);
          linearGradient.appendChild(stop3);
          
          defs.appendChild(linearGradient);
          svgElement.prepend(defs);
      
          // === Aplicar o degradê ao path ===
          const path = svgElement.querySelector('path');
          path.setAttribute('stroke', 'black');
          path.setAttribute('stroke-width', '1');
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('fill', 'url(#gradienteAzul)');
      
          // === Adicionar texto no centro ===
          const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
          textElement.setAttribute("x", "50%");
          textElement.setAttribute("y", "70%");
          textElement.setAttribute("text-anchor", "middle");
          textElement.setAttribute("dominant-baseline", "middle");
          textElement.setAttribute("font-size", "0.48rem");
          textElement.setAttribute("font-weight", "bold");
          textElement.setAttribute("fill", "white");
          textElement.setAttribute("stroke", "black"); // cor do contorno
          textElement.setAttribute("stroke-width", "0.4"); // espessura do contorno
          textElement.textContent = streak_hidro;
      
          svgElement.appendChild(textElement);
        });
        // Exibe os dados na interface
        frontending(); // Chama a função para exibir as informações

        // Armazena os dados de peso e data para o gráfico
        dadosPeso = metricas
        .filter(item => item.tipo === 'peso')
        .map(item => ({
            data: item.registrado_em,
            peso: item.valor.peso
        }));

        dadosCaloria = metricas
        .filter(item => item.tipo === 'calorias')
        .map(item => ({
            data: item.registrado_em,
            calorias: item.valor.calorias
        }));

        dadosHidratacao = metricas
        .filter(item => item.tipo === 'hidratacao')
        .map(item => ({
            data: item.registrado_em,
            hidratacao: item.valor.hidratacao
        }));


        // Exibe os últimos 7 dias no gráfico
        filtrarUltimosSeteDias();
        filtrarUltimosSeteDias2();
        filtrarUltimosSeteDias3();

    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
        // window.location.href = "../pag_login/login.html";
    }
});

// Função para gerar o gráfico
let chart = null;

function gerarGrafico(dates, pesos) {
    const ctx = document.getElementById('graficoPeso').getContext('2d');
    
    if (chart) {
        chart.destroy();  // Destruir o gráfico anterior antes de criar um novo
    }

    // Calcula os valores mínimo e máximo com base nos pesos
    const pesoMinimo = Math.ceil(Math.min(...pesos) - 3); // Arredonda para cima o valor mínimo
    const pesoMaximo = Math.ceil(Math.max(...pesos) + 3); // Arredonda para cima o valor máximo

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates, // Datas para o eixo X
            datasets: [{
                label: 'Peso',
                data: pesos, // Pesos para o eixo Y
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgba(0, 255, 140, 0.38)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'ÚLTIMOS 7 DIAS', // Título do gráfico
                    font: {
                        size: 11, // Tamanho da fonte do título
                    },
                    color: '#000000', // Cor do título (preto)
                },
                legend: {
                    display: false, // Esconde a legenda se não for necessária
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw + ' kg'; // Adiciona "kg" após o valor da tooltip
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: pesoMinimo, // Define o valor mínimo do eixo Y
                    max: pesoMaximo, // Define o valor máximo do eixo Y
                    ticks: {
                        stepSize: 1, // Ajusta o intervalo de marcação do eixo Y
                        callback: function(value) {
                            return value + ' kg'; // Adiciona "kg" após o valor
                        }
                    },
                }
            }
        }
    });
}



// Função para filtrar os últimos 7 dias automaticamente
function filtrarUltimosSeteDias() {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 7);

    // Filtrar os dados de peso com base nos últimos 7 dias
    const dadosFiltrados = dadosPeso.filter(item => {
        const dataMedida = new Date(item.data);
        return dataMedida >= seteDiasAtras && dataMedida <= hoje;
    });

    // Preparar as datas e pesos para o gráfico
    const datas = dadosFiltrados.map(item => formatDate(item.data));
    const pesos = dadosFiltrados.map(item => item.peso);

    // Atualizar o gráfico
    gerarGrafico(datas, pesos);
}

let chart2 = null;

function gerarGrafico2(dates, calorias) {
    const ctx = document.getElementById('graficoCalorias').getContext('2d');
    
    if (chart2) {
        chart2.destroy();
    }

    chart2 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Calorias',
                data: calorias,
                backgroundColor: 'rgb(255, 132, 0)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 1,
                barThickness: 10,
                categoryPercentage: 0.6,
                barPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'ÚLTIMOS 7 DIAS',
                    font: {
                        size: 11,
                    },
                    color: '#000000',
                },
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw + ' kcal';
                        }
                    }
                }
            },
            scales: {
                y: {
                    display: false // remove completamente a escala lateral
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
// Função para filtrar os últimos 7 dias automaticamente
function filtrarUltimosSeteDias2() {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 7);

    // Filtrar os dados de peso com base nos últimos 7 dias
    const dadosFiltrados = dadosCaloria.filter(item => {
        const dataMedida = new Date(item.data);
        return dataMedida >= seteDiasAtras && dataMedida <= hoje;
    });

    // Preparar as datas e pesos para o gráfico
    const datas = dadosFiltrados.map(item => formatDate(item.data));
    const calorias = dadosFiltrados.map(item => item.calorias);

    // Atualizar o gráfico
    gerarGrafico2(datas, calorias);
}

let chart3 = null;

function gerarGrafico3(dates, hidratacao) {
    const ctx = document.getElementById('graficoHidratacao').getContext('2d');
    
    if (chart3) {
        chart3.destroy();
    }

    chart3 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'hidratacao',
                data: hidratacao,
                backgroundColor: 'rgb(61, 126, 255)',
                borderColor: 'rgb(0, 0, 0)',
                borderWidth: 1,
                barThickness: 10,
                categoryPercentage: 0.6,
                barPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'ÚLTIMOS 7 DIAS',
                    font: {
                        size: 11,
                    },
                    color: '#000000',
                },
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw + ' ml';
                        }
                    }
                }
            },
            scales: {
                y: {
                    display: false // remove completamente a escala lateral
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
// Função para filtrar os últimos 7 dias automaticamente
function filtrarUltimosSeteDias3() {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 7);

    // Filtrar os dados de peso com base nos últimos 7 dias
    const dadosFiltrados = dadosHidratacao.filter(item => {
        const dataMedida = new Date(item.data);
        return dataMedida >= seteDiasAtras && dataMedida <= hoje;
    });

    // Preparar as datas e pesos para o gráfico
    const datas = dadosFiltrados.map(item => formatDate(item.data));
    const hidratacao = dadosFiltrados.map(item => item.hidratacao);

    // Atualizar o gráfico
    gerarGrafico3(datas, hidratacao);
}

// Função para exibir as informações do usuário na interface
function frontending() {
    document.getElementById('peso').textContent = "PESO ATUAL:" + peso + " kg";
    document.getElementById('peso_ideal').textContent = "PESO IDEAL ESTIMADO:" + peso_ideal + " kg";

    document.getElementById('medida_altura').textContent = altura +" cm";
    document.getElementById('medida_biceps_direito').textContent = bc_direito +" cm";
    document.getElementById('medida_biceps_esquerdo').textContent = bc_esquerdo +" cm";
    document.getElementById('medida_antebraco_direito').textContent = atb_direito +" cm";
    document.getElementById('medida_antebraco_esquerdo').textContent = atb_esquerdo +" cm";
    document.getElementById('medida_coxa_direito').textContent = cx_direito +" cm";
    document.getElementById('medida_coxa_esquerdo').textContent = cx_esquerdo +" cm";
    document.getElementById('medida_panturilha_direito').textContent = ptr_direito +" cm";
    document.getElementById('medida_panturilha_esquerdo').textContent = ptr_esquerdo +" cm";
    document.getElementById('medida_cintura').textContent = ctr +" cm";

    fetch("../Icones/silhueta.svg")
    .then(response => response.text())
    .then(svg => {
      document.getElementById("svg_medidas").innerHTML = svg;
    })
    .catch(error => console.error("Erro ao carregar o SVG:", error));

    function Hover_medidas(id_html, obj_medidas) {
        const medidas_html = document.getElementById(id_html);
    
        if (!medidas_html) return; // Evita erros caso o elemento não exista
    
        medidas_html.addEventListener("mouseenter", function () {
            obj_medidas.forEach(id => document.getElementById(id)?.classList.add("hover_medidas"));
        });
    
        medidas_html.addEventListener("mouseleave", function () {
            obj_medidas.forEach(id => document.getElementById(id)?.classList.remove("hover_medidas"));
        });
    }
    
    // Mapeia os elementos de gatilho para os elementos que serão modificados
    const listaHovers = [
        { obj_medidas: "obj_biceps_direito", id_obj_medidas: ["biceps_direito"] },
        { obj_medidas: "obj_biceps_esquerdo", id_obj_medidas: ["biceps_esquerdo"] },
        { obj_medidas: "obj_antebraco_direito", id_obj_medidas: ["antebraco_direito"] },
        { obj_medidas: "obj_antebraco_esquerdo", id_obj_medidas: ["antebraco_esquerdo"] },
        { obj_medidas: "obj_coxa_direito", id_obj_medidas: ["coxa_direita"] },
        { obj_medidas: "obj_coxa_esquerdo", id_obj_medidas: ["coxa_esquerda"] },
        { obj_medidas: "obj_panturilha_direito", id_obj_medidas: ["panturilha_direita"] },
        { obj_medidas: "obj_panturilha_esquerdo", id_obj_medidas: ["panturilha_esquerda"] },
        { obj_medidas: "obj_cintura", id_obj_medidas: ["cintura"] },
        { obj_medidas: "obj_altura", id_obj_medidas: ["altura", "altura2", "altura3"] }
    ];
    
    // Aplica os eventos de hover dinamicamente
    listaHovers.forEach(mapping => Hover_medidas(mapping.obj_medidas, mapping.id_obj_medidas));

    let status_imc = null;

    if(imc<=18.50){
        status_imc = " - ABAIXO DO PESO";
    }else if(imc>18.50 && imc<=25){
        status_imc = " - PESO NORMAL";
    }else if(imc>25 && imc<=29.90){
        status_imc = " - SOBREPESO.";
    }else if(imc>29.90 && imc<=39.90){
        status_imc = " - OBESIDADE";
    }else if(imc>39.90){
        status_imc = " - OBESIDADE GRAVE";
    }

    document.getElementById('imc_valor').textContent = imc + status_imc;
    gordura_corporal = 10;
    musculo_esqueletico = 40;
    agua_massa=40;

    document.getElementById('gordura_valor').textContent = "GORDURA(%): " + gordura_corporal + " %";

    document.getElementById('musculo_valor').textContent = "MUSCULO ESQUELETICO(KG): " + musculo_esqueletico + " Kg";

    document.getElementById('agua_valor').textContent = "ÁGUA(KG): " + agua_massa + " Kg"; 

    document.getElementById('cal_span').textContent = calorias + "/" + tmb + " Kcal"; 

    document.getElementById('agua_span').textContent = agua_consumida + "/" + meta_hidratacao + " ml"; 

    atualizarBarra();
    atualizarBarraHidratacao();


}


// Evento para alternar o menu lateral
toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
});

botaoHome.addEventListener('click', () =>{
    window.location.href = '../pag_principal/principal.html';
});

botaoPeso.addEventListener('click', () =>{
    window.location.href = '../pag_peso/peso.html';
});

botaoMedidas.addEventListener('click', () =>{
    window.location.href = '../pag_medidas/medidas.html';
});

botaoMetricas.addEventListener('click', () =>{
    window.location.href = '../pag_metricas/metricas.html';
});

botaoCalorias.addEventListener('click', () =>{
    window.location.href = '../pag_calorias/calorias.html';
});

botaoHidratacao.addEventListener('click', () =>{
    window.location.href = '../pag_hidratacao/hidratacao.html';
});

botaoSono.addEventListener('click', () =>{
    window.location.href = '../pag_sono/sono.html';
});

botaoDieta.addEventListener('click', () =>{
    window.location.href = '../pag_dieta/dieta.html';
});

botaoExercicio.addEventListener('click', () =>{
    window.location.href = '../pag_exercicios/exercicio.html';
});

botaoPerfil.addEventListener('click', () =>{
    window.location.href = '../pag_perfil/perfil.html';
});

// Logout
botaoLogout.addEventListener('click', () => {
    // Remove os tokens armazenados
    localStorage.removeItem('jwt');
    sessionStorage.removeItem('jwt');
    
    // Redireciona para a página de login
    window.location.href = '../pag_login/login.html';
});

container_peso.addEventListener('click', () => {
    window.location.href = '../pag_peso/peso.html';
});

container_medidas.addEventListener('click', () => {
    window.location.href = '../pag_medidas/medidas.html';
});

container_metricas.addEventListener('click', () => {
    window.location.href = '../pag_metricas/metricas.html';
});

container_calorias.addEventListener('click', () => {
    // window.location.href = '../pag_calorias/calorias.html';
});

container_hidratacao.addEventListener('click', () => {
    window.location.href = '../pag_hidratacao/hidratacao.html';
});

container_sono.addEventListener('click', () => {
    window.location.href = '../pag_sono/sono.html';
});

container_dieta.addEventListener('click', () => {
    window.location.href = '../pag_dieta/dieta.html';
});

container_exercicios.addEventListener('click', () => {
    window.location.href = '../pag_exercicios/exercicio.html';
});


function calcularIdade(data_nascimento) {
    let nascimento = new Date(data_nascimento);
    let hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    
    // Verifica se o aniversário já ocorreu este ano
    if (hoje.getMonth() < nascimento.getMonth() || 
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) {
        idade--; // Ainda não fez aniversário este ano
    }

    return idade;
}

function atualizarBarra() {
    const barra = document.getElementById('barra');
    const texto = document.getElementById('textoBarra');

    const percentual = ((calorias / tmb) * 100).toFixed(1);
    const largura = Math.min(percentual, 100); // A barra para no 100%

    barra.style.width = largura + '%';
    texto.textContent = percentual + '%';
}

function atualizarBarraHidratacao() {
    const barra = document.getElementById('barra_hidratacao');
    const texto = document.getElementById('textoBarraHidratacao');

    const percentual = ((agua_consumida / meta_hidratacao) * 100).toFixed(1);
    const largura = Math.min(percentual, 100); // A barra para no 100%

    barra.style.width = largura + '%';
    texto.textContent = percentual + '%';
}
