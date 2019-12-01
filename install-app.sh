#!/bin/bash

apt-get -y update

apt-get -y install nginx curl mysql-client git

curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

apt-get -y install nodejs

ssh-keyscan github.com >> ~/.ssh/known_hosts

#ADD Swap memory to avoid NPM CRASH d/t low memory
#https://aws.amazon.com/premiumsupport/knowledge-center/ec2-memory-swap-file/
sudo /bin/dd if=/dev/zero of=/var/swap.1 bs=1M count=1024
sudo /sbin/mkswap /var/swap.1
sudo chmod 600 /var/swap.1
sudo /sbin/swapon /var/swap.1

#REACT APP
git clone git@github.com:illinoistech-itm/ttruty.git
cd ttruty/itmo-544/web/react-aws/react-express

#node modules
npm install aws-sdk -g
npm install pm2 -g
npm install
npm run build
pm2 start server.js

# sudo npm run-script build
#sudo rm -f /var/www/html/index.html
sudo cp -a client/build/. /var/www/html

sudo cp /ttruty/itmo-544/web/react-aws/default /etc/nginx/sites-available/default

sudo systemctl restart nginx
