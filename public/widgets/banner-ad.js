(function () {
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var assetId = currentScript.getAttribute('data-id');
    var refCode = currentScript.getAttribute('data-ref') || 'default';
    // Use data-host if provided (for external sites), otherwise fallback to current origin
    var baseUrl = currentScript.getAttribute('data-host') || window.location.origin;

    if (!assetId) {
        console.error('AgencyOS Widget: data-id is required');
        return;
    }

    // Container for the ad
    var container = document.createElement('div');
    container.className = 'agencyos-ad-container';
    container.style.display = 'inline-block';
    container.style.maxWidth = '100%';

    // Inject into the position of the script
    currentScript.parentNode.insertBefore(container, currentScript);

    // Fetch Asset Data from Public API
    fetch(baseUrl + '/api/public/marketing/assets')
        .then(res => res.json())
        .then(assets => {
            var asset = assets.find(a => a.id === assetId);
            if (!asset || !asset.imageUrl) {
                console.warn('AgencyOS Widget: Asset not found or no image');
                return;
            }

            var destPath = asset.content || '/';
            var linkUrl;

            // Check if destPath is absolute URL
            if (destPath.startsWith('http://') || destPath.startsWith('https://')) {
                linkUrl = destPath;
            } else {
                linkUrl = baseUrl + destPath;
            }

            // Append ref code
            linkUrl += (linkUrl.includes('?') ? '&' : '?') + 'ref=' + refCode;

            container.innerHTML = `
                <a href="${linkUrl}" target="_blank" style="display: block; text-decoration: none; border: 0;">
                    <img src="${asset.imageUrl}" alt="${asset.title}" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e5e7eb; display: block;" />
                </a>
            `;
        })
        .catch(err => console.error('AgencyOS Widget Error:', err));
})();
