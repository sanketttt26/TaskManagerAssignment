export function isEmail(value) {
  return typeof value === "string" && /.+@.+\..+/.test(value);
}

export function sanitizeString(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "");
}

