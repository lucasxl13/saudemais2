import { toggleDarkMode } from "./toogleDarkMode.js";	

export function gerarSidebar(menuItems) {
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