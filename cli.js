#!/usr/bin/env node

let fs = require('fs')
let path = require('path')
let os = require('os')

let skipFiles = {
  'node_modules': '',
  '.git': '',
  'data': '',
  'dist': '',
  'build': '',
  '.nyc_output': '',
  'coverage': '',
  '.angular': '',
}

let skipPaths = {}
if (fs.existsSync('.prettierignore')) {
  let text = fs.readFileSync('.prettierignore').toString()
  let lines = text.split('\n')
  for (let line of lines) {
    line = line.trim()
    if (line.startsWith('#')) continue
    line = line.replace(/^\//, '').replace(/\/$/, '')
    if (!line) continue
    skipPaths[line] = ''
  }
}

function scanDir(dir) {
  fs.readdirSync(dir).forEach(file => scanPath(dir, file))
}

function scanPath(dir, filename) {
  if (filename in skipFiles) return
  if (filename in skipPaths) return
  let file = path.join(dir, filename)
  if (file in skipPaths) return
  let stats = fs.lstatSync(file)
  if (stats.isDirectory()) {
    return scanDir(file)
  }
  if (stats.isFile()) {
    return scanFile(file)
  }
}

function isObject(o) {
  return o && typeof o === 'object'
}

function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function sortObject(object, key) {
  let o = object[key]
  if (!isObject(o)) {
    return
  }
  o = Object.fromEntries(Object.entries(o).sort((a, b) => compare(a[0], b[0])))
  object[key] = o
}

function scanFile(file) {
  if (path.extname(file) !== '.json') return
  let text = fs.readFileSync(file).toString()
  let newText
  try {
    let json = JSON.parse(text)
    if (isObject(json)) {
      sortObject(json, 'dependencies')
      sortObject(json, 'devDependencies')
      sortObject(json, 'peerDependencies')
    }
    newText = JSON.stringify(json, null, 2) + os.EOL
  } catch (error) {
    console.error('Failed to parse file:', file)
    return
  }
  if (text === newText) {
    console.log('skip file:', file)
    return
  }
  fs.writeFileSync(file, newText)
  console.log('saved file:', file)
}

scanDir('.')
