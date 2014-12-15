requirejs.config({
    paths: {
        // Shims
        'jquery': '/bower_components/jquery/dist/jquery',
        'backbone': '/bower_components/backbone/backbone',

        // Paths shorthands, for portal widget path will be different
        'widget/robert-todo': '/node_modules/robert-todo',
        'bower_components': '/bower_components'
    }
});