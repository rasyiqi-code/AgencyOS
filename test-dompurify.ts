import { sanitizeHtml } from "./lib/utils/sanitize";
console.log(sanitizeHtml('<a href="https://example.com" class="link" id="my-link" target="_blank">Safe Link</a>'));
