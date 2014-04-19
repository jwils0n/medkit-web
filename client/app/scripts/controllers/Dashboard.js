'use strict';

angular.module('clientApp')
  .controller('DashboardCtrl', function ($scope, $q, Event, Drug, Room, Patient, Dose, Prescription, Socket) {
    var patientsDeferred = $q.defer();
    var prescriptionsDeferred = $q.defer();
    var dosesDeferred = $q.defer();
    var roomsDeferred = $q.defer();
    var eventsDeferred = $q.defer();
    var drugsDeferred = $q.defer();

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

    Drug.get({}, function (data) {
      $scope.drugs = data;
      drugsDeferred.resolve();
    });

    $q.all([
      patientsDeferred.promise,
      prescriptionsDeferred.promise,
      dosesDeferred.promise,
      roomsDeferred.promise,
      drugsDeferred.promise
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

        prescription.drug = $scope.getDrugById(prescription.drug_id);

        patient.prescriptions.push(prescription);
      });
      $scope.administeredDoses = _.filter($scope.doses, { state: 'Administered'});
    });

    $scope.getPatientById = function (id) {
      return _.find($scope.patients, { _id: id })
    };

    $scope.getPrescriptionById = function (id) {
      return _.find($scope.prescriptions, { _id: id });
    };

    $scope.getDrugById = function (id) {
      return _.find($scope.drugs, { _id: id });
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
    Socket.on('prescription', eventFeedHandler);
    Socket.on('room', eventFeedHandler);

    function eventFeedHandler (resp) {
      var formats = {
        patient: function (data) {
          data.type = data.type === 'updated' ? 'checked in' : data.type;
          return 'Patient ' + data.first_name + ' ' + data.last_name + ' was ' + data.type;
        },
        dose: function (data) {
          var patient = $scope.getPatientById(data.patient_id);
          var type = data.state.toLowerCase();
          var prescription = $scope.getPrescriptionById(data.prescriptions[0]._id);
          var drug = $scope.getDrugById(prescription.drug_id);
          return 'A prescription (' + drug.name + ') was ' + type + ' for ' + patient.first_name + ' ' + patient.last_name;
        },
        event: function (data) {
          return 'An event was triggered?';
        },
        user: function (data) {
          return 'User ' + data.first_name + ' ' + data.last_name + ' was ' + data.type;
        },
        prescription: function (data) {
          var patient = $scope.getPatientById(data.patient_id);
          if (!patient) {
            return null;
          }
          return 'A prescription was ' + data.type + ' for ' + patient.first_name + ' ' + patient.last_name;
        },
        room: function(date){
          return "Room has updated";
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
