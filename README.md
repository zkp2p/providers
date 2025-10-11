# ZKP2P Provider Templates

This repo houses the JSON providers used in ZKP2P PeerAuth Extension and ZKP2P React Native SDK. ZKP2P is live in production at [zkp2p.xyz](https://zkp2p.xyz/). PeerAuth is a browser extension that allows you to authenticate internet data in a privacy preserving way using web proofs / zkTLS

## Package Usage (npm)

This package is data-only. Consumers import the JSON templates directly via deep import paths, or read the included manifest.

Install:

```bash
npm install @zkp2p/providers
# or
yarn add @zkp2p/providers
```

CommonJS (Node):

```js
const zelle = require('@zkp2p/providers/citi/transfer_zelle.json');
console.log(zelle.actionType);
```

ESM (Node with import assertions):

```js
import zelle from '@zkp2p/providers/citi/transfer_zelle.json' assert { type: 'json' };
console.log(zelle.actionType);
```

Manifest (providers.json):

```js
// CJS
const manifest = require('@zkp2p/providers/providers.json');
for (const p of manifest.providers) console.log(p.id, p.files);

// ESM
import manifest from '@zkp2p/providers/providers.json' assert { type: 'json' };
```

Notes:
- No runtime code is shipped; only JSON and docs.
- Deep imports like `@zkp2p/providers/<provider>/<file>.json` are stable entry points.
- Bundlers (Webpack/Vite) support JSON imports by default.


## Developer Quickstart
Note: The npm package is data-only. The local dev server described here is for development/testing in this repo and is not included in the published package.
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
    "shouldSkipCloseTab": false,
    "transactionsExtraction": {
      "transactionJsonPathListSelector": "$.stories"
    }
  },
  "paramNames": ["SENDER_ID"],
  "paramSelectors": [{
    "type": "jsonPath",
    "value": "$.stories[{{INDEX}}].title.sender.id",
    "source": "responseBody"
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
    "includeAdditionalCookieDomains": [],
    "useExternalAction": true,
    "external": {
      "actionLink": "venmo://paycharge?txn=pay&recipients={{RECEIVER_ID}}&note=cash&amount={{AMOUNT}}",
      "appStoreLink": "https://apps.apple.com/us/app/venmo/id351727428",
      "playStoreLink": "https://play.google.com/store/apps/details?id=com.venmo"
    }
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
  "shouldSkipCloseTab": false,
  "platform": "venmo",
  "urlRegex": "https://api\\.venmo\\.com/v1/payments/\\d+",
  "method": "GET",
  "fallbackUrlRegex": "https://api\\.venmo\\.com/v1/transactions",
  "fallbackMethod": "GET",
  "preprocessRegex": "window\\.__data\\s*=\\s*({.*?});",
  "transactionsExtraction": {
    "transactionJsonPathListSelector": "$.data.transactions",
    "transactionRegexSelectors": {
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

##### Metadata Fields

###### `shouldSkipCloseTab` (optional)
- **Type**: `boolean`
- **Default**: `false`
- **Description**: When set to `true`, prevents the extension from automatically closing the authentication tab after successful authentication
- **Use case**: Useful when you need the user to stay on the page to perform additional actions or when the authentication flow requires multiple steps
- **Example**: `"shouldSkipCloseTab": true`

###### `shouldReplayRequestInPage` (optional)
- **Type**: `boolean`
- **Default**: `false`
- **Description**: When set to `true`, replays the request in the page context instead of making it from the extension
- **Use case**: Useful for requests that require page-specific context or when CORS policies prevent extension requests

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
  type: 'jsonPath' | 'xPath' | 'regex';
  value: string;
  source?: 'url' | 'responseBody' | 'responseHeaders' | 'requestHeaders' | 'requestBody';
}
```

##### Parameter Source Options

The `source` field in `paramSelectors` specifies where to extract the parameter from:

###### `responseBody` (default)
- **Description**: Extract from the response body
- **Example**: 
```json
{
  "type": "jsonPath",
  "value": "$.data.transactionId",
  "source": "responseBody"
}
```

###### `url`
- **Description**: Extract from the request URL
- **Example**: 
```json
{
  "type": "regex",
  "value": "userId=([^&]+)",
  "source": "url"
}
```

###### `responseHeaders`
- **Description**: Extract from response headers
- **Example**: 
```json
{
  "type": "regex",
  "value": "X-Transaction-Id: (.+)",
  "source": "responseHeaders"
}
```

###### `requestHeaders`
- **Description**: Extract from request headers
- **Example**: 
```json
{
  "type": "regex",
  "value": "Authorization: Bearer (.+)",
  "source": "requestHeaders"
}
```

###### `requestBody`
- **Description**: Extract from the request body (for POST/PUT requests)
- **Example**: 
```json
{
  "type": "jsonPath",
  "value": "$.payment.amount",
  "source": "requestBody"
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
- **Description**: Special configurations for the ZKP2P mobile SDK. The mobile configuration supports both internal (WebView) and external (native app) actions.

```json
"mobile": {
  "includeAdditionalCookieDomains": ["additional-domain.com"],
  "useExternalAction": true,
  "userAgent": {
    "android": "Mozilla/5.0 (Linux; Android 13; Pixel 6) ...",
    "ios": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) ..."
  },
  "external": {
    "actionLink": "venmo://paycharge?txn=pay&recipients={{RECEIVER_ID}}&note=cash&amount={{AMOUNT}}",
    "appStoreLink": "https://apps.apple.com/us/app/venmo/id351727428",
    "playStoreLink": "https://play.google.com/store/apps/details?id=com.venmo"
  },
  "internal": {
    "actionLink": "https://app.provider.com/send",
    "actionCompletedUrlRegex": "https://app.provider.com/confirmation/\\S+",
    "injectedJavaScript": "/* JavaScript to interact with the webpage */",
    "injectedJavaScriptParamNames": ["RECIPIENT_ID", "AMOUNT"]
  }
}
```

**Top-level Fields:**
- `includeAdditionalCookieDomains`: Array of additional cookie domains to include
- `useExternalAction`: Boolean to prefer external action when `true`, otherwise prefer internal action
- `userAgent` (optional): Custom user agent strings for Android and iOS WebViews

**External Action Fields (`external`):**
- `actionLink`: Deep link URL for the native mobile app with placeholders for dynamic values
- `appStoreLink`: iOS App Store URL for the app
- `playStoreLink`: Google Play Store URL for the app

**Internal Action Fields (`internal`):**
- `actionLink`: Web URL to open in WebView for the action
- `actionCompletedUrlRegex` (optional): Regex pattern to detect when the action is completed
- `injectedJavaScript` (optional): JavaScript code to inject into the WebView to assist with form filling or interaction
- `injectedJavaScriptParamNames` (optional): Array of parameter names used in the injected JavaScript

**Action Flow:**
The mobile SDK will attempt actions based on the configuration:
- If `useExternalAction` is `true`, it will try the external action first (native app), then fall back to internal (WebView)
- If `useExternalAction` is `false` or omitted, it will try the internal action first (WebView), then fall back to external (native app)
- Both `internal` and `external` sections can be provided for maximum flexibility

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

### Parameter Extraction Examples

##### Example 1: Extract from URL
```json
{
  "paramNames": ["userId"],
  "paramSelectors": [{
    "type": "regex",
    "value": "/user/([^/]+)/transactions",
    "source": "url"
  }]
}
```

##### Example 2: Extract from Response Headers
```json
{
  "paramNames": ["sessionId"],
  "paramSelectors": [{
    "type": "regex",
    "value": "X-Session-Id: ([a-zA-Z0-9]+)",
    "source": "responseHeaders"
  }]
}
```

##### Example 3: Mixed Sources
```json
{
  "paramNames": ["userId", "transactionId", "amount"],
  "paramSelectors": [
    {
      "type": "regex",
      "value": "userId=([^&]+)",
      "source": "url"
    },
    {
      "type": "jsonPath",
      "value": "$.data.transactions[{{INDEX}}].id",
      "source": "responseBody"
    },
    {
      "type": "regex",
      "value": "X-Transaction-Amount: ([0-9.]+)",
      "source": "responseHeaders"
    }
  ]
}
```

##### Example 4: HTML Table with XPath
```json
{
  "paramNames": ["tradeNo"],
  "paramSelectors": [
    {
      "type": "xPath",
      "value": "normalize-space((//table[@id='tradeRecordsIndex']//a[contains(@class,'J-tradeNo')]/@data-clipboard-text)[{{INDEX}} + 1])",
      "source": "responseBody"
    }
  ]
}
```

### Extraction Types

##### JSONPath
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

##### XPath
Use XPath expressions for HTML or XML responses:
```json
{
  "type": "xPath",
  "value": "normalize-space((//table[@id='tradeRecordsIndex']//a[contains(@class,'J-tradeNo')]/@data-clipboard-text)[{{INDEX}} + 1])"
}
```

##### Regex
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
- Supports `{{INDEX}}` substitution during proving (the selected row index is inserted before matching)

### Best Practices

#### 1. URL Regex Patterns
- Escape special characters: `\\.` for dots
- Use specific patterns to avoid false matches
- Test regex patterns thoroughly

#### 2. Parameter Extraction
- Use JSONPath for structured JSON data
- Use XPath for HTML or XML DOM responses
- Use regex only when neither JSONPath nor XPath can address the structure
- Specify `source` when extracting from non-default locations (not responseBody)
- Test extraction with various response formats

#### 3. Security
- List all sensitive headers in `secretHeaders`
- Use `responseRedactions` to remove PII
- Never expose authentication tokens in `responseMatches`

#### 4. Transaction Extraction

##### `transactionXPathSelectors` (optional)
- **Type**: `object`
- **Description**: XPath expressions to extract transaction data from HTML responses
- **Use case**: Use this when transactions are displayed in tables or other DOM structures
- **Example**: 
```json
{
  "transactionsExtraction": {
    "transactionXPathListSelector": "//table[@id='tradeRecordsIndex']//tbody/tr[contains(@class,'J-item')]",
    "transactionXPathSelectors": {
      "amount": "normalize-space(.//td[contains(@class,'amount')])",
      "recipient": "normalize-space(substring-before(.//p[contains(@class,'p-inline') and contains(@class,'name')], '|'))",
      "date": "normalize-space(.//td[contains(@class,'time')][last()])",
      "paymentId": "normalize-space(.//a[contains(@class,'J-tradeNo')]/@data-clipboard-text)"
    }
  }
}
```

**Note**: Use either `transactionJsonPathListSelector` (for JSON responses) or `transactionXPathSelectors` (for HTML responses), not both.

#### 5. Error Handling
- Provide fallback URLs when primary endpoints might fail
- Use preprocessing regex for embedded JSON data
- Test extraction selectors with various response formats

#### 6. Performance
- Minimize the number of `responseMatches` for faster verification
- Use specific JSONPath expressions instead of wildcards
- Consider response size when designing redactions

#### 7. Tab Management
- Set `shouldSkipCloseTab: true` for flows where when closing the tab results in ending the session token, thus preventing us from replaying the request successfully.
- Use default behavior (auto-close) for simple authentication flows
- Consider user experience when deciding tab behavior

### Common Issues
- **Authenticate does not open desired auth link**: Check the Base URL you have set in the extension. Ensure you are running the server which is hosted in port 8080
- **Authenticated into your payment platform but not redirected back to developer.zkp2p.xyz**: There is an issue with the urlRegex for metadata extraction. Double check your regex is correct
- **Metadata returned to app, but Prove fails**: There is an issue with the response redactions or headers for the server call. If error is JSON path not found or regex not found then check your response redactions parameters. If it returns a error that is not 200, the server has rejected your request, so there is an issue with your headers, request body.
- **Parameters not extracted correctly**: Check the `source` field in your `paramSelectors`. By default, parameters are extracted from responseBody. If your parameter is in the URL, headers, or request body, you must specify the correct source.

## Contributing
We want to make this the largest open source repository of provider templates for global payment platforms. Please open a PR when you have created and tested your template

![X-blob-background-1500x500px](https://github.com/zkp2p/zk-p2p/assets/6797244/65e8ae36-eb8b-4b53-85e9-fa0801bafcf0)
