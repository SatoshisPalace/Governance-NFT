import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const wallet = new Wallet(process.env.MNEMONIC);

const contract_wasm = fs.readFileSync("../contract.wasm.gz");

// const secretjs = new SecretNetworkClient({
//   chainId: "secretdev-1",
//   url: "http://localhost:26657",
//   wallet: wallet,
//   walletAddress: wallet.address,
// });
const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://api.pulsar3.scrttestnet.com",
  wallet: wallet,
  walletAddress: wallet.address,
});
let upload_contract = async () => {
    let tx = await secretjs.tx.compute.storeCode(
      {
        sender: wallet.address,
        wasm_byte_code: contract_wasm,
        source: "",
        builder: "",
      },
      {
        gasLimit: 4_000_000,
      }
    );
  
    const codeId = Number(
      tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
        .value
    );
  
    console.log("codeId: ", codeId);
  
    const contractCodeHash = (
      await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
    ).code_hash;
    console.log(`Contract hash: ${contractCodeHash}`);
    
  };
  
upload_contract();

const codeId = 22583;
const contractCodeHash = "430269fe2ba7c4bc5d6335720db972f599de404113ce643649caea9517789039";

let instantiate_contract = async () => {
    // Create an instance of the NFT contract
    const initMsg = { 
      name: "SP Gov NFT",
      symbol: "SPNFT",
      admin: "secret1h63sr66matcavp8f4cgkmpjajjv3wz89s3wyw0",
      entropy: "apples",
      config: {
        public_owner: true,
      },
    };
    let tx = await secretjs.tx.compute.instantiateContract(
      {
        code_id: codeId,
        sender: wallet.address,
        code_hash: contractCodeHash,
        init_msg: initMsg,
        label: "demoNFTContract" + Math.ceil(Math.random() * 10000),
      },
      {
        gasLimit: 400_000,
      }
    );
  
    //Find the contract_address in the logs
    const contractAddress = tx.arrayLog.find(
      (log) => log.type === "message" && log.key === "contract_address"
    ).value;
  
    console.log(contractAddress);
  };
// instantiate_contract();

const contractAddress = "secret15gmf9axnsg8s5t5vv4w726lkfrwjgusqaj83zr";

let addMinter = async () => {
  const contest_creation_tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      msg: {
        add_minters: {
          minters:["secret1t9nl5nzxmcxclrkg5j5uu09fnzgw3696vqnthp"],
        },
      },
      code_hash: contractCodeHash,
    },
    { gasLimit: 100_000 }
  );

  console.log(contest_creation_tx);
};
// addMinter();

let mintNFT = async () => {
    const contest_creation_tx = await secretjs.tx.compute.executeContract(
      {
        sender: wallet.address,
        contract_address: contractAddress,
        msg: {
          mint_nft: {
            
          },
        },
        code_hash: contractCodeHash,
      },
      { gasLimit: 100_000 }
    );
  
    console.log(contest_creation_tx);
  };
// mintNFT();

let queryContest = async () => {
    let contest_query_tx = await secretjs.query.compute.queryContract({
      contract_address: contractAddress,
      query: {
        get_contest: {
          index: 0,
        },
      },
      code_hash: contractCodeHash,
    });
  
    console.log(contest_query_tx);
  };
//queryContest();