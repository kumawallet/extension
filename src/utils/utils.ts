export const formatDate = (date: number) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.toLocaleString("default", { month: "short" });
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const now = new Date();

  // Calculate the difference between the date and now in milliseconds
  const diffMs = now.getTime() - date;

  // Define the units of time and their conversion factors in milliseconds
  const units = [
    { label: "year", factor: 31536000000 },
    { label: "month", factor: 2592000000 },
    { label: "day", factor: 86400000 },
    { label: "hour", factor: 3600000 },
    { label: "minute", factor: 60000 },
    { label: "second", factor: 1000 },
  ];

  // Loop through the units of time and determine which one to display
  for (const unit of units) {
    const diffUnit = Math.floor(diffMs / unit.factor);

    if (diffUnit >= 1) {
      let diffLabel = unit.label;

      // Make the label plural if necessary
      if (diffUnit > 1) {
        diffLabel += "s";
      }
      let formatted = `${month} ${day} - ${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")} (${diffUnit} ${diffLabel} ago)`;
      if (year !== new Date().getFullYear()) {
        formatted = `(${year}) ${formatted}`;
      }
      return formatted;
    }
  }

  // If the difference is less than 1 second, return "less than a second ago"
  return `${month} ${day} - ${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")} (less than a second ago)`;
};
