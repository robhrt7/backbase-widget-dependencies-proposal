# Proposal for new Backbase widget dependencies structure

This proposal was originally built for [Backbase Customer Experience Platform](http://backbase.com), but could be used with any types of independent front-end widgets.

Most of structure description is defined in this README file, including install tool (`backbase-cli install`) logic. Plus some item examples (with input/output) are listed in project sources:

1. **widget-example** - example of widget, it's conf, dependencies and generated files
2. **bundle-example** - example of bundle, that have `widget-example` as a dependency. Output folder contains files generated after `backbase install` command (more info below)
3. **portal-example** - could be configured the same as `bundle-example`, but only for whole portal scope.

## The goal

With this proposal, we are following these goals (sorted by priority):

1. Fast and easy widget and bundles dependency installation (client-side deps and bb components deps)
2. Easy bundles creation and it's content management
3. Clean, and standardized source code structure of widgets, bundles and Backbase CXP project it self
4. Ability to develop and run widgets as standalone, and keep compatibility with non-backbase specialized widgets

## Items structure examples

### Widget

#### Source

```
backbase-widget
├─── js
├─── css
├─── template.html
├─── import.xml
└─── bower.json
```
#### Build result

```
backbase-widget
├─── js
├─── css
├─── template.html
├─── import.xml
├─── bower.json
├─── build
│    ├── index.html (for Backbase portal)
│    └── index-dev.html (for standalone development)
├─── bower_components
│    ├── backbone
│    └── jquery...
```

### Bundle

#### Source

```
backbase-bundle
└─── bower.json
```
#### Build result

Bundle build in only necessarily for standalone testing. In case, when we initialize project with bundle as a dependency, we will have only one components folder (`bower_components`) in project root, with all corresponding widgets from different sources. Nested dependencies like `project>bundle>component` will rearange in flat list after installation.

```
backbase-bundle
├─── bower.json
├─── bower_components
│    ├── backbase-widget1
│    ├── backbase-widget2
│    ├── any-other-widget
│    ├── bundle1-client-dep
│    ├── backbone
│    ├── jquery...
│    ├── require-bower-conf.js
│    └── assets-tree.json
```

### Project

#### Source

```
backbase-project
├─── bower.json
└─── other-project-sources...
```
#### Build result

```
backbase-bundle
├─── bower.json
├─── other-project-sources...
├─── bower_components
│    ├── backbase-widget1
│    ├── backbase-widget2
│    ├── project-specific-widget1
│    ├── project-specific-widget2
│    ├── bundle1-client-dep
│    ├── project-client-dep
│    ├── backbone
│    ├── jquery...
│    ├── require-bower-conf.js
│    └── assets-tree.json
```

## Dependencies install tool

Primary idea is to use command line tools, wrapped in own abstraction called `backbase-cli` (nodejs script). This tool could be installed globally on developers machine, or packed with portal and called from maven.

To install portal or bundle dependencies, we would use `backbase-cli` tools, as an abstraction on top of Bower and other libraries. Compatibility with Bower package manager without our tools will remain, but with abstracted layer we will gather few steps behind one command - `backbase install`. RequireJS is used for dependency loading on client-side.

Lets discover more details on how `backbase install` will work:

### 1. Download all Backbase component dependencies

As a package manager, we use [Bower](http://bower.io/) to install all **dependencies** (widgets, containers, client dependency bundles).

Entry point for all item (component) and client-side dependency definition is `bower.json` file, that natively works with Bower package manager, and currently treated as de-facto standard for front-end components.

Bower read `dependencies` field, where client-side dependencies are stored (like jquery, backbone and etc) from `bower.json` file, that is stored in your root folder:

```json
{
  "name": "backbase-project",
  "dependencies": {
    "some-bundle": "http://some.url/some/bundle.zip",
    "widget-robert-todo": "0.1.0"
  }
}
```

And will download all listed `"dependencies"` to `bower_components` folder in your root (or any configured place you want). Main difference of Bower package manager from [NPM](https://www.npmjs.org/), is that output of first one is flat tree, when npm outputs nested tree, that is not client-side friendly.

As `some-bundle` is obviously a bundle, it could have other dependencies, like `widget1`, `widget2`, which will be moved to common components folder:

```
backbase-project
├─── bower.json
├─── bower_components
│    ├── widget-robert-todo
│    ├── some-bundle
│    ├── widget1
│    └── widget2...
```

Nested dependencies adds great flexibility in terms of bundle packaging, in fact, basic bundle could store only one file, that is `bower.json` with listed widgets and other items as its content.

**You can define any endpoint for your dependencies - it could be published, public bower package, path to git/svn repository, path to .zip file on the web, or just local path to dependency.**

### 2. Install all client-side dependencies

For installing **client-side dependencies** we use Bower as well. As our items can (and will) have their own dependencies, we will get multiple `bower.json` file for each item:

```
backbase-project
├─── bower.json
├─── bower_comonents
│    └── widget-robert-todo
│        └── bower.json
│    └── some-bundle
│       └── bower.json
│    └── widget1
│       └── bower.json
│    └── widget2
│       └── bower.json
```

Bower will parse all `bower.json` files, that stores our client-side dependencies, and run each after another to install all client-side dependencies in one folder.

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

During installation, if bower will notice same dependencies, it will merge it, and if there will be version conflicts, you will get prompted with options to choose:

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
│    ├── shared
│    ├── widget-robert-todo
│    ├── some-bundle
│    ├── widget1
│    └── widget2...
```

At the end, all the dependencies are stored in one place with no folder nesting. All items, like widgets, containers and chromes are stored on same level as well, store in `bower_components` folder.

### 3. Generating RequireJS config

After download of all required dependencies, we automatically generate `require-bower-conf.js`:

```js
requirejs.config({
    paths: {
        // Shims
        'jquery': '/static/bower_components/jquery/dist/jquery',
        'backbone': '/static/bower_components/backbone/backbone',

        // Paths shorthands, for portal widget path will be different
        'widget-robert-todo': '/static/bower_components/widget-robert-todo/js/main',
        'bower_components': '/static/bower_components'
    }
});
```

This config will provide us short links to dependencies, that we will require from js modules (`jquery`, `backbone`, etc), and will provide namespace for item entry files like `/bower_components/widget-robert-todo/js/main`. Allowing us to call all dependencies with clean paths:

```js
require([
    'jquery',
    'backbone',
    'widget-robert-todo'
    ], function ($, backbone, robertTodo) {
});
```

#### Merging with existing requirejs-conf

If you already have your own, hand crafted `require-conf.js`, you define it in settings for `bb install` and during generation of new one, you will be prompted on conflicts.

 It's recommended to link generated `require-bower-conf.js` after your hand crafted one, and before any `define/require` call.

### 4. Additional steps (optional)

#### Assets tree for build tools

As additional steps, we will generate `assets-tree.json`, where all paths to css, js, img files will be gathered, to be used from Grunt/Gulp build scripts.

#### Items importing to portal catalogue

After installation we will prompt user, and suggest him to import installed items to his portal through portal API, using XML from defined widgets.

## Portal setup

The only specific setup for proposed dependencies structure is path configuration for static server - `bower_components` folder must be served from `/static`, so all assets will be available by this urls:

* `/static/bower_components/widget-robert-todo`
* `/static/bower_components/jquery`

### Adding requirejs

Your portal pages must contain link to generated `require-config.js`, or you can bundle all config to one file during build process.

## Developing own components

To develop components, following common way of defining dependencies, we will use another `backbase-cli` tool, called `backbase deploy`. This will deploy your widget from any folder locally, to your Backbase Project, in same `bower_components` folder, where all other dependencies are stored.

You will use `backbase deploy` in cases when you develop your own, new widget, or want to fork other dependencies.

Recommended way of working with individual components, is to store them in own repositories. So if you want to use existing component, but first improving it for your case, you just Fork the original repo. But it will be possible to work only with one Project repository, if you don't need this kid of flexibility.

## FAQ

### Widget importing through portal

To remain consistency, importing widgets with `.zip`, through portal, we will need to drop assets to same folder with other downloaded widgets.

### Managing relative paths

As widgets could be developed as standalone, all paths for assets must be relative (except amd modules, with custom require-conf):

* CSS fully supports relative paths, and when you minify all of files to one, it's easy to convert relative paths to absolute (most min tools do that out of the box)
* assets path on `.html` files are managed by portal, during widget injection