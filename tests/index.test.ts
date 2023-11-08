import { readdir } from 'fs/promises'

const files = await readdir('./tests')
const testFiles = files.filter(f => f.endsWith('.test.ts'))
  .filter(f => f !== 'index.test.ts')

for (const testFile of testFiles) {
  await import(`./${testFile}`)
}
