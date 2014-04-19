'use strict';

angular.module('clientApp')
  .controller('DashboardCtrl', function ($scope, Room, Patient, Dose, Prescription, Socket) {

    var patients = Patient.get({}, function (data) {
        $scope.patients = patients;
        $scope.getPatientById = function(id)
        {
          var results = _.filter(patients, function(patient) { return patient._id = id;});
          if(results.length > 0)
          {
            return results[0];
          }
          else
          {
            return null;
          }
        }

        var prescriptions = Prescription.get({}, function (results) {
            $scope.prescriptions = prescriptions;
            $scope.getPrescriptionById = function(id)
            {
              var results = _.filter(prescriptions, function(prescription) { return prescription._id = id;});
              if(results.length > 0)
              {
                return results[0];
              }
              else
              {
                return null;
              }
            }
          })

            var rooms = Room.get({}, function (data) {

           /*Logic to set States on Rooms*/
          _(rooms).forEach(function(room) {
            //Sweet hack to convert MongoID to Room Number
                  room.number = parseInt(room._id.substr(room._id.length - 2),16) 
                if(room.occupant)
                {
                  room.occupant = $scope.getPatientById(room.occupant);
                  room.icon = "glyphicon-user green";
                  console.log(room);
                }
                else
                {
                  room.icon = "glyphicon-record";
                }

                if(room.department)
                {
                  if(room.department == "pharmacy")
                  {
                    room.icon = "glyphicon-edit";
                     var count = 0;
                     var doses = Dose.get({}, function (data) {
                      room.doses = doses;
                      _(doses).forEach(function(dose){
                          var expanded = [];
                        _(dose.prescriptions).forEach(function(prescription){
                          count++;
                          expanded.push($scope.getPrescriptionById(prescription._id));
                        })
                        dose.prescriptions = expanded;
                      })
                     });

                     room.prescription_count = count;
                  }
                }

           });
          //console.log(rooms);
          $scope.rooms = rooms;
          $scope.mapWaypoints = rooms;
        });
      });
    
    



    $scope.eventFeed = [];

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
