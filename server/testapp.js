var restify = require('restify');
var apish = require('./apish/apish');
var ObjectId = apish.Schema.ObjectId;

var server = restify.createServer({ name: 'my-api' });
server.use(restify.acceptParser(server.acceptable));
server.use(restify.CORS());
server.use(restify.queryParser());
server.use(restify.bodyParser());



var TestModelEntry = apish.model('testmodelentry', {
		 name: String
		  });

var TestModel = apish.model('testmodel', {
		 name: String,
		 entries : [{ type: ObjectId, ref: 'testmodelentry' }]
		  });


apish.initialize(server, 'mongodb://localhost/test');

server.listen(8080, function () {
	  console.log('%s listening at %s', server.name, server.url)
	});