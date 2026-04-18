import { useEffect, useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import { PRODUCTS } from "../data/products";

const TABS = ["Overview", "Orders", "Products", "Inventory", "Coupons", "Support", "Medical Review"];

const seedOrders = [
  { id: "AURA-1201", customer: "Mariam Adel", total: 620, status: "Processing" },
  { id: "AURA-1202", customer: "Youssef Fathy", total: 245, status: "Packed" },
  { id: "AURA-1203", customer: "Nour Omar", total: 870, status: "Delivered" },
];

const seedInventory = PRODUCTS.map((item) => ({
  id: item.id,
  name: item.name,
  sku: `SKU-${item.id.toString().padStart(4, "0")}`,
  stock: 8 + item.id * 2,
  threshold: 7,
}));

const seedCoupons = [
  { code: "AURA10", discount: 10, active: true },
  { code: "WELCOME15", discount: 15, active: true },
  { code: "NIGHT20", discount: 20, active: false },
];

const seedTickets = [
  { id: "T-301", customer: "Salma", subject: "Need exchange", priority: "High", status: "Open" },
  { id: "T-302", customer: "Ahmed", subject: "Late delivery", priority: "Medium", status: "Open" },
  { id: "T-303", customer: "Layla", subject: "Lens coating", priority: "Low", status: "Resolved" },
];

const seedMedicalCases = [
  {
    id: "RX-901",
    orderId: "AURA-1201",
    customer: "Mariam Adel",
    type: "Progressive",
    sphereR: -5.5,
    sphereL: -4.75,
    cylR: -2.25,
    cylL: -1.75,
    pd: "63.0",
    risk: "High",
    lensIndex: "1.67",
    material: "High-index resin",
    status: "Pending Review",
    note: "High Rx detected by automated check.",
  },
  {
    id: "RX-902",
    orderId: "AURA-1202",
    customer: "Youssef Fathy",
    type: "Single Vision",
    sphereR: -2.0,
    sphereL: -2.25,
    cylR: -0.75,
    cylL: -0.5,
    pd: "61.5",
    risk: "Low",
    lensIndex: "1.56",
    material: "Polycarbonate",
    status: "Approved",
    note: "Within standard fitting range.",
  },
  {
    id: "RX-903",
    orderId: "AURA-1203",
    customer: "Nour Omar",
    type: "Bifocal",
    sphereR: +1.25,
    sphereL: +0.75,
    cylR: -1.0,
    cylL: -1.25,
    pd: "Dual PD",
    risk: "Medium",
    lensIndex: "1.61",
    material: "Trivex",
    status: "Needs Clarification",
    note: "Request confirmation for dual PD values.",
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [orders, setOrders] = useState(seedOrders);
  const [products, setProducts] = useState(PRODUCTS);
  const [inventory, setInventory] = useState(seedInventory);
  const [coupons, setCoupons] = useState(seedCoupons);
  const [tickets, setTickets] = useState(seedTickets);
  const [medicalCases, setMedicalCases] = useState(seedMedicalCases);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    style: "Square",
    imageData: "",
    imageName: "",
  });
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "" });
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const overview = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const openTickets = tickets.filter((item) => item.status !== "Resolved").length;
    const lowStock = inventory.filter((item) => item.stock <= item.threshold).length;
    const medicalPending = medicalCases.filter((item) => item.status !== "Approved").length;

    return {
      sales: totalSales,
      orders: orders.length,
      lowStock,
      openTickets,
      medicalPending,
    };
  }, [orders, tickets, inventory, medicalCases]);

  const term = searchQuery.trim().toLowerCase();

  const filteredOrders = useMemo(
    () =>
      orders.filter((item) =>
        !term
          ? true
          : `${item.id} ${item.customer} ${item.status}`.toLowerCase().includes(term)
      ),
    [orders, term]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((item) =>
        !term
          ? true
          : `${item.name} ${item.subtitle ?? ""} ${item.style ?? ""}`.toLowerCase().includes(term)
      ),
    [products, term]
  );

  const filteredInventory = useMemo(
    () =>
      inventory.filter((item) =>
        !term ? true : `${item.sku} ${item.name}`.toLowerCase().includes(term)
      ),
    [inventory, term]
  );

  const filteredCoupons = useMemo(
    () => coupons.filter((item) => (!term ? true : item.code.toLowerCase().includes(term))),
    [coupons, term]
  );

  const filteredTickets = useMemo(
    () =>
      tickets.filter((item) =>
        !term
          ? true
          : `${item.id} ${item.customer} ${item.subject} ${item.priority} ${item.status}`
              .toLowerCase()
              .includes(term)
      ),
    [tickets, term]
  );

  const filteredMedicalCases = useMemo(
    () =>
      medicalCases.filter((item) =>
        !term
          ? true
          : `${item.id} ${item.orderId} ${item.customer} ${item.type} ${item.status} ${item.risk} ${item.note}`
              .toLowerCase()
              .includes(term)
      ),
    [medicalCases, term]
  );

  const medicalSummary = useMemo(
    () => ({
      pending: medicalCases.filter((item) => item.status === "Pending Review").length,
      clarification: medicalCases.filter((item) => item.status === "Needs Clarification").length,
      highRisk: medicalCases.filter((item) => item.risk === "High").length,
    }),
    [medicalCases]
  );

  const exportCsv = () => {
    const rowsByTab = {
      Orders: filteredOrders.map((item) => [item.id, item.customer, item.total, item.status]),
      Products: filteredProducts.map((item) => [item.id, item.name, item.style, item.price]),
      Inventory: filteredInventory.map((item) => [item.sku, item.name, item.stock, item.threshold]),
      Coupons: filteredCoupons.map((item) => [item.code, `${item.discount}%`, item.active ? "Active" : "Inactive"]),
      Support: filteredTickets.map((item) => [item.id, item.customer, item.subject, item.priority, item.status]),
      "Medical Review": filteredMedicalCases.map((item) => [
        item.id,
        item.orderId,
        item.customer,
        item.type,
        item.risk,
        item.lensIndex,
        item.material,
        item.status,
        item.note,
      ]),
    };

    const headersByTab = {
      Orders: ["Order", "Customer", "Total", "Status"],
      Products: ["ID", "Name", "Style", "Price"],
      Inventory: ["SKU", "Product", "Stock", "Threshold"],
      Coupons: ["Code", "Discount", "Status"],
      Support: ["Ticket", "Customer", "Subject", "Priority", "Status"],
      "Medical Review": ["Case", "Order", "Customer", "Type", "Risk", "Lens Index", "Material", "Status", "Note"],
    };

    const rows = rowsByTab[activeTab];
    const headers = headersByTab[activeTab];

    if (!rows || !headers) {
      notify("Export is available for data tabs only.", "warning");
      return;
    }

    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `admin-${activeTab.toLowerCase()}-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify(`${activeTab} exported as CSV.`);
  };

  const addProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      notify("Please enter valid product name and price.", "warning");
      return;
    }

    const id = Math.max(...products.map((item) => item.id), 0) + 1;
    const product = {
      id,
      name: newProduct.name.trim(),
      subtitle: "Admin Added",
      price: Number(newProduct.price),
      style: newProduct.style,
      frameMaterial: "Acetate",
      fit: "Medium",
      description: "Draft product created from admin panel.",
      image: newProduct.imageData || products[0]?.image || "",
      colorOptions: products[0]?.colorOptions ?? [],
    };

    setProducts((prev) => [product, ...prev]);
    setInventory((prev) => [
      { id, name: product.name, sku: `SKU-${id.toString().padStart(4, "0")}`, stock: 10, threshold: 7 },
      ...prev,
    ]);
    setNewProduct({ name: "", price: "", style: "Square", imageData: "", imageName: "" });
    notify(`Product ${product.name} added.`);
  };

  const handleProductImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      notify("Please upload a valid image file.", "warning");
      event.target.value = "";
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      notify("Image size should be less than 6 MB.", "warning");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewProduct((prev) => ({
        ...prev,
        imageData: typeof reader.result === "string" ? reader.result : "",
        imageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const addCoupon = () => {
    if (!newCoupon.code.trim() || !newCoupon.discount) {
      notify("Please enter coupon code and discount.", "warning");
      return;
    }

    setCoupons((prev) => [
      { code: newCoupon.code.trim().toUpperCase(), discount: Number(newCoupon.discount), active: true },
      ...prev,
    ]);
    setNewCoupon({ code: "", discount: "" });
    notify("Coupon created successfully.");
  };

  return (
    <main className="main container">
      <PageHero
        eyebrow="Backoffice"
        title="Admin Control Center"
        description="Manage sales, products, stock, coupons, and support operations from one workspace."
      />

      <section className="admin-metrics">
        <article>
          <p>Total Sales</p>
          <strong>EGP {overview.sales}</strong>
        </article>
        <article>
          <p>Orders Today</p>
          <strong>{overview.orders}</strong>
        </article>
        <article>
          <p>Low Stock Items</p>
          <strong>{overview.lowStock}</strong>
        </article>
        <article>
          <p>Open Tickets</p>
          <strong>{overview.openTickets}</strong>
        </article>
        <article>
          <p>Medical Pending</p>
          <strong>{overview.medicalPending}</strong>
        </article>
      </section>

      <section className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "is-active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </section>

      <section className="admin-toolbar">
        <input
          type="search"
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <button type="button" onClick={exportCsv}>
          Export CSV
        </button>
      </section>

      {activeTab === "Overview" && (
        <section className="admin-panel-grid">
          <article className="admin-panel-card">
            <h3>Operational Highlights</h3>
            <ul>
              <li>Top seller today: {products[0]?.name}</li>
              <li>Most common order status: Processing</li>
              <li>Recommended action: Restock low inventory products.</li>
            </ul>
          </article>
          <article className="admin-panel-card">
            <h3>Quick Actions</h3>
            <div className="admin-quick-actions">
              <button type="button" onClick={() => setActiveTab("Products")}>Add Product</button>
              <button type="button" onClick={() => setActiveTab("Coupons")}>Create Coupon</button>
              <button type="button" onClick={() => setActiveTab("Support")}>Open Support Queue</button>
              <button type="button" onClick={() => setActiveTab("Medical Review")}>Open Medical Queue</button>
            </div>
          </article>
        </section>
      )}

      {activeTab === "Orders" && (
        <section className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>EGP {order.total}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(event) => {
                        setOrders((prev) =>
                          prev.map((item) =>
                            item.id === order.id ? { ...item, status: event.target.value } : item
                          )
                        );
                        notify(`Order ${order.id} updated to ${event.target.value}.`);
                      }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === "Products" && (
        <section className="admin-panel-grid admin-products-layout">
          <article className="admin-panel-card admin-panel-card--compact">
            <h3>Add New Product</h3>
            <div className="admin-form-grid">
              <input
                type="text"
                placeholder="Product name"
                value={newProduct.name}
                onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))}
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))}
              />
              <select
                value={newProduct.style}
                onChange={(event) => setNewProduct((prev) => ({ ...prev, style: event.target.value }))}
              >
                <option value="Square">Square</option>
                <option value="Round">Round</option>
                <option value="Cat-eye">Cat-eye</option>
                <option value="Geometric">Geometric</option>
              </select>

              <input type="file" accept="image/*" onChange={handleProductImageUpload} />

              {newProduct.imageData && (
                <div className="admin-image-preview">
                  <img src={newProduct.imageData} alt="New product preview" />
                  <div>
                    <strong>{newProduct.imageName || "Uploaded image"}</strong>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() =>
                        setNewProduct((prev) => ({ ...prev, imageData: "", imageName: "" }))
                      }
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              )}

              <button type="button" className="btn-primary" onClick={addProduct}>
                Save Product
              </button>
            </div>
          </article>
          <article className="admin-panel-card">
            <h3>Product List</h3>
            <div className="admin-mini-list">
              {filteredProducts.slice(0, 8).map((item) => (
                <div key={item.id}>
                  <span>{item.name}</span>
                  <strong>EGP {item.price}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      const approved = window.confirm(`Delete product ${item.name}?`);

                      if (!approved) {
                        return;
                      }

                      setProducts((prev) => prev.filter((product) => product.id !== item.id));
                      setInventory((prev) => prev.filter((stockRow) => stockRow.id !== item.id));
                      notify(`Product ${item.name} removed.`);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === "Inventory" && (
        <section className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.sku}</td>
                  <td>{item.name}</td>
                  <td>{item.stock}</td>
                  <td>{item.threshold}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setInventory((prev) =>
                          prev.map((row) =>
                            row.id === item.id ? { ...row, stock: row.stock + 1 } : row
                          )
                        );
                        notify(`Stock increased for ${item.name}.`);
                      }}
                    >
                      +1
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === "Coupons" && (
        <section className="admin-panel-grid">
          <article className="admin-panel-card">
            <h3>Create Coupon</h3>
            <div className="admin-form-grid">
              <input
                type="text"
                placeholder="Coupon code"
                value={newCoupon.code}
                onChange={(event) => setNewCoupon((prev) => ({ ...prev, code: event.target.value }))}
              />
              <input
                type="number"
                placeholder="Discount %"
                value={newCoupon.discount}
                onChange={(event) => setNewCoupon((prev) => ({ ...prev, discount: event.target.value }))}
              />
              <button type="button" className="btn-primary" onClick={addCoupon}>
                Add Coupon
              </button>
            </div>
          </article>
          <article className="admin-panel-card">
            <h3>Existing Coupons</h3>
            <div className="admin-mini-list">
              {filteredCoupons.map((item) => (
                <div key={item.code}>
                  <span>{item.code}</span>
                  <strong>{item.discount}%</strong>
                  <button
                    type="button"
                    onClick={() => {
                      setCoupons((prev) =>
                        prev.map((coupon) =>
                          coupon.code === item.code
                            ? { ...coupon, active: !coupon.active }
                            : coupon
                        )
                      );
                      notify(
                        `Coupon ${item.code} ${item.active ? "deactivated" : "activated"}.`
                      );
                    }}
                  >
                    {item.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === "Support" && (
        <section className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.customer}</td>
                  <td>{item.subject}</td>
                  <td>{item.priority}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        const approved = window.confirm(`Mark ticket ${item.id} as resolved?`);

                        if (!approved) {
                          return;
                        }

                        setTickets((prev) =>
                          prev.map((ticket) =>
                            ticket.id === item.id ? { ...ticket, status: "Resolved" } : ticket
                          )
                        );
                        notify(`Ticket ${item.id} resolved.`);
                      }}
                    >
                      {item.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === "Medical Review" && (
        <section className="admin-medical-layout">
          <article className="admin-panel-card admin-medical-summary">
            <h3>Medical Queue Summary</h3>
            <div className="admin-medical-kpis">
              <article>
                <p>Pending Review</p>
                <strong>{medicalSummary.pending}</strong>
              </article>
              <article>
                <p>Needs Clarification</p>
                <strong>{medicalSummary.clarification}</strong>
              </article>
              <article>
                <p>High Risk</p>
                <strong>{medicalSummary.highRisk}</strong>
              </article>
            </div>
            <div className="admin-quick-actions">
              <button
                type="button"
                onClick={() => {
                  setMedicalCases((prev) =>
                    prev.map((item) =>
                      item.status === "Pending Review"
                        ? { ...item, status: "Approved", note: "Approved in batch by optician." }
                        : item
                    )
                  );
                  notify("All pending medical cases approved.");
                }}
              >
                Approve All Pending
              </button>
            </div>
          </article>

          <article className="admin-panel-card admin-medical-cases">
            <h3>Medical Review Cases</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Rx Type</th>
                    <th>Rx Snapshot</th>
                    <th>Lens Plan</th>
                    <th>Risk</th>
                    <th>Status</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicalCases.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.orderId}</td>
                      <td>{item.customer}</td>
                      <td>{item.type}</td>
                      <td>
                        R: {item.sphereR}/{item.cylR} <br />
                        L: {item.sphereL}/{item.cylL} <br />
                        PD: {item.pd}
                      </td>
                      <td>
                        <div className="admin-medical-lens-plan">
                          <strong>{item.lensIndex}</strong>
                          <span>{item.material}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-risk-badge admin-risk-badge--${item.risk.toLowerCase()}`}>
                          {item.risk}
                        </span>
                      </td>
                      <td>
                        <select
                          value={item.status}
                          onChange={(event) => {
                            setMedicalCases((prev) =>
                              prev.map((row) =>
                                row.id === item.id ? { ...row, status: event.target.value } : row
                              )
                            );
                            notify(`Case ${item.id} moved to ${event.target.value}.`);
                          }}
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Needs Clarification">Needs Clarification</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        <div className="admin-medical-note">
                          <p>{item.note}</p>
                          <button
                            type="button"
                            onClick={() => {
                              const text = window.prompt("Add or update optician note", item.note ?? "");

                              if (text === null) {
                                return;
                              }

                              setMedicalCases((prev) =>
                                prev.map((row) =>
                                  row.id === item.id ? { ...row, note: text.trim() || "No note." } : row
                                )
                              );
                              notify(`Note updated for ${item.id}.`);
                            }}
                          >
                            Edit Note
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`} key={toast.id}>
          {toast.message}
        </div>
      )}
    </main>
  );
}
