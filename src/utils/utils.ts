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
