const BASE_URL = "https://api.disneyapi.dev/character";

let errores = 0;
const MAX_ERRORES = 3;
let circuitoAbierto = false;

function mostrarLoader(mostrar) {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = mostrar ? "block" : "none";
  }
}

function mostrarError(mensaje) {
  const errorDiv = document.getElementById("error");
  if (errorDiv) {
    errorDiv.textContent = mensaje;
  }
}

function limpiarError() {
  const errorDiv = document.getElementById("error");
  if (errorDiv) {
    errorDiv.textContent = "";
  }
}

//agarrar la lista de la apiii
function renderCharacters(personajes) {
  const container = document.getElementById("results");
  if (!container) return;

  container.innerHTML = "";

  personajes.forEach(p => {
    const imagen = p.imageUrl
      ? p.imageUrl
      : "https://via.placeholder.com/300x400?text=Disney";

    container.innerHTML += `
      <div class="card">
        <img src="${imagen}" alt="${p.name}">
        <h3>${p.name}</h3>
      </div>
    `;
  });
}


//cargar los personajes desde la apiiiiiiiiiii
async function fetchCharacters(page, intentos = 2) {

  if (circuitoAbierto) {
    alert("El servicio no está disponible en este momento.\nIntenta más tarde.");
    throw new Error("Circuit breaker activo");
  }

  if (!navigator.onLine) {
    throw new Error("Sin conexión a internet");
  }

  try {
    console.log("Llamando a la API...");
    const response = await fetch(`${BASE_URL}?page=${page}`);

    if (!response.ok) {
      throw new Error("Error en la API");
    }

    errores = 0;
    return await response.json();

  } catch (error) {
    errores++;
    console.warn("Error número:", errores);

    //r
    if (intentos > 0) {
      console.warn("Reintentando petición...");
      return fetchCharacters(page, intentos - 1);
    }

    //cb
    if (errores > MAX_ERRORES) {
      circuitoAbierto = true;

      alert("Se alcanzó el límite de errores.\nLa aplicación dejará de intentar cargar datos por unos segundos.");

      console.log("🚦 Circuit breaker ACTIVADO");

      setTimeout(() => {
        circuitoAbierto = false;
        errores = 0;
        console.log("🔄 Circuit breaker RESETEADO");
      }, 10000); 
    }

    throw error;
  }
}

async function loadRandomCharacters() {
  try {
    limpiarError();
    mostrarLoader(true);

    const randomPage = Math.floor(Math.random() * 20) + 1;
    const data = await fetchCharacters(randomPage);

    renderCharacters(data.data.slice(0, 14));

  } catch (error) {
    mostrarError("No se pudieron cargar los personajes");
    console.error(error.message);
  } finally {
    mostrarLoader(false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnLoad");

  if (btn) {
    btn.addEventListener("click", loadRandomCharacters);
  }
});
