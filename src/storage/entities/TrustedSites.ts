import BaseEntity from "./BaseEntity";

export default class TrustedSites extends BaseEntity {
  data: string[];

  constructor() {
    super();
    this.data = [];
  }

  static async getDefaultValue<TrustedSites>(): Promise<TrustedSites> {
    return new TrustedSites() as TrustedSites;
  }

  static async init() {
    await TrustedSites.set<TrustedSites>(new TrustedSites());
  }

  static async getAll(): Promise<string[]> {
    const trustedSites = await TrustedSites.get<TrustedSites>();
    if (!trustedSites) throw new Error("failed_to_get_trusted_sites");
    return trustedSites.data;
  }

  static async addSite(url: string) {
    const trustedSites = await TrustedSites.get<TrustedSites>();
    if (!trustedSites) throw new Error("failed_to_add_trusted_site");
    trustedSites.addSite(url);
    await TrustedSites.set<TrustedSites>(trustedSites);
  }

  addSite(url: string) {
    const site = this.data.find((site) => site === url);
    if (site) throw new Error("site_already_added");
    this.data.push(url);
  }
}
