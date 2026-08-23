/**
 * LegalMetriX - Dashboard Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  await initDashboard();
});

async function initDashboard() {
  let stats;
  try { stats = await API.getDashboardStats(); }
  catch (error) { console.error(error); App.toast(`Could not load dashboard: ${error.message}`, "danger"); return; }
  renderDashboardStats(stats);
  renderComplianceDoughnut(stats);
  renderViolationsBarChart(stats);
  renderActivityLineChart();
  renderRecentInspectionsTable(stats.recentInspections);
}

function renderDashboardStats(stats) {
  // Update numbers with comma formatting if dynamic or default
  const totalValEl = document.getElementById("stat-total-val");
  const compliantValEl = document.getElementById("stat-compliant-val");
  const compliantPctEl = document.getElementById("stat-compliant-pct");
  const violationsValEl = document.getElementById("stat-violations-val");
  const violationsPctEl = document.getElementById("stat-violations-pct");
  const verificationValEl = document.getElementById("stat-verification-val");
  const verificationPctEl = document.getElementById("stat-verification-pct");

  if (totalValEl) totalValEl.textContent = stats.totalInspections.toLocaleString();
  if (compliantValEl) compliantValEl.textContent = stats.compliant.count.toLocaleString();
  if (compliantPctEl) compliantPctEl.textContent = `${stats.compliant.percentage}%`;
  if (violationsValEl) violationsValEl.textContent = stats.potentialViolations.count.toLocaleString();
  if (violationsPctEl) violationsPctEl.textContent = `${stats.potentialViolations.percentage}%`;
  if (verificationValEl) verificationValEl.textContent = stats.needsVerification.count.toLocaleString();
  if (verificationPctEl) verificationPctEl.textContent = `${stats.needsVerification.percentage}%`;
}

function renderComplianceDoughnut(stats) {
  const ctx = document.getElementById("complianceDoughnutChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Likely Compliant", "Potential Violations", "Needs Verification"],
      datasets: [{
        data: [stats.compliant.count, stats.potentialViolations.count, stats.needsVerification.count],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
        borderWidth: 2,
        borderColor: "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "Inter", size: 12 },
            boxWidth: 12,
            padding: 14
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const total = stats.totalInspections || 1;
              const pct = ((val / total) * 100).toFixed(1);
              return ` ${context.label}: ${val.toLocaleString()} (${pct}%)`;
            }
          }
        }
      },
      cutout: "68%"
    }
  });
}

function renderViolationsBarChart(stats) {
  const ctx = document.getElementById("violationsBarChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["MRP / Unit Price", "Missing Declarations", "Font / Readability", "Net Quantity", "Other"],
      datasets: [{
        label: "Violations Detected",
        data: [stats.violationTypeCounts.MRP || 0, stats.violationTypeCounts["Missing Declarations"] || 0, stats.violationTypeCounts["Font / Readability"] || 0, stats.violationTypeCounts["Net Quantity"] || 0, stats.violationTypeCounts["Other"] || 0],
        backgroundColor: "#2563eb",
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.raw} infractions flagged`
          }
        }
      },
      scales: {
        x: {
          grid: { color: "#f1f5f9" },
          ticks: { font: { family: "Inter", size: 11 } }
        },
        y: {
          grid: { display: false },
          ticks: { font: { family: "Inter", size: 12, weight: 600 } }
        }
      }
    }
  });
}

function renderActivityLineChart() {
  const ctx = document.getElementById("activityLineChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026"],
      datasets: [
        {
          label: "Total Screenings",
          data: [1850, 2100, 1940, 2450, 2210, 2680],
          borderColor: "#1d4ed8",
          backgroundColor: "rgba(29, 78, 216, 0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: "Flagged Issues",
          data: [290, 340, 310, 390, 320, 380],
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: { font: { family: "Inter", size: 12 }, boxWidth: 12 }
        }
      },
      scales: {
        x: { grid: { color: "#f1f5f9" } },
        y: { grid: { color: "#f1f5f9" } }
      }
    }
  });
}

function renderRecentInspectionsTable(inspections) {
  const tbody = document.getElementById("recent-inspections-tbody");
  if (!tbody) return;

  if (!inspections || inspections.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--slate-500);">No inspections found.</td></tr>`;
    return;
  }

  tbody.innerHTML = inspections.map(item => {
    let badgeClass = "compliant";
    let statusLabel = "Compliant";
    if (item.status === "needs_verification") {
      badgeClass = "needs_verification";
      statusLabel = "Needs Verification";
    } else if (item.status === "potential_violation") {
      badgeClass = "potential_violation";
      statusLabel = "Potential Violation";
    }

    return `
      <tr>
        <td><span class="table-code">${item.id}</span></td>
        <td>
          <div style="font-weight: 600; color: var(--slate-900);">${item.product_name || item.product?.name || 'Packaged Commodity'}</div>
          <div style="font-size: 11.5px; color: var(--slate-500);">${item.brand || item.product?.brand || ''}</div>
        </td>
        <td><span style="font-size: 12px; color: var(--slate-600);">${item.category || item.product?.category || 'General'}</span></td>
        <td><i class="fa-solid fa-location-dot" style="font-size: 11px; color: var(--slate-400); margin-right: 4px;"></i>${item.location || 'Chennai'}</td>
        <td><span style="font-size: 12px;">${item.inspector || 'Inspector'}</span></td>
        <td><span style="font-size: 12px; color: var(--slate-600);">${(item.created_at || item.date || '').slice(0, 10)}</span></td>
        <td>
          <span class="badge-status ${badgeClass}">
            <span class="badge-dot"></span>
            ${statusLabel}
          </span>
        </td>
        <td style="text-align: right;">
          <a href="results.html?id=${item.id}" class="btn btn-secondary btn-sm" title="View Inspection Finding">
            <i class="fa-solid fa-eye"></i>
            <span>View</span>
          </a>
        </td>
      </tr>
    `;
  }).join('');
}
