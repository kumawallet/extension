import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { expand, extract } from "@noble/hashes/hkdf";
import { pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha3_256 } from "@noble/hashes/sha3";
import { Buffer } from "buffer";

export const MNEMONIC_SALT =
  "0L WALLET: UNREST, FIRES, AND VIOLENCE AS PROTESTS RAGE ACROSS US: mnemonic salt prefix$0L";

export const SALT2 =
  "0L WALLET: 30 MILLION AMERICANS HAVE FILED INITIAL UNEMPLOYMENT CLAIMS: master key salt$";

export const INFO =
  "0L WALLET: US DEATHS NEAR 100,000, AN INCALCULABLE LOSS: derived key$";

const formatPath = (path: number): Buffer => {
  const leN = Buffer.allocUnsafe(8);
  leN.writeUInt32LE(path, 0);

  return leN;
};

export const createOLAccountFromMnemonic = async (
  mnemonic: string,
  path?: number
): Promise<string> => {
  const _seed = await pbkdf2Async(sha3_256, mnemonic, MNEMONIC_SALT, {
    c: 2048,
    dkLen: 32,
  });

  const extracted = await extract(sha3_256, _seed, SALT2);
  const expanded = await expand(
    sha3_256,
    extracted,
    Buffer.concat([Buffer.from(INFO, "ascii"), formatPath(path || 0)]),
    32
  );

  const pk = new Ed25519PrivateKey(expanded);

  const account = Account.fromPrivateKey({
    privateKey: pk,
  });

  return account.accountAddress.bcsToHex().toStringWithoutPrefix();
};
