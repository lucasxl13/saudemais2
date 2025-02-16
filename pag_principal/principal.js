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
const botaoHidratacao = document.getElementById('hidratacaoLink');
const botaoCalorias = document.getElementById('calorialink');
const botaoDieta = document.getElementById('dietalink');
const botaoPerfil = document.getElementById('perfilLink');
const botaoLogout = document.getElementById('logoutlink');

const container_peso = document.getElementById('container_peso');


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
            window.location.href = "../pag_login/login.html";
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
        // Faz a requisição ao backend

        // const response = await fetch("https://apisaudemais.danielhatz.com.br/dados-usuario", {
        const response = await fetch(`${API_BASE_URL}/dados-usuario`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`,
            },
        });

        // Se a resposta não for OK, redireciona para o login
        if (!response.ok) {
            localStorage.removeItem("jwt");
            sessionStorage.removeItem("jwt");
            window.location.href = "../pag_login/login.html";
            return;
        }

        // Processa os dados do backend
        const data = await response.json();
        console.log(data);
        const userInfo = data[data.length - 1]; // Pega o último dado do usuário

        usuario = userInfo.usuario;
        email = userInfo.email;
        data_nascimento = formatDate(userInfo.data_nascimento);
        sexo = userInfo.sexo;
        objetivo = userInfo.objetivo;
        data_medida = formatDate(userInfo.data_medida);

        bc_direito = userInfo.biceps_direito;
        bc_esquerdo= userInfo.biceps_esquerdo;
        atb_direito=userInfo.antebraco_direito;
        atb_esquerdo=userInfo.antebraco_esquerdo;
        cx_direito=userInfo.coxa_direita;
        cx_esquerdo=userInfo.coxa_esquerda;
        ptr_direito=userInfo.panturilha_direita;
        ptr_esquerdo=userInfo.panturilha_esquerda;
        ctr=userInfo.cintura;

        peso = userInfo.peso;
        peso = parseFloat(peso).toFixed(2);

        altura = userInfo.altura;
        altura = parseFloat(altura).toFixed(0);

        imc = peso / ((altura / 100) * (altura / 100));
        imc = parseFloat(imc).toFixed(2);

        peso_ideal = 21.75 * ((altura / 100) * (altura / 100));
        peso_ideal = parseFloat(peso_ideal).toFixed(2);

        // Exibe os dados na interface
        frontending(); // Chama a função para exibir as informações

        // Armazena os dados de peso e data para o gráfico
        dadosPeso = data.map(item => ({
            data: item.data_medida,
            peso: item.peso,
        }));

        // Exibe os últimos 7 dias no gráfico
        filtrarUltimosSeteDias();
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
        window.location.href = "../pag_login/login.html";
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

// Função para exibir as informações do usuário na interface
function frontending() {
    document.getElementById('peso').textContent = "PESO ATUAL: " + peso + " kg";
    document.getElementById('peso_ideal').textContent = "PESO IDEAL ESTIMADO: " + peso_ideal + " kg";

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
