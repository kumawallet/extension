export const XCM: { [key: string]: string[] } = {
  polkadot: ["acala", "astar", "moonbeam-evm"],
  astar: ["polkadot", "moonbeam-evm", "acala"],
  moonbeam: ["polkadot", "acala", "astar"],
  acala: ["polkadot", "moonbeam-evm", "astar"],
  kusama: ["shiden", "moonriver"],
  moonriver: ["kusama", "shiden"],
  shiden: ["kusama", "moonriver"],
  rococo: ["rococo-asset-hub"],
  "rococo-asset-hub": ["rococo"],
};
