# Proposal for new Backbase widget dependencies structure

This proposal was originally built for Backbase Customer Experience Platform, but could be used with any types of independent front-end widgets.

All items examples are listed in project sources core:

1. **widget-example** - example of widget, it's conf, dependencies and generated files
2. **bundle-example** - example of bundle, that have `widget-example` as a dependency. Output folder contains files generated after `backbase install` command (more info above)
3. **portal-example** - could be configured the same as `bundle-example`, but only for whole portal scope.

## The goal

With this proposal, we are following these goals (sorted by priority):

1. Fast and easy widget and bundles dependency installation (client-side deps and items deps)
2. Easy bundles creation with flexible contents and ease of changing bundle contents
3. Clean, and standardized source code structure of widgets, bundles and project
4. Ability to develop and run widgets as standalone, and keep compatibility with non-backbase specialized widgets

## Dependencies install tool

Primary idea is to use command line tools, wrapped in own abstraction called `backbase-cli` (nodejs script). This tool could be installed globally on developers machine, or packed with portal and called from maven.

To install portal or bundle dependencies, we would use `backbase-cli` tools, as an abstraction on top of Bower and other libraries. Compatibility with Bower package manager without our tools will remain, but with abstracted layer we will gather few steps behind one command - `backbase install`. RequireJS is used for dependency loading on client-side.

Lets discover more details on how `backbase install` will work:

### 1. Download all item (backbase component) dependencies

For this step, we will use [Bower](http://bower.io/) API to install all **item dependencies** (widgets, containers, client dependency bundles).

Entry point for all item (component) and client-side dependency definition is `bower.json` file, that natively works with Bower package manager, and currently treated as de-facto standard for front-end components.

By default, Bower read `dependencies` field, where client-side dependencies are stored (like jquery, backbone and etc), but in first step, we are using custom field `itemDependencies`. We use custom dependencies field to separate types and download paths.

Bower will parse `bower.json` file, that is stored in your root folder:

```json
{
  "name": "backbase-project",
  "dependencies": {},
  "itemDependencies": {
    "some-bundle": "http://some.url/some/bundle.zip",
    "widget-robert-todo": "0.1.0"
  }
}
```

And will download all listed "itemDependencies" to `bb_components` folder in your root. Main difference of Bower package manager from [NPM](https://www.npmjs.org/), is that output of first one is flat tree, when npm outputs nested tree, that is not client-side friendly.

As `some-bundle` is obviously a bundle, it could have other dependencies, like `widget1`, `widget2`, which will be moved to common components folder:

```
backbase-project
├─── bower.json
├─── bb_components
│    ├── widget-robert-todo
│    ├── some-bundle
│    ├── widget1
│    └── widget2...
```

Nested dependencies adds great flexibility in terms of bundle packaging, in fact, basic bundle could store only one file, that is `bower.json` with listed widgets and other items as its content.

**You can define eny endpoint for your dependencies - it could be published, public bower package, path to git/svn repository, path to .zip file on the web, or just local path to dependency.**

### 2. Install all client-side dependencies

For installing **client-side dependencies** we use Bower API as well. As our items can (and will) have their own dependencies, we will get multiple `bower.json` file for each item:

```
backbase-project
├─── bower.json
├─── bb_components
│    └── widget-robert-todo
│        └── bower.json
│    └── some-bundle
│       └── bower.json
│    └── widget1
│       └── bower.json
│    └── widget2
│       └── bower.json
```

We need to gather all `bower.json` files, that stores our client-side dependencies, and run each after another to install all client-side dependencies in one folder.

Here's how `bower.json` of widget "widget-robert-todo" contents looks like:

```json
{
  "name": "widget-robert-todo",
  "dependencies": {
    "backbone": "~1.1.2",
    "jquery": "~2.1.1",
    "requirejs": "https://github.com/jrburke/requirejs#2.1.14",
    "shared": "/Users/robert/bb/shared-widget-dep/"
  }
}
```

#### Managing same dependencies

Our special script will use native bower API, to run each install, and if during installation, bower will notice same dependencies, it will merge it, and if there will be version conflicts, you will get prompted with options to choose:

* Use latest version of dependency
* Use selected version
* For edge cases, we could provide ability to rename deps, and install two jQueries

#### Final dependency folder structure

After resolving conflicts and installing dependencies, we will have this file structure:

```
backbase-project
├─── bower.json
├─── bower_components
│    ├── jquery
│    ├── requirejs
│    └── shared
├─── bb_components
│    ├── widget-robert-todo
│    ├── some-bundle
│    ├── widget1
│    └── widget2...
```

All client-side deps are stored in one place on one level. All items, like widgets, containers and chromes are stored on one level as well, but in different folder `bb_components` (names are open for discussion).

### 3. Generating RequireJS config

After download of all required dependencies, we automatically generate `require-conf.js`:

```js
requirejs.config({
    paths: {
        // Shims
        'jquery': '/static/bower_components/jquery/dist/jquery',
        'backbone': '/static/bower_components/backbone/backbone',

        // Paths shorthands, for portal widget path will be different
        'widget-robert-todo': '/static/bb_components/widget-robert-todo/js/main',
        'bower_components': '/static/bower_components'
    }
});
```

This config will provide us short links to dependencies, that we will require from js modules, and will provide namespace for item entry files like `/bb_components/widget-robert-todo/js/main`. Allowing us to call all dependencies with clean paths:

```js
require([
    'jquery',
    'backbone',
    'widget-robert-todo'
    ], function ($, backbone, robertTodo) {
});
```

### 4. Additional steps (optional)

#### Assets tree for build tools

As additional steps, we will generate `assets-tree.json`, where all paths to css, js, img files will be gathered, to be used from Grunt/Gulp build scripts.

#### Items importing to portal catalogue

After installation we will prompt user, and suggest him to import installed items to his portal through portal API, using XML from defined widgets.

## Portal setup

The only specific setup for proposed dependencies structure is path configuration for static server - folders `bb_components`, `bower_components` must be served from `/static`, so all assets will be available by this urls:

* `/static/bb_components/widget-robert-todo`
* `/static/bower_components/jquery`

### Adding requirejs

Your portal pages must contain link to generated `require-config.js`, or you can bundle all config to one file during build process.

## FAQ

### Widget importing through portal

To remain consistency, importing widgets with `.zip`, through portal, we will need to drop assets to same folder with other downloaded widgets.

### Managing relative paths

As widgets could be developed as standalone, all paths for assets must be relative (except amd modules, with custom require-conf):

* CSS fully supports relative paths, and when you minify all of files to one, it's easy to convert relative paths to absolute (most min tools do that out of the box)
* assets path on `.html` files are managed by portal, during widget injection
* TODO: check situation with JS