import { FaSmileBeam } from "react-icons/fa";

console.log("hola");
(window as any).kuma = {
  hello: () => "hello",
  connect: async () => {
    return new Promise((res, rej) => {
      try {
        window.postMessage({
          connect: "connect",
          from: "kuma",
          method: "connect",
        });

        window.addEventListener("message", async function response(e) {
          if (e.data["to"] === "connect") {
            res(e.data);
            window.removeEventListener("message", response);
          }
        });
      } catch (error) {
        rej(error);
      }
    });
  },
  open: () => {
    window.postMessage({
      from: "kuma",
      method: "open",
    });
  },
};
