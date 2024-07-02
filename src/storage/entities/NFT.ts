import { ApiPromise} from "@polkadot/api";
import { Contract, JsonRpcProvider} from "ethers";
import { BehaviorSubject } from "rxjs";
import erc721  from "@src/constants/erc721_abi.json"
import { NFT_Address,NFTContract,NFTData,ChainType, NFTInfo } from "@src/types"

const ERC721EnumerableInterfaceId = '0x780e9d63';

export type api = ApiPromise | JsonRpcProvider;
export class NFT {
    public nfts = new BehaviorSubject<NFT_Address>({}); 

    public getNFTS() {
        return  this.nfts;
    }
    public async getCollections(address: string,data: NFTInfo, networkApi:api , type: ChainType, networkId: string){
       
        const _nfts : any = this.nfts.getValue()
        const nft : NFTContract  = {
                                    contractAddress: "",
                                    collectionName: "",
                                    collectionSymbol: "",
                                    owner: "",
                                    balance: 0,
                                    isEnum: false,
                                    nftsData: []
                                    }
        
            
            switch(type){
                case ChainType.EVM:{
                    
                    const contract = new Contract(data.contractAddress,erc721,(networkApi as JsonRpcProvider))

                    const _balance =  await contract.balanceOf(address);
                    const balance = Number(_balance);
                    if( balance === 0) return false


                    nft["contractAddress"] = data.contractAddress
                    nft["collectionName"] = data.collectionName || ""
                    nft["collectionSymbol"] = data.collectionSymbol || ""
                    nft["owner"] = address;
                    nft["balance"] = balance


                    console.log(nft,"NFT DATA")

                    contract.on("Transfer", async (from, to) => {
                        console.log("--------------------------------subscriber-----------------------------")
                        if (from === address || to === address) {
                        const balance = await contract.balanceOf(address);
                        this.updateOneNFT(address,data.contractAddress,Number(balance),type,networkId)
                        }
                    });
                    try{
                        const data = await this.getOwnerTokens(balance, address,contract)
                        if(!data) return
                        
                        nft["nftsData"] = data.data;
                        nft["isEnum"] = data.isEnum;
                        
                        if(!_nfts[address]){
                            _nfts[address]= {
                                [networkId]: {
                                    contracts: [nft],
                                    subscriber: [contract], 
                                    type: ChainType.EVM
                                }}
                            this.nfts.next(_nfts)
                        } 
                        else if(!_nfts[address][networkId]){
                            _nfts[address]= {
                                ..._nfts[address],
                                [networkId]: {
                                    contracts: [nft],
                                    subscriber: [contract], 
                                    type: ChainType.EVM
                                }}
                                this.nfts.next(_nfts)
                        }
                        else{
                            _nfts[address][networkId].contracts.push(nft);
                            _nfts[address][networkId].subscriber.push(contract)
                            this.nfts.next(_nfts)
                        }
                        return true
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
        const isEnumerable = await contract.supportsInterface(ERC721EnumerableInterfaceId)
        if(isEnumerable){
        for(let i = 0; i < balance; i++) {
                const tokenId = await contract.tokenOfOwnerByIndex(address, i); 
                tokenIds.push(tokenId.toString());
        }
        const data = await Promise.all(tokenIds.map(async(tokenId) => {
                        const uri = await contract.tokenURI(tokenId);
                        const response = await fetch(uri)
                        const data = await (response.json() as NFTData)
                        return data
                    }))
        return {data, isEnum: true };
    }
    else{
        return {data: [], isEnum: false};
    }
        }
        catch(error){
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
    private updateOneNFT (address: string, addressContract: string, balance: number, type: ChainType, networkId: string) {
        const _nfts = this.nfts.getValue();
        console.log(address, addressContract, balance, type, networkId,"entrys")
        const index = _nfts[address][networkId].contracts.findIndex((nft: NFTContract) => nft.contractAddress === addressContract);
        console.log( index, "index")
        if(index> -1 ) {
            const balanceChange = _nfts[address][networkId].contracts[index].balance !== balance
            if(balanceChange){
                _nfts[address][networkId].contracts[index].balance = balance
                console.log(_nfts,"New nfts")
                this.nfts.next(_nfts);
            }    
        }   
    }
        
    private deleteOneContract (address: string, networkId: string, contractAddress: string, type: ChainType)  {
        const _nfts = this.nfts.getValue();
        console.log(address, contractAddress, networkId,"entrys")
        const newContrats = _nfts[address][networkId].contracts.filter((nft: NFTContract) => nft.contractAddress !== contractAddress);
        const newSubscriber = _nfts[address][networkId].subscriber.filter((subscraber: Contract) => subscraber.target !== contractAddress)
        const index = _nfts[address][networkId].subscriber.findIndex((subscriber: Contract) =>  subscriber.target === contractAddress);
        console.log( index, "index")
        
       switch(type){
        case ChainType.EVM: {
            if(index> -1 ) { 
            _nfts[address][networkId].contracts = newContrats;
            _nfts[address][networkId].subscriber = newSubscriber;
            _nfts[address][networkId].subscriber[index].off("Transfer")
            console.log(_nfts, "new nfts")
            this.nfts.next(_nfts);
        }

       }
    }
          
    }

}