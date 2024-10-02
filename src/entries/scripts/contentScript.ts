interface KumaProps {
  method: string;
  params: object;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.kuma = {
  call: ({ method, params }: KumaProps) => {
    console.log("callback del contentScrip")
    const origin = window.location.origin;
    return new Promise((res) => {
      
      window.postMessage({
        origin: "kuma",
        method,
        params: { ...params, origin },
      });
      console.log("aqui se envio un mensaje")
      window.addEventListener("message", async function response(e) {
        console.log("aqui se ejecuto el listener de message del contentscrip")
        if (
          e.data["method"] === `${method}_response` &&
          e.data["from"] === "content"
        ) {
          console.log("entro en el if")
          res(e.data?.response);
          window.removeEventListener("message", response);
        }
      });
    });
  },
};
