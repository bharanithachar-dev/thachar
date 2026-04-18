const STORAGE_KEY = "thachar-estimate-pdf-v3";

const defaultState = {
  company: {
    name: "Thachar Decors Private Limited",
    address: "NSR Nagar, Kannapalayam, Kamaraj Nagar, Chennai, Tamil Nadu 600071, India",
    phone: "+91-97898 77368",
    email: "sales@thachardecors.com"
  },
  packages: [
    {
      id: "silver",
      name: "Silver",
      ratePerSqft: 1800,
      timeline: "12 days",
      paymentUrl: "https://rzp.io/l/silver-package-demo",
      description: "Budget-friendly package for elegant and practical execution.",
      materials: [
        "Standard plywood and laminate finish",
        "Factory-finished structure",
        "Basic hardware and fittings"
      ],
      paymentTerms: [
        "20% advance payment to confirm order",
        "50% before production",
        "30% before final delivery"
      ],
      terms: [
        "Offer valid for 7 days from quotation date",
        "Transport outside city limits will be extra",
        "Additional customization will be charged separately"
      ]
    },
    {
      id: "gold",
      name: "Gold",
      ratePerSqft: 2350,
      timeline: "15 days",
      paymentUrl: "https://rzp.io/l/gold-package-demo",
      description: "Premium package with upgraded finish and richer detailing.",
      materials: [
        "Premium laminate finish and decorative panels",
        "Enhanced hardware and fittings",
        "Better finishing and detailing"
      ],
      paymentTerms: [
        "25% advance payment to block order",
        "50% before production",
        "25% before handover"
      ],
      terms: [
        "Offer valid for 7 days from quotation date",
        "Client approval required before production",
        "Special custom items are additional"
      ]
    },
    {
      id: "diamond",
      name: "Diamond",
      ratePerSqft: 3100,
      timeline: "20 days",
      paymentUrl: "https://rzp.io/l/diamond-package-demo",
      description: "Luxury package with premium styling and top-tier finish.",
      materials: [
        "Premium decorative finish and structures",
        "Luxury fittings and details",
        "Dedicated finishing supervision"
      ],
      paymentTerms: [
        "25% advance payment on confirmation",
        "50% before premium inventory purchase",
        "25% before completion"
      ],
      terms: [
        "Offer valid for 7 days from quotation date",
        "Premium inventory booking starts after advance payment",
        "Major revisions may change the estimate"
      ]
    }
  ],
  projects: [
    {
      id: "EST26-0223",
      customerName: "Mr. Santhosh Venkatesh",
      phone: "+91-9789877368",
      location: "K. K. Nagar, Chennai",
      quoteDate: "2026-04-18",
      validDays: 7,
      status: "Draft",
      selectedPackageId: "",
      items: [
        {
          name: "KITCHEN UNDER BOX",
          description: "Kitchen lower cabinet box",
          width: 13.5,
          height: 2.75,
          unit: "feet",
          qty: 1
        },
        {
          name: "KITCHEN TOP BOX",
          description: "Kitchen top box section",
          width: 14.5,
          height: 2,
          unit: "feet",
          qty: 1
        },
        {
          name: "KITCHEN UNDER FRAME",
          description: "Kitchen frame and shutter support",
          width: 11,
          height: 2.5,
          unit: "feet",
          qty: 1
        }
      ]
    }
  ]
};

let state = loadState();
let ui = {
  section: "dashboard",
  editingProjectId: null
};

