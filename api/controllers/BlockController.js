const {Block, Blockchain} = require('./Blockchain')
const blockchain = new Blockchain();

const StarNotary = require('./StarNotary')
const starNotary = new StarNotary();

module.exports = {

  add: async function (req, res) {
    const address = req.param('address');
    const star    = req.param('star');

    // Input Validation: {{{
    if (!address || !star) {
      return res.badRequest("Wallet address and star information can't be empty");
    }

    const { dec, ra, story, mag, con } = star;
    if (!dec || !ra || !story) {
      return res.badRequest("Missing information for star registration");
    }

    if (new Buffer(story).length > 500) {
      return res.badRequest("Your story is too long. The Universe is made of short stories.");
    }

    const is_ASCII_in_hex = ((hexString) => /^[\x00-\x7F]*$/.test(hexString))

    if (!is_ASCII_in_hex(story)) {
      return res.badRequest("Your story contains invalid characters. The Universe only accepts ASCII.");
    }
    // }}}

    // Signature Validation: {{{
    try {
      const valid = await starNotary.hasValidSignature(address);
      if (!valid) {
        return res.status(401).json({error: 'Invalid signature'});
      }
    } catch (err) {
      return res.badRequest("Signature can't be verified");
    }
    // }}}

    // Block Creation: {{{
 
    // Reformat and make sure that only recognizable fields remain
    const blockData = {
      address,
      star : {
        dec,
        ra,
        story: Buffer.from(story).toString('hex'),
        mag,
        con
      }
    };


    try {
      const addedBlock = await blockchain.addBlock(new Block(blockData));
      await starNotary.invalidate(address); 
      return res.status(201).json(addedBlock);
    } 
    catch(err) {
      return res.serverError("Can't register now");
    }
    // }}}

  },

  find: async function (req, res) {
    const blockHeight = req.param('blockHeight');

    try {
      const block = await blockchain.getBlock(blockHeight);
      return res.json(block);
    }
    catch (err) {
      return res.notFound();
    }
  },


  requestValidation: async function (req, res) {
    const address = req.param('address');
    if (!address) {
      return res.badRequest("Wallet address is required");
    }

    let record;

    try {
      record = await starNotary.validate(address);
    }
    catch (err) {
      record = await starNotary.requestValidation(address);
    }

    return res.ok(record);
  },

  validateMessageSignature: async function (req, res) {
    const address   = req.param('address');
    const signature = req.param('signature');
    if (!address || !signature) {
      return res.badRequest("Wallet address and signature are required");
    }

    try {
      const record = await starNotary.validateMessageSignature(address, signature);
      if (record.registerStar) {
        return res.ok(record);
      } else {
        return res.status(401).json({error: 'Not permitted to register star'});
      }
    }
    catch (err) {
      return res.notFound();
    }
  },


  findStars: async function (req, res) {
    const params   = req.param('query').split(':');
    const type = params[0];
    const value = params[1];
    try {
      let result;
      if (type === 'address') {
        result = await blockchain.findBlocksByAddress(value);
      } else if (type === 'hash') {
        result = await blockchain.findBlockByHash(value);
      } else {
        return res.badRequest();
      }

      return res.ok(result);
    }
    catch (err) {
      return res.notFound();
    }
  }

};

