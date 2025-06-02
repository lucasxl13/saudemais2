// chat.js
const API_BASE_URL = window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  // : "https://saude-mais-service-api.vercel.app";
  : "https://apisaudemais.danielhatz.com.br";

document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chatToggle');
    const chatContainer = document.getElementById('chatContainer');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
  
    let chatIniciado = false; // garante que só mostre uma vez

    function toggleChat() {
      const isOpen = chatContainer.style.display === 'flex';

      if (isOpen) {
        chatContainer.style.display = 'none';
      } else {
        chatContainer.style.display = 'flex';

        if (!chatIniciado) {
          appendMessage('Bot', 'Olá! 👋 Estou aqui para te ajudar com sua saúde. Como posso te ajudar hoje?');
          chatIniciado = true;
        }
      }
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
      const isBot = sender === 'Bot';

      msgDiv.classList.add('mensagem'); // classe base
      msgDiv.classList.add(isBot ? 'bot' : 'usuario'); // classe condicional

      msgDiv.innerHTML = `<strong>${sender}:</strong> <span class="typing"></span>`;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (isBot) {
        const typingSpan = msgDiv.querySelector('.typing');
        let index = 0;

        const typingInterval = setInterval(() => {
          if (index < message.length) {
            typingSpan.textContent += message.charAt(index);
            index++;
            chatMessages.scrollTop = chatMessages.scrollHeight;
          } else {
            clearInterval(typingInterval);
          }
        }, 20);
      } else {
        msgDiv.querySelector('.typing').textContent = message;
      }
    }


  });
  