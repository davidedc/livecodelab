# this script is udeful to test
# the setup of the node/grunt/libraries
# for the build process
# in a virgin ubuntu installation

# the whole installation can be run by opening
# a terminal and issuing the following command
# (on one line, or separate)
# wget http://raw.github.com/davidedc/livecodelab/master/ubuntuInstallScript/install.sh ; sh install.sh


# download and unzip livecodelab
wget https://github.com/davidedc/livecodelab/archive/master.zip
unzip master.zip
rm master.zip
cd livecodelab-master

# install node from the repo that tends
# to have the latest version
sudo add-apt-repository ppa:chris-lea/node.js  
sudo apt-get update  
sudo apt-get install nodejs

# install grunt and grunt cli
sudo npm install grunt
sudo npm install -g grunt-cli

# install java
sudo apt-get install default-jre

# this installs all the dependencies as noted
# in the package.json file
sudo npm install

# install crojsdoc globally. One would normally
# add crojsdoc as a dependency in the 
# package.json file, but doing that it would only
# install it locally - and crojsdoc doesn't work
# when only installed locally. Also, there is no
# clean way to install a backage globally from
# the package.json file.
sudo npm install -g crojsdoc
