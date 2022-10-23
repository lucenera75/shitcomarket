import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { MetaplexContext } from "./useMetaplex";

type Props = {
  children: React.ReactNode | React.ReactNode[];
};

export const MetaplexProvider = ({ children }: Props) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const metaplex = useMemo(
    () => Metaplex.make(connection).use(walletAdapterIdentity(wallet)),
    [connection, wallet]
  );

  return (
    <MetaplexContext.Provider value={{ metaplex }}>
      {children}
    </MetaplexContext.Provider>
  );
};