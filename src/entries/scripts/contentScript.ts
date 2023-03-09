interface KumaProps {
  method: string;
  params: object;
}

(window as any).kuma = {
  call: ({ method, params }: KumaProps) => {
    return new Promise((res, rej) => {
      window.postMessage({
        origin: "kuma",
        method: method,
        params: params,
      });

      window.addEventListener("message", async function response(e) {
        if (
          e.data["method"] === `${method}_response` &&
          e.data["from"] === "content"
        ) {
          res(e.data?.response);
          window.removeEventListener("message", response);
        }
      });
    });
  },
};
