import { ApiPromise} from "@polkadot/api";
import { Contract, JsonRpcProvider} from "ethers";
import { BehaviorSubject } from "rxjs";
import erc721  from "@src/constants/erc721_abi.json"
import { NFT_Address,NFTContract,ChainType, NFTInfo, NFTData } from "@src/types";


//const ERC721EnumerableInterfaceId = '0x780e9d63';

export type api = ApiPromise | JsonRpcProvider;
export class NFT {
    public nfts = new BehaviorSubject<NFT_Address>({}); 
    public _nfts: NFT_Address = {}
    public contracts: string[] = [];

    public getNFTS() {
        return  this.nfts;
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
                        const _data = await this.getOwnerTokens(balance, address, contract)
                        this.updateOneNFT(address,data.contractAddress,Number(balance),type,networkId,_data );
                        }
                    });
                    try{
                        const data = await this.getOwnerTokens(balance, address,contract)
                        if(!data) return

                        nft["nftsData"] = data.data;
                        nft["isEnum"] = data.isEnum;
                        
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
                }

    }
    public async getOwnerTokens(balance: number,address : string, contract: Contract) {
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
                        contract.symbol()
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

}