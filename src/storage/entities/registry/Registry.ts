import BaseEntity from "../BaseEntity";
import Contact from "./Contact";
import Register from "./Register";

export default class Registry extends BaseEntity {
  data: {
    contacts: { [contactAddress: string]: Contact };
    recent: { [network: string]: Register[] };
  };

  constructor() {
    super();
    this.data = {
      contacts: {},
      recent: {},
    };
  }

  static async getDefaultValue<Registry>(): Promise<Registry> {
    return new Registry() as Registry;
  }

  static async init() {
    await Registry.set<Registry>(new Registry());
  }

  static async addContact(contact: Contact) {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_add_contact");
    registry.addContact(contact);
    await Registry.set<Registry>(registry);
  }

  static async getContact(address: string): Promise<Contact | undefined> {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_get_contact");
    return registry.getContact(address);
  }

  static async changeContactName(address: string, name: string) {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_update_contact");
    const contact = registry.getContact(address);
    if (!contact) throw new Error("contact_not_found");
    contact.name = name;
    await Registry.set<Registry>(registry);
  }

  static async removeContact(address: string) {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_remove_contact");
    delete registry.data.contacts[address];
    await Registry.set<Registry>(registry);
  }

  static async addRecentAddress(network: string, register: Register) {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_add_recent_address");
    registry.addRecentAddress(network, register);
    await Registry.set<Registry>(registry);
  }

  static async getRecentAddresses(network: string): Promise<Register[]> {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_get_recent_addresses");
    return registry.getRecentAddresses(network);
  }

  addContact(contact: Contact) {
    this.data.contacts[contact.address] = contact;
  }

  getContact(address: string): Contact | undefined {
    return this.data.contacts[address];
  }

  addRecentAddress(network: string, register: Register) {
    if (!this.data.recent[network]) {
      this.data.recent[network] = [] as unknown as [Register];
    }

    const recentIndex = this.data.recent[network].findIndex(
      (recent) => recent.address === register.address
    );
    const alreadyRegister = recentIndex > -1;
    const finalRecentIndex = this.data.recent[network].length - 1;

    if (alreadyRegister && recentIndex === finalRecentIndex) return;

    if (alreadyRegister && recentIndex !== finalRecentIndex) {
      // delete from last position
      this.data.recent[network].splice(recentIndex, 1);
    }

    if (this.data.recent[network].length >= 10) {
      this.data.recent[network].shift();
    }

    this.data.recent[network].push(register);
  }

  getRecentAddresses(network: string): Register[] {
    return (
      this.data.recent?.[network]?.sort(
        (a: Register, b: Register) => b.timestamp - a.timestamp
      ) || []
    );
  }

  getAllContacts(): Contact[] {
    return Object.values(this.data.contacts || {}) || [];
  }
}
