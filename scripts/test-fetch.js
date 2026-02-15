
const url = 'https://media.crediblemark.com/logos/1770077847375-ICON_CREDIBLEMARK.jpg';

try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const blob = await res.blob();
    console.log('Size:', blob.size);
} catch (error) {
    console.error('Fetch error:', error);
}
