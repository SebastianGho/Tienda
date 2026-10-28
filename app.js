import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { CONFIG } from "./config.js";
import { PRODUCTS } from "./products.js";

const app = initializeApp(CONFIG.firebase);
const auth = getAuth(app), db = getFirestore(app);
const $ = s => document.querySelector(s);
const fmt = n => "$ " + n.toLocaleString("es-CO");
const open = id => $(id).classList.add("active");
const close = id => $(id).classList.remove("active");
const toast = t => { const e = $("#toast"); e.textContent = t; e.classList.add("show"); setTimeout(() => e.classList.remove("show"), 3500); };

let cart = JSON.parse(localStorage.getItem("cart") || "{}"), user = null, cat = "todos", q = "", mode = "login";
const byRef = r => PRODUCTS.find(p => p.ref === r);
const saveCart = () => { localStorage.setItem("cart", JSON.stringify(cart)); renderCart(); };

/* ---------- Catálogo ---------- */
function renderGrid() {
  const list = PRODUCTS.filter(p => (cat === "todos" || p.cat === cat) && (p.name + p.ref).toLowerCase().includes(q));
  $("#counterText").textContent = `Mostrando ${list.length} de ${PRODUCTS.length} productos`;
  $("#productGrid").innerHTML = list.map(p => {
    const chips = Object.entries(p.specs).slice(0, 2).map(([k, v]) => `<span class="chip">${k}: ${v}</span>`).join("");
    return `<article class="product-card" data-ref="${p.ref}">
      <div class="card-img-wrapper"><span class="category-tag">${p.cat}</span>
        <img src="videos/${p.img}.jpeg" alt="${p.name}" loading="lazy"></div>
      <div class="card-body"><div><span class="card-ref">REF: ${p.ref}</span>
        <h3 class="card-title">${p.name}</h3><div class="chips">${chips}</div></div>
        <div class="card-footer"><span class="card-price">${p.price ? fmt(p.price) : "Consultar"}</span>
        <div class="card-actions"><button class="btn-detail" data-act="detail">Detalles</button>
        ${p.price ? `<button class="btn-detail btn-add" data-act="add">+</button>` : ""}</div></div></div></article>`;
  }).join("");
}

$("#productGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const ref = b.closest(".product-card").dataset.ref;
  b.dataset.act === "add" ? addToCart(ref) : showDetail(ref);
});
document.querySelectorAll(".filter-btn").forEach(b => b.onclick = () => {
  document.querySelectorAll(".filter-btn").forEach(x => x.classList.remove("active"));
  b.classList.add("active"); cat = b.dataset.category; renderGrid();
});
$("#searchInput").oninput = e => { q = e.target.value.toLowerCase().trim(); renderGrid(); };

function showDetail(ref) {
  const p = byRef(ref);
  $("#modalImage").src = `videos/${p.img}.jpeg`;
  $("#modalRef").textContent = "REF: " + p.ref;
  $("#modalTitle").textContent = p.name;
  $("#modalSpecs").innerHTML = Object.entries(p.specs).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("");
  $("#modalPrice").textContent = p.price ? fmt(p.price) : "Consultar";
  const add = $("#modalAdd"); add.style.display = p.price ? "" : "none"; add.onclick = () => { addToCart(ref); close("#productModal"); };
  $("#modalWspBtn").href = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent(`Hola Selitech, quiero información del producto ${p.name} (REF: ${p.ref})`);
  open("#productModal");
}

/* ---------- Carrito ---------- */
function addToCart(ref) { cart[ref] = (cart[ref] || 0) + 1; saveCart(); toast("Agregado al carrito"); }
const total = () => Object.entries(cart).reduce((s, [r, n]) => s + byRef(r).price * n, 0);

function renderCart() {
  const items = Object.entries(cart).filter(([r]) => byRef(r));
  $("#cartCount").textContent = items.reduce((s, [, n]) => s + n, 0);
  $("#cartItems").innerHTML = items.length ? items.map(([r, n]) => {
    const p = byRef(r);
    return `<div class="cart-row"><img src="videos/${p.img}.jpeg" alt=""><div class="cart-info"><b>${p.name}</b><small>${fmt(p.price)}</small></div>
      <div class="qty"><button data-q="-1" data-r="${r}">−</button><span>${n}</span><button data-q="1" data-r="${r}">+</button></div></div>`;
  }).join("") : `<p class="empty">Tu carrito está vacío.</p>`;
  $("#cartTotal").textContent = fmt(total());
  $("#btnCheckout").disabled = !items.length;
}
$("#cartItems").addEventListener("click", e => {
  const b = e.target.closest("[data-q]"); if (!b) return;
  cart[b.dataset.r] += +b.dataset.q; if (cart[b.dataset.r] <= 0) delete cart[b.dataset.r]; saveCart();
});
$("#btnCart").onclick = () => { showStep("cart"); open("#cartModal"); };
const showStep = s => { $("#stepCart").hidden = s !== "cart"; $("#stepCheckout").hidden = s !== "checkout"; };

