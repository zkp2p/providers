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
1. Inspect network tab in Dev Tools after logging into your payment website. Or turn on Intercepted Requests in ZKP2P sidebar
2. Find a request that contains amount, timestamp / date, recipient ID at a minimum. Look for additional params such as status (to see if payment finalized), currency (if platform supports more than 1 currency)
3. Based on the request, populate the template.

## Select Template Parameters
- **fallbackUrlRegex**: This is for if the original urlRegex does not exist for certain accounts. It's rare, but view the Revolut template for an example.
- **preprocessRegex**: If the response for the metadata is in HTML, we assume that there is a JSON somewhere that contains this metadata. The preprocess regex removes all of the surrounding HTML. View Mercado Pago for an example
- **skipRequestHeaders**: If the array is empty then no request headers will be populated besides the ones that you input in secretHeaders. If there are headers, then these will be skipped and the rest will be sent to the server
- **secretHeaders**: If there are secret headers, you must add them to skip request headers too if the array is populated. If empty, then you do not need to. Secret headers are not seen by the notary proxy, so keep Cookies and other authorization keys here

## Common Issues
### Authenticate does not open desired auth link
Check the Base URL you have set in the extension. Ensure you are running the server which is hosted in port 8080

### Authenticated into your payment platform but not redirected back to developer.zkp2p.xyz
There is an issue with the urlRegex for metadata extraction. Double check your regex is correct

### Metadata returned to app, but Prove fails
There is an issue with the response redactions or headers for the server call. If error is JSON path not found or regex not found then check your response redactions parameters. If it returns a error that is not 200, the server has rejected your request, so there is an issue with your headers, request body.

![X-blob-background-1500x500px](https://github.com/zkp2p/zk-p2p/assets/6797244/65e8ae36-eb8b-4b53-85e9-fa0801bafcf0)
