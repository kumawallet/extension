export const formatDate = (date: number) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.toLocaleString("default", { month: "short" });
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  let formattedDate = `${month} ${day} - ${hours}:${minutes}`;

  if (year !== new Date().getFullYear()) {
    formattedDate = `(${year}) ${formattedDate}`;
  }

  return formattedDate;
};

export const parseIncomingQuery = (query: string) => {
  const _obj = Object.fromEntries(new URLSearchParams(query));

  Object.keys(_obj).forEach((key) => {
    const atribute = _obj[key];
    if (atribute.startsWith("{") && atribute.endsWith("}")) {
      _obj[key] = JSON.parse(atribute);
    }
  });

  return _obj;
};

export const makeQuerys = (params: Record<string, string>) => {
  return (
    "?" +
    Object.keys(params)
      .map((key) => {
        if (typeof params[key] === "object") {
          return `${key}=${JSON.stringify(params[key])}`;
        }
        return `${key}=${encodeURIComponent(params[key])}`;
      })
      .join("&")
  );
};
