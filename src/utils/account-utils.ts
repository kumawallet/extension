export const cropAccount = (account: string) => {
  console.log("account", account)
  if (!account) return "";
  const first4Letters = account.slice(0, 4);

  const last4Letters = account.slice(account.length - 4, account.length);

  return `${first4Letters}...${last4Letters}`;
};

export const formatAccount = (_account: string) => {
  let address = "";
  let type = "";

  if (_account.includes("EVM")) {
    address = _account.slice(4);
    type = "EVM";
  }

  if (_account.includes("WASM")) {
    address = _account.slice(5);
    type = "WASM";
  }

  return { address, type };
};
