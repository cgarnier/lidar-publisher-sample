const SerialPort = require('serialport')
const amqp = require('amqplib/callback_api')
const LidarPacket = require('neato-lidar').LidarPacket

const Config = require('./config')

const serial = new SerialPort(Config.serial, {
  baudrate: 115200,
  parser: SerialPort.parsers.byteDelimiter([ 0xfa ])
})

serial.on('open', (err) => {
  if (err) {
    console.error('Unable to open serial port: ' + err.message)
    process.exit(1)
  }
  console.log('Serial is open')
})

amqp.connect(Config.amqp, (err, conn) => {
  if (err) {
    console.error('Unable to connect: ' + err.message)
    process.exit(1)
  }
  conn.createChannel((err, ch) => {
    if (err) {
      console.error('Unable to create channel: ' + err.message)
      process.exit(1)
    }
    let ex = Config.channel

    ch.assertExchange(ex, 'fanout', { durable: false })

    serial.on('data', function (data) {
      data = new Uint8Array([ 0xFA ].concat(data.slice(0, 21)))
      try {
        let lp = new LidarPacket(data)
        lp.measures.forEach((m) => {
          ch.publish(ex, '', new Buffer(JSON.stringify(lp)))
        })
      } catch (e) {
        console.error('Error while parsing packet: ' + e.message)
      }
    })
  })
})
