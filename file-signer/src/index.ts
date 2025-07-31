import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import fetch from 'node-fetch';

interface Config {
  filePath: string;
  privateKeyPath: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  identityUrl: string;
  uploadUrl: string;
}

 interface TokenResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

async function loadConfig(): Promise<Config> {
  const raw = fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8');
  return JSON.parse(raw);
}

async function getAccessToken(config: Config): Promise<string> {
  const response = await fetch(config.identityUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: config.scope
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${error}`);
  }
  const json = await response.json() as TokenResponse;
  return json.access_token;
}

async function main() {
  const config = await loadConfig();

  const privateKeyPem = fs.readFileSync(config.privateKeyPath, 'utf-8');
  const fileBuffer = fs.readFileSync(config.filePath);

  // Sign the file content
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(fileBuffer);
  sign.end();
  const signatureBase64 = sign.sign(privateKeyPem).toString('base64');

  // Get JWT token
  const token = await getAccessToken(config);

  // Upload file
  const fileStat = fs.statSync(config.filePath);
  const options: https.RequestOptions = {
    method: 'POST',
    hostname: new URL(config.uploadUrl).hostname,
    path: new URL(config.uploadUrl).pathname,
    headers: {
      'Content-Type': 'application/octet-stream',
      'x-signature': signatureBase64,
      'Authorization': `Bearer ${token}`,
      'Content-Length': fileStat.size
    }
  };

  const req = https.request(options, res => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Response: ${data}`);
    });
  });

  req.on('error', error => {
    console.error('Upload failed:', error.message);
  });

  fs.createReadStream(config.filePath).pipe(req);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
});
