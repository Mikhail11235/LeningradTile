const { getEnvVariable } = require("./helpers");
const { NFTStorage, Blob } = require("nft.storage")
const grayStyle = require("./consts");
const fs = require('fs');
const https = require('https');
const random = require('random');
const Jimp = require('jimp');
const { execSync } = require('child_process');
const { createReadStream } = require('fs')
const { CarReader } = require('@ipld/car')


function get_static_style(styles) {
    var result = [];
    styles.forEach(function(v, i, a) {
        var style='';
        if (v.stylers.length > 0) {
            style += (v.hasOwnProperty('featureType') ? 'feature:' + v.featureType : 'feature:all') + '|';
            style += (v.hasOwnProperty('elementType') ? 'element:' + v.elementType : 'element:all') + '|';
            v.stylers.forEach(function(val, i, a) {
                var propertyname = Object.keys(val)[0];
                var propertyval = val[propertyname].toString().replace('#', '0x');
                style += propertyname + ':' + propertyval + '|';
            });
        }
        result.push('style='+encodeURIComponent(style))
    });
    return result.join('&');
}

function getImageUrl(params) {
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${params["lat"]},${params["long"]}&zoom=18&size=400x400&scale=2&key=${getEnvVariable("GOOGLE_MAP_API")}`;
    console.log(url);
    return url + "&" + get_static_style(grayStyle);
}

async function downloadImage(url, dest) {
    var file = fs.createWriteStream(dest);
    return new Promise((resolve, reject) => {
        var responseSent = false;
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    if(responseSent) return;
                    responseSent = true;
                    resolve();
                });
            });
        }).on('error', err => {
            if(responseSent) return;
            responseSent = true;
            reject(err);
        });
    });
}

function generateRandomParams() {
    var params = {
        "lat": random.float((min = 59.907034), (max = 59.987154)),
        "long": random.float((min = 30.181176), (max = 30.41188))
    };
    return params;
}

function generateMetadata(params, metadataPath, tokenId, cid) {
    data = {
        "description": `Leningrad tile (created not for bookmarks)`,
        "external_url": `https://example.com/?token_id=${tokenId}`,
        "image": `https://${cid}.ipfs.nftstorage.link`,
        "name": `Leningrad tile #${tokenId}`,
        "properties": params
    };
    fs.writeFileSync(metadataPath, JSON.stringify(data, null, 4));
}

async function crop(imagePath) {
    const image = await Jimp.read(imagePath);
    await image.crop(0, 45, 710, 710);
    await image.writeAsync(imagePath);
}

async function storeFile(filePath, client) {
    const data = await fs.promises.readFile(filePath);
    const cid = await client.storeBlob(new Blob([data]));
    console.log(`File uploaded via nft.storage with cid: ${cid}`);
    return cid
}

function generateCarFile(appRoot) {
    execSync(`ipfs-car --pack ${appRoot}/files/metadata --output ${appRoot}/files/metadata.car`);
}

async function storeCarFile(filename, client) {
    const inStream = createReadStream(filename);
    const car = await CarReader.fromIterable(inStream);
    const cid = await client.storeCar(car);
    console.log('Stored CAR file! CID:', cid);
    return cid;
  }

async function StoreMetadata() {
    var imagePath, params, imageUrl, imageCid;
    const appRoot = process.env.PWD;
    const client = new NFTStorage({ token: getEnvVariable("NFT_STORAGE_API_KEY") });
    for (var tokenId = 1; tokenId <= 10; tokenId++) {
        imagePath = `${appRoot}/files/images/${tokenId}.png`;
        metadataPath = `${appRoot}/files/metadata/${tokenId}`;
        params = generateRandomParams();
        imageUrl = getImageUrl(params);
        await downloadImage(imageUrl, imagePath);
        await crop(imagePath);
        imageCid = await storeFile(imagePath, client);
        generateMetadata(params, metadataPath, tokenId, imageCid);
    }
    generateCarFile(appRoot);
    const metadataCid = await storeCarFile(`${appRoot}/files/metadata.car`, client);
    return metadataCid;
}

module.exports = {
    StoreMetadata,
}