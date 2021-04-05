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
}

function scanDir(dir) {
  fs.readdirSync(dir).forEach(file => scanPath(dir, file))
}

function scanPath(dir, filename) {
  if (filename in skipFiles) return
  let file = path.join(dir, filename)
  let stats = fs.lstatSync(file)
  if (stats.isDirectory()) {
    return scanDir(file)
  }
  if (stats.isFile()) {
    return scanFile(file)
  }
}

function scanFile(file) {
  if (path.extname(file) !== '.json') return
  let text = fs.readFileSync(file).toString()
  let newText
  try {
    newText = JSON.stringify(JSON.parse(text), null, 2) + os.EOL
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
