# ZKP2P Provider Templates

This repo houses the JSON providers used in ZKP2P PeerAuth Extension and ZKP2P React Native SDK. ZKP2P is live in production at [zkp2p.xyz](https://zkp2p.xyz/). PeerAuth is a browser extension that allows you to authenticate internet data in a privacy preserving way using web proofs / zkTLS

## Developer Quickstart
To get started building a new provider, you will need to setup a local version of 
1. Clone the repo
2. Run `yarn install` and `yarn start`. App is hosted on [http://localhost:8080](http://localhost:8080)
3. Install the [PeerAuth extension](https://chromewebstore.google.com/detail/peerauth-authenticate-and/ijpgccednehjpeclfcllnjjcmiohdjih) in your browser
3. Create a new directory and JSON file and add the necessary provider data for your integration
4. Test your integration by going to [developer.zkp2p.xyz](https://developer.zkp2p.xyz/)
5. Click on Open Settings on the page and set Base URL to `http://localhost:8080/`. Any changes to your JSON will now be reflected in the extension and developer app.
6. Update the inputs with the right path to your integration `localhost:8080/{platform_name}/{provider_name}.json`
7. Click Authenticate to extract metadata
8. If successful, proceed to Prove a specific transaction

## Provider Configuration Guide

This guide explains how to create and configure provider templates for the ZKP2P PeerAuth extension. Provider configurations define how to extract and verify data from various platforms.

### Table of Contents
- [Getting Started](#getting-started)
- [Configuration Structure](#configuration-structure)
- [Field Descriptions](#field-descriptions)
- [Parameter Extraction](#parameter-extraction)
- [Best Practices](#best-practices)
- [Common Issues](#common-issues)

### Getting Started
1. Inspect network tab in Dev Tools after logging into your payment website. Or turn on Intercepted Requests in ZKP2P sidebar
2. Find a request that contains amount, timestamp / date, recipient ID at a minimum. Look for additional params such as status (to see if payment finalized), currency (if platform supports more than 1 currency)
3. A tip is to look for where the transactions page is. Sometimes the transactions are expandable so you can log those too
4. Based on the request, populate the template.

### Configuration Structure

```json
{
  "actionType": "transfer_venmo",
  "authLink": "https://account.venmo.com/?feed=mine",
  "url": "https://account.venmo.com/api/stories?feedType=me&externalId={{SENDER_ID}}",
  "method": "GET",
  "skipRequestHeaders": [],
  "body": "",
  "metadata": {
    "platform": "venmo",
    "urlRegex": "https://account.venmo.com/api/stories\\?feedType=me&externalId=\\S+",
    "method": "GET",
    "transactionsExtraction": {
      "transactionJsonPathListSelector": "$.stories"
    }
  },
  "paramNames": ["SENDER_ID"],
  "paramSelectors": [{
    "type": "jsonPath",
    "value": "$.stories[{{INDEX}}].title.sender.id"
  }],
  "secretHeaders": ["Cookie"],
  "responseMatches": [{
    "type": "regex",
    "value": "\"amount\":\"-\\$(?<amount>[^\"]+)\""
  }],
  "responseRedactions": [{
    "jsonPath": "$.stories[{{INDEX}}].amount",
    "xPath": ""
  }],
  "mobile": {
    "actionLink": "venmo://paycharge?txn=pay&recipients={{RECEIVER_ID}}&note=cash&amount={{AMOUNT}}"
  }
}
```

### Field Descriptions

#### Basic Configuration

#### `actionType` (required)
- **Type**: `string`
- **Description**: Identifier for the action type (e.g., "transfer_venmo", "receive_payment")
- **Example**: `"transfer_venmo"`

#### `authLink` (required)
- **Type**: `string`
- **Description**: URL for user authentication/login page
- **Example**: `"https://venmo.com/login"`

#### `url` (required)
- **Type**: `string`
- **Description**: API endpoint URL for the main request
- **Example**: `"https://api.venmo.com/v1/payments"`

#### `method` (required)
- **Type**: `string`
- **Description**: HTTP method for the request
- **Values**: `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`
- **Example**: `"POST"`

#### `skipRequestHeaders` (optional)
- **Type**: `string[]`
- **Description**: Headers to exclude from the notarized request.
- **Example**: `["User-Agent", "Accept-Language"]`

#### `body` (optional)
- **Type**: `string`
- **Description**: Request body template (for POST/PUT requests)
- **Example**: `"{\"amount\": \"{{AMOUNT}}\", \"recipient\": \"{{RECIPIENT}}\"}""`


#### Metadata Configuration

#### `metadata` (required)
- **Type**: `object`
- **Description**: Configuration for request matching and transaction extraction

```json
"metadata": {
  "shouldReplayRequestInPage": false,
  "platform": "venmo",
  "urlRegex": "https://api\\.venmo\\.com/v1/payments/\\d+",
  "method": "GET",
  "fallbackUrlRegex": "https://api\\.venmo\\.com/v1/transactions",
  "fallbackMethod": "GET",
  "preprocessRegex": "window\\.__data\\s*=\\s*({.*?});",
  "transactionsExtraction": {
    "transactionJsonPathListSelector": "$.data.transactions",
    "transactionRegexListSelectors": {
      "paymentId": "js_transactionItem-([A-Z0-9]+)"
    },
    "transactionJsonPathSelectors": {
      "recipient": "$.target.username",
      "amount": "$.amount",
      "date": "$.created_time",
      "paymentId": "$.id",
      "currency": "$.currency"
    }
  },
  "proofMetadataSelectors": [
    {
      "type": "jsonPath",
      "value": "$.data.user.id"
    }
  ]
}
```

#### Parameter Extraction

#### `paramNames` (required)
- **Type**: `string[]`
- **Description**: Names of parameters to extract
- **Example**: `["transactionId", "amount", "recipient"]`

#### `paramSelectors` (required)
- **Type**: `ParamSelector[]`
- **Description**: Selectors for extracting parameter values

```typescript
interface ParamSelector {
  type: 'jsonPath' | 'regex';
  value: string;
}
```

#### Security Configuration

#### `secretHeaders` (optional)
- **Type**: `string[]`
- **Description**: Headers containing sensitive data (e.g., auth tokens)
- **Example**: `["Authorization", "Cookie"]`

#### Response Verification

#### `responseMatches` (required)
- **Type**: `ResponseMatch[]`
- **Description**: Patterns to verify in the response

```json
"responseMatches": [
  {
    "type": "jsonPath",
    "value": "$.data.transactions[{{INDEX}}].id",
    "hash": false
  },
  {
    "type": "regex",
    "value": "\"status\":\\s*\"completed\"",
    "hash": true
  }
]
```

#### `responseRedactions` (optional)
- **Type**: `ResponseRedaction[]`
- **Description**: Data to redact from the response for privacy

```json
"responseRedactions": [
  {
    "jsonPath": "$.data.user.email",
    "xPath": ""
  },
  {
    "jsonPath": "$.data.ssn",
    "xPath": ""
  }
]
```

#### Additional Options

#### `mobile` (optional)
- **Type**: `object`
- **Description**: Configuration for mobile app deep linking and functionality

```json
"mobile": {
  "includeAdditionalCookieDomains": [],
  "actionLink": "venmo://paycharge?txn=pay&recipients={{RECEIVER_ID}}&note=cash&amount={{AMOUNT}}",
  "isExternalLink": true,
  "appStoreLink": "https://apps.apple.com/us/app/venmo/id351727428",
  "playStoreLink": "https://play.google.com/store/apps/details?id=com.venmo"
}
```

**Fields:**
- `includeAdditionalCookieDomains`: Array of additional cookie domains to include
- `actionLink`: Deep link URL for the mobile app with placeholders for dynamic values
- `isExternalLink`: Boolean indicating if the action link is external
- `appStoreLink`: iOS App Store URL for the app
- `playStoreLink`: Google Play Store URL for the app

#### `additionalClientOptions` (optional)
- **Type**: `object`
- **Description**: Extra client configuration options (not commonly used)

```json
"additionalClientOptions": {
  "cipherSuites": ["TLS_AES_128_GCM_SHA256"]
}
```

#### `additionalProofs` (optional)
- **Type**: `AdditionalProof[]`
- **Description**: Configuration for generating multiple proofs from different endpoints (not commonly used)

#### Parameter Extraction

##### Extraction Types

###### JSONPath
Use JSONPath expressions for structured data:
```json
{
  "type": "jsonPath",
  "value": "$.data.transactions[{{INDEX}}].amount"
}
```

**Special features:**
- `{{INDEX}}` placeholder for array indexing
- Supports nested paths: `$.user.profile.email`
- Array filters: `$.items[?(@.status=='active')]`

###### Regex
Use regular expressions for pattern matching:
```json
{
  "type": "regex",
  "value": "transactionId\":\\s*\"([^\"]+)\""
}
```

**Notes:**
- First capture group `()` is used as the extracted value
- Escape special characters: `\\.` for dots
- Use `\\s*` for flexible whitespace matching

### Best Practices

#### 1. URL Regex Patterns
- Escape special characters: `\\.` for dots
- Use specific patterns to avoid false matches
- Test regex patterns thoroughly

#### 2. Parameter Extraction
- Use JSONPath for structured JSON data
- Use regex for HTML, text responses, or complex patterns
- Always specify capture groups `()` for regex extraction
- Parameters are extracted from the response body by default

#### 3. Security
- List all sensitive headers in `secretHeaders`
- Use `responseRedactions` to remove PII
- Never expose authentication tokens in `responseMatches`

##### `transactionRegexSelectors` (optional)
- **Type**: `string`
- **Description**: Regular expression pattern to extract transaction identifiers from HTML/text responses
- **Alternative to**: `transactionJsonPathListSelector` when dealing with non-JSON responses
- **Example**: `"js_transactionItem-([A-Z0-9]+)"`
- **Use case**: Use this when transactions are embedded in HTML or when the response is not structured JSON

**Note**: Use either `transactionJsonPathListSelector` (for JSON responses) or `transactionRegexSelectors` (for HTML/text responses), not both.

#### 4. Error Handling
- Provide fallback URLs when primary endpoints might fail
- Use preprocessing regex for embedded JSON data
- Test extraction selectors with various response formats

#### 5. Performance
- Minimize the number of `responseMatches` for faster verification
- Use specific JSONPath expressions instead of wildcards
- Consider response size when designing redactions

### Common Issues
- **Authenticate does not open desired auth link**: Check the Base URL you have set in the extension. Ensure you are running the server which is hosted in port 8080
- **Authenticated into your payment platform but not redirected back to developer.zkp2p.xyz**: There is an issue with the urlRegex for metadata extraction. Double check your regex is correct
- **Metadata returned to app, but Prove fails**: There is an issue with the response redactions or headers for the server call. If error is JSON path not found or regex not found then check your response redactions parameters. If it returns a error that is not 200, the server has rejected your request, so there is an issue with your headers, request body.

## Contributing
We want to make this the largest open source repository of provider templates for global payment platforms. Please open a PR when you have created and tested your template

![X-blob-background-1500x500px](https://github.com/zkp2p/zk-p2p/assets/6797244/65e8ae36-eb8b-4b53-85e9-fa0801bafcf0)
