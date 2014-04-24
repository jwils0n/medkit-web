var restify = require('restify');
var test = require('nodeunit');
var apish = require('../apish');
var test_database = 'mongodb://localhost/test';
var test_api = 'test_api'
var test_port = 8080;

var client = require("restify").createJsonClient({
		   		 "version": "*",
		    	"url": "http://localhost:" + test_port
});

var server;

module.exports = {
	setUp: function (callback) {
	    server = restify.createServer({ name: test_api });
		server.use(restify.acceptParser(server.acceptable));
		server.use(restify.CORS());
		server.use(restify.queryParser());
		server.use(restify.bodyParser());
		console.log("Initializing APISH");
		apish.initialize(server, test_database, function(){
			server.listen(8080, callback);
});
    },
    tearDown: function (callback) {
    	server.close();
        callback();
    },
    test1: function(test){
		console.log("test1");
		test.done();
	}
}

