const campoLogo = document.querySelector('.style_logo');
const itemLogo = document.getElementById('itemMais_logo');
const itemSideBar = document.querySelectorAll('.item__sidebar'); // Alterado para querySelectorAll
const toggleSidebar = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');

const botaoHome = document.getElementById('homeLink');
const botaoHidratacao = document.getElementById('hidratacaoLink');
const botaoCalorias = document.getElementById('calorialink');
const botaoDieta = document.getElementById('dietalink');
const botaoPerfil= document.getElementById('perfilLink');
const botaoLogout = document.getElementById('logoutlink');

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  let jwt = null;

  if (sessionStorage.getItem("jwt")) {
    jwt = sessionStorage.getItem("jwt");
  }

  if (!jwt && localStorage.getItem("jwt")) {
    const storedData = JSON.parse(localStorage.getItem("jwt"));

    if (Date.now() > storedData.expiresAt) {
      localStorage.removeItem("jwt");
      sessionStorage.removeItem("jwt");
      window.location.href = "../pag_login/login.html";
      return;
    }

    jwt = storedData.token;
  }

  if (!jwt) {
    window.location.href = "../pag_login/login.html";
    return;
  }

//https://apisaudemais.danielhatz.com.br/dados-usuario
//http://localhost:3000/dados-usuario
  try {
    const response = await fetch("//https://apisaudemais.danielhatz.com.br/dados-usuario", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem("jwt");
      sessionStorage.removeItem("jwt");
      window.location.href = "../pag_login/login.html";
      throw new Error("Erro ao carregar os dados.");
    }

    const data = await response.json();
    console.log("Dados do usuário:", data);

    // Exibe informações do usuário
    const userInfo = data[0];
    document.getElementById('usuario').textContent = userInfo.usuario;
    document.getElementById('email').textContent = userInfo.email;
    document.getElementById('data_nascimento').textContent = formatDate(userInfo.data_nascimento);
    document.getElementById('sexo').textContent = userInfo.sexo;
    document.getElementById('objetivo').textContent = userInfo.objetivo;

    // Exibe todas as medições
    const medidasTableBody = document.getElementById("medidas-table-body");
    medidasTableBody.innerHTML = ""; // Limpa o conteúdo anterior

    // Arrays para o gráfico
    const datas = [];
    const pesos = [];
    const alturas = [];

    data.forEach((medida) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${formatDate(medida.data_medida)}</td>
        <td>${medida.altura}</td>
        <td>${medida.peso}</td>
      `;
      medidasTableBody.appendChild(row);

      // Adiciona os dados para o gráfico
      datas.push(formatDate(medida.data_medida));
      pesos.push(medida.peso);
      alturas.push(medida.altura);
    });

    // Cria o gráfico usando Chart.js
    const ctx = document.getElementById('graficoMedidas').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: datas, // Datas como labels do eixo X
        datasets: [
          {
            label: 'Peso (kg)',
            data: pesos,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3, // Suaviza a curva da linha
          },
          {
            label: 'Altura (cm)',
            data: alturas,
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.3, // Suaviza a curva da linha
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Datas',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Valores',
            },
            beginAtZero: false,
          },
        },
      },
    });
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
    window.location.href = "../pag_login/login.html";
  }
});


document.getElementById('button_menu').addEventListener('click', (event) => {
  event.preventDefault(); 
  window.location.href = '../pag_principal/principal.html';  
});

toggleSidebar.addEventListener('click', () => {
  sidebar.classList.toggle('expanded');
});