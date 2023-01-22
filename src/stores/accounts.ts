import { KeyringJson, KeyringStore } from "@polkadot/ui-keyring/types";

export class AccountStore implements KeyringStore {
  public all(update: (key: string, value: KeyringJson) => void): void {
    //
    console.log("public all");
  }

  public get(_key: string, update: (value: KeyringJson) => void): void {
    //
    console.log("public get");
  }

  public remove(_key: string, update?: () => void): void {
    //
  }

  public set(key: string, value: KeyringJson, update?: () => void): void {
    //

    console.log("set");
    console.log({
      key,
      value,
    });

    chrome.storage.local.set({ [key]: value }, (): void => {
      update && update();
    });
  }
}
