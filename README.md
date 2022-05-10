# NFT generator LeningradTile
<img width="858" alt="1" src="https://user-images.githubusercontent.com/59762084/167562410-ad477c10-79a6-4a97-af55-4f5168150633.png">

1) initialize a new project:
```
mkdir leningrad_tile
cd leningrad_tile
npm init
```

2) install dependencies:
```
npm install --save-dev hardhat
npm install --save-dev @nomiclabs/hardhat-ethers
npm install --save-dev @nomiclabs/hardhat-etherscan
npm install --save-dev ethers@^5.0.0
npm install --save-dev node-fetch@2
npm install --save nft.storage
npm install @openzeppelin/contracts
npm install dotenv --save
npm install fs --save 
npm install https --save 
npm install jimp --save 
npm install child_process --save 
npm install @ipld/car --save 
```

3) initialize the Hardhat ("Create an empty hardhat.config.js"):
```
npx hardhat
```

4) deploy new contract:
```
npx hardhat compile
npx hardhat deploy
```

5) verify your smart contract on Etherscan:
```
npx hardhat verify $NFT_CONTRACT_ADDRESS $BASE_TOKEN_URI
```

6) mint (set a new NFT_CONTRACT_ADDRESS before):
```
npx hardhat mint --address $ADDRESS
```

## References:
https://docs.opensea.io/docs/getting-started-1
