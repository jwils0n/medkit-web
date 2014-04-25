module.exports = {};
var exports = module.exports;
var restify = require('restify');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var socketio = require('socket.io');
var db = mongoose.connection;
var ObjectId = Schema.ObjectId;
var Mixed = Schema.Types.Mixed;
var _ = require('lodash');
var beautify = require('js-beautify').js_beautify;

exports.models = [];

exports.API = {};

exports.model = function(name, schema, options)
	 {
	 	var model = mongoose.model(name, schema);
	 	model.create = {pre: [], on: [], post: []};
	 	model.update = {pre: [], on: [], post: []};
	 	model.read = {pre: [], on: [], post: []};
	 	model.del = {pre: [], on: [], post: []};

	 	exports.models.push(model);
	 	model.rawSchema = schema;
	 	model.routes = {get:{}, post:{}, put:{}, del:{}};
	 	model.routes.get["/meta"] = function(req, res, next) {
			res.send(getMeta(model));
		}

		model.routes.get["/:id"] = function(req, res, next){
			model.findById(req.params.id, function (err, result) {

				res.send(result);
			});
		}

		model.routes.put["/:id"] = function(req, res, next){
			var update_options = { multi: false };
          
            var id = req.params.id;
            delete req.params.id;
            delete req.params._id;

            console.log("Debug PUT");
            console.log(req.params);
            console.log(id);
            //Event.broadcast(model.modelName, req.params, "PUT");
            var params = req.params;
            model.findById(id, function (err, result) {
            		var previous = result;

	            	model.update({_id: id}, params, update_options, function(err, result){
					if(err)
					{
						console.log(err);
					}
					params.previous = previous;
					exports.broadcast(model.modelName, params, "PUT");
					res.send(200);
				});	

			});

			

		}

		model.routes.del["/:id"] = function(req, res, next){
			exports.broadcast(model.modelName, req.params, "DELETE");
			model.findById(req.params.id, function (err, result) {
				result.remove();
				
				res.send(200);
			});

		}



		model.routes.get[""] = function(req, res, next){
			model.find(req.params, function (err, result) {
				res.send(result);
			});
		}

		model.routes.post[""] = function (req, res, next) {
		console.log("Debug POST");
        console.log(req.params);

				

		var obj = new model(req.params).save(function(err){
			console.log(err);
		});
		exports.broadcast(model.modelName, req.params, "POST");
		res.send(200);
		}

	 	return model;
	 }

exports.getMeta = function(model)
	 {
	 	var out = {};

	 	for(field in model.schema.paths)
	 	{
	 		var path =  model.schema.paths[field];
	 		if(path.instance)
	 			out[field] = path.instance;

	 		if(path.schema)
	 			out[field] = getMeta(path);
	 	}
	 	return out;
	 }


exports.event = exports.model('event', {
		 event_type: String,
		 model: String,
		 tag_id: String,
		 data: Mixed,
		 timestamp: Date
		  });

exports.broadcast = function(modelName, params, method)
	{
			var ev = new exports.event({
							 event_type: method,
							 tag_id: params.tag_id,
							 data: params,
							 timestamp: new Date(),
							 model: modelName
							  });
					ev.save();
			exports.io.sockets.emit(modelName , ev);
	}


exports.initialize = function(server, connection, callback)
{
			mongoose.connect(connection);
			exports.io = socketio.listen(server);
			db.on('error', console.error.bind(console, 'connection error:'));
		    db.once('open', function() {

		    	server.on("close", function() {
				  	console.log("Closing Mongo Connection")
				  	db.close();
				  });

		    

			exports.models.forEach(function(model) {

		      var modelName = model.modelName;
			  exports.API[modelName] = {};
			  exports.API[modelName].meta = exports.getMeta(model);
			  exports.API[modelName].GET = [];


			  for(route in model.routes.get)
			  {
			  	console.log("Adding GET Route: " + "/" + model.modelName + route);
			  	server.get("/" + model.modelName + "/" + route, model.routes.get[route]);
			  	exports.API[modelName].GET.push(route);
			  }

		      exports.API[modelName].POST = [];
			  for(route in model.routes.post)
			  {
			  	console.log("Adding POST Route: " + "/" + model.modelName + route);
			  	server.post("/" + model.modelName + "/" + route, model.routes.post[route]);
			  	exports.API[modelName].POST.push(route);
			  }

		      exports.API[modelName].PUT = [];
			  for(route in model.routes.put)
			  {
			  	console.log("Adding PUT Route: " + "/" + model.modelName + route);
			  	server.put("/" + model.modelName + "/" + route, model.routes.put[route]);
			  	exports.API[modelName].PUT.push(route);
			  }

		      exports.API[modelName].DEL = [];
			  for(route in model.routes.del)
			  {
			  	console.log("Adding DEL Route: " + "/" + model.modelName + route);
			  	server.del("/" + model.modelName + "/" + route, model.routes.del[route]);
			  	exports.API[modelName].DEL.push(route);
			  }


			  
			})

              server.get('/api', function (req, res, next) {
			     res.send(exports.API);
			   });

			  
			  server.get('/js/:moduleName/api-angular.js', function(req, res, next){
			  	res.setHeader('content-type', 'text/javascript');
			  	console.log(req.headers);
			  	//res.send(angular_js);

			  	/*{ 'get':    {method:'GET'},
    			'save':   {method:'POST'},
    			'query':  {method:'GET', isArray:true},
    			'remove': {method:'DELETE'},
    			'delete': {method:'DELETE'} };*/

		        var template = "angular.module('<%= moduleName %>')"
			  	               + ".factory('<%= modelName %>', function ($resource) {"
			  	               	+ "return $resource('//<%= host %>/<%= modelName %>/:id', { id:'@id' }, {"
			  	               		+ "'save':   {method:'POST'},"
			  	               		+ "'delete': {method:'DELETE'},"
			  	               		+ "'get': { method: 'GET'},"
			  	               		+ "'query':  {method:'GET', isArray:true},"
			  	               		+ "'update': { method: 'PUT' },"
			  	               		+ "'remove': { method: 'DELETE' }"
			  	               		+ " }); });"

			    var compiled = _.template(template);
			    var angular_js = "use strict;";

			  	exports.models.forEach(function(model) {

			  			angular_js+= compiled({modelName: model.modelName,
			                         host: req.headers.host,
			                         moduleName: req.params.moduleName});
			  	})

			  	res.send(beautify(angular_js));


					  	/*'use strict';
						angular.module('clientApp')
						  .factory('Patient', function ($resource) {
						    return $resource('//medkit-api.blacklitelabs.com/patient/:id', { id:'@id' }, {
						      get: { isArray: true },
						      update: { method: 'PUT' },
						      remove: { method: 'DELETE' }
						    });
						  });
						*/
			  });

			

			if(callback)
			callback();
	});
}