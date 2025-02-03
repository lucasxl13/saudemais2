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

let usuario = null;
let data_medida = null;
let peso = null;


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
        // https://apisaudemais.danielhatz.com.br/dados-usuario
        //http://localhost:3000/dados-usuario
        const response = await fetch("https://apisaudemais.danielhatz.com.br/dados-usuario", {
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
        data_medida = formatDate(userInfo.data_medida);
        peso = userInfo.peso;

        // Armazena os dados de peso e data para o gráfico
        dadosPeso = data.map(item => ({
            data: item.data_medida,
            peso: item.peso,
        }));

        frontending();
        // Exibe os últimos 7 dias no gráfico
        filtrarUltimosSeteDias();

        const entrada_peso = document.getElementById("peso");
        const peso_valor = document.getElementById("peso-valor");

        if (peso) {
            entrada_peso.value = peso; // Define o slider
            peso_valor.value = peso;
            peso_valor.textContent = `${peso} kg`; // Atualiza o texto
        }


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

function frontending() {
document.getElementById('peso_atual').textContent = peso + " kg";
}

const entrada_peso = document.getElementById("peso");
const peso_valor = document.getElementById("peso-valor");

let intervalo; // Armazena o ID do intervalo
let velocidade = 50; // Velocidade inicial em ms
let aceleracao = 10; // Incremento na velocidade
let vel_minima = 5; // Velocidade mínima (ms)
let incremento = 0; // Valor incremental (positivo ou negativo)
let delay; // Timeout para ativar a aceleração

// Atualiza o texto do peso com base no slider
function atualizaPeso(valor) {
  peso_valor.textContent = parseFloat(valor).toFixed(1) + ' kg';
  peso_valor.value = entrada_peso.value;
}
// Função para iniciar o ajuste contínuo ao segurar clicado
function inicia_ajustepeso(valor) {
  incremento = valor;
  // Altera o peso uma vez imediatamente
  alterarPeso(valor);

  // Inicia o timeout para começar a aceleração após 500ms
  delay = setTimeout(() => {
    velocidade = 50; // Velocidade inicial

    // Cria um loop que ajusta o peso continuamente
    intervalo = setInterval(() => {
      alterarPeso(valor);

      // Reduz a velocidade gradualmente (até o limite mínimo)
      if (velocidade > vel_minima) {
        velocidade -= aceleracao;
        clearInterval(intervalo); // Limpa o intervalo atual
        intervalo = setInterval(() => alterarPeso(valor), velocidade); // Reinicia o intervalo com a nova velocidade
      }
    }, velocidade);
  }, 500); // Espera 500ms antes de começar o ajuste contínuo
}

// Função para parar o ajuste contínuo
function finaliza_ajustepeso() {
  clearTimeout(delay); // Cancela o timeout de aceleração
  clearInterval(intervalo); // Para o intervalo
}

// Altera o valor do peso no slider e atualiza a exibição
function alterarPeso(valor) {
  const slider = entrada_peso;
  let novoValor = parseFloat(slider.value) + valor;

  // Garante que o valor permaneça dentro dos limites do slider
  if (novoValor >= parseFloat(slider.min) && novoValor <= parseFloat(slider.max)) {
    slider.value = novoValor.toFixed(1);
    atualizaPeso(novoValor);
  }
}
document.getElementById('modif_peso').addEventListener('click', () => {
    document.getElementById('alterar_peso').style.display = 'block';
    document.getElementById('modif_peso').style.display = 'none';
    document.getElementById('modif_peso2').style.display = 'none';
});

document.getElementById('exit_peso').addEventListener('click', () => {
    document.getElementById('alterar_peso').style.display = 'none';
    document.getElementById('modif_peso').style.display = 'block';
    document.getElementById('modif_peso2').style.display = 'block';
});


document.getElementById('edit_peso').addEventListener('click', async () => {
    // Obtém o novo peso e a data atual
    const novoPeso = peso_valor.value;

    if (!novoPeso) {
        return; // Se o usuário não inseriu nada, não faz nada
    }

    const dataAtual = new Date().toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

    // Verifica se o peso inserido é um número
    if (isNaN(novoPeso) || novoPeso <= 0) {
        alert("Por favor, insira um valor válido de peso.");
        return;
    }

    const jwt = sessionStorage.getItem("jwt") || localStorage.getItem("jwt");

    try {
        // Faz a requisição para atualizar o peso
        //https://apisaudemais.danielhatz.com.br/atualizar-peso
        //http://localhost:3000/atualizar-peso
        const response = await fetch("https://apisaudemais.danielhatz.com.br/atualizar-peso", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: dataAtual, // Passa a data atual
                peso: parseFloat(novoPeso) // Passa o peso atualizado
            })
        });

        if (!response.ok) {
            throw new Error("Erro ao atualizar o peso.");
        }

        location.reload();

    } catch (error) {
        console.error("Erro ao atualizar peso:", error);
        alert(error.message);
    }
});