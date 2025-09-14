const icones = {

  home(fill = "var(--iconesSidebar)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 512 512");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const g = document.createElementNS(xmlns, "g");
    g.setAttribute("fill", fill);

    [
      "434.162,293.382 434.162,493.862 308.321,493.862 308.321,368.583 203.682,368.583 203.682,493.862 77.841,493.862 77.841,293.382 256.002,153.862",
      "0,242.682 256,38.93 512,242.682 482.21,285.764 256,105.722 29.79,285.764",
      "439.853,18.138 439.853,148.538 376.573,98.138 376.573,18.138"
    ].forEach(p => {
      const poly = document.createElementNS(xmlns, "polygon");
      poly.setAttribute("points", p);
      g.appendChild(poly);
    });

    svg.appendChild(g);
    return svg;
  },

  peso(fill = "var(--iconesSidebar)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const createElement = (tag, attrs) => {
      const el = document.createElementNS(xmlns, tag);
      for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }
      return el;
    };

    const paths = [
      { tag: "circle", attrs: { cx: "16", cy: "5", r: "2" } },
      { tag: "line", attrs: { x1: "5", y1: "5", x2: "14", y2: "5" } },
      { tag: "line", attrs: { x1: "18", y1: "5", x2: "27", y2: "5" } },
      { tag: "path", attrs: { d: "M16,7v14" } },
      { tag: "path", attrs: { d: "M1,17c0,2.2,1.8,4,4,4s4-1.8,4-4H1z" } },
      { tag: "polygon", attrs: { points: "5,5 1,17 9,17" } },
      { tag: "path", attrs: { d: "M23,17c0,2.2,1.8,4,4,4s4-1.8,4-4H23z" } },
      { tag: "polygon", attrs: { points: "27,5 23,17 31,17" } },
      { tag: "line", attrs: { x1: "16", y1: "1", x2: "16", y2: "3" } },
      { tag: "path", attrs: { d: "M24,30H8l0.5-1.6c0.3-0.8,1-1.4,1.9-1.4h11.1c0.9,0,1.6,0.6,1.9,1.4L24,30z" } },
      { tag: "path", attrs: { d: "M18,27h-4v-5c0-0.6,0.4-1,1-1h2c0.6,0,1,0.4,1,1V27z" } }
    ];

    for (const p of paths) {
      const el = createElement(p.tag, {
        ...p.attrs,
        fill: "none",
        stroke: fill,
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-miterlimit": "10"
      });
      svg.appendChild(el);
    }

    return svg;
  },

  medidas(fill = "var(--iconesSidebar)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 512 512");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const g = document.createElementNS(xmlns, "g");
    g.setAttribute("fill", fill);

    const path1 = document.createElementNS(xmlns, "path");
    path1.setAttribute("d", `M180.365,271.776c-39.859-0.008-76.916-5.275-107.957-14.441c-31.032-9.206-56.113-22.114-72.078-38.516
          L0,218.456v112.696c0.008,8.671,3.948,17.392,12.463,26.235c8.473,8.779,21.405,17.219,37.774,24.356
          c19.056,8.34,42.794,14.852,69.309,18.89v-70.001h16.88v72.178c12.008,1.286,24.463,2.044,37.28,2.242v-40.239h16.88v40.388h37.271
          v-74.568h16.88v74.568h37.271v-40.388h16.88v40.388h37.28v-74.568h16.88v74.568h37.28v-40.388h16.88v40.388h37.271v-74.568h16.88
          v74.568H512V271.776H180.365z`);

    const path2 = document.createElementNS(xmlns, "path");
    path2.setAttribute("d", `M295.774,254.896h64.948v-36.439l-0.33,0.362c-10.64,10.963-25.353,20.292-43.148,28.082
          C310.56,249.818,303.298,252.438,295.774,254.896z`);

    const path3 = document.createElementNS(xmlns, "path");
    path3.setAttribute("d", `M50.237,231.438c32.738,14.324,78.993,23.474,130.128,23.458c38.352,0,73.942-5.11,103.169-13.748
          c29.235-8.58,52.033-20.87,64.726-34.066c8.514-8.843,12.454-17.564,12.462-26.235c-0.008-8.679-3.948-17.391-12.462-26.235
          c-8.473-8.778-21.405-17.218-37.774-24.356c-32.738-14.334-78.993-23.482-130.12-23.457c-38.351-0.008-73.949,5.11-103.176,13.74
          c-29.234,8.58-52.033,20.87-64.726,34.073C3.948,163.456,0.008,172.168,0,180.847c0.008,8.671,3.948,17.392,12.463,26.235
          C20.936,215.86,33.868,224.3,50.237,231.438z M121.879,174.814c3.684-3.898,11.431-8.258,21.71-11.242
          c10.27-3.034,23.021-4.888,36.776-4.88c18.331-0.024,34.898,3.314,46.149,8.258c5.621,2.44,9.866,5.292,12.322,7.864
          c2.505,2.629,3.124,4.516,3.132,6.033c-0.008,1.508-0.627,3.404-3.132,6.034c-3.676,3.89-11.424,8.259-21.702,11.242
          c-10.27,3.033-23.013,4.879-36.769,4.879c-18.338,0.017-34.906-3.314-46.156-8.259c-5.621-2.44-9.866-5.291-12.33-7.863
          c-2.506-2.63-3.116-4.526-3.125-6.034C118.763,179.33,119.373,177.443,121.879,174.814z`);

    g.appendChild(path1);
    g.appendChild(path2);
    g.appendChild(path3);
    svg.appendChild(g);
    return svg;
  },

  metricas(fill = "var(--iconesSidebar)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");


    const path = document.createElementNS(xmlns, "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute("fill", fill);
    path.setAttribute("d", `M7.25 10.5a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5zm-1.543 9.207a1 1 0 0 1-1.414-1.414l14-14a1 1 0 1 1 1.414 1.414l-14 14zM13 17.25a3.75 3.75 0 1 0 7.5 0 3.75 3.75 0 0 0-7.5 0zM7.25 8.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5zm11.25 8.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0z`);

    svg.appendChild(path);
    return svg;
  },

  dieta(fill = "var(--iconesSidebar)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 -24.48 122.88 122.88");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const path = document.createElementNS(xmlns, "path");
    path.setAttribute("d", `M97.31,36.95c0,9.92-3.49,18.39-10.48,25.38c-7,7-15.46,10.5-25.38,10.5c-9.88,0-18.34-3.49-25.35-10.5 
          c-7-6.99-10.52-15.46-10.52-25.38c0-9.89,3.51-18.32,10.52-25.34c7.03-7,15.48-10.52,25.35-10.52c9.92,0,18.38,3.51,25.38,10.52 
          C93.81,18.63,97.31,27.06,97.31,36.95L97.31,36.95L97.31,36.95L97.31,36.95z M16.37,30.34c3.15-2.15,4.73-4.96,4.46-11.39V2.42 
          c-0.03-2.31-4.22-2.59-4.43,0l-0.16,13.41c-0.01,2.51-3.78,2.59-3.77,0l0.16-13.87c-0.05-2.48-4.05-2.73-4.1,0 
          c0,3.85-0.16,10.02-0.16,13.87c0.2,2.43-3.3,2.75-3.21,0L5.32,2.05C5.23,0.18,3.17-0.49,1.77,0.39C0.28,1.34,0.58,3.25,0.52,4.86 
          L0,20.68c0.08,4.6,1.29,8.34,4.89,9.93c0.55,0.24,1.31,0.43,2.19,0.56L5.84,69.75c-0.07,2.29,1.8,4.16,3.99,4.16h0.5 
          c2.47,0,4.56-2.11,4.49-4.68l-1.09-38.07C14.88,30.98,15.83,30.71,16.37,30.34L16.37,30.34z M106.74,68.59l-0.06-34.65 
          c-12.15-7.02-8.28-34.07,3.88-33.92c14.78,0.17,16.53,30.48,3.82,33.81l0.94,34.9C115.5,75.33,106.75,75.94,106.74,68.59 
          L106.74,68.59z M82.33,36.92c0,5.78-2.03,10.71-6.12,14.8c-4.08,4.07-9.01,6.12-14.79,6.12c-5.74,0-10.67-2.05-14.75-6.12 
          c-4.08-4.09-6.12-9.02-6.12-14.8c0-5.74,2.04-10.67,6.12-14.74c4.09-4.07,9.01-6.12,14.75-6.12C73.03,16.07,82.33,25.3,82.33,36.92 
          L82.33,36.92L82.33,36.92z M87.22,36.92c0-7.1-2.5-13.17-7.53-18.2s-11.12-7.53-18.27-7.53c-7.13,0-13.2,2.5-18.2,7.53 
          c-5.03,5.03-7.56,11.1-7.56,18.2c0,7.12,2.53,13.19,7.56,18.24c5,5.04,11.07,7.57,18.2,7.57c7.14,0,13.23-2.53,18.27-7.57 
          C84.71,50.1,87.22,44.03,87.22,36.92L87.22,36.92z`);
    path.setAttribute("fill", fill);
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");

    svg.appendChild(path);
    return svg;
  },

  exercicios(fill = "var(--iconesSidebar)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 50 50");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const path = document.createElementNS(xmlns, "path");
    path.setAttribute("d", `M17.962 44.874c.374.403.352 1.041-.05 1.416l-2.172 2.031c-.402.375-1.037.353-1.411-.051l-12.649-13.632c-.374-.403-.351-1.04.051-1.416l2.175-2.028c.402-.376 1.037-.353 1.411.051l12.645 13.629zm16.14-25.65c.374.403.351 1.041-.051 1.416l-13.67 12.77c-.402.375-1.037.353-1.411-.051l-3.263-3.521c-.374-.403-.351-1.041.051-1.416l13.667-12.77c.401-.375 1.036-.353 1.41.051l3.267 3.521zm-11.489 21.303c.374.403.351 1.04-.051 1.416l-2.175 2.03c-.402.376-1.037.353-1.411-.051l-12.642-13.632c-.374-.403-.352-1.041.05-1.416l2.171-2.029c.402-.375 1.037-.353 1.411.051l12.647 13.631zm21.063-20.814c.374.403.351 1.041-.052 1.416l-2.174 2.03c-.402.375-1.037.353-1.412-.05l-12.644-13.629c-.375-.403-.352-1.04.05-1.416l2.18-2.035c.401-.375 1.036-.353 1.41.051l12.642 13.633zm4.644-4.34c.374.403.351 1.041-.051 1.417l-2.17 2.029c-.401.376-1.036.353-1.41-.05l-12.642-13.635c-.374-.403-.352-1.041.05-1.417l2.172-2.033c.401-.376 1.035-.354 1.409.05l12.642 13.639z`);
    path.setAttribute("fill", fill);

    svg.appendChild(path);
    return svg;
  },


  perfil(fill = "var(--iconesSidebar)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const path = document.createElementNS(xmlns, "path");
    path.setAttribute("d", `M5.85 17.1C6.7 16.45 7.65 15.9375 8.7 15.5625C9.75 15.1875 10.85 15 12 15C13.15 15 14.25 15.1875 15.3 15.5625C16.35 15.9375 17.3 16.45 18.15 17.1C18.7333 16.4167 19.1875 15.6417 19.5125 14.775C19.8375 13.9083 20 12.9833 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 12.9833 4.1625 13.9083 4.4875 14.775C4.8125 15.6417 5.26667 16.4167 5.85 17.1ZM12 13C11.0167 13 10.1875 12.6625 9.5125 11.9875C8.8375 11.3125 8.5 10.4833 8.5 9.5C8.5 8.51667 8.8375 7.6875 9.5125 7.0125C10.1875 6.3375 11.0167 6 12 6C12.9833 6 13.8125 6.3375 14.4875 7.0125C15.1625 7.6875 15.5 8.51667 15.5 9.5C15.5 10.4833 15.1625 11.3125 14.4875 11.9875C13.8125 12.6625 12.9833 13 12 13ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22Z`);
    path.setAttribute("fill", fill);

    svg.appendChild(path);
    return svg;
  },

  logout(stroke = "var(--iconesSidebar)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const path = document.createElementNS(xmlns, "path");
    path.setAttribute("d", "M16 6.07026C18.3912 7.45349 20 10.0389 20 13C20 17.4183 16.4183 21 12 21C7.58172 21 4 17.4183 4 13C4 10.0389 5.60879 7.45349 8 6.07026M12 3V13");
    path.setAttribute("stroke", stroke);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("fill", "none");

    svg.appendChild(path);
    return svg;
  },

  fire(streak_calorias = 0) {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "-33 -20 255 295");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icone_streak");

    const createPath = (d, fill, stroke = null, strokeWidth = 0) => {
      const path = document.createElementNS(xmlns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", fill);
      if (stroke) {
        path.setAttribute("stroke", stroke);
        path.setAttribute("stroke-width", strokeWidth);
      }
      return path;
    };

    svg.appendChild(createPath(
      `M187.899,164.809 C185.803,214.868 144.574,254.812 94.000,254.812 C42.085,254.812 -0.000,211.312 -0.000,160.812 C-0.000,154.062 -0.121,140.572 10.000,117.812 C16.057,104.191 19.856,95.634 22.000,87.812 C23.178,83.513 25.469,76.683 32.000,87.812 C35.851,94.374 36.000,103.812 36.000,103.812 C36.000,103.812 50.328,92.817 60.000,71.812 C74.179,41.019 62.866,22.612 59.000,9.812 C57.662,5.384 56.822,-2.574 66.000,0.812 C75.352,4.263 100.076,21.570 113.000,39.812 C131.445,65.847 138.000,90.812 138.000,90.812 C138.000,90.812 143.906,83.482 146.000,75.812 C148.365,67.151 148.400,58.573 155.999,67.813 C163.226,76.600 173.959,93.113 180.000,108.812 C190.969,137.321 187.899,164.809 187.899,164.809 Z`,
      "rgb(255, 98, 0)", "black", 15
    ));
    svg.appendChild(createPath(
      `M94.000,254.812 C58.101,254.812 29.000,225.711 29.000,189.812 C29.000,168.151 37.729,155.000 55.896,137.166 C67.528,125.747 78.415,111.722 83.042,102.172 C83.953,100.292 86.026,90.495 94.019,101.966 C98.212,107.982 104.785,118.681 109.000,127.812 C116.266,143.555 118.000,158.812 118.000,158.812 C118.000,158.812 125.121,154.616 130.000,143.812 C131.573,140.330 134.753,127.148 143.643,140.328 C150.166,150.000 159.127,167.390 159.000,189.812 C159.000,225.711 129.898,254.812 94.000,254.812 Z`,
      "rgb(255, 98, 0)"
    ));
    svg.appendChild(createPath(
      `M95.000,183.812 C104.250,183.812 104.250,200.941 116.000,223.812 C123.824,239.041 112.121,254.812 95.000,254.812 C77.879,254.812 69.000,240.933 69.000,223.812 C69.000,206.692 85.750,183.812 95.000,183.812 Z`,
      "rgb(255, 98, 0)"
    ));

    // Adiciona o texto no centro
    const text = document.createElementNS(xmlns, "text");
    text.setAttribute("x", "92"); // CENTRO X do seu desenho
    text.setAttribute("y", "180"); // CENTRO Y do seu desenho
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "75"); // tamanho do número
    text.setAttribute("font-weight", "bold");
    text.setAttribute("fill", "white"); // cor do número
    text.textContent = streak_calorias;
    svg.appendChild(text);

    return svg;
  },

  fire2() {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "-33 -20 255 295");

        svg.setAttribute("id", "icon_fogo2"); // para aplicar transformações via CSS
    svg.classList.add("icones");

    const createPath = (d, fill, stroke = null, strokeWidth = 0) => {
      const path = document.createElementNS(xmlns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", fill);
      if (stroke) {
        path.setAttribute("stroke", stroke);
        path.setAttribute("stroke-width", strokeWidth);
      }
      return path;
    };

    svg.appendChild(createPath(
      `M187.899,164.809 C185.803,214.868 144.574,254.812 94.000,254.812 C42.085,254.812 -0.000,211.312 -0.000,160.812 C-0.000,154.062 -0.121,140.572 10.000,117.812 C16.057,104.191 19.856,95.634 22.000,87.812 C23.178,83.513 25.469,76.683 32.000,87.812 C35.851,94.374 36.000,103.812 36.000,103.812 C36.000,103.812 50.328,92.817 60.000,71.812 C74.179,41.019 62.866,22.612 59.000,9.812 C57.662,5.384 56.822,-2.574 66.000,0.812 C75.352,4.263 100.076,21.570 113.000,39.812 C131.445,65.847 138.000,90.812 138.000,90.812 C138.000,90.812 143.906,83.482 146.000,75.812 C148.365,67.151 148.400,58.573 155.999,67.813 C163.226,76.600 173.959,93.113 180.000,108.812 C190.969,137.321 187.899,164.809 187.899,164.809 Z`,
      "rgb(255, 98, 0)", "black", 15
    ));

    svg.appendChild(createPath(
      `M94.000,254.812 C58.101,254.812 29.000,225.711 29.000,189.812 C29.000,168.151 37.729,155.000 55.896,137.166 C67.528,125.747 78.415,111.722 83.042,102.172 C83.953,100.292 86.026,90.495 94.019,101.966 C98.212,107.982 104.785,118.681 109.000,127.812 C116.266,143.555 118.000,158.812 118.000,158.812 C118.000,158.812 125.121,154.616 130.000,143.812 C131.573,140.330 134.753,127.148 143.643,140.328 C150.166,150.000 159.127,167.390 159.000,189.812 C159.000,225.711 129.898,254.812 94.000,254.812 Z`,
      "rgb(255, 98, 0)"
    ));

    svg.appendChild(createPath(
      `M95.000,183.812 C104.250,183.812 104.250,200.941 116.000,223.812 C123.824,239.041 112.121,254.812 95.000,254.812 C77.879,254.812 69.000,240.933 69.000,223.812 C69.000,206.692 85.750,183.812 95.000,183.812 Z`,
      "rgb(255, 98, 0)"
    ));

    return svg;
  },

  water(streak_hidratacao = 0) {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icone_streak");

    const createPath = (d, fill, stroke = null, strokeWidth = 0) => {
      const path = document.createElementNS(xmlns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", fill);
      if (stroke) {
        path.setAttribute("stroke", stroke);
        path.setAttribute("stroke-width", strokeWidth);
      }
      return path;
    };

    svg.appendChild(createPath(
      `M25.378 19.75c1.507 6.027-3.162 11.25-9.375 11.25s-10.9-5.149-9.375-11.25c0.937-3.75 5.625-9.375 9.375-18.75 3.75 9.374 8.438 15 9.375 18.75z`,
      "rgb(0, 164, 255)", "black", 1.5
    ));

    // Adiciona o texto no centro
    const text = document.createElementNS(xmlns, "text");
    text.setAttribute("x", "16"); // Centro do SVG
    text.setAttribute("y", "23"); // Centro ajustado para a gota
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "9"); // tamanho do número
    text.setAttribute("font-weight", "bold");
    text.setAttribute("fill", "white"); // cor do número
    text.textContent = streak_hidratacao;
    svg.appendChild(text);

    return svg;
  },

  water2() {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("id", "icon_agua2"); // para aplicar transformações via CSS
    svg.classList.add("icones");

    const createPath = (d, fill, stroke = null, strokeWidth = 0) => {
      const path = document.createElementNS(xmlns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", fill);
      if (stroke) {
        path.setAttribute("stroke", stroke);
        path.setAttribute("stroke-width", strokeWidth);
      }
      return path;
    };

    svg.appendChild(createPath(
      `M25.378 19.75c1.507 6.027-3.162 11.25-9.375 11.25s-10.9-5.149-9.375-11.25c0.937-3.75 5.625-9.375 9.375-18.75 3.75 9.374 8.438 15 9.375 18.75z`,
      "rgb(0, 164, 255)", "black", 1.5
    ));

    return svg;
  },

  down(fill = "currentColor") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const path = document.createElementNS(xmlns, "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute("d", "M4.29289 8.29289C4.68342 7.90237 5.31658 7.90237 5.70711 8.29289L12 14.5858L18.2929 8.29289C18.6834 7.90237 19.3166 7.90237 19.7071 8.29289C20.0976 8.68342 20.0976 9.31658 19.7071 9.70711L12.7071 16.7071C12.3166 17.0976 11.6834 17.0976 11.2929 16.7071L4.29289 9.70711C3.90237 9.31658 3.90237 8.68342 4.29289 8.29289Z");
    path.setAttribute("fill", fill);

    svg.appendChild(path);
    return svg;
  },

  up(fill = "currentColor") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const path = document.createElementNS(xmlns, "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute("d", "M12 7C12.2652 7 12.5196 7.10536 12.7071 7.29289L19.7071 14.2929C20.0976 14.6834 20.0976 15.3166 19.7071 15.7071C19.3166 16.0976 18.6834 16.0976 18.2929 15.7071L12 9.41421L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L11.2929 7.29289C11.4804 7.10536 11.7348 7 12 7Z");
    path.setAttribute("fill", fill);

    svg.appendChild(path);
    return svg;
  },

  equal(fill = "currentColor") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20"); // levemente menor
    svg.setAttribute("height", "20");
    svg.classList.add("icon_sideBar");

    const path1 = document.createElementNS(xmlns, "path");
    path1.setAttribute("d", "M6 14H18");
    path1.setAttribute("stroke", fill);
    path1.setAttribute("stroke-linecap", "round");
    path1.setAttribute("stroke-linejoin", "round");

    const path2 = document.createElementNS(xmlns, "path");
    path2.setAttribute("d", "M6 10H18");
    path2.setAttribute("stroke", fill);
    path2.setAttribute("stroke-linecap", "round");
    path2.setAttribute("stroke-linejoin", "round");

    svg.appendChild(path1);
    svg.appendChild(path2);

    return svg;
  },

  cancela(fill = "currentColor") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 512 512");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const g1 = document.createElementNS(xmlns, "g");
    g1.setAttribute("fill", "none");
    g1.setAttribute("fill-rule", "evenodd");
    g1.setAttribute("stroke", "none");
    g1.setAttribute("stroke-width", "1");

    const g2 = document.createElementNS(xmlns, "g");
    g2.setAttribute("fill", fill);
    g2.setAttribute("transform", "translate(91.520000, 91.520000)");

    const polygon = document.createElementNS(xmlns, "polygon");
    polygon.setAttribute("points", "328.96 30.2933333 298.666667 0 164.48 134.4 30.2933333 0 0 30.2933333 134.4 164.48 0 298.666667 30.2933333 328.96 164.48 194.56 298.666667 328.96 328.96 298.666667 194.56 164.48");

    g2.appendChild(polygon);
    g1.appendChild(g2);
    svg.appendChild(g1);
    return svg;
  },

  confirma(fill = "currentColor") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icon_sideBar");

    const path = document.createElementNS(xmlns, "path");
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("clip-rule", "evenodd");
    path.setAttribute("d", "M20.6097 5.20743C21.0475 5.54416 21.1294 6.17201 20.7926 6.60976L10.7926 19.6098C10.6172 19.8378 10.352 19.9793 10.0648 19.9979C9.77765 20.0166 9.49637 19.9106 9.29289 19.7072L4.29289 14.7072C3.90237 14.3166 3.90237 13.6835 4.29289 13.2929C4.68342 12.9024 5.31658 12.9024 5.70711 13.2929L9.90178 17.4876L19.2074 5.39034C19.5441 4.95258 20.172 4.87069 20.6097 5.20743Z");
    path.setAttribute("fill", fill);

    svg.appendChild(path);
    return svg;
  },

  peso2(fill = "var(--texto)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 282.305 282.305");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icone_pesoVariacao");

    const g = document.createElementNS(xmlns, "g");

    const path1 = document.createElementNS(xmlns, "path");
    path1.setAttribute("d", "M277.097,247.012L249.455,92.795c-2.563-14.299-15.003-24.707-29.529-24.707h-34.03c2.574-5.932,4.008-12.469,4.008-19.336C189.904,21.87,168.034,0,141.152,0S92.4,21.87,92.4,48.752c0,6.867,1.435,13.404,4.008,19.336h-34.03c-14.527,0-26.966,10.408-29.529,24.707L5.208,247.012c-1.567,8.743,0.821,17.732,6.521,24.544c5.7,6.813,14.126,10.749,23.008,10.749h212.83c8.883,0,17.308-3.936,23.008-10.749C276.276,264.744,278.664,255.755,277.097,247.012z M141.152,30c10.34,0,18.752,8.412,18.752,18.752s-8.412,18.752-18.752,18.752S122.4,59.092,122.4,48.752S130.813,30,141.152,30z M34.737,252.305L62.379,98.088h157.547l27.642,154.217H34.737z");
    path1.setAttribute("fill", fill);
    g.appendChild(path1);

    const path2 = document.createElementNS(xmlns, "path");
    path2.setAttribute("d", "M114.382,177.951l18.436-19.07c1.247-1.289,1.601-3.199,0.901-4.85s-2.32-2.724-4.114-2.724h-6.073c-1.251,0-2.444,0.524-3.291,1.445l-26.579,28.932v-23.471c0-3.814-3.092-6.906-6.906-6.906s-6.906,3.092-6.906,6.906v54.596c0,3.814,3.092,6.906,6.906,6.906s6.906-3.092,6.906-6.906v-13.767l11.199-11.432l17.512,29.895c0.802,1.369,2.269,2.21,3.856,2.21h7.076c1.639,0,3.146-0.897,3.927-2.338c0.781-1.44,0.712-3.193-0.182-4.567L114.382,177.951z");
    path2.setAttribute("fill", fill);
    g.appendChild(path2);

    const path3 = document.createElementNS(xmlns, "path");
    path3.setAttribute("d", "M200.808,183.039h-19.539c-3.182,0-5.763,2.58-5.763,5.763c0,3.182,2.58,5.763,5.763,5.763h10.056v8.681c-2.085,1.616-4.582,2.993-7.489,4.129c-2.909,1.136-5.811,1.703-8.702,1.703c-5.85,0-10.578-2.03-14.186-6.089c-3.61-4.061-5.413-10.15-5.413-18.269c0-7.528,1.78-13.205,5.343-17.033c3.561-3.825,8.359-5.739,14.395-5.739c3.981,0,7.302,0.972,9.963,2.916c1.478,1.081,2.693,2.38,3.648,3.898c1.492,2.372,4.283,3.593,7.037,3.077l0.017-0.003c2.35-0.44,4.316-2.045,5.222-4.258s0.629-4.734-0.737-6.696c-1.429-2.054-3.178-3.853-5.247-5.396c-4.776-3.562-11.409-5.344-19.902-5.344c-6.533,0-11.993,1.138-16.378,3.407c-5.756,2.957-10.127,7.202-13.113,12.74c-2.986,5.536-4.48,11.868-4.48,18.991c0,6.565,1.337,12.638,4.013,18.222c2.675,5.585,6.674,9.878,11.992,12.879c5.321,3.002,11.557,4.502,18.713,4.502c5.63,0,11.19-1.065,16.683-3.196c4.506-1.749,8.137-3.722,10.893-5.922c1.062-0.847,1.681-2.137,1.681-3.495v-20.762C205.276,185.039,203.276,183.039,200.808,183.039z");
    path3.setAttribute("fill", fill);
    g.appendChild(path3);

    svg.appendChild(g);
    return svg;
  },

  porcentagem(fill = "none", stroke = "var(--texto)") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.classList.add("icone_porcentagem");

    const paths = [
      "M9 2H15C20 2 22 4 22 9V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2Z",
      "M8.57007 15.27L15.11 8.72998",
      "M8.98001 10.3699C9.65932 10.3699 10.21 9.81923 10.21 9.13992C10.21 8.46061 9.65932 7.90991 8.98001 7.90991C8.3007 7.90991 7.75 8.46061 7.75 9.13992C7.75 9.81923 8.3007 10.3699 8.98001 10.3699Z",
      "M15.52 16.0899C16.1993 16.0899 16.75 15.5392 16.75 14.8599C16.75 14.1806 16.1993 13.6299 15.52 13.6299C14.8407 13.6299 14.29 14.1806 14.29 14.8599C14.29 15.5392 14.8407 16.0899 15.52 16.0899Z"
    ];

    for (const d of paths) {
      const path = document.createElementNS(xmlns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", fill);
      path.setAttribute("stroke", stroke);
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);
    }

    return svg;
  },

  musculo(fill = "currentColor") {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 195.989 195.989");
    svg.setAttribute("id", "icon_musculo"); // para aplicar transformações via CSS
    svg.classList.add("icones");

    const path = document.createElementNS(xmlns, "path");
    path.setAttribute("d", `M195.935,84.745c-2.07-15.789-20.983-37.722-20.983-37.722c-4.933-12.69-17.677-8.47-17.677-8.47l-8.507,2.295
    c-8.421,2.533-8.025,13.555-4.372,15.789c1.602,0.978,6.297,1.233,7.685,0c0.414-0.374,0.098-2.165,0.098-2.165
    c8.933,0.487,9.584-4.688,9.584-4.688l3.039-0.606c3.044-1.665,3.72,5.395,3.72,5.395c-2.07,20.009,6.595,27.334,6.595,27.334
    c-1.254,3.973-5.62,3.206-5.62,3.206c-13.853-7.197-24.131,6.403-24.131,6.403c-7.831-6.671-23.991,5.148-23.991,5.148
    c-9.055,1.79-9.591-9.106-9.591-9.106s-0.42-6.941-0.713-7.578c-0.426-1.084,1.925-0.536,1.925-0.536
    c7.965-14.495,0-12.559,0-12.559c1.93-25.008-19.991-19.759-19.991-19.759C76.143,51.748,82.32,68.544,82.32,68.544
    c-3.702-0.904-1.927,4.616-1.927,4.616c0.956,8.473,3.985,6.552,3.985,6.552c0.393,2.968,2.058,7.054,2.058,7.054l0.256,6.808
    c-1.903,11.298-13.829,1.927-13.829,1.927c-6.996-9.864-24.536-4.348-24.536-4.348c-9.061-13.479-23.333-5.785-23.333-5.785
    c1.516-3.349-0.256-20.009-0.256-20.009c1.772-2.058,5.331-13.712,5.331-13.712c1.522,2.058,8.388,2.42,8.388,2.42
    c0.524,3.093,2.731,4.351,2.731,4.351c4.665,1.934,2.731-13.335,2.731-13.335c1.221-4.847-6.573-6.013-6.573-6.013
    c-13.594-3.739-16.742,4.847-16.742,4.847l-3.547,7.712c-5.063,5.52-14.565,24.368-14.565,24.368
    C-2.977,90.999,2.26,93.705,2.26,93.705l9.864,7.667c16.736,16.203,26.85,13.877,26.85,13.877
    c13.46-0.256,12.352,8.458,12.352,8.458c0.536,13.342,9.852,27.182,9.852,27.182c0.685,2.326,1.172,4.786,1.656,7.222h63.811
    c1.182-2.636,2.412-5.097,3.508-6.625c5.225-7.38,12.361-16.952,14.991-23.297c5.151-12.477,7.594-12.185,7.594-12.185
    c18.383,0,28.527-13.329,28.527-13.329c3.014-3.86,7.593-8.616,10.948-10.522C196.726,89.571,195.935,84.745,195.935,84.745z`);
    path.setAttribute("fill", "currentColor");
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "6");

    svg.appendChild(path);
    return svg;
  },

  imc(fill = "currentColor", stroke = "black") {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("viewBox", "0 0 512 512");
  svg.setAttribute("id", "icon_imc");
  svg.classList.add("icones");

  const g = document.createElementNS(xmlns, "g");
  g.setAttribute("fill", fill);
  g.setAttribute("stroke", stroke);
  g.setAttribute("stroke-width", "17");

  const path1 = document.createElementNS(xmlns, "path");
  path1.setAttribute("d", `M180.365,271.776c-39.859-0.008-76.916-5.275-107.957-14.441c-31.032-9.206-56.113-22.114-72.078-38.516
        L0,218.456v112.696c0.008,8.671,3.948,17.392,12.463,26.235c8.473,8.779,21.405,17.219,37.774,24.356
        c19.056,8.34,42.794,14.852,69.309,18.89v-70.001h16.88v72.178c12.008,1.286,24.463,2.044,37.28,2.242v-40.239h16.88v40.388h37.271
        v-74.568h16.88v74.568h37.271v-40.388h16.88v40.388h37.28v-74.568h16.88v74.568h37.28v-40.388h16.88v40.388h37.271v-74.568h16.88
        v74.568H512V271.776H180.365z`);

  const path2 = document.createElementNS(xmlns, "path");
  path2.setAttribute("d", `M295.774,254.896h64.948v-36.439l-0.33,0.362c-10.64,10.963-25.353,20.292-43.148,28.082
        C310.56,249.818,303.298,252.438,295.774,254.896z`);

  const path3 = document.createElementNS(xmlns, "path");
  path3.setAttribute("d", `M50.237,231.438c32.738,14.324,78.993,23.474,130.128,23.458c38.352,0,73.942-5.11,103.169-13.748
        c29.235-8.58,52.033-20.87,64.726-34.066c8.514-8.843,12.454-17.564,12.462-26.235c-0.008-8.679-3.948-17.391-12.462-26.235
        c-8.473-8.778-21.405-17.218-37.774-24.356c-32.738-14.334-78.993-23.482-130.12-23.457c-38.351-0.008-73.949,5.11-103.176,13.74
        c-29.234,8.58-52.033,20.87-64.726,34.073C3.948,163.456,0.008,172.168,0,180.847c0.008,8.671,3.948,17.392,12.463,26.235
        C20.936,215.86,33.868,224.3,50.237,231.438z M121.879,174.814c3.684-3.898,11.431-8.258,21.71-11.242
        c10.27-3.034,23.021-4.888,36.776-4.88c18.331-0.024,34.898,3.314,46.149,8.258c5.621,2.44,9.866,5.292,12.322,7.864
        c2.505,2.629,3.124,4.516,3.132,6.033c-0.008,1.508-0.627,3.404-3.132,6.034c-3.676,3.89-11.424,8.259-21.702,11.242
        c-10.27,3.033-23.013,4.879-36.769,4.879c-18.338,0.017-34.906-3.314-46.156-8.259c-5.621-2.44-9.866-5.291-12.33-7.863
        c-2.506-2.63-3.116-4.526-3.125-6.034C118.763,179.33,119.373,177.443,121.879,174.814z`);

  g.appendChild(path1);
  g.appendChild(path2);
  g.appendChild(path3);
  svg.appendChild(g);
  return svg;
},


  porcentagem2() {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.classList.add("icones");
    svg.setAttribute("id", "icon_gordura");

    const paths = [
      "M9 2H15C20 2 22 4 22 9V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2Z",
      "M8.57007 15.27L15.11 8.72998",
      "M8.98001 10.3699C9.65932 10.3699 10.21 9.81923 10.21 9.13992C10.21 8.46061 9.65932 7.90991 8.98001 7.90991C8.3007 7.90991 7.75 8.46061 7.75 9.13992C7.75 9.81923 8.3007 10.3699 8.98001 10.3699Z",
      "M15.52 16.0899C16.1993 16.0899 16.75 15.5392 16.75 14.8599C16.75 14.1806 16.1993 13.6299 15.52 13.6299C14.8407 13.6299 14.29 14.1806 14.29 14.8599C14.29 15.5392 14.8407 16.0899 15.52 16.0899Z"
    ];

    for (const d of paths) {
      const path = document.createElementNS(xmlns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "currentColor");
      path.setAttribute("stroke", "black");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);
    }

    return svg;
  },

