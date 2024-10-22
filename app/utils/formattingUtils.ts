export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }
  const units = ["K", "M", "B", "T"];
  let index = -1;

  do {
    num /= 1000;
    index++;
  } while (num >= 1000 && index < units.length - 1);
  return num.toFixed(1) + units[index];
};
