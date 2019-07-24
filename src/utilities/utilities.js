/* eslint-disable object-shorthand */
/* eslint-disable func-names */
const dotenv = require('dotenv');
dotenv.config();
const { log } = console;

const methods = {
  makePlainText: function (text) {
    return text.toString()
      .replace(/<[^>]*>?/g, '') // Remove HTML tags and their attributes around text
      .replace(/\t|\r|\n|\\n|\\r/g, '') // Remove line break and spacing characters
      .replace(/&#\d{1,4};|&\w{1,10};/g, '') // Remove HTML character entity name and numbered
      .replace(/'|’|‘|"|“|”/g, '')
      .replace(/[^\w\s\/\\\?\{\}\$\+\(\)\*\[\]\|\^\.\#\,\~\%\:\=\&\'\"]+/g, ' ')
      // .replace(/[^a-zA-Z0-9|.]/g, ' ') // Remove all non-word chars that are left
      .replace(/\s{2,100}/g, ' '); // Replace multiple continuous whitespaces with one space
  },
};
module.exports = methods;
