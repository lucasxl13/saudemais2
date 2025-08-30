export function tema() {

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
function aplicarTemaPreferido(e) {
  if (e.matches) document.body.classList.add("dark-mode");
  else document.body.classList.remove("dark-mode");
}
aplicarTemaPreferido(mediaQuery);
mediaQuery.addEventListener("change", aplicarTemaPreferido);

}