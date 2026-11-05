// =========================================================
// VISITA OLANCHO - JavaScript de la estructura nueva
// Hace lo mismo que el main.js de la plantilla (menú, aparecer al bajar,
// carrusel y cinta de fotos) pero sin librerías externas, más los
// filtros de lugares, el buscador de la portada y los "Ver todos".
// =========================================================

// ---------- Menú del celular ----------
const nav = document.querySelector("nav");
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

function cerrarMenu() {
  navLinks.classList.remove("open");
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Abrir menú");
}

menuBtn.addEventListener("click", () => {
  const abierto = navLinks.classList.toggle("open");
  nav.classList.toggle("open", abierto);
  menuBtn.setAttribute("aria-expanded", String(abierto));
  menuBtn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});

navLinks.addEventListener("click", e => {
  if (e.target.closest("a")) cerrarMenu();
});

// ---------- Aparecer al bajar (reemplaza a ScrollReveal) ----------
// El contenido siempre está visible; solo se desliza un poco al entrar.
const observador = new IntersectionObserver(entradas => {
  entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => observador.observe(el));

// ---------- Lugares: filtros y "Ver todos" ----------
const lugares = Array.from(document.querySelectorAll("#places-grid .destination__card"));
const botonLugares = document.getElementById("places-more");
const etiquetaFiltro = document.getElementById("filter-label");
const NOMBRES = { todos: "todos los lugares", naturaleza: "naturaleza", historia: "historia", aventura: "aventura" };
let filtroActual = "todos";
let lugaresAbiertos = false;
const INICIALES = 3;

function mostrarLugares() {
  const visibles = lugares.filter(card =>
    filtroActual === "todos" || card.dataset.category.split(" ").includes(filtroActual)
  );
  lugares.forEach(card => { card.hidden = true; });
  visibles.forEach((card, i) => {
    card.hidden = !lugaresAbiertos && filtroActual === "todos" && i >= INICIALES;
  });

  etiquetaFiltro.innerHTML = filtroActual === "todos"
    ? "Mostrando: <strong>todos los lugares</strong>"
    : `Mostrando: <strong>${NOMBRES[filtroActual]}</strong> (${visibles.length} lugares)`;

  // El botón solo hace falta cuando hay lugares escondidos o un filtro puesto
  const hayOcultos = filtroActual === "todos" && !lugaresAbiertos && visibles.length > INICIALES;
  botonLugares.querySelector(".more-label").textContent =
    hayOcultos ? "Ver todos" : (filtroActual === "todos" ? "Ver menos" : "Ver todos los lugares");
}

function filtrar(filtro) {
  filtroActual = filtro;
  lugaresAbiertos = filtro !== "todos";
  mostrarLugares();
}

botonLugares.addEventListener("click", () => {
  if (filtroActual !== "todos") {
    filtroActual = "todos";
    lugaresAbiertos = true;
  } else {
    lugaresAbiertos = !lugaresAbiertos;
  }
  mostrarLugares();
  if (!lugaresAbiertos) document.getElementById("lugares").scrollIntoView({ behavior: "smooth" });
});

// Las tarjetas de "Tipos de viaje" filtran los lugares
document.querySelectorAll(".tour__card[data-filter]").forEach(card => {
  card.addEventListener("click", () => {
    filtrar(card.dataset.filter);
    document.getElementById("lugares").scrollIntoView({ behavior: "smooth" });
  });
});
document.querySelectorAll("[data-filter-link]").forEach(link => {
  link.addEventListener("click", () => {
    filtroActual = "todos";
    lugaresAbiertos = true;
    mostrarLugares();
  });
});

mostrarLugares();

// ---------- Buscador de la portada ----------
const formulario = document.getElementById("trip-form");
const mensaje = document.getElementById("form-msg");

formulario.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("destino").value;
  const fecha = document.getElementById("fecha").value;
  const tarjeta = document.getElementById(id);
  const nombre = document.getElementById("destino").selectedOptions[0].textContent;

  filtroActual = "todos";
  lugaresAbiertos = true;
  mostrarLugares();

  let texto = `Te llevamos a ${nombre}.`;
  if (fecha) {
    const [a, m, d] = fecha.split("-").map(Number);
    const bonita = new Date(a, m - 1, d).toLocaleDateString("es-HN", { day: "numeric", month: "long", year: "numeric" });
    const seca = [12, 1, 2, 3, 4].includes(m);
    texto += ` El ${bonita} es temporada ${seca ? "seca: buena época para ir." : "de lluvias: lleva impermeable."}`;
  }
  mensaje.textContent = texto;

  lugares.forEach(c => c.classList.remove("highlight"));
  tarjeta.classList.add("highlight");
  setTimeout(() => {
    tarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 400);
  setTimeout(() => tarjeta.classList.remove("highlight"), 5000);
});

