export const cropAccount = (account: string) => {
  const first4Letters = account.slice(0, 4);

  const last4Letters = account.slice(account.length - 4, account.length);

  return `${first4Letters}...${last4Letters}`;
};
