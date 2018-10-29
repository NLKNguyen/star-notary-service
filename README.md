# Star Notary Service
Star Notary Service built on top of a simple private Blockchain to enable users to authenticate and register their ownership of stars with their own storyline  

Implemented in `Node.js` using `Sails` framework  -- project @ Udacity's Blockchain Developer Nanodegree


> Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

![getty_847491206_20001000200092802_361305](https://user-images.githubusercontent.com/4667129/46251722-f9d77280-c40f-11e8-8d9a-4aa4388a733e.jpg)

```
                                                                                          (Getty Images)
```

# Project Files

* `config/routes.js` defines REST API and connect to endpoints that are defined in the controller below.
* `api/controllers/BlockController.js` handles REST API calls. It depends on
    * `Blockchain.js` handles Blockchain functionalities like add/validate/search
    * `StarNotary.js` handles notary service to provide authentication for wallet address owner to sign and register stars 

* The rest is scaffolding from `Sails` framework's `new` command with `--no-frontend` argument.



# Install
```
$ npm install
```

# Run

```
$ node app
```

# RESTful API Endpoint

## Blockchain ID Routine - Request Validation

Users first need to request for validation of their wallet address before they can use it for star registration

**Method**: POST

**URL**: `http://localhost:8000/requestValidation`

**Parameter**: 
* `address`: user's wallet address

**Success Response**
* Status: 200 OK
* Content: JSON object with a `message` field which user needs to sign in the next step


## Blockchain ID Routine - Validate Message Signature

After receiving the response, users will prove their blockchain identity by signing a message with their wallet. If users created their wallet with Electrum app, then they can also use the tool `sign/verify message` that comes with the app to sign.

**Method**: POST

**URL**: `http://localhost:8000/message-signature/validate`

**Parameter**:
* `address`: the previously used wallet address 
* `signature`: created using the wallet on the message received in the previous step  

**Success Response**
* Status: 200 OK
* Content: JSON object with a `registerStar` field set to `true` indicating granted access to register a star with this address


## Star Registration

Once the signature is validated, the user can register a star with their wallet address.

**Method**: POST

**URL**: `http://localhost:8000/block`

**Parameter**:
* `address`: the previously used wallet address 
* `star`: JSON object containing properties of a star
    * `dec`: declination
    * `ra`:  right ascension
    * `story`: a text to associate with the star
    * `mag` [OPTIONAL]: magnitude
    * `con` [OPTIONAL]: constellation

**Success Response**
* Status: 201 CREATED
* Content: JSON object of a block, with star registration details, that is added to the blockchain


## Star Lookup - Using Wallet Address

At anytime, a lookup request can be made to query the stars registered by a given wallet address

**Method**: GET

**URL**: `http://localhost:8000/stars/address:[ADDRESS]`

**URL Parameter**:
* `[ADDRESS]`: a wallet address to search for stars ownership

**Success Response**
* Status: 200 OK
* Content: JSON object as an array of blocks that have  star registration by the given wallet address


## Star Lookup - Using Hash

At anytime, a lookup request can be made to query the block that has a given hash

**Method**: GET

**URL**: `http://localhost:8000/stars/hash:[HASH]`

**URL Parameter**:
* `[HASH]`: hash value of a block

**Success Response**
* Status: 200 OK
* Content: JSON object of a single block in the blockchain



# License MIT

Copyright © Nikyle Nguyen
