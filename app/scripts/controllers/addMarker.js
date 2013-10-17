'use strict';

angular.module('publicEducationApp')
  .controller('AddMarkerCtrl', function ($scope, $location, Leaflet, Foursquare, storage, User, Marker, BACKEND_URL) {

    /**
     * Update the map's center, and get the venue name from FourSquare.
     *
     * The marker is always in the center of the map, and visible only if the
     * zoom is equal or above 16.
     */

    $scope.$watch('center', function (center) {
      $scope.updateMarker(center.lat, center.lng);
    });


    $scope.updateMarker = function(lat, lng) {
      if ($scope.center.zoom >= 16) {

        $scope.markers = {
          marker: {
            lat: lat,
            lng: lng,
            venue: null
          }
        };


        if (!$scope.mapIsMoving) {
          Foursquare.gettingVenue(lat, lng).then(function(data) {
            $scope.markers.marker.venue = data;
          });
        }
      }
      else {
        $scope.markers = {};
      }
    };

    // Get default values.
    angular.extend($scope, Leaflet.getDefaults());
    $scope.mapIsMoving = false;


    angular.forEach(['zoomend', 'moveend'], function (value) {
      $scope.$on('leafletDirectiveMap.' + value, function () {
        $scope.mapIsMoving = false;
        $scope.updateMarker($scope.center.lat, $scope.center.lng);
      });
    });

    angular.forEach(['zoomstart', 'movestart'], function (value) {
      $scope.$on('leafletDirectiveMap.' + value, function () {
        $scope.mapIsMoving = true;
      });
    });

    $scope.$on('leafletDirectiveMap.move', function(event, args) {
      // Get the Leaflet map from the triggered event.
      var map = args.leafletEvent.target;
      var center = map.getCenter();

      // Update the marker.
      $scope.updateMarker(center.lat, center.lng);
    });

    // Click on the marker should advance to next step.
    $scope.$on('leafletDirectiveMarker.click', function() {
      $scope.setState('form');
    });

    /**
     * Set the state.
     *
     * @param state
     *   Possible options:
     *   - mark:
     *   - form:
     *   - record:
     *   - upload:
     *   - credentials: Ask for twitter, facebook credentials before posting or permits anonymously posting.
     *
     */
    $scope.setState = function(state) {
      $scope.state = state;
    };

    /**
     * Helper function to indicate recording has completed.
     */
    $scope.onRecorded = function() {
      // Add the new marker.
      var venue = {
          id: $scope.markers.marker.venue.id,
          name: $scope.markers.marker.venue.name,
          lat: $scope.markers.marker.venue.location.lat,
          lng: $scope.markers.marker.venue.location.lng
        },
        location = {
          lng: $scope.markers.marker.lng,
          lat: $scope.markers.marker.lat
        };

      // Getting the promise of add a new marker
      Marker.addMarker(venue, $scope.text, $scope.file, location, $scope.user);

      $scope.setState('completed');

      // Clear local storage.
      storage.remove('text');

    };

    // @todo: Move to init function?
    storage.bind($scope, 'center', {defaultValue: Leaflet.getCenter()});
    storage.bind($scope, 'text');
    storage.bind($scope, 'markers');
    storage.bind($scope, 'state', {defaultValue: 'mark'});
    $scope.backendUrl = BACKEND_URL;

  });
