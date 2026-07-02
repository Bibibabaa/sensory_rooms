// ─── RESEARCH RESULTS CHARTS ─────────────────────
// Renders three animated bar charts on the Research page: cortisol, blood
// pressure change, and subjective recovery rating. Charts are styled for
// the dark gradient background of .research-results and animate in once
// the section scrolls into view.

(function () {
  function whenChartReady(callback, attemptsLeft) {
    if (typeof Chart !== "undefined") {
      callback();
      return;
    }
    if (attemptsLeft <= 0) {
      console.warn("Chart.js failed to load — research charts will not render.");
      return;
    }
    setTimeout(() => whenChartReady(callback, attemptsLeft - 1), 200);
  }

  whenChartReady(init, 25);

  function init() {

  const textColor = "rgba(255,255,255,.82)";
  const gridColor = "rgba(255,255,255,.08)";
  const mint = "#A8E6CF";
  const lavender = "#7B6EF6";

  Chart.defaults.color = textColor;
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

  const valueLabelPlugin = {
    id: "valueLabelPlugin",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const formatter = chart.config._labelFormatter || ((v) => v);
      ctx.save();
      ctx.font = "600 13px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      meta.data.forEach((bar, i) => {
        const value = chart.data.datasets[0].data[i];
        ctx.fillText(formatter(value), bar.x, bar.y - 8);
      });
      ctx.restore();
    }
  };

  function baseOptions(extra) {
    return Object.assign({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1100, easing: "easeOutCubic" },
      layout: { padding: { top: 24 } },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        datalabels: undefined
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: textColor, font: { size: 12.5 } }
        },
        y: {
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: "rgba(255,255,255,.55)", font: { size: 11 } }
        }
      }
    }, extra || {});
  }

  function barColors(values) {
    return values.map((_, i) => (i === values.length - 1 ? mint : "rgba(255,255,255,.22)"));
  }

  function makeCharts() {
    const cortisolEl = document.getElementById("chartCortisol");
    if (cortisolEl) {
      const cortisolChart = new Chart(cortisolEl, {
        type: "bar",
        data: {
          labels: ["Обычная перемена", "Сенсорная комната"],
          datasets: [{
            data: [0.9, 1.8],
            backgroundColor: barColors([0.9, 1.8]),
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 72
          }]
        },
        plugins: [valueLabelPlugin],
        options: baseOptions({
          scales: {
            x: { grid: { display: false, drawBorder: false }, ticks: { color: textColor, font: { size: 12.5 } } },
            y: { suggestedMax: 2.2, grid: { color: gridColor, drawBorder: false }, ticks: { color: "rgba(255,255,255,.55)", font: { size: 11 } } }
          }
        })
      });
      cortisolChart.config._labelFormatter = (v) => String(v).replace(".", ",");
    }

    const pressureEl = document.getElementById("chartPressure");
    if (pressureEl) {
      const pressureChart = new Chart(pressureEl, {
        type: "bar",
        data: {
          labels: ["Обычная перемена", "Сенсорная комната"],
          datasets: [{
            data: [-0.4, 11.3],
            backgroundColor: barColors([-0.4, 11.3]),
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 72
          }]
        },
        plugins: [valueLabelPlugin],
        options: baseOptions({
          scales: {
            x: { grid: { display: false, drawBorder: false }, ticks: { color: textColor, font: { size: 12.5 } } },
            y: { suggestedMin: -2, suggestedMax: 12, grid: { color: gridColor, drawBorder: false }, ticks: { color: "rgba(255,255,255,.55)", font: { size: 11 } } }
          }
        })
      });
      pressureChart.config._labelFormatter = (v) => String(v).replace(".", ",");
    }

    const ratingEl = document.getElementById("chartRating");
    if (ratingEl) {
      const ratingChart = new Chart(ratingEl, {
        type: "bar",
        data: {
          labels: ["Обычная перемена", "Сенсорная комната"],
          datasets: [{
            data: [30, 100],
            backgroundColor: barColors([30, 100]),
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 72
          }]
        },
        plugins: [valueLabelPlugin],
        options: baseOptions({
          scales: {
            x: { grid: { display: false, drawBorder: false }, ticks: { color: textColor, font: { size: 12.5 } } },
            y: {
              suggestedMax: 110,
              grid: { color: gridColor, drawBorder: false },
              ticks: { color: "rgba(255,255,255,.55)", font: { size: 11 }, callback: (v) => v + "%" }
            }
          }
        })
      });
      ratingChart.config._labelFormatter = (v) => v + "%";
    }
  }

  const target = document.querySelector(".results-charts-grid");
  if (!target) return;

  let rendered = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !rendered) {
        rendered = true;
        makeCharts();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  observer.observe(target);
  }
})();
