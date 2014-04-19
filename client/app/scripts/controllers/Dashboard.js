'use strict';

angular.module('clientApp')
  .controller('DashboardCtrl', function ($scope, $q, Room, Patient, Dose, Prescription, Socket) {
    var patientsDeferred = $q.defer();
    var prescriptionsDeferred = $q.defer();
    var dosesDeferred = $q.defer();
    var roomsDeferred = $q.defer();

    Patient.get({}, function (data) {
      $scope.patients = data;
      patientsDeferred.resolve();
    });

    Prescription.get({}, function (data) {
      $scope.prescriptions = data;
      prescriptionsDeferred.resolve();
    });

    Dose.get({}, function (data) {
      $scope.doses = data;
      dosesDeferred.resolve();
    });

    Room.get({}, function (data) {
      $scope.rooms = data;
      roomsDeferred.resolve();
    });

    $q.all([
      patientsDeferred.promise,
      prescriptionsDeferred.promise,
      dosesDeferred.promise,
      roomsDeferred.promise
    ]).then(function () {
      _.forEach($scope.rooms, function (room) {
        room.number = parseInt(room._id.substr(room._id.length - 2),16) 
        if (room.occupant) {
          room.occupant = $scope.getPatientById(room.occupant);
          room.icon = "glyphicon-user green";
        } else {
          room.icon = "glyphicon-record";
        }

        if (room.department) {
          if(room.department == "pharmacy") {
            room.icon = "glyphicon-edit";
            var count = 0;
            room.doses = $scope.doses;
            _.forEach($scope.doses, function (dose) {
              var expanded = [];
              _.forEach(dose.prescriptions, function (prescription) {
                count++;
                expanded.push($scope.getPrescriptionById(prescription._id));
              })
              dose.prescriptions = expanded;
            });

            room.prescription_count = count;
          }
        }
      });
    });

    $scope.getPatientById = function (id) {
      return _.find($scope.patients, { _id: id })
    };

    $scope.getPrescriptionById = function (id) {
      return _.find($scope.prescriptions, { _id: id });
    };

    $scope.eventFeed = [];
    $scope.activeMode = 'map';

    Socket.on('event', eventFeedHandler);
    Socket.on('patient', eventFeedHandler);
    Socket.on('dose', eventFeedHandler);

    function eventFeedHandler (data) {
      var formats = {
        patient: function (data) {
          return 'Patient ' + data.first_name + ' ' + data.last_name + ' was ' + data.method;
        },
        dose: function (data) {
          return 'A dose was administered';
        },
        event: function (data) {
          return 'An event was triggered?';
        }
      };

      var methods = {
        POST: 'created',
        PUT: 'updated',
        DELETE: 'removed'
      };

      data.obj.method = methods[data.method];
      $scope.eventFeed.push({
        msg: formats[data.model](data.obj),
        time: moment().format('h:mm a')
      });
    }

  });
