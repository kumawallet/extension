import {
  cropAccount,
  getAccountType,
  formatAccount,
  transformAddress,
} from "@src/utils/account-utils";
import PolkadotKeyring from "@polkadot/ui-keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

const mockWasmAddress = "5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF";
const mockEVMAddress = "0x041fA537c4Fab3d7B91f67B358c126d37CBDa947";

describe("account-utils", () => {
  beforeAll(async () => {
    await cryptoWaitReady();
    PolkadotKeyring.loadAll({ ss58Format: 42, type: "sr25519" });
  });

  describe("cropAccount", () => {
    it("should return cropAccount", () => {
      const croppedAccount = cropAccount(mockWasmAddress);
      expect(croppedAccount).toEqual(
        `${mockWasmAddress.slice(0, 4)}...${mockWasmAddress.slice(
          mockWasmAddress.length - 4,
          mockWasmAddress.length
        )}`
      );
    });

    it("should return empty", () => {
      const croppedAccount = cropAccount("");
      expect(croppedAccount).toEqual("");
    });
  });

  describe("formatAccount", () => {
    it("should format EVM account", () => {
      const result = formatAccount(`EVM-${mockEVMAddress}`);
      expect(result.address).toEqual(mockEVMAddress);
      expect(result.type).toEqual("EVM");
    });

    it("should format WASM account", () => {
      const result = formatAccount(`WASM-${mockWasmAddress}`);
      expect(result.address).toEqual(mockWasmAddress);
      expect(result.type).toEqual("WASM");
    });
  });

  describe("formatAddress", () => {
    it("format ROCOCO format to x format", () => {
      const rococo = "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP";
      const rockmine = "GwMVmyHMM1jCmSDmbEZHehHnFuxpF9WoRSkE9gVopSmGmDv";

      const result = transformAddress(rococo, 2);
      expect(result).toEqual(rockmine);
    });

    it("should return the same EVM Account", () => {
      const result = transformAddress(mockEVMAddress);
      expect(result).toEqual(mockEVMAddress);
    });

    it("should return empty", () => {
      const result = transformAddress("");
      expect(result).toEqual("");
    });
  });

  describe("getAccountType", () => {
    it("should format imported account type", () => {
      const result = getAccountType("IMPORTED_EVM");
      expect(result).toEqual("EVM");
    });

    it("should return the same account type", () => {
      const result = getAccountType("EVM");
      expect(result).toEqual("EVM");
    });
  });
});
