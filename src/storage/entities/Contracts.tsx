import { _Contract } from "@src/types";
import BaseEntity from "./BaseEntity";

export default class Contracts extends BaseEntity {
  contracts: _Contract[];

  private static instance: Contracts;

  constructor() {
    super();
    this.contracts = [];
  }

  static getName() {
    return "Contracts";
  }

  public static getInstance() {
    if (!Contracts.instance) {
        Contracts.instance = new Contracts();
    }
    return Contracts.instance;
  }

  static async init() {
    await Contracts.set<Contracts>(Contracts.getInstance());
  }

  static async get<Network>(): Promise<Network> {
    const network = await super.get<Network>();
    if (!network) throw new Error("network_not_found");
    return network;
  }

  get() {
    return this.contracts;
  }

  setOne(contract: _Contract) {
    this.contracts.push(contract)

  }
  set(contract: _Contract[]) {
    this.contracts = contract

  }
}
