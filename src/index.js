const Logfather = require('./logfather');
const dotenv = require('dotenv');

dotenv.config();

const { MONGO_USER, MONGO_PASS } = process.env;

const auth = `${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(
  MONGO_PASS
)}`;

const uri = `mongodb+srv://${auth}@tvm-prodtek.d0kmo.mongodb.net/?retryWrites=true&w=majority&appName=tvm-prodtek`;

const logfather = new Logfather({
  mongoUri: uri,
  debug: true,
  database: 'logs',
  collection: 'ease',
  regex: [
    {
      regex:
        /(\d{4}-\d{2}-\d{2}T[\.\d:A-Za-z]*)\s{1}([A-Z]{1,})\s{1}([\d\.:]*)\s{1}([\w/%]*)/g,
      fields: [
        { name: 'timestamp', type: 'date' },
        { name: 'method', type: 'string' },
        { name: 'ip', type: 'string' },
        { name: 'path', type: 'string' }
      ]
    }
  ]
});

console.log(logfather);

logfather.watch('/Users/ola.ingvarsson/Documents/Code/ease/api/logs/app.log');
