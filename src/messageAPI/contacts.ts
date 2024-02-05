import {
  RequestRemoveContact,
  RequestSaveContact,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const contactsMessages = {
  getContacts: () => {
    return sendMessage("pri(contacts.getContacts)", null);
  },
  getRegistryAddresses: () => {
    return sendMessage("pri(contacts.getRegistryAddresses)", null);
  },
  saveContact: (params: RequestSaveContact) => {
    return sendMessage("pri(contacts.saveContact)", params);
  },
  removeContact: (params: RequestRemoveContact) => {
    return sendMessage("pri(contacts.removeContact)", params);
  },
};
