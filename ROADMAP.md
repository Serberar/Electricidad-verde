# Roadmap para Publicación - Aura

## Estado Actual
- App funcional con simulador, gestión de contratos y notificaciones
- React Native + Expo SDK 54
- Nueva arquitectura habilitada
- Política de privacidad implementada en la app

---

## 🔴 CRÍTICO - Obligatorio para publicar

### 1. Identificadores de la App
**Estado:** ❌ Pendiente

Los identificadores actuales son genéricos y deben cambiarse:
- **Android:** `com.anonymous.energiaapp` → `com.aura.app`
- **iOS:** `com.anonymous.energiaapp` → `com.aura.app`

**Archivo:** `app.config.js`

**IMPORTANTE:** Una vez publicada, el package/bundleIdentifier NO se puede cambiar.

---

### 2. Iconos y Assets de la App
**Estado:** ⚠️ Revisar

**Requisitos:**

| Asset | Tamaño | Estado |
|-------|--------|--------|
| Icono iOS | 1024x1024 px (sin transparencia) | ❓ Verificar |
| Icono Android | 512x512 px | ❓ Verificar |
| Adaptive Icon (Android) | 1024x1024 px | ❓ Verificar |
| Splash Screen | 1284x2778 px (recomendado) | ❓ Verificar |

**Archivos a revisar:**
- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash-icon.png`

---

### 3. Política de Privacidad - URL Externa
**Estado:** ❌ Pendiente

Aunque la política está en la app, **Google Play y App Store requieren una URL pública** accesible desde navegador.

**Opciones:**
1. Crear página web con la política (recomendado)
2. Usar un servicio gratuito como Notion, Google Sites, o GitHub Pages

**La URL debe incluirse en:**
- Ficha de Google Play
- Ficha de App Store
- Formulario de la app (opcional pero recomendado)

---

### 4. Configurar EAS Build
**Estado:** ❌ Pendiente

EAS (Expo Application Services) es necesario para generar los builds de producción.

**Pasos:**
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar el proyecto
eas build:configure
```

**Crear archivo `eas.json`:**
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

### 5. Cuenta de Desarrollador
**Estado:** ❓ Verificar

| Tienda | Coste | Enlace |
|--------|-------|--------|
| Google Play | 25€ (único pago) | https://play.google.com/console |
| Apple Developer | 99€/año | https://developer.apple.com |

---

## 🟡 IMPORTANTE - Necesario para aprobar la revisión

### 6. Metadatos para las Tiendas
**Estado:** ❌ Pendiente

**Google Play requiere:**
- [ ] Nombre de la app (máx 30 caracteres)
- [ ] Descripción corta (máx 80 caracteres)
- [ ] Descripción completa (máx 4000 caracteres)
- [ ] Capturas de pantalla (mín 2, máx 8)
  - Teléfono: 16:9 o 9:16
- [ ] Gráfico de funciones (1024x500 px)
- [ ] Icono de alta resolución (512x512 px)
- [ ] Categoría: Finanzas o Herramientas
- [ ] Clasificación de contenido (cuestionario)
- [ ] Información de contacto (email)
- [ ] Declaración de seguridad de datos

**App Store requiere:**
- [ ] Nombre de la app (máx 30 caracteres)
- [ ] Subtítulo (máx 30 caracteres)
- [ ] Descripción promocional (máx 170 caracteres)
- [ ] Descripción (máx 4000 caracteres)
- [ ] Palabras clave (máx 100 caracteres)
- [ ] Capturas de pantalla:
  - iPhone 6.7" (1290x2796 px)
  - iPhone 6.5" (1284x2778 px)
  - iPhone 5.5" (1242x2208 px)
  - iPad 12.9" (si supportsTablet es true)
- [ ] URL de soporte
- [ ] Clasificación de edad
- [ ] Información de revisión (credenciales de prueba si es necesario)

---

### 7. Capturas de Pantalla
**Estado:** ❌ Pendiente

**Pantallas a capturar:**
1. Home con ahorro calculado
2. Simulador de electricidad
3. Simulador de gas
4. Mis tarifas con contrato activo
5. Formulario de contacto
6. FAQ

**Herramientas recomendadas:**
- Figma para mockups
- Expo Go para capturas reales
- AppMockUp o Screenshots.pro para marcos de dispositivo

