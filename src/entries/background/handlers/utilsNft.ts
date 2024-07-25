import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import azero_abi from "@src/constants/azero_domain_registry_abi.json";
import pink_abi from "@src/constants/pink_psp34_abi.json";
import neuroguns from "@src/constants/neuroguns_psp34_abi.json";
import psp34 from "@src/constants/psp34_abi.json"

export const isPinkRoboNft = (contractAddress: string) => {
    return ['XoywUxTTtNKPRrRN7V5KXCqz2QLMFeK7DxhpSniqZHps5Xq'].includes(contractAddress);
  }
  
export const isNeurogunNft = (contractAddress: string) => {
    return ['aZ9bd2tHeGKrs3FnJv5oe7kgVrP5GQvdJMhC2GxjXA2Yqbd'].includes(contractAddress);
  }
  
  export const isAzeroDomainNft = (contractAddress: string) => {
    return ['5FsB91tXSEuMj6akzdPczAtmBaVKToqHmtAwSUzXh49AYzaD', '5CTQBfBC9SfdrCDBJdfLiyW2pg9z5W6C6Es8sK313BLnFgDf'].includes(contractAddress);
  }

export const getPSP34ContractPromise = (apiPromise: ApiPromise, contractAddress: string) => {
    if (isPinkRoboNft(contractAddress)) {
      return new ContractPromise(apiPromise, pink_abi, contractAddress);
    }
  
    if (isNeurogunNft(contractAddress)) {
      return new ContractPromise(apiPromise, neuroguns, contractAddress);
    }
  
    if (isAzeroDomainNft(contractAddress)) {
      return new ContractPromise(apiPromise, azero_abi, contractAddress);
    }
  
    return new ContractPromise(apiPromise, psp34, contractAddress);
  }
