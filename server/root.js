import { fileURLToPath } from 'url'
import { dirname } from 'path'

export const root = dirname(dirname(fileURLToPath(import.meta.url)))
