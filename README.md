Public Education - Client side
================

Installation and deployment on Android Emulator.
----------------
```
# Create new phonegap project and remove www folder
phonegap create test com.gizra.pubedu PubicEducation
cd test
rm -r www
cd ..

# Clone repo and move to phonegap project folder
git clone git@github.com:Gizra/public_education.git
cd public_education
cp -r . /var/test

# Install Phonegap plugins
cd ../test
git checkout 16
phonegap local plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-media-capture.git
phonegap local plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-media.git
phonegap local plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-file.git
phonegap local plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-file-transfer.git

# Install dependencies
bower install

# Build android platform
phonegap local build android

# Install the application
phonegap local install android

```

Installation (without using the emulator).
----------------
```
# Install packages
npm install
bower install
# Copy Grunt file configuration.
cp Gruntfile.example.js Gruntfile.js
# Create a FourSquare app in https://foursquare.com/developers/apps
# And add the app's client ID and secret to your Gruntfile.js under the
# "FOURSQUARE" constant.
grunt server

```

