export const XCM: { [key: string]: string[] } = {
  polkadot: ["acala", "astar", "moonbeam-evm", "hydradx"],
  astar: ["polkadot", "moonbeam-evm", "acala","hydradx"],
  "moonbeam-evm": ["polkadot", "acala", "astar", "hydradx"],
  acala: ["polkadot", "moonbeam-evm", "astar", "hydradx"],
  kusama: ["shiden", "moonriver"],
  moonriver: ["kusama", "shiden"],
  shiden: ["kusama", "moonriver"],
  rococo: ["rococo-asset-hub"],
  "rococo-asset-hub": ["rococo"],
  hydradx:["polkadot","astar","acala", "moonbeam-evm"]

};
