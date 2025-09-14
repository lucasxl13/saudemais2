export function mostrarSenha(selector = ".toggle-senha") {
  document.querySelectorAll(selector).forEach((icon) => {
    const targetId = icon.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (!input) return;

    const mostrar = () => {
      input.type = "text";
      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    };

    const ocultar = () => {
      input.type = "password";
      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    };

    // ===== Desktop =====
    icon.addEventListener("mousedown", mostrar);
    icon.addEventListener("mouseup", ocultar);
    icon.addEventListener("mouseleave", ocultar);

    // ===== Mobile =====
    icon.addEventListener("touchstart", mostrar);
    icon.addEventListener("touchend", ocultar);
    icon.addEventListener("touchcancel", ocultar);
  });
}
