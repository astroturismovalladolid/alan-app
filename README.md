# ALAN · Artificial Light At Night

Aplicación web de **ciencia ciudadana** para registrar y mapear la contaminación lumínica. Cualquiera puede subir una foto del cielo nocturno desde su ubicación, valorar la gravedad de la contaminación lumínica y consultar en un mapa interactivo las observaciones de la comunidad. La app incluye análisis de imágenes con IA y es instalable como PWA en el móvil.

## Qué hace

- **Observaciones geolocalizadas:** subida de fotos con ubicación, descripción y valoración de la contaminación lumínica. Se puede participar con cuenta o de forma **anónima**.
- **Mapa interactivo** (Leaflet) con todas las observaciones y su ficha de detalle (`/images/[id]`).
- **Análisis con IA** (Genkit + Gemini 2.5 Flash): estima la intensidad de la contaminación lumínica de una imagen.
- **Asistente de captura** (`/tools`): sugiere los ajustes de cámara óptimos para fotografiar el cielo y que la imagen sea útil.
- **Comunidad:** inicio de sesión con Google (Firebase Auth), valoración de observaciones de otros usuarios y denuncia de contenido inadecuado.
- **Privacidad:** panel de privacidad en el perfil del usuario.
- **Multilingüe:** español, inglés y francés (`src/locales/`).
- **PWA:** instalable en iOS y Android, con tema oscuro (ver [MOBILE_GUIDE.md](MOBILE_GUIDE.md)).
- **Páginas legales:** privacidad, términos y cookies.

## Tecnología

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) + React 18 + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui (Radix UI) |
| Mapas | Leaflet + React Leaflet |
| Formularios | React Hook Form + Zod |
| Backend | Firebase: Auth, Firestore y Cloud Storage |
| IA | Genkit con el plugin de Google AI (`googleai/gemini-2.5-flash`) |
| Pruebas | Jest |
| Despliegue | Firebase App Hosting |

## Estructura

```
src/
  app/            Rutas: inicio (mapa), /upload, /images/[id], /tools, /login,
                  /privacy, /terms, /cookies y la API /api/observations
  ai/             Configuración de Genkit y los flujos de IA (src/ai/flows/)
  components/     Mapa, ventana de observación, valoración con estrellas y UI
  firebase/       Inicialización y utilidades de Firebase
  lib/            Servicio de observaciones, límite de peticiones, utilidades
  locales/        Traducciones (es, en, fr)
firestore.rules   Reglas de seguridad de Firestore
storage.rules     Reglas de seguridad de Cloud Storage
apphosting.yaml   Configuración de Firebase App Hosting
docs/blueprint.md Diseño original de la aplicación
```

## Puesta en marcha

Requisitos: **Node.js 18.18 o superior** (recomendado 20) y un proyecto de Firebase con Authentication, Firestore y Storage activados (ver [FIREBASE_SETUP.md](FIREBASE_SETUP.md)).

```bash
npm install
```

Crea un archivo `.env.local` en la raíz (no se sube al repositorio) con la configuración web de tu proyecto de Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Para las funciones de IA, el plugin de Genkit necesita además una clave de la API de Gemini en `GEMINI_API_KEY`. Los valores de Firebase están en *Configuración del proyecto › Tus apps* de la consola de Firebase.

Después:

```bash
npm run dev
```

La aplicación queda en <http://localhost:9002>.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack, puerto 9002) |
| `npm run build` / `npm start` | Compilación y servidor de producción |
| `npm test` | Pruebas con Jest (`test:watch`, `test:coverage`) |
| `npm run typecheck` | Comprobación de tipos con TypeScript |
| `npm run lint` | Linter de Next.js |
| `npm run genkit:dev` | Interfaz de desarrollo de Genkit para probar los flujos de IA |
| `npm run generate-icons` | Regenera los iconos de la PWA |

## Rendimiento y límites

- `GET /api/observations` usa **ISR con revalidación cada 5 minutos**: reduce las lecturas de Firestore y se sirve desde la CDN. Ver [FIREBASE_OPTIMIZATION_GUIDE.md](FIREBASE_OPTIMIZATION_GUIDE.md).
- Las Server Actions tienen un **limitador de peticiones en memoria** (`src/lib/rate-limit.ts`). Funciona porque `apphosting.yaml` fija `maxInstances: 1`; si se aumenta el número de instancias, hay que sustituirlo por un almacén compartido.

## Seguridad

Las reglas de [`firestore.rules`](firestore.rules) y [`storage.rules`](storage.rules) controlan quién puede leer y escribir:

- Cualquiera puede **ver** observaciones e imágenes.
- Se pueden **crear** observaciones con cuenta o de forma anónima (sin campo `authorId`).
- Solo el autor puede **editar la descripción** de su observación (mínimo 10 caracteres) o **borrarla**; las anónimas no se pueden borrar.
- Cualquier usuario autenticado puede **valorar** (solo su propia valoración) y **denunciar** una observación.
- Cada usuario solo puede crear, modificar y borrar **su propio perfil**.

 Las claves de `NEXT_PUBLIC_FIREBASE_*` son identificadores públicos del proyecto; la protección real está en esas reglas. No subas `.env.local` ni claves de la API de Gemini al repositorio.

## Despliegue

Se despliega con **Firebase App Hosting** conectado a este repositorio. Los pasos, incluida la configuración de variables de entorno, están en [DEPLOYMENT.md](DEPLOYMENT.md).

## Más documentación

- [docs/blueprint.md](docs/blueprint.md): diseño y guía de estilo originales.
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md): configuración de Firebase paso a paso.
- [DEPLOYMENT.md](DEPLOYMENT.md): despliegue en App Hosting.
- [MOBILE_GUIDE.md](MOBILE_GUIDE.md): instalación como PWA en móviles.
- [FIREBASE_OPTIMIZATION_GUIDE.md](FIREBASE_OPTIMIZATION_GUIDE.md): reducción de costes de Firestore.
- [SOLUCION_IMAGENES.md](SOLUCION_IMAGENES.md): problema de imágenes que no se ven y configuración de la extensión *Resize Images* de Firebase (`extensions/`).
- [CUMPLIMIENTO_RGPD_AEPD.md](CUMPLIMIENTO_RGPD_AEPD.md): evaluación de cumplimiento del RGPD.

## Autor

Alejandro Catalá Espí · [github.com/alexcatesp](https://github.com/alexcatesp)
