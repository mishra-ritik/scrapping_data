var https = require('follow-redirects').https;
var fs = require('fs');

var options = {
  'method': 'GET',
  'hostname': 'sonarqube.paltechops.org',
  'path': '/api/measures/component?component=buzz-api-main_new&metricKeys=alert_status,bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc',
  'headers': {
    'Authorization': 'Basic c3FwXzNlMTNkMjZkYTZhYTM1NmI2MmE3OTlmMjEwZTQ2OTc2MDVlNWUwODI6'
  },
  'maxRedirects': 20
};

var req = https.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

req.end();