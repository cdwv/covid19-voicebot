#!/usr/bin/env node

var fetch = require("node-fetch");

var options = {
  method: 'GET',
  url: 'https://api.flotiq.com/api/v1/content/question',
  qs: {
  },
  headers: {'x-auth-token': 'cb1823cd6bd353fe3d29a3a84a53cec4'}
};

async function getQuestion() {

  let response = await fetch(options.url, options);
  let questions = await response.json();

  return questions.data;
}

module.exports = getQuestion;