const app = document.getElementById("app");

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(defaultState);
    }
    const parsed = JSON.parse(raw);
    return {
      company: { ...defaultState.company, ...(parsed.company || {}) },
      packages: Array.isArray(parsed.packages) ? parsed.packages : structuredClone(defaultState.packages),
      projects: Array.isArray(parsed.projects) ? parsed.projects : structuredClone(defaultState.projects)
    };
  } catch (error) {
    console.error(error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

function convertToSqft(width, height, unit) {
  const w = Number(width || 0);
  const h = Number(height || 0);
  if (!w || !h) {
    return 0;
  }
  if (unit === "feet") {
    return w * h;
  }
  if (unit === "inch") {
    return (w * h) / 144;
  }
  if (unit === "mm") {
    return (w * h) * 0.0000107639;
  }
  return 0;
}

function formatMeasure(item) {
  return `${item.width} x ${item.height} ${item.unit}`;
}

function itemsToText(items) {
  return (items || []).map((item) => [
    item.name || "",
    item.description || "",
    item.width || "",
    item.height || "",
    item.unit || "feet",
    item.qty || 1
  ].join("|")).join("\n");
}

function textToItems(text) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name = "", description = "", width = "", height = "", unit = "feet", qty = "1"] = line.split("|").map((part) => part.trim());
    return {
      name,
      description,
      width: Number(width || 0),
      height: Number(height || 0),
      unit: unit || "feet",
      qty: Number(qty || 1)
    };
  });
}

function getProjectById(id) {
  return state.projects.find((item) => item.id === id);
}

function getPackageById(id) {
  return state.packages.find((item) => item.id === id);
}

function computeProjectArea(items) {
  return (items || []).reduce((sum, item) => {
    return sum + (convertToSqft(item.width, item.height, item.unit) * Number(item.qty || 1));
  }, 0);
}

function buildPackageEstimate(project, pkg) {
  const detailedItems = (project.items || []).map((item) => {
    const areaSqft = convertToSqft(item.width, item.height, item.unit) * Number(item.qty || 1);
    const amount = Math.round(areaSqft * Number(pkg.ratePerSqft || 0));
    return {
      ...item,
      areaSqft,
      rate: Number(pkg.ratePerSqft || 0),
      amount
    };
  });

  const subtotal = detailedItems.reduce((sum, item) => sum + item.amount, 0);
  const advance = Math.round(subtotal * 0.2);

  return {
    ...pkg,
    detailedItems,
    subtotal,
    total: subtotal,
    advance
  };
}

function buildProjectViewModel(project) {
  const areaSqft = computeProjectArea(project.items || []);
  const offers = state.packages.map((pkg) => buildPackageEstimate(project, pkg));
  return {
    ...project,
    areaSqft,
    validUntil: addDays(project.quoteDate, project.validDays),
    offers
  };
}

function getRouteParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    quote: params.get("quote"),
    pkg: params.get("pkg")
  };
}

function customerLink(projectId) {
  const url = new URL(window.location.href);
  url.searchParams.set("quote", projectId);
  url.searchParams.delete("pkg");
  return url.toString();
}

function detailLink(projectId, packageId) {
  const url = new URL(window.location.href);
  url.searchParams.set("quote", projectId);
  url.searchParams.set("pkg", packageId);
  return url.toString();
}

function showToast(message) {
  const oldToast = document.querySelector(".toast");
  if (oldToast) {
    oldToast.remove();
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2600);
}

function render() {
  const route = getRouteParams();
  if (route.quote) {
    renderCustomerFlow(route.quote, route.pkg);
  } else {
    renderAdminPortal();
  }
}

function renderAdminPortal() {
  app.innerHTML = `
    <div class="shell">
      <section class="hero">
        <div class="eyebrow">Estimate Software</div>
        <h1>${escapeHtml(state.company.name)}</h1>
        <p class="hero-copy">Enter estimate items like Kitchen Under Box, width, height, and unit. The software auto-calculates sqft and creates Silver, Gold, Diamond totals.</p>
        <div class="hero-meta">
          <span class="tag">${escapeHtml(state.company.phone)}</span>
          <span class="tag">${escapeHtml(state.company.email)}</span>
          <span class="tag">${state.projects.length} estimates</span>
        </div>
      </section>

      <div class="layout">
        <aside class="sidebar">
          <section class="panel">
            <div class="panel-header">
              <div>
                <div class="eyebrow">Sections</div>
                <h2 class="section-title">Admin Portal</h2>
              </div>
            </div>
            <div class="sidebar-nav">
              ${navButton("dashboard", "Dashboard")}
              ${navButton("company", "Company")}
              ${navButton("packages", "Package Rates")}
              ${navButton("projects", "Estimates")}
            </div>
          </section>

          <section class="panel">
            <div class="section-header">
              <div>
                <div class="eyebrow">Quick Action</div>
                <h2 class="section-title">Start</h2>
              </div>
            </div>
            <div class="actions-row">
              <button class="btn" data-action="new-project">New Estimate</button>
              <button class="btn-secondary" data-action="reset-demo">Reset Demo</button>
            </div>
          </section>
        </aside>

        <main class="workspace">
          ${renderAdminSection()}
        </main>
      </div>
    </div>
  `;

  bindAdminEvents();
}

