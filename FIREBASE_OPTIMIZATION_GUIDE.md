# Firebase Storage Optimization Guide

## Objetivo
Reducir costes de **Egress (ancho de banda)** y mejorar latencia mediante:
- Generación automática de thumbnails en formato WebP
- Políticas de caché agresivas
- Lazy loading en el frontend

## Paso 1: Instalar Firebase Extension "Resize Images"

### Instalación desde Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **Extensions**
4. Busca **"Resize Images"** (by Firebase)
5. Haz clic en **Install**

### Configuración Recomendada

Durante la instalación, usa estos valores:

```
Cloud Functions location: us-central1 (o tu región preferida)
Cloud Storage bucket: (default - tu bucket principal)

Paths that contain images you want to resize:
observations,avatars

Sizes of images to create:
400x400

Convert to preferred image format:
webp

Quality for WebP conversion:
85

Deletion of original file:
No (mantener original para descargas científicas)

Cache-Control header:
public,max-age=31536000,immutable

Resized images location suffix:
_400x400
```

### Verificación

Después de instalar:
1. Sube una imagen de prueba a `/observations/test.jpg`
2. Verifica que se genere automáticamente `/observations/test_400x400.webp`
3. Comprueba que el tamaño del thumbnail sea ~20-50kB vs ~500kB del original

## Paso 2: Cambios en el Código (Ya Implementados)

✅ **Cache-Control Headers**: Ahora se configuran automáticamente al subir imágenes
✅ **Schema Firestore**: Actualizado para incluir `thumbnailUrl`
✅ **Lazy Loading**: Implementado con `loading="lazy"` en imágenes
✅ **Selección de URL**: El frontend usa thumbnails en listas/modals

## Paso 3: Migración de Imágenes Existentes

Para aplicar la optimización a imágenes ya existentes:

```bash
# Instala Firebase CLI si no la tienes
npm install -g firebase-tools

# Ejecuta el script de migración (próximamente)
npm run migrate:images
```

## Resultados Esperados

### Reducción de Costes

| Escenario | Antes | Después | Ahorro |
|-----------|-------|---------|--------|
| Imagen en lista | 500 kB | 30 kB | **94%** |
| 1000 vistas/día | 500 MB/día | 30 MB/día | **470 MB/día** |
| Coste mensual (estimado)* | $6.00 | $0.36 | **$5.64** |

*Basado en pricing de Firebase Storage Egress: ~$0.12/GB

### Mejora de Performance

- **Tiempo de carga inicial**: Reducción de 60-80%
- **Datos móviles**: Ahorro de 94% para usuarios
- **Latencia**: Mejora por caché (1 año vs sin caché)

## Monitoreo

Verifica el impacto en:
- [Firebase Console > Storage > Usage](https://console.firebase.google.com/)
- Sección "Network transfer" (Egress)
- Compara semana actual vs semana anterior

## Soporte

Si encuentras problemas:
1. Verifica que la extensión esté activa en Firebase Console
2. Revisa los logs de Cloud Functions
3. Comprueba que las imágenes nuevas generen thumbnails automáticamente
