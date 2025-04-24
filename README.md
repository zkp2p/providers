# ZKP2P Provider Templates

This repo houses the JSON providers used in ZKP2P PeerAuth Extension. ZKP2P is live in production at [zkp2p.xyz](https://zkp2p.xyz/). PeerAuth is a browser extension that allows you to authenticate internet data in a privacy preserving way using web proofs / zkTLS

## Developer Quickstart
To get started building a new provider, you will need to setup a local version of 
1. Clone the repo
2. Run `yarn install` and `yarn start`. App is hosted on [http://localhost:8080](http://localhost:8080)
3. Install the [PeerAuth extension](https://chromewebstore.google.com/detail/peerauth-authenticate-and/ijpgccednehjpeclfcllnjjcmiohdjih) in your browser
3. Create a new directory and JSON file and add the necessary provider data for your integration
4. Test your integration by going to [developer.zkp2p.xyz](https://developer.zkp2p.xyz/)
5. Click on Open Settings on the page and set Base URL to http://localhost:8080. Any changes to your JSON will now be reflected in the extension and developer app.
6. Update the inputs with the right path to your integration `localhost:8080/{platform_name}/{provider_name}.json`
7. Click Authenticate

## Creating a Provider
Inspect network tab in Dev Tools after logging into your payment website. Or turn on Intercepted Requests in ZKP2P sidebar

![X-blob-background-1500x500px](https://github.com/zkp2p/zk-p2p/assets/6797244/65e8ae36-eb8b-4b53-85e9-fa0801bafcf0)
