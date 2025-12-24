import { access, constants, cp, mkdir, rm, writeFile } from 'fs/promises'
import path from 'path'
import url from 'url'

const projectRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const source = path.join(projectRoot, 'node_modules', '@3d-dice', 'dice-box', 'dist', 'assets')
const destination = path.join(projectRoot, 'public', 'assets')

async function copyDiceAssets() {
  try {
    await access(source, constants.R_OK)
  } catch {
    console.warn(`Dice assets not found at ${source}. Install dependencies first.`)
    return
  }

  await rm(destination, { recursive: true, force: true })
  await mkdir(destination, { recursive: true })
  await cp(source, destination, { recursive: true })
  await writeFile(path.join(destination, '.gitkeep'), '')
  console.log(`Copied dice assets to ${destination}`)
}

copyDiceAssets().catch((err) => {
  console.error('Failed to copy dice assets:', err)
  process.exitCode = 1
})
