const pino = require('pino');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const logFile = join(tmpdir(), `pino-${process.pid}-example`);

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty', 
      options: { colorize: true },
    },
    {
      target: 'pino/file', 
      options: { destination: "pino2.log" },
    },
  ],
});

const logger = pino(transport);

module.exports = logger;
