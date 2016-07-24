# Lidar publisher sample

Read data from serial, decode it with `neato-lidar` and publish it on a RabbitMQ message broker.

## Install

  * `git clone ...`
  * npm install
  
## Config

Change the configuration in `config.js` if required

## Run 

  * as a daemon with forever: `npm start`
  * or `node index.js`
  
## Deploy on a PI with `piriku`

  * `npm install -g piriku`
  * `piriku create`
  * `git push piriku master`