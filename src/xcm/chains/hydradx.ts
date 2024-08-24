import {
  XCM,
  XCM_DEFAULT_VERSIONS,
  getDest,
  transformAddress,
} from "../utils";
import { Map } from "../interfaces";
import { POLKADOT_PARACHAINS } from "@src/constants/chains";

export const HYDRADX_EXTRINSICS: { [key: string]: Map } = {
  polkadot: ({ address, amount, xcmPalletVersion }) => {
    const { accountId } = transformAddress(address);
    return({
    pallet: XCM.pallets.X_TOKENS.NAME,
    method: XCM.pallets.X_TOKENS.methods.TRANSFER,
    extrinsicValues: {
      currency_id:"5",
      amount,
      dest: getDest({
        parents: 1,
        version: XCM_DEFAULT_VERSIONS[1],
        interior: {
            X1: {
                AccountId32:{
                  network:null,
                  id:accountId
            }

          }
      }}),
      dest_weight_limit: "Unlimited",
    },
  })},
  acala: ({ address, amount, assetSymbol, xcmPalletVersion }) => {
    let currency_id = null;
    const { accountId } = transformAddress(address);
    switch (assetSymbol?.toLowerCase()) {
      case "ldot": {
        currency_id = "1000100"
        break;
      }
      case "aca": {
        currency_id = "1000099"
        break;
      }
      default:
        throw new Error("Invalid asset symbol");
    }
    return {
      pallet: XCM.pallets.X_TOKENS.NAME,
      method : XCM.pallets.X_TOKENS.methods.TRANSFER,
      extrinsicValues: {
        currency_id,
        amount,
        dest: getDest({
          parents: 1,
          parachainId: POLKADOT_PARACHAINS.ACALA.id,
          version: XCM_DEFAULT_VERSIONS[1],
          interior: {
            X2:[
                {
                    Parachain: POLKADOT_PARACHAINS.ACALA.id
                },
                {
                    AccountId32:{
                        network:null,
                        id:accountId
                    }
                }
            ]  
        }
        }),
        dest_weight_limit:"Unlimited"
      }
    };
  },
  astar: ({ address, amount,assetSymbol, xcmPalletVersion }) => {
    let currency_id = null;
    const { accountId } = transformAddress(address);
    switch (assetSymbol?.toLowerCase()) {
      case "astr": currency_id = "9"
      break;
      case "dot": currency_id = "5"
      break;
      default:
        throw new Error("Invalid asset symbol");
    }
    return {
        pallet: XCM.pallets.X_TOKENS.NAME,
        method : XCM.pallets.X_TOKENS.methods.TRANSFER,
        extrinsicValues: {
          currency_id,
          amount,
          dest: getDest({
            parents: 1,
            parachainId: POLKADOT_PARACHAINS.ACALA.id,
            version: XCM_DEFAULT_VERSIONS[1],
            interior: {
              X2:[
                  {
                      Parachain:POLKADOT_PARACHAINS.ASTAR.id
                  },
                  {
                      AccountId32:{
                          network:null,
                          id:accountId
                      }
                  }
              ]  
          }
          }),
          dest_weight_limit:"Unlimited"
        },
      };
  },
  "moonbeam-evm": ({ address, amount,assetSymbol, xcmPalletVersion }) => {
    let currency_id = null;
    switch (assetSymbol?.toLowerCase()) {
      case "glmr": currency_id = "16"
      break;
      case "dot": currency_id = "5"
      break;
      default:
        throw new Error("Invalid asset symbol");
    }
    return {
        pallet: XCM.pallets.X_TOKENS.NAME,
        method : XCM.pallets.X_TOKENS.methods.TRANSFER,
        extrinsicValues: {
          currency_id,
          amount,
          dest: getDest({
            parents: 1,
            version: XCM_DEFAULT_VERSIONS[1],
            interior: {
              X2:[
                  {
                      Parachain: POLKADOT_PARACHAINS.MOONBEAM.id
                  },
                  {
                    AccountKey20:{
                          network:null,
                          key:address
                      }
                  }
              ]  
          }
          }),
          dest_weight_limit:"Unlimited"
        },
      };
  }
};

enum HYDRADX_ASSETS {
  DOT = "DOT",
  ASTR = "ASTR",
  LDOT = "LDOT",
  ACA = "ACA",
  GLMR = "GLMR"
}

export const HYDRADX_ASSETS_MAPPING = {
  polkadot: [HYDRADX_ASSETS.DOT],
  acala: [HYDRADX_ASSETS.LDOT, HYDRADX_ASSETS.ACA],
  astar: [HYDRADX_ASSETS.ASTR, HYDRADX_ASSETS.DOT],
  "moonbeam-evm": [HYDRADX_ASSETS.GLMR, HYDRADX_ASSETS.DOT]
};