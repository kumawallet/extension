import { ApiPromise} from "@polkadot/api";
import { ChainType } from "@src/types";
import { Contract, JsonRpcProvider } from "ethers";
import { BehaviorSubject } from "rxjs";
import erc721  from "@src/constants/erc721_abi.json"
import { nftContract, nftData} from "@src/types"




export type api = ApiPromise | JsonRpcProvider;


export class NFT {
    public nfts = new BehaviorSubject<nftContract[]>([]); 

    public getNFTS() {
        return  this.nfts;
    }
    public async getCollections(address: string,contractAddress: string, networkApi:api , type: ChainType){
        const _nfts = this.nfts.getValue()
        const nft : any = {}
        try{
            
            switch(type){
                case "evm":{
                    
                    const contract = new Contract(contractAddress,erc721,(networkApi as JsonRpcProvider))

                    console.log(contract, "Contract");

                    const [_name, _symbol, _balance] = await Promise.all([
                        contract.name(),
                        contract.symbol(),
                        contract.balanceOf(address)
                    ])
                    
                    nft["contractAddress"] = contractAddress
                    nft["collectionName"] = _name
                    nft["collectionSymbol"] = _symbol
                    nft["balance"] = _balance
                    console.log(nft,"NFT DATA")

                    const data = await this.getOwnerTokens(_balance, address,contract)


                    if(!data){
                        nft["nftsData"] = [];
                    }
                    else{
                        nft["nftsData"] = data.data;
                        nft["isEnum"] = data.isEnum;
                    }
                    _nfts.push(nft);
                    this.nfts.next(_nfts)
                    }
                    }
                }
        catch(error){
            console.log("Error getCollection: ", error);
            throw new Error("Error_getCollection");
            
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
                        console.log(uri, "URI")
                        const response = await fetch(uri)
                        const data = await (response.json() as nftData)
                        data["tokenId"] = tokenId
                        return data
                    }))
        return {data, isEnum: true };
        }
        catch(error){
            if(String(error).startsWith("Error: missing revert data in call exception; Transaction reverted without a reason string")){
                console.log("Is not enumerable");
                return {data: [], isEnum: false};
            }
            else{
                console.log("error getOwnerTokens : ", error);
                throw error;
            }
            
        }
      }

}