const API_BASE_URL = window.location.hostname === "127.0.0.1" 
    ? "http://localhost:3000"  // Se for localhost, usa o endpoint local
    : "https://saude-mais-service-api.vercel.app";
    // : "https://apisaudemais.danielhatz.com.br";  // Se não for localhost, usa o endpoint de produção


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


    (async () => {
        let jwt = null;
      
        // 1. Pega o token do sessionStorage se tiver
        if (sessionStorage.getItem("jwt")) {
          jwt = sessionStorage.getItem("jwt");
        }
      
        // 2. Se não tiver no session, tenta pegar do localStorage e verifica expiração
        const stored = localStorage.getItem("jwt");
        if (!jwt && stored) {
          try {
            const storedData = JSON.parse(stored);
      
            if (Date.now() > storedData.expiresAt) {
              limparSessaoERedirecionar();
              return;
            }
      
            jwt = storedData.token;
          } catch (e) {
            console.error("Token malformado.");
            limparSessaoERedirecionar();
            return;
          }
        }
      
        // 3. Se não tiver nenhum token, redireciona
        if (!jwt) {
          limparSessaoERedirecionar();
          return;
        }
      
        // 4. Faz a requisição para validar o token
        try {
          const response = await fetch(`${API_BASE_URL}/dados-usuario`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${jwt}`,
            },
          });
      
          if (!response.ok) {
            limparSessaoERedirecionar();
            return;
          }
      
          const data = await response.json();
          console.log("Usuário autenticado:", data); // você pode guardar isso em window.usuarioLogado, por exemplo
          window.usuarioLogado = data;
      
        } catch (error) {
          console.error("Erro ao validar sessão:", error);
          limparSessaoERedirecionar();
        }
      
        function limparSessaoERedirecionar() {
          localStorage.removeItem("jwt");
          sessionStorage.removeItem("jwt");
          window.location.href = "../pag_login/login.html";
        }
      })();


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