import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { build } from 'vite'
import { readFileSync, writeFileSync } from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function buildRuntime() {
  const runtimeDir = path.join(__dirname, 'src', 'runtime')
  const outputDir = path.join(__dirname, 'src', 'auto-built')
  
  const files = fs.readdirSync(runtimeDir)

  const tsFiles = files
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(runtimeDir, file))

  const otherFiles = files
    .filter(file => !file.endsWith('.ts'))
    .map(file => path.join(runtimeDir, file))
  
  if (tsFiles.length === 0) {
    console.error('No typescript files found in ./src/runtime')
    return
  }
  
  const fileObj = {}

  for (const file of otherFiles) {
    const content = fs.readFileSync(file, 'utf8')
    fileObj[path.basename(file)] = content
  }

  // build with vite
  
  const outputs = []
  
  for (const file of tsFiles) {
    const result = await build({
      build: {
        minify: false, //doesn't even do that much, so skipped for now
        write: false,
        lib: {
          entry: file,
          formats: ['iife'],
          name: '$$__engX082398', // vite wants this. will become global window property, so to minimize collisions,
            // stupid convoluted name is probably good.
        },
        rollupOptions: {
          output: {
            inlineDynamicImports: true
          }
        }
      },
      logLevel: 'warn'
    })
    
    const output = Array.isArray(result) ? result[0] : result
    const code = output.output[0].code
    outputs.push(code)
  }
  
  // join to string

  const joinedCode = outputs.join('\n')

  const dataObject = { 
    code: joinedCode,
    files: fileObj,
  }
  const jsonString = JSON.stringify(dataObject)
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // Write to file with the specified format
  const outputPath = path.join(outputDir, 'runtime-built.js')
  const finalContent = `window.$__$runtimeData = ${jsonString}`
  
  fs.writeFileSync(outputPath, finalContent, 'utf8')
  
  console.log(`built ${tsFiles.length} files -> ${outputPath}`)

  // remove temporary file created by vite:
  if ( fs.existsSync(path.join(__dirname, 'src', 'runtime', '__entry.ts')) ) {
    fs.unlinkSync(path.join(__dirname, 'src', 'runtime', '__entry.ts'))
  }

  //and copy the runtime-built.js file into the dist folder because we need it there, too:
  const sourcePath = path.join(__dirname, 'src', 'auto-built', 'runtime-built.js')
  
  // In the following line, we
  // do NOT copy the file into a directory named "dist/src/auto-built/" !
  // because if you do that, gh-pages will look at the .gitignore,
  // see a line saying "src/auto-built"
  // and not include it in the upload breaking the deployment.
  // And of course, you should not remove "src/auto-built"
  // from the .gitignore file either, because that will just
  // commit the auto-built file to "main" which is harmless, but stupid and
  // annoying. That's why we go with a slightly different name: src/auto-builtx

  const distTargetPath = path.join(__dirname, 'dist', 'src', 'auto-builtx', 'runtime-built.js')
  const distDir = path.dirname(distTargetPath)
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })
  if (fs.existsSync(sourcePath)) fs.copyFileSync(sourcePath, distTargetPath)

  // and finally, fix the HTML:
  const html = readFileSync("./dist/index.html", "utf8")
  const updated = html.replace(
    "<script src=\"src/auto-built/runtime-built.js\"></script>",
    "<script src=\"src/auto-builtx/runtime-built.js\"></script>"
  )
  writeFileSync("./dist/index.html", updated, "utf8")

}

buildRuntime().catch(err => {
  console.error('build failed', err)
  process.exit(1)
})