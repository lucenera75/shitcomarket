import { FieldValues, useForm } from "react-hook-form";

// import secret from "./guideSecret.json";
import { useEffect, useState } from "react";
import { useMetaplex } from "./useMetaplex";
import {
  bundlrStorage,
  findMetadataPda,
  UploadMetadataInput,
} from "@metaplex-foundation/js";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MyTextInput } from "./components/MyTextInput";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { createCreateMetadataAccountV2Instruction } from "@metaplex-foundation/mpl-token-metadata";

type TokenAttributes = UploadMetadataInput & {
  numDecimals: number;
  numTokens: number;
  metadataUrl: string | null;
};

const schema = yup
  .object({
    name: yup.string().required(),
    numDecimals: yup.number().min(0).integer().max(9).required(),
    symbol: yup.string().required(),
    description: yup.string().optional(),
    image: yup.string().optional(),
    numTokens: yup.number().min(0).required(),
  })
  .required();

export default function NewFungibleTokenForm() {
  const metaplexProvider = useMetaplex();
  const wallet = useWallet();
  const connection = useConnection();
  const [tokenAttributes, setTokenAttributes] = useState<TokenAttributes>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const uploadMetadata = async (
    tokenMetadata: UploadMetadataInput
  ): Promise<string> => {
    const { metaplex } = metaplexProvider;
    if (metaplex) {
      metaplex.use(bundlrStorage());
      const { uri } = await metaplex.nfts().uploadMetadata(tokenMetadata);
      console.log(`Arweave URL: `, uri);
      return uri;
    } else {
      throw new Error("metaplex not initialized");
    }
  };

  const onSubmit = async (data: FieldValues) => {
    const { metaplex } = metaplexProvider;
    const ta = data as TokenAttributes;
    setTokenAttributes(ta);
    if (metaplex) {
      const uri = await uploadMetadata({
        name: ta.name,
        symbol: ta.symbol,
        description: ta.description,
        image: ta.image,
      });
      setTokenAttributes({ ...ta, metadataUrl: uri });
      let mintKeypair = Keypair.generate();
      const requiredBalance = await getMinimumBalanceForRentExemptMint(
        metaplex.connection
      );
      const metadataPDA = await findMetadataPda(mintKeypair.publicKey);
      const tokenATA = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey!
      );
      const mintAuthority = wallet.publicKey!;
      const freezeAuthority = wallet.publicKey!;
      const createNewTokenTransaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey!,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: requiredBalance,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey, //Mint Address
          ta.numDecimals, //Number of Decimals of New mint
          mintAuthority, //Mint Authority
          freezeAuthority, //Freeze Authority
          TOKEN_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
          wallet.publicKey!, //Payer
          tokenATA, //Associated token account
          wallet.publicKey!, //token owner
          mintKeypair.publicKey //Mint
        ),
        createMintToInstruction(
          mintKeypair.publicKey, //Mint
          tokenATA, //Destination Token Account
          mintAuthority, //Authority
          ta.numTokens * Math.pow(10, ta.numDecimals) //number of tokens
        ),
        createCreateMetadataAccountV2Instruction(
          {
            metadata: metadataPDA,
            mint: mintKeypair.publicKey,
            mintAuthority: mintAuthority,
            payer: wallet.publicKey!,
            updateAuthority: mintAuthority,
          },
          {
            createMetadataAccountArgsV2: {
              data: {
                name: ta.name!,
                symbol: ta.symbol!,
                uri: uri,
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null,
              },
              isMutable: true,
            },
          }
        )
      );
      let blockhash = (
        await connection.connection.getLatestBlockhash("finalized")
      ).blockhash;
      createNewTokenTransaction.recentBlockhash = blockhash;
      createNewTokenTransaction.feePayer = wallet.publicKey!;
      createNewTokenTransaction.partialSign(mintKeypair);
      // await wallet.signTransaction?.(createNewTokenTransaction);
      const transactionId = await wallet.sendTransaction(
        createNewTokenTransaction,
        connection.connection
      );
      // const transactionId = await connection.connection.sendTransaction(createNewTokenTransaction,[mintKeypair])
      console.log({ mintPubKey: mintKeypair.publicKey, transactionId });
    } else {
      throw new Error("metaplex not initialized");
    }
  };

  useEffect(() => {
    const metaplex = metaplexProvider.metaplex;
    if (metaplex?.identity()) {
      try {
      } catch (error) {}
    }
  }, [metaplexProvider.metaplex]);
  return (
    <div className="text-gray-500 bg-orange-100 border-8 rounded-3xl p-20 max-w-4xl	">
      <h1 className="font-extrabold text-3xl">Fill your token attributes</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <MyTextInput register={{ ...register("name") }} caption="name" />
        <MyTextInput
          register={{ ...register("numDecimals") }}
          caption="Num Decimals"
        />
        <MyTextInput register={{ ...register("symbol") }} caption="Symbol" />
        <MyTextInput
          register={{ ...register("description") }}
          caption="Description"
        />
        <MyTextInput register={{ ...register("image") }} caption="Image Url" />
        <MyTextInput
          register={{ ...register("numTokens") }}
          caption="Num tokens to mint initially"
        />
        {Object.keys(errors).map((k) => (
          <div
            key={k}
            className="m-10 p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
            role="alert"
          >
            <span className="font-medium">{errors[k]?.message as string}</span>
          </div>
        ))}
        <input
          type="submit"
          value="create"
          className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
        />
        <div>{JSON.stringify(tokenAttributes)}</div>
      </form>
    </div>
  );
}
