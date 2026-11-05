// =========================================================
// Pila elástica (Elastic Stack)
// Versión en JavaScript puro del componente "ElasticStack".
// Al pasar el cursor sobre un círculo, crece y empuja a sus vecinos.
// =========================================================

function iniciarPilaElastica(contenedor, { overlap = 26, pushForce = 12 } = {}) {
  const items = Array.from(contenedor.querySelectorAll(".stack-item"));
  const etiqueta = document.getElementById("stackLabel");
  const textoInicial = etiqueta ? etiqueta.textContent : "";
  const total = items.length;

  function actualizar(hoveredIndex) {
    items.forEach((item, i) => {
      let translateX = 0;
      let scale = 1;
      let zIndex = i; // orden base de apilado

      if (hoveredIndex !== null) {
        if (i > hoveredIndex) {
          // el vecino de la derecha se aparta para dejar ver el círculo activo
          translateX = Math.max(
            Math.min(pushForce * (total - i - 1), overlap),
            overlap - pushForce * (i - hoveredIndex - 1)
          );
        } else if (i < hoveredIndex) {
          translateX = -Math.min(pushForce * i, overlap);
        } else {
          scale = 1.25;
          zIndex = 100;
        }
      }

      item.classList.toggle("hovered", i === hoveredIndex);
      item.style.transform = `translateX(${translateX}px) scale(${scale})`;
      item.style.zIndex = zIndex;
    });

    if (etiqueta) {
      etiqueta.textContent = hoveredIndex === null ? textoInicial : items[hoveredIndex].dataset.name;
    }
  }

  items.forEach((item, i) => {
    item.setAttribute("aria-label", item.dataset.name);
    item.addEventListener("mouseenter", () => actualizar(i));
    item.addEventListener("focus", () => actualizar(i));
  });
  contenedor.addEventListener("mouseleave", () => actualizar(null));
  contenedor.addEventListener("focusout", () => actualizar(null));

  actualizar(null);
}

document.addEventListener("DOMContentLoaded", () => {
  const pila = document.getElementById("elasticStack");
  if (!pila) return;
  // en celular los círculos son más pequeños, así que el empuje también
  const movil = window.matchMedia("(max-width: 560px)").matches;
  iniciarPilaElastica(pila, movil ? { overlap: 18, pushForce: 9 } : { overlap: 26, pushForce: 12 });
});
