import { PageWrapper } from "../common/PageWrapper";
import passworder from "@metamask/browser-passworder";
import { useState } from "react";

export const Decrypt = () => {
  const [encrypted, setencrypted] = useState("");
  const [password, setpassword] = useState("");
  const [result, setresult] = useState("");

  const decrypt = async () => {
    try {
      const decrpted: string = await passworder.decrypt(
        password,
        String(encrypted)
      );
      console.log(decrpted);
      setresult(decrpted);
    } catch (error) {
      setresult(String(error));
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col w-full gap-4">
        <div>
          <p>encrypted:</p>
          <textarea
            className="w-full text-white bg-gray-600 h-20"
            value={encrypted}
            rows={6}
            onChange={({ target }) => setencrypted(target.value)}
          />
        </div>
        <div className="mb-7">
          <p>password</p>
          <input
            className="w-full text-white bg-gray-600 py-5"
            value={password}
            onChange={({ target }) => setpassword(target.value)}
          />
        </div>
        <button className="bg-custom-green-bg" onClick={decrypt}>
          decrypt
        </button>

        <div className="mt-5">
          <p>result:</p>
          <code>{JSON.stringify(result)}</code>
        </div>
      </div>
    </PageWrapper>
  );
};
