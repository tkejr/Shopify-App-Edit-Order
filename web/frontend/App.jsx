import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { Provider } from "react-redux";
import store from "./store";
import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";
export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <Provider store={store}>
      <PolarisProvider>
        <BrowserRouter>
          <AppBridgeProvider>
            <QueryProvider>
              <NavigationMenu
                navigationLinks={[
                  {
                    label: "Backdate Order",
                    destination: "/Backdate",
                  },
                  {
                    label: "Edit Order",
                    destination: "/EditOrder",
                    subNavigationItems:[
                      "/EditOrderPanel"
                    ]
                  },
                  {
                    label: "Customer Portal",
                    destination: "/CustomerPortal",
                  },
                  {
                    label: "Plans",
                    destination: "/Plans",
                  },
                  {
                    label: "FAQ",
                    destination: "/FAQ",
                  },
                  {
                    label: "Help and Support",
                    destination: "/Help",
                  },
                ]}
              />
              <Routes pages={pages} />
            </QueryProvider>
          </AppBridgeProvider>
        </BrowserRouter>
      </PolarisProvider>
    </Provider>
  );
}
