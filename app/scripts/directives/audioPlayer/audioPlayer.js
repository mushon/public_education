'use strict';

angular.module('publicEducationApp')
  .directive('audioPlayer', function (Phonegap) {
    return {
      templateUrl: 'scripts/directives/audioPlayer/audioPlayer.html',
      restrict: 'E',
      scope: {
        playList: '=playList',
        currentRecord: '=currentRecord'
      },
      link: function postLink(scope) {

        scope.isPhoneGap = Phonegap.isMobile.any();


        scope.previous = function() {
          if (scope.currentTrack > 0) {
            --scope.currentTrack;
          }
        };

        scope.next = function() {
          if (scope.currentTrack < scope.playList.length - 1) {
            ++scope.currentTrack;
          }
        };

        scope.playPauseHtml5 = function() {
          scope.playerControl.playPause();
        };

        /**
         * Play an item in PhoneGap devices.
         *
         * @param src
         */
        scope.playPhoneGap = function() {
          scope.mediaPlayer = Phonegap.getMedia(scope.currentRecord.src, function onSuccess() {
            // If play was successful, skip to the next track, if it exists.
            scope.$apply(function () {
              if (scope.currentTrack +1 < scope.playList.length) {
                ++scope.currentTrack;
              }
            });
          });
          scope.mediaPlayer.play();
        };

        scope.$watch('currentTrack', function(track, oldTrack) {
          // Populate info of current record in the scope.
          if (!scope.playList.length) {
            return;
          }

          scope.currentRecord = scope.playList[track];

          if (scope.isPhoneGap) {
            scope.playPhoneGap();
          }
          else if (oldTrack > 0) {
            // HTML <audio> tag.
            if (oldTrack < track) {
              scope.playerControl.next();
            }
            else {
              scope.playerControl.prev();
            }

          }
        });


        if (!scope.isPhoneGap) {
          scope.$watch('playerControl.currentTrack', function(currentTrack) {
            // Change current track by the HTML5 <audio> tag.
            scope.currentTrack = currentTrack - 1;
          });
        }

        /**
         * Initialize currentTrack just when have a playList filled.
         *
         * This is need because the process $http and linking phase of the directive
         * (angularjs bootstrap) are asynchronous.
         */
        scope.$watch('playList', function(playList) {
          if (angular.isDefined(playList)) {
            scope.currentTrack = 0;
          }
        });
      }
    };
  });
