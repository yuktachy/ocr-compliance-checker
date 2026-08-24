/**
 * LegalMetriX - Settings & Configuration Controller
 */

const SettingsController = (function() {
  function init() {
    loadSettings();
    updateRoleSelectionUI();
    loadProfileUI();
  }

  function loadSettings() {
    const s = API.getSettings();
    const confInput = document.getElementById("setting-ocr-conf");
    const confLabel = document.getElementById("conf-val-label");
    const fontInput = document.getElementById("setting-font-px");
    const fontLabel = document.getElementById("font-val-label");
    const unitPriceCheck = document.getElementById("setting-unit-price");
    const autoReportCheck = document.getElementById("setting-auto-report");

    if (confInput && s.ocrMinConfidence) {
      confInput.value = s.ocrMinConfidence;
      if (confLabel) confLabel.textContent = `${s.ocrMinConfidence}%`;
    }

    if (fontInput && s.minFontHeightPx) {
      fontInput.value = s.minFontHeightPx;
      if (fontLabel) fontLabel.textContent = `${s.minFontHeightPx} px`;
    }

    if (unitPriceCheck && s.strictUnitPriceCheck !== undefined) {
      unitPriceCheck.checked = s.strictUnitPriceCheck;
    }

    if (autoReportCheck && s.autoGenerateReportOnViolation !== undefined) {
      autoReportCheck.checked = s.autoGenerateReportOnViolation;
    }
  }

  function loadProfileUI() {
    const u = API.getCurrentUser();
    const nameInput = document.getElementById("prof-name");
    const badgeInput = document.getElementById("prof-badge");
    const zoneInput = document.getElementById("prof-zone");

    if (nameInput) nameInput.value = u.fullName || "Officer";
    if (badgeInput) badgeInput.value = u.badgeId || "LM-102";
    if (zoneInput) zoneInput.value = u.zone || "Zone 1";
  }

  function updateRoleSelectionUI() {
    const u = API.getCurrentUser();
    const currentRole = u.role || 'inspector';

    document.querySelectorAll(".role-select-card").forEach(c => c.classList.remove("selected"));

    const card = document.getElementById(`settings-role-${currentRole}`);
    if (card) card.classList.add("selected");
  }

  function switchRole(roleKey) {
    const user = API.setCurrentUserRole(roleKey);
    updateRoleSelectionUI();
    loadProfileUI();
    App.toast(`Role switched to ${user.roleLabel}.`, "success");
    setTimeout(() => {
      window.location.reload();
    }, 400);
  }

  function saveSettings(e) {
    if (e) e.preventDefault();

    const confVal = parseInt(document.getElementById("setting-ocr-conf")?.value || "75", 10);
    const fontVal = parseInt(document.getElementById("setting-font-px")?.value || "12", 10);
    const unitPrice = document.getElementById("setting-unit-price")?.checked;
    const autoReport = document.getElementById("setting-auto-report")?.checked;

    API.updateSettings({
      ocrMinConfidence: confVal,
      minFontHeightPx: fontVal,
      strictUnitPriceCheck: unitPrice,
      autoGenerateReportOnViolation: autoReport
    });

    App.toast("System screening configuration saved successfully.", "success");
  }

  function resetAllData() {
    if (confirm("Are you sure you want to reset the entire demonstration database to initial sample data? All newly added inspections will be reverted.")) {
      API.resetDatabase();
      App.toast("Demo database reset to original factory state.", "info");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    }
  }

  return {
    init: init,
    switchRole: switchRole,
    saveSettings: saveSettings,
    resetAllData: resetAllData
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  SettingsController.init();
});
