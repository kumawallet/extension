import { utils} from 'ethers'

export const getHash = (hash: string) => {
    return hash.slice(0, 12) + "..." + hash.slice(-12)
  }
export const getValue = (data: any) => {
    if (!data || !data.value) return "$0.0";
    return data.symbol ? `${data.value} ${data.symbol}` : `$${data.value}`;
  };

export const getTip=(data: any, tip?: string) =>{
    if(!tip || !!data.tip) return `0.0 ${data.symbol}`
    return `${tip || data.tip} ${data.symbol}`
  }

export const estimatedFee= (data: any) => {
    if(data.fee){
      return data.fee;
    }
    const fee = utils.formatEther(BigInt(data.gas)*BigInt(data.gasPrice));
    return `${fee} ${data.symbol}`;
  }