"use strict";
var createError = require('http-errors');

function _convertErrorName(errorId) {

  errorId = errorId.charAt(0).toUpperCase() + errorId.slice(1);
  return errorId.replace(/(\_\w)/g, function(m) {
    return m[1].toUpperCase();
  });
};

function _parseError(error) {

  if (error.errors) {
    return error.errors[0];
  }

  if (error.error) {
    return {
      id: error.error,
      message: error.error_description
    };
  }
};

function handleHttpError(err, response, callback) {

  if (!callback) {
    throw new Error("no callback for http error handler- check method signature");
  }

  if (err) {
    callback(err, null);
    return true;
  }
  if (!response) {
    callback(createError('no response'), null);
    return true;
  }
  if (response.status !== 200 &&
      response.status !== 201 &&
      response.status !== 204) {
    var error;
    try {
      var errorBody = _parseError(response.data);
      error = createError(response.status,
                          error.message,
                          {name: _convertErrorName(errorBody.id)});
    } catch (ex) {
      error = createError(response.status, response.data);
    }
    callback(error, null);
    return true;
  }
  return false;
}

function handleError(err, obj, callback) {

  if (!callback) {throw "no callback - check method signature";}
  if (err) {
    callback(err, null);
    return true;
  }
  if (obj.error) {
    callback(createError(obj.error, {name: 'APIError'}), null);
    return true;
  }
  if (obj.errors) {
    callback(createError(obj, {name: 'APIError'}), null);
    return true;
  }
  if (obj.success !== undefined && obj.success !== true) {
    callback(createError(obj, {name: 'APIError'}), null);
    return true;
  }
  return false;
}

module.exports.handleError     = handleError;
module.exports.handleHttpError = handleHttpError;

