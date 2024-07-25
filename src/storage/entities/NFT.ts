import { ApiPromise } from "@polkadot/api";
import { ContractPromise } from '@polkadot/api-contract';
import { Contract, JsonRpcProvider} from "ethers";
import { BehaviorSubject } from "rxjs";
import erc721  from "@src/constants/erc721_abi.json";
import psp34 from "@src/constants/psp34_abi.json"
import { NFT_Address,NFTContract,ChainType, NFTInfo, NFTData } from "@src/types";
// import { getPSP34ContractPromise } from "@src/entries/background/handlers/utilsNft"
import AccountEntity from "@src/storage/entities/Account";
import { getType } from "@src/utils/assets";
import { api as _api } from "@src/storage/entities/Provider"
import { _Contract } from "@src/types";



const MAX_CALL_WEIGHT = '5000000000000';
const DEFAULT_REF_TIME = '1000000000000';

export type api = ApiPromise | JsonRpcProvider;

export class NFT {
    public nfts = new BehaviorSubject<NFT_Address>({}); 
    public _nfts: NFT_Address = {}
    contracts : string[] = []
    public getNFTS() {
        return  this.nfts;
    }
    public async loadCollection(
        account: AccountEntity,
        api: Record<string, _api>,
        networks: string[],
        contracts: _Contract[]
        ) {
        try{
            const contractsFilters = contracts.filter((_contract) => networks.includes(_contract.networkId))
            
            await Promise.all(contractsFilters.map(async(_contract) => {
                const data = {
                    contractAddress: _contract.contractAddress,
                    collectionName: _contract.collectionName,
                    collectionSymbol: _contract.collectionSymbol,
                    isValidated: true,
                  }
                return account.value?.address && 
                    getType(account.type.toLowerCase()) === _contract.type && 
                    this.getCollections(account.value?.address,data,(api[_contract.networkId].provider as api),_contract.type,_contract.networkId);
            }

            ))
                this.nfts.next(this._nfts)
        }
        catch(error){
            throw new Error("Error loadCollection")
        }

    }
    public async getCollections(address: string,data: NFTInfo, networkApi:api , type: ChainType, networkId: string){
        
        const nft : NFTContract  = {
                                    contractAddress: "",
                                    collectionName: "",
                                    collectionSymbol: "",
                                    balance: 0,
                                    isEnum: false,
                                    network: "",
                                    nftsData: []
                                    }
        
            
            switch(type){
                case ChainType.EVM:{

                    
                    
                    // const exist = this._nfts[address] && this._nfts[address][networkId] && 
                    //             this._nfts[address][networkId].contracts.find((contract) => contract.contractAddress === data.contractAddress);
                    // if(exist){
                    //     return
                    // }
                    const contract = new Contract(data.contractAddress,erc721,(networkApi as JsonRpcProvider))

                    const _balance =  await contract.balanceOf(address);
                    const balance = Number(_balance);
                    


                    nft["contractAddress"] = data.contractAddress
                    nft["collectionName"] = data.collectionName || ""
                    nft["collectionSymbol"] = data.collectionSymbol || ""
                    nft["network"] = networkId;
                    nft["balance"] = balance
                    contract.on("Transfer", async (from, to) => {
                        if (from === address || to === address) {
                        const balance = await contract.balanceOf(address);
                        console.log("-----------------------subscriber-----------------------",data, address)
                        const _data = await this.getOwnerTokensEVM(balance, address, contract)
                        this.updateOneNFT(address,data.contractAddress,Number(balance),type,networkId,_data );
                        }
                    });
                    try{
                        const _data = await this.getOwnerTokensEVM(balance, address,contract)
                        if(!data) return

                        nft["nftsData"] = _data.data;
                        nft["isEnum"] = _data.isEnum;

                    const exist = this._nfts[address] && this._nfts[address][networkId] && 
                                this._nfts[address][networkId].contracts.find((contract) => contract.contractAddress === data.contractAddress);
                    if(exist){
                        return
                    }
                        
                        if(!this._nfts[address]){
                            this._nfts[address]= {
                                [networkId]: {
                                    contracts: [nft],
                                    subscriber: [contract], 
                                    type: ChainType.EVM
                                }}
                        } 
                        else if(!this._nfts[address][networkId]){
                            this._nfts[address]= {
                                ...this._nfts[address],
                                [networkId]: {
                                    contracts: [nft],
                                    subscriber: [contract], 
                                    type: ChainType.EVM
                                }}
                        }
                        else{
                            this._nfts[address][networkId].contracts.push(nft);
                            this._nfts[address][networkId].subscriber.push(contract)
                        }
                        }
                        catch(error){
                            throw new Error("Error_getCollection");
                            
                        }
                    }
                    break;
                case ChainType.WASM: {

                //  const contract = await getPSP34ContractPromise((networkApi as ApiPromise), data.contractAddress);
                //  const attributeStore = await this.isAttributeStoredOnChain(contract,address,(networkApi as ApiPromise));
                //  const _balance = await contract.query['psp34::balanceOf'](address, { gasLimit: this.getDefaultWeightV2(networkApi as ApiPromise) }, address);
                //  const balanceJson = _balance?.output?.toJSON() as Record<string, any>;
                //  const balance = _balance.output ? ((balanceJson.ok || balanceJson.Ok) as string) : '0';
                //  await this.getOwnerTokensWASM(parseInt(balance), address,contract,(networkApi as ApiPromise))

                }
                }

    }
    public async getOwnerTokensEVM(balance: number,address : string, contract: Contract) {
        try{
        const tokenIds = [];
        for(let i = 0; i < balance; i++) {
                const tokenId = await contract.tokenOfOwnerByIndex(address, i); 
                tokenIds.push(tokenId.toString());
        }
        const data = await Promise.all(tokenIds.map(async(tokenId) => {
                        const uri = await contract.tokenURI(tokenId);
                        const response = await fetch(uri)
                        const data = await response.json();
                        return {
                            tokenId: tokenId,
                            ...data,
                            owner: data.owner ||  await contract.ownerOf(tokenId)
                        } as NFTData
                    }))
        return {data, isEnum: true }
    }
    catch(error){
            if(String(error).startsWith("Error: missing revert data")){
                return {data: [], isEnum: false};
            }
                console.log("error getOwnerTokens : ", error);
                throw error;
            
            
        }
      }
    //   public async getOwnerTokensWASM(balance: number,address : string, contract: ContractPromise, networkApi: ApiPromise) {
    //     try{
    //     for(let i = 0; i < balance; i++) {
    //             const tokenId = await contract.query['psp34Enumerable::ownersTokenByIndex'](address, { gasLimit: (this.getDefaultWeightV2(networkApi) as WeightV2) }, address, i);
    //             if(tokenId.output){
    //             const rawTokenId = tokenId.output.toHuman() as Record<string, any>
    //             const tokenIdObj = (rawTokenId.Ok.Ok || rawTokenId.ok.ok) as Record<string, string>;
    //         }
    //     }
    // }
    // catch(error){
    //             console.log(error, "error getOwnerTokensWASM");
    //             throw error;
            
            
    //     }
    //   }
    private async deleteContractforAccount(address:string, networkId: string, contractAddress:string, type: ChainType){
        let _index: number = -1
        let newSubscriber = []
        let newcontracts : any[] =[]
       
        switch(type){
            case ChainType.EVM : {
                newcontracts = this._nfts[address][networkId].contracts.filter(
                    (contract, index) => {
                        if(contract.contractAddress !== contractAddress){
                            return contract
                        }
                        else{
                            _index=index
                        }
                })
                if(_index > -1){
                    const contract = this._nfts[address][networkId].subscriber[_index]
                    await contract.off("Transfer")
                    newSubscriber = this._nfts[address][networkId].subscriber.filter((contract,index)=> index !== _index)
                }   
                
            }
        }

        if(newcontracts.length === 0){
            delete this._nfts[address][networkId]
        }
        if(Object.keys(this._nfts[address]).length === 0){
            delete this._nfts[address]
            return
        }
        this._nfts[address][networkId].contracts = newcontracts
        this._nfts[address][networkId].subscriber= newSubscriber

    }

