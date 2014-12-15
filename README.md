# Proposal for new Backbase widget structure

All items examples are listed in project sources core:

1. **widget-example** - example of widget, it's conf, dependencies and generated files
2. **bundle-example** - example of bundle, that have `widget-example` as a dependency. Output folder contains files generated after `backbase install` command (more info above)
3. **portal-example** - could be configured the same as `bundle-example`, but only for whole portal scope.

## bb-cli install demo workflow

To install portal or bundle dependencies, we would use backbase-cli tools, as an abstraction on top of popular package managers as npm and bower. Compatibility with mentioned package managers without proprietary abstraction will remain, but with abstracted tool we will gather few steps behind one command - `backbase install`. RequireJS is used for dependency loading on client-side.

Lets discover more details on how `backbase install` will work:

### 1. Download all item dependencies

For this step, we will use [NPM](https://www.npmjs.org/) to install all **item dependencies** (widgets, containers, client dependency bundles). NPM will parse `package.json` file, that is stored in your root folder:

```json
    {
      "name": "backbase-bundle",
      "version": "0.0.0",
      "description": "Demo backbase bundle with widget dependencies",
      "keywords": [
        "backbase"
      ],
      "maintainers": [
        "Robert Haritonov <r@rhr.me>"
      ],
      "license": "MIT",
      "dependencies": {
        "robert-todo": "0.1.0"
      }
    }
```

And will download all listed "dependencies" (or contents of bundle) to `node_modules` folder in your root. NPM supports nested dependencies download, that will allow to install all dependency trees with one command.

```
    /project-root
        ├─ package.json
        ├─ node_modules
            ├─ robert-rodo
                ├─ package.json
                ├─ node_modules
                    ├─ robert-todo-deps...
```

This adds great flexibility in terms of bundle packaging, in fact, basic bundle could store only one file, that is `package.json` with listed widgets and other items as its content.

**You can define eny endpoint for your dependencies - it could be published, public npm package, path to git repository, path to .zip file on the web, or just local path to dependency.**

### 2. Install all client-side dependencies

For installing client-side dependencies, we use [Bower](http://bower.io/), that is specialized package manager for the web. As after `npm install` (that is one of `backbase install` steps under the hood), we get this kid of nested dependency tree:

```
    /project-root
        ├─ package.json
        ├─ bower.json
        ├─ node_modules
            ├─ robert-rodo
                ├─ package.json
                ├─ bower.json
                ├─ node_modules
                    ├─ robert-todo-deps...
```

We need to gather all `bower.json` files, that stores our client-side dependencies, and run each after another to install all client-side dependencies in one folder.

Here's how `bower.json` contents looks like:

```json
    {
      "name": "robert-todo",
      "dependencies": {
        "backbone": "~1.1.2",
        "jquery": "~2.1.1",
        "requirejs": "https://github.com/jrburke/requirejs#2.1.14",
        "shared": "/Users/robert/Dropbox/Project/all/backbase-widget-proposal/testing-bits/node_modules/backbone"
      }
    }
```

As npm, bower also supports flexible endpoints for dependencies.

Our special script will user native bower API, to run each install, and if during installation, bower will notice same dependencies, it will merge it, and if there will be version conflicts, you will get promted with options to choose:

* Use latest version of dependency
* Use selected version

For edge cases, it will be possible to define 2 versions of one library in one place.

After this step, we will have this file structure:

```
    /project-root
        ├─ package.json
        ├─ bower.json
        ├─ bower_components
            ├─ jquery
            ├─ requirejs
            ├─ shared
        ├─ node_modules
            ├─ robert-rodo
            ├─ and-other-item-deps

```

All client-side dependencies are stored in one place on one level.

### 3. Generating requirejs config

After download of all needed dependencies, we automatically generate `require-conf.js`:

```js
    requirejs.config({
        paths: {
            // Shims
            'jquery': '/bower_components/jquery/dist/jquery',
            'backbone': '/bower_components/backbone/backbone',

            // Paths shorthands, for portal widget path will be different
            'widget/robert-todo': '/node_modules/robert-todo/js/main',
            'bower_components': '/bower_components'
        }
    });
```

This config will provide us short links to dependencies, that we will require from js modules, and will provide namespace for item entry files like `/node_modules/robert-todo/js/main.js`. Allowing us to call all dependencies will clean paths:

```js
    require([
        "jquery",
        "backbone",
        "widget/robert-todo"
        ], function ($, backbone, robertTodo) {
    });
```

### 4. Additional options

As additional steps, we will generate `assets-tree.json`, where all paths to css, js, img files will be gathered, to be used from Grunt/Gulp build scripts.