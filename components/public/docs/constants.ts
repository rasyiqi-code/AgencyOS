export const WEBHOOK_PAYLOAD = `{
  "event": "subscription.activated",
  "timestamp": "2024-03-18T15:30:00Z",
  "data": {
    "orderId": "ORD-123456",
    "email": "customer@example.com",
    "productId": "premium-saas-slug",
    "productName": "Premium SaaS Plan",
    "amount": 29.00,
    "price": 29.00,
    "currency": "USD",
    "interval": "monthly",
    "licenseKey": "KEY-XXXX-XXXX-XXXX",
    "status": "PAID",
    "metadata": {
      "user_id": "user_123",
      "project_name": "My Awesome Project"
    }
  }
}`;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://crediblemark.com";

export const SAAS_RESPONSE_PAYLOAD = `{
  "active": true,
  "orderId": "DIGI-1739443234567",
  "email": "customer@example.com",
  "productName": "Premium SaaS Plan",
  "purchaseDate": "2024-03-18T15:30:00Z",
  "expiresAt": "2025-03-18T15:30:00Z",
  "licenseKey": "KEY-XXXX-XXXX-XXXX",
  "price": 29.00,
  "currency": "USD",
  "interval": "monthly",
  "metadata": {
    "user_id": "user_123"
  }
}`;

export const SAAS_SNIPPETS = {
  nextjs: `// Verify subscription and get details
export async function getSubscription(email: string, productSlug: string) {
  const res = await fetch(\`\${BASE_URL}/api/v1/subscription/check?email=\${email}&productSlug=\${productSlug}\`, {
    headers: { 'Authorization': \`Bearer \${process.env.AGENCY_OS_API_KEY}\` },
  });
  const data = await res.json();
  
  if (data.active) {
    console.log("Plan:", data.productName);
    console.log("Expires:", data.expiresAt);
    return data;
  }
  return null;
}`,
  node: `const axios = require('axios');

async function getSubscription(email, productSlug) {
  const res = await axios.get('\${BASE_URL}/api/v1/subscription/check', {
    params: { email, productId: productSlug },
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  });
  
  if (res.data.active) {
    console.log(\`Active Plan: \${res.data.productName}\`);
    return res.data;
  }
  return null;
}`,
  python: `import requests

def get_subscription(email, product_slug):
    url = "\${BASE_URL}/api/v1/subscription/check"
    params = {"email": email, "productSlug": product_slug}
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    
    res = requests.get(url, params=params, headers=headers)
    data = res.json()
    
    if data.get("active"):
        print(f"Plan: {data.get('productName')}")
        return data
    return None`,
  php: `<?php
$url = "\${BASE_URL}/api/v1/subscription/check?email=user@mail.com&productSlug=your-slug";
$opts = ["http" => ["header" => "Authorization: Bearer YOUR_API_KEY"]];
$context = stream_context_create($opts);
$response = json_decode(file_get_contents($url, false, $context), true);

if ($response['active']) {
    echo "Active Plan: " . $response['productName'];
    // Access more fields: $response['expiresAt'], $response['price'], etc.
} else {
    echo "No active subscription.";
}`,
  flutter: `import 'package:http/http.dart' as http;
import 'dart:convert';

// Get subscription details
Future<Map<String, dynamic>?> getSubscription(String email, String slug) async {
  final res = await http.get(
    Uri.parse('\${BASE_URL}/api/v1/subscription/check?email=$email&productSlug=$slug'),
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  );
  final data = jsonDecode(res.body);
  return data['active'] == true ? data : null;
}`
};

