/* Connect to Mongo DB */
var db = require('promised-mongo')(process.env.MONGODB || 'pdjn');

exports.db = function () {
  return db;
};