// ---------- Gastronomía: "Leer más" y "Ver todos" ----------
document.querySelectorAll(".read-more").forEach(boton => {
  boton.addEventListener("click", () => {
    const texto = boton.parentElement.querySelector(".blog__text");
    texto.hidden = !texto.hidden;
    boton.querySelector(".btn-text").textContent = texto.hidden ? "Leer más" : "Leer menos";
  });
});

const platos = Array.from(document.querySelectorAll("#food-grid .blog__card"));
const botonPlatos = document.getElementById("food-more");
let platosAbiertos = false;

function mostrarPlatos() {
  platos.forEach((p, i) => { p.hidden = !platosAbiertos && i >= INICIALES; });
  botonPlatos.querySelector(".more-label").textContent = platosAbiertos ? "Ver menos" : "Ver todos";
}
botonPlatos.addEventListener("click", () => {
  platosAbiertos = !platosAbiertos;
  mostrarPlatos();
  if (!platosAbiertos) document.getElementById("comida").scrollIntoView({ behavior: "smooth" });
});
mostrarPlatos();

// ---------- Carrusel de cultura (reemplaza a Swiper) ----------
const pista = document.getElementById("slider-track");
const diapositivas = Array.from(pista.children);
const puntos = document.getElementById("slider-dots");
let actual = 0;
let automatico;

diapositivas.forEach((_, i) => {
  const punto = document.createElement("button");
  punto.setAttribute("aria-label", `Ir a la tradición ${i + 1}`);
  punto.addEventListener("click", () => { irA(i); reiniciar(); });
  puntos.appendChild(punto);
});

function irA(i) {
  actual = (i + diapositivas.length) % diapositivas.length; // da la vuelta, como loop: true
  pista.style.transform = `translateX(-${actual * 100}%)`;
  Array.from(puntos.children).forEach((p, j) => p.classList.toggle("active", j === actual));
}
function reiniciar() {
  clearInterval(automatico);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    automatico = setInterval(() => irA(actual + 1), 6000);
  }
}

document.getElementById("slider-prev").addEventListener("click", () => { irA(actual - 1); reiniciar(); });
document.getElementById("slider-next").addEventListener("click", () => { irA(actual + 1); reiniciar(); });

const carrusel = document.getElementById("slider");
carrusel.addEventListener("mouseenter", () => clearInterval(automatico));
carrusel.addEventListener("mouseleave", reiniciar);

// Deslizar con el dedo en el celular
let inicioX = null;
carrusel.addEventListener("touchstart", e => { inicioX = e.touches[0].clientX; }, { passive: true });
carrusel.addEventListener("touchend", e => {
  if (inicioX === null) return;
  const diferencia = e.changedTouches[0].clientX - inicioX;
  if (Math.abs(diferencia) > 40) { irA(actual + (diferencia < 0 ? 1 : -1)); reiniciar(); }
  inicioX = null;
});

irA(0);
reiniciar();

// ---------- Cinta de fotos infinita (igual que la plantilla) ----------
const cinta = document.getElementById("banner");
Array.from(cinta.children).forEach(foto => {
  const copia = foto.cloneNode(true);
  copia.setAttribute("aria-hidden", "true");
  copia.alt = "";
  cinta.appendChild(copia);
});
