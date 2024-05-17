import {
  MessageTypes,
  RequestType,
  RequestTypes,
  ResponseType,
} from "./request-types";

export type Port = chrome.runtime.Port;

export declare type OriginTypes = "kuma-page" | "kuma-extension";

export interface TransportRequestMessage<TMessageType extends MessageTypes> {
  id: string;
  message: TMessageType;
  origin: OriginTypes;
  request: RequestTypes[TMessageType];
}

interface Handler {
  handle<TMessageType extends MessageTypes>(
    id: string,
    type: TMessageType,
    request: RequestTypes[TMessageType],
    port: Port,
    url?: string
  ): Promise<ResponseType<TMessageType>>;
}

abstract class HandlerBase implements Handler {
  public abstract handle<TMessageType extends MessageTypes>(
    id: string,
    type: TMessageType,
    request: RequestType<TMessageType>,
    port: Port,
    url?: string
  ): Promise<ResponseType<TMessageType>>;
}

export abstract class TabsHandler extends HandlerBase {
  abstract handle<TMessageType extends MessageTypes>(
    id: string,
    type: TMessageType,
    request: RequestTypes[TMessageType],
    port: Port,
    url: string
  ): Promise<ResponseType<TMessageType>>;
}

export abstract class ExtensionHandler extends HandlerBase {
  abstract handle<TMessageType extends MessageTypes>(
    id: string,
    type: TMessageType,
    request: RequestTypes[TMessageType],
    port: Port
  ): Promise<ResponseType<TMessageType>>;
}
