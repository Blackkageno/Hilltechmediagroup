import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = { 
  apiKey: "AIzaSyCjFL4edy1fX9rprfCZ9-MYavdsk9hGJwc", 
  authDomain: "hilltech.firebaseapp.com", 
  databaseURL: "https://hilltech-default-rtdb.firebaseio.com", 
  projectId: "hilltech", 
  storageBucket: "hilltech.firebasestorage.app", 
  messagingSenderId: "406255325932", 
  appId: "1:406255325932:web:20191ba3bb7aec64100bc9", 
  measurementId: "G-9W4HF2FGL6" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

(() => {
  const $ = s => document.querySelector(s);

  const menu = $(".menu"), nav = $(".nav");
  menu?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", open);
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

  const progress = $(".progress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${h ? (scrollY / h) * 100 : 0}%`;
  }, { passive: true });

  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("visible");
  }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  async function loadPortfolio() {
    const box = $("#portfolioGrid");
    if (!box) return;
    try {
      const snap = await get(ref(db, "portfolio"));
      const projects = Object.entries(snap.val() || {}).map(([id, val]) => ({ id, ...val }));
      box.innerHTML = projects.map((p, i) => `
        <article class="project-card reveal visible">
          <div class="project-image project-${(i % 4) + 1}"><span>${String(i + 1).padStart(2,"0")}</span><b>${escapeHtml(p.category)}</b></div>
          <div class="project-info"><p>${escapeHtml(p.category)}</p><h3>${escapeHtml(p.title)}</h3><span>${escapeHtml(p.description)}</span></div>
        </article>`).join("") || `<p class="muted">No portfolio projects available yet.</p>`;
    } catch (err) {
      console.error("Error loading portfolio:", err);
    }
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function setMinDate() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const date = $("#bookingForm input[name=event_date]");
    if (date) date.min = d.toISOString().slice(0,10);
  }

  function config() {
    const whatsappNumber = "254700000000"; // Replace with your actual WhatsApp number if needed
    const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Hilltech Media Group! I would like to discuss a project.")}`;
    ["#whatsappLink","#floatingWhatsApp"].forEach(s => { const el = $(s); if (el) el.href = href; });
  }

  async function handleBooking(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const statusEl = $("#bookingStatus");
    const formData = new FormData(form);
    
    // Honeypot check
    if (formData.get("website")) return;

    statusEl.textContent = "Sending booking request…";
    statusEl.className = "status";
    
    try {
      await set(push(ref(db, "bookings")), {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        service: formData.get("service"),
        event_date: formData.get("event_date"),
        event_time: formData.get("event_time"),
        location: formData.get("location"),
        budget: formData.get("budget"),
        details: formData.get("details"),
        status: "Pending",
        created_at: new Date().toISOString()
      });
      statusEl.textContent = "Booking request sent successfully! We will contact you soon.";
      statusEl.className = "status success";
      form.reset();
    } catch (err) {
      statusEl.textContent = "Failed to send request. Please try again.";
      statusEl.className = "status error";
    }
  }

  async function handleContact(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const statusEl = $("#contactStatus");
    const formData = new FormData(form);

    // Honeypot check
    if (formData.get("website")) return;

    statusEl.textContent = "Sending message…";
    statusEl.className = "status";

    try {
      await set(push(ref(db, "enquiries")), {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        service: formData.get("service"),
        message: formData.get("message"),
        created_at: new Date().toISOString()
      });
      statusEl.textContent = "Message sent successfully!";
      statusEl.className = "status success";
      form.reset();
    } catch (err) {
      statusEl.textContent = "Failed to send message. Please try again.";
      statusEl.className = "status error";
    }
  }

  $("#bookingForm")?.addEventListener("submit", handleBooking);
  $("#contactForm")?.addEventListener("submit", handleContact);

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  setMinDate();
  loadPortfolio();
  config();
})();