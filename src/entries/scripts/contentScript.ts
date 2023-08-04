interface KumaProps {
  method: string;
  params: object;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.kuma = {
  call: ({ method, params }: KumaProps) => {
    const origin = window.location.origin;
    return new Promise((res) => {
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
