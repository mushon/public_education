"use strict";angular.module("publicEducationApp",["config","angular-audio-player","angularLocalStorage","leaflet-directive","angular-md5"]).config(["$routeProvider","$httpProvider",function(a,b){a.when("/",{templateUrl:"views/main.html",controller:"ListMarkersCtrl"}).when("/add-marker",{templateUrl:"views/add-marker.html",controller:"AddMarkerCtrl"}).when("/play-marker/:venueId",{templateUrl:"views/play-marker.html",controller:"PlayMarkerCtrl"}).when("/login",{templateUrl:"views/login.html",controller:"loginCtrl"}).otherwise({redirectTo:"/"}),delete b.defaults.headers.common["X-Requested-With"]}]),angular.module("config",[]).constant("ENV","development").constant("FOURSQUARE",{id:"IZPZNXG2P5A3H4EBIFFEMRAIBMXCNGM1ZZ2QUPN2D1WNKNGX",secret:"MZ0CZ4Z0PMAEAGKDPJ5DO0BI2M1FAMJXRGWMCWNCPC5MQ02U"}).constant("OAUTHIO",{id:"nCYMyRVLEfy-4Sk_TPQCaey4Hhk"}).constant("RECORD_FLAGS",["koc"]).constant("IS_MOBILE",!1).constant("BACKEND_URL","http://public-education.herokuapp.com"),angular.module("publicEducationApp").controller("ListMarkersCtrl",["$scope","$window","Leaflet","storage","Marker","$location","$timeout","IS_MOBILE",function(a,b,c,d,e,f,g,h){angular.extend(a,c.getDefaults()),d.bind(a,"center",{defaultValue:c.getCenter()}),a.onDeviceReady=function(){navigator.geolocation&&navigator.geolocation.getCurrentPosition(function(b){a.center.lat=b.coords.latitude,a.center.lng=b.coords.longitude})},h?document.addEventListener("deviceready",a.onDeviceReady,!1):a.onDeviceReady(),a.markers={},a.playAllMarkers=function(){e.setPlayingAllMarkers(!0),a.redirectToFirstVenue()},a.$watch("markers",function(){e.isPlayingAllMarkers()&&a.redirectToFirstVenue()}),a.redirectToFirstVenue=function(){angular.forEach(a.markers,function(a,b){f.path("/play-marker/"+b)})};var i=function(){e.gettingMarkers().then(function(c){angular.forEach(c,function(c,d){c.icon=b.L.divIcon({iconSize:[30,35],html:'<div class="marker-icon">'+c.playList.length+"</div>",iconAnchor:[15,35]}),a.markers[d]=c})}).then(g(i,6e4).resolve)};i(),angular.forEach(["zoomend","moveend"],function(b){a.$on("leafletDirectiveMap."+b,function(){c.setCenter(a.center)})}),a.$on("leafletDirectiveMarker.click",function(a,b){f.path("/play-marker/"+b.markerName)}),a.isMobile=h}]),angular.module("publicEducationApp").controller("AddMarkerCtrl",["$scope","$location","$window","Leaflet","Foursquare","storage","User","Marker","BACKEND_URL","OAuthIo",function(a,b,c,d,e,f,g,h,i,j){a.$watch("center",function(b){a.updateMarker(b.lat,b.lng)}),a.updateMarker=function(b,d){var f=c.L.divIcon({iconSize:[34,52],html:'<span class="icon-shadow"></span>',iconAnchor:[17,48]});a.center.zoom>=16?(a.markers={marker:{lat:b,lng:d,venue:null,icon:f}},a.mapIsMoving||e.gettingVenue(b,d).then(function(b){a.markers.marker.venue=b})):a.markers={}},angular.extend(a,d.getDefaults()),a.mapIsMoving=!1,angular.forEach(["zoomend","moveend"],function(b){a.$on("leafletDirectiveMap."+b,function(){a.mapIsMoving=!1,a.updateMarker(a.center.lat,a.center.lng)})}),angular.forEach(["zoomstart","movestart"],function(b){a.$on("leafletDirectiveMap."+b,function(){a.mapIsMoving=!0})}),a.$on("leafletDirectiveMap.move",function(b,c){var d=c.leafletEvent.target,e=d.getCenter();a.updateMarker(e.lat,e.lng)}),a.$on("leafletDirectiveMarker.click",function(){a.setState("form")}),a.setState=function(b){a.state=b},a.onRecorded=function(){var b={id:a.markers.marker.venue.id,name:a.markers.marker.venue.name,lat:a.markers.marker.venue.location.lat,lng:a.markers.marker.venue.location.lng},c={lng:a.markers.marker.lng,lat:a.markers.marker.lat};h.addMarker(b,a.text,a.file,c,a.user),a.setState("completed"),f.remove("text")},a.$watch("state",function(){"credentials"===a.state&&(a.user={username:"",name:"Anonymous",photo:"",provider:null})}),a.oauth=function(b){j.auth(b).then(function(b){a.user=b,a.onRecorded()})},f.bind(a,"center",{defaultValue:d.getCenter()}),a.center.zoom=16,f.bind(a,"text"),f.bind(a,"state",{defaultValue:"mark"}),a.markers={},a.backendUrl=i}]),angular.module("publicEducationApp").service("Leaflet",function(){return{data:{leaflet:{center:{lat:41.0383,lng:28.9869,zoom:16}},markers:{},marker:null},getDefaults:function(){return{defaults:{tileLayer:"http://{s}.tiles.mapbox.com/v3/mushon.map-wjhkqj4n/{z}/{x}/{y}.png",maxZoom:20,minZoom:14,attributionControl:!1}}},getCenter:function(){return this.data.leaflet.center},setCenter:function(a){this.data.leaflet.center=a}}}),angular.module("publicEducationApp").service("Foursquare",["$http","$q","FOURSQUARE",function(a,b,c){return{gettingVenue:function(d,e){var f=b.defer();return a({method:"GET",url:"https://api.foursquare.com/v2/venues/search",params:{ll:d+","+e,v:20130917,client_id:c.id,client_secret:c.secret,limit:1},cache:!0}).success(function(a){f.resolve(a.response.venues[0])}),f.promise}}}]),angular.module("publicEducationApp").filter("venueName",function(){return function(a){return a?a:"Loading..."}}),angular.module("publicEducationApp").directive("soundRecorder",["Marker","$timeout","Phonegap",function(a,b,c){return{templateUrl:"views/sound-recorder.html",restrict:"E",scope:{file:"=file",onRecorded:"&onRecorded"},link:function(a){a.state="beforeRecord";var d=new Date;a.file="pe"+d.getTime(),c.isMobile.iOS()?a.file=a.file+".wav":c.isMobile.Android()&&(a.file=a.file+".amr");var e=c.getMedia(a.file);a.startRecord=function(){a.state="recording",e.startRecord(),a.counter=6,a.onTimeout=function(){a.counter--,a.counter>0?c=b(a.onTimeout,1e3):a.stopRecord()};var c=b(a.onTimeout,1e3)},a.stopRecord=function(){e.stopRecord(),a.state="afterRecord"},a.playRecord=function(){a.state="playRecord";var b=c.getMedia(a.file,function(){a.state="afterPlay"});b.play()}}}}]),angular.module("publicEducationApp").controller("PlayMarkerCtrl",["$scope","$routeParams","$location","storage","Marker","Leaflet","Phonegap","$window",function(a,b,c,d,e,f,g,h){a.venueId=b.venueId,angular.extend(a,{selectedMarker:{playList:[],currentRecord:null}}),a.center=f.getCenter(),a.selectedMarker={},a.playList=[],a.classPlayerMode="playlist-info bottom-bar",a.editMode=e.isPlayingAllMarkers(),a.actualPage=c.absUrl(),a.PlayingAllMarkers=function(){e.setPlayingAllMarkers(!1)},e.gettingMarkers().then(function(b){a.markers=b,a.markers[a.venueId]||c.path("/"),a.selectedMarker=a.markers[a.venueId],angular.forEach(a.selectedMarker.playList,function(b){a.playList.push(b),a.user=a.selectedMarker.user}),a.center={lat:a.selectedMarker.lat,lng:a.selectedMarker.lng,zoom:16}}),a.playListFinished=!1,e.isPlayingAllMarkers()&&a.$watch("playListFinished",function(b){if(b){var d=null,f=!1,g=null;angular.forEach(a.markers,function(b,c){d||(d=c),g||(c===a.venueId?f=!0:f&&(g=c))}),g?c.path("/play-marker/"+g):(e.setSkipCacheNextInterval(),c.path("/play-marker/"+d))}}),angular.extend(a,f.getDefaults()),a.$on("leafletDirectiveMap.drag",function(a,b){b.leafletEvent.target.options.dragging=!1,b.leafletEvent.target.dragging._enabled=!1,b.leafletEvent.target.dragging._draggable._enabled=!1,b.leafletEvent.target.keyboard._enabled=!1}),a.toggleEditMode=function(){a.editMode=!a.editMode},a.shareLink=function(b){var d,e=a.selectedMarker.currentRecord.text+"-"+encodeURIComponent(c.absUrl());"twitter"===b?d="https://twitter.com/share?text="+e:"facebook"===b?d="http://www.facebook.com/sharer/sharer.php?s=100&p[url]="+encodeURIComponent(c.absUrl())+"&p[title]=Public%20Education&p[summary]="+e:"email"===b&&(d="mailto:?body="+e+" - "+encodeURIComponent(c.absUrl())),h.open(d,b,"width=626,height=445")}}]),angular.module("publicEducationApp").controller("loginCtrl",["$scope","User","$location","BACKEND_URL",function(a,b,c,d){b.getUser().then(function(b){console.log(b),a.user=b}),a.backendUrl=d}]),angular.module("publicEducationApp").service("User",["$http","BACKEND_URL",function(a,b){return{data:{user:null},getUser:function(){return a({method:"GET",url:b+"/account",cache:!0,withCredentials:!0})}}}]),angular.module("publicEducationApp").service("Marker",["$q","$http","$timeout","BACKEND_URL","RECORD_FLAGS","Phonegap","md5",function(a,b,c,d,e,f,g){return{data:{markers:null,lastProcessingHash:null,markersCacheTimestamp:null,playAllMarkers:!1,skipCacheNextInterval:!1},addMarker:function(a,b,c,d,e){var f=a.id;this.data.markers=this.data.markers||{},this.data.markers[f]||(this.data.markers[f]={name:a.name,lat:a.lat,lng:a.lng,playList:[]});var h={};e&&(h={username:e.username,name:e.name,photo:e.photo,provider:e.provider});var i={src:c,text:b,user:h,unprocessed:!0,location:d};return i.hash=g.createHash(angular.toJson(i,!1)),this.setProcessing(i.hash),this.data.markers[f].playList=this.data.markers[f].playList||[],this.data.markers[f].playList.unshift(i),i.venue={venueId:a.id,name:a.name,lat:a.lat,lng:a.lng},this.uploadingMarker(i)},gettingMarkers:function(c){var f=this,g=a.defer();c=c||this.data.skipCacheNextInterval;var h=(new Date).getTime();return(this.data.isPlayingAllMarkers||this.data.markersCacheTimestamp&&h<this.data.markersCacheTimestamp+6e4)&&!c?(g.resolve(this.data.markers),g.promise):(this.data.skipCacheNextInterval=!1,b({method:"GET",url:d+"/get-markers",params:{flags:e.join()}}).success(function(a){f.data.markersCacheTimestamp=(new Date).getTime(),f.isProcessing(a)?g.resolve(f.data.markers):(f.data.markers=a,g.resolve(a))}),g.promise)},uploadingMarker:function(b){var c,e=a.defer(),g=f.getFileTransfer(),h=f.getFileUploadOptions();if(f.isMobile.iOS())c=window.appRootDir.fullPath+"/"+b.src,h.mimeType="audio/wav";else if(f.isMobile.Android()){c="/mnt/sdcard/"+b.src,h.mimeType="audio/amr";var i={"Content-type":"multipart/form-data; boundary=+++++"};h.headers=i}else c="/tmp/"+b.src,h.mimeType="audio/amr";return h.fileName=c.substr(c.lastIndexOf("/")+1),h.params={marker:JSON.stringify(b)},g.upload(c,d+"/add-marker",function(a){e.resolve(a)},function(a){console.log("An error has occurred: Code = "+a.code),console.log(a),e.reject(a)},h),e.promise},isProcessing:function(a){var b=this;return c(function(){b.data.lastProcessingHash=null},6e5),a&&b.data.lastProcessingHash&&angular.forEach(a,function(a){angular.forEach(a.playList,function(a){a.hash==b.data.lastProcessingHash&&(b.data.lastProcessingHash=null)})}),b.data.lastProcessingHash?!0:!1},setProcessing:function(a){this.data.lastProcessingHash=a},isPlayingAllMarkers:function(){return this.data.playAllMarkers},setPlayingAllMarkers:function(a){this.data.playAllMarkers=a},setSkipCacheNextInterval:function(){this.data.skipCacheNextInterval=!0}}}]),angular.module("publicEducationApp").service("Phonegap",["$http",function(a){return{isMobile:{Android:function(){return navigator.userAgent.match(/Android/i)},BlackBerry:function(){return navigator.userAgent.match(/BlackBerry/i)},iOS:function(){return navigator.userAgent.match(/iPhone|iPad|iPod/i)},Opera:function(){return navigator.userAgent.match(/Opera Mini/i)},Windows:function(){return navigator.userAgent.match(/IEMobile/i)},any:function(){return this.Android()||this.BlackBerry()||this.iOS()||this.Opera()||this.Windows()}},getFileUploadOptions:function(){return"undefined"!=typeof cordova?new FileUploadOptions:{}},getFileTransfer:function(){return"undefined"!=typeof cordova?new FileTransfer:{upload:function(b,c,d,e,f){return a({url:c,method:"POST",data:{base64:!0,marker:f.params.marker,file:{name:"pe.amr",data:"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"}}}).success(function(a){return d(a)
})}}},getMedia:function(a,b,c){return"undefined"!=typeof cordova?new Media(a,b,c):{startRecord:function(){return!0},stopRecord:function(){return!0},play:function(){return!0}}}}}]),angular.module("publicEducationApp").directive("audioPlayer",["Phonegap",function(a){return{templateUrl:"scripts/directives/audioPlayer/audioPlayer.html",restrict:"E",scope:{playList:"=playList",currentRecord:"=currentRecord",playListFinished:"=playListFinished"},link:function(b){b.isPhoneGap=a.isMobile.any(),b.previous=function(){b.currentTrack>0&&--b.currentTrack},b.next=function(){b.currentTrack<b.playList.length-1&&++b.currentTrack},b.playPauseHtml5=function(){b.play=!b.play,b.playerControl.playPause()},b.playPhoneGap=function(){b.mediaPlayer=a.getMedia(b.currentRecord.src,function(){b.$apply(function(){b.currentTrack+1<b.playList.length&&++b.currentTrack})}),b.play=!0,b.mediaPlayer.play()},b.$watch("currentTrack",function(a,c){b.playList.length&&(b.currentRecord=b.playList[a],b.isPhoneGap?b.playPhoneGap():c>0&&(b.play=!0,a>c?b.playerControl.next():b.playerControl.prev()))}),b.isPhoneGap||(b.$watch("playerControl.currentTrack",function(a){b.currentTrack=a-1,!b.playerControl||!b.playerControl.tracks}),b.$watch("playerControl.playing",function(a){a||b.playerControl&&b.playerControl.tracks&&b.playerControl.currentTrack===b.playerControl.tracks&&(b.playListFinished=!0,b.play=!1)}),b.play=!0),b.$watch("playList",function(a){a.length&&(b.currentTrack=0)},!0)}}}]),angular.module("publicEducationApp").factory("OAuthIo",["$window","$http","$q","OAUTHIO",function(a,b,c,d){function e(a){var d=c.defer();return b({method:"GET",url:"https://graph.facebook.com/me",params:{fields:"name,username",access_token:a}}).success(function(a){f.user.username=a.username,f.user.name=a.name,f.user.photo="https://graph.facebook.com/"+a.username+"/picture",f.user.provider="facebook",d.resolve(f.user)}),d.promise}var f={token:null,user:{username:null,name:null,photo:null,provider:null}};return{auth:function(b){var g=c.defer(),h=a.OAuth;return h.initialize(d.id),h.popup(b,function(a,c){c&&("facebook"===b?(f.token=c.access_token,g.resolve(e(f.token))):"twitter"===b&&(f.token=c.oauth_token,g.reject({msg:"require implementation"})))}),g.promise},getUser:function(){return f.user}}}]);