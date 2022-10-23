import React, { FC, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  UnsafeBurnerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import AppContents from "./AppContents";
import { MetaplexProvider } from "./MetaplexProvider";
import NewFungibleTokenForm from "./NewFungibleTokenForm";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");
function App() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      /**
       * Select the wallets you wish to support, by instantiating wallet adapters here.
       *
       * Common adapters can be found in the npm package `@solana/wallet-adapter-wallets`.
       * That package supports tree shaking and lazy loading -- only the wallets you import
       * will be compiled into your application, and only the dependencies of wallets that
       * your users connect to will be loaded.
       */
      new UnsafeBurnerWalletAdapter(),
      new PhantomWalletAdapter({
        
      }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="fixed top-1 right-1 flex">
            <WalletMultiButton />
            <WalletDisconnectButton />
            {/* Your app's components go here, nested within the context providers. */}
          </div>
        </WalletModalProvider>
        <div>
            <MetaplexProvider>
                <NewFungibleTokenForm />
            </MetaplexProvider>
        </div>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