function navButton(id, label) {
  const active = ui.section === id ? "active" : "";
  return `<button class="nav-button ${active}" data-nav="${id}">${label}</button>`;
}

function renderAdminSection() {
  if (ui.section === "company") {
    return renderCompanySection();
  }
  if (ui.section === "packages") {
    return renderPackagesSection();
  }
  if (ui.section === "projects") {
    return renderProjectsSection();
  }
  return renderDashboardSection();
}

function renderDashboardSection() {
  return `
    <section class="panel">
      <div class="section-header">
        <div>
          <div class="eyebrow">PDF Style</div>
          <h2 class="section-title">Estimate Workflow</h2>
        </div>
      </div>
      <div class="grid-two">
        <div class="customer-summary-card">
          <h3>1. Enter Estimate Items</h3>
          <p class="muted">Add items like Kitchen Under Box, Kitchen Under Frame, width, height, unit, and quantity.</p>
        </div>
        <div class="customer-summary-card">
          <h3>2. Auto Sqft</h3>
          <p class="muted">Software converts each item to sqft and totals the whole project automatically.</p>
        </div>
        <div class="customer-summary-card">
          <h3>3. 3 Package Offers</h3>
          <p class="muted">Silver, Gold, and Diamond totals are generated from the same item list.</p>
        </div>
        <div class="customer-summary-card">
          <h3>4. PDF Layout</h3>
          <p class="muted">The detailed estimate page is arranged in a printable estimate format for Save as PDF.</p>
        </div>
      </div>
    </section>

    <section class="table-card">
      <div class="table-toolbar">
        <div>
          <div class="eyebrow">Saved Estimates</div>
          <h2 class="section-title">Estimate Table</h2>
        </div>
      </div>
      ${renderProjectsTable()}
    </section>
  `;
}

function renderCompanySection() {
  return `
    <section class="panel">
      <div class="section-header">
        <div>
          <div class="eyebrow">Company</div>
          <h2 class="section-title">Business Details</h2>
        </div>
      </div>
      <form id="company-form" class="field-grid">
        <label class="field">
          <span class="field-label">Company Name</span>
          <input name="name" value="${escapeHtml(state.company.name)}" required>
        </label>
        <label class="field">
          <span class="field-label">Phone</span>
          <input name="phone" value="${escapeHtml(state.company.phone)}" required>
        </label>
        <label class="field">
          <span class="field-label">Email</span>
          <input name="email" value="${escapeHtml(state.company.email)}">
        </label>
        <label class="field full">
          <span class="field-label">Address</span>
          <textarea name="address">${escapeHtml(state.company.address)}</textarea>
        </label>
        <div class="actions-row">
          <button class="btn" type="submit">Save Company</button>
        </div>
      </form>
    </section>
  `;
}

function renderPackagesSection() {
  return `
    <section class="panel">
      <div class="section-header">
        <div>
          <div class="eyebrow">Rates</div>
          <h2 class="section-title">Silver, Gold, Diamond</h2>
        </div>
      </div>
      <form id="packages-form" class="grid-three">
        ${state.packages.map((pkg) => `
          <div class="package-card">
            <h3>${escapeHtml(pkg.name)}</h3>
            <p class="package-description">${escapeHtml(pkg.description)}</p>
            <label class="field">
              <span class="field-label">Rate Per Sqft</span>
              <input name="rate-${escapeHtml(pkg.id)}" type="number" min="0" value="${escapeHtml(pkg.ratePerSqft)}">
            </label>
            <label class="field">
              <span class="field-label">Razorpay Link</span>
              <input name="pay-${escapeHtml(pkg.id)}" value="${escapeHtml(pkg.paymentUrl)}">
            </label>
          </div>
        `).join("")}
        <div class="actions-row">
          <button class="btn" type="submit">Save Package Rates</button>
        </div>
      </form>
    </section>
  `;
}

