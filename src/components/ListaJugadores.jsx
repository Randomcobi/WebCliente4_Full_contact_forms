import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { clavesJugadores, obtenerJugadores } from "../services/jugadores";

export default function ListaJugadores() {
  const [busqueda, setBusqueda] = useState("");

  // La búsqueda forma parte de la clave: cada texto tiene su propia entrada en caché
  // y TanStack Query solo muestra los datos de la clave ACTUAL (evita respuestas cruzadas).
  const consulta = useQuery({
    queryKey: clavesJugadores.lista(busqueda),
    queryFn: ({ signal }) => obtenerJugadores({ busqueda, signal }),
    placeholderData: keepPreviousData, // mientras llega la nueva búsqueda, deja la anterior
  });

  return (
    <section>
      <h2>Jugadores inscritos</h2>

      <label htmlFor="busqueda">Buscar jugador</label>
      <input
        id="busqueda"
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Nick, juego…"
      />

      {/* Estado: recargando en segundo plano */}
      <p className="info" aria-live="polite">
        {consulta.isFetching && !consulta.isPending ? "Actualizando…" : ""}
      </p>

      <Contenido consulta={consulta} />
    </section>
  );
}

function Contenido({ consulta }) {
  // Estado 1: cargando por primera vez (aún no hay datos)
  if (consulta.isPending) {
    return <p role="status">Cargando jugadores…</p>;
  }

  // Estado 2: error
  if (consulta.isError) {
    return (
      <div role="alert" className="error">
        <p>No se pudo cargar la lista: {consulta.error.message}</p>
        <button onClick={() => consulta.refetch()}>Reintentar</button>
      </div>
    );
  }

  const { jugadores, corruptos } = consulta.data;

  return (
    <>
      {/* BONUS: aviso de datos corruptos detectados con safeParse */}
      {corruptos.length > 0 && (
        <details className="aviso">
          <summary>
            ⚠️ {corruptos.length} registro(s) del API descartados por datos corruptos
          </summary>
          {corruptos.map(({ elemento, error }, i) => (
            <pre key={i}>
              {JSON.stringify(elemento)}
              {"\n"}
              {error}
            </pre>
          ))}
        </details>
      )}

      {/* Estado 3: éxito pero vacío */}
      {jugadores.length === 0 ? (
        <p>No hay jugadores que coincidan.</p>
      ) : (
        // Estado 4: éxito con datos
        <ul className="lista">
          {jugadores.map((j) => (
            <li key={j.id}>
              <strong>{j.nick}</strong> — {j.juego} · {j.edad} años
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
