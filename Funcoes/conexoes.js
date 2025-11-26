import { API_BASE_URL } from "../Funcoes/seletorProd_local.js";

// Busca conexões
export async function getConexoesAluno() {
    const endpoint = `${API_BASE_URL}/alunos/me/conexoes`;

    const rawLocal = localStorage.getItem("jwt");
    const token = sessionStorage.getItem("jwt") || (rawLocal ? JSON.parse(rawLocal).token : null);

    if (!token) return null;

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar conexões:", error);
        return null;
    }
}

// Responde conexão (Atualizado para o novo Controller)
export async function responderConexaoAluno(conexao_id, aceitar) {
    const endpoint = `${API_BASE_URL}/alunos/conexoes/${conexao_id}/responder`;
    
    const rawLocal = localStorage.getItem("jwt");
    const token = sessionStorage.getItem("jwt") || (rawLocal ? JSON.parse(rawLocal).token : null);

    if (!token) return null;

    // Converte booleano para a string que o controller espera
    const statusEnvio = aceitar ? "accepted" : "rejected";

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // O Backend espera { status: "accepted" } ou { status: "rejected" }
            body: JSON.stringify({ status: statusEnvio })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || `Erro: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao responder conexão:", error);
        alert("Erro ao processar solicitação: " + error.message);
        return null;
    }
}

// Lógica principal: Busca e Abre o Modal
export async function carregarEGerenciarConexoes() {
    // 1. Busca as conexões
    const dadosRetornados = await getConexoesAluno();


    // --- TRATAMENTO DO DADO ---
    // Se for null ou undefined, encerra
    if (!dadosRetornados) {
        return;
    }

    // O PULO DO GATO:
    // Se for um Array, usa ele mesmo.
    // Se for um objeto único (não array), coloca ele dentro de um array [dadosRetornados]
    const listaConexoes = Array.isArray(dadosRetornados) ? dadosRetornados : [dadosRetornados];

    // 2. Filtra apenas as que estão com status "pending" (pendente)
    // Agora podemos usar .find() porque temos certeza que é um array
    const conexaoPendente = listaConexoes.find(c => c?.status === 'pending'); 

    if (conexaoPendente) {
        // 3. Exibe o Modal com os dados
        exibirModalConexao(conexaoPendente);
    } else {
        console.log("Nenhuma conexão pendente encontrada.");
    }
}



// Função auxiliar para manipular o DOM do Modal
function exibirModalConexao(conexao) {
    const modal = document.getElementById('modal-conexao');
    if (!modal) {
        console.error("Modal não encontrado!");
        return;
    }


    const avatarImg = document.getElementById('modal-avatar-prof');
    const nomeProf = document.getElementById('modal-nome-prof');
    const btnAceitar = document.getElementById('btn-aceitar-conexao');
    const btnRecusar = document.getElementById('btn-recusar-conexao');

    avatarImg.src = conexao.professor?.avatar || '../elementosCSS/225-default-avatar.png';
    nomeProf.textContent = conexao.professor?.nome || 'Professor';

    // Verifique se o estilo está sendo alterado corretamente
    modal.style.display = 'flex'; // Isso deve tornar o modal visível

    // Configura os botões
    btnAceitar.onclick = async () => {
        btnAceitar.innerText = "Processando...";
        btnAceitar.disabled = true;
        
        const resultado = await responderConexaoAluno(conexao.conexao_id, true);
        
        if (resultado) {
            modal.style.display = 'none';
            alert("Conexão aceita com sucesso! 🎉");
            window.location.reload(); 
        } else {
            btnAceitar.innerText = "Aceitar";
            btnAceitar.disabled = false;
        }
    };

    btnRecusar.onclick = async () => {
        if(!confirm("Tem certeza que deseja recusar este professor?")) return;

        btnRecusar.innerText = "...";
        const resultado = await responderConexaoAluno(conexao.conexao_id, false);
        
        if (resultado) {
            modal.style.display = 'none';
        } else {
            btnRecusar.innerText = "Recusar";
        }
    };
}

