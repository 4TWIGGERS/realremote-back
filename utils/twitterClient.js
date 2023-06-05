const { TwitterApi } = require("twitter-api-v2");
const Twit = require("twit");

// const TwitterClient = new TwitterApi({
//   appKey: process.env.TWITTERAPPKEY,
//   appSecret: process.env.TWITTERAPPSECRET,
//   accessToken: process.env.TWITTERACCESSTOKEN,
//   accessSecret: process.env.TWITTERACCESSSECRET,
// });

// exports.rwClient = TwitterClient.readWrite;

var rwClient = new Twit({
  consumer_key: process.env.TWITTERAPPKEY,
  consumer_secret: process.env.TWITTERAPPSECRET,
  access_token: process.env.TWITTERACCESSTOKEN,
  access_token_secret: process.env.TWITTERACCESSSECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
});

exports.rwClient = rwClient;
