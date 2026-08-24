/**
 * LegalMetriX - Compliance Analytics Controller
 */

const AnalyticsController = (function() {
  let chartInstances = {};

  function init() {
    buildCharts();
  }

  function buildCharts() {
    renderViolationsTypeChart();
    renderTrendChart();
    renderLocationChart();
    renderCategoryChart();
  }

  function renderViolationsTypeChart() {
    const ctx = document.getElementById("analyticsViolationsTypeChart");
    if (!ctx) return;

    if (chartInstances.violationsType) chartInstances.violationsType.destroy();

    chartInstances.violationsType = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["MRP / Unit Price", "Missing Declaration", "Consumer Care", "Font Size / Readability", "Net Weight", "Mfg Date"],
        datasets: [{
          label: "Infractions",
          data: [421, 387, 342, 294, 210, 185],
          backgroundColor: ["#ef4444", "#f97316", "#f59e0b", "#3b82f6", "#8b5cf6", "#64748b"],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "#f1f5f9" } }
        }
      }
    });
  }

  function renderTrendChart() {
    const ctx = document.getElementById("analyticsTrendChart");
    if (!ctx) return;

    if (chartInstances.trend) chartInstances.trend.destroy();

    chartInstances.trend = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026"],
        datasets: [
          {
            label: "Compliant Inspections",
            data: [1560, 1760, 1630, 2060, 1890, 2300],
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            fill: true,
            tension: 0.35
          },
          {
            label: "Non-Compliant Flags",
            data: [290, 340, 310, 390, 320, 380],
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.05)",
            fill: true,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", align: "end", labels: { font: { family: "Inter", size: 11 } } }
        },
        scales: {
          x: { grid: { color: "#f1f5f9" } },
          y: { grid: { color: "#f1f5f9" } }
        }
      }
    });
  }

  function renderLocationChart() {
    const ctx = document.getElementById("analyticsLocationChart");
    if (!ctx) return;

    if (chartInstances.location) chartInstances.location.destroy();

    chartInstances.location = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Chennai", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Kolkata"],
        datasets: [{
          label: "Flagged Inspections",
          data: [480, 410, 385, 310, 290, 220],
          backgroundColor: "#6366f1",
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: "#f1f5f9" } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  function renderCategoryChart() {
    const ctx = document.getElementById("analyticsCategoryChart");
    if (!ctx) return;

    if (chartInstances.category) chartInstances.category.destroy();

    chartInstances.category = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Packaged Food", "Household Goods", "Cosmetics", "Personal Care", "Agricultural Products"],
        datasets: [{
          data: [540, 320, 280, 240, 190],
          backgroundColor: ["#2563eb", "#06b6d4", "#ec4899", "#f59e0b", "#10b981"],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { family: "Inter", size: 11 }, boxWidth: 12 } }
        },
        cutout: "60%"
      }
    });
  }

  function updateCharts() {
    // Dynamic refresh feedback
    App.toast("Analytics dashboard updated for selected filters.", "info");
    buildCharts();
  }

  function resetFilters() {
    if (document.getElementById("analytics-timeframe")) document.getElementById("analytics-timeframe").value = "6m";
    if (document.getElementById("analytics-location")) document.getElementById("analytics-location").value = "all";
    if (document.getElementById("analytics-category")) document.getElementById("analytics-category").value = "all";
    if (document.getElementById("analytics-status")) document.getElementById("analytics-status").value = "all";
    updateCharts();
  }

  return {
    init: init,
    updateCharts: updateCharts,
    resetFilters: resetFilters
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  AnalyticsController.init();
});
