import PageTitle from "@/components/page-title";
import { TokenLauncherInterface } from "@/components/token-launcher/token-launcher-interface";

function TokenLauncher() {
  return (
    <div className="flex flex-col gap-4 pt-4 pb-12 max-w-6xl mx-auto w-full">
      <PageTitle title="Solana Token Launcher" />
      <div className="grid grid-cols-1 gap-6">
        <TokenLauncherInterface />
      </div>
    </div>
  );
}

export default TokenLauncher;
