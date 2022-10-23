import { Metaplex } from "@metaplex-foundation/js";
import { createContext, useContext } from "react";

type MtContext = {
  metaplex: Metaplex | null,
};

const DEFAULT_CONTEXT: MtContext = {
  metaplex: null,
};

export const MetaplexContext = createContext(DEFAULT_CONTEXT);

export function useMetaplex() {
  return useContext(MetaplexContext);
}
