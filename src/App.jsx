import FormularioInscripcion from "./components/FormularioInscripcion";
import ListaJugadores from "./components/ListaJugadores";

export default function App() {
  return (
    <main>
      <h1>🃏 La Guarida del Dragón · Torneos de cartas</h1>
      <div className="columnas">
        <FormularioInscripcion />
        <ListaJugadores />
      </div>
    </main>
  );
}
