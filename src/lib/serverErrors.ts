import "server-only";

/** Keep database messages, queries, record values and connection details private. */
export function logServerError(message: string, error: unknown): void {
  const code = error && typeof error === "object" && "code" in error
    ? error.code
    : null;
  console.error(message, {
    code: typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)
      ? code
      : "UNKNOWN",
  });
}
