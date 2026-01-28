// app.config.js - Lee variables del .env y las expone a la app
import 'dotenv/config';

export default {
  expo: {
    name: "Electricidad Verde",
    slug: "electricidad-verde",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.electricidadverde.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.electricidadverde.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    // Variables de entorno expuestas a la app
    extra: {
      // Electricidad
      ELECTRICITY_PRICE_KWH: process.env.ELECTRICITY_PRICE_KWH || "0.12",
      ELECTRICITY_DEFAULT_USER_PRICE: process.env.ELECTRICITY_DEFAULT_USER_PRICE || "0.25",
      ELECTRICITY_CONSUMPTION_LOW: process.env.ELECTRICITY_CONSUMPTION_LOW || "150",
      ELECTRICITY_CONSUMPTION_MEDIUM: process.env.ELECTRICITY_CONSUMPTION_MEDIUM || "300",
      ELECTRICITY_CONSUMPTION_HIGH: process.env.ELECTRICITY_CONSUMPTION_HIGH || "500",
      // Gas
      GAS_PRICE_KWH: process.env.GAS_PRICE_KWH || "0.10",
      GAS_DEFAULT_USER_PRICE: process.env.GAS_DEFAULT_USER_PRICE || "0.10",
      GAS_CONSUMPTION_LOW: process.env.GAS_CONSUMPTION_LOW || "100",
      GAS_CONSUMPTION_MEDIUM: process.env.GAS_CONSUMPTION_MEDIUM || "200",
      GAS_CONSUMPTION_HIGH: process.env.GAS_CONSUMPTION_HIGH || "400",
      // Contacto
      FORMULARIO: process.env.FORMULARIO || "",
      // Legal
      PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL || "",
    }
  }
};
