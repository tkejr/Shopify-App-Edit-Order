//LCP
import mixpanel from "mixpanel-browser";
mixpanel.init('834378b3c2dc7daf1b144cacdce98bd0')
const sendToAnalytics = (metric, source) => {
    console.log("======== Metric Data =========");
    console.log(metric);
     mixpanel.track("LCP", {
      distinct_id: "",
      source: source,
      lcp: metric.delta
    }) 
   
  }

export {sendToAnalytics}