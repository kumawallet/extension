import { gql } from "graphql-request";

const getWalletTransactions = (address: string, offset = 0, first = 20) => {
  return gql`
    {
      transactions(
        first: ${first},
        offset: ${offset},
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
        pageInfo {
          hasNextPage
        }
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
