In basic configuration, we need only to define `bower.json`, with all `itemDependencies`, defining which widgets are included to bundle.

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
    "retail-widget": "svn+http://package.backbase.com/svn/retail-widget#1.2.3",
    "widget-robert-todo": "0.1.0"
  }
}
```

All `itemDependencies` (widgets, chromes etc) will be installed with one command through `backbase-cli`. You can even define other bundles as a dependency. Bundle could also have it's own client-side dependencies, but it's recommended to define them on widgets level.


To learn more about install process, check root `README.md` with detailed information about installation process.