# Compilar Aura para iOS (App Store)

Como no tienes Mac, usamos EAS Build de Expo para compilar en la nube.

## Requisitos previos

- Cuenta de Apple Developer Program (99 USD/ano) - ya la tienes
- Cuenta de Expo (gratis) - https://expo.dev/signup

## Pasos

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Loguearte en Expo

```bash
eas login
```

Te pedira email y contrasena de tu cuenta de Expo.

### 3. Ir a la carpeta del proyecto

```bash
cd "/home/sergio/Proyectos/Desarrollos/App movil/Electricidad Verde"
```

### 4. Configurar EAS (solo la primera vez)

```bash
eas build:configure
```

Esto crea el archivo `eas.json` si no existe.

### 5. Lanzar el build de iOS

```bash
eas build --platform ios
```

Durante el proceso:
- Te pedira loguearte con tu Apple ID (cuenta de desarrollador)
- Preguntara si quieres que EAS gestione los certificados automaticamente - di que **si**
- El build entrara en cola (plan gratuito: 15 min - 2 horas de espera)
- Una vez que empiece, tarda unos 15-20 minutos

Al terminar, te dara un enlace para descargar el archivo `.ipa`.

### 6. Subir a App Store Connect

Opcion A - Automatico con EAS:
```bash
eas submit --platform ios
```

Opcion B - Manual:
- Descarga el `.ipa` del enlace que te dio EAS
- Usa Transporter (app de Apple para Windows/Mac) o altool para subirlo

### 7. Publicar en App Store Connect

1. Ve a https://appstoreconnect.apple.com
2. Crea la app si no existe (usa Bundle ID: `com.aura.app`)
3. Rellena la ficha: nombre, descripcion, capturas de pantalla, icono
4. Anade la URL de politica de privacidad
5. Selecciona el build que subiste
6. Envia a revision

## Datos importantes

| Dato | Valor |
|------|-------|
| Bundle ID | `com.aura.app` |
| Version | `1.0.0` |

## Notas

- El plan gratuito de EAS tiene cola de espera. Si necesitas builds rapidos, el plan de pago cuesta 29 USD/mes.
- Los certificados de iOS los gestiona EAS automaticamente si se lo permites.
- Guarda las credenciales de Expo en un lugar seguro.
