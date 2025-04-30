export function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
  
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000); // Duração: 3 segundos
  }
  