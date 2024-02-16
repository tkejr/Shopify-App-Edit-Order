const SCRIPT_URL = "https://editify-cportal-api.shopvana.io/script.js";
const PAGE_HTML = `
<iframe
  style="width: 100%; height: 900px; border: none"
  id="myIframe"
  scrolling="no"
></iframe>
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

  // Set the iframe src attribute using the constructed URL with window parameters
  var iframe = document.getElementById("myIframe");
  iframe.src = constructIframeSrc(windowParams);

  // Remove classes from elements
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Loaded");
    var h1Element = document.querySelector("h1");

    // Remove the h1 element from the page
    if (h1Element) {
      h1Element.remove();
    }
    var element = document.querySelector(".page-width--narrow");

    // Remove the class from the element
    if (element) {
      element.classList.remove("page-width--narrow");
    }
  });
</script>
`;
export { SCRIPT_URL, PAGE_HTML };
