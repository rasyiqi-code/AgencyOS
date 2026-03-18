export const WEBHOOK_PAYLOAD = `{
  "event": "subscription.activated",
  "data": {
    "orderId": "ORD-123456",
    "email": "customer@example.com",
    "productId": "premium-saas-slug",
    "licenseKey": "KEY-XXXX-XXXX-XXXX",
    "timestamp": "2024-03-18T15:30:00Z"
  }
}`;

export const SAAS_SNIPPETS = {
  nextjs: `// Verify subscription for SaaS
export async function checkAccess(email: string, productSlug: string) {
  const res = await fetch(\`https://your-agency-os.com/api/v1/subscription/check?email=\${email}&productSlug=\${productSlug}\`, {
    headers: { 'Authorization': \`Bearer \${process.env.AGENCY_OS_API_KEY}\` },
  });
  return (await res.json()).active;
}`,
  node: `const axios = require('axios');

async function checkStatus(email, productSlug) {
  const res = await axios.get('https://your-agency-os.com/api/v1/subscription/check', {
    params: { email, productId: productSlug },
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  });
  return res.data.active;
}`,
  python: `import requests

def check_saas(email, product_slug):
    url = "https://your-agency-os.com/api/v1/subscription/check"
    params = {"email": email, "productSlug": product_slug}
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    
    res = requests.get(url, params=params, headers=headers)
    return res.json().get("active", False)`,
  php: `<?php
$url = "https://your-agency-os.com/api/v1/subscription/check?email=user@mail.com&productSlug=your-slug";
$opts = ["http" => ["header" => "Authorization: Bearer YOUR_API_KEY"]];
$context = stream_context_create($opts);
$response = json_decode(file_get_contents($url, false, $context), true);
echo $response['active'] ? 'Active' : 'N/A';`,
  flutter: `import 'package:http/http.dart' as http;
import 'dart:convert';

// Check SaaS status
Future<bool> checkSaaS(String email, String slug) async {
  final res = await http.get(
    Uri.parse('https://your-agency-os.com/api/v1/subscription/check?email=$email&productSlug=$slug'),
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  );
  return jsonDecode(res.body)['active'] == true;
}`
};

export const LICENSE_SNIPPETS = {
  nextjs: `// Verify standalone license key
export async function verifyLicense(key: string, productSlug: string) {
  const res = await fetch('https://your-agency-os.com/api/public/verify-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, productSlug })
  });
  return (await res.json()).valid;
}`,
  node: `const axios = require('axios');

async function verifyLicense(key, productSlug) {
  const res = await axios.post('https://your-agency-os.com/api/public/verify-license', {
    key, productSlug
  });
  return res.data.valid;
}`,
  python: `import requests

def verify_license(key, product_slug):
    url = "https://your-agency-os.com/api/public/verify-license"
    payload = {"key": key, "productSlug": product_slug}
    
    response = requests.post(url, json=payload)
    return response.json().get("valid", False)`,
  php: `<?php
$url = "https://your-agency-os.com/api/public/verify-license";
$data = ["key" => "LICENSE-KEY", "productSlug" => "your-slug"];
$options = ["http" => [
    "header" => "Content-type: application/json\\r\\n",
    "method" => "POST",
    "content" => json_encode($data)
]];
$result = file_get_contents($url, false, stream_context_create($options));
$response = json_decode($result, true);
echo $response['valid'] ? 'Active' : 'Invalid';`,
  flutter: `import 'package:http/http.dart' as http;
import 'dart:convert';

// Verify License Key
Future<bool> verifyLicense(String key, String slug) async {
  final res = await http.post(
    Uri.parse('https://your-agency-os.com/api/public/verify-license'),
    body: jsonEncode({ 'key': key, 'productSlug': slug }),
  );
  return jsonDecode(res.body)['valid'] == true;
}`
};
