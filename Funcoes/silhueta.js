export function silhueta(ultimoRegistro, containerId = "silhueta_container") {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container com id "${containerId}" não encontrado.`);
      return;
    }
  
    // Injeta o HTML
    container.innerHTML = `

        <p class="texto_meio" id="hover_altura">ALTURA: <span id="medida_altura"></span></p>
      
        <div class="area_silhueta">
          <div class="coluna_esquerda">
            <p class="texto_lateral" id="hover_biceps_direito">BÍCEPS DIR: <span id="medida_biceps_direito"></span></p>
            <p class="texto_lateral" id="hover_antebraco_direito">ANTEBRAÇO DIR: <span id="medida_antebraco_direito"></span></p>
            <p class="texto_lateral" id="hover_coxa_direita">COXA DIR: <span id="medida_coxa_direita"></span></p>
            <p class="texto_lateral" id="hover_panturrilha_direita">PANTURRILHA DIR: <span id="medida_panturrilha_direita"></span></p>
          </div>
      
          <div id="svg_medidas"></div>
      
          <div class="coluna_direita">
            <p class="texto_lateral" id="hover_biceps_esquerdo">BÍCEPS ESQ: <span id="medida_biceps_esquerdo"></span></p>
            <p class="texto_lateral" id="hover_antebraco_esquerdo">ANTEBRAÇO ESQ: <span id="medida_antebraco_esquerdo"></span></p>
            <p class="texto_lateral" id="hover_coxa_esquerda">COXA ESQ: <span id="medida_coxa_esquerda"></span></p>
            <p class="texto_lateral" id="hover_panturrilha_esquerda">PANTURRILHA ESQ: <span id="medida_panturrilha_esquerda"></span></p>
          </div>
        </div>
      
        <p class="texto_meio" id="hover_cintura">CINTURA: <span id="medida_cintura"></span></p>
    `;
  
    // Preenche os valores
    const m = ultimoRegistro.medidas_corporais;
    document.getElementById('medida_altura').textContent = `${ultimoRegistro.altura} cm`;
    document.getElementById('medida_biceps_direito').textContent = `${m.biceps_direito} cm`;
    document.getElementById('medida_biceps_esquerdo').textContent = `${m.biceps_esquerdo} cm`;
    document.getElementById('medida_antebraco_direito').textContent = `${m.antebraco_direito} cm`;
    document.getElementById('medida_antebraco_esquerdo').textContent = `${m.antebraco_esquerdo} cm`;
    document.getElementById('medida_coxa_direita').textContent = `${m.coxa_direita} cm`;
    document.getElementById('medida_coxa_esquerda').textContent = `${m.coxa_esquerda} cm`;
    document.getElementById('medida_panturrilha_direita').textContent = `${m.panturrilha_direita} cm`;
    document.getElementById('medida_panturrilha_esquerda').textContent = `${m.panturrilha_esquerda} cm`;
    document.getElementById('medida_cintura').textContent = `${m.cintura} cm`;
  
    // Carrega o SVG
    fetch("../Icones/silhueta.svg")
      .then(res => res.text())
      .then(svg => {
        document.getElementById("svg_medidas").innerHTML = svg;
        ativarHovers(); // só ativa depois que o SVG foi carregado
      })
      .catch(err => console.error("Erro ao carregar o SVG:", err));
  
    // Função para configurar os hovers
    function Hover_medidas(id_html, ids_svg) {
      const el = document.getElementById(id_html);
      if (!el) return;
      el.addEventListener("mouseenter", () => ids_svg.forEach(id => document.getElementById(id)?.classList.add("hover_medidas")));
      el.addEventListener("mouseleave", () => ids_svg.forEach(id => document.getElementById(id)?.classList.remove("hover_medidas")));
    }
  
    function ativarHovers() {
      [
        ["hover_biceps_direito", ["biceps_direito"]],
        ["hover_biceps_esquerdo", ["biceps_esquerdo"]],
        ["hover_antebraco_direito", ["antebraco_direito"]],
        ["hover_antebraco_esquerdo", ["antebraco_esquerdo"]],
        ["hover_coxa_direita", ["coxa_direita"]],
        ["hover_coxa_esquerda", ["coxa_esquerda"]],
        ["hover_panturrilha_direita", ["panturrilha_direita"]],
        ["hover_panturrilha_esquerda", ["panturrilha_esquerda"]],
        ["hover_cintura", ["cintura"]],
        ["hover_altura", ["altura", "altura2", "altura3"]]
      ].forEach(([gatilho, ids]) => Hover_medidas(gatilho, ids));
    }
  }