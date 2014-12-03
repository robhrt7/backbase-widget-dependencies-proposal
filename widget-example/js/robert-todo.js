define([
	'jquery',
	'backbone',

    // "widgets/robert-todo" requirejs path is generated during installation
	'widget/robert-todo/js/modules/inner-dep'
	], function($, backbone, innerDep) {
	'use strict';

	function Todo(widget) {
		this.widget = widget;
	}

	Todo.prototype.init = function(){
		console.log('widget initiated');
	};

	return function(widget){
		var todo = new Todo(widget);
		todo.init();
	}
});