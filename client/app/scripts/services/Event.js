'use strict';

angular.module('clientApp')
  .factory('Event', function ($resource) {
    return $resource('//192.168.1.148:8080/event/:id', { id:'@id' }, {
      get: { isArray: true }
    });
  });