---

### 8. Declaración de Seguridad de Datos (Google Play)
**Estado:** ❌ Pendiente

Debes declarar qué datos recopila la app:

| Dato | ¿Se recopila? | ¿Se comparte? |
|------|---------------|---------------|
| Nombre | Sí (formulario) | No |
| Teléfono | Sí (formulario) | No |
| Email | Sí (opcional) | No |
| Consumo energético | Solo local | No |
| Datos de contrato | Solo local | No |

**El formulario de Google Forms recopila datos, hay que declararlo.**

---

### 9. Clasificación de Contenido
**Estado:** ❌ Pendiente

Completar el cuestionario de clasificación:
- Google Play: IARC (International Age Rating Coalition)
- App Store: Clasificación de edad manual

**La app probablemente obtendrá:**
- PEGI 3 / Everyone (no tiene contenido sensible)

---

## 🟢 RECOMENDADO - Mejora la calidad

### 10. Testing
**Estado:** ❌ Pendiente

**Recomendado antes de publicar:**
- [ ] Probar en dispositivos físicos (Android e iOS)
- [ ] Probar en diferentes tamaños de pantalla
- [ ] Probar modo offline
- [ ] Probar notificaciones push
- [ ] Verificar que el formulario funciona

**Configurar tests (opcional pero recomendado):**
```bash
npm install --save-dev jest @testing-library/react-native
```

---

### 11. Versionado
**Estado:** ⚠️ Configurar

**Actual:** `1.0.0`

**Estrategia recomendada:**
- `1.0.0` - Primera versión pública
- `1.0.1` - Corrección de bugs
- `1.1.0` - Nuevas funcionalidades menores
- `2.0.0` - Cambios grandes

**Para Android, añadir en `app.config.js`:**
```javascript
android: {
  versionCode: 1, // Incrementar en cada build
  // ...
}
```

---

### 12. Manejo de Errores
**Estado:** ⚠️ Revisar

**Recomendaciones:**
- [ ] Añadir try/catch en operaciones async
- [ ] Mostrar mensajes de error amigables
- [ ] Considerar Sentry o similar para tracking de errores

---

### 13. Rendimiento
**Estado:** ✅ Nueva arquitectura activa

**Verificaciones adicionales:**
- [ ] Optimizar imágenes (WebP si es posible)
- [ ] Verificar que no hay memory leaks
- [ ] Probar en dispositivos de gama baja

---

## 📋 Checklist Final antes de Publicar

### Google Play
- [ ] Cuenta de desarrollador creada
- [ ] Identificador de paquete único configurado
- [ ] Iconos y assets correctos
- [ ] eas.json configurado
- [ ] Build de producción generado (.aab)
- [ ] Ficha de la tienda completa
- [ ] Política de privacidad URL
- [ ] Declaración de seguridad de datos
- [ ] Clasificación de contenido completada

### App Store
- [ ] Cuenta de Apple Developer activa
- [ ] Identificador de bundle único
- [ ] Certificados y provisioning profiles
- [ ] Iconos y assets correctos
- [ ] Build de producción subido
- [ ] Ficha de la tienda completa
- [ ] Política de privacidad URL
- [ ] Capturas de todos los tamaños requeridos
- [ ] Información de revisión preparada

---

## 📅 Orden Sugerido de Tareas

1. **Día 1-2:** Cambiar identificadores + Crear iconos finales
2. **Día 3:** Configurar EAS + Generar primer build
3. **Día 4:** Probar en dispositivos físicos
4. **Día 5:** Crear capturas de pantalla
5. **Día 6:** Escribir textos de la tienda + Política de privacidad web
6. **Día 7:** Subir a Google Play (revisión: 1-7 días)
7. **Día 8+:** Subir a App Store (revisión: 1-3 días)

---

## Comandos Útiles

```bash
# Generar build de desarrollo
eas build --profile development --platform android

# Generar build de producción Android
eas build --profile production --platform android

# Generar build de producción iOS
eas build --profile production --platform ios

# Subir a las tiendas
eas submit --platform android
eas submit --platform ios
```

---

## Recursos

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Generador de iconos](https://icon.kitchen)
- [Política de privacidad gratuita](https://app-privacy-policy-generator.firebaseapp.com/)
