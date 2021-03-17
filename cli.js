#!/usr/bin/env node

let fs = require('fs')
let path = require('path')
let os = require('os')

function scanDir(dir) {
  fs.readdirSync(dir).forEach(file => scanPath(path.join(dir, file)))
}

function scanPath(file) {
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
  if (text === newText) return
  fs.writeFileSync(file, newText)
}

scanDir('.')