function renderProjectsSection() {
  const editing = state.projects.find((item) => item.id === ui.editingProjectId) || null;
  const project = editing || {
    id: "",
    customerName: "",
    phone: "",
    location: "",
    quoteDate: new Date().toISOString().slice(0, 10),
    validDays: 7,
    status: "Draft",
    selectedPackageId: "",
    items: []
  };
  const areaSqft = computeProjectArea(project.items || []);

  return `
    <section class="panel">
      <div class="section-header">
        <div>
          <div class="eyebrow">Create Estimate</div>
          <h2 class="section-title">PDF Style Estimate Entry</h2>
          <p class="section-copy">One item per line: Item Name | Description | Width | Height | Unit | Qty</p>
        </div>
      </div>
      <form id="project-form">
        <div class="field-grid field-grid--three">
          <label class="field">
            <span class="field-label">Estimate Number</span>
            <input name="id" value="${escapeHtml(project.id)}" placeholder="EST26-0301" required>
          </label>
          <label class="field">
            <span class="field-label">Customer Name</span>
            <input name="customerName" value="${escapeHtml(project.customerName)}" required>
          </label>
          <label class="field">
            <span class="field-label">Phone</span>
            <input name="phone" value="${escapeHtml(project.phone)}" required>
          </label>
          <label class="field">
            <span class="field-label">Location</span>
            <input name="location" value="${escapeHtml(project.location)}">
          </label>
          <label class="field">
            <span class="field-label">Estimate Date</span>
            <input name="quoteDate" type="date" value="${escapeHtml(project.quoteDate)}" required>
          </label>
          <label class="field">
            <span class="field-label">Valid Days</span>
            <input name="validDays" type="number" min="0" value="${escapeHtml(project.validDays)}">
          </label>
          <label class="field full">
            <span class="field-label">Estimate Items</span>
            <textarea name="items" placeholder="KITCHEN UNDER BOX|Kitchen lower cabinet box|13.5|2.75|feet|1&#10;KITCHEN UNDER FRAME|Kitchen frame|11|2.5|feet|1">${escapeHtml(itemsToText(project.items || []))}</textarea>
            <span class="help-text">Example: KITCHEN UNDER BOX | Kitchen lower cabinet box | 13.5 | 2.75 | feet | 1</span>
          </label>
          <label class="field">
            <span class="field-label">Auto Total Sqft</span>
            <input value="${escapeHtml(areaSqft.toFixed(2))}" readonly>
          </label>
          <label class="field">
            <span class="field-label">Selected Package</span>
            <input value="${escapeHtml(project.selectedPackageId || "-")}" readonly>
          </label>
          <label class="field">
            <span class="field-label">Status</span>
            <input value="${escapeHtml(project.status || "Draft")}" readonly>
          </label>
        </div>
        <div class="actions-row">
          <button class="btn" type="submit">${editing ? "Save Estimate" : "Create Estimate"}</button>
          ${editing ? '<button class="btn-secondary" type="button" data-action="cancel-project-edit">Cancel</button>' : ""}
        </div>
      </form>
    </section>

    <section class="panel">
      <div class="section-header">
        <div>
          <div class="eyebrow">Offer Preview</div>
          <h2 class="section-title">Silver, Gold, Diamond Totals</h2>
        </div>
      </div>
      ${renderOfferPreview(areaSqft)}
    </section>

    <section class="table-card">
      <div class="table-toolbar">
        <div>
          <div class="eyebrow">Share</div>
          <h2 class="section-title">Customer Links</h2>
        </div>
      </div>
      ${renderProjectsTable()}
    </section>
  `;
}

