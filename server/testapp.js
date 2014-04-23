var restify = require('restify');
var mongiofy = require('./mongiofy/mongiofy');

var server = restify.createServer({ name: 'my-api' });
server.use(restify.acceptParser(server.acceptable));
server.use(restify.CORS());
server.use(restify.queryParser());
server.use(restify.bodyParser());



var TestModel = mongiofy.model('testmodel', {
		 name: String
		  });

mongiofy.initialize(server, 'mongodb://localhost/test');

server.listen(8080, function () {
	  console.log('%s listening at %s', server.name, server.url)
	});