/**
 * LegalMetriX - Product Repository Controller
 */

const ProductsController = (function() {
  let productsList = [];

  async function init() {
    await loadProducts();

    // Check if url contains ?id=
    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get('id');
    if (prodId) {
      setTimeout(() => openProductModal(prodId), 200);
    }
  }

  async function loadProducts() {
    await applyFilters();
  }

  async function applyFilters() {
    const search = document.getElementById("prod-search-input")?.value || "";
    const category = document.getElementById("prod-cat-filter")?.value || "all";
    const status = document.getElementById("prod-status-filter")?.value || "all";

    productsList = await API.getProducts({
      search: search,
      category: category,
      status: status
    });

    renderTable();
  }

  async function resetFilters() {
    if (document.getElementById("prod-search-input")) document.getElementById("prod-search-input").value = "";
    if (document.getElementById("prod-cat-filter")) document.getElementById("prod-cat-filter").value = "all";
    if (document.getElementById("prod-status-filter")) document.getElementById("prod-status-filter").value = "all";
    await applyFilters();
  }

  function renderTable() {
    const tbody = document.getElementById("products-tbody");
    const countBadge = document.getElementById("prod-count-badge");
    if (!tbody) return;

    if (countBadge) countBadge.textContent = `Showing ${productsList.length} commodities`;

    if (productsList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--slate-500);">No products found matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = productsList.map(p => {
      let badgeClass = "compliant";
      let statusLabel = "Compliant";
      if (p.latestStatus === "needs_verification") {
        badgeClass = "needs_verification";
        statusLabel = "Needs Verification";
      } else if (p.latestStatus === "potential_violation") {
        badgeClass = "potential_violation";
        statusLabel = "Potential Violation";
      }

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--slate-900);">${p.name}</div>
          </td>
          <td><span style="font-weight: 600; color: var(--slate-700);">${p.brand}</span></td>
          <td><span style="font-size: 12px; color: var(--slate-600);">${p.category}</span></td>
          <td><span style="font-size: 12px;">${p.manufacturer}</span></td>
          <td>
            <div style="font-weight: 700;">${p.inspectionsCount || 0} Audits</div>
            <div style="font-size: 11px; color: var(--slate-500);">
              <span style="color: #059669;">${p.compliantCount || 0} Pass</span> • 
              <span style="color: #dc2626;">${p.violationCount || 0} Flags</span>
            </div>
          </td>
          <td>
            <div style="font-size: 12px; font-weight: 600;">${p.lastInspectionDate || '2026-08-23'}</div>
            <a href="results.html?id=${p.lastInspectionId || 'LM-1024'}" style="font-size: 11px; font-family: monospace;">${p.lastInspectionId || 'LM-1024'}</a>
          </td>
          <td>
            <span class="badge-status ${badgeClass}">
              <span class="badge-dot"></span>
              ${statusLabel}
            </span>
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="ProductsController.openProductModal('${p.id}')">
              <i class="fa-solid fa-circle-info"></i>
              <span>Details</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function openProductModal(prodId) {
    const prod = await API.getProduct(prodId);
    if (!prod) return;

    const modal = document.getElementById("product-detail-modal");
    const nameEl = document.getElementById("modal-product-name");
    const bodyEl = document.getElementById("modal-product-body");

    if (nameEl) nameEl.innerHTML = `<i class="fa-solid fa-box-open" style="color: #2563eb; margin-right: 8px;"></i> ${prod.name} (${prod.brand})`;

    const timeline = prod.historyTimeline || [
      { date: prod.lastInspectionDate || "2026-08-23", inspectionId: prod.lastInspectionId || "LM-1024", status: prod.latestStatus, note: "Recent compliance inspection" }
    ];

    bodyEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background-color: var(--slate-50); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--slate-200); font-size: 12.5px;">
        <div><strong>Brand:</strong> ${prod.brand}</div>
        <div><strong>Category:</strong> ${prod.category}</div>
        <div style="grid-column: span 2;"><strong>Manufacturer / Packer:</strong> ${prod.manufacturer}</div>
        <div><strong>Total Screenings:</strong> ${prod.inspectionsCount || 1}</div>
        <div><strong>Latest Status:</strong> <span class="badge-status ${prod.latestStatus}">${prod.latestStatus.replace('_', ' ').toUpperCase()}</span></div>
      </div>

      <h4 style="font-size: 13.5px; font-weight: 700; color: var(--slate-900); margin-bottom: 12px;">
        <i class="fa-solid fa-timeline" style="color: var(--primary-navy-700); margin-right: 6px;"></i>
        Compliance Audit Timeline
      </h4>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        ${timeline.map(t => `
          <div style="border-left: 3px solid ${t.status === 'compliant' ? '#10b981' : (t.status === 'potential_violation' ? '#ef4444' : '#f59e0b')}; padding-left: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; font-size: 13px; color: var(--slate-900);">${t.date}</span>
              <a href="results.html?id=${t.inspectionId}" class="table-code" style="font-size: 12px;">${t.inspectionId}</a>
            </div>
            <div style="font-size: 12px; color: var(--slate-600); margin-top: 2px;">${t.note}</div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <a href="inspection.html" class="btn btn-primary btn-sm">
          <i class="fa-solid fa-plus"></i> New Inspection For This Product
        </a>
        <button type="button" class="btn btn-secondary btn-sm" onclick="ProductsController.closeModal()">Close</button>
      </div>
    `;

    modal.classList.add("active");
  }

  function closeModal() {
    const modal = document.getElementById("product-detail-modal");
    if (modal) modal.classList.remove("active");
  }

  return {
    init: init,
    applyFilters: applyFilters,
    resetFilters: resetFilters,
    openProductModal: openProductModal,
    closeModal: closeModal
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  try { await ProductsController.init(); } catch (error) { App.toast(`Could not load products: ${error.message}`, "danger"); }
});
