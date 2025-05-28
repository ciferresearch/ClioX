# Automated Assets Publishing

First, install the Pontus-X CLI tool if not already installed:

```shell
npm install -g pontus-x_cli
```

Export your private key from MetaMask if not already available as a JSON file:

```shell
pontus-x_cli export-private-key
```

Follow instruction to export the private key and save it as `<public-key>.json`.

Then, create an .env file in your working directory with the following content:

```env
NETWORK=PONTUSXTEST ;Options: PONTUSXTEST, PONTUSXDEV
```

Login using the previous file:

```shell
pontus-x_cli login <public-key>.json
```

Now, you can publish assets and algorithms as the currently logged in in the network configured in the .env file.

To publish the Enron dataset:

```shell
pontus-x_cli publish --provider https://provider.angliru.udl.cat publish/enron-subset
```

To publish the text analysis algorithm:

```shell
pontus-x_cli publish --provider https://provider.angliru.udl.cat publish/text-analysis
```
