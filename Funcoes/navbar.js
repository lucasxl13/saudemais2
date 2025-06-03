export function inicializarNavbarETema() {
  const body = document.body;

  const preferenciaSalva = localStorage.getItem('preferencia-tema');
  const temaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (preferenciaSalva === 'dark' || (!preferenciaSalva && temaSistema)) {
    body.classList.add('dark-mode');
  }

  const header = document.createElement('header');
  header.className = 'navbar navbar-expand-lg navbar-dark fixed-top style_bg_nav';

  const container = document.createElement('div');
  container.className = 'container-fluid';

  const grupoBotoes = document.createElement('div');
  grupoBotoes.style.display = 'flex';
  grupoBotoes.style.alignItems = 'center';

  const btnMenu = document.createElement('button');
  btnMenu.className = 'btn_sidebar';
  btnMenu.id = 'toggleSidebar';
  btnMenu.textContent = 'Menu';

  const btnTema = document.createElement('label');
  btnTema.className = 'switch-tema';
  btnTema.title = 'Alternar tema';

  const inputToggle = document.createElement('input');
  inputToggle.type = 'checkbox';
  inputToggle.checked = body.classList.contains('dark-mode');

  const slider = document.createElement('span');
  slider.className = 'slider-tema';
  slider.innerHTML = `
    <i class="bi bi-moon"></i>
    <i class="bi bi-sun"></i>
  `;

  btnTema.appendChild(inputToggle);
  btnTema.appendChild(slider);

inputToggle.addEventListener('change', () => {
  const isDark = inputToggle.checked;

  if (isDark) {
    body.classList.add('dark-mode');
    localStorage.setItem('preferencia-tema', 'dark');
  } else {
    body.classList.remove('dark-mode');
    localStorage.setItem('preferencia-tema', 'light');
  }

  const textoCor = getComputedStyle(document.body).getPropertyValue('--texto').trim();


  if (window.graficoPeso) {
    window.graficoPeso.options.scales.x.ticks.color = textoCor;
    window.graficoPeso.options.scales.y.ticks.color = textoCor;
    window.graficoPeso.update();
  }

  if (window.chartGlobal) {
    window.chartGlobal.options.scales.x.ticks.color = textoCor;
    window.chartGlobal.options.scales.y.ticks.color = textoCor;
    window.chartGlobal.options.plugins.legend.labels.color = textoCor;
    window.chartGlobal.update();
  }

    if (window.chartMetricasGerais) {
    window.chartMetricasGerais.options.scales.x.ticks.color = textoCor;
    window.chartMetricasGerais.options.scales.y.ticks.color = textoCor;
    window.chartMetricasGerais.options.plugins.legend.labels.color = textoCor;
    window.chartMetricasGerais.update();
  }


  if (window.graficoCaloriaCircular) {
  const corBase = getComputedStyle(document.body).getPropertyValue('--graficoCircular').trim();
  window.graficoCaloriaCircular.data.datasets[0].backgroundColor = ["rgb(255, 98, 0)", corBase];
  window.graficoCaloriaCircular.update();
}

  if (window.graficoHidratacaoCircular) {
  const corBase = getComputedStyle(document.body).getPropertyValue('--graficoCircular').trim();
  window.graficoHidratacaoCircular.data.datasets[0].backgroundColor = ["rgb(0, 110, 255)", corBase];
  window.graficoHidratacaoCircular.update();
}

if (window.graficoUnificado) {
  window.graficoUnificado.options.scales.x.ticks.color = textoCor;
  window.graficoUnificado.options.scales.y.ticks.color = textoCor;
  window.graficoUnificado.options.plugins.title.color = textoCor;
  window.graficoUnificado.update();
}

});

  grupoBotoes.appendChild(btnMenu);
  grupoBotoes.appendChild(btnTema);

const logo = document.createElement('a');
logo.id = 'button_menu';
logo.className = 'style_logo';
logo.href = '#';
logo.innerHTML = 'Saúde <strong id="itemMais_logo">+</strong>';
logo.addEventListener('click', (e) => {
  e.preventDefault(); // impede o comportamento padrão do link
  location.reload();  // recarrega a página atual
});

  container.appendChild(grupoBotoes);
  container.appendChild(logo);
  header.appendChild(container);
  document.body.prepend(header);

  if (!preferenciaSalva) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (e.matches) {
        body.classList.add('dark-mode');
        inputToggle.checked = true;
      } else {
        body.classList.remove('dark-mode');
        inputToggle.checked = false;
      }

      const textoCor = getComputedStyle(document.body).getPropertyValue('--texto').trim();
      if (window.graficoPeso) {
        window.graficoPeso.options.scales.x.ticks.color = textoCor;
        window.graficoPeso.options.scales.y.ticks.color = textoCor;
        window.graficoPeso.update();
      }
    });
  }
}
