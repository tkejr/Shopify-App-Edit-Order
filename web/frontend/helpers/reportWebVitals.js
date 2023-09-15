const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry) {
    import("web-vitals").then(
      ({
        CLSReportCallback,
        FIDReportCallback,
        FCPReportCallback,
        LCPReportCallback,
        TTFBReportCallback,
      }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      }
    );
  }
};

export default reportWebVitals;
