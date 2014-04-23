'use strict';

angular.module('clientApp')
  .factory('User', function ($resource) {
    return $resource('//medkit-api.blacklitelabs.com/user/:id', { id:'@id' }, {
      get: { isArray: true },
      update: { method: 'PUT' },
      remove: { method: 'DELETE' }
    });
  });
