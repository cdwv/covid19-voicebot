var request = require("request");

var options = {
  method: 'GET',
  url: 'https://api.flotiq.com/api/v1/content/question',
  qs: {
    hydrate: '1'
  },
  headers: {'x-auth-token': 'YOUR_TOKEN'}
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  const {data} = JSON.parse(body); 

  console.log(data.slice(0,1).pop())
});

