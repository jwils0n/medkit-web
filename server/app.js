var restify = require('restify');
var mongoose = require('mongoose');
var socketio = require('socket.io')
var Schema = mongoose.Schema;
var _ = require('lodash');
mongoose.connect('mongodb://localhost/Medkit');
var db = mongoose.connection;
var ObjectId = Schema.ObjectId;
var Mixed = Schema.Types.Mixed;


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

	console.log("DB Open");

	 var handleError = function(err)
	 {
	 	console.log(err);
	 }

	var API = {};

	var Models = [];

	
	
	var createModel = function(name, schema)
	 {
	 	var model = mongoose.model(name, schema);
	 	Models.push(model);
	 	model.rawSchema = schema;
	 	model.routes = {get:{}, post:{}, put:{}, del:{}};
	 	model.routes.get["/meta"] = function(req, res, next) {
			res.send(getMeta(model));
		}
		model.callback = callback;

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
            Event.broadcast(model.modelName, req.params, "PUT");
			model.update({_id: id}, req.params, options, function(err, result){

				if(err)
				{
					console.log(err);
				}

				
				res.send(200);
			});

		}

		model.routes.del["/:id"] = function(req, res, next){
			Event.broadcast(model.modelName, req.params, "DELETE");
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
		Event.broadcast(model.modelName, req.params, "POST");
		res.send(200);
		}

	 	return model;
	 }

	 var getMeta = function(model)
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

	 var User = createModel('user', {
		 username: String,
		 first_name: String,
		 last_name: String,
		 tag_id: String,
		 password: String,
		 role: String
		  });

	 var Patient = createModel('patient', {
		 first_name: String,
		 last_name: String,
		 tag_id: String,
		 phone_number: String,
		 address: String
		 //prescriptions: [{name: String, dosage: String, interval: Number, intervalType: String}]
		 }
		 );

	 var Prescription = createModel('prescription', {
	 	 patient_id: ObjectId,
		 drug_id: ObjectId,
         amount: Number,
         unit: String,
         interval: Number,
         intervalType: String,
		 route: String
		 }
		 );

	 var Route = createModel('route', {
		 name: String
		 }
		 );

	 var Unit = createModel('unit', {
		 name: String
		 }
		 );

	 var IntervalType = createModel('intervaltype', {
		 name: String
		 }
		 );

	 var Drug = createModel('drug', {
			name: String,
			brand: String,
			tag_id: String
		 }
		 );

	 var Dose = createModel('dose', {
		 patient_id: ObjectId,
		 prescriptions:[{prescription_id: ObjectId}],
		 timestamp: Date,
		 note: String,
		 tag_id: String,
		 state: String
		 }
		 );

	 var Room = createModel('room', {
		 number: Number,
		 floor: Number,
		 department: String,
		 occupant: ObjectId,
		 tag_id: String,
		 x: Number,
		 y: Number
		 }
		 );


	 


	var broadcast = function(obj)
	{
		console.log("Broadcast: " + obj);
		socket.emit('events', obj);
	}

	var Event = createModel('event', {
		 event_type: String,
		 model: String,
		 tag_id: Number,
		 data: Mixed,
		 timestamp: Date
		  });

	Event.broadcast = function(modelName, params, method)
	{
			var ev = new Event({
							 event_type: "POST",
							 tag_id: params.tag_id,
							 data: params,
							 timestamp: new Date(),
							 model: modelName
							  });
					ev.save();
			io.sockets.emit(modelName , ev);
	}


	console.log("User Model Defined");

	var server = restify.createServer({ name: 'my-api' })

	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.CORS());
	server.use(restify.queryParser());
	server.use(restify.bodyParser());

	var io = socketio.listen(server);

    var authenticate = function(username, password)
	 {
	 	
	 }

	server.post('/login', function (req, res, next) {
	     	console.log(req.params);
	     	res.send(200);
	})

	server.post('/login2', function (req, res, next) {
			var username = req.params.username;
			var password = req.params.password;
			User.find({username: username}, function (err, result) {
	 			console.log("Authenticate Results")
	 			console.log(result);
				if(result.length > 0)
				{
					console.log("Comparing: " + result[0].password)
					console.log("To: " + password);
					if(result[0].password == password)
					{
						console.log("Authenticated")
						res.send(200);
					}
					else
					{
						console.log("Failed Authentication")
						res.send(401);
					}
				}
				console.log("Failed Authentication")
				res.send(401);
			});
	})

	server.get('/ping', function (req, res, next) {
	     	console.log(req.params);
	     	res.send(200);
	        io.sockets.emit('event', { message: "Test Message" });
	})  

   

    io.sockets.on('connection', function (socket) {

	});

	console.log("Initializing Models");
	Models.forEach(function(model) {

      var modelName = model.modelName;
	  API[modelName] = {};
	  API[modelName].meta = getMeta(model);
	  API[modelName].GET = [];
	  for(route in model.routes.get)
	  {
	  	console.log("Adding GET Route: " + "/" + model.modelName + route);
	  	server.get("/" + model.modelName + "/" + route, model.routes.get[route]);
	  	API[modelName].GET.push(route);
	  }

      API[modelName].POST = [];
	  for(route in model.routes.post)
	  {
	  	console.log("Adding POST Route: " + "/" + model.modelName + route);
	  	server.post("/" + model.modelName + "/" + route, model.routes.post[route]);
	  	API[modelName].POST.push(route);
	  }

      API[modelName].PUT = [];
	  for(route in model.routes.put)
	  {
	  	console.log("Adding PUT Route: " + "/" + model.modelName + route);
	  	server.put("/" + model.modelName + "/" + route, model.routes.put[route]);
	  	API[modelName].PUT.push(route);
	  }

      API[modelName].DEL = [];
	  for(route in model.routes.del)
	  {
	  	console.log("Adding DEL Route: " + "/" + model.modelName + route);
	  	server.del("/" + model.modelName + "/" + route, model.routes.del[route]);
	  	API[modelName].DEL.push(route);
	  }


	  server.get('/api', function (req, res, next) {
	     res.send(API);
	})

	});

	/*server.get('test/:name', User.createTestUser);


	server.get('/user', User.getAll)

	server.get('/user/:id', function (req, res, next) {
	
	})*/

	//server.post('/user', User.post);


	server.listen(8080, function () {
	  console.log('%s listening at %s', server.name, server.url)
	})
});




 