    public async desactiveorDeleteContract (contractAddress: string, networkId: string, type: ChainType,accounts: AccountEntity[]){
        try{
        const _accounts = accounts.filter((account)=> getType(account.type.toLowerCase()) === type )
        switch(type){
            case ChainType.EVM : {
                await Promise.all(
                    _accounts.map((account) => account.value?.address && this.deleteContractforAccount(account.value?.address,networkId,contractAddress,type ))
                    
            )
            }
            break;
            case ChainType.WASM: {
                await Promise.all(
                    _accounts.map((account) => account.value?.address && this.deleteContractforAccount(account.value?.address,networkId,contractAddress,type ))
            )
            }
        }
        this.nfts.next(this._nfts);
        }
        catch(error){
            console.log("Error: desactiveContract", error)
            throw error
        }
        

    }
    public async getContractInfoEVM (contractAddress: string, networkApi: JsonRpcProvider) {
        const nftInfo : NFTInfo = {
            contractAddress: "",
            collectionName: "",
            collectionSymbol: "",
            isValidated: false,
        }
        try{
            const contract = new Contract(contractAddress,erc721,(networkApi as JsonRpcProvider))
            const [_name, _symbol] = await Promise.all([
                        contract.name(),
                        contract.symbol() || ""
            ])
            if (_name === '' || _symbol === '') {
                return nftInfo
              }
            nftInfo.contractAddress = contractAddress;
            nftInfo.collectionName =_name;
            nftInfo.collectionSymbol= _symbol;
            nftInfo.isValidated = true;
            return nftInfo;
        }
        catch(error){
            return  nftInfo
            
        }

            

    }
        
