interface ImportMetaEnv {
  readonly OCNANO_CHANNEL: string
  readonly OCNANO_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
