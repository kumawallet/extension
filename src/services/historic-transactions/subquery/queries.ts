import { gql } from "graphql-request";

const getWalletTransactions = (address: string) => {
  return gql`
    {
      transactions(
        filter: {
          or: [
            {
              recipient: {
                equalTo: "${address}"
              }
            }
            {
              sender: {
                equalTo: "${address}"
              }
            }
          ]
        }
      ) {
        nodes {
          id
          amount
          asset
          blockNumber
          fee
          hash
          originNetwork
          recipient
          sender
          status
          targetNetwork
          tip
          timestamp
          type
        }
      }
    }
  `;
};

export const subQueryQueries = {
  getWalletTransactions,
};
