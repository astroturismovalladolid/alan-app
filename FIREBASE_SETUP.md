# Firebase Setup Guide

Para que la app ALAN funcione completamente, necesitas habilitar y configurar Firebase Storage y Firestore.

## 1. Habilitar Firebase Storage

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Build** → **Storage**
4. Click en **Get Started**
5. Click en **Next** y luego **Done**

### Configurar Reglas de Storage

Una vez habilitado Storage, ve a la pestaña **Rules** y reemplaza el contenido con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Observations images
    match /observations/{imageId} {
      // Allow authenticated users to upload images
      allow write: if request.auth != null;
      // Allow anyone to read images
      allow read: if true;
    }
  }
}
```

Click en **Publish** para aplicar las reglas.

## 2. Habilitar Firestore Database

1. En la consola de Firebase, ve a **Build** → **Firestore Database**
2. Click en **Create database**
3. Selecciona **Start in production mode**
4. Elige la ubicación más cercana a tus usuarios (ej: `europe-west1` para Europa)
5. Click en **Enable**

### Configurar Reglas de Firestore

Una vez habilitado Firestore, ve a la pestaña **Rules** y reemplaza el contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - store user profile data
    match /users/{userId} {
      // Users can read and write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Observations collection - light pollution observations
    match /observations/{observationId} {
      // Authenticated users can create observations
      allow create: if request.auth != null
                    && request.resource.data.authorId == request.auth.uid;
      // Anyone can read observations (for the public map)
      allow read: if true;
      // Only the author can update/delete their observations
      allow update, delete: if request.auth != null
                            && resource.data.authorId == request.auth.uid;
    }
  }
}
```

Click en **Publish** para aplicar las reglas.

## 3. Verificación

Una vez completados estos pasos:

1. **Recarga la app** en tu navegador
2. **Intenta subir una foto** - ya no debería mostrar errores
3. La foto se subirá a Firebase Storage
4. Los datos se guardarán en Firestore
5. Verás un mensaje de éxito: "Subida exitosa"

## Notas de Seguridad

Las reglas configuradas:

- ✅ **Storage**: Solo usuarios autenticados pueden subir, todos pueden leer
- ✅ **Firestore users**: Usuarios solo pueden leer/escribir sus propios datos
- ✅ **Firestore observations**: Usuarios autenticados pueden crear, todos pueden leer, solo el autor puede modificar/eliminar

Si necesitas cambiar estas reglas más adelante, puedes hacerlo desde la consola de Firebase en cualquier momento.
