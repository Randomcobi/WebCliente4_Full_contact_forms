import { z } from "zod";
import { esquemaJugador } from "../schemas/jugador";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// Claves de TanStack Query centralizadas en un único sitio.
// Todas empiezan por "jugadores" para poder invalidarlas de golpe.
export const clavesJugadores = {
  todas: ["jugadores"],
  lista: (busqueda) => ["jugadores", "lista", { busqueda }],
};

// Función común: hace el fetch y comprueba la respuesta ANTES de .json()
async function pedir(url, opciones) {
  let respuesta;
  try {
    respuesta = await fetch(url, opciones);
  } catch (error) {
    if (error.name === "AbortError") throw error; // petición cancelada: no es un fallo
    throw new Error("No se pudo conectar con el servidor. ¿Está arrancado (npm run api)?");
  }

  // fetch NO lanza con 404 o 500: hay que mirarlo a mano
  if (!respuesta.ok) {
    throw new Error(`El servidor respondió con un error (${respuesta.status})`);
  }

  // Si nos devuelven una página HTML de error, no intentamos parsearla como JSON
  const tipo = respuesta.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    throw new Error("La respuesta del servidor no es JSON");
  }

  return respuesta.json();
}

// GET /jugadores  (con búsqueda opcional)
// "signal" lo pasa TanStack Query para cancelar la petición si ya no hace falta
export async function obtenerJugadores({ busqueda, signal }) {
  const params = new URLSearchParams({ _sort: "fechaInscripcion", _order: "desc" });
  if (busqueda) params.set("q", busqueda);

  const json = await pedir(`${API_URL}/jugadores?${params}`, { signal });

  // BONUS: validamos cada elemento con safeParse.
  // Los válidos se muestran; los corruptos se apartan y se avisa al usuario.
  const lista = z.array(z.unknown()).parse(json);
  const jugadores = [];
  const corruptos = [];

  for (const elemento of lista) {
    const resultado = esquemaJugador.safeParse(elemento);
    if (resultado.success) {
      jugadores.push(resultado.data);
    } else {
      console.warn("Dato corrupto descartado:", elemento, resultado.error.issues);
      corruptos.push({ elemento, error: z.prettifyError(resultado.error) });
    }
  }

  return { jugadores, corruptos };
}

// POST /jugadores
export async function crearJugador(datos) {
  const nuevo = {
    nick: datos.nick,
    email: datos.email,
    edad: datos.edad,
    juego: datos.juego,
    fechaInscripcion: new Date().toISOString(),
  };

  const json = await pedir(`${API_URL}/jugadores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevo),
  });

  return esquemaJugador.parse(json); // también validamos lo que nos devuelve
}
