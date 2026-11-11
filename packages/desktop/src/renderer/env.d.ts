import type { ElectronNative } from "../preload/types"

declare global {
  interface ImportMetaEnv {
    readonly OCNANO_TEST_ONBOARDING: boolean
  }

  interface Window {
    electron: ElectronNative
    __OCNANO__?: {
      deepLinks?: string[]
    }
  }
}
