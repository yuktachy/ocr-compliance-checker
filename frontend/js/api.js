/**
 * LegalMetriX - Mock API & Compliance Rule Engine
 * 
 * This module simulates a FastAPI backend using localStorage.
 * When integrating with a real Python FastAPI backend, replace these
 * functions with standard fetch/axios calls to the annotated endpoints.
 */

const API = (function() {
  const STORAGE_KEYS = {
    INSPECTIONS: 'legalmetrix_inspections',
    PRODUCTS: 'legalmetrix_products',
    REPORTS: 'legalmetrix_reports',
    NOTIFICATIONS: 'legalmetrix_notifications',
    SETTINGS: 'legalmetrix_settings',
    CURRENT_USER: 'legalmetrix_current_user',
    INITIALIZED: 'legalmetrix_initialized_v2'
  };

  // Default sample package images as SVG data URIs for robust, standalone demo testing
  const SAMPLE_IMAGES = {
    backPanelBiscuits: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:%23f8fafc;font-family:sans-serif;">
      <rect width="600" height="800" fill="%23fdfaf6" stroke="%23cbd5e1" stroke-width="4"/>
      <!-- Header Banner -->
      <rect x="20" y="20" width="560" height="90" rx="8" fill="%231e293b"/>
      <text x="300" y="55" fill="%23ffffff" font-size="22" font-weight="bold" text-anchor="middle">PREMIUM WHEAT BISCUITS</text>
      <text x="300" y="85" fill="%2394a3b8" font-size="13" text-anchor="middle">NUTRITIOUS &amp; CRISPY • 100% VEGETARIAN</text>
      
      <!-- Nutritional Info Box -->
      <rect x="30" y="130" width="260" height="260" rx="6" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
      <text x="45" y="155" fill="%230f172a" font-size="14" font-weight="bold">NUTRITIONAL INFORMATION</text>
      <text x="45" y="180" fill="%2364748b" font-size="11">Per 100g (Approx. Values)</text>
      <line x1="45" y1="190" x2="275" y2="190" stroke="%23e2e8f0"/>
      <text x="45" y="210" fill="%23334155" font-size="12">Energy: 460 kcal</text>
      <text x="45" y="235" fill="%23334155" font-size="12">Carbohydrates: 72 g</text>
      <text x="45" y="260" fill="%23334155" font-size="12">Total Sugars: 24 g</text>
      <text x="45" y="285" fill="%23334155" font-size="12">Proteins: 7.5 g</text>
      <text x="45" y="310" fill="%23334155" font-size="12">Total Fat: 16 g</text>
      <text x="45" y="335" fill="%23334155" font-size="12">Sodium: 310 mg</text>

      <!-- Declarations Area (Back panel) -->
      <!-- Net Qty -->
      <rect x="310" y="130" width="250" height="75" rx="6" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
      <text x="325" y="155" fill="%2364748b" font-size="11" font-weight="bold">NET QUANTITY</text>
      <text x="325" y="185" fill="%230f172a" font-size="18" font-weight="bold">100 g (0.10 kg)</text>

      <!-- MRP & Unit Price -->
      <rect x="310" y="220" width="250" height="85" rx="6" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
      <text x="325" y="245" fill="%2364748b" font-size="11" font-weight="bold">MAXIMUM RETAIL PRICE (MRP)</text>
      <text x="325" y="275" fill="%230f172a" font-size="18" font-weight="bold">₹ 50.00</text>
      <text x="325" y="293" fill="%2364748b" font-size="10">(Incl. of all taxes) • ₹0.50 / g</text>

      <!-- Mfg Date & Batch -->
      <rect x="310" y="320" width="250" height="70" rx="6" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
      <text x="325" y="345" fill="%2364748b" font-size="11" font-weight="bold">MFG. DATE &amp; BATCH NO.</text>
      <text x="325" y="370" fill="%230f172a" font-size="14" font-weight="bold">AUG 2026 | B.No: AT2834</text>

      <!-- Manufacturer & Packer Details -->
      <rect x="30" y="410" width="530" height="110" rx="6" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
      <text x="45" y="435" fill="%2364748b" font-size="11" font-weight="bold">MANUFACTURED &amp; PACKED BY:</text>
      <text x="45" y="460" fill="%230f172a" font-size="14" font-weight="bold">ABC Foods Private Limited</text>
      <text x="45" y="480" fill="%23475569" font-size="12">Plot No. 42-B, Industrial Area Phase II, Ambattur, Chennai, TN 600058</text>
      <text x="45" y="500" fill="%23475569" font-size="11">FSSAI Lic. No. 10018042000192 • Country of Origin: India</text>

      <!-- Consumer Care Section (Slightly blurry/faded for demo issue demonstration) -->
      <rect x="30" y="540" width="530" height="95" rx="6" fill="%23fffbeb" stroke="%23fde68a" stroke-width="2"/>
      <text x="45" y="565" fill="%23b45309" font-size="11" font-weight="bold">CONSUMER CARE &amp; FEEDBACK</text>
      <text x="45" y="590" fill="%2378716c" font-size="10" opacity="0.6">For feedback/complaints contact Consumer Cell at above address</text>
      <text x="45" y="610" fill="%2378716c" font-size="10" opacity="0.5">Toll-free: [Unclear print] | Email: customercare@... [Faded Text]</text>

      <!-- Barcode & Veg Emblem -->
      <rect x="30" y="655" width="530" height="115" rx="6" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
      <circle cx="70" cy="710" r="18" fill="none" stroke="%2316a34a" stroke-width="3"/>
      <circle cx="70" cy="710" r="8" fill="%2316a34a"/>
      <text x="100" y="715" fill="%2316a34a" font-size="13" font-weight="bold">100% VEGETARIAN</text>
      
      <!-- Barcode graphic -->
      <g transform="translate(360, 675)">
        <rect x="0" y="0" width="3" height="50" fill="%23000"/>
        <rect x="6" y="0" width="2" height="50" fill="%23000"/>
        <rect x="12" y="0" width="5" height="50" fill="%23000"/>
        <rect x="20" y="0" width="2" height="50" fill="%23000"/>
        <rect x="25" y="0" width="4" height="50" fill="%23000"/>
        <rect x="33" y="0" width="2" height="50" fill="%23000"/>
        <rect x="39" y="0" width="6" height="50" fill="%23000"/>
        <rect x="49" y="0" width="3" height="50" fill="%23000"/>
        <rect x="56" y="0" width="2" height="50" fill="%23000"/>
        <rect x="62" y="0" width="5" height="50" fill="%23000"/>
        <rect x="71" y="0" width="3" height="50" fill="%23000"/>
        <rect x="78" y="0" width="6" height="50" fill="%23000"/>
        <rect x="88" y="0" width="2" height="50" fill="%23000"/>
        <rect x="94" y="0" width="4" height="50" fill="%23000"/>
        <rect x="102" y="0" width="2" height="50" fill="%23000"/>
        <text x="50" y="70" font-size="11" text-anchor="middle" fill="%23334155">8 901234 567890</text>
      </g>
    </svg>`,
    frontPanelBiscuits: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:%23fff7ed;font-family:sans-serif;">
      <rect width="600" height="800" fill="%23fffbeb" stroke="%23fed7aa" stroke-width="4"/>
      <circle cx="300" cy="380" r="180" fill="%23fdba74" opacity="0.4"/>
      <rect x="40" y="60" width="520" height="120" rx="12" fill="%23c2410c"/>
      <text x="300" y="115" fill="%23ffffff" font-size="34" font-weight="900" text-anchor="middle">ABC CRUNCH</text>
      <text x="300" y="155" fill="%23fed7aa" font-size="16" font-weight="bold" text-anchor="middle">WHOLE WHEAT DIGESTIVE BISCUITS</text>
      <rect x="180" y="320" width="240" height="160" rx="20" fill="%23d97706" stroke="%23b45309" stroke-width="6"/>
      <text x="300" y="410" fill="%23ffffff" font-size="24" font-weight="bold" text-anchor="middle">100% WHEAT</text>
      <rect x="80" y="640" width="440" height="80" rx="10" fill="%231e293b"/>
      <text x="180" y="688" fill="%23ffffff" font-size="20" font-weight="bold">NET WT: 100g</text>
      <text x="420" y="688" fill="%23fbbf24" font-size="22" font-weight="bold">MRP ₹50.00</text>
    </svg>`
  };

  // Seed Data Generator
  function getSeedData() {
    const defaultInspections = [
      {
        id: "LM-1024",
        date: "2026-08-23",
        location: "Chennai",
        retailer: "ABC Supermarket, T. Nagar",
        inspector: "Inspector 102 (R. Sundaram)",
        product: {
          name: "ABC Biscuits",
          brand: "ABC",
          category: "Packaged Food",
          manufacturer: "ABC Foods Pvt Ltd",
          mrp: "₹50.00",
          netQuantity: "100 g"
        },
        images: {
          front: SAMPLE_IMAGES.frontPanelBiscuits,
          back: SAMPLE_IMAGES.backPanelBiscuits,
          side: null,
          ecommerce: null
        },
        declarations: {
          mrp: { value: "₹ 50.00 (₹0.50/g)", confidence: 0.98, status: "detected", label: "MRP & Unit Sale Price", bbox: { x: 51.6, y: 27.5, w: 41.6, h: 10.6 } },
          netQuantity: { value: "100 g (0.10 kg)", confidence: 0.96, status: "detected", label: "Net Quantity", bbox: { x: 51.6, y: 16.2, w: 41.6, h: 9.3 } },
          manufacturer: { value: "ABC Foods Private Limited, Chennai", confidence: 0.94, status: "detected", label: "Manufacturer Details", bbox: { x: 5.0, y: 51.2, w: 88.3, h: 13.7 } },
          manufacturingDate: { value: "AUG 2026 | B.No: AT2834", confidence: 0.91, status: "detected", label: "Mfg Date & Batch", bbox: { x: 51.6, y: 40.0, w: 41.6, h: 8.7 } },
          consumerCare: { value: "Toll-free / Email faded", confidence: 0.42, status: "needs_verification", label: "Consumer Care Contact", bbox: { x: 5.0, y: 67.5, w: 88.3, h: 11.8 } },
          countryOfOrigin: { value: "India", confidence: 0.95, status: "detected", label: "Country of Origin", bbox: { x: 5.0, y: 57.5, w: 88.3, h: 6.2 } }
        },
        violations: [
          {
            id: "v-1",
            category: "Consumer Care",
            severity: "Needs Verification",
            field: "consumerCare",
            description: "Required consumer care email and telephone details could not be reliably extracted from the package print (low contrast).",
            status: "flagged",
            bbox: { x: 5.0, y: 67.5, w: 88.3, h: 11.8 }
          }
        ],
        readability: {
          mrp: { confidence: 98, heightPx: 22, contrast: "High", status: "Good" },
          netQuantity: { confidence: 96, heightPx: 20, contrast: "High", status: "Good" },
          manufacturer: { confidence: 94, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 42, heightPx: 10, contrast: "Low", status: "Low OCR Confidence" }
        },
        status: "needs_verification", // 'compliant' | 'needs_verification' | 'potential_violation'
        remarks: "Consumer care details print is smudged. Re-inspection of retail stock batch AT2834 recommended.",
        officialDecision: "Manual Verification Required",
        reportedAt: "2026-08-23T14:30:00Z"
      },
      {
        id: "LM-1023",
        date: "2026-08-23",
        location: "Bangalore",
        retailer: "Metro Mart, Indiranagar",
        inspector: "Inspector 107 (P. Sharma)",
        product: {
          name: "XYZ Detergent Powder",
          brand: "XYZ Clean",
          category: "Household",
          manufacturer: "Apex Chem India Ltd",
          mrp: "₹199.00",
          netQuantity: "1 kg"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 199.00", confidence: 0.95, status: "detected", label: "MRP" },
          netQuantity: { value: "1 kg", confidence: 0.97, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Apex Chem India Ltd, Bangalore", confidence: 0.88, status: "detected", label: "Manufacturer Details" },
          manufacturingDate: { value: "July 2026", confidence: 0.90, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "care@apexchem.in | 1800-425-9988", confidence: 0.89, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.92, status: "detected", label: "Country of Origin" }
        },
        violations: [
          {
            id: "v-1",
            category: "Unit Sale Price",
            severity: "Needs Verification",
            field: "mrp",
            description: "Unit Sale Price (₹/kg or ₹/g) is printed in extremely small typeface near barcode.",
            status: "flagged"
          }
        ],
        readability: {
          mrp: { confidence: 95, heightPx: 18, contrast: "Good", status: "Good" },
          netQuantity: { confidence: 97, heightPx: 22, contrast: "High", status: "Good" },
          manufacturer: { confidence: 88, heightPx: 14, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 89, heightPx: 14, contrast: "Good", status: "Good" }
        },
        status: "needs_verification",
        remarks: "Clarification required on unit sale price font sizing compliance.",
        officialDecision: "Under Review",
        reportedAt: "2026-08-23T11:15:00Z"
      },
      {
        id: "LM-1022",
        date: "2026-08-22",
        location: "Mumbai",
        retailer: "Bharat Provisions, Dadar",
        inspector: "Inspector 102 (R. Sundaram)",
        product: {
          name: "PQR Basmati Rice",
          brand: "PQR Royal",
          category: "Packaged Food",
          manufacturer: "Shree Krishna Agro Ltd",
          mrp: "₹180.00",
          netQuantity: "1 kg"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 180.00", confidence: 0.94, status: "detected", label: "MRP" },
          netQuantity: { value: "", confidence: 0.21, status: "potential_issue", label: "Net Quantity" },
          manufacturer: { value: "Shree Krishna Agro Ltd", confidence: 0.92, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "June 2026", confidence: 0.85, status: "detected", label: "Packing Date" },
          consumerCare: { value: "help@shreekrishnaagro.com", confidence: 0.88, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.90, status: "detected", label: "Country of Origin" }
        },
        violations: [
          {
            id: "v-1",
            category: "Net Quantity Missing",
            severity: "Potential Violation",
            field: "netQuantity",
            description: "Mandatory Net Quantity declaration is missing on principal display panel.",
            status: "confirmed"
          }
        ],
        readability: {
          mrp: { confidence: 94, heightPx: 20, contrast: "High", status: "Good" },
          netQuantity: { confidence: 21, heightPx: 0, contrast: "None", status: "Missing" },
          manufacturer: { confidence: 92, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 88, heightPx: 14, contrast: "Good", status: "Good" }
        },
        status: "potential_violation",
        remarks: "Notice issued to packer for non-declaration of net quantity on PDP as per Rule 6(1)(d).",
        officialDecision: "Non-Compliance Notice Issued",
        reportedAt: "2026-08-22T16:45:00Z"
      },
      {
        id: "LM-1021",
        date: "2026-08-22",
        location: "Delhi",
        retailer: "Capital Hypermarket, Connaught Place",
        inspector: "Inspector 109 (V. Verma)",
        product: {
          name: "LMN Masala Chips",
          brand: "LMN Snacks",
          category: "Packaged Food",
          manufacturer: "LMN Food Products Ltd",
          mrp: "₹20.00",
          netQuantity: "45 g"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 20.00 (incl. of all taxes)", confidence: 0.99, status: "detected", label: "MRP" },
          netQuantity: { value: "45 g", confidence: 0.98, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "LMN Food Products Ltd, Okhla, New Delhi", confidence: 0.97, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "AUG 2026", confidence: 0.96, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "1800-111-222 | contact@lmnsnacks.com", confidence: 0.95, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.98, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 99, heightPx: 24, contrast: "High", status: "Good" },
          netQuantity: { confidence: 98, heightPx: 22, contrast: "High", status: "Good" },
          manufacturer: { confidence: 97, heightPx: 16, contrast: "High", status: "Good" },
          consumerCare: { confidence: 95, heightPx: 16, contrast: "High", status: "Good" }
        },
        status: "compliant",
        remarks: "All mandatory declarations prominently displayed in accordance with Legal Metrology Rules 2011.",
        officialDecision: "Fully Compliant",
        reportedAt: "2026-08-22T10:00:00Z"
      },
      {
        id: "LM-1020",
        date: "2026-08-22",
        location: "Hyderabad",
        retailer: "Deccan Mart, Banjara Hills",
        inspector: "Inspector 104 (K. Rao)",
        product: {
          name: "UVW Instant Noodles",
          brand: "UVW Foods",
          category: "Packaged Food",
          manufacturer: "South India Noodles Ltd",
          mrp: "₹15.00",
          netQuantity: "70 g"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 15.00", confidence: 0.96, status: "detected", label: "MRP" },
          netQuantity: { value: "70 g", confidence: 0.95, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "South India Noodles Ltd, Hyderabad", confidence: 0.92, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "Aug 2026", confidence: 0.94, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "care@uvwfoods.co.in", confidence: 0.65, status: "needs_verification", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.93, status: "detected", label: "Country of Origin" }
        },
        violations: [
          {
            id: "v-1",
            category: "Consumer Care Phone Missing",
            severity: "Needs Verification",
            field: "consumerCare",
            description: "Telephone / Toll-free helpline missing from consumer grievance redressal box.",
            status: "flagged"
          }
        ],
        readability: {
          mrp: { confidence: 96, heightPx: 20, contrast: "High", status: "Good" },
          netQuantity: { confidence: 95, heightPx: 20, contrast: "High", status: "Good" },
          manufacturer: { confidence: 92, heightPx: 15, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 65, heightPx: 12, contrast: "Fair", status: "Fair" }
        },
        status: "needs_verification",
        remarks: "Verification requested for missing contact phone number.",
        officialDecision: "Under Review",
        reportedAt: "2026-08-22T09:30:00Z"
      },
      {
        id: "LM-1019",
        date: "2026-08-21",
        location: "Kolkata",
        retailer: "Bengal Grocers, Salt Lake",
        inspector: "Inspector 112 (S. Banerjee)",
        product: {
          name: "Himalayan Herbal Shampoo",
          brand: "Herbal Glow",
          category: "Cosmetics",
          manufacturer: "Glow Care Cosmetics Ltd",
          mrp: "₹240.00",
          netQuantity: "200 ml"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 240.00", confidence: 0.97, status: "detected", label: "MRP" },
          netQuantity: { value: "200 ml", confidence: 0.96, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Glow Care Cosmetics Ltd, Kolkata", confidence: 0.93, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "July 2026", confidence: 0.91, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "care@herbalglow.in | 033-23349900", confidence: 0.94, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.96, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 97, heightPx: 22, contrast: "High", status: "Good" },
          netQuantity: { confidence: 96, heightPx: 20, contrast: "High", status: "Good" },
          manufacturer: { confidence: 93, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 94, heightPx: 16, contrast: "Good", status: "Good" }
        },
        status: "compliant",
        remarks: "Complete compliance across all 6 core mandatory declarations.",
        officialDecision: "Approved",
        reportedAt: "2026-08-21T15:20:00Z"
      },
      {
        id: "LM-1018",
        date: "2026-08-21",
        location: "Pune",
        retailer: "Sahyadri General Store, Kothrud",
        inspector: "Inspector 105 (A. Joshi)",
        product: {
          name: "Fresh Pure Cow Ghee",
          brand: "Dairy Pure",
          category: "Packaged Food",
          manufacturer: "Sahyadri Agro Federation",
          mrp: "₹550.00",
          netQuantity: "1 L"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 550.00", confidence: 0.98, status: "detected", label: "MRP" },
          netQuantity: { value: "1 L (910 g)", confidence: 0.97, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Sahyadri Agro Federation, Pune", confidence: 0.95, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "Aug 2026", confidence: 0.96, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "support@dairypure.org", confidence: 0.90, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.97, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 98, heightPx: 22, contrast: "High", status: "Good" },
          netQuantity: { confidence: 97, heightPx: 22, contrast: "High", status: "Good" },
          manufacturer: { confidence: 95, heightPx: 18, contrast: "High", status: "Good" },
          consumerCare: { confidence: 90, heightPx: 16, contrast: "Good", status: "Good" }
        },
        status: "compliant",
        remarks: "Dual unit (volume + mass equivalent) declared clearly.",
        officialDecision: "Approved",
        reportedAt: "2026-08-21T11:40:00Z"
      },
      {
        id: "LM-1017",
        date: "2026-08-20",
        location: "Chennai",
        retailer: "Marina Traders, George Town",
        inspector: "Inspector 102 (R. Sundaram)",
        product: {
          name: "Golden Tea Leaves",
          brand: "Golden Leaf",
          category: "Packaged Food",
          manufacturer: "Nilgiri Plantations Ltd",
          mrp: "₹120.00",
          netQuantity: "250 g"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 120.00", confidence: 0.92, status: "detected", label: "MRP" },
          netQuantity: { value: "250 g", confidence: 0.94, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "", confidence: 0.35, status: "potential_issue", label: "Manufacturer" },
          manufacturingDate: { value: "May 2026", confidence: 0.88, status: "detected", label: "Packing Date" },
          consumerCare: { value: "tea@goldenleaf.in", confidence: 0.85, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.91, status: "detected", label: "Country of Origin" }
        },
        violations: [
          {
            id: "v-1",
            category: "Manufacturer Address Incomplete",
            severity: "Potential Violation",
            field: "manufacturer",
            description: "Full postal address with PIN code of manufacturer / packer not stated.",
            status: "confirmed"
          }
        ],
        readability: {
          mrp: { confidence: 92, heightPx: 18, contrast: "Good", status: "Good" },
          netQuantity: { confidence: 94, heightPx: 20, contrast: "Good", status: "Good" },
          manufacturer: { confidence: 35, heightPx: 8, contrast: "Low", status: "Unclear" },
          consumerCare: { confidence: 85, heightPx: 14, contrast: "Fair", status: "Good" }
        },
        status: "potential_violation",
        remarks: "Incomplete manufacturer address violates Rule 6(1)(a). Notice served.",
        officialDecision: "Violation Confirmed",
        reportedAt: "2026-08-20T17:10:00Z"
      },
      {
        id: "LM-1016",
        date: "2026-08-20",
        location: "Delhi",
        retailer: "North Star Retail, Rohini",
        inspector: "Inspector 109 (V. Verma)",
        product: {
          name: "Natural Almond Oil",
          brand: "Pure Essence",
          category: "Personal Care",
          manufacturer: "Essence Naturals Ltd",
          mrp: "₹320.00",
          netQuantity: "100 ml"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 320.00", confidence: 0.98, status: "detected", label: "MRP" },
          netQuantity: { value: "100 ml", confidence: 0.97, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Essence Naturals Ltd, Delhi", confidence: 0.93, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "July 2026", confidence: 0.92, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "customercare@essencenaturals.com | 011-4567890", confidence: 0.94, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.96, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 98, heightPx: 20, contrast: "High", status: "Good" },
          netQuantity: { confidence: 97, heightPx: 20, contrast: "High", status: "Good" },
          manufacturer: { confidence: 93, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 94, heightPx: 16, contrast: "High", status: "Good" }
        },
        status: "compliant",
        remarks: "Sample meets all standard metrology declaration criteria.",
        officialDecision: "Approved",
        reportedAt: "2026-08-20T14:00:00Z"
      },
      {
        id: "LM-1015",
        date: "2026-08-19",
        location: "Bangalore",
        retailer: "QuickBazaar, Whitefield",
        inspector: "Inspector 107 (P. Sharma)",
        product: {
          name: "Whole Wheat Atta 5kg",
          brand: "Golden Harvest",
          category: "Packaged Food",
          manufacturer: "Agro Mills South Ltd",
          mrp: "₹260.00",
          netQuantity: "5 kg"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 260.00 (₹52.00/kg)", confidence: 0.97, status: "detected", label: "MRP" },
          netQuantity: { value: "5 kg", confidence: 0.98, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Agro Mills South Ltd, Hosur Road, Bangalore", confidence: 0.95, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "AUG 2026", confidence: 0.94, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "1800-425-3344 | contact@agromills.in", confidence: 0.96, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.97, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 97, heightPx: 26, contrast: "High", status: "Good" },
          netQuantity: { confidence: 98, heightPx: 28, contrast: "High", status: "Good" },
          manufacturer: { confidence: 95, heightPx: 18, contrast: "High", status: "Good" },
          consumerCare: { confidence: 96, heightPx: 16, contrast: "High", status: "Good" }
        },
        status: "compliant",
        remarks: "Large packaging font height exceeds statutory minimums.",
        officialDecision: "Approved",
        reportedAt: "2026-08-19T10:30:00Z"
      },
      {
        id: "LM-1014",
        date: "2026-08-19",
        location: "Mumbai",
        retailer: "E-Commerce Fulfillment Hub, Bhiwandi",
        inspector: "Inspector 102 (R. Sundaram)",
        product: {
          name: "Imported Olive Oil Extra Virgin",
          brand: "Mediterranean Gold",
          category: "Packaged Food",
          manufacturer: "Olea Hispania S.L. / Imported by Euro Gourmet India",
          mrp: "₹899.00",
          netQuantity: "500 ml"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 899.00", confidence: 0.95, status: "detected", label: "MRP" },
          netQuantity: { value: "500 ml", confidence: 0.96, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Euro Gourmet India Pvt Ltd, Mumbai", confidence: 0.92, status: "detected", label: "Importer" },
          manufacturingDate: { value: "April 2026", confidence: 0.90, status: "detected", label: "Import Date" },
          consumerCare: { value: "customercare@eurogourmet.in", confidence: 0.91, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "Spain", confidence: 0.93, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 95, heightPx: 20, contrast: "High", status: "Good" },
          netQuantity: { confidence: 96, heightPx: 20, contrast: "High", status: "Good" },
          manufacturer: { confidence: 92, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 91, heightPx: 14, contrast: "Good", status: "Good" }
        },
        status: "compliant",
        remarks: "Importer sticker complies with Rule 6(1)(b) amendment for imported commodities.",
        officialDecision: "Approved",
        reportedAt: "2026-08-19T16:00:00Z"
      },
      {
        id: "LM-1013",
        date: "2026-08-18",
        location: "Hyderabad",
        retailer: "Telangana Spices & More, Charminar",
        inspector: "Inspector 104 (K. Rao)",
        product: {
          name: "Turmeric Powder Standard Pack",
          brand: "Nizam Spices",
          category: "Agricultural Products",
          manufacturer: "Nizam Agro Processing Unit",
          mrp: "₹65.00",
          netQuantity: "200 g"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 65.00", confidence: 0.76, status: "needs_verification", label: "MRP" },
          netQuantity: { value: "200 g", confidence: 0.95, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Nizam Agro Processing Unit, Nizamabad", confidence: 0.89, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "July 2026", confidence: 0.91, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "", confidence: 0.30, status: "potential_issue", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.92, status: "detected", label: "Country of Origin" }
        },
        violations: [
          {
            id: "v-1",
            category: "Missing Consumer Grievance Details",
            severity: "Potential Violation",
            field: "consumerCare",
            description: "No consumer contact name, telephone, or email provided on package.",
            status: "flagged"
          },
          {
            id: "v-2",
            category: "MRP Smudge / Dual Pricing",
            severity: "Needs Verification",
            field: "mrp",
            description: "MRP area has sticker overlay indicating altered price.",
            status: "flagged"
          }
        ],
        readability: {
          mrp: { confidence: 76, heightPx: 14, contrast: "Low", status: "Fair" },
          netQuantity: { confidence: 95, heightPx: 18, contrast: "Good", status: "Good" },
          manufacturer: { confidence: 89, heightPx: 14, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 30, heightPx: 0, contrast: "None", status: "Missing" }
        },
        status: "potential_violation",
        remarks: "Dual price stickering detected over printed MRP. Violation under Rule 18(2).",
        officialDecision: "Investigation Initiated",
        reportedAt: "2026-08-18T13:10:00Z"
      },
      {
        id: "LM-1012",
        date: "2026-08-18",
        location: "Chennai",
        retailer: "Kovai Nilayam Supermarket, Adyar",
        inspector: "Inspector 102 (R. Sundaram)",
        product: {
          name: "Sparkle Dishwash Gel",
          brand: "Sparkle",
          category: "Household",
          manufacturer: "Shine Consumer Products Ltd",
          mrp: "₹110.00",
          netQuantity: "500 ml"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 110.00", confidence: 0.97, status: "detected", label: "MRP" },
          netQuantity: { value: "500 ml", confidence: 0.96, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Shine Consumer Products Ltd, Chennai", confidence: 0.94, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "June 2026", confidence: 0.93, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "care@sparkleindia.com | 1800-200-3300", confidence: 0.95, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.96, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 97, heightPx: 20, contrast: "High", status: "Good" },
          netQuantity: { confidence: 96, heightPx: 20, contrast: "High", status: "Good" },
          manufacturer: { confidence: 94, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 95, heightPx: 16, contrast: "High", status: "Good" }
        },
        status: "compliant",
        remarks: "Sample compliant in all aspects.",
        officialDecision: "Approved",
        reportedAt: "2026-08-18T11:00:00Z"
      },
      {
        id: "LM-1011",
        date: "2026-08-17",
        location: "Delhi",
        retailer: "Modern Daily Store, Saket",
        inspector: "Inspector 109 (V. Verma)",
        product: {
          name: "Crispy Roasted Peanuts",
          brand: "NutriCrunch",
          category: "Packaged Food",
          manufacturer: "Nutri Agro Foods Pvt Ltd",
          mrp: "₹40.00",
          netQuantity: "150 g"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 40.00", confidence: 0.96, status: "detected", label: "MRP" },
          netQuantity: { value: "150 g", confidence: 0.95, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Nutri Agro Foods Pvt Ltd, Alwar, RJ", confidence: 0.91, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "July 2026", confidence: 0.93, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "help@nutricrunch.com", confidence: 0.72, status: "needs_verification", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.94, status: "detected", label: "Country of Origin" }
        },
        violations: [
          {
            id: "v-1",
            category: "Font Size Below Threshold",
            severity: "Needs Verification",
            field: "netQuantity",
            description: "Estimated font height for Net Quantity declaration appears slightly below 2mm minimum.",
            status: "flagged"
          }
        ],
        readability: {
          mrp: { confidence: 96, heightPx: 18, contrast: "Good", status: "Good" },
          netQuantity: { confidence: 95, heightPx: 11, contrast: "Fair", status: "Borderline Font Size" },
          manufacturer: { confidence: 91, heightPx: 14, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 72, heightPx: 12, contrast: "Fair", status: "Fair" }
        },
        status: "needs_verification",
        remarks: "Physical measurement with calibrated optical scale advised for font height check.",
        officialDecision: "Verification Pending",
        reportedAt: "2026-08-17T15:50:00Z"
      },
      {
        id: "LM-1010",
        date: "2026-08-17",
        location: "Bangalore",
        retailer: "Kaveri Super Bazaar, Jayanagar",
        inspector: "Inspector 107 (P. Sharma)",
        product: {
          name: "Natural Green Tea Bags (25 count)",
          brand: "Herbal Sip",
          category: "Packaged Food",
          manufacturer: "Green Valley Tea Estate",
          mrp: "₹175.00",
          netQuantity: "50 g (25 N x 2g)"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 175.00", confidence: 0.98, status: "detected", label: "MRP" },
          netQuantity: { value: "50 g (25 N x 2g)", confidence: 0.97, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Green Valley Tea Estate, Munnar, KL", confidence: 0.94, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "AUG 2026", confidence: 0.95, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "info@herbalsip.in | 1800-425-7766", confidence: 0.96, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.97, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 98, heightPx: 22, contrast: "High", status: "Good" },
          netQuantity: { confidence: 97, heightPx: 22, contrast: "High", status: "Good" },
          manufacturer: { confidence: 94, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 96, heightPx: 16, contrast: "High", status: "Good" }
        },
        status: "compliant",
        remarks: "Standard declarations in order. Number of units (25 N) clearly mentioned.",
        officialDecision: "Approved",
        reportedAt: "2026-08-17T12:00:00Z"
      },
      {
        id: "LM-1009",
        date: "2026-08-16",
        location: "Mumbai",
        retailer: "Bandra Organic Outlet, Bandra West",
        inspector: "Inspector 102 (R. Sundaram)",
        product: {
          name: "Organic Raw Honey 500g",
          brand: "Nature Hive",
          category: "Packaged Food",
          manufacturer: "Wildwood Organics Ltd",
          mrp: "₹380.00",
          netQuantity: "500 g"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 380.00", confidence: 0.96, status: "detected", label: "MRP" },
          netQuantity: { value: "500 g", confidence: 0.97, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Wildwood Organics Ltd, Pune", confidence: 0.93, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "July 2026", confidence: 0.91, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "care@naturehive.com", confidence: 0.92, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.95, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 96, heightPx: 20, contrast: "High", status: "Good" },
          netQuantity: { confidence: 97, heightPx: 20, contrast: "High", status: "Good" },
          manufacturer: { confidence: 93, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 92, heightPx: 14, contrast: "Good", status: "Good" }
        },
        status: "compliant",
        remarks: "Complies with statutory guidelines.",
        officialDecision: "Approved",
        reportedAt: "2026-08-16T16:20:00Z"
      },
      {
        id: "LM-1008",
        date: "2026-08-16",
        location: "Kolkata",
        retailer: "Howrah Wholesale Market",
        inspector: "Inspector 112 (S. Banerjee)",
        product: {
          name: "Refined Mustard Oil 1L",
          brand: "Kisan Gold",
          category: "Agricultural Products",
          manufacturer: "Eastern Oil Mills Ltd",
          mrp: "₹165.00",
          netQuantity: "1 L"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 165.00", confidence: 0.88, status: "detected", label: "MRP" },
          netQuantity: { value: "1 L", confidence: 0.91, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Eastern Oil Mills Ltd, Howrah", confidence: 0.85, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "", confidence: 0.28, status: "potential_issue", label: "Packing Date" },
          consumerCare: { value: "care@kisangold.com", confidence: 0.80, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.90, status: "detected", label: "Country of Origin" }
        },
        violations: [
          {
            id: "v-1",
            category: "Missing Packing Date",
            severity: "Potential Violation",
            field: "manufacturingDate",
            description: "Month and Year of packaging is missing on the pouch / bottle label.",
            status: "confirmed"
          }
        ],
        readability: {
          mrp: { confidence: 88, heightPx: 18, contrast: "Good", status: "Good" },
          netQuantity: { confidence: 91, heightPx: 18, contrast: "Good", status: "Good" },
          manufacturer: { confidence: 85, heightPx: 14, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 80, heightPx: 12, contrast: "Fair", status: "Fair" }
        },
        status: "potential_violation",
        remarks: "Non-compliance of Rule 6(1)(e). Notice issued to manufacturer.",
        officialDecision: "Violation Confirmed",
        reportedAt: "2026-08-16T11:15:00Z"
      },
      {
        id: "LM-1007",
        date: "2026-08-15",
        location: "Chennai",
        retailer: "Nilgiris Supermarket, Mylapore",
        inspector: "Inspector 102 (R. Sundaram)",
        product: {
          name: "South Indian Filter Coffee Powder",
          brand: "Kaapi Royale",
          category: "Packaged Food",
          manufacturer: "Kaapi Agro Roasters",
          mrp: "₹140.00",
          netQuantity: "200 g"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 140.00 (incl. of all taxes)", confidence: 0.98, status: "detected", label: "MRP" },
          netQuantity: { value: "200 g", confidence: 0.97, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Kaapi Agro Roasters, Chikmagalur & Chennai", confidence: 0.95, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "AUG 2026", confidence: 0.96, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "1800-425-5227 | help@kaapiroyale.com", confidence: 0.97, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.98, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 98, heightPx: 22, contrast: "High", status: "Good" },
          netQuantity: { confidence: 97, heightPx: 22, contrast: "High", status: "Good" },
          manufacturer: { confidence: 95, heightPx: 16, contrast: "High", status: "Good" },
          consumerCare: { confidence: 97, heightPx: 16, contrast: "High", status: "Good" }
        },
        status: "compliant",
        remarks: "Exemplary adherence to Legal Metrology Packaged Commodity standards.",
        officialDecision: "Approved",
        reportedAt: "2026-08-15T10:00:00Z"
      },
      {
        id: "LM-1006",
        date: "2026-08-14",
        location: "Hyderabad",
        retailer: "City Central Mart, Secunderabad",
        inspector: "Inspector 104 (K. Rao)",
        product: {
          name: "All-in-One Floor Cleaner Citrus 1L",
          brand: "Sparkle Home",
          category: "Household",
          manufacturer: "Shine Consumer Products Ltd",
          mrp: "₹185.00",
          netQuantity: "1 L"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 185.00", confidence: 0.96, status: "detected", label: "MRP" },
          netQuantity: { value: "1 L", confidence: 0.96, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Shine Consumer Products Ltd, Hyderabad", confidence: 0.93, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "July 2026", confidence: 0.92, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "support@sparklehome.in", confidence: 0.89, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.95, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 96, heightPx: 20, contrast: "High", status: "Good" },
          netQuantity: { confidence: 96, heightPx: 20, contrast: "High", status: "Good" },
          manufacturer: { confidence: 93, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 89, heightPx: 14, contrast: "Good", status: "Good" }
        },
        status: "compliant",
        remarks: "Package satisfies statutory provisions.",
        officialDecision: "Approved",
        reportedAt: "2026-08-14T15:30:00Z"
      },
      {
        id: "LM-1005",
        date: "2026-08-13",
        location: "Delhi",
        retailer: "Reliance Smart Point, Janakpuri",
        inspector: "Inspector 109 (V. Verma)",
        product: {
          name: "Premium Roasted Cashews 200g",
          brand: "Royal Dryfruits",
          category: "Packaged Food",
          manufacturer: "Royal Nuts & Spices Pvt Ltd",
          mrp: "₹290.00",
          netQuantity: "200 g"
        },
        images: { front: SAMPLE_IMAGES.frontPanelBiscuits, back: SAMPLE_IMAGES.backPanelBiscuits },
        declarations: {
          mrp: { value: "₹ 290.00", confidence: 0.95, status: "detected", label: "MRP" },
          netQuantity: { value: "200 g", confidence: 0.94, status: "detected", label: "Net Quantity" },
          manufacturer: { value: "Royal Nuts & Spices Pvt Ltd, Delhi", confidence: 0.92, status: "detected", label: "Manufacturer" },
          manufacturingDate: { value: "July 2026", confidence: 0.91, status: "detected", label: "Mfg Date" },
          consumerCare: { value: "customercare@royaldryfruits.com", confidence: 0.88, status: "detected", label: "Consumer Care" },
          countryOfOrigin: { value: "India", confidence: 0.94, status: "detected", label: "Country of Origin" }
        },
        violations: [],
        readability: {
          mrp: { confidence: 95, heightPx: 20, contrast: "High", status: "Good" },
          netQuantity: { confidence: 94, heightPx: 18, contrast: "Good", status: "Good" },
          manufacturer: { confidence: 92, heightPx: 16, contrast: "Good", status: "Good" },
          consumerCare: { confidence: 88, heightPx: 14, contrast: "Good", status: "Good" }
        },
        status: "compliant",
        remarks: "Clear labels and proper weight classification.",
        officialDecision: "Approved",
        reportedAt: "2026-08-13T14:15:00Z"
      }
    ];

    const defaultProducts = [
      {
        id: "prod-1",
        name: "ABC Biscuits",
        brand: "ABC",
        category: "Packaged Food",
        manufacturer: "ABC Foods Pvt Ltd",
        inspectionsCount: 8,
        compliantCount: 6,
        violationCount: 1,
        needsVerificationCount: 1,
        latestStatus: "needs_verification",
        lastInspectionDate: "2026-08-23",
        lastInspectionId: "LM-1024",
        historyTimeline: [
          { date: "2026-08-23", inspectionId: "LM-1024", status: "needs_verification", note: "Consumer care print smudged" },
          { date: "2026-07-10", inspectionId: "LM-0982", status: "compliant", note: "Routine verification passed" },
          { date: "2026-05-18", inspectionId: "LM-0911", status: "compliant", note: "Compliant" }
        ]
      },
      {
        id: "prod-2",
        name: "XYZ Detergent Powder",
        brand: "XYZ Clean",
        category: "Household",
        manufacturer: "Apex Chem India Ltd",
        inspectionsCount: 6,
        compliantCount: 4,
        violationCount: 0,
        needsVerificationCount: 2,
        latestStatus: "needs_verification",
        lastInspectionDate: "2026-08-23",
        lastInspectionId: "LM-1023",
        historyTimeline: [
          { date: "2026-08-23", inspectionId: "LM-1023", status: "needs_verification", note: "Unit sale price font size review" },
          { date: "2026-06-12", inspectionId: "LM-0945", status: "compliant", note: "Passed inspection" }
        ]
      },
      {
        id: "prod-3",
        name: "PQR Basmati Rice",
        brand: "PQR Royal",
        category: "Packaged Food",
        manufacturer: "Shree Krishna Agro Ltd",
        inspectionsCount: 5,
        compliantCount: 3,
        violationCount: 2,
        needsVerificationCount: 0,
        latestStatus: "potential_violation",
        lastInspectionDate: "2026-08-22",
        lastInspectionId: "LM-1022",
        historyTimeline: [
          { date: "2026-08-22", inspectionId: "LM-1022", status: "potential_violation", note: "Missing Net Quantity declaration" },
          { date: "2026-04-05", inspectionId: "LM-0889", status: "potential_violation", note: "Unit sale price omission" }
        ]
      },
      {
        id: "prod-4",
        name: "LMN Masala Chips",
        brand: "LMN Snacks",
        category: "Packaged Food",
        manufacturer: "LMN Food Products Ltd",
        inspectionsCount: 9,
        compliantCount: 9,
        violationCount: 0,
        needsVerificationCount: 0,
        latestStatus: "compliant",
        lastInspectionDate: "2026-08-22",
        lastInspectionId: "LM-1021",
        historyTimeline: [
          { date: "2026-08-22", inspectionId: "LM-1021", status: "compliant", note: "Fully compliant" },
          { date: "2026-06-15", inspectionId: "LM-0950", status: "compliant", note: "Clean audit" }
        ]
      },
      {
        id: "prod-5",
        name: "UVW Instant Noodles",
        brand: "UVW Foods",
        category: "Packaged Food",
        manufacturer: "South India Noodles Ltd",
        inspectionsCount: 4,
        compliantCount: 3,
        violationCount: 0,
        needsVerificationCount: 1,
        latestStatus: "needs_verification",
        lastInspectionDate: "2026-08-22",
        lastInspectionId: "LM-1020",
        historyTimeline: [
          { date: "2026-08-22", inspectionId: "LM-1020", status: "needs_verification", note: "Consumer care telephone missing" }
        ]
      },
      {
        id: "prod-6",
        name: "Himalayan Herbal Shampoo",
        brand: "Herbal Glow",
        category: "Cosmetics",
        manufacturer: "Glow Care Cosmetics Ltd",
        inspectionsCount: 7,
        compliantCount: 7,
        violationCount: 0,
        needsVerificationCount: 0,
        latestStatus: "compliant",
        lastInspectionDate: "2026-08-21",
        lastInspectionId: "LM-1019",
        historyTimeline: [
          { date: "2026-08-21", inspectionId: "LM-1019", status: "compliant", note: "All declarations verified" }
        ]
      },
      {
        id: "prod-7",
        name: "Fresh Pure Cow Ghee",
        brand: "Dairy Pure",
        category: "Packaged Food",
        manufacturer: "Sahyadri Agro Federation",
        inspectionsCount: 5,
        compliantCount: 5,
        violationCount: 0,
        needsVerificationCount: 0,
        latestStatus: "compliant",
        lastInspectionDate: "2026-08-21",
        lastInspectionId: "LM-1018",
        historyTimeline: [
          { date: "2026-08-21", inspectionId: "LM-1018", status: "compliant", note: "Dual mass/volume compliant" }
        ]
      },
      {
        id: "prod-8",
        name: "Golden Tea Leaves",
        brand: "Golden Leaf",
        category: "Packaged Food",
        manufacturer: "Nilgiri Plantations Ltd",
        inspectionsCount: 6,
        compliantCount: 4,
        violationCount: 2,
        needsVerificationCount: 0,
        latestStatus: "potential_violation",
        lastInspectionDate: "2026-08-20",
        lastInspectionId: "LM-1017",
        historyTimeline: [
          { date: "2026-08-20", inspectionId: "LM-1017", status: "potential_violation", note: "Manufacturer address missing PIN" }
        ]
      },
      {
        id: "prod-9",
        name: "Natural Almond Oil",
        brand: "Pure Essence",
        category: "Personal Care",
        manufacturer: "Essence Naturals Ltd",
        inspectionsCount: 4,
        compliantCount: 4,
        violationCount: 0,
        needsVerificationCount: 0,
        latestStatus: "compliant",
        lastInspectionDate: "2026-08-20",
        lastInspectionId: "LM-1016",
        historyTimeline: [
          { date: "2026-08-20", inspectionId: "LM-1016", status: "compliant", note: "Fully compliant" }
        ]
      },
      {
        id: "prod-10",
        name: "Whole Wheat Atta 5kg",
        brand: "Golden Harvest",
        category: "Packaged Food",
        manufacturer: "Agro Mills South Ltd",
        inspectionsCount: 11,
        compliantCount: 11,
        violationCount: 0,
        needsVerificationCount: 0,
        latestStatus: "compliant",
        lastInspectionDate: "2026-08-19",
        lastInspectionId: "LM-1015",
        historyTimeline: [
          { date: "2026-08-19", inspectionId: "LM-1015", status: "compliant", note: "High quality font declarations" }
        ]
      }
    ];

    const defaultReports = [
      {
        id: "REP-2026-1024",
        inspectionId: "LM-1024",
        productName: "ABC Biscuits",
        category: "Packaged Food",
        generatedDate: "2026-08-23",
        status: "Needs Verification",
        generatedBy: "Inspector 102 (R. Sundaram)",
        location: "Chennai"
      },
      {
        id: "REP-2026-1023",
        inspectionId: "LM-1023",
        productName: "XYZ Detergent Powder",
        category: "Household",
        generatedDate: "2026-08-23",
        status: "Needs Verification",
        generatedBy: "Inspector 107 (P. Sharma)",
        location: "Bangalore"
      },
      {
        id: "REP-2026-1022",
        inspectionId: "LM-1022",
        productName: "PQR Basmati Rice",
        category: "Packaged Food",
        generatedDate: "2026-08-22",
        status: "Potential Violation",
        generatedBy: "Inspector 102 (R. Sundaram)",
        location: "Mumbai"
      },
      {
        id: "REP-2026-1021",
        inspectionId: "LM-1021",
        productName: "LMN Masala Chips",
        category: "Packaged Food",
        generatedDate: "2026-08-22",
        status: "Compliant",
        generatedBy: "Inspector 109 (V. Verma)",
        location: "Delhi"
      },
      {
        id: "REP-2026-1017",
        inspectionId: "LM-1017",
        productName: "Golden Tea Leaves",
        category: "Packaged Food",
        generatedDate: "2026-08-20",
        status: "Potential Violation",
        generatedBy: "Inspector 102 (R. Sundaram)",
        location: "Chennai"
      }
    ];

    const defaultNotifications = [
      { id: "notif-1", title: "Inspection Flagged", message: "Inspection LM-1024 requires verification (Consumer Care details).", time: "10 mins ago", type: "warning", unread: true, link: "results.html?id=LM-1024" },
      { id: "notif-2", title: "Report Ready", message: "Official screening report REP-2026-1023 has been generated.", time: "1 hour ago", type: "info", unread: true, link: "reports.html?id=REP-2026-1023" },
      { id: "notif-3", title: "Potential Non-Compliance", message: "Notice served for LM-1022 (Missing Net Quantity).", time: "Yesterday", type: "danger", unread: false, link: "results.html?id=LM-1022" },
      { id: "notif-4", title: "Rule Update Notice", message: "Packaged Commodities (Amendment) Rules reference repository synced.", time: "2 days ago", type: "success", unread: false, link: "settings.html" }
    ];

    const defaultSettings = {
      ruleVersion: "Legal Metrology (Packaged Commodities) Rules, 2011 + 2022/2024 Amendments",
      effectiveDate: "01-Jan-2024",
      ocrMinConfidence: 75,
      minFontHeightPx: 12,
      strictUnitPriceCheck: true,
      countryOfOriginMandatory: true,
      autoGenerateReportOnViolation: true,
      enforcementZone: "Southern Region - Zone 1",
      department: "Department of Consumer Affairs, Legal Metrology Division"
    };

    const defaultUser = {
      username: "inspector.sundaram",
      fullName: "R. Sundaram",
      badgeId: "LM-OFFICER-102",
      role: "inspector", // 'inspector' | 'supervisor' | 'admin'
      roleLabel: "Legal Metrology Enforcement Officer",
      department: "Legal Metrology Dept, Chennai Division",
      zone: "Tamil Nadu - Zone 01",
      email: "r.sundaram@legalmetrology.gov.in"
    };

    return {
      inspections: defaultInspections,
      products: defaultProducts,
      reports: defaultReports,
      notifications: defaultNotifications,
      settings: defaultSettings,
      currentUser: defaultUser
    };
  }

  // Initialize LocalStorage with seed data if not present
  function initStorage(forceReset = false) {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED) || forceReset) {
      const data = getSeedData();
      localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(data.inspections));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(data.reports));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || forceReset) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.currentUser));
      }
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
      console.log("[LegalMetriX API] Seed dataset initialized in LocalStorage.");
    }
  }

  // Ensure init on module load
  initStorage();

  // ==========================================
  // RULE ENGINE MODULE (Mock AI & Compliance)
  // ==========================================
  const RuleEngine = {
    mandatoryDeclarations: [
      { key: "mrp", name: "Maximum Retail Price (MRP)", ruleRef: "Rule 6(1)(e)", description: "Inclusive of all taxes and unit sale price where applicable" },
      { key: "netQuantity", name: "Net Quantity / Weight", ruleRef: "Rule 6(1)(d)", description: "Declared in standard SI units (g, kg, ml, L, N)" },
      { key: "manufacturer", name: "Manufacturer / Packer / Importer", ruleRef: "Rule 6(1)(a)/(b)", description: "Full name and complete registered address" },
      { key: "manufacturingDate", name: "Date of Mfg / Packing / Import", ruleRef: "Rule 6(1)(d)", description: "Month and year of manufacture or packaging" },
      { key: "consumerCare", name: "Consumer Grievance Cell", ruleRef: "Rule 6(1)(f)", description: "Name/designation, address, telephone & email" },
      { key: "countryOfOrigin", name: "Country of Origin", ruleRef: "Rule 6(1)(j)", description: "Required for all packaged and imported goods" }
    ],

    /**
     * Evaluates declarations extracted from package OCR against Legal Metrology Rules
     * @param {Object} declarations 
     * @param {Object} options 
     * @returns {Object} { status, violations, scoreSummary }
     */
    evaluateCompliance: function(declarations, options = {}) {
      const settings = API.getSettings();
      const minConfidence = (settings.ocrMinConfidence || 75) / 100;
      const violations = [];
      let missingCount = 0;
      let lowConfidenceCount = 0;
      let detectedCount = 0;

      this.mandatoryDeclarations.forEach(decl => {
        const field = declarations[decl.key];
        if (!field || !field.value || field.value.trim() === "" || field.status === "missing" || field.status === "potential_issue") {
          missingCount++;
          violations.push({
            id: `v-${decl.key}-${Date.now()}`,
            category: `Missing ${decl.name}`,
            severity: "Potential Violation",
            field: decl.key,
            description: `Mandatory declaration of ${decl.name} (${decl.ruleRef}) was not detected on the package panels.`,
            status: "flagged",
            bbox: field ? field.bbox : null
          });
        } else if (field.confidence < minConfidence || field.status === "needs_verification") {
          lowConfidenceCount++;
          violations.push({
            id: `v-${decl.key}-${Date.now()}`,
            category: `${decl.name} Unclear / Low Confidence`,
            severity: "Needs Verification",
            field: decl.key,
            description: `Declaration for ${decl.name} was detected with low optical confidence (${Math.round(field.confidence * 100)}%). Manual inspection recommended.`,
            status: "flagged",
            bbox: field.bbox
          });
        } else {
          detectedCount++;
        }
      });

      let overallStatus = "compliant";
      if (violations.some(v => v.severity === "Potential Violation")) {
        overallStatus = "potential_violation";
      } else if (violations.some(v => v.severity === "Needs Verification") || lowConfidenceCount > 0) {
        overallStatus = "needs_verification";
      }

      return {
        overallStatus: overallStatus,
        violations: violations,
        summary: {
          totalRequired: this.mandatoryDeclarations.length,
          detected: detectedCount,
          missingOrUnclear: missingCount + lowConfidenceCount,
          potentialIssues: violations.length
        }
      };
    }
  };

  // ==========================================
  // PUBLIC API INTERFACE (Simulated FastAPI)
  // ==========================================
  return {
    sampleImages: SAMPLE_IMAGES,
    ruleEngine: RuleEngine,

    // Reset database to initial state
    resetDatabase: function() {
      initStorage(true);
      return { success: true, message: "Demo database reset to original state." };
    },

    // ------------------------------------------
    // AUTH & ROLE SIMULATION
    // ------------------------------------------
    getCurrentUser: function() {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : getSeedData().currentUser;
    },

    setCurrentUserRole: function(roleKey) {
      const roles = {
        inspector: {
          username: "inspector.sundaram",
          fullName: "R. Sundaram",
          badgeId: "LM-OFFICER-102",
          role: "inspector",
          roleLabel: "Legal Metrology Enforcement Officer",
          department: "Legal Metrology Dept, Chennai Division",
          zone: "Tamil Nadu - Zone 01",
          email: "r.sundaram@legalmetrology.gov.in"
        },
        supervisor: {
          username: "supervisor.anita",
          fullName: "Anita Deshmukh",
          badgeId: "LM-SUP-204",
          role: "supervisor",
          roleLabel: "Deputy Controller of Legal Metrology",
          department: "Zonal Enforcement Directorate, Western Zone",
          zone: "Maharashtra & Goa Zone",
          email: "a.deshmukh@legalmetrology.gov.in"
        },
        admin: {
          username: "admin.director",
          fullName: "Dr. K. S. Ramanathan",
          badgeId: "LM-DIR-001",
          role: "admin",
          roleLabel: "Director of Legal Metrology / Administrator",
          department: "Ministry of Consumer Affairs, Legal Metrology Division",
          zone: "National Headquarters - New Delhi",
          email: "director.lm@nic.in"
        }
      };

      const selected = roles[roleKey] || roles.inspector;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(selected));
      return selected;
    },

    // ------------------------------------------
    // DASHBOARD STATS
    // FastAPI: GET /api/v1/dashboard/stats
    // ------------------------------------------
    getDashboardStats: function() {
      const inspections = this.getInspections();
      const total = inspections.length;
      const compliant = inspections.filter(i => i.status === "compliant").length;
      const potentialViolations = inspections.filter(i => i.status === "potential_violation").length;
      const needsVerification = inspections.filter(i => i.status === "needs_verification").length;

      // Violations by Type counts
      const violationTypeCounts = {
        "MRP & Pricing": 0,
        "Missing Declarations": 0,
        "Font Size & Readability": 0,
        "Net Quantity": 0,
        "Manufacturer Details": 0,
        "Consumer Care": 0,
        "Other": 0
      };

      inspections.forEach(insp => {
        (insp.violations || []).forEach(v => {
          const cat = v.category.toLowerCase();
          if (cat.includes("mrp") || cat.includes("price")) violationTypeCounts["MRP & Pricing"]++;
          else if (cat.includes("missing")) violationTypeCounts["Missing Declarations"]++;
          else if (cat.includes("font") || cat.includes("readability")) violationTypeCounts["Font Size & Readability"]++;
          else if (cat.includes("quantity") || cat.includes("weight")) violationTypeCounts["Net Quantity"]++;
          else if (cat.includes("manufacturer") || cat.includes("address")) violationTypeCounts["Manufacturer Details"]++;
          else if (cat.includes("consumer") || cat.includes("care")) violationTypeCounts["Consumer Care"]++;
          else violationTypeCounts["Other"]++;
        });
      });

      // City location breakdown
      const locationCounts = {};
      inspections.forEach(i => {
        const loc = i.location || "Other";
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
      });

      return {
        totalInspections: total,
        compliant: {
          count: compliant,
          percentage: total ? ((compliant / total) * 100).toFixed(1) : 0
        },
        potentialViolations: {
          count: potentialViolations,
          percentage: total ? ((potentialViolations / total) * 100).toFixed(1) : 0
        },
        needsVerification: {
          count: needsVerification,
          percentage: total ? ((needsVerification / total) * 100).toFixed(1) : 0
        },
        violationTypeCounts: violationTypeCounts,
        locationCounts: locationCounts,
        recentInspections: inspections.slice(0, 6)
      };
    },

    // ------------------------------------------
    // INSPECTIONS CRUD
    // FastAPI: GET /api/v1/inspections
    // ------------------------------------------
    getInspections: function(filters = {}) {
      const data = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
      let list = data ? JSON.parse(data) : [];

      if (filters.search) {
        const query = filters.search.toLowerCase();
        list = list.filter(item => 
          item.id.toLowerCase().includes(query) ||
          (item.product && item.product.name && item.product.name.toLowerCase().includes(query)) ||
          (item.product && item.product.brand && item.product.brand.toLowerCase().includes(query)) ||
          (item.product && item.product.manufacturer && item.product.manufacturer.toLowerCase().includes(query)) ||
          (item.retailer && item.retailer.toLowerCase().includes(query))
        );
      }

      if (filters.status && filters.status !== "all") {
        list = list.filter(item => item.status === filters.status);
      }

      if (filters.location && filters.location !== "all") {
        list = list.filter(item => item.location === filters.location);
      }

      if (filters.category && filters.category !== "all") {
        list = list.filter(item => item.product && item.product.category === filters.category);
      }

      if (filters.dateFrom) {
        list = list.filter(item => item.date >= filters.dateFrom);
      }

      if (filters.dateTo) {
        list = list.filter(item => item.date <= filters.dateTo);
      }

      return list;
    },

    // FastAPI: GET /api/v1/inspections/{id}
    getInspection: function(id) {
      const list = this.getInspections();
      return list.find(item => item.id === id) || null;
    },

    // FastAPI: POST /api/v1/inspections
    createInspection: function(inspectionData) {
      const list = this.getInspections();
      // Generate ID if missing
      if (!inspectionData.id) {
        const maxNum = list.reduce((max, item) => {
          const num = parseInt(item.id.replace("LM-", ""), 10);
          return !isNaN(num) && num > max ? num : max;
        }, 1024);
        inspectionData.id = `LM-${maxNum + 1}`;
      }

      // Default date & timestamp
      if (!inspectionData.date) {
        inspectionData.date = new Date().toISOString().split('T')[0];
      }
      inspectionData.reportedAt = new Date().toISOString();

      list.unshift(inspectionData);
      localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(list));

      // Update product repository as well
      this._updateProductFromInspection(inspectionData);

      // Add Notification
      this.addNotification({
        title: `Inspection ${inspectionData.id} Created`,
        message: `${inspectionData.product?.name || 'Package'} screened with status: ${inspectionData.status?.replace('_', ' ').toUpperCase()}`,
        type: inspectionData.status === 'compliant' ? 'success' : (inspectionData.status === 'potential_violation' ? 'danger' : 'warning'),
        link: `results.html?id=${inspectionData.id}`
      });

      return inspectionData;
    },

    // FastAPI: PUT /api/v1/inspections/{id}
    updateInspection: function(id, updateData) {
      const list = this.getInspections();
      const index = list.findIndex(item => item.id === id);
      if (index === -1) return null;

      list[index] = { ...list[index], ...updateData };
      localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(list));
      this._updateProductFromInspection(list[index]);
      return list[index];
    },

    // FastAPI: DELETE /api/v1/inspections/{id}
    deleteInspection: function(id) {
      let list = this.getInspections();
      const prevLength = list.length;
      list = list.filter(item => item.id !== id);
      if (list.length !== prevLength) {
        localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(list));
        return true;
      }
      return false;
    },

    // Internal helper to update product stats
    _updateProductFromInspection: function(inspection) {
      if (!inspection.product || !inspection.product.name) return;
      const products = this.getProducts();
      let prod = products.find(p => p.name.toLowerCase() === inspection.product.name.toLowerCase());

      if (!prod) {
        prod = {
          id: `prod-${Date.now()}`,
          name: inspection.product.name,
          brand: inspection.product.brand || "N/A",
          category: inspection.product.category || "Other",
          manufacturer: inspection.product.manufacturer || "N/A",
          inspectionsCount: 0,
          compliantCount: 0,
          violationCount: 0,
          needsVerificationCount: 0,
          latestStatus: inspection.status,
          lastInspectionDate: inspection.date,
          lastInspectionId: inspection.id,
          historyTimeline: []
        };
        products.unshift(prod);
      }

      prod.inspectionsCount = (prod.inspectionsCount || 0) + 1;
      if (inspection.status === "compliant") prod.compliantCount = (prod.compliantCount || 0) + 1;
      else if (inspection.status === "potential_violation") prod.violationCount = (prod.violationCount || 0) + 1;
      else if (inspection.status === "needs_verification") prod.needsVerificationCount = (prod.needsVerificationCount || 0) + 1;

      prod.latestStatus = inspection.status;
      prod.lastInspectionDate = inspection.date;
      prod.lastInspectionId = inspection.id;

      if (!prod.historyTimeline) prod.historyTimeline = [];
      prod.historyTimeline.unshift({
        date: inspection.date,
        inspectionId: inspection.id,
        status: inspection.status,
        note: inspection.remarks || `Screening outcome: ${inspection.status}`
      });

      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    },

    // ------------------------------------------
    // SIMULATED OCR & AI PACKAGE ANALYSIS
    // FastAPI: POST /api/v1/analyze
    // ------------------------------------------
    analyzePackage: function(inspectionDetails, images) {
      // Simulates real OCR extraction on the uploaded image
      const category = inspectionDetails.category || "Packaged Food";
      const productName = inspectionDetails.productName || "Packaged Commodity";
      const brand = inspectionDetails.brand || "Brand";
      const manufacturer = inspectionDetails.manufacturer || "Manufacturer Ltd";

      // Build simulated extracted declarations
      let declarations = {
        mrp: {
          value: "₹ 50.00 (₹0.50/g)",
          confidence: 0.98,
          status: "detected",
          label: "MRP & Unit Price",
          bbox: { x: 51.6, y: 27.5, w: 41.6, h: 10.6 }
        },
        netQuantity: {
          value: "100 g (0.10 kg)",
          confidence: 0.96,
          status: "detected",
          label: "Net Quantity",
          bbox: { x: 51.6, y: 16.2, w: 41.6, h: 9.3 }
        },
        manufacturer: {
          value: `${manufacturer}, Industrial Area, Chennai 600058`,
          confidence: 0.94,
          status: "detected",
          label: "Manufacturer Details",
          bbox: { x: 5.0, y: 51.2, w: 88.3, h: 13.7 }
        },
        manufacturingDate: {
          value: "AUG 2026 | B.No: AT2834",
          confidence: 0.91,
          status: "detected",
          label: "Mfg Date & Batch",
          bbox: { x: 51.6, y: 40.0, w: 41.6, h: 8.7 }
        },
        consumerCare: {
          value: "Toll-free / Email faded",
          confidence: 0.42,
          status: "needs_verification",
          label: "Consumer Care Contact",
          bbox: { x: 5.0, y: 67.5, w: 88.3, h: 11.8 }
        },
        countryOfOrigin: {
          value: "India",
          confidence: 0.95,
          status: "detected",
          label: "Country of Origin",
          bbox: { x: 5.0, y: 57.5, w: 88.3, h: 6.2 }
        }
      };

      // Custom variations for testing
      if (productName.toLowerCase().includes("rice") || productName.toLowerCase().includes("flour")) {
        declarations.netQuantity = { value: "1 kg", confidence: 0.95, status: "detected", bbox: { x: 51.6, y: 16.2, w: 41.6, h: 9.3 } };
        declarations.mrp = { value: "₹ 120.00 (₹120.00/kg)", confidence: 0.96, status: "detected", bbox: { x: 51.6, y: 27.5, w: 41.6, h: 10.6 } };
      }

      // Readability screening metrics
      const readability = {
        mrp: { confidence: Math.round(declarations.mrp.confidence * 100), heightPx: 22, contrast: "High", status: "Good" },
        netQuantity: { confidence: Math.round(declarations.netQuantity.confidence * 100), heightPx: 20, contrast: "High", status: "Good" },
        manufacturer: { confidence: Math.round(declarations.manufacturer.confidence * 100), heightPx: 16, contrast: "Good", status: "Good" },
        consumerCare: { confidence: Math.round(declarations.consumerCare.confidence * 100), heightPx: 10, contrast: "Low", status: declarations.consumerCare.confidence < 0.7 ? "Low OCR Confidence" : "Good" }
      };

      // Evaluate through rule engine
      const evaluation = RuleEngine.evaluateCompliance(declarations);

      const inspectionObject = {
        id: inspectionDetails.id || `LM-${Math.floor(1000 + Math.random() * 9000)}`,
        date: inspectionDetails.date || new Date().toISOString().split('T')[0],
        location: inspectionDetails.location || "Chennai",
        retailer: inspectionDetails.retailer || "Retail Establishment",
        inspector: inspectionDetails.inspector || API.getCurrentUser().fullName,
        product: {
          name: productName,
          brand: brand,
          category: category,
          manufacturer: manufacturer,
          mrp: declarations.mrp.value,
          netQuantity: declarations.netQuantity.value
        },
        images: {
          front: images.front || SAMPLE_IMAGES.frontPanelBiscuits,
          back: images.back || SAMPLE_IMAGES.backPanelBiscuits,
          side: images.side || null,
          ecommerce: images.ecommerce || null
        },
        declarations: declarations,
        violations: evaluation.violations,
        readability: readability,
        status: evaluation.overallStatus,
        remarks: evaluation.overallStatus === "compliant" ? 
          "Preliminary screening passed. All mandatory declarations detected." :
          "Manual verification recommended for flagged parameters.",
        officialDecision: evaluation.overallStatus === "compliant" ? "Compliant" : "Verification Required",
        reportedAt: new Date().toISOString()
      };

      return inspectionObject;
    },

    // ------------------------------------------
    // PRODUCTS REPOSITORY
    // FastAPI: GET /api/v1/products
    // ------------------------------------------
    getProducts: function(filters = {}) {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      let list = data ? JSON.parse(data) : [];

      if (filters.search) {
        const query = filters.search.toLowerCase();
        list = list.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.manufacturer.toLowerCase().includes(query)
        );
      }

      if (filters.category && filters.category !== "all") {
        list = list.filter(p => p.category === filters.category);
      }

      if (filters.status && filters.status !== "all") {
        list = list.filter(p => p.latestStatus === filters.status);
      }

      return list;
    },

    getProduct: function(id) {
      const list = this.getProducts();
      return list.find(p => p.id === id) || null;
    },

    // ------------------------------------------
    // REPORTS REPOSITORY
    // FastAPI: GET /api/v1/reports
    // ------------------------------------------
    getReports: function() {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return data ? JSON.parse(data) : [];
    },

    // FastAPI: POST /api/v1/reports
    generateReport: function(inspectionId) {
      const inspection = this.getInspection(inspectionId);
      if (!inspection) return null;

      const reports = this.getReports();
      const reportId = `REP-${new Date().getFullYear()}-${inspection.id.replace('LM-', '')}`;
      
      const newReport = {
        id: reportId,
        inspectionId: inspection.id,
        productName: inspection.product?.name || "Commodity",
        category: inspection.product?.category || "Other",
        generatedDate: new Date().toISOString().split('T')[0],
        status: inspection.status === 'compliant' ? 'Compliant' : (inspection.status === 'potential_violation' ? 'Potential Violation' : 'Needs Verification'),
        generatedBy: API.getCurrentUser().fullName,
        location: inspection.location || "Regional Office"
      };

      // Check if exists
      const existingIdx = reports.findIndex(r => r.id === reportId || r.inspectionId === inspection.id);
      if (existingIdx >= 0) {
        reports[existingIdx] = newReport;
      } else {
        reports.unshift(newReport);
      }

      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

      this.addNotification({
        title: "Report Generated",
        message: `Official compliance report ${reportId} for ${inspection.product?.name} generated successfully.`,
        type: "info",
        link: `reports.html?id=${reportId}`
      });

      return newReport;
    },

    deleteReport: function(reportId) {
      let reports = this.getReports();
      reports = reports.filter(r => r.id !== reportId);
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      return true;
    },

    // ------------------------------------------
    // NOTIFICATIONS
    // ------------------------------------------
    getNotifications: function() {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    },

    addNotification: function(notif) {
      const list = this.getNotifications();
      const item = {
        id: `notif-${Date.now()}`,
        title: notif.title || "Notification",
        message: notif.message || "",
        time: "Just now",
        type: notif.type || "info",
        unread: true,
        link: notif.link || "#"
      };
      list.unshift(item);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list.slice(0, 20)));
      return item;
    },

    markNotificationsAsRead: function() {
      const list = this.getNotifications().map(n => ({ ...n, unread: false }));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      return list;
    },

    // ------------------------------------------
    // SETTINGS
    // ------------------------------------------
    getSettings: function() {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : getSeedData().settings;
    },

    updateSettings: function(newSettings) {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    },

    // Global Search across IDs, products, manufacturers, reports
    globalSearch: function(query) {
      if (!query || query.trim().length < 2) return [];
      const q = query.toLowerCase();
      const results = [];

      // Search inspections
      this.getInspections().forEach(i => {
        if (i.id.toLowerCase().includes(q) || (i.product?.name && i.product.name.toLowerCase().includes(q))) {
          results.push({
            type: "inspection",
            title: `${i.id} — ${i.product?.name || 'Inspection'}`,
            subtitle: `${i.location} • ${i.date} • ${i.status.replace('_', ' ').toUpperCase()}`,
            url: `results.html?id=${i.id}`
          });
        }
      });

      // Search products
      this.getProducts().forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.manufacturer.toLowerCase().includes(q)) {
          results.push({
            type: "product",
            title: `${p.name} (${p.brand})`,
            subtitle: `Manufacturer: ${p.manufacturer} • ${p.category}`,
            url: `products.html?id=${p.id}`
          });
        }
      });

      // Search reports
      this.getReports().forEach(r => {
        if (r.id.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q)) {
          results.push({
            type: "report",
            title: `${r.id} — ${r.productName}`,
            subtitle: `Generated: ${r.generatedDate} • ${r.status}`,
            url: `reports.html?id=${r.id}`
          });
        }
      });

      return results.slice(0, 8);
    }
  };
})();

