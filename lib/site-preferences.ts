/** Registros próprios de preferências e continuidade visual do gandra.tech. */
export const localPreferenceKeys = ['gt-intro', 'gt-som'] as const
export const sessionPreferenceKeys = ['gt-intro', 'gt-tinta', 'gt-sig', 'gt-scroll'] as const

type RemovableStorage = Pick<Storage, 'removeItem'>

/** Remove apenas as chaves conhecidas. Outras aplicações/dados ficam intactos. */
export function removeSitePreferences(local: RemovableStorage, session: RemovableStorage): boolean {
  let complete = true

  for (const key of localPreferenceKeys) {
    try {
      local.removeItem(key)
    } catch {
      complete = false
    }
  }

  for (const key of sessionPreferenceKeys) {
    try {
      session.removeItem(key)
    } catch {
      complete = false
    }
  }

  return complete
}
