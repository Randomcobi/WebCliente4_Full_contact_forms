# 🃏 La Guarida del Dragón · M4 Full Contact Forms

App en React para que los jugadores de una **tienda de cartas** se inscriban en sus torneos (Magic, Pokémon y Yu-Gi-Oh!) y para ver el listado de inscritos. Los jugadores se guardan en `db.json` a través de json-server, así que siguen ahí aunque recargues o reinicies.

- **React Hook Form** para el formulario (campos no controlados con `register` + `handleSubmit`).
- **Zod** como única fuente de verdad de la validación (conectado con `zodResolver`).
- **TanStack Query v5** para pedir la lista (`useQuery`) y crear inscripciones (`useMutation` + `invalidateQueries`).
- **json-server** como API REST de prueba (`db.json`).

## Cómo arrancarlo

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:3001
npm run api              # terminal 1 → API en http://localhost:3001
npm run dev              # terminal 2 → web en http://localhost:5173
```

## Estructura

```
db.json                              ← "base de datos" de json-server (incluye 1 dato corrupto a propósito)
src/
├── main.jsx                         ← QueryClient + QueryClientProvider
├── App.jsx
├── schemas/jugador.js               ← esquemas Zod (formulario y respuesta del API)
├── services/jugadores.js            ← capa de servicios: fetch, claves de query, safeParse
└── components/
    ├── FormularioInscripcion.jsx    ← RHF + zodResolver + useMutation
    └── ListaJugadores.jsx           ← useQuery con búsqueda
```

## Qué incluye

### Formulario (React Hook Form + Zod)
- Campos: nick, email, edad, juego de cartas (`<select>`), autorización del tutor y aceptación de normas.
- Esquema Zod con:
  - mensajes propios en todos los campos,
  - `regex` y `refine` en el nick (no puede contener «admin»),
  - `z.coerce.number()` para la edad,
  - `z.enum` para el juego y `z.literal(true)` para aceptar las normas,
  - **validación cruzada** con `.refine` en el objeto: si eres menor de 18, la autorización del tutor es obligatoria.
- El checkbox de autorización solo aparece si la edad es menor de 18 (`watch`).

### Accesibilidad
- Cada campo tiene un `<label>` de verdad y `autocomplete` donde tiene sentido.
- `aria-invalid` y `aria-describedby` salen de `formState.errors`.
- Los errores llevan `role="alert"` y el mensaje de éxito va en una región `role="status"`.
- Al enviar con errores, RHF pone el foco en el primer campo con error (`shouldFocusError`).

### Peticiones (TanStack Query)
- Claves centralizadas en `clavesJugadores`:
  - `["jugadores"]` → prefijo común para invalidar todo,
  - `["jugadores", "lista", { busqueda }]` → una entrada de caché por cada búsqueda.
- Tras crear un jugador, `invalidateQueries({ queryKey: ["jugadores"] })` hace que la lista se vuelva a pedir sola.
- La `queryFn` recibe el `signal` y se lo pasa a `fetch`, así se cancelan las búsquedas viejas.
- `fetch` comprueba `response.ok` y el `content-type` antes de hacer `.json()`.

### Estados de la interfaz
| Estado | Dónde |
|---|---|
| Cargando la primera vez | `isPending` en `ListaJugadores.jsx` |
| Error (con botón Reintentar) | `isError` en `ListaJugadores.jsx` |
| Lista vacía | `jugadores.length === 0` |
| Datos | lista `<ul>` |
| Actualizando en segundo plano | `isFetching` |
| Enviando / error / éxito del formulario | `mutacion.isPending`, `isError`, `isSuccess` |

### ★ Bonus: validar la respuesta del API
En `services/jugadores.js` cada jugador que llega del API se valida con `esquemaJugador.safeParse()`.
Los válidos se muestran y los que no cumplen el esquema se descartan y aparecen en un aviso desplegable con el error.

**Demostración:** `db.json` incluye a propósito el jugador `"Corrupto"` (email inválido, edad `"veinte"` y el juego `"Uno"`, que no está en la lista).
Al abrir la app sale el aviso «⚠️ 1 registro(s) del API descartados por datos corruptos» y la lista no se rompe.
La respuesta del `POST` también se valida (con `parse`).

## Declaración de uso de IA

Ver [DECLARACION-IA.md](DECLARACION-IA.md).
