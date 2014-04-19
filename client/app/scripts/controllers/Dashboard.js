'use strict';

angular.module('clientApp')
  .controller('DashboardCtrl', function ($scope, $q, Event, Room, Patient, Dose, Prescription, Socket) {
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

      _.forEach($scope.prescriptions, function (prescription) {
        var patient = $scope.getPatientById(prescription.patient_id);

        if (!patient.prescriptions) {
          patient.prescriptions = [];
        }
        patient.prescriptions.push(prescription);
      });

      $scope.filledDoses = _.filter($scope.doses, { state: 'Filled'});
      $scope.unfilledDoses = _.filter($scope.doses, { state: 'Administered'});
    });

    $scope.getPatientById = function (id) {
      return _.find($scope.patients, { _id: id })
    };

    $scope.getPrescriptionById = function (id) {
      return _.find($scope.prescriptions, { _id: id });
    };

    $scope.activeMode = 'map';
    $scope.eventFeed = [];

    Event.get({}, function (data) {
      _.forEach(data, function (event) {
        eventFeedHandler(event);
      });
    });

    Socket.on('event', eventFeedHandler);
    Socket.on('patient', eventFeedHandler);
    Socket.on('dose', eventFeedHandler);

    function eventFeedHandler (resp) {
      var formats = {
        patient: function (data) {
          return 'Patient ' + data.first_name + ' ' + data.last_name + ' was ' + data.type;
        },
        dose: function (data) {
          var patient = $scope.getPatientById(data.patient_id);
          return 'A prescription was filled for ' + patient.first_name + ' ' + patient.last_name;
        },
        event: function (data) {
          return 'An event was triggered?';
        },
        user: function (data) {
          return 'User ' + data.first_name + ' ' + data.last_name + ' was ' + data.type;
        },
        prescription: function (data) {
          var patient = $scope.getPatientById(data.patient_id);
          return 'A prescription was ' + data.type + ' for ' + patient.first_name + ' ' + patient.last_name;
        }
      };

      var methods = {
        POST: 'created',
        PUT: 'updated',
        DELETE: 'removed'
      };

      if (!resp.model) {
        return;
      }

      resp.data.type = methods[resp.event_type];

      $scope.eventFeed.unshift({
        msg: formats[resp.model](resp.data),
        time: moment(resp.timestamp).format('h:mm a'),
        model: resp.model
      });

      if ($scope.eventFeed.length > 20) {
        $scope.eventFeed.pop();
      }
    }

  });
