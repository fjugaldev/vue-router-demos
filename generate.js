#!/bin/bash node
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const prettier = require("prettier");

Promise.resolve(glob.sync(`${__dirname}/examples/*`))
.then(
    files => files.filter(dir => fs.lstatSync(dir).isDirectory())
)
.then(
    dirs => dirs.map(dir => ({path: dir, name: dir.replace(`${__dirname}/examples/`, '')}))
)
.then(
    dirs => dirs.map(dir => (
`{
    name: ${JSON.stringify(dir.name)},
    files: ${JSON.stringify(
                glob.sync(`${dir.path}/**/*`)
                    .filter(filename => /\.(vue|js|jsx)$/.test(filename))
                    .map(filename => filename.replace(`${dir.path}/`, '')),
                null, 2)},
    bundle: () => import('./${dir.name}')
}`))
)
.then(
    examples => fs.writeFile(
        path.join(__dirname, 'examples/index.js'), 
        prettier.format('// NOTE: THIS IS AN AUTOGENERATED FILE.\nexport default [\n' + examples.join(',\n') + '\n]\n', {semi: false}),
        (error) => {
            if (error) console.log(error)
        })
)