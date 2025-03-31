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
const botaoCalorias = document.getElementById('calorialink');
const botaoHidratacao = document.getElementById('hidratacaoLink');
const botaoSono = document.getElementById('sonoLink');
const botaoDieta = document.getElementById('dietaLink');
const botaoExercicio = document.getElementById('exercicioLink');
const botaoPerfil = document.getElementById('perfilLink');
const botaoLogout = document.getElementById('logoutLink');


let usuario = null;
let data_medida = null;
let peso = null;
let peso_ideal= null;
let diferenca_peso = null;


// Armazenar os dados de peso e datas para o gráfico
let dadosPeso = [];

// Função para formatar datas (dia/mês)
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
    const year = String(date.getFullYear()).slice(-2); // Pegando os dois últimos dígitos do ano
  
    return `${day}/${month}/${year}`;
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

    const data = await response.json();
    console.log("Resposta da API:", data);

    const dadosUsuario = data.dados_usuario;
    const metricas = data.metricas;

    if (!metricas || metricas.length === 0) {
        console.warn("Nenhuma métrica de peso encontrada.");
        return;
    }

    const ultimoRegistro = metricas[metricas.length - 1];

    usuario = dadosUsuario.nome;
    data_medida = formatDate(ultimoRegistro.registrado_em);

    console.log("Registro mais recente:", ultimoRegistro);

    peso = ultimoRegistro.valor.peso;
    altura = ultimoRegistro.valor.altura || dadosUsuario.altura || 170;

    if (!altura || isNaN(altura)) {
        console.warn("Altura inválida:", altura);
        return;
    }

    dadosPeso = metricas.map(item => ({
        data: formatDate(item.registrado_em),
        peso: item.valor.peso,
    }));

    peso_ideal = 21.75 * ((altura / 100) ** 2);
    peso_ideal = parseFloat(peso_ideal).toFixed(1);

    diferenca_peso = peso - peso_ideal;
    diferenca_peso = parseFloat(diferenca_peso).toFixed(1);

    console.log("Peso ideal:", peso_ideal);
    console.log("Diferença:", diferenca_peso);

    filtrarDadosPorPeriodo("semana");
    frontending();

        // Exibe os últimos 7 dias no gráfico
        document.getElementById("semana").addEventListener("click", () => filtrarDadosPorPeriodo("semana"));
        document.getElementById("mes").addEventListener("click", () => filtrarDadosPorPeriodo("mes"));
        document.getElementById("ano").addEventListener("click", () => filtrarDadosPorPeriodo("ano"));
        document.getElementById("inicio").addEventListener("click", () => filtrarDadosPorPeriodo("inicio"));

        

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
        // window.location.href = "../pag_login/login.html";
    }
});

// Função para gerar o gráfico
let chart = null;
let dadosCompletos = [];
let inicioJanela = 0;
const tamanhoJanela = 30; // Número de pontos visíveis no gráfico
let tituloGrafico = ""; // Variável global para o título

const barraRolagem = document.getElementById("barraRolagem"); // Obtém o slider

function gerarGrafico(dates, pesos, titulo) {
    const ctx = document.getElementById('graficoPeso').getContext('2d');

    if (chart) {
        chart.destroy(); // Destroi o gráfico anterior antes de criar um novo
    }

    const pesoMinimo = Math.ceil(Math.min(...pesos) - 3);
    const pesoMaximo = Math.ceil(Math.max(...pesos) + 3);

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Peso',
                data: pesos,
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
                    text: titulo,
                    font: { size: 15 },
                    color: '#000000',
                },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw + ' kg';
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { autoSkip: true, maxTicksLimit: 10 }
                },
                y: {
                    min: pesoMinimo,
                    max: pesoMaximo,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value + ' kg';
                        }
                    }
                }
            }
        }
    });
}

// Atualiza o gráfico com base no slider
function atualizarGrafico() {
    const dadosVisiveis = dadosCompletos.slice(inicioJanela, inicioJanela + tamanhoJanela);
    
    const datas = dadosVisiveis.map(item => formatDate(item.data));
    const pesos = dadosVisiveis.map(item => item.peso);

    gerarGrafico(datas, pesos, tituloGrafico);
}

// Atualiza o índice da janela de visualização ao mover o slider
barraRolagem.addEventListener("input", function() {
    inicioJanela = parseInt(this.value);
    atualizarGrafico();
});

