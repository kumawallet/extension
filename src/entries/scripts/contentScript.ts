interface KumaProps {
  method: string;
  params: object;
}

(window as any).kuma = {
  call: ({ method, params }: KumaProps) => {
    const origin = window.location.origin;
    return new Promise((res, rej) => {
      window.postMessage({
        origin: "kuma",
        method,
        params: { ...params, origin },
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
