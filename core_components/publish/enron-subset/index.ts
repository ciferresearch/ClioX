import { readFileSync } from 'fs';
import { AssetBuilder } from '@deltadao/nautilus'
import { ServiceFileType } from '@deltadao/nautilus'
import { FileTypes, ServiceTypes, ServiceBuilder } from '@deltadao/nautilus'

const publish = async (folder: string, connection: any, provider: string, dryRun: boolean) => {
  const assetBuilder = new AssetBuilder();
  assetBuilder.setType('dataset')
      .setName(`Cameroon Gazette Dataset`)
      .setAuthor('University of British Columbia (UBC)')
      .setOwner(connection.wallet.address)
      .setDescription(readFileSync(`${folder}/description.md`, 'utf8'))
      .addTags(['cliox', 'data', 'archive'])
      .setLicense('unlicensed')
      .setNftData({
          name: 'UBC-CG',
          symbol: 'UBC-CG',
          templateIndex: 1,
          tokenURI: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/UBC_COA.svg/250px-UBC_COA.svg.png',
          transferable: false
      });

  const serviceBuilder =
      new ServiceBuilder({ serviceType: ServiceTypes.COMPUTE, fileType: FileTypes.URL});
  const urlFile: ServiceFileType<FileTypes> = {
    type: 'url',
    url: `https://guuy63ay81.execute-api.us-west-2.amazonaws.com/data`,
    method: 'GET'
  }
  const service = serviceBuilder
      .setServiceEndpoint(provider) // the access controller to be in control of this asset
      .setTimeout(0) // Timeout in seconds (0 means unlimited access after purchase)
      .addFile(urlFile)
      .addTrustedAlgorithms([{
            'did': 'did:op:103deb9f2620ceb54a0dfd62c96317884ff84dda3b9dd553e29c4eadebdfa6dc' // Text Analysis
      }])
      .setPricing(connection.pricingConfig.fixedRateEUROe(0))
      .setDatatokenNameAndSymbol(`UBC-CG`, `UBC-CG`)
      .build();
  assetBuilder.addService(service);
  const asset = assetBuilder.build();
    console.log(`Asset metadata: \n ${JSON.stringify(asset, null, 2)}`);

    if (!dryRun) {
        console.log(`Publishing asset...`);
        const result = await connection.nautilus.publish(asset);
        console.log(`Asset published, ` +
            `transaction: ${connection.networkConfig.explorerUri}/tx/${result.setMetadataTxReceipt.transactionHash}\n`);
    } else {
        console.log('\nDry run completed. Asset not published.\n');
    }
};
