var reporter = require('nodeunit').reporters.default;
 
process.chdir(__dirname);
 
var run_tests = new Array();
var tests_available = { 
    'basetest' : 'tests/basetest.js'
};
 
var test_name;
 

if(process.argv.length > 2) {
    var i;
    for(i = 2; i < process.argv.length; i++) {
        test_name = process.argv[i];
        if(tests_available.hasOwnProperty(test_name)) {
            run_tests.push(tests_available[test_name]);
        } else {
            console.log("Invalid test '" + test_name + "'");
        }
    }
} else {
    for(test_name in tests_available) {
        if(tests_available.hasOwnProperty(test_name)) {
            run_tests.push(tests_available[test_name]);
        }
    }
}
 
if(run_tests.length > 0) {
    reporter.run(run_tests);
}