    private async updateOneNFT (address: string, contractAddress: string, balance: number, type: ChainType, networkId: string, data: any ) {
        const _nfts = this.nfts.getValue();
        const index = _nfts[address][networkId].contracts.findIndex((nft: NFTContract) => nft.contractAddress === contractAddress);
        if(index> -1 ) {
            const balanceChange = _nfts[address][networkId].contracts[index].balance !== balance
            if(balanceChange){
                _nfts[address][networkId].contracts[index].balance = balance
                _nfts[address][networkId].contracts[index].nftsData = data.data
                this.nfts.next(_nfts);
            }    
        }
    }
    private getDefaultWeightV2 (networkApi: ApiPromise, isFallback?: boolean) {
        const proofSize = isFallback ? 3407872 : MAX_CALL_WEIGHT; // TODO: handle error better
        const refTime = isFallback ? 32490000000 : DEFAULT_REF_TIME;
      
        return networkApi.registry.createType('WeightV2', {
          refTime,
          proofSize
        });
      }

      
    // public async getContractInfoWASM (contractAddress: string, networkApi: ApiPromise) {
    //     const nftInfo : NFTInfo = {
    //         contractAddress: "",
    //         collectionName: "",
    //         collectionSymbol: "",
    //         isValidated: true,
    //     }
    //     try{
    //         const contract = new ContractPromise((networkApi as ApiPromise), psp34,contractAddress);
    //         const collectionId = await contract.query['psp34::collectionId'](contractAddress, { gasLimit: (this.getDefaultWeightV2(networkApi)) });
    //         if (!collectionId.result.isOk || !collectionId.output) {
    //             nftInfo.isValidated = false
    //             return nftInfo
    //           } 
    //           else {
    //             const collectionIdResp = collectionId.output?.toHuman() as Record<string, string>;
    //             if (collectionIdResp.Bytes === '') {
    //                 nftInfo.isValidated = false;
    //             } else {
    //               return nftInfo
    //             }
    //           }
    //           return nftInfo;
    //         }
    //         catch(error){
    //                 nftInfo.isValidated = false
    //                 return  nftInfo
            
    //         }

            

    // }

    // private async isAttributeStoredOnChain (contract: ContractPromise,address: string, networkApi: ApiPromise) {
    //     if (!contract.query['psp34Traits::getAttributeCount']) {
    //       return false;
    //     }
    //     const _onChainAttributeCount = await contract.query['psp34Traits::getAttributeCount'](address, { gasLimit: this.getDefaultWeightV2(networkApi) });
    //     const _attributeCount = _onChainAttributeCount?.output?.toJSON() as Record<string, unknown>;
    //     const onChainAttributeCount = _onChainAttributeCount.output ? (_attributeCount?.ok || _attributeCount?.Ok) as string : '0';
    
    //     if (!_onChainAttributeCount.result.isOk) {
    //       return false;
    //     }
    
    //     return !!onChainAttributeCount && parseInt(onChainAttributeCount) !== 0;
    //   }


}