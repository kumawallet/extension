Kuma Wallet
===========

> Kuma es un trabajo en progreso. Es posible que la documentación no refleje la implementación actual. **Espere una versión estable y la documentación adecuada para el tercer trimestre de 2023**.

<p align="center">
  <img src="./images/logo.svg" />
</p>

[![CircleCI](https://circleci.com/gh/blockcoders/kuma-wallet/tree/main.svg?style=svg)](https://circleci.com/gh/blockcoders/kuma-wallet/tree/main)
[![Coverage Status](https://coveralls.io/repos/github/blockcoders/kuma-wallet/badge.svg?branch=main)](https://coveralls.io/github/blockcoders/kuma-wallet?branch=main)
[![CodeQL](https://github.com/blockcoders/kuma-wallet/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/blockcoders/kuma-wallet/actions/workflows/codeql-analysis.yml)
[![License](https://img.shields.io/badge/license-MIT%20License-brightgreen.svg)](https://opensource.org/licenses/MIT)

## Descripción del proyecto

Kuma Wallet es la primera de su tipo, una billetera cross-chain que ofrece una gestión y transferencia de activos sin problemas entre las cadenas EVM y WASM. Esta billetera ha sido diseñada para hacer que la experiencia de manejar activos entre cadenas sea lo más fluida e intuitiva posible. Con Kuma Wallet, los usuarios pueden importar y crear cuentas fácilmente en las cadenas EVM y WASM y transferir sus activos con facilidad, gracias a la integración de XCM. El diseño elegante y fácil de usar de Kuma Wallet se ha inspirado en la exitosa interfaz de usuario de Astar. Estamos comprometidos a brindar soporte continuo a Kuma Wallet, incluido el establecimiento de canales de Telegram y Discord, para garantizar que los usuarios tengan una plataforma para recibir comentarios y abordar cualquier problema que pueda surgir.

### Nuestra visión

- **Fácil de usar**: La billetera se ha desarrollado con énfasis en simplificar la administración de las cuentas EVM y WASM, lo que hace que sea fácil y conveniente para los usuarios manejar sus activos.

- **Transferencia de activos sin problemas**: Kuma Wallet permite a los usuarios transferir sus activos de forma segura entre cuentas en diferentes cadenas, eliminando la necesidad de procesos complejos y lentos.

- **Plataforma segura para la interacción con dApps**: la billetera proporciona una plataforma segura e intuitiva para que los usuarios firmen mensajes e interactúen con dApps, lo que garantiza una experiencia de usuario perfecta.

- **Transparencia y responsabilidad**: Kuma Wallet muestra los detalles de la transacción y los enlaces a las páginas del escáner/explorador, lo que promueve la transparencia y la responsabilidad en todas las transacciones.

- **Naturaleza descentralizada y de código abierto**: la billetera ha sido diseñada con un enfoque en mantener su naturaleza descentralizada y de código abierto, asegurando su confiabilidad y seguridad.

- **Experiencia integral del usuario**: Kuma Wallet tiene como objetivo cubrir más del 90 % de sus funcionalidades principales para brindar una experiencia integral del usuario, lo que la convierte en una solución integral para todas las necesidades de gestión de activos entre cadenas.

### La seguridad es lo primero

Kuma Wallet está diseñado con la seguridad como su máxima prioridad. Para garantizar la seguridad de los activos de los usuarios, hemos implementado el concepto Keyring de MetaMask, que es el núcleo del sistema de administración de cuentas y almacenamiento de secretos en MetaMask. Este enfoque garantiza que las claves privadas se almacenen localmente en los dispositivos de los usuarios, haciéndolas accesibles solo para el usuario.

Además, hemos utilizado técnicas de encriptación, similares a las que usa MetaMask, como la iteración PBKDF2 y el modo AES-GCM, para proporcionar una capa adicional de seguridad para las claves privadas. Estas técnicas de encriptación aseguran que las claves privadas estén protegidas incluso si el dispositivo se pierde o es robado.

Además del cifrado, Kuma Wallet también ofrece una función que permite a los usuarios ver la disponibilidad de diferentes parachains antes de realizar una transferencia. Esta característica, que se implementó a partir de la extensión de Polkadot, brinda a los usuarios una capa adicional de seguridad y tranquilidad, ya que pueden garantizar que su transferencia se realizará sin problemas.

### Especificaciones

**Billetera**

El envío de activos entre cuentas en diferentes cadenas solo será posible si la cuenta del destinatario está en una cadena compatible con la tecnología XCM.
Se agregarán más puentes en el futuro para soportar más cadenas.

**Tecnologías**
- Vite
- React 
- Typescript
- Tailwind
- Polkadot API
- Ethers.js

**Navegadores compatibles**
- Chrome
- Firefox
- Brave

**Redes predeterminadas**
- Astar 
- Shiden  
- Moonriver 
- Moonbeam 
- Polkadot 
- Kusama 
- Binance Smart Chain 
- Ethereum
- Polygon

**Tokens Predeteminados**
- ASTR
- SDN
- MOVR
- GLMR
- DOT
- KSM
- BNB
- ETH
- MATIC
- DEV
- GoerliETH

**Redes de prueba predeterminadas**
- Shibuya
- Moonbase Alpha
- Goerli

## Construcción local

```bash
# Instalar dependencias
npm ci
# Cree la extensión para Chrome y Firefox (en la carpeta dist/)
npm run build

# Cree la extensión para Chrome (en la carpeta dist/chrome)
npm run build:chrome

# Cree la extensión para Firefox (en la carpeta dist/firefox)
npm run build:firefox
```
*Nota: como Brave se basa en Chromium, la extensión se puede crear tanto para Chrome como para Brave con el mismo comando.*

## Ejecutando localmente

```bash
# Instalar dependencias
npm ci
# Cree y observe los cambios (Chrome)
npm run dev
# Cree y observe los cambios (Firefox)
npm run dev:firefox
```
*Nota: como Brave se basa en Chromium, la extensión se puede crear tanto para Chrome como para Brave con el mismo comando.*

## Cargando la extensión

### Chrome y Brave
Para cargar la extensión en su navegador, debe habilitar el modo desarrollador y cargar la extensión desde la carpeta `dist/chrome`.

Vaya a `chrome://extensions` y habilite el modo desarrollador.

![developer-mode](./images/developer-mode.png)
![developer-mode](./images/developer-mode-on.png)

Luego haga clic en `Cargar descomprimida` y seleccione la carpeta `dist/chrome`.

![load-unpacked](./images/load-unpacked.png)

Ahora debería ver la extensión en su navegador.

### Firefox
Para cargar la extensión en su navegador, cargue la extensión desde la carpeta `dist/firefox`.

Vaya `about:debugging#/runtime/this-firefox` y haga click en `Load Temporary Add-on`.

![load-temporary](./images/load-add-on.png)

Luego haga click en el archivo `manifest.json` en la carpeta `dist/firefox`.

![load-temporary](./images/load-add-on-2.png)

Ahora debería ver la extensión en su navegador.

## Ejecutando pruebas

```bash
# Run tests
npm test
```

## Usando la extensión

Esperamos brindar una experiencia de usuario integral con Kuma Wallet, convirtiéndola en una solución integral para todas las necesidades de gestión de activos entre cadenas. Para lograr este objetivo, hemos implementado una variedad de funciones que harán que la experiencia del usuario sea lo más fluida e intuitiva posible.
Pero en caso de que necesite ayuda, hemos creado una [guía del usuario] (https://docs.kumawallet.io/) para ayudarlo a comenzar.

## Integrar Kuma Wallet a su aplicación

Para integrar Kuma Wallet a su aplicación, siga el ejemplo a continuación.

### Ejemplo

```javascript
// En un contexto donde 'window' esté disponible (por ejemplo, la aplicación que desea integrar Kuma Wallet)
// Verifique si Kuma Wallet está instalado
const isKumaWalletInstalled = !!window.kuma;

// Firmar un mensaje
const signMessage = async (message: string) => {
  if (isKumaWalletInstalled) {
    const response = await window.kuma.call({
      method: "sign_message",
      params: {
        message,
      }
    })
    console.log(response?.message);
  }
}
```

Al intentar firmar un mensaje en Kuma Wallet, aparecerá una ventana emergente que solicitará la confirmación del usuario. El primer paso en el proceso de confirmación consiste en verificar que el sitio sea seguro.

![trust-site](./images/trust-site.png)

![sign-message](./images/sign-message.png)


## Contribuyendo

Damos la bienvenida a las contribuciones de la comunidad. Si desea contribuir, lea nuestras [directrices de contribución] (./CONTRIBUTING.md).

## Créditos

Queremos agradecer a la Fundación Web3 por su apoyo y al equipo de Polkadot por su ayuda y orientación. También queremos agradecer al equipo de Astar por su apoyo en las pruebas Beta y a la comunidad de Polkadot por sus comentarios y apoyo.
Este proyecto fue una gran experiencia de aprendizaje para nosotros y esperamos seguir contribuyendo al ecosistema de Polkadot.
Nuestro equipo principal de desarrolladores ha estado trabajando en este proyecto durante más de 6 meses y estamos muy orgullosos del resultado. Esperamos que disfrute usando Kuma Wallet tanto como nosotros disfrutamos construyéndolo.