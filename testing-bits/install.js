var bower = require('bower');
var inquirer =  require('inquirer');

var log = function (some) {
    console.log('log some', some.id, some.message);
};

bower.commands
    .install(['backbone#~1.1.2'], {save: false}, { interactive: true })
    .on('log', log)
    .on('prompt', function (prompts, callback) {
      inquirer.prompt(prompts, callback);
    })
    .on('end', function (installed) {
        console.log('DONE', installed);
        console.log('------------------------------------------');

        bower.commands
              .install(['underscore#1.4.0'], {save: false}, { interactive: true })
              .on('log', log)
              .on('prompt', function (prompts, callback) {
                inquirer.prompt(prompts, callback);
              })
              .on('end', function (installed) {
                console.log('DONE', installed);
                console.log('------------------------------------------');
              });
    });