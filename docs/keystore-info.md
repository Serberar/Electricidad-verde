# Datos de Firma - Aura (Android)

## Keystore de Produccion

| Dato             | Valor                                |
| ---------------- | ------------------------------------ |
| Archivo          | `android/app/aura-release.jks` |
| Store Password   | `aura2024`              |
| Key Alias        | `aura`                  |
| Key Password     | `aura2024`              |
| Tipo             | JKS (RSA 2048 bits)                 |
| Validez          | 10.000 dias                         |
| DN               | CN=Aura, OU=Development, O=Aura, L=Madrid, ST=Madrid, C=ES |

## Datos de la App

| Dato             | Valor                        |
| ---------------- | ---------------------------- |
| Application ID   | `com.aura.app`  |
| Version Name     | `1.0.0`                     |
| Version Code     | `1`                         |

## Ubicacion del AAB

```
android/app/build/outputs/bundle/release/app-release.aab
```

## IMPORTANTE

- **No pierdas el keystore.** Sin el no podras publicar actualizaciones en Google Play Store.
- Guarda una copia de seguridad en un lugar seguro fuera del repositorio.
- Considera mover las contrasenas a variables de entorno o a un `gradle.properties` local no versionado.
