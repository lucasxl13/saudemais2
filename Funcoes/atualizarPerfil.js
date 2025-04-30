const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://apisaudemais.danielhatz.com.br";

export function salvarAvatarNoServidor(avatarURL) {

    const token = sessionStorage.getItem("jwt") || JSON.parse(localStorage.getItem("jwt"))?.token;

    
    fetch(`${API_BASE_URL}/updateUserData/avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`      },
      body: JSON.stringify({ valor: avatarURL })
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao salvar avatar.");
        return res.text();
      })
      .then(msg => mostrarToast(msg))
      .catch(err => mostrarToast("Erro ao salvar avatar no servidor."));
  }
  