const fs = require('fs');

const { MongoClient, ServerApiVersion } = require('mongodb');

class Logfather {
  #collection;
  #mongoClient;

  constructor(options = {}) {
    this.mongoUri = options.mongoUri || process.env.LF_MONGO_URI;
    this.regex = options.regex || [];
    this.lastSize = 0;
    this.debug = options.debug || false;

    if (!this.mongoUri && !this.debug) {
      throw new Error('Mongo URI is required');
    }

    this.#mongoClient = new MongoClient(this.mongoUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });

    this.#collection = this.#mongoClient
      .db(options.database)
      .collection(options.collection);
  }

  async #saveToMongo(obj) {
    if (this.debug) {
      console.log('Debug:', obj);
      return;
    }
    try {
      await this.#collection.insertOne(obj);
    } catch (err) {
      console.error('Error saving to MongoDB:', err);
    }
  }

  #handleChunk(chunk) {
    // Process new content
    const newContent = chunk.toString();
    console.log('New content:', newContent); // TODO: Remove this line

    // Add your custom processing logic here
    this.regex.forEach((re) => {
      const matches = newContent.matchAll(re.regex);

      for (const match of matches) {
        const obj = {};
        re.fields.forEach((field, index) => {
          let value = match[index + 1];
          if (field.type === 'date') {
            value = new Date(match[index + 1]);
          }
          obj[field.name] = value;
        });
        this.#saveToMongo(obj);
      }
    });
  }

  watch(logFile) {
    logFile = logFile || process.env.LF_PATH;

    if (!logFile) {
      throw new Error('Path is required');
    }

    try {
      const stats = fs.statSync(logFile);
      this.lastSize = stats.size;
    } catch (err) {
      console.error('Error getting file stats:', err);
    }

    fs.watch(logFile, (eventType) => {
      if (eventType === 'change') {
        const stats = fs.statSync(logFile);
        const newSize = stats.size;

        if (newSize < this.lastSize) {
          // File was truncated
          this.lastSize = newSize;
          return;
        }

        // Read only the new content
        const stream = fs.createReadStream(logFile, {
          start: this.lastSize,
          end: newSize
        });

        stream.on('data', this.#handleChunk.bind(this));

        this.lastSize = newSize;
      }
    });

    console.log(`Watching for changes in ${logFile}`);
  }
}

module.exports = Logfather;
