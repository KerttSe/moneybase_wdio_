// Specs live in domain folders (src/tests/<Area>/<feature>/) and keep unique file names.
const fs = require('node:fs')
const path = require('node:path')

/** Map of spec file name -> repo-relative path, e.g. 'homeSearch.spec.ts' -> 'src/tests/Core/home-page/homeSearch.spec.ts'. */
function specFiles() {
  return new Map(fs.readdirSync('src/tests', { recursive: true })
    .filter(file => file.endsWith('.spec.ts'))
    .map(file => [path.basename(file), `src/tests/${file.split(path.sep).join('/')}`]))
}

const specNames = () => [...specFiles().keys()].sort()
const specPaths = () => [...specFiles().values()].sort()
function specPath(name) {
  const file = specFiles().get(name)
  if (!file) throw new Error(`Spec ${name} was not found under src/tests`)
  return file
}

module.exports = { specFiles, specNames, specPaths, specPath }
