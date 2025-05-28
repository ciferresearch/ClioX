import { readFileSync } from 'fs';
import { AssetBuilder, ConsumerParameterBuilder, CredentialListTypes } from '@deltadao/nautilus'
import { ServiceFileType } from '@deltadao/nautilus'
import { FileTypes, ServiceTypes, ServiceBuilder } from '@deltadao/nautilus'

const publish = async (folder: string, connection: any, provider: string, dryRun: boolean) => {
    const assetBuilder = new AssetBuilder();
    assetBuilder.setType('algorithm')
        .setName(`Text Analysis`)
        .setAuthor('University of British Columbia (UBC)')
        .setOwner(connection.wallet.address)
        .setDescription(readFileSync(`${folder}/description.md`, 'utf8'))
        .addTags(['cliox', 'text', 'analysis', 'archive'])
        .setLicense('unlicensed')
        .setNftData({
            name: 'UBC Text Analysis',
            symbol: 'UBC-TA',
            templateIndex: 1,
            tokenURI: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/UBC_COA.svg/250px-UBC_COA.svg.png',
            transferable: false
        });
    const algoMetadata = {
        language: 'python',
        version: '0.1',
        container: {
            entrypoint: "python /algorithm/src/main.py",
            image: 'rogargon/text-analysis-algo',
            tag: 'latest',
            checksum: 'sha256:ac76cabbab076b0bd3ccccc9390124c82e28ea0ff6f5a910f6da5d5d29a27ebf'
        }
    };
    assetBuilder.setAlgorithm(algoMetadata);
    const serviceBuilder =
        new ServiceBuilder({ serviceType: ServiceTypes.COMPUTE, fileType: FileTypes.URL});
    const urlFile: ServiceFileType<FileTypes> = {
        type: 'url',
        url: 'https://raw.githubusercontent.com/AgrospAI/ocean-algo/refs/heads/main/_base/python/algorithm/src/main.py',
        method: 'GET'
    };
    const service = serviceBuilder
        .setServiceEndpoint(provider) // the access controller to be in control of this asset
        .setTimeout(0) // Timeout in seconds (0 means unlimited access after purchase)
        .addFile(urlFile)
        .setPricing(connection.pricingConfig.fixedRateEUROe(0.5))
        .setDatatokenNameAndSymbol('UBC Text Analysis', 'UBC-TA')
        .build();
    service.compute.allowNetworkAccess = true;
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
