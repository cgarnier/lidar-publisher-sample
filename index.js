const fs = require('fs')
const path = require('path')
const SerialPort = require('serialport')
const amqp = require('amqplib/callback_api');

const LidarPacket = require('neato-lidar').LidarPacket
const LidarMeasure = require('neato-lidar').LidarMeasure

const Config = require('./config')
const serial = new SerialPort(Config.serial, {
  baudrate: 115200,
  parser: SerialPort.parsers.byteDelimiter([0xfa])
})

serial.on('open', function (err) {
  console.log('Serial is open')
})

amqp.connect(Config.amqp, function(err, conn) {
  conn.createChannel(function(err, ch) {
    let ex = Config.channel;

    ch.assertExchange(ex, 'fanout', {durable: false});

    serial.on('data', function (data) {
      data = new Uint8Array([0xFA].concat(data.slice(0, 21)))
      try {
        let lp = new LidarPacket(data)
        lp.measures.forEach((m) => {
            ch.publish(ex, '', new Buffer(JSON.stringify(lp)));
        })
      }
      catch (e) {
        console.error('Error while parsing packet: ' + e.message);
      }
    })
  });
});
