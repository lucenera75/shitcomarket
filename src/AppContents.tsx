import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";
import NewFungibleTokenForm from "./NewFungibleTokenForm";

export default function AppContents() {
  const w = useWallet();

  return (<div>
wallet pubkey is 
    {w.publicKey?.toString()}
    <NewFungibleTokenForm />
  </div>);
}