maximo() {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("id", "icon_maximo");
  svg.classList.add("icones");

  const path1 = document.createElementNS(xmlns, "path");
  path1.setAttribute("d", "M9 11.25V18H8v-6.75a.25.25 0 0 0-.25-.25h-1.5a.25.25 0 0 0-.25.25V18H5v-6.75a.25.25 0 0 0-.25-.25H3v7H2v-8h2.75a1.223 1.223 0 0 1 .75.276A1.223 1.223 0 0 1 6.25 10h1.5A1.251 1.251 0 0 1 9 11.25zm7-.25v7h-3.75A1.251 1.251 0 0 1 11 16.75v-2.5A1.251 1.251 0 0 1 12.25 13H15v-2h-4v-1h4a1.001 1.001 0 0 1 1 1zm-1 3h-2.75a.25.25 0 0 0-.25.25v2.5a.25.25 0 0 0 .25.25H15zm5.5-1.008L18.79 10H18v1h.21l1.714 3-1.714 3H18v1h.79l1.71-2.992L22.21 18H23v-1h-.21l-1.714-3 1.714-3H23v-1h-.79z");
  // Deixe sem setar fill nem stroke aqui, para CSS controlar
  path1.setAttribute("class", "icon-layer");

  const path2 = document.createElementNS(xmlns, "path");
  path2.setAttribute("d", "M0 0h24v24H0z");
  path2.setAttribute("fill", "none");

  svg.appendChild(path1);
  svg.appendChild(path2);
  return svg;
},

