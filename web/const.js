const SCRIPT_URL = "https://editify-cportal-api.shopvana.io/script.js";
const PAGE_HTML = `
<script>
// Function to construct the iframe src URL with dynamic parameters
function constructIframeSrc(params) {
    var baseUrl = "https://editify-cportal.shopvana.io/orders";
    var url = new URL(baseUrl);
    for (var key in params) {
        url.searchParams.set(key, params[key]);
    }
    return url.href;
}

// Get parameters from the window URL
var windowUrl = new URL(window.location.href);
var windowParams = {};
windowUrl.searchParams.forEach((value, key) => {
    windowParams[key] = value;
});

// Create and configure the iframe element
var iframe = document.createElement("iframe");
iframe.id = "myIframe";
iframe.style.width = "100%";
iframe.style.height = "900px";
iframe.style.border = "none";
iframe.scrolling = "no";
iframe.src = constructIframeSrc(windowParams);

// Append the iframe to the body of the document
document.body.appendChild(iframe);

// Remove classes from elements after the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("Loaded");

    // Remove the h1 element from the page
    var h1Element = document.querySelector("h1");
    if (h1Element) {
        h1Element.remove();
    }

    // Remove the class from the element
    var element = document.querySelector(".page-width--narrow");
    if (element) {
        element.classList.remove("page-width--narrow");
    }
});
</script>
`;
export { SCRIPT_URL, PAGE_HTML };
