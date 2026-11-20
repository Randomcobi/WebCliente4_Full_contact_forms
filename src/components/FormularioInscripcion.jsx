import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { esquemaInscripcion, JUEGOS } from "../schemas/jugador";
import { clavesJugadores, crearJugador } from "../services/jugadores";

const valoresIniciales = {
  nick: "",
  email: "",
  edad: "",
  juego: "",
  autorizacionTutor: false,
  aceptaNormas: false,
};

export default function FormularioInscripcion() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaInscripcion),
    defaultValues: valoresIniciales,
    // shouldFocusError (true por defecto): al enviar, pone el foco en el primer campo con error
  });

  const mutacion = useMutation({
    mutationFn: crearJugador,
    onSuccess: () => {
      reset(valoresIniciales);
      // Marca como obsoletas TODAS las queries que empiezan por ["jugadores"]
      // y las que están en pantalla se vuelven a pedir → la lista se actualiza sola
      queryClient.invalidateQueries({ queryKey: clavesJugadores.todas });
    },
  });

  function onSubmit(datos) {
    mutacion.mutate(datos); // solo llega aquí si Zod ha dado el visto bueno
  }

  // Ayuda para no repetir los atributos de accesibilidad en cada campo
  function aria(campo) {
    return {
      "aria-invalid": errors[campo] ? "true" : "false",
      "aria-describedby": errors[campo] ? `error-${campo}` : undefined,
    };
  }

  function mensajeError(campo) {
    if (!errors[campo]) return null;
    return (
      <p id={`error-${campo}`} className="error" role="alert">
        {errors[campo].message}
      </p>
    );
  }

  // Solo pedimos la autorización si el jugador es menor de edad
  const edad = Number(watch("edad"));
  const esMenor = edad > 0 && edad < 18;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>Inscríbete al torneo</h2>

      <div className="campo">
        <label htmlFor="nick">Nick de jugador</label>
        <input id="nick" autoComplete="nickname" {...register("nick")} {...aria("nick")} />
        {mensajeError("nick")}
      </div>

      <div className="campo">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" {...register("email")} {...aria("email")} />
        {mensajeError("email")}
      </div>

      <div className="campo">
        <label htmlFor="edad">Edad</label>
        <input id="edad" type="number" inputMode="numeric" {...register("edad")} {...aria("edad")} />
        {mensajeError("edad")}
      </div>

      <div className="campo">
        <label htmlFor="juego">Juego de cartas</label>
        <select id="juego" {...register("juego")} {...aria("juego")}>
          <option value="">— Elige uno —</option>
          {JUEGOS.map((juego) => (
            <option key={juego} value={juego}>
              {juego}
            </option>
          ))}
        </select>
        {mensajeError("juego")}
      </div>

      {esMenor && (
        <div className="campo">
          <label>
            <input type="checkbox" {...register("autorizacionTutor")} {...aria("autorizacionTutor")} />{" "}
            Tengo autorización de mi madre, padre o tutor
          </label>
          {mensajeError("autorizacionTutor")}
        </div>
      )}

      <div className="campo">
        <label>
          <input type="checkbox" {...register("aceptaNormas")} {...aria("aceptaNormas")} /> Acepto las
          normas del torneo
        </label>
        {mensajeError("aceptaNormas")}
      </div>

      <button type="submit" disabled={mutacion.isPending}>
        {mutacion.isPending ? "Enviando…" : "Inscribirme"}
      </button>

      {/* Regiones de feedback accesibles */}
      {mutacion.isError && (
        <p className="error" role="alert">
          No se pudo completar la inscripción: {mutacion.error.message}
        </p>
      )}
      <p className="ok" role="status">
        {mutacion.isSuccess && `¡Inscripción completada, ${mutacion.data.nick}! 🃏`}
      </p>
    </form>
  );
}
