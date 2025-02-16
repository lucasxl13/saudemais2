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
        const userInfo = data[data.length - 1]; // Pega o último dado do usuário

        usuario = userInfo.usuario;
        email = userInfo.email;
        data_nascimento = formatDate(userInfo.data_nascimento);
        sexo = userInfo.sexo;
        objetivo = userInfo.objetivo;
        data_medida = formatDate(userInfo.data_medida);
        peso = userInfo.peso;
        altura = userInfo.altura;

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

    fetch("../Icones/silhueta.svg")
    .then(response => response.text())
    .then(svg => {
      document.getElementById("svg_medidas").innerHTML = svg;
    })
    .catch(error => console.error("Erro ao carregar o SVG:", error));

    document.getElementById("obj_biceps_direito").addEventListener("mouseenter", function() {
        document.getElementById("biceps_direito").classList.add("hover_medidas");
    });
    document.getElementById("obj_biceps_direito").addEventListener("mouseleave", function() {
        document.getElementById("biceps_direito").classList.remove("hover_medidas");
    });

    document.getElementById("obj_biceps_esquerdo").addEventListener("mouseenter", function() {
        document.getElementById("biceps_esquerdo").classList.add("hover_medidas");
    });
    document.getElementById("obj_biceps_esquerdo").addEventListener("mouseleave", function() {
        document.getElementById("biceps_esquerdo").classList.remove("hover_medidas");
    });

    document.getElementById("obj_antebraco_direito").addEventListener("mouseenter", function() {
        document.getElementById("antebraco_direito").classList.add("hover_medidas");
    });
    document.getElementById("obj_antebraco_direito").addEventListener("mouseleave", function() {
        document.getElementById("antebraco_direito").classList.remove("hover_medidas");
    });

    document.getElementById("obj_antebraco_esquerdo").addEventListener("mouseenter", function() {
        document.getElementById("antebraco_esquerdo").classList.add("hover_medidas");
    });
    document.getElementById("obj_antebraco_esquerdo").addEventListener("mouseleave", function() {
        document.getElementById("antebraco_esquerdo").classList.remove("hover_medidas");
    });

    document.getElementById("obj_coxa_direito").addEventListener("mouseenter", function() {
        document.getElementById("coxa_direita").classList.add("hover_medidas");
    });
    document.getElementById("obj_coxa_direito").addEventListener("mouseleave", function() {
        document.getElementById("coxa_direita").classList.remove("hover_medidas");
    });

    document.getElementById("obj_coxa_esquerdo").addEventListener("mouseenter", function() {
        document.getElementById("coxa_esquerda").classList.add("hover_medidas");
    });
    document.getElementById("obj_coxa_esquerdo").addEventListener("mouseleave", function() {
        document.getElementById("coxa_esquerda").classList.remove("hover_medidas");
    });

    document.getElementById("obj_panturilha_direito").addEventListener("mouseenter", function() {
        document.getElementById("panturilha_direita").classList.add("hover_medidas");
    });
    document.getElementById("obj_panturilha_direito").addEventListener("mouseleave", function() {
        document.getElementById("panturilha_direita").classList.remove("hover_medidas");
    });

    document.getElementById("obj_panturilha_esquerdo").addEventListener("mouseenter", function() {
        document.getElementById("panturilha_esquerda").classList.add("hover_medidas");
    });
    document.getElementById("obj_panturilha_esquerdo").addEventListener("mouseleave", function() {
        document.getElementById("panturilha_esquerda").classList.remove("hover_medidas");
    });

    document.getElementById("obj_cintura").addEventListener("mouseenter", function() {
        document.getElementById("cintura").classList.add("hover_medidas");
    });
    document.getElementById("obj_cintura").addEventListener("mouseleave", function() {
        document.getElementById("cintura").classList.remove("hover_medidas");
    });

    document.getElementById("obj_altura").addEventListener("mouseenter", function() {
        document.getElementById("altura").classList.add("hover_medidas");
        document.getElementById("altura2").classList.add("hover_medidas");
        document.getElementById("altura3").classList.add("hover_medidas");
    });
    document.getElementById("obj_altura").addEventListener("mouseleave", function() {
        document.getElementById("altura").classList.remove("hover_medidas");
        document.getElementById("altura2").classList.remove("hover_medidas");
        document.getElementById("altura3").classList.remove("hover_medidas");
    });
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
