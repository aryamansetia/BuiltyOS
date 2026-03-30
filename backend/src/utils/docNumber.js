export const generateDocNumber = (prefix) => {
  const unixPart = Date.now().toString().slice(-8);
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${unixPart}-${randomPart}`;
};
