import { FieldValues, useForm } from "react-hook-form";

// import secret from "./guideSecret.json";
import { useEffect } from "react";
import { useMetaplex } from "./useMetaplex";
import { UploadMetadataInput } from "@metaplex-foundation/js";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MyTextInput } from "./components/MyTextInput";

type TokenAttributes = UploadMetadataInput & {
  numDecimals: Number;
  numberTokens: Number;
};

const schema = yup
  .object({
    name: yup.string().required(),
    numDecimals: yup.number().min(0).integer().max(9).required(),
    symbol: yup.string().required(),
    description: yup.string().optional(),
    image: yup.string().optional(),
    numTokenInitial: yup.number().min(0).required(),
  })
  .required();

export default function NewFungibleTokenForm() {
  const metaplexProvider = useMetaplex();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit = async (data: FieldValues) => {
    const metaplex = metaplexProvider.metaplex;
    if (metaplex) {
    } else {
      alert("metaplex not initialized");
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
        <MyTextInput
          register={{ ...register("name", { required: true }) }}
          caption="name"
        />
        <MyTextInput
          register={{ ...register("numDecimals", { required: true }) }}
          caption="Num Decimals"
        />
        <MyTextInput
          register={{ ...register("symbol", { required: true }) }}
          caption="Symbol"
        />
        <MyTextInput
          register={{ ...register("description", { required: true }) }}
          caption="Description"
        />
        <MyTextInput
          register={{ ...register("image", { required: true }) }}
          caption="Image Url"
        />
        <MyTextInput
          register={{ ...register("numTokenInitial", { required: true }) }}
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
      </form>
    </div>
  );
}
