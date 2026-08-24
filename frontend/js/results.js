/**
 * LegalMetriX - Screening Results & Interactive Evidence Viewer
 */

const ResultsController = (function() {
  let currentInspection = null;

  async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const inspectionId = urlParams.get('id') || 'LM-1024';

    try { currentInspection = await API.getInspection(inspectionId); }
    catch (_) { const all = await API.getInspections(); currentInspection = all.length > 0 ? all[0] : null; }

    if (!currentInspection) {
      App.toast("Inspection record not found.", "danger");
      return;
    }

    renderHeader();
    renderAssessmentBanner();
    renderPackageViewer();
    renderDeclarationsTable();
    renderComplianceChecklist();
    renderEvidenceAndIssues();
    renderReadabilityTable();
    renderRemarks();
  }

  function renderHeader() {
    const titleEl = document.getElementById("result-page-title");
    const subtitleEl = document.getElementById("result-page-subtitle");
    const badgeEl = document.getElementById("header-status-badge");

    if (titleEl) titleEl.textContent = `Screening Results: ${currentInspection.id}`;
    if (subtitleEl) {
      subtitleEl.textContent = `${currentInspection.product?.name || 'Product'} • ${currentInspection.product?.manufacturer || 'Manufacturer'} • ${currentInspection.product?.category || 'Category'} • Inspected at ${currentInspection.location || 'Location'}`;
    }

    if (badgeEl) {
      badgeEl.className = `badge-status ${currentInspection.status}`;
      let label = "Likely Compliant";
      if (currentInspection.status === "needs_verification") label = "Needs Verification";
      else if (currentInspection.status === "potential_violation") label = "Potential Non-Compliance";
      badgeEl.innerHTML = `<span class="badge-dot"></span> ${label}`;
    }
  }

  function renderAssessmentBanner() {
    const bannerEl = document.getElementById("assessment-banner-box");
    const statusTextEl = document.getElementById("assessment-status-text");
    const statusDescEl = document.getElementById("assessment-status-desc");
    const cntTotalEl = document.getElementById("cnt-total");
    const cntDetectedEl = document.getElementById("cnt-detected");
    const cntUnclearEl = document.getElementById("cnt-unclear");

    if (!bannerEl) return;

    bannerEl.className = `assessment-banner ${currentInspection.status}`;

    const decls = currentInspection.declarations || {};
    const totalKeys = Object.keys(decls).length || 6;
    let detectedCount = 0;
    let unclearCount = 0;

    Object.values(decls).forEach(d => {
      if (d.status === "detected") detectedCount++;
      else unclearCount++;
    });

    if (currentInspection.status === "compliant") {
      statusTextEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Screening Assessment: Likely Compliant</span>`;
      statusDescEl.textContent = "All mandatory Legal Metrology declarations detected with high confidence.";
    } else if (currentInspection.status === "potential_violation") {
      statusTextEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>Screening Assessment: Potential Non-Compliance</span>`;
      statusDescEl.textContent = "Potential non-compliance detected. Review flagged items below for statutory notice action.";
    } else {
      statusTextEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>Screening Assessment: Needs Verification</span>`;
      statusDescEl.textContent = "Automated scanner identified low optical confidence on required declarations. Manual verification required.";
    }

    if (cntTotalEl) cntTotalEl.textContent = totalKeys;
    if (cntDetectedEl) cntDetectedEl.textContent = detectedCount;
    if (cntUnclearEl) cntUnclearEl.textContent = unclearCount;
  }

  function renderPackageViewer() {
    const imgEl = document.getElementById("package-image-el");
    const bboxLayer = document.getElementById("bbox-layer-container");
    if (!imgEl || !bboxLayer) return;

    const backImage = currentInspection.images?.back || API.sampleImages.backPanelBiscuits;
    imgEl.src = backImage;

    bboxLayer.innerHTML = "";

    const decls = currentInspection.declarations || {};
    Object.keys(decls).forEach(key => {
      const decl = decls[key];
      if (decl.bbox) {
        const box = document.createElement("div");
        box.id = `bbox-${key}`;
        box.className = `bbox-box ${decl.status === 'needs_verification' || decl.status === 'potential_issue' ? 'flagged' : ''}`;
        box.style.left = `${decl.bbox.x}%`;
        box.style.top = `${decl.bbox.y}%`;
        box.style.width = `${decl.bbox.w}%`;
        box.style.height = `${decl.bbox.h}%`;

        box.innerHTML = `<span class="bbox-tag">${decl.label || key.toUpperCase()}</span>`;

        box.addEventListener("click", () => {
          highlightDeclarationRow(key);
          App.toast(`Selected: ${decl.label || key} (${decl.value || 'N/A'})`, "info");
        });

        bboxLayer.appendChild(box);
      }
    });
  }

  function highlightDeclarationRow(fieldKey) {
    // Remove previous highlights
    document.querySelectorAll("#declarations-tbody tr").forEach(tr => {
      tr.style.backgroundColor = "";
    });

    const targetRow = document.getElementById(`decl-row-${fieldKey}`);
    if (targetRow) {
      targetRow.style.backgroundColor = "#eff6ff";
      targetRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Also highlight bbox
    document.querySelectorAll(".bbox-box").forEach(b => b.classList.remove("active"));
    const targetBBox = document.getElementById(`bbox-${fieldKey}`);
    if (targetBBox) {
      targetBBox.classList.add("active");
    }
  }

  function pulseBoundingBox(fieldKey) {
    const targetBBox = document.getElementById(`bbox-${fieldKey}`);
    const viewer = document.getElementById("package-viewer-wrapper");

    if (viewer) {
      viewer.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (targetBBox) {
      document.querySelectorAll(".bbox-box").forEach(b => b.classList.remove("pulsing"));
      targetBBox.classList.add("pulsing");
      setTimeout(() => {
        targetBBox.classList.remove("pulsing");
      }, 3500);
    } else {
      App.toast(`Bounding box for ${fieldKey} is highlighted on PDP.`, "info");
    }
  }

  function renderDeclarationsTable() {
    const tbody = document.getElementById("declarations-tbody");
    if (!tbody) return;

    const decls = currentInspection.declarations || {};
    tbody.innerHTML = Object.keys(decls).map(key => {
      const decl = decls[key];
      const confPct = Math.round((decl.confidence || 0.9) * 100);

      let confBadgeClass = "confidence-high";
      if (confPct < 70) confBadgeClass = "confidence-low";
      else if (confPct < 85) confBadgeClass = "confidence-mid";

      let statusBadge = `<span class="badge-status compliant"><span class="badge-dot"></span> Detected</span>`;
      if (decl.status === "needs_verification") {
        statusBadge = `<span class="badge-status needs_verification"><span class="badge-dot"></span> Needs Verification</span>`;
      } else if (decl.status === "potential_issue" || decl.status === "missing") {
        statusBadge = `<span class="badge-status potential_violation"><span class="badge-dot"></span> Potential Issue</span>`;
      }

      return `
        <tr id="decl-row-${key}" onclick="ResultsController.pulseBoundingBox('${key}')" style="cursor: pointer;">
          <td>
            <div style="font-weight: 700; color: var(--slate-900);">${decl.label || key}</div>
            <div style="font-size: 11px; color: var(--slate-500);">${getRuleRef(key)}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--slate-800);">${decl.value || '<em style="color: #ef4444;">Not detected</em>'}</div>
          </td>
          <td>
            <span class="confidence-pill ${confBadgeClass}">${confPct}%</span>
          </td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  function getRuleRef(key) {
    const refs = {
      mrp: "Rule 6(1)(e) - MRP & Unit Sale Price",
      netQuantity: "Rule 6(1)(d) - Standard Net Weight/Measure",
      manufacturer: "Rule 6(1)(a) - Registered Name & Address",
      manufacturingDate: "Rule 6(1)(d) - Month & Year of Packing",
      consumerCare: "Rule 6(1)(f) - Grievance Cell / Contact",
      countryOfOrigin: "Rule 6(1)(j) - Country of Origin"
    };
    return refs[key] || "Rule 6 Mandatory Declaration";
  }

  function renderComplianceChecklist() {
    const container = document.getElementById("compliance-checklist-container");
    if (!container) return;

    const decls = currentInspection.declarations || {};
    const items = [
      { key: "mrp", label: "MRP & Unit Sale Price declaration detected" },
      { key: "netQuantity", label: "Net quantity / standard units detected" },
      { key: "manufacturer", label: "Manufacturer / Packer address details detected" },
      { key: "manufacturingDate", label: "Manufacturing / packaging date detected" },
      { key: "consumerCare", label: "Consumer care telephone & email verified" },
      { key: "countryOfOrigin", label: "Country of Origin declaration verified" }
    ];

    container.innerHTML = items.map(item => {
      const field = decls[item.key];
      const isDetected = field && field.status === "detected";
      const isWarning = field && field.status === "needs_verification";

      let icon = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>`;
      let textStyle = `color: var(--slate-800);`;
      let note = "";

      if (isWarning) {
        icon = `<i class="fa-solid fa-triangle-exclamation" style="color: #d97706;"></i>`;
        textStyle = `color: #92400e; font-weight: 600;`;
        note = ` (Unclear print)`;
      } else if (!isDetected) {
        icon = `<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i>`;
        textStyle = `color: #991b1b; font-weight: 600;`;
        note = ` (Missing)`;
      }

      return `
        <div style="display: flex; align-items: center; gap: 8px; ${textStyle}">
          ${icon}
          <span>${item.label}${note}</span>
        </div>
      `;
    }).join('');
  }

  function renderEvidenceAndIssues() {
    const container = document.getElementById("issues-list-container");
    if (!container) return;

    const violations = currentInspection.violations || [];
    if (violations.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; background-color: var(--status-compliant-bg); border-radius: var(--radius-sm); border: 1px solid var(--status-compliant-border);">
          <i class="fa-solid fa-circle-check" style="font-size: 28px; color: var(--status-compliant); margin-bottom: 8px;"></i>
          <div style="font-weight: 700; color: var(--status-compliant-text); font-size: 14px;">No Non-Compliance Flags Detected</div>
          <div style="font-size: 12px; color: var(--slate-600); margin-top: 4px;">All 6 statutory Legal Metrology declarations comply with current rules.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = violations.map((v, index) => {
      const isViolation = v.severity === "Potential Violation";
      const isConfirmed = v.status === "confirmed";
      const isDismissed = v.status === "dismissed";

      return `
        <div class="issue-card ${isViolation ? 'violation' : ''}" id="issue-card-${v.id}">
          <div class="issue-header">
            <div class="issue-title">
              <i class="fa-solid ${isViolation ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'}" style="color: ${isViolation ? '#ef4444' : '#d97706'}; margin-right: 6px;"></i>
              Issue #${index + 1}: ${v.category}
            </div>
            <div>
              <span class="badge-status ${isViolation ? 'potential_violation' : 'needs_verification'}">
                ${v.severity}
              </span>
            </div>
          </div>
          <div class="issue-desc">${v.description}</div>
          <div class="issue-actions">
            <button type="button" class="btn btn-secondary btn-sm" onclick="ResultsController.pulseBoundingBox('${v.field || 'consumerCare'}')">
              <i class="fa-solid fa-crosshairs"></i>
              <span>View on Image</span>
            </button>
            <button type="button" class="btn ${isConfirmed ? 'btn-danger' : 'btn-secondary'} btn-sm" onclick="ResultsController.confirmIssue('${v.id}')">
              <i class="fa-solid fa-check-double"></i>
              <span>${isConfirmed ? '✓ Confirmed by Officer' : 'Confirm Issue'}</span>
            </button>
            <button type="button" class="btn ${isDismissed ? 'btn-success' : 'btn-secondary'} btn-sm" onclick="ResultsController.dismissIssue('${v.id}')">
              <i class="fa-solid fa-ban"></i>
              <span>${isDismissed ? '✓ Flag Dismissed' : 'Dismiss Flag'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function confirmIssue(issueId) {
    const violations = currentInspection.violations || [];
    const v = violations.find(item => item.id === issueId);
    if (v) {
      v.status = "confirmed";
      currentInspection.status = "potential_violation";
      currentInspection.officialDecision = "Non-Compliance Confirmed by Officer";
      await API.updateInspection(currentInspection.id, currentInspection);
      renderHeader();
      renderAssessmentBanner();
      renderEvidenceAndIssues();
      App.toast(`Issue marked as Confirmed Violation by Officer.`, "warning");
    }
  }

  async function dismissIssue(issueId) {
    const violations = currentInspection.violations || [];
    const v = violations.find(item => item.id === issueId);
    if (v) {
      v.status = "dismissed";
      // Check if all dismissed
      const remainingActive = violations.filter(item => item.status !== "dismissed");
      if (remainingActive.length === 0) {
        currentInspection.status = "compliant";
        currentInspection.officialDecision = "Manually Verified & Approved";
      }
      await API.updateInspection(currentInspection.id, currentInspection);
      renderHeader();
      renderAssessmentBanner();
      renderEvidenceAndIssues();
      App.toast(`Flag dismissed following manual officer verification.`, "success");
    }
  }

  function renderReadabilityTable() {
    const tbody = document.getElementById("readability-tbody");
    if (!tbody) return;

    const readData = currentInspection.readability || {
      mrp: { confidence: 98, heightPx: 22, contrast: "High", status: "Good" },
      netQuantity: { confidence: 96, heightPx: 20, contrast: "High", status: "Good" },
      manufacturer: { confidence: 94, heightPx: 16, contrast: "Good", status: "Good" },
      consumerCare: { confidence: 42, heightPx: 10, contrast: "Low", status: "Low OCR Confidence" }
    };

    const labels = {
      mrp: "MRP & Unit Price",
      netQuantity: "Net Quantity Declaration",
      manufacturer: "Manufacturer / Packer Details",
      consumerCare: "Consumer Care Contact Cell"
    };

    tbody.innerHTML = Object.keys(readData).map(key => {
      const row = readData[key];
      const isGood = row.status === "Good";

      return `
        <tr>
          <td style="font-weight: 600; color: var(--slate-900);">${labels[key] || key}</td>
          <td><span class="confidence-pill ${row.confidence >= 80 ? 'confidence-high' : 'confidence-low'}">${row.confidence}%</span></td>
          <td><span class="table-code">${row.heightPx} px</span></td>
          <td><span style="color: var(--slate-700);">${row.contrast}</span></td>
          <td>
            <span class="badge-status ${isGood ? 'compliant' : 'needs_verification'}">
              <span class="badge-dot"></span>
              ${row.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderRemarks() {
    const textarea = document.getElementById("inspector-remarks-input");
    if (textarea && currentInspection.remarks) {
      textarea.value = currentInspection.remarks;
    }
  }

  async function updateRemarks() {
    const textarea = document.getElementById("inspector-remarks-input");
    if (textarea) {
      currentInspection.remarks = textarea.value;
      await API.updateInspection(currentInspection.id, currentInspection);
      App.toast("Inspector verification remarks saved.", "success");
    }
  }

  async function saveInspection() {
    await updateRemarks();
    await API.updateInspection(currentInspection.id, currentInspection);
    App.toast(`Inspection ${currentInspection.id} saved to the backend.`, "success");
  }

  async function generateOfficialReport() {
    await saveInspection();
    const report = await API.generateReport(currentInspection.id);
    App.toast("Official Legal Metrology compliance report generated.", "success");
    setTimeout(() => {
      window.location.href = `reports.html?id=${report.id}`;
    }, 400);
  }

  return {
    init: init,
    pulseBoundingBox: pulseBoundingBox,
    confirmIssue: confirmIssue,
    dismissIssue: dismissIssue,
    updateRemarks: updateRemarks,
    saveInspection: saveInspection,
    generateOfficialReport: generateOfficialReport
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  try { await ResultsController.init(); } catch (error) { App.toast(`Could not load inspection: ${error.message}`, "danger"); }
});
