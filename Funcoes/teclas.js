// ../Funcoes/teclas.js
export function bloquearTecla(campoId, tecla) {
  const campo = document.getElementById(campoId);
  if (!campo) return () => {};

  const normalizar = (k) => (k === "Spacebar" ? " " : k); // compatibilidade antiga
  const alvo = normalizar(tecla);

  const handler = (e) => {
    if (normalizar(e.key) === alvo) {
      e.preventDefault();
      // e.stopPropagation(); // opcional, caso queira bloquear a propagação
    }
  };

  campo.addEventListener("keydown", handler);
  return () => campo.removeEventListener("keydown", handler);
}