function renderOfferPreview(areaSqft) {
  if (!areaSqft) {
    return '<div class="empty-state">Enter estimate items to calculate sqft and the 3 package totals.</div>';
  }

  return `
    <div class="grid-three">
      ${state.packages.map((pkg) => {
        const total = Math.round(areaSqft * Number(pkg.ratePerSqft || 0));
        return `
          <article class="package-card">
            <h3>${escapeHtml(pkg.name)}</h3>
            <p class="package-description">${escapeHtml(pkg.description)}</p>
            <p class="package-price">${escapeHtml(formatCurrency(total))}</p>
            <div class="package-meta">
              <span>${escapeHtml(areaSqft.toFixed(2))} sqft</span>
              <span>${escapeHtml(formatCurrency(pkg.ratePerSqft))}/sqft</span>
              <span>Advance ${escapeHtml(formatCurrency(Math.round(total * 0.2)))}</span>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderProjectsTable() {
  if (!state.projects.length) {
    return '<div class="empty-state">No estimates yet. Create one and send the customer link.</div>';
  }

  return `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Estimate</th>
            <th>Customer</th>
            <th>Sqft</th>
            <th>Selected</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${state.projects.slice().reverse().map((project) => `
            <tr>
              <td>
                <strong>${escapeHtml(project.id)}</strong><br>
                <span class="table-subtitle">${escapeHtml(formatDate(project.quoteDate))}</span>
              </td>
              <td>${escapeHtml(project.customerName)}</td>
              <td>${escapeHtml(computeProjectArea(project.items || []).toFixed(2))}</td>
              <td>${escapeHtml(project.selectedPackageId || "-")}</td>
              <td>${escapeHtml(project.status || "Draft")}</td>
              <td>
                <div class="actions-row">
                  <button class="btn-ghost" data-action="edit-project" data-id="${escapeHtml(project.id)}">Edit</button>
                  <button class="btn-secondary" data-action="copy-link" data-id="${escapeHtml(project.id)}">Copy Link</button>
                  <button class="btn" data-action="open-customer" data-id="${escapeHtml(project.id)}">Open</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCustomerFlow(projectId, packageId) {
  const project = getProjectById(projectId);
  if (!project) {
    app.innerHTML = `
      <div class="customer-view">
        <section class="customer-card">
          <div class="eyebrow">Estimate Not Found</div>
          <h1 class="customer-title">This estimate link is not available.</h1>
          <div class="customer-actions">
            <a class="btn" href="${escapeHtml(window.location.pathname)}">Open Admin Portal</a>
          </div>
        </section>
      </div>
    `;
    return;
  }

  if (packageId) {
    markSelection(projectId, packageId);
    renderCustomerDetail(projectId, packageId);
    return;
  }

  const vm = buildProjectViewModel(project);
  app.innerHTML = `
    <div class="customer-view">
      <section class="customer-card">
        <div class="estimate-hero">
          <div>
            <div class="eyebrow">Estimate</div>
            <h1 class="customer-title">${escapeHtml(state.company.name)}</h1>
            <p class="hero-copy">${escapeHtml(state.company.address)}</p>
          </div>
        </div>
        <div class="customer-meta">
          <span class="tag">Estimate No: ${escapeHtml(vm.id)}</span>
          <span class="tag">Customer: ${escapeHtml(vm.customerName)}</span>
          <span class="tag">Phone: ${escapeHtml(vm.phone)}</span>
          <span class="tag">Sqft: ${escapeHtml(vm.areaSqft.toFixed(2))}</span>
        </div>
      </section>

      <section class="customer-card">
        <div class="section-header">
          <div>
            <div class="eyebrow">Package Options</div>
            <h2 class="section-title">Silver, Gold, Diamond</h2>
            <p class="section-copy">Choose one package to open the detailed estimate.</p>
          </div>
        </div>
        <div class="grid-three">
          ${vm.offers.map((offer) => `
            <article class="package-card">
              <h3>${escapeHtml(offer.name)}</h3>
              <p class="package-description">${escapeHtml(offer.description)}</p>
              <p class="package-price">${escapeHtml(formatCurrency(offer.total))}</p>
              <div class="package-meta">
                <span>${escapeHtml(formatCurrency(offer.ratePerSqft))}/sqft</span>
                <span>Advance ${escapeHtml(formatCurrency(offer.advance))}</span>
                <span>${escapeHtml(offer.timeline)}</span>
              </div>
              <div class="package-actions">
                <a class="btn" href="${escapeHtml(detailLink(vm.id, offer.id))}">Open Detailed Estimate</a>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCustomerDetail(projectId, packageId) {
  const project = getProjectById(projectId);
  const pkg = getPackageById(packageId);
  if (!project || !pkg) {
    renderCustomerFlow(projectId, "");
    return;
  }

  const vm = buildProjectViewModel(project);
  const offer = buildPackageEstimate(project, pkg);

  app.innerHTML = `
    <div class="customer-view">
      <section class="customer-card">
        <div class="estimate-hero">
          <div>
            <div class="eyebrow">Detailed Estimate</div>
            <h1 class="customer-title">${escapeHtml(state.company.name)}</h1>
            <p class="hero-copy">${escapeHtml(state.company.address)}</p>
          </div>
          <div class="customer-actions">
            <button class="btn-secondary" data-action="print-estimate" type="button">Print / Save PDF</button>
            <a class="btn" href="${escapeHtml(pkg.paymentUrl)}" target="_blank" rel="noopener noreferrer">Accept & Pay</a>
          </div>
        </div>
        <div class="customer-grid">
          <div class="customer-summary-card">
            <span class="summary-label">Estimate No</span>
            <strong>${escapeHtml(vm.id)}</strong>
          </div>
          <div class="customer-summary-card">
            <span class="summary-label">Estimate Date</span>
            <strong>${escapeHtml(formatDate(vm.quoteDate))}</strong>
          </div>
          <div class="customer-summary-card">
            <span class="summary-label">Bill To</span>
            <strong>${escapeHtml(vm.customerName)}</strong>
          </div>
          <div class="customer-summary-card">
            <span class="summary-label">Phone</span>
            <strong>${escapeHtml(vm.phone)}</strong>
          </div>
        </div>
      </section>

      <section class="customer-card">
        <div class="estimate-summary">
          <div class="summary-card">
            <span class="summary-label">Package</span>
            <strong>${escapeHtml(pkg.name)}</strong>
          </div>
          <div class="summary-card">
            <span class="summary-label">Offer Price</span>
            <strong>${escapeHtml(formatCurrency(offer.total))}</strong>
          </div>
          <div class="summary-card">
            <span class="summary-label">Advance Payment</span>
            <strong>${escapeHtml(formatCurrency(offer.advance))}</strong>
          </div>
          <div class="summary-card">
            <span class="summary-label">Completion Time</span>
            <strong>${escapeHtml(pkg.timeline)}</strong>
          </div>
        </div>

        <div class="quote-grid">
          <div class="estimate-table-card">
            <div class="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item & Description</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Sqft</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${offer.detailedItems.map((item, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>
                        <span class="item-name">${escapeHtml(item.name)}</span>
                        <span class="item-description">${escapeHtml(item.description)}</span>
                      </td>
                      <td>${escapeHtml(formatMeasure(item))}</td>
                      <td>${escapeHtml(String(item.qty || 1))}</td>
                      <td>${escapeHtml(item.areaSqft.toFixed(2))}</td>
                      <td>${escapeHtml(formatCurrency(item.rate))}</td>
                      <td>${escapeHtml(formatCurrency(item.amount))}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <div class="totals-card">
            <div class="totals-row">
              <span>Sub Total</span>
              <strong>${escapeHtml(formatCurrency(offer.subtotal))}</strong>
            </div>
            <div class="totals-row">
              <span>Discount</span>
              <strong>${escapeHtml(formatCurrency(0))}</strong>
            </div>
            <div class="totals-row total">
              <span>Total</span>
              <strong>${escapeHtml(formatCurrency(offer.total))}</strong>
            </div>
            <div class="totals-row">
              <span>Total Sqft</span>
              <strong>${escapeHtml(vm.areaSqft.toFixed(2))}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="customer-card">
        <div class="grid-three">
          <div class="quote-section">
            <h3>Materials Specification</h3>
            <ul class="list">${pkg.materials.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div class="quote-section">
            <h3>Payment Terms</h3>
            <ul class="list">${pkg.paymentTerms.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div class="quote-section">
            <h3>Terms & Conditions</h3>
            <ul class="list">${pkg.terms.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        </div>
      </section>
    </div>
  `;

  bindCustomerEvents();
}

function markSelection(projectId, packageId) {
  const project = getProjectById(projectId);
  if (!project) {
    return;
  }
  project.selectedPackageId = packageId;
  project.status = "Package Selected";
  saveState();
}

function bindAdminEvents() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      ui.section = button.dataset.nav;
      render();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id));
  });

  const companyForm = document.getElementById("company-form");
  if (companyForm) {
    companyForm.addEventListener("submit", handleCompanySubmit);
  }

  const packagesForm = document.getElementById("packages-form");
  if (packagesForm) {
    packagesForm.addEventListener("submit", handlePackagesSubmit);
  }

  const projectForm = document.getElementById("project-form");
  if (projectForm) {
    projectForm.addEventListener("submit", handleProjectSubmit);
  }
}

