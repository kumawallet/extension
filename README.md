# Kuma Wallet

## Project Overview :page_facing_up:

Blockcoders is proud to propose the development of a revolutionary cross-chain wallet, capable of importing and creating both EVM and WASM accounts. This wallet will make it easy for users to manage and transfer tokens between the two chains. Built with the user experience in mind, the wallet will feature the same sleek and intuitive design as Astar UI. The term cross-chain in this case refers to the ability to transfer tokens between parachains for both EVM and WASM.
We plan to give constant support to this wallet and open Telegram and Discord channels to have a better feedback from the users, solve issues and add new functionalities.

### Goals

- Develop a user-friendly wallet that simplifies the management of EVM and WASM accounts in one place.
- Enable seamless and secure asset transfer between users accounts on different chains.
- Provide a safe and intuitive platform for users to sign messages and interact with dApps.
- Enhance transparency and accountability by displaying transaction details and links to scanner/explorer pages.
- Maintain the wallet's decentralization and open-source nature, ensuring its trustworthiness and security.
- Aim to cover more than 90% of the wallet's main functionalities to provide a comprehensive user experience.

### Security

The wallet will implement the Keyring concept, which is the core of the secret storing and account management system in MetaMask. This approach ensures that private keys are stored locally on users' devices using browser built-in storage capabilities such as IndexedDB or WebSQL, making them accessible only to the user. Additionally, we will use encryption techniques similar to MetaMask, such as PBKDF2 iteration and AES-GCM mode, to provide an extra layer of security for the private keys. This wallet will also implement the same feature that Polkadot's extension has, which allows users to see the availability of different parachains before they make a transfer. This feature will provide users with an added layer of security and peace of mind, as they can ensure that their transfer will go through smoothly.

### Specifications

In a first approach, we will be using the following technologies: React, Typescript, Polkadot API and Ethers.js. The supported browsers will be: Chrome and Firefox. The default networks will be: Astar, Shiden, Shibuya (testnet), Moonbeam, Moonriver, Moonbase Alpha (testnet), Polkadot and Kusama. The default tokens will be: ASTR, SDN, SBY, GLMR, MOVR, DEV, DOT and KSM.

### Main functionalities

- Allow users to easily create and import EVM and WASM accounts.
- Provide a clear and intuitive overview of users' balances for both EVM and WASM accounts.
- Enable the transfer of assets between EVM accounts, WASM accounts, and between EVM and WASM accounts.
- Allow users to sign messages and execute calls and transactions on custom smart contracts.
- Provide links to explorer pages to enhance transparency and accountability.
- Give users the flexibility to add custom networks and tokens to the wallet.
- Implement the XCM format to enable cross-chain functionality, making it easy for users to transfer assets between parachains.
- Design the wallet using React and follow the look and feel of Astar UI, with the option to open in full-screen mode.

The cross-chain functionality will be implemented using the XCM format, enabling users to easily transfer assets between EVM and WASM parachains. The XCM implementation will be simplified to provide a seamless user experience. The user interface will be built using React, and the design will be inspired by the look and feel of Astar UI. The extension will have the option to open in full-screen mode for a more immersive experience.
