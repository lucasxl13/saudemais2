// chat.js
const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://saude-mais-service-api.vercel.app";

document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chatToggle');
    const chatContainer = document.getElementById('chatContainer');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
  
    function toggleChat() {
      chatContainer.style.display = chatContainer.style.display === 'flex' ? 'none' : 'flex';
    }
  
    chatToggle.addEventListener('click', toggleChat);
  
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (!msg) return;
  
      appendMessage('Você', msg);
      chatInput.value = '';
  
      try {
        const token = sessionStorage.getItem("jwt") || JSON.parse(localStorage.getItem("jwt"))?.token;

      const response = await fetch(`${API_BASE_URL}/chatSaudeMais`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ⬅ adiciona o token aqui
        },
        body: JSON.stringify({ mensagem: msg })
      });
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Resposta não é JSON:', text);
        appendMessage('Bot', 'Erro na resposta do servidor');
        return;
      }
        
      appendMessage('Bot', data.text || 'Erro na resposta');
      } catch (err) {
        console.error('Erro ao conectar com o servidor:', err);
        appendMessage('Bot', 'Erro ao conectar com o servidor');
      }
    });
  
    function appendMessage(sender, message) {
      const msgDiv = document.createElement('div');
      msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });
  