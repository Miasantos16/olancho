// =========================================================
// VISITA OLANCHO - Interactividad
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------- Navbar con fondo al hacer scroll ----------
  const navbar = document.getElementById("navbar");
  const toTop = document.getElementById("toTop");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
    toTop.classList.toggle("show", window.scrollY > 500);
    marcarSeccionActiva();
  });

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Menú móvil ----------
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    menuToggle.textContent = navLinks.classList.contains("open") ? "✕" : "☰";
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.textContent = "☰";
    });
  });

  // ---------- Enlace activo según la sección visible ----------
  const secciones = document.querySelectorAll("section[id]");
  function marcarSeccionActiva() {
    let actual = "";
    secciones.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) actual = sec.id;
    });
    navLinks.querySelectorAll("a").forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + actual);
    });
  }

  marcarSeccionActiva(); // marca la sección correcta al cargar

  // ---------- Animación al aparecer (reveal) ----------
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // ---------- Contadores animados ----------
  const contadores = document.querySelectorAll("[data-count]");
  const observerContador = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const meta = parseInt(el.dataset.count, 10);
      const esAnio = meta > 1000 && meta < 2100;
      const duracion = 1800;
      const inicio = performance.now();

      function animar(ahora) {
        const progreso = Math.min((ahora - inicio) / duracion, 1);
        const valor = Math.floor(progreso * meta);
        el.textContent = esAnio ? valor : valor.toLocaleString("es-HN");
        if (progreso < 1) requestAnimationFrame(animar);
        else el.textContent = esAnio ? meta : (meta >= 10000 ? "+" : "") + meta.toLocaleString("es-HN");
      }
      requestAnimationFrame(animar);
      observerContador.unobserve(el);
    });
  }, { threshold: 0.5 });

  contadores.forEach(c => observerContador.observe(c));

  // ---------- Filtro de lugares turísticos ----------
  const botonesFiltro = document.querySelectorAll(".filter-btn");
  const tarjetas = document.querySelectorAll("#placesGrid .flip-card");

  botonesFiltro.forEach(boton => {
    boton.addEventListener("click", () => {
      botonesFiltro.forEach(b => b.classList.remove("active"));
      boton.classList.add("active");
      const filtro = boton.dataset.filter;

      tarjetas.forEach(card => {
        const categorias = card.dataset.category.split(" ");
        const mostrar = filtro === "todos" || categorias.includes(filtro);
        card.classList.toggle("hide", !mostrar);
        if (mostrar) card.classList.add("visible");
      });
    });
  });

  // ---------- Tarjetas que giran: en celular se giran con un toque ----------
  document.querySelectorAll(".flip-card").forEach(card => {
    card.addEventListener("click", () => {
      if (window.matchMedia("(hover: none)").matches) card.classList.toggle("flipped");
    });
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.classList.toggle("flipped"); }
    });
  });

  // ---------- Galería con lightbox ----------
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  let indice = 0;

  function mostrarImagen(i) {
    indice = (i + items.length) % items.length;
    const item = items[indice];
    lightboxImg.style.backgroundImage = item.style.backgroundImage;
    lightboxCaption.textContent = item.dataset.caption;
  }

  items.forEach((item, i) => {
    item.addEventListener("click", () => {
      mostrarImagen(i);
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  function cerrarLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.getElementById("lightboxClose").addEventListener("click", cerrarLightbox);
  document.getElementById("lightboxPrev").addEventListener("click", () => mostrarImagen(indice - 1));
  document.getElementById("lightboxNext").addEventListener("click", () => mostrarImagen(indice + 1));
  lightbox.addEventListener("click", e => { if (e.target === lightbox) cerrarLightbox(); });

  document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") cerrarLightbox();
    if (e.key === "ArrowLeft") mostrarImagen(indice - 1);
    if (e.key === "ArrowRight") mostrarImagen(indice + 1);
  });

  // ---------- Formulario de contacto (validación) ----------
  const form = document.getElementById("contactForm");
  const formMsg = document.getElementById("formMsg");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const mensaje = document.getElementById("mensaje");
    let valido = true;

    [nombre, correo, mensaje].forEach(campo => {
      const vacio = campo.value.trim() === "";
      campo.classList.toggle("error", vacio);
      if (vacio) valido = false;
    });

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value.trim());
    if (!correoValido) { correo.classList.add("error"); valido = false; }

    if (!valido) {
      formMsg.textContent = "Por favor completa todos los campos con datos válidos.";
      formMsg.className = "form-msg bad";
      return;
    }

    formMsg.textContent = `¡Gracias, ${nombre.value.trim()}! Te contactaremos pronto.`;
    formMsg.className = "form-msg ok";
    form.reset();
  });

  // ---------- Año actual en el footer ----------
  document.getElementById("year").textContent = new Date().getFullYear();
});
