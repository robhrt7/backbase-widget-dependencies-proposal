To configure a basic bundle, we only need to define `bower.json`, with all `itemDependencies`, defining which widgets are included to bundle. Of course, bundle could have it's widgets in one repository all together, but it's recommended to separate each widget to it's own repository with own version and release cycle.

 `bower.json` contents example:

```json
{
  "name": "backbase-bundle",
  "version": "1.0.0",
  "description": "Demo Backbase bundle with widget dependencies",
  "keywords": [
    "backbase"
  ],
  "maintainers": [
    "Robert Haritonov <r@rhr.me>"
  ],
  "dependencies": {},
  "itemDependencies": {
    "bundle-build-script": "0.1.0",
    "some-bundle": "http://some.url/some/bundle.zip",
    "retail-widget": "svn+http://package.backbase.com/svn/retail-widget#1.2.3",
    "widget-robert-todo": "0.1.0"
  }
}
```

All `itemDependencies` (widgets, chromes etc) will be installed with one command through `backbase-cli` on portal level or on bundle level for standalone testing. You can define other bundles as a dependency as well. Bundle could also have it's own client-side dependencies, but it's recommended to define them on widgets level.

The output of installed bundle dependencies is the same as in `/project-example/output`. To learn more about install process, check root `README.md` with detailed information about installation process.