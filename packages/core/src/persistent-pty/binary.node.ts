export const available = true

export async function resolveBinary() {
  return process.env.OCNANO_PTY_BIN || "ocnano-pty"
}
