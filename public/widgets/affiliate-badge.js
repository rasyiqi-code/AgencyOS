(function () {
    // 1. Get referral code from script src or data attribute
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var refCode = currentScript.getAttribute('data-ref') || new URL(currentScript.src).searchParams.get('ref') || 'default';
    var agencyName = currentScript.getAttribute('data-name') || 'Agency OS';


    // 2. Create Badge Elements
    var badge = document.createElement('div');
    badge.id = 'agencyos-affiliate-badge';

    // Styles
    var styles = `
        #agencyos-affiliate-badge {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            background: #09090b;
            border: 1px solid #27272a;
            border-radius: 9999px;
            padding: 4px 4px 4px 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            cursor: pointer;
            text-decoration: none;
            color: #ffffff;
        }
        #agencyos-affiliate-badge:hover {
            transform: translateY(-2px);
            border-color: #3f3f46;
            background: #18181b;
        }
        #agencyos-affiliate-badge .text {
            font-size: 12px;
            font-weight: 500;
            margin-right: 12px;
        }
        #agencyos-affiliate-badge .btn {
            background: #ffffff;
            color: #000000;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 9999px;
        }
    `;

    var styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    badge.innerHTML = `
        <span class="text">Powered by <strong>${agencyName}</strong></span>
        <span class="btn">Learn More</span>
    `;

    // 3. Click Handler
    badge.onclick = function () {
        window.open('https://agencyos.com?ref=' + refCode, '_blank');
    };

    // 4. Inject into body
    document.body.appendChild(badge);
})();
