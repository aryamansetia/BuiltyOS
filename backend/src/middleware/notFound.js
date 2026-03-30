export const notFound = (_req, res) => {
  res.status(404).json({ message: "Resource not found" });
};