export const LICENSE_SNIPPETS = {
  nextjs: `// Verify standalone license key
export async function verifyLicense(key: string, productSlug: string) {
  const res = await fetch('\${BASE_URL}/api/public/verify-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, productSlug })
  });
  return (await res.json()).valid;
}`,
  node: `const axios = require('axios');

async function verifyLicense(key, productSlug) {
  const res = await axios.post('\${BASE_URL}/api/public/verify-license', {
    key, productSlug
  });
  return res.data.valid;
}`,
  python: `import requests

def verify_license(key, product_slug):
    url = "\${BASE_URL}/api/public/verify-license"
    payload = {"key": key, "productSlug": product_slug}
    
    response = requests.post(url, json=payload)
    return response.json().get("valid", False)`,
  php: `<?php
$url = "\${BASE_URL}/api/public/verify-license";
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
    Uri.parse('\${BASE_URL}/api/public/verify-license'),
    body: jsonEncode({ 'key': key, 'productSlug': slug }),
  );
  return jsonDecode(res.body)['valid'] == true;
}`
};
export const SAAS_SNIPPETS_ID = {
  nextjs: `// Verifikasi langganan dan ambil detailnya
export async function getSubscription(email: string, productSlug: string) {
  const res = await fetch(\`\${BASE_URL}/api/v1/subscription/check?email=\${email}&productSlug=\${productSlug}\`, {
    headers: { 'Authorization': \`Bearer \${process.env.AGENCY_OS_API_KEY}\` },
  });
  const data = await res.json();
  
  if (data.active) {
    console.log("Paket:", data.productName);
    console.log("Berakhir:", data.expiresAt);
    return data;
  }
  return null;
}`,
  node: `const axios = require('axios');

async function getSubscription(email, productSlug) {
  const res = await axios.get('\${BASE_URL}/api/v1/subscription/check', {
    params: { email, productId: productSlug },
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  });
  
  if (res.data.active) {
    console.log(\`Paket Aktif: \${res.data.productName}\`);
    return res.data;
  }
  return null;
}`,
  python: `import requests

def get_subscription(email, product_slug):
    url = "\${BASE_URL}/api/v1/subscription/check"
    params = {"email": email, "productSlug": product_slug}
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    
    res = requests.get(url, params=params, headers=headers)
    data = res.json()
    
    if data.get("active"):
        print(f"Paket: {data.get('productName')}")
        return data
    return None`,
  php: `<?php
$url = "\${BASE_URL}/api/v1/subscription/check?email=user@mail.com&productSlug=your-slug";
$opts = ["http" => ["header" => "Authorization: Bearer YOUR_API_KEY"]];
$context = stream_context_create($opts);
$response = json_decode(file_get_contents($url, false, $context), true);

if ($response['active']) {
    echo "Paket Aktif: " . $response['productName'];
    // Akses field lainnya: $response['expiresAt'], $response['price'], dll.
} else {
    echo "Tidak ada langganan aktif.";
}`,
  flutter: `import 'package:http/http.dart' as http;
import 'dart:convert';

// Ambil detail langganan
Future<Map<String, dynamic>?> getSubscription(String email, String slug) async {
  final res = await http.get(
    Uri.parse('\${BASE_URL}/api/v1/subscription/check?email=$email&productSlug=$slug'),
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  );
  final data = jsonDecode(res.body);
  return data['active'] == true ? data : null;
}`
};

export const LICENSE_SNIPPETS_ID = {
  nextjs: `// Verifikasi kunci lisensi standalone
export async function verifyLicense(key: string, productSlug: string) {
  const res = await fetch('\${BASE_URL}/api/public/verify-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, productSlug })
  });
  return (await res.json()).valid;
}`,
  node: `const axios = require('axios');

async function verifyLicense(key, productSlug) {
  const res = await axios.post('\${BASE_URL}/api/public/verify-license', {
    key, productSlug
  });
  return res.data.valid;
}`,
  python: `import requests

def verify_license(key, product_slug):
    url = "\${BASE_URL}/api/public/verify-license"
    payload = {"key": key, "productSlug": product_slug}
    
    response = requests.post(url, json=payload)
    return response.json().get("valid", False)`,
  php: `<?php
$url = "\${BASE_URL}/api/public/verify-license";
$data = ["key" => "LICENSE-KEY", "productSlug" => "your-slug"];
$options = ["http" => [
    "header" => "Content-type: application/json\\r\\n",
    "method" => "POST",
    "content" => json_encode($data)
]];
$result = file_get_contents($url, false, stream_context_create($options));
$response = json_decode($result, true);
echo $response['valid'] ? 'Aktif' : 'Tidak Valid';`,
  flutter: `import 'package:http/http.dart' as http;
import 'dart:convert';

// Verifikasi Kunci Lisensi
Future<bool> verifyLicense(String key, String slug) async {
  final res = await http.post(
    Uri.parse('\${BASE_URL}/api/public/verify-license'),
    body: jsonEncode({ 'key': key, 'productSlug': slug }),
  );
  return jsonDecode(res.body)['valid'] == true;
}`
};
