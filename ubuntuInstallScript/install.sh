wget https://github.com/davidedc/livecodelab/archive/master.zip
unzip master.zip
rm master.zip
cd livecodelab-master
sudo add-apt-repository ppa:chris-lea/node.js  
sudo apt-get update  
sudo apt-get install nodejs

sudo npm install grunt
sudo npm install -g grunt-cli

sudo apt-get install default-jre

sudo npm install
sudo npm install -g crojsdoc
