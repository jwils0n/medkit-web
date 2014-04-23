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


exports.models = [];

exports.API = {};

exports.model = function(name, schema)
	 {
	 	var model = mongoose.model(name, schema);
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
			var options = { multi: false };
          
            var id = req.params.id;
            delete req.params.id;
            delete req.params._id;

            console.log("Debug PUT");
            console.log(req.params);
            console.log(id);
            //Event.broadcast(model.modelName, req.params, "PUT");
            var broadcast = Event.broadcast;
            var params = req.params;
            model.findById(id, function (err, result) {
            		var previous = result;

	            	model.update({_id: id}, params, options, function(err, result){
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

exports.initialize = function(server, connection)
{
			mongoose.connect(connection);
			exports.io = socketio.listen(server);
			db.on('error', console.error.bind(console, 'connection error:'));
		    db.once('open', function callback () {

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


			  server.get('/api', function (req, res, next) {
			     res.send(exports.API);
			})

			});
	});
}