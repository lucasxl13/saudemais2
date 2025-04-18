import icones from "./icones.js";

export function gerarSidebar() {
  const menuItems = [
    { id: "homeLink", icon: () => icones.home(), text: "Home", href: "../pag_principal/principal.html" },
    { id: "pesoLink", icon: () => icones.peso(), text: "Peso", href: "../pag_peso/peso.html" },
    { id: "medidasLink", icon: () => icones.medidas(), text: "Medidas", href: "../pag_medidas/medidas.html" },
    { id: "metricasLink", icon: () => icones.metricas(), text: "Metricas", href: "../pag_metricas/metricas.html" },
    { id: "dietaLink", icon: () => icones.dieta(), text: "Dieta", href: "../pag_dieta/dieta.html" },
    { id: "exercicioLink", icon: () => icones.exercicios(), text: "Exercicios", href: "../pag_exercicios/exercicio.html" },
    { id: "perfilLink", icon: () => icones.perfil(), text: "Perfil", href: "../pag_perfil/perfil.html" },
    { id: "logoutLink", icon: () => icones.logout(), text: "Sair", href: null }
  ];

  const sidebarMenu = document.getElementById("sidebarMenu");

  menuItems.forEach(item => {
    const li = document.createElement("li");
    li.className = "nav-item item__sidebar";

    const link = document.createElement("a");
    link.className = "nav-link";
    link.id = item.id;

    link.appendChild(item.icon());
    link.insertAdjacentHTML("beforeend", `<span class="item-text">${item.text}</span>`);

    link.addEventListener("click", () => {
      if (item.id === "logoutLink") {
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
        window.location.href = "../pag_login/login.html";
      } else if (item.href) {
        window.location.href = item.href;
      }
    });

    li.appendChild(link);
    sidebarMenu.appendChild(li);
  });

  document.getElementById("toggleSidebar")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("expanded");
  });
}