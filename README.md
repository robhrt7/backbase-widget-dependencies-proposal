# Proposal for new Backbase widget structure

All items examples are listed in project sources core:

1. *widget-example* - example of widget, it's conf, dependencies and generated files
2. *bundle-example* - example of bundle, that have `widget-example` as a dependency. Output folder contains files generated after `backbase install` command (more info above)
3. *portal-example* - could be configured the same as `bundle-example`, but only for whole portal scope.

## backbase-cli install

To install portal or bundle dependencies, we would use `backbase install` command, that will do those tasks:

1. npm i
2. get all bower.json files, and install all client-side dependencies in root folder using Bower API
3. generate `/conf` contents: assets-tree.json (list of all assets of dependencies), require-conf.js (require js configuration with shorthads to paths)