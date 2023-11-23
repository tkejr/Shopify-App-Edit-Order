import ReactDOM from "react-dom";
import { onCLS, onFID, onLCP } from "web-vitals";
import ReactGA from "react-ga4";

function sendToAnalytics(metric) {
  //console.log("======== Metric Data =========");
  //console.log(metric);
}
import App from "./App";

ReactDOM.render(<App />, document.getElementById("app"));

//onLCP(sendToAnalytics);

//onCLS(sendToAnalytics);
//onFID(sendToAnalytics);
