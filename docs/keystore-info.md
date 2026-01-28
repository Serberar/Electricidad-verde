# Datos de Firma - Electricidad Verde (Android)

## Keystore de Produccion

| Dato             | Valor                                |
| ---------------- | ------------------------------------ |
| Archivo          | `android/app/electricidadverde-release.jks` |
| Store Password   | `electricidadverde2024`              |
| Key Alias        | `electricidadverde`                  |
| Key Password     | `electricidadverde2024`              |
| Tipo             | JKS (RSA 2048 bits)                 |
| Validez          | 10.000 dias                         |
| DN               | CN=Electricidad Verde, OU=Development, O=Electricidad Verde, L=Madrid, ST=Madrid, C=ES |

## Datos de la App

| Dato             | Valor                        |
| ---------------- | ---------------------------- |
| Application ID   | `com.electricidadverde.app`  |
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