// Export globally for script tags
window.API = API;

// ==========================================
// FASTAPI INTEGRATION
// ==========================================
// Set window.LEGALMETRIX_API_URL before loading api.js to override this (for
// example in deployment). The default is the local FastAPI app.
(function connectToBackend(api) {
  const sameOriginApi = window.location.origin && window.location.origin !== 'null'
    ? `${window.location.origin}/app` : 'http://127.0.0.1:8000/app';
  const baseUrl = (window.LEGALMETRIX_API_URL || localStorage.getItem('legalmetrix_api_url') || sameOriginApi).replace(/\/$/, '');
  const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options
    });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || `Request failed (${response.status})`);
    return response.status === 204 ? null : response.json();
  };
  const status = value => ({ violation: 'potential_violation', 'needs-verification': 'needs_verification' }[value] || value || 'needs_verification');
  const apiStatus = value => ({ potential_violation: 'violation', needs_verification: 'needs-verification' }[value] || value);
  const inspection = row => ({
    ...row, id: row.id, date: (row.created_at || '').slice(0, 10), reportedAt: row.created_at,
    product: { name: row.product_name, brand: row.brand, category: row.category, manufacturer: row.manufacturer },
    images: { front: row.image_url, back: row.image_url }, status: status(row.status),
    declarations: row.declarations || {}, violations: row.violations || [], readability: row.readability || {}
  });
  const inspectionPayload = value => ({
    product_name: value.product?.name || value.productName, brand: value.product?.brand || value.brand,
    category: value.product?.category || value.category, manufacturer: value.product?.manufacturer || value.manufacturer,
    retailer: value.retailer, location: value.location, image_url: value.images?.back || value.image_url,
    declarations: value.declarations || {}, violations: value.violations || [], readability: value.readability || {},
    status: apiStatus(value.status), overall_confidence: value.overall_confidence || value.overallConfidence || 0.88
  });
  const product = row => ({ ...row, inspectionsCount: row.total_inspections || 0, compliantCount: row.compliant_count || 0,
    violationCount: row.violation_count || 0, latestStatus: status(row.latest_status), imageUrl: row.image_url,
    lastInspectionDate: (row.last_inspected || '').slice(0, 10) });
  const report = row => ({ ...row, inspectionId: row.inspection_id, productName: row.product_name,
    generatedDate: (row.generated_at || '').slice(0, 10), generatedBy: 'Legal Metrology Inspector' });

  api.getDashboardStats = async () => {
    const stats = await request('/dashboard/stats');
    return { ...stats, recentInspections: (stats.recentInspections || []).map(inspection) };
  };
  api.getInspections = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value && value !== 'all') params.set(key, value); });
    const rows = await request(`/inspections${params.size ? `?${params}` : ''}`);
    return rows.map(inspection);
  };
  api.getInspection = async id => inspection(await request(`/inspections/${encodeURIComponent(id)}`));
  api.createInspection = async value => inspection(await request('/inspections', { method: 'POST', body: JSON.stringify(inspectionPayload(value)) }));
  api.updateInspection = async (id, value) => inspection(await request(`/inspections/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(inspectionPayload(value)) }));
  api.deleteInspection = async id => request(`/inspections/${encodeURIComponent(id)}`, { method: 'DELETE' });
  api.getProducts = async filters => {
    const params = new URLSearchParams(); Object.entries(filters || {}).forEach(([k, v]) => { if (v && v !== 'all') params.set(k, v); });
    return (await request(`/products${params.size ? `?${params}` : ''}`)).map(product);
  };
  api.getProduct = async id => (await api.getProducts()).find(item => item.id === id) || null;
  api.getReports = async () => (await request('/reports')).map(report);
  api.generateReport = async inspectionId => report(await request('/reports', { method: 'POST', body: JSON.stringify({ inspection_id: inspectionId }) }));
  api.deleteReport = async id => request(`/reports/${encodeURIComponent(id)}`, { method: 'DELETE' });
  api.apiBaseUrl = baseUrl;
})(window.API);
