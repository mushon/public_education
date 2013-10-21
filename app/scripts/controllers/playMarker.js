'use strict';

angular.module('publicEducationApp')
  .controller('PlayMarkerCtrl', function ($scope, $routeParams, $location, storage, Marker, Leaflet, Phonegap, $window) {

    $scope.venueId = $routeParams.venueId;
      angular.extend($scope, {
        selectedMarker: {
          playList: [],
          currentRecord: null
        }
    });

    // Default values, that will be populated once the markers are fetched.
    $scope.center = Leaflet.getCenter();
    $scope.selectedMarker = {};
    $scope.playList = [];
    $scope.currentTrack = 0;

    // Default values, user.
    $scope.user = {
      name:"Anonymous"
    };

    // Default values edit mode ng-class.
    $scope.classPlayerMode = 'playlist-info bottom-bar';
    $scope.editMode = false;


    Marker.gettingMarkers().then(function(data) {
      $scope.markers = data;

      if (!$scope.markers[$scope.venueId]) {
        // Redirect to homepage on wrong venue ID.
        $location.path('/');
      }

      $scope.selectedMarker = $scope.markers[$scope.venueId];
      angular.forEach($scope.selectedMarker.playList, function(value) {
        // Push the new items to the play list.
        $scope.playList.push(value);
      });

      $scope.center = {
        lat: $scope.selectedMarker.lat,
        lng: $scope.selectedMarker.lng,
        zoom: 16
      }

      $scope.$watch('currentTrack', function(track) {
        // Populate info of current record in the scope.
        $scope.selectedMarker.currentRecord = $scope.selectedMarker.playList[track];

        if (track <= $scope.selectedMarker.playList.length) {
          $scope.playItem($scope.selectedMarker.playList[track].src);
        }
      });
    });

    /**
     * Play an item.
     *
     * @param src
     */
    $scope.playItem = function(src) {
      var mediaPlayer = Phonegap.getMedia(src, function onSuccess() {
        // If play was successful, skip to the next track.
        $scope.$apply(function () {
          ++$scope.currentTrack;
        });
      });
      mediaPlayer.play();
    }

    angular.extend($scope, Leaflet.getDefaults());


    /**
     * Intercept Drag Map Event
     */
    $scope.$on('leafletDirectiveMap.drag', function(event, args) {

      // TODO:Implement disable draggble onclick (Verify if the directive implemented)
      args.leafletEvent.target.options.dragging = false;
      args.leafletEvent.target.dragging._enabled = false;
      args.leafletEvent.target.dragging._draggable._enabled = false;
      args.leafletEvent.target.keyboard._enabled = false;

    });

    /**
     * Toggle between edit anf play mode.
     */
    $scope.toggleEditMode = function() {
      $scope.editMode = !$scope.editMode;
      $scope.classPlayerMode = (!$scope.editMode) ? 'playlist-info bottom-bar' : 'playlist-info edit-mode';
    }

    /**
     * Share link to twitter, facebook, email and link.
     */
    $scope.shareLink = function(method) {
      var url;
      var text = $scope.selectedMarker.currentRecord.text + '-' + encodeURIComponent($location.absUrl());

      if (method === 'twitter') {
        url = 'https://twitter.com/share?text='+text;
      }
      else if (method === 'facebook') {
        url = 'http://www.facebook.com/sharer/sharer.php?s=100&p[url]='
          + encodeURIComponent($location.absUrl())
          + '&p[title]=Public%20Education&p[summary]=' + text;
      }
      else if (method === 'email') {
        url = 'mailto:?body='
          + text
          + ' - '
          + encodeURIComponent($location.absUrl());
      }
      else if (method === 'link') {
        url = $location.absUrl();
      }

      $window.open(url, method, 'width=626,height=445');
    }
  });
