export async function verificarAutenticacao(API_BASE_URL) {
    let jwt = null;
  
    if (sessionStorage.getItem("jwt")) {
      jwt = sessionStorage.getItem("jwt");
    }
  
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
  
    if (!jwt) {
      limparSessaoERedirecionar();
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
        limparSessaoERedirecionar();
        return;
      }
  
      const data = await response.json();
      console.log("Usuário autenticado:", data);
      window.usuarioLogado = data;
  
    } catch (error) {
      console.error("Erro ao validar sessão:", error);
      limparSessaoERedirecionar();
    }
  }
  
  function limparSessaoERedirecionar() {
    localStorage.removeItem("jwt");
    sessionStorage.removeItem("jwt");
    window.location.href = "../pag_login/login.html";
  }
  