minimo() {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("id", "icon_minimo");
  svg.classList.add("icones");

  const path1 = document.createElementNS(xmlns, "path");
  path1.setAttribute("d", "M14 17h2v1h-5v-1h2v-6h-2v-1h3zm7.75-7h-2.5A1.251 1.251 0 0 0 18 11.25V18h1v-6.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V18h1v-6.75A1.251 1.251 0 0 0 21.75 10zm-14 0h-1.5a1.223 1.223 0 0 0-.75.276A1.223 1.223 0 0 0 4.75 10H2v8h1v-7h1.75a.25.25 0 0 1 .25.25V18h1v-6.75a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25V18h1v-6.75A1.251 1.251 0 0 0 7.75 10zM14 9V6h-1v3z");
  path1.setAttribute("class", "icon-layer");

  const path2 = document.createElementNS(xmlns, "path");
  path2.setAttribute("d", "M0 0h24v24H0z");
  path2.setAttribute("fill", "none");

  svg.appendChild(path1);
  svg.appendChild(path2);
  return svg;
},

media() {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("id", "icon_media");
  svg.classList.add("icones");

  const path1 = document.createElementNS(xmlns, "path");
  path1.setAttribute("d", "M12.501 14.792l3.854 3.854-.707.707L13 16.705V23h-1v-6.293l-2.646 2.646-.707-.707zM8.647 6.354l3.854 3.854 3.854-3.854-.707-.707L13 8.295V2h-1v6.293L9.354 5.647zM6 13h13v-1H6z");
  path1.setAttribute("class", "icon-layer");

  const path2 = document.createElementNS(xmlns, "path");
  path2.setAttribute("d", "M0 0h24v24H0z");
  path2.setAttribute("fill", "none");

  svg.appendChild(path1);
  svg.appendChild(path2);
  return svg;
},

};

export default icones;


