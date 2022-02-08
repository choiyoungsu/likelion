import Caver from 'caver-js';
import KIP17ABI from '../abi/KIP17TokenABI';
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY, COUNT_CONTRACT_ADDRESS, CHAIN_ID, NFT_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS} from '../constants';
const option = {
    headers: [
      {
        name: "Authorization",
        value: "Basic " + Buffer.from(ACCESS_KEY_ID + ":" + SECRET_ACCESS_KEY).toString("base64")
      },
      { name: "x-chain-id", value: CHAIN_ID }
    ]
  }
  const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option))
  const NFTContract = new caver.contract(KIP17ABI, NFT_CONTRACT_ADDRESS);
  
  export const fetchCardsOf = async (address) => {
    // fetch Balance
    const balance = await NFTContract.methods.balanceOf(address).call();
    console.log(`[NFT Balance]${balance}`);
    // fetch Token Ids
    const tokenIds = [];
    for (let i = 0; i < balance; i++){
      const id = await NFTContract.methods.tokenOfOwnerByIndex(address, i).call();
      tokenIds.push(id);
    }
    // fetch Token URIs
   const tokenURIs = [];
    for (let i = 0; i < balance; i++){
      const uri = await NFTContract.methods.tokenURI(tokenIds[i]).call();
      tokenURIs.push(uri);
    }
    console.log(`${tokenIds}`);
    console.log(`${tokenURIs}`);
    console.log(`${tokenURIs[0]}`);
    
    const nfts = [];
    for (let i = 0; i < balance; i++){
      nfts.push({uri: tokenURIs[i], id: tokenIds[i] });
    }
    console.log(nfts);
    return nfts;
  };

  export const getBalance = (address) => {
    return caver.rpc.klay.getBalance(address).then((response) => {
      const balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(response));
      console.log(`BALANCE: ${balance}`)
      return balance;
    })
  }

  // const CountContract = new caver.contract(CounterABI, COUNT_CONTRACT_ADDRESS);

  // export const readCount = async () => {
  //   const _count = await CountContract.methods.count().call();
  //   console.log(_count);
  // }

  // export const setCount = async (newCount) => {
  //   try {
  //     //사용 account 설정
  //     const privatekey = '0x0e642b7ff8ec1ce07fc90e28b69ee528b8010531686efd154ec782cbf7857b13';
  //     const deployer = caver.wallet.keyring.createFromPrivateKey(privatekey);
  //     caver.wallet.add(deployer);
  
  //     //스마트 컨트랙트 실행 트랙잭션 날리기
  
  //     // 결과확인
  //     const receipt = await CountContract.methods.setCount(newCount).send({
  //       from: deployer.address,
  //       gas: "0x4bfd200"
  //     })
  //     console.log(receipt);
  //   } catch (e) {
  //     console.log(` [ERROR_EST_COUNT]${e}`)
  //   }
  // }