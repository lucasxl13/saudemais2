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
    
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);
            localStorage.removeItem("jwt");
            sessionStorage.removeItem("jwt");
            // window.location.href = "../pag_login/login.html";
        }
    });

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