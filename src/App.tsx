import { AppProviders } from "./providers/AppProviders";
import { DAppLayout } from "@/layout/DappLayout";
import DonationPage  from "@/pages/DonationPage";
import "./App.css";

export function App() {
  return (
    <AppProviders>
      <DAppLayout 
        title="Charity Pool" 
        description="Support great causes with ETH or USDC"
      >
        <DonationPage />
      </DAppLayout>
    </AppProviders>
  );
}

export default App;
