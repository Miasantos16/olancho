// =========================================================
// Animación de textos (palabra por palabra o letra por letra)
// Versión en JavaScript puro del componente "TextAnimation".
// =========================================================

/**
 * Divide el texto de un elemento en palabras o letras y lo anima al verse.
 * @param {HTMLElement} el      Elemento a animar
 * @param {Object} opciones     { divideBy: "word" | "letter", delay: segundos }
 */
function animarTexto(el, { divideBy = "word", delay = 0 } = {}) {
  const stagger = divideBy === "letter" ? 0.02 : 0.05;
  let i = 0;

  // Recorre los nodos para conservar etiquetas internas (por ejemplo <span>Olancho</span>)
  function dividir(nodo) {
    Array.from(nodo.childNodes).forEach(hijo => {
      if (hijo.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const partes = divideBy === "letter"
          ? hijo.textContent.split("")
          : hijo.textContent.split(/(\s+)/);

        partes.forEach(parte => {
          if (parte === "") return;
          // En modo palabra, los espacios quedan como texto normal para que el título pueda saltar de línea
          if (divideBy === "word" && /^\s+$/.test(parte)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const caja = document.createElement("span");
          caja.className = "split-part";
          const interior = document.createElement("span");
          interior.className = "split-inner";
          interior.style.setProperty("--i", i++);
          interior.textContent = parte === " " ? " " : parte;
          caja.appendChild(interior);
          frag.appendChild(caja);
        });
        hijo.replaceWith(frag);
      } else if (hijo.nodeType === Node.ELEMENT_NODE) {
        // "Olancho" tiene su propia animación de letras: se anima como un solo bloque
        if (hijo.classList.contains("loader-wrapper")) {
          const caja = document.createElement("span");
          caja.className = "split-part";
          const interior = document.createElement("span");
          interior.className = "split-inner";
          interior.style.setProperty("--i", i++);
          hijo.replaceWith(caja);
          interior.appendChild(hijo);
          caja.appendChild(interior);
          return;
        }
        dividir(hijo);
      }
    });
  }

  el.setAttribute("aria-label", el.textContent.trim()); // los lectores de pantalla leen la frase completa
  dividir(el);
  el.classList.add("text-anim");
  el.style.setProperty("--stagger", stagger + "s");
  el.style.setProperty("--delay", delay + "s");

  // Se anima una sola vez, cuando entra en pantalla
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        el.classList.add("show");
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(el);
}

document.addEventListener("DOMContentLoaded", () => {
  // Título principal: palabra por palabra
  document.querySelectorAll(".hero h1").forEach(el => animarTexto(el, { delay: 0.3 }));

  // Títulos de cada sección: palabra por palabra
  document.querySelectorAll(".section-header h2, .about-text h2, .contact-info h2")
    .forEach(el => animarTexto(el, { delay: 0.15 }));

  // Etiquetas pequeñas (DESTINOS, SABORES...): letra por letra
  document.querySelectorAll(".hero-tag, .section-tag")
    .forEach(el => animarTexto(el, { divideBy: "letter" }));
});
