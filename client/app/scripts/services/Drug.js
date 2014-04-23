'use strict';

angular.module('clientApp')
  .factory('Drug', function ($resource) {
    return $resource('//medkit-api.blacklitelabs.com/drug/:id', { id:'@id' }, {
      get: { isArray: true }
    });
  });
