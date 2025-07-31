# 📤 File Signer & Secure Upload Tool

This is a Node.js/TypeScript command-line tool that:

1. Reads a file (e.g., PDF or image)
2. Signs it using a private RSA key
3. Authenticates with an OAuth2 identity server using client credentials
4. Uploads the file to a remote API with the signature and access token

---

## ⚙️ Configuration

All runtime settings are provided in `config.json`.

### 📁 Example `config.json`

```json
{
  "filePath": "C:/path/to/your/file.pdf",
  "privateKeyPath": "C:/path/to/your/private-key.pem",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "scope": "your-oauth-scope",
  "identityUrl": "https://identity.server/oauth2/token",
  "uploadUrl": "https://integrations-api.synapsehealth.dev/api/v1/documents"
}

🔍 Field Descriptions
Field	Description
filePath	Full path to the file you want to upload (PDF, image, etc.)
privateKeyPath	Full path to your RSA private key in PEM format
clientId	OAuth2 client ID for your service account
clientSecret	OAuth2 client secret
scope	OAuth2 scope required to access the API
identityUrl	OAuth2 token endpoint (e.g., Auth0, Okta, IdentityServer)
uploadUrl	Final destination API endpoint for the signed file

🚀 Running the Tool
1. Install dependencies
cd file-signer
npm install
This installs node-fetch and other required packages.

2. Build the TypeScript code
npx tsc
This generates dist/index.js from src/index.ts.

3. Run the uploader
node dist/index.js
✅ The tool will:

Read your file

Sign it

Get an access token using the config values

POST the file with the signature and bearer token

🛠 Requirements
Node.js 16 or higher

TypeScript compiler (npx tsc)

PEM-formatted private RSA key (PKCS#8 recommended)