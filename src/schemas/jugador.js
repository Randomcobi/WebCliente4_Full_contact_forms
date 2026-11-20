import { z } from "zod";

// Juegos de cartas con torneo en la tienda (la usan el <select> y los dos esquemas)
export const JUEGOS = ["Magic: The Gathering", "Pokémon TCG", "Yu-Gi-Oh!"];

// ─────────────────────────────────────────────────────────────
// 1) Esquema del FORMULARIO: única fuente de verdad de la validación
// ─────────────────────────────────────────────────────────────
export const esquemaInscripcion = z
  .object({
    nick: z
      .string()
      .trim()
      .min(3, "El nick debe tener al menos 3 caracteres")
      .max(16, "El nick no puede pasar de 16 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guion bajo (_)")
      .refine((nick) => !nick.toLowerCase().includes("admin"), {
        message: "Ese nick está reservado",
      }),
    email: z.email("Introduce un email válido"),
    // Los <input> siempre devuelven texto: coerce lo convierte a número
    edad: z.coerce
      .number({ error: "La edad debe ser un número" })
      .int("La edad debe ser un número entero")
      .min(12, "La edad mínima para participar es 12 años")
      .max(99, "Revisa la edad"),
    juego: z.enum(JUEGOS, { error: "Elige un juego de la lista" }),
    autorizacionTutor: z.boolean(),
    aceptaNormas: z.literal(true, {
      error: "Debes aceptar las normas del torneo",
    }),
  })
  // Validación cruzada: depende de dos campos a la vez
  .refine((datos) => datos.edad >= 18 || datos.autorizacionTutor, {
    message: "Los menores de 18 años necesitan la autorización de su tutor",
    path: ["autorizacionTutor"], // el error se pinta en este campo
  });

// ─────────────────────────────────────────────────────────────
// 2) Esquema de la RESPUESTA del API (no nos fiamos del servidor)
// ─────────────────────────────────────────────────────────────
export const esquemaJugador = z.object({
  id: z.union([z.string(), z.number()]),
  nick: z.string(),
  email: z.email(),
  edad: z.number().int(),
  juego: z.enum(JUEGOS),
  fechaInscripcion: z.iso.datetime(),
});