function bindCustomerEvents() {
  document.querySelectorAll("[data-action='print-estimate']").forEach((button) => {
    button.addEventListener("click", () => window.print());
  });
}

function handleAction(action, id) {
  if (action === "new-project") {
    ui.section = "projects";
    ui.editingProjectId = null;
    render();
    return;
  }
  if (action === "edit-project") {
    ui.section = "projects";
    ui.editingProjectId = id;
    render();
    return;
  }
  if (action === "cancel-project-edit") {
    ui.editingProjectId = null;
    render();
    return;
  }
  if (action === "copy-link") {
    copyLink(id);
    return;
  }
  if (action === "open-customer") {
    window.location.href = customerLink(id);
    return;
  }
  if (action === "reset-demo") {
    state = structuredClone(defaultState);
    saveState();
    ui = { section: "dashboard", editingProjectId: null };
    render();
    showToast("Demo data restored");
  }
}

function handleCompanySubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.company = {
    name: form.get("name")?.toString().trim() || "",
    phone: form.get("phone")?.toString().trim() || "",
    email: form.get("email")?.toString().trim() || "",
    address: form.get("address")?.toString().trim() || ""
  };
  saveState();
  render();
  showToast("Company updated");
}

function handlePackagesSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.packages = state.packages.map((pkg) => ({
    ...pkg,
    ratePerSqft: Number(form.get(`rate-${pkg.id}`) || 0),
    paymentUrl: form.get(`pay-${pkg.id}`)?.toString().trim() || ""
  }));
  saveState();
  render();
  showToast("Package rates updated");
}

function handleProjectSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = {
    id: form.get("id")?.toString().trim() || "",
    customerName: form.get("customerName")?.toString().trim() || "",
    phone: form.get("phone")?.toString().trim() || "",
    location: form.get("location")?.toString().trim() || "",
    quoteDate: form.get("quoteDate")?.toString().trim() || "",
    validDays: Number(form.get("validDays") || 7),
    status: "Draft",
    selectedPackageId: "",
    items: textToItems(form.get("items")?.toString() || "")
  };

  const existingIndex = state.projects.findIndex((item) => item.id === ui.editingProjectId);
  if (existingIndex >= 0) {
    const current = state.projects[existingIndex];
    state.projects[existingIndex] = {
      ...current,
      ...payload,
      status: current.status,
      selectedPackageId: current.selectedPackageId
    };
    showToast("Estimate updated");
  } else {
    state.projects.push(payload);
    showToast("Estimate created");
  }

  ui.editingProjectId = null;
  saveState();
  render();
}

async function copyLink(projectId) {
  const link = customerLink(projectId);
  try {
    await navigator.clipboard.writeText(link);
    showToast("Customer link copied");
  } catch (error) {
    console.error(error);
    showToast(link);
  }
}

render();