$("#btnCheckout").onclick = async () => {
  if (!user) { close("#cartModal"); toast("Inicia sesión para continuar con el pago"); return openAuth("login"); }
  const snap = await getDoc(doc(db, "usuarios", user.uid)); const d = snap.exists() ? snap.data() : {};
  const f = $("#checkoutForm");
  ["nombre", "telefono", "departamento", "ciudad", "direccion", "notas"].forEach(k => f[k].value = d[k] || (k === "nombre" ? user.displayName || "" : ""));
  showStep("checkout");
};
$("#backToCart").onclick = () => showStep("cart");

/* ---------- Pago (Wompi) ---------- */
$("#checkoutForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, btn = $("#btnPay"), data = Object.fromEntries(new FormData(f));
  btn.disabled = true; btn.textContent = "Procesando...";
  try {
    await setDoc(doc(db, "usuarios", user.uid), { ...data, email: user.email }, { merge: true });
    const items = Object.entries(cart).map(([ref, qty]) => ({ ref, nombre: byRef(ref).name, precio: byRef(ref).price, qty }));
    const amountInCents = total() * 100;
    const order = await addDoc(collection(db, "pedidos"), {
      uid: user.uid, email: user.email, items, total: total(), envio: data, estado: "pendiente", creado: serverTimestamp()
    });
    const res = await fetch(CONFIG.signatureEndpoint, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: order.id, amountInCents }) });
    if (!res.ok) throw new Error("No se pudo firmar el pago");
    const { signature } = await res.json();
    const p = new URLSearchParams({
      "public-key": CONFIG.wompiPublicKey, currency: "COP", "amount-in-cents": amountInCents, reference: order.id,
      "signature:integrity": signature, "redirect-url": location.origin + location.pathname,
      "customer-data:email": user.email, "customer-data:full-name": data.nombre, "customer-data:phone-number": data.telefono,
      "shipping-address:address-line-1": data.direccion, "shipping-address:city": data.ciudad,
      "shipping-address:region": data.departamento, "shipping-address:country": "CO", "shipping-address:phone-number": data.telefono
    });
    cart = {}; saveCart();
    location.href = "https://checkout.wompi.co/p/?" + p.toString();
  } catch (err) { console.error(err); toast("Error al procesar el pedido. Intenta de nuevo."); btn.disabled = false; btn.textContent = "Pagar con Wompi"; }
});

/* ---------- Sesión ---------- */
function openAuth(m) {
  mode = m; $("#authTitle").textContent = m === "login" ? "Iniciar sesión" : "Crear cuenta";
  $("#authName").hidden = m === "login"; $("#authSubmit").textContent = m === "login" ? "Entrar" : "Registrarme";
  $("#authSwitch").textContent = m === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión";
  $("#authError").textContent = ""; open("#authModal");
}
$("#authSwitch").onclick = () => openAuth(mode === "login" ? "register" : "login");
$("#authForm").addEventListener("submit", async e => {
  e.preventDefault(); const f = e.target;
  try {
    if (mode === "login") await signInWithEmailAndPassword(auth, f.email.value, f.password.value);
    else { const c = await createUserWithEmailAndPassword(auth, f.email.value, f.password.value);
      await updateProfile(c.user, { displayName: f.nombre.value }); }
    close("#authModal");
  } catch (err) { $("#authError").textContent = "Correo o contraseña inválidos (mínimo 6 caracteres)."; }
});
$("#googleBtn").onclick = () => signInWithPopup(auth, new GoogleAuthProvider()).then(() => close("#authModal")).catch(() => {});
$("#btnUser").onclick = () => user ? (confirm("¿Cerrar sesión?") && signOut(auth)) : openAuth("login");
onAuthStateChanged(auth, u => { user = u; $("#btnUser").textContent = u ? (u.displayName || u.email).split(" ")[0] : "Ingresar"; });

/* ---------- Cierre de modales y retorno de Wompi ---------- */
document.querySelectorAll(".modal-overlay").forEach(m => {
  m.addEventListener("click", e => { if (e.target === m || e.target.closest(".modal-close")) m.classList.remove("active"); });
});
if (new URLSearchParams(location.search).get("id")) { toast("¡Gracias! Recibimos tu pago, te contactaremos para el envío."); history.replaceState({}, "", location.pathname); }

renderGrid(); renderCart();
