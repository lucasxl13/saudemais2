let graficoCaloriaCircular = null;
window.graficoCaloriaCircular = graficoCaloriaCircular; // torna acessível globalmente

export function graficoCaloriasCirculo(ultimoRegistro) {
  const ctx = document.getElementById("graficoCaloria").getContext("2d");

  const meta = ultimoRegistro.calorias.meta;
  const consumido = ultimoRegistro.calorias.consumido;

  const corBase = getComputedStyle(document.body).getPropertyValue('--graficoCircular').trim();

  const dados = [Math.min(consumido, meta), Math.max(meta - consumido, 0)];

  if (!graficoCaloriaCircular) {
    graficoCaloriaCircular = new Chart(ctx, {
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
          const consumido = ultimoRegistro.calorias.consumido;
          const meta = ultimoRegistro.calorias.meta;
          const porcentagem = Math.round((consumido / meta) * 100);

          const ctx = chart.ctx;
          const corTxt = getComputedStyle(document.body).getPropertyValue('--texto').trim();

          ctx.save();
          ctx.font = "bold 30px sans-serif";
          ctx.fillStyle = corTxt;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.clearRect(chart.width / 4, chart.height / 4, chart.width / 2, chart.height / 2);
          ctx.fillText(`${porcentagem}%`, chart.width / 2, chart.height / 2 - 10);
          ctx.font = "12px sans-serif";
          ctx.fillText(`${consumido}/${meta} kcal`, chart.width / 2, chart.height / 2 + 18);
          ctx.restore();
        }
      }]
    });

    window.graficoCaloriaCircular = graficoCaloriaCircular; 
  } else {
    graficoCaloriaCircular.data.datasets[0].data = dados;
    graficoCaloriaCircular.data.datasets[0].backgroundColor = ["rgb(255, 98, 0)", corBase];
    graficoCaloriaCircular.update();
  }
}