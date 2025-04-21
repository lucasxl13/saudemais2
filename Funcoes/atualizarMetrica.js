const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  // : "https://saude-mais-service-api.vercel.app";
  : "https://apisaudemais.danielhatz.com.br";

export async function atualizarMetricaNoServidor(tipo, valor) {
  const jwt = sessionStorage.getItem("jwt") || JSON.parse(localStorage.getItem("jwt"))?.token;

  if (!jwt) {
    console.error("JWT não encontrado.");
    return;
  }

  try {
    console.log(`🔥 Atualizando ${tipo}:`, valor);
    const resposta = await fetch(`${API_BASE_URL}/update/${tipo}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`,
      },
      body: JSON.stringify({ valor }),
    });

    const texto = await resposta.text();
    console.log(`✅ ${tipo} atualizado:`, texto);
  } catch (erro) {
    console.error(`❌ Erro ao atualizar ${tipo}:`, erro);
  }
}
