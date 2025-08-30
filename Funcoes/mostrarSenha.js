export function mostrarSenha(selector = ".toggle-senha") {
  document.querySelectorAll(selector).forEach(icon => {
    const targetId = icon.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (!input) return;

    icon.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
      }
    });
  });
}