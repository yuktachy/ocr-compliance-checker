/**
 * LegalMetriX - Inspection History Table Controller
 */

const HistoryController = (function() {
  let allInspections = [];
  let filteredInspections = [];
  let currentPage = 1;
  const pageSize = 10;
  let currentSort = { column: 'date', ascending: false };

  function init() {
    loadData();
  }

  function loadData() {
    allInspections = API.getInspections();
    applyFilters();
  }

  function applyFilters() {
    const search = document.getElementById("filter-search")?.value || "";
    const location = document.getElementById("filter-location")?.value || "all";
    const category = document.getElementById("filter-category")?.value || "all";
    const status = document.getElementById("filter-status")?.value || "all";

    filteredInspections = API.getInspections({
      search: search,
      location: location,
      category: category,
      status: status
    });

    // Apply sorting
    sortData();

    currentPage = 1;
    renderTable();
  }

  function resetFilters() {
    if (document.getElementById("filter-search")) document.getElementById("filter-search").value = "";
    if (document.getElementById("filter-location")) document.getElementById("filter-location").value = "all";
    if (document.getElementById("filter-category")) document.getElementById("filter-category").value = "all";
    if (document.getElementById("filter-status")) document.getElementById("filter-status").value = "all";

    applyFilters();
    App.toast("Filters reset.", "info");
  }

  function sortBy(column) {
    if (currentSort.column === column) {
      currentSort.ascending = !currentSort.ascending;
    } else {
      currentSort.column = column;
      currentSort.ascending = true;
    }
    sortData();
    renderTable();
  }

  function sortData() {
    filteredInspections.sort((a, b) => {
      let valA = a[currentSort.column];
      let valB = b[currentSort.column];

      if (currentSort.column === 'product') {
        valA = a.product?.name || '';
        valB = b.product?.name || '';
      }

      if (valA < valB) return currentSort.ascending ? -1 : 1;
      if (valA > valB) return currentSort.ascending ? 1 : -1;
      return 0;
    });
  }

  function renderTable() {
    const tbody = document.getElementById("history-tbody");
    const countBadge = document.getElementById("history-count-badge");
    const paginationInfo = document.getElementById("pagination-info");
    const paginationControls = document.getElementById("pagination-controls");

    if (!tbody) return;

    const total = filteredInspections.length;
    if (countBadge) countBadge.textContent = `Showing ${total} records`;

    if (total === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 32px; color: var(--slate-500);">No matching inspections found.</td></tr>`;
      if (paginationInfo) paginationInfo.textContent = "Showing 0 of 0 entries";
      if (paginationControls) paginationControls.innerHTML = "";
      return;
    }

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, total);
    const pageItems = filteredInspections.slice(startIdx, endIdx);

    tbody.innerHTML = pageItems.map(item => {
      let badgeClass = "compliant";
      let statusLabel = "Compliant";
      if (item.status === "needs_verification") {
        badgeClass = "needs_verification";
        statusLabel = "Needs Verification";
      } else if (item.status === "potential_violation") {
        badgeClass = "potential_violation";
        statusLabel = "Potential Violation";
      }

      const flagsCount = item.violations?.length || 0;

      return `
        <tr>
          <td><span class="table-code">${item.id}</span></td>
          <td>
            <div style="font-weight: 700; color: var(--slate-900);">${item.product?.name || 'Packaged Commodity'}</div>
            <div style="font-size: 11.5px; color: var(--slate-500);">${item.product?.brand || ''} • ${item.product?.manufacturer || ''}</div>
          </td>
          <td><span style="font-size: 12px; color: var(--slate-600);">${item.product?.category || 'General'}</span></td>
          <td>
            <div style="font-weight: 600; color: var(--slate-800);"><i class="fa-solid fa-location-dot" style="font-size: 11px; color: var(--slate-400); margin-right: 4px;"></i>${item.location || 'Location'}</div>
            <div style="font-size: 11px; color: var(--slate-500);">${item.retailer || ''}</div>
          </td>
          <td><span style="font-size: 12px; color: var(--slate-600);">${item.date}</span></td>
          <td>
            <span class="badge-status ${badgeClass}">
              <span class="badge-dot"></span>
              ${statusLabel}
            </span>
          </td>
          <td>
            ${flagsCount > 0 ? `<span class="badge-status ${item.status === 'potential_violation' ? 'potential_violation' : 'needs_verification'}" style="font-size: 11px;">${flagsCount} Flag${flagsCount > 1 ? 's' : ''}</span>` : '<span style="color: var(--status-compliant); font-weight: 600; font-size: 12px;">✓ None</span>'}
          </td>
          <td><span style="font-size: 12px;">${item.inspector || 'Inspector'}</span></td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 6px;">
              <a href="results.html?id=${item.id}" class="btn btn-secondary btn-sm" title="View Screening Result">
                <i class="fa-solid fa-eye"></i>
              </a>
              <button type="button" class="btn btn-secondary btn-sm" title="Generate / View Report" onclick="HistoryController.goToReport('${item.id}')">
                <i class="fa-solid fa-file-lines"></i>
              </button>
              <button type="button" class="btn btn-danger btn-sm" title="Delete Record" onclick="HistoryController.deleteRecord('${item.id}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Update Pagination
    if (paginationInfo) {
      paginationInfo.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${total} entries`;
    }

    if (paginationControls) {
      const totalPages = Math.ceil(total / pageSize);
      let buttonsHtml = `
        <button class="btn btn-secondary btn-sm" onclick="HistoryController.changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
          <i class="fa-solid fa-chevron-left"></i>
        </button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        buttonsHtml += `
          <button class="btn ${p === currentPage ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="HistoryController.changePage(${p})">
            ${p}
          </button>
        `;
      }

      buttonsHtml += `
        <button class="btn btn-secondary btn-sm" onclick="HistoryController.changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      `;

      paginationControls.innerHTML = buttonsHtml;
    }
  }

  function changePage(page) {
    const totalPages = Math.ceil(filteredInspections.length / pageSize);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
    window.scrollTo({ top: 200, behavior: 'smooth' });
  }

  function goToReport(inspectionId) {
    const report = API.generateReport(inspectionId);
    window.location.href = `reports.html?id=${report.id}`;
  }

  function deleteRecord(id) {
    if (confirm(`Are you sure you want to delete inspection record ${id}? This action cannot be undone.`)) {
      API.deleteInspection(id);
      loadData();
      App.toast(`Inspection ${id} deleted.`, "info");
    }
  }

  function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,InspectionID,Product,Brand,Category,Location,Retailer,Date,Status,Inspector\n";
    filteredInspections.forEach(i => {
      const row = [
        i.id,
        `"${i.product?.name || ''}"`,
        `"${i.product?.brand || ''}"`,
        `"${i.product?.category || ''}"`,
        `"${i.location || ''}"`,
        `"${i.retailer || ''}"`,
        i.date,
        i.status,
        `"${i.inspector || ''}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LegalMetriX_Inspections_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    App.toast("CSV file downloaded.", "success");
  }

  return {
    init: init,
    applyFilters: applyFilters,
    resetFilters: resetFilters,
    sortBy: sortBy,
    changePage: changePage,
    goToReport: goToReport,
    deleteRecord: deleteRecord,
    exportCSV: exportCSV
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  HistoryController.init();
});
