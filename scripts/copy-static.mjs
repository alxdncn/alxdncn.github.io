import { cpSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')

const staticDirectories = ['assets', 'images', 'videos', 'VideoPieceWebsite']
const staticFiles = ['CNAME', 'onNature.html', 'loadOnNature.html']

mkdirSync(dist, { recursive: true })

for (const directory of staticDirectories) {
  cpSync(resolve(root, directory), resolve(dist, directory), { recursive: true })
}

for (const file of staticFiles) {
  cpSync(resolve(root, file), resolve(dist, file))
}

// Prevent GitHub Pages from treating generated files as a Jekyll site.
writeFileSync(resolve(dist, '.nojekyll'), '')
