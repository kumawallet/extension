import {
  RequestRemoveContact,
  RequestSaveContact,
  RequestUpdateContact
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const contactsMessages = {
  getContacts: () => {
    return sendMessage("pri(contacts.getContacts)");
  },
  getRegistryAddresses: () => {
    return sendMessage("pri(contacts.getRegistryAddresses)");
  },
  saveContact: (params: RequestSaveContact) => {
    return sendMessage("pri(contacts.saveContact)", params);
  },
  updateContact: (params: RequestUpdateContact) => {
    return sendMessage("pri(contacts.updateContact)",params)
  },
  removeContact: (params: RequestRemoveContact) => {
    return sendMessage("pri(contacts.removeContact)", params);
  },
};
