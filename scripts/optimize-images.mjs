import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const assets = [
  'public/images/projects/sgs/main.png',
  'public/images/projects/sgs/cover.png',
  'public/images/work/sgs.png',
]

for (const relativeInput of assets) {
  const input = path.join(root, relativeInput)
  const output = input.replace(/\.png$/i, '.webp')
  const sourceMetadata = await sharp(input).metadata()

  await sharp(input)
    .webp({ quality: 84, effort: 5 })
    .toFile(output)

  const outputMetadata = await sharp(output).metadata()
  if (
    sourceMetadata.width !== outputMetadata.width ||
    sourceMetadata.height !== outputMetadata.height
  ) {
    throw new Error(`Dimensões alteradas em ${relativeInput}`)
  }

  const [sourceStat, outputStat] = await Promise.all([fs.stat(input), fs.stat(output)])
  console.log(
    `${relativeInput}: ${sourceStat.size} B -> ${path.relative(root, output)}: ${outputStat.size} B ` +
      `(${sourceMetadata.width}x${sourceMetadata.height})`
  )
}
