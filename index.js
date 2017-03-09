'use strict';
console.log('Loading event');

exports.handler = function(event, context, callback) {
  console.log('"Hello":"World"');
  callback(null, {"Hello":"World"});  // SUCCESS with message
};
