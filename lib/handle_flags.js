const flags = require('flags');

flags.defineBoolean('test')
    .setDefault(false)
    .setDescription('Use this flag to print information in the console.');

flags.defineString('channel')
    .setDefault('web_ids_requests')
    .setDescription('Redis channel to listen to.' +
                    ' Channel must be JSON formatted.');

flags.defineBoolean('dev')
    .setDefault(false)
    .setDescription('Used for local testing and development ' +
                    'where redis is not available')
    .setSecret(true);

flags.usageInfo = 'Usage: web_ids [options]';

flags.parse();

module.exports = {
  test: flags.get('test'),
  dev: flags.get('dev'),
  channel: flags.get('channel'),
}
;
