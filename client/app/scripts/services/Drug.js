'use strict';

angular.module('clientApp')
  .factory('Drug', function ($resource) {
    return $resource('//192.168.1.148:8080/drug/:id', { id:'@id' }, {
      get: { isArray: true }
    });
  });