# logfather

Parses logs and stores them in MongoDB

## Logfather Class

### Constructor

`new Logfather(options)`

- `options` (object): Configuration options
  - `mongoUri` (string): MongoDB connection URI. Defaults to `process.env.LF_MONGO_URI`.
  - `regex` (array): Array of regex patterns to match log entries. Each pattern should be an object with the following properties:
    - `regex` (RegExp): The regular expression to match log entries.
    - `fields` (array): Array of field definitions. Each field should be an object with the following properties:
      - `name` (string): The name of the field.
      - `type` (string): The type of the field. Can be `'string'` or `'date'`.
  - `database` (string): Name of the MongoDB database.
  - `collection` (string): Name of the MongoDB collection.

### Methods

#### `watch(logFile)`

Watches a log file for changes and processes new content.

- `logFile` (string): Path to the log file. Defaults to `process.env.LF_PATH`.
