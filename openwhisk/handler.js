'use strict';

function hello(params) {
  const name = params.name || 'World';
  return { payload: `Hello, ${name} from Travis!` };
}

exports.hello = hello;
