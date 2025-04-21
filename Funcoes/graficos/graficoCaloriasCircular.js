let graficoCaloria = null;

export function graficoCaloriasCirculo(ultimoRegistro) {
  const ctx = document.getElementById("graficoCaloria").getContext("2d");

  const meta = ultimoRegistro.calorias.meta;
  const consumido = ultimoRegistro.calorias.consumido;

  const corBase = getComputedStyle(document.body).getPropertyValue('--graficoCircular').trim();
  const corTxt = getComputedStyle(document.body).getPropertyValue('--texto').trim();

  const dados = [Math.min(consumido, meta), Math.max(meta - consumido, 0)];

  if (!graficoCaloria) {
    graficoCaloria = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Consumido", "Restante"],
        datasets: [{
          data: dados,
          backgroundColor: ["rgb(255, 98, 0)", corBase],
          borderColor: "rgb(0, 0, 0)",
          borderWidth: 3,
          cutout: "80%"
        }]
      },
      options: {
        responsive: true,
        rotation: -0.5 * Math.PI,
        animation: {
          animateRotate: true,
          duration: 1000,
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
        },
      },
      plugins: [{
        id: "porcentagemNoCentro",
        afterDraw(chart) {
          const dados = chart.data.datasets[0].data;
          const consumido = ultimoRegistro.calorias.consumido;
          const meta = ultimoRegistro.calorias.meta;
          const porcentagem = Math.round((consumido / meta) * 100);

          const ctx = chart.ctx;
          const corTxt = getComputedStyle(document.body).getPropertyValue('--texto').trim();

          ctx.save();
          ctx.font = "bold 40px sans-serif";
          ctx.fillStyle = corTxt;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.clearRect(chart.width / 4, chart.height / 4, chart.width / 2, chart.height / 2); // limpa o centro
          ctx.fillText(`${porcentagem}%`, chart.width / 2, chart.height / 2 - 10);
          ctx.font = "14px sans-serif";
          ctx.fillText(`${consumido}/${meta} kcal`, chart.width / 2, chart.height / 2 + 18);
          ctx.restore();
        }
      }]
    });
  } else {
    graficoCaloria.data.datasets[0].data = [Math.min(consumido, meta), Math.max(meta - consumido, 0)];
    graficoCaloria.update();
  }
}