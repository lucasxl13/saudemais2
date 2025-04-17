export async function obterDataDoServidor(API_BASE_URL) {
    try {
      const resposta = await fetch(`${API_BASE_URL}/data-atual`);
      const json = await resposta.json();
      const dataServidor = new Date(json.data);
  
      console.log("📅 Data real do servidor:", dataServidor.toLocaleString("pt-BR"));
      return dataServidor;
    } catch (err) {
      console.error("❌ Erro ao buscar data do servidor:", err);
      return null;
    }
  }