/**
 * LegalMetriX - New Inspection Workflow & Mock AI Analysis Engine
 */

const InspectionController = (function() {
  let inspectionState = {
    id: "LM-1025",
    date: new Date().toISOString().split('T')[0],
    location: "Chennai",
    retailer: "ABC Supermarket, T. Nagar",
    inspector: "Inspector 102 (R. Sundaram)",
    productName: "ABC Crunch Whole Wheat Biscuits",
    brand: "ABC",
    category: "Packaged Food",
    manufacturer: "ABC Foods Private Limited",
    images: {
      front: null,
      back: null,
      side: null,
      ecommerce: null
    }
  };

  async function init() {
    // Generate next Inspection ID
    const inspections = await API.getInspections();
    const maxNum = inspections.reduce((max, i) => {
      const num = parseInt(i.id.replace('LM-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 1024);

    const nextId = `LM-${maxNum + 1}`;
    inspectionState.id = nextId;

    const idInput = document.getElementById("insp-id");
    if (idInput) idInput.value = nextId;

    const dateInput = document.getElementById("insp-date");
    if (dateInput) dateInput.value = inspectionState.date;

    const inspectorInput = document.getElementById("insp-inspector");
    const user = API.getCurrentUser();
    if (inspectorInput && user.fullName) {
      inspectorInput.value = `${user.fullName} (${user.badgeId || 'Officer'})`;
      inspectionState.inspector = inspectorInput.value;
    }
  }

  function prefillSampleData() {
    document.getElementById("insp-prod-name").value = "ABC Crunch Whole Wheat Biscuits";
    document.getElementById("insp-brand").value = "ABC";
    document.getElementById("insp-category").value = "Packaged Food";
    document.getElementById("insp-manufacturer").value = "ABC Foods Private Limited";
    document.getElementById("insp-location").value = "Chennai";
    document.getElementById("insp-retailer").value = "ABC Supermarket, T. Nagar";
    App.toast("Sample inspection details prefilled.", "info");
  }

  function goToStep2(e) {
    if (e) e.preventDefault();

    // Read values from Step 1
    inspectionState.id = document.getElementById("insp-id").value;
    inspectionState.date = document.getElementById("insp-date").value;
    inspectionState.location = document.getElementById("insp-location").value;
    inspectionState.retailer = document.getElementById("insp-retailer").value;
    inspectionState.category = document.getElementById("insp-category").value;
    inspectionState.productName = document.getElementById("insp-prod-name").value;
    inspectionState.brand = document.getElementById("insp-brand").value;
    inspectionState.manufacturer = document.getElementById("insp-manufacturer").value;

    document.getElementById("step-section-1").style.display = "none";
    document.getElementById("step-section-2").style.display = "block";

    document.getElementById("step-nav-1").classList.remove("active");
    document.getElementById("step-nav-1").classList.add("completed");
    document.getElementById("step-nav-2").classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep1() {
    document.getElementById("step-section-2").style.display = "none";
    document.getElementById("step-section-1").style.display = "block";

    document.getElementById("step-nav-2").classList.remove("active");
    document.getElementById("step-nav-1").classList.add("active");
    document.getElementById("step-nav-1").classList.remove("completed");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Preload Sample Package Images for zero-friction demo testing
  function loadSamplePackageImages() {
    inspectionState.images.front = API.sampleImages.frontPanelBiscuits;
    inspectionState.images.back = API.sampleImages.backPanelBiscuits;

    renderImagePreview('front', API.sampleImages.frontPanelBiscuits, 'sample_front_panel.svg', '180 KB');
    renderImagePreview('back', API.sampleImages.backPanelBiscuits, 'sample_back_declarations.svg', '240 KB');

    App.toast("Preloaded high-res sample package panels (Front & Back)", "success");
  }

  function handleFileSelected(event, panelType) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      inspectionState.images[panelType] = dataUrl;
      const sizeKb = (file.size / 1024).toFixed(0);
      renderImagePreview(panelType, dataUrl, file.name, `${sizeKb} KB`);
    };
    reader.readAsDataURL(file);
  }

  function renderImagePreview(panelType, src, fileName, fileSize) {
    const emptyState = document.getElementById(`empty-state-${panelType}`);
    const previewState = document.getElementById(`preview-state-${panelType}`);
    const previewImg = document.getElementById(`preview-img-${panelType}`);
    const previewMeta = document.getElementById(`preview-meta-${panelType}`);

    if (emptyState && previewState && previewImg) {
      emptyState.style.display = "none";
      previewState.style.display = "block";
      previewImg.src = src;
      if (previewMeta) previewMeta.textContent = `${fileName} (${fileSize})`;
    }
  }

  function removeImage(panelType) {
    inspectionState.images[panelType] = null;
    const emptyState = document.getElementById(`empty-state-${panelType}`);
    const previewState = document.getElementById(`preview-state-${panelType}`);
    const fileInput = document.getElementById(`file-input-${panelType}`);

    if (emptyState && previewState) {
      emptyState.style.display = "block";
      previewState.style.display = "none";
      if (fileInput) fileInput.value = "";
    }
  }

  function handleDragOver(e, cardEl) {
    e.preventDefault();
    cardEl.classList.add("drag-over");
  }

  function handleDragLeave(e, cardEl) {
    e.preventDefault();
    cardEl.classList.remove("drag-over");
  }

  function handleDrop(e, panelType) {
    e.preventDefault();
    const cardEl = document.getElementById(`upload-card-${panelType}`);
    if (cardEl) cardEl.classList.remove("drag-over");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = function(ev) {
        const dataUrl = ev.target.result;
        inspectionState.images[panelType] = dataUrl;
        const sizeKb = (file.size / 1024).toFixed(0);
        renderImagePreview(panelType, dataUrl, file.name, `${sizeKb} KB`);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleEcommerceUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      inspectionState.images.ecommerce = e.target.result;
      const previewEl = document.getElementById("ecomm-preview-container");
      if (previewEl) previewEl.style.display = "block";
      App.toast("E-Commerce product listing screenshot attached.", "info");
    };
    reader.readAsDataURL(file);
  }

  function saveDraft() {
    App.toast("Inspection draft saved to local workspace.", "success");
  }

  // ==========================================
  // REALISTIC AI / OCR PROCESSING ANIMATION
  // ==========================================
  function startAnalysis() {
    // If no back panel image uploaded, use sample image automatically for seamless UX
    if (!inspectionState.images.back) {
      inspectionState.images.back = API.sampleImages.backPanelBiscuits;
      inspectionState.images.front = API.sampleImages.frontPanelBiscuits;
    }

    const modal = document.getElementById("processing-modal");
    const progressBar = document.getElementById("analysis-progress-bar");
    const statusText = document.getElementById("processing-status-text");

    modal.classList.add("active");

    const steps = [
      { id: "proc-step-1", progress: 20, status: "Enhancing image & rectifying perspective distortion..." },
      { id: "proc-step-2", progress: 40, status: "Detecting declaration text regions & bounding polygons..." },
      { id: "proc-step-3", progress: 65, status: "Performing optical character recognition & confidence scoring..." },
      { id: "proc-step-4", progress: 85, status: "Extracting MRP, Net Quantity, Mfg Date & Consumer Cell..." },
      { id: "proc-step-5", progress: 100, status: "Cross-referencing Legal Metrology Rules, 2011..." }
    ];

    let currentStepIndex = 0;

    function executeStep() {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        const stepEl = document.getElementById(step.id);
        
        stepEl.classList.add("active");
        progressBar.style.width = `${step.progress}%`;
        statusText.textContent = step.status;

        setTimeout(() => {
          stepEl.classList.remove("active");
          stepEl.classList.add("completed");
          const icon = stepEl.querySelector("i");
          if (icon) {
            icon.className = "fa-solid fa-circle-check";
          }
          currentStepIndex++;
          executeStep();
        }, 500);
      } else {
        // Complete Analysis
        setTimeout(async () => {
          const analyzedInspection = API.analyzePackage(inspectionState, inspectionState.images);
          let savedInspection;
          try { savedInspection = await API.createInspection(analyzedInspection); }
          catch (error) { modal.classList.remove("active"); App.toast(`Could not save inspection: ${error.message}`, "danger"); return; }

          modal.classList.remove("active");
          App.toast("Package screening complete. Displaying screening results...", "success");

          // Navigate to Results page
          setTimeout(() => {
            window.location.href = `results.html?id=${savedInspection.id}`;
          }, 400);
        }, 600);
      }
    }

    executeStep();
  }

  return {
    init: init,
    prefillSampleData: prefillSampleData,
    goToStep1: goToStep1,
    goToStep2: goToStep2,
    loadSamplePackageImages: loadSamplePackageImages,
    handleFileSelected: handleFileSelected,
    removeImage: removeImage,
    handleDragOver: handleDragOver,
    handleDragLeave: handleDragLeave,
    handleDrop: handleDrop,
    handleEcommerceUpload: handleEcommerceUpload,
    saveDraft: saveDraft,
    startAnalysis: startAnalysis
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  try { await InspectionController.init(); } catch (error) { App.toast(`Could not initialise inspection: ${error.message}`, "danger"); }
});
