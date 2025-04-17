export function gerarSidebar() {
  const menuItems = [
    { id: "homeLink", icon: "home", text: "Home", href: "../pag_principal/principal.html" },
    { id: "pesoLink", icon: "peso", text: "Peso", href: "../pag_peso/peso.html" },
    { id: "medidasLink", icon: "medidas", text: "Medidas", href: "../pag_medidas/medidas.html" },
    { id: "metricasLink", icon: "metricas", text: "Metricas", href: "../pag_metricas/metricas.html" },
    { id: "dietaLink", icon: "dieta", text: "Dieta", href: "../pag_dieta/dieta.html" },
    { id: "exercicioLink", icon: "exercicios", text: "Exercicios", href: "../pag_exercicios/exercicio.html" },
    { id: "perfilLink", icon: "perfil", text: "Perfil", href: "../pag_perfil/perfil.html" },
    { id: "logoutLink", icon: "logout", text: "Sair", href: null }
  ];

  const sidebarMenu = document.getElementById("sidebarMenu");

  menuItems.forEach(item => {
    const li = document.createElement("li");
    li.className = "nav-item item__sidebar";

    li.innerHTML = `
      <a class="nav-link" id="${item.id}">
        <img src="../Icones/${item.icon}.svg" alt="Ícone ${item.text}" class="icon_sideBar" />
        <span class="item-text">${item.text}</span>
      </a>
    `;

    sidebarMenu.appendChild(li);

    const link = li.querySelector("a");

    if (item.id === "logoutLink") {
      link.addEventListener("click", () => {
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
        window.location.href = "../pag_login/login.html";
      });
    } else if (item.href) {
      link.addEventListener("click", () => {
        window.location.href = item.href;
      });
    } else if (item.id === "darkModeToggle") {
      link.addEventListener("click", () => {
        toggleDarkMode();
      });
    }    
  });

  // Adiciona o toggle da sidebar
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  if (toggleSidebar && sidebar) {
    toggleSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("expanded");
    });
  }
}