function calcularVariacaoPercentual(inicial, final) {
    if (inicial === 0) return "0%"; // Evita divisão por zero
    const variacao = ((final - inicial) / inicial) * 100;
    return `${variacao.toFixed(2)}%`;
}

// Função para filtrar os dados com base no período escolhido
function filtrarDadosPorPeriodo(periodo) {
    const hoje = new Date();
    let dataInicial;

    switch (periodo) {
        case "semana":
            dataInicial = new Date();
            dataInicial.setDate(hoje.getDate() - 7);
            tituloGrafico = "ÚLTIMOS 7 DIAS";
            barraRolagem.style.display = "none"; // Ocultar a barra
            break;
        case "mes":
            dataInicial = new Date();
            dataInicial.setMonth(hoje.getMonth() - 1);
            tituloGrafico = "ÚLTIMO MÊS";
            barraRolagem.style.display = "none"; // Ocultar a barra
            break;
        case "ano":
            dataInicial = new Date();
            dataInicial.setFullYear(hoje.getFullYear() - 1);
            tituloGrafico = "ÚLTIMO ANO";
            barraRolagem.style.display = "block"; // Mostrar a barra
            break;
        case "inicio":
            dataInicial = new Date(Math.min(...dadosPeso.map(item => new Date(item.data)))); 
            tituloGrafico = "DESDE O INÍCIO";
            barraRolagem.style.display = "block"; // Mostrar a barra
            break;
    }

    dadosCompletos = dadosPeso.filter(item => {
        const dataMedida = new Date(item.data);
        return dataMedida >= dataInicial && dataMedida <= hoje;
    });


    if (dadosCompletos.length > 1) {
        const pesoInicial = dadosCompletos[0].peso;
        const pesoFinal = dadosCompletos[dadosCompletos.length - 1].peso;
        const variacaoPercentual = ((pesoFinal - pesoInicial) / pesoInicial) * 100;

        document.getElementById("peso_var").textContent =`${variacaoPercentual.toFixed(2)}%`;
    } else {
        document.getElementById("peso_var").textContent = "0%";
    }

    

    if (periodo === "ano" || periodo === "inicio") {
        barraRolagem.max = Math.max(0, dadosCompletos.length - tamanhoJanela);

        // Agora garantimos que a barra sempre começa no final
        inicioJanela = Math.max(0, dadosCompletos.length - tamanhoJanela);
        barraRolagem.value = inicioJanela;
    } else {
        inicioJanela = 0;
    }

    atualizarGrafico();
    
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

function frontending() {

document.getElementById('peso_atual').textContent = peso + " kg";
document.getElementById('peso_ideal').textContent = peso_ideal + " kg";

if(diferenca_peso>-1 || diferenca_peso<1){
    document.getElementById('diferenca_peso').style.color = "green";
    document.getElementById('diferenca_peso').textContent = "PARABÉNS, VOCÊ ALCANÇOU SEU PESO IDEAL";
}
if(diferenca_peso>1){
    document.getElementById('diferenca_peso').style.color = "red";
    document.getElementById('diferenca_peso').textContent = "VOCÊ ESTÁ " + diferenca_peso + "KG ACIMA DO PESO";
}
else if(diferenca_peso<-1){
    document.getElementById('diferenca_peso').style.color = "red";
    document.getElementById('diferenca_peso').textContent = "VOCÊ ESTÁ " + diferenca_peso*(-1) + "KG ABAIXO DO PESO";
}
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

    const dataAtual = new Date().toLocaleDateString('en-CA'); // Formato 'YYYY-MM-DD'

    // Verifica se o peso inserido é um número
    if (isNaN(novoPeso) || novoPeso <= 0) {
        alert("Por favor, insira um valor válido de peso.");
        return;
    }

    const jwt = sessionStorage.getItem("jwt") || localStorage.getItem("jwt");

    try {
        const response = await fetch(`${API_BASE_URL}/update/peso`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${jwt}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            valor: {
              peso: parseFloat(novoPeso)
            }
          })
        });
      
        if (!response.ok) {
          const erro = await response.text();
          throw new Error(erro || "Erro ao atualizar o peso.");
        }
      
        // Atualização com sucesso
        console.log("Peso atualizado com sucesso!");
        location.reload();
      
      } catch (error) {
        console.error("Erro na atualização:", error);
        alert("Falha ao atualizar peso.");
      }
});


