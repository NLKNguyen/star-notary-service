const level = require('level');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

class StarNotary {
  constructor(){
    this.chainDB = './stardata';
    this.db = level(this.chainDB);
  }

  dbAdd(record) {
    return this.db.put(record.address, JSON.stringify(record).toString());
  }

  requestValidation(address) {
    const timestamp = Date.now();
    const message = `${address}:${timestamp}:starRegistry`;
    const validationWindow = 300; // 5 minutes
  
    const record = {
      address: address,
      message: message,
      requestTimeStamp: timestamp,
      validationWindow: validationWindow
    };

    this.dbAdd(record);

    return record;
  }

  async hasValidSignature(address) {
    return this.db.get(address)
      .then(value => {
        const record = JSON.parse(value);
        return record.messageSignature === 'valid';
      });
  }

  async validate(address) {
    return this.db.get(address)
      .then(value => {
        const record = JSON.parse(value);

        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const isExpired = record.requestTimeStamp < fiveMinutesAgo; // before 5 mins ago

        if (isExpired) {
            return this.requestValidation(address);
        } else {

          const data = {
            address: address,
            message: record.message,
            requestTimeStamp: record.requestTimeStamp,
            validationWindow: Math.floor((record.requestTimeStamp - fiveMinutesAgo) / 1000)
          };

          return data;
        }
      });


  }

  async validateMessageSignature(address, signature) {
    return this.db.get(address)
      .then(value => {
        const record = JSON.parse(value);

        const result = {
            registerStar: null,
            status : null
        };

        if (record.messageSignature === 'valid') {
          result.registerStar = true;
          result.status = record;
          return result;
        }

        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const isExpired = record.requestTimeStamp < fiveMinutesAgo; // before 5 mins ago

        if (isExpired) {
          return this.requestValidation(address);
        } 

        record.validationWindow = Math.floor((record.requestTimeStamp - fiveMinutesAgo) / 1000) 

        const isValid = bitcoinMessage.verify(record.message, address, signature);

        record.messageSignature = isValid ? 'valid' : 'invalid';
        this.dbAdd(record);

        result.registerStar = isValid;
        result.status = record;

        return result;

      });
  }

}

module.exports = StarNotary;
