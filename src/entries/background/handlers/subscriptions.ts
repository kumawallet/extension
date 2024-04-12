import { Observable } from "rxjs";
import {
  MessageTypesWithSubscriptions,
  SubscriptionMessageTypes,
} from "./request-types";
import { Port } from "./types";

type Subscriptions = Record<string, Port>;

const subscriptions: Subscriptions = {};

export const createSubscription = <
  TMessageType extends MessageTypesWithSubscriptions
>(
  id: string,
  port: Port
): ((data: SubscriptionMessageTypes[TMessageType]) => void) => {
  subscriptions[id] = port;

  return (subscription: unknown): void => {
    if (subscriptions[id]) {
      port.postMessage({ id, subscription });
    }
  };
};

export const unsubscribe = (id: string) => {
  subscriptions[id] && delete subscriptions[id];
};

export function handleSubscription<
  TMessageType extends MessageTypesWithSubscriptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
>(id: string, port: Port, observable: Observable<any>): boolean {
  const cb = createSubscription<TMessageType>(id, port);
  const subscription = observable.subscribe((data) => cb(data));

  port.onDisconnect.addListener((): void => {
    unsubscribe(id);
    subscription.unsubscribe();
  });

  return true;
}
