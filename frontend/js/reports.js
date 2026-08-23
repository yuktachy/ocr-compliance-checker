/**
 * LegalMetriX - Compliance Reports Controller
 */

const ReportsController = (function() {
  let reportsList = [];
  let currentInspection = null;

  async function init() {
    await loadReports();

    // Check url params for ?id=
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');
    if (reportId) {
      setTimeout(() => openReport(reportId), 150);
    }
  }

  async function loadReports() {
    reportsList = await API.getReports();
    renderTable();
  }

  function renderTable() {
    const tbody = document.getElementById("reports-tbody");
    const label = document.getElementById("reports-count-label");
    if (!tbody) return;

    if (label) label.textContent = `Showing ${reportsList.length} reports`;

    if (reportsList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--slate-500);">No reports generated yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = reportsList.map(r => {
      let badgeClass = "compliant";
      if (r.status.toLowerCase().includes("verification")) badgeClass = "needs_verification";
      else if (r.status.toLowerCase().includes("violation")) badgeClass = "potential_violation";

      return `
        <tr>
          <td><span class="table-code">${r.id}</span></td>
          <td><a href="results.html?id=${r.inspectionId}" class="table-code" style="color: var(--primary-blue);">${r.inspectionId}</a></td>
          <td><div style="font-weight: 700; color: var(--slate-900);">${r.productName}</div></td>
          <td><span style="font-size: 12px; color: var(--slate-600);">${r.category}</span></td>
          <td><span style="font-size: 12px;">${r.generatedDate}</span></td>
          <td>
            <span class="badge-status ${badgeClass}">
              <span class="badge-dot"></span>
              ${r.status}
            </span>
          </td>
          <td><span style="font-size: 12px;">${r.generatedBy}</span></td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 6px;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="ReportsController.openReport('${r.id}')" title="Preview Official Report">
                <i class="fa-solid fa-eye"></i>
                <span>Preview</span>
              </button>
              <button type="button" class="btn btn-primary btn-sm" onclick="ReportsController.printReport('${r.id}')" title="Print to PDF">
                <i class="fa-solid fa-print"></i>
              </button>
              <button type="button" class="btn btn-danger btn-sm" onclick="ReportsController.deleteReport('${r.id}')" title="Delete Report">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function openReport(reportId) {
    let report = reportsList.find(r => r.id === reportId || r.inspectionId === reportId);
    if (!report && reportsList.length > 0) {
      report = reportsList[0];
    }
    if (!report) return;

    try { currentInspection = await API.getInspection(report.inspectionId); }
    catch (_) { currentInspection = (await API.getInspections())[0]; }
    if (!currentInspection) return;

    // Populate Report Document Fields
    document.getElementById("rep-insp-id").textContent = currentInspection.id;
    document.getElementById("rep-date").textContent = currentInspection.date;
    document.getElementById("rep-inspector").textContent = currentInspection.inspector;
    document.getElementById("rep-location").textContent = `${currentInspection.location}, India`;
    document.getElementById("rep-retailer").textContent = currentInspection.retailer;

    const statusBadgeEl = document.getElementById("rep-status-text");
    if (statusBadgeEl) {
      let bClass = "compliant";
      let bText = "Compliant";
      if (currentInspection.status === "needs_verification") {
        bClass = "needs_verification";
        bText = "Needs Verification";
      } else if (currentInspection.status === "potential_violation") {
        bClass = "potential_violation";
        bText = "Potential Violation";
      }
      statusBadgeEl.innerHTML = `<span class="badge-status ${bClass}"><span class="badge-dot"></span> ${bText}</span>`;
    }

    document.getElementById("rep-prod-name").textContent = currentInspection.product?.name || 'N/A';
    document.getElementById("rep-prod-brand").textContent = currentInspection.product?.brand || 'N/A';
    document.getElementById("rep-prod-category").textContent = currentInspection.product?.category || 'N/A';
    document.getElementById("rep-prod-manufacturer").textContent = currentInspection.product?.manufacturer || 'N/A';

    // Declaration Audit Table
    const declTbody = document.getElementById("rep-declarations-tbody");
    if (declTbody) {
      const decls = currentInspection.declarations || {};
      declTbody.innerHTML = Object.keys(decls).map(key => {
        const d = decls[key];
        const conf = Math.round((d.confidence || 0.9) * 100);
        const isOk = d.status === "detected";
        return `
          <tr>
            <td style="font-weight: 600;">${d.label || key}</td>
            <td>${d.value || '<em style="color: #ef4444;">Not detected on PDP</em>'}</td>
            <td><span class="confidence-pill ${conf >= 80 ? 'confidence-high' : 'confidence-low'}">${conf}%</span></td>
            <td>
              <span class="badge-status ${isOk ? 'compliant' : 'needs_verification'}" style="font-size: 11px;">
                ${isOk ? '✓ Detected' : '⚠ Unclear / Flagged'}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Issues
    const issuesContainer = document.getElementById("rep-issues-container");
    if (issuesContainer) {
      const violations = currentInspection.violations || [];
      if (violations.length === 0) {
        issuesContainer.innerHTML = `<div style="font-size: 12.5px; color: var(--status-compliant-text); font-weight: 600;">✓ No non-compliance infractions detected during preliminary optical screening.</div>`;
      } else {
        issuesContainer.innerHTML = violations.map((v, i) => `
          <div style="font-size: 12.5px; margin-bottom: 6px; color: ${v.severity === 'Potential Violation' ? '#991b1b' : '#92400e'};">
            <strong>${i + 1}. [${v.category}]:</strong> ${v.description} (Severity: ${v.severity})
          </div>
        `).join('');
      }
    }

    // Evidence Image
    const imgEl = document.getElementById("rep-evidence-img");
    if (imgEl) {
      imgEl.src = currentInspection.images?.back || API.sampleImages.backPanelBiscuits;
    }

    // Remarks & Decision
    const remarksEl = document.getElementById("rep-remarks-text");
    if (remarksEl) remarksEl.textContent = currentInspection.remarks || "No specific inspector remarks logged.";

    const decisionEl = document.getElementById("rep-decision-text");
    if (decisionEl) decisionEl.textContent = currentInspection.officialDecision || "Verified by Authorized Officer";

    const sigEl = document.getElementById("rep-signature-name");
    if (sigEl) sigEl.textContent = currentInspection.inspector || "R. Sundaram";

    // Switch views
    document.getElementById("reports-list-section").style.display = "none";
    document.getElementById("single-report-view-section").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showReportsList() {
    document.getElementById("single-report-view-section").style.display = "none";
    document.getElementById("reports-list-section").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function printReport(reportId) {
    await openReport(reportId);
    setTimeout(() => {
      window.print();
    }, 400);
  }

  async function deleteReport(reportId) {
    if (confirm(`Are you sure you want to delete report ${reportId}?`)) {
      await API.deleteReport(reportId);
      await loadReports();
      App.toast(`Report ${reportId} deleted.`, "info");
    }
  }

  function downloadAuditJson() {
    if (!currentInspection) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentInspection, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `Compliance_Audit_${currentInspection.id}.json`);
    dlAnchorElem.click();
    dlAnchorElem.remove();
    App.toast("Inspection audit JSON downloaded.", "success");
  }

  return {
    init: init,
    openReport: openReport,
    showReportsList: showReportsList,
    printReport: printReport,
    deleteReport: deleteReport,
    downloadAuditJson: downloadAuditJson
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  try { await ReportsController.init(); } catch (error) { App.toast(`Could not load reports: ${error.message}`, "danger"); }
});
