/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");
var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, {method: 'get'}, this.defaults, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var isAbsoluteURL = __webpack_require__(/*! ./../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ./../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var isBuffer = __webpack_require__(/*! is-buffer */ "./node_modules/is-buffer/index.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};


/***/ }),

/***/ "./src/scss/styles.scss":
/*!******************************!*
  !*** ./src/scss/styles.scss ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "bundle.css";

/***/ }),

/***/ "./src/index.htm":
/*!***********************!*
  !*** ./src/index.htm ***!
  \***********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "index.htm";

/***/ }),

/***/ "./node_modules/highcharts/highcharts.js":
/*!***********************************************!*
  !*** ./node_modules/highcharts/highcharts.js ***!
  \***********************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*
 Highcharts JS v8.2.2 (2020-10-22)

 (c) 2009-2018 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(X,N){ true&&module.exports?(N["default"]=N,module.exports=X.document?N(X):N): true?!(__WEBPACK_AMD_DEFINE_RESULT__ = (function(){return N(X)}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):(0)})("undefined"!==typeof window?window:this,function(X){function N(f,h,m,z){f.hasOwnProperty(h)||(f[h]=z.apply(null,m))}var m={};N(m,"Core/Globals.js",[],function(){var f="undefined"!==typeof X?X:"undefined"!==typeof window?window:{},h=f.document,
m=f.navigator&&f.navigator.userAgent||"",z=h&&h.createElementNS&&!!h.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect,F=/(edge|msie|trident)/i.test(m)&&!f.opera,L=-1!==m.indexOf("Firefox"),K=-1!==m.indexOf("Chrome"),C=L&&4>parseInt(m.split("Firefox/")[1],10);return{product:"Highcharts",version:"8.2.2",deg2rad:2*Math.PI/360,doc:h,hasBidiBug:C,hasTouch:!!f.TouchEvent,isMS:F,isWebKit:-1!==m.indexOf("AppleWebKit"),isFirefox:L,isChrome:K,isSafari:!K&&-1!==m.indexOf("Safari"),isTouchDevice:/(Mobile|Android|Windows Phone)/.test(m),
SVG_NS:"http://www.w3.org/2000/svg",chartCount:0,seriesTypes:{},symbolSizes:{},svg:z,win:f,marginNames:["plotTop","marginRight","marginBottom","plotLeft"],noop:function(){},charts:[],dateFormats:{}}});N(m,"Core/Utilities.js",[m["Core/Globals.js"]],function(f){function h(b,k,t,a){var u=k?"Highcharts error":"Highcharts warning";32===b&&(b=u+": Deprecated member");var c=l(b),H=c?u+" #"+b+": www.highcharts.com/errors/"+b+"/":b.toString();u=function(){if(k)throw Error(H);e.console&&-1===h.messages.indexOf(H)&&
console.log(H)};if("undefined"!==typeof a){var d="";c&&(H+="?");S(a,function(b,k){d+="\n - "+k+": "+b;c&&(H+=encodeURI(k)+"="+encodeURI(b))});H+=d}t?ca(t,"displayError",{code:b,message:H,params:a},u):u();h.messages.push(H)}function m(){var b,k=arguments,t={},a=function(b,k){"object"!==typeof b&&(b={});S(k,function(t,u){!z(t,!0)||n(t)||D(t)?b[u]=k[u]:b[u]=a(b[u]||{},t)});return b};!0===k[0]&&(t=k[1],k=Array.prototype.slice.call(k,2));var u=k.length;for(b=0;b<u;b++)t=a(t,k[b]);return t}function z(b,
k){return!!b&&"object"===typeof b&&(!k||!x(b))}function F(b,k,t){var a;v(k)?w(t)?b.setAttribute(k,t):b&&b.getAttribute&&((a=b.getAttribute(k))||"class"!==k||(a=b.getAttribute(k+"Name"))):S(k,function(k,t){b.setAttribute(t,k)});return a}function L(){for(var b=arguments,k=b.length,t=0;t<k;t++){var a=b[t];if("undefined"!==typeof a&&null!==a)return a}}function K(b,k){if(!b)return k;var t=b.split(".").reverse();if(1===t.length)return k[b];for(b=t.pop();"undefined"!==typeof b&&"undefined"!==typeof k&&null!==
k;)k=k[b],b=t.pop();return k}f.timers=[];var C=f.charts,y=f.doc,e=f.win;(h||(h={})).messages=[];f.error=h;f.merge=m;var I=f.pInt=function(b,k){return parseInt(b,k||10)},v=f.isString=function(b){return"string"===typeof b},x=f.isArray=function(b){b=Object.prototype.toString.call(b);return"[object Array]"===b||"[object Array Iterator]"===b};f.isObject=z;var D=f.isDOMElement=function(b){return z(b)&&"number"===typeof b.nodeType},n=f.isClass=function(b){var k=b&&b.constructor;return!(!z(b,!0)||D(b)||!k||
!k.name||"Object"===k.name)},l=f.isNumber=function(b){return"number"===typeof b&&!isNaN(b)&&Infinity>b&&-Infinity<b},J=f.erase=function(b,k){for(var t=b.length;t--;)if(b[t]===k){b.splice(t,1);break}},w=f.defined=function(b){return"undefined"!==typeof b&&null!==b};f.attr=F;var r=f.splat=function(b){return x(b)?b:[b]},d=f.syncTimeout=function(b,k,t){if(0<k)return setTimeout(b,k,t);b.call(0,t);return-1},g=f.clearTimeout=function(b){w(b)&&clearTimeout(b)},c=f.extend=function(b,k){var t;b||(b={});for(t in k)b[t]=
k[t];return b};f.pick=L;var a=f.css=function(b,k){f.isMS&&!f.svg&&k&&"undefined"!==typeof k.opacity&&(k.filter="alpha(opacity="+100*k.opacity+")");c(b.style,k)},q=f.createElement=function(b,k,t,u,H){b=y.createElement(b);k&&c(b,k);H&&a(b,{padding:"0",border:"none",margin:"0"});t&&a(b,t);u&&u.appendChild(b);return b},p=f.extendClass=function(b,k){var t=function(){};t.prototype=new b;c(t.prototype,k);return t},B=f.pad=function(b,k,t){return Array((k||2)+1-String(b).replace("-","").length).join(t||"0")+
b},A=f.relativeLength=function(b,k,t){return/%$/.test(b)?k*parseFloat(b)/100+(t||0):parseFloat(b)},G=f.wrap=function(b,k,t){var a=b[k];b[k]=function(){var b=Array.prototype.slice.call(arguments),k=arguments,u=this;u.proceed=function(){a.apply(u,arguments.length?arguments:k)};b.unshift(a);b=t.apply(this,b);u.proceed=null;return b}},M=f.format=function(b,k,t){var a="{",u=!1,H=[],c=/f$/,d=/\.([0-9])/,g=f.defaultOptions.lang,p=t&&t.time||f.time;for(t=t&&t.numberFormatter||R;b;){var q=b.indexOf(a);if(-1===
q)break;var U=b.slice(0,q);if(u){U=U.split(":");a=K(U.shift()||"",k);if(U.length&&"number"===typeof a)if(U=U.join(":"),c.test(U)){var r=parseInt((U.match(d)||["","-1"])[1],10);null!==a&&(a=t(a,r,g.decimalPoint,-1<U.indexOf(",")?g.thousandsSep:""))}else a=p.dateFormat(U,a);H.push(a)}else H.push(U);b=b.slice(q+1);a=(u=!u)?"}":"{"}H.push(b);return H.join("")},T=f.getMagnitude=function(b){return Math.pow(10,Math.floor(Math.log(b)/Math.LN10))},Q=f.normalizeTickInterval=function(b,k,a,u,H){var c=b;a=L(a,
1);var d=b/a;k||(k=H?[1,1.2,1.5,2,2.5,3,4,5,6,8,10]:[1,2,2.5,5,10],!1===u&&(1===a?k=k.filter(function(b){return 0===b%1}):.1>=a&&(k=[1/a])));for(u=0;u<k.length&&!(c=k[u],H&&c*a>=b||!H&&d<=(k[u]+(k[u+1]||k[u]))/2);u++);return c=t(c*a,-Math.round(Math.log(.001)/Math.LN10))},O=f.stableSort=function(b,k){var t=b.length,a,u;for(u=0;u<t;u++)b[u].safeI=u;b.sort(function(b,t){a=k(b,t);return 0===a?b.safeI-t.safeI:a});for(u=0;u<t;u++)delete b[u].safeI},E=f.arrayMin=function(b){for(var k=b.length,t=b[0];k--;)b[k]<
t&&(t=b[k]);return t},u=f.arrayMax=function(b){for(var k=b.length,t=b[0];k--;)b[k]>t&&(t=b[k]);return t},b=f.destroyObjectProperties=function(b,k){S(b,function(t,a){t&&t!==k&&t.destroy&&t.destroy();delete b[a]})},k=f.discardElement=function(b){var k=f.garbageBin;k||(k=q("div"));b&&k.appendChild(b);k.innerHTML=""},t=f.correctFloat=function(b,k){return parseFloat(b.toPrecision(k||14))},H=f.timeUnits={millisecond:1,second:1E3,minute:6E4,hour:36E5,day:864E5,week:6048E5,month:24192E5,year:314496E5},R=
f.numberFormat=function(b,k,t,a){b=+b||0;k=+k;var u=f.defaultOptions.lang,H=(b.toString().split(".")[1]||"").split("e")[0].length,c=b.toString().split("e");if(-1===k)k=Math.min(H,20);else if(!l(k))k=2;else if(k&&c[1]&&0>c[1]){var d=k+ +c[1];0<=d?(c[0]=(+c[0]).toExponential(d).split("e")[0],k=d):(c[0]=c[0].split(".")[0]||0,b=20>k?(c[0]*Math.pow(10,c[1])).toFixed(k):0,c[1]=0)}var g=(Math.abs(c[1]?c[0]:b)+Math.pow(10,-Math.max(k,H)-1)).toFixed(k);H=String(I(g));d=3<H.length?H.length%3:0;t=L(t,u.decimalPoint);
a=L(a,u.thousandsSep);b=(0>b?"-":"")+(d?H.substr(0,d)+a:"");b+=H.substr(d).replace(/(\d{3})(?=\d)/g,"$1"+a);k&&(b+=t+g.slice(-k));c[1]&&0!==+b&&(b+="e"+c[1]);return b};Math.easeInOutSine=function(b){return-.5*(Math.cos(Math.PI*b)-1)};var U=f.getStyle=function(b,k,t){if("width"===k)return k=Math.min(b.offsetWidth,b.scrollWidth),t=b.getBoundingClientRect&&b.getBoundingClientRect().width,t<k&&t>=k-1&&(k=Math.floor(t)),Math.max(0,k-f.getStyle(b,"padding-left")-f.getStyle(b,"padding-right"));if("height"===
k)return Math.max(0,Math.min(b.offsetHeight,b.scrollHeight)-f.getStyle(b,"padding-top")-f.getStyle(b,"padding-bottom"));e.getComputedStyle||h(27,!0);if(b=e.getComputedStyle(b,void 0))b=b.getPropertyValue(k),L(t,"opacity"!==k)&&(b=I(b));return b},Z=f.inArray=function(b,k,t){h(32,!1,void 0,{"Highcharts.inArray":"use Array.indexOf"});return k.indexOf(b,t)},aa=f.find=Array.prototype.find?function(b,k){return b.find(k)}:function(b,k){var t,a=b.length;for(t=0;t<a;t++)if(k(b[t],t))return b[t]};f.keys=function(b){h(32,
!1,void 0,{"Highcharts.keys":"use Object.keys"});return Object.keys(b)};var ba=f.offset=function(b){var k=y.documentElement;b=b.parentElement||b.parentNode?b.getBoundingClientRect():{top:0,left:0};return{top:b.top+(e.pageYOffset||k.scrollTop)-(k.clientTop||0),left:b.left+(e.pageXOffset||k.scrollLeft)-(k.clientLeft||0)}},S=f.objectEach=function(b,k,t){for(var a in b)Object.hasOwnProperty.call(b,a)&&k.call(t||b[a],b[a],a,b)};S({map:"map",each:"forEach",grep:"filter",reduce:"reduce",some:"some"},function(b,
k){f[k]=function(t){var a;h(32,!1,void 0,(a={},a["Highcharts."+k]="use Array."+b,a));return Array.prototype[b].apply(t,[].slice.call(arguments,1))}});var Y=f.addEvent=function(b,k,t,a){void 0===a&&(a={});var u=b.addEventListener||f.addEventListenerPolyfill;var c="function"===typeof b&&b.prototype?b.prototype.protoEvents=b.prototype.protoEvents||{}:b.hcEvents=b.hcEvents||{};f.Point&&b instanceof f.Point&&b.series&&b.series.chart&&(b.series.chart.runTrackerClick=!0);u&&u.call(b,k,t,!1);c[k]||(c[k]=
[]);c[k].push({fn:t,order:"number"===typeof a.order?a.order:Infinity});c[k].sort(function(b,k){return b.order-k.order});return function(){W(b,k,t)}},W=f.removeEvent=function(b,k,t){function a(k,t){var a=b.removeEventListener||f.removeEventListenerPolyfill;a&&a.call(b,k,t,!1)}function u(t){var u;if(b.nodeName){if(k){var c={};c[k]=!0}else c=t;S(c,function(b,k){if(t[k])for(u=t[k].length;u--;)a(k,t[k][u].fn)})}}var c;["protoEvents","hcEvents"].forEach(function(H,d){var g=(d=d?b:b.prototype)&&d[H];g&&
(k?(c=g[k]||[],t?(g[k]=c.filter(function(b){return t!==b.fn}),a(k,t)):(u(g),g[k]=[])):(u(g),d[H]={}))})},ca=f.fireEvent=function(b,k,t,a){var u;t=t||{};if(y.createEvent&&(b.dispatchEvent||b.fireEvent)){var H=y.createEvent("Events");H.initEvent(k,!0,!0);c(H,t);b.dispatchEvent?b.dispatchEvent(H):b.fireEvent(k,H)}else t.target||c(t,{preventDefault:function(){t.defaultPrevented=!0},target:b,type:k}),function(k,a){void 0===k&&(k=[]);void 0===a&&(a=[]);var c=0,H=0,d=k.length+a.length;for(u=0;u<d;u++)!1===
(k[c]?a[H]?k[c].order<=a[H].order?k[c++]:a[H++]:k[c++]:a[H++]).fn.call(b,t)&&t.preventDefault()}(b.protoEvents&&b.protoEvents[k],b.hcEvents&&b.hcEvents[k]);a&&!t.defaultPrevented&&a.call(b,t)},V,da=f.uniqueKey=function(){var b=Math.random().toString(36).substring(2,9)+"-",k=0;return function(){return"highcharts-"+(V?"":b)+k++}}(),ea=f.useSerialIds=function(b){return V=L(b,V)},fa=f.isFunction=function(b){return"function"===typeof b},ha=f.getOptions=function(){return f.defaultOptions},ia=f.setOptions=
function(b){f.defaultOptions=m(!0,f.defaultOptions,b);(b.time||b.global)&&f.time.update(m(f.defaultOptions.global,f.defaultOptions.time,b.global,b.time));return f.defaultOptions};e.jQuery&&(e.jQuery.fn.highcharts=function(){var b=[].slice.call(arguments);if(this[0])return b[0]?(new (f[v(b[0])?b.shift():"Chart"])(this[0],b[0],b[1]),this):C[F(this[0],"data-highcharts-chart")]});return{addEvent:Y,arrayMax:u,arrayMin:E,attr:F,clamp:function(b,k,t){return b>k?b<t?b:t:k},clearTimeout:g,correctFloat:t,createElement:q,
css:a,defined:w,destroyObjectProperties:b,discardElement:k,erase:J,error:h,extend:c,extendClass:p,find:aa,fireEvent:ca,format:M,getMagnitude:T,getNestedProperty:K,getOptions:ha,getStyle:U,inArray:Z,isArray:x,isClass:n,isDOMElement:D,isFunction:fa,isNumber:l,isObject:z,isString:v,merge:m,normalizeTickInterval:Q,numberFormat:R,objectEach:S,offset:ba,pad:B,pick:L,pInt:I,relativeLength:A,removeEvent:W,setOptions:ia,splat:r,stableSort:O,syncTimeout:d,timeUnits:H,uniqueKey:da,useSerialIds:ea,wrap:G}});
N(m,"Core/Color/Color.js",[m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h){var m=h.isNumber,z=h.merge,F=h.pInt;"";h=function(){function h(K){this.parsers=[{regex:/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/,parse:function(h){return[F(h[1]),F(h[2]),F(h[3]),parseFloat(h[4],10)]}},{regex:/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,parse:function(h){return[F(h[1]),F(h[2]),F(h[3]),1]}}];this.rgba=[];if(f.Color!==h)return new f.Color(K);
if(!(this instanceof h))return new h(K);this.init(K)}h.parse=function(f){return new h(f)};h.prototype.init=function(f){var C,y;if((this.input=f=h.names[f&&f.toLowerCase?f.toLowerCase():""]||f)&&f.stops)this.stops=f.stops.map(function(v){return new h(v[1])});else{if(f&&f.charAt&&"#"===f.charAt()){var e=f.length;f=parseInt(f.substr(1),16);7===e?C=[(f&16711680)>>16,(f&65280)>>8,f&255,1]:4===e&&(C=[(f&3840)>>4|(f&3840)>>8,(f&240)>>4|f&240,(f&15)<<4|f&15,1])}if(!C)for(y=this.parsers.length;y--&&!C;){var I=
this.parsers[y];(e=I.regex.exec(f))&&(C=I.parse(e))}}this.rgba=C||[]};h.prototype.get=function(f){var h=this.input,y=this.rgba;if("undefined"!==typeof this.stops){var e=z(h);e.stops=[].concat(e.stops);this.stops.forEach(function(I,v){e.stops[v]=[e.stops[v][0],I.get(f)]})}else e=y&&m(y[0])?"rgb"===f||!f&&1===y[3]?"rgb("+y[0]+","+y[1]+","+y[2]+")":"a"===f?y[3]:"rgba("+y.join(",")+")":h;return e};h.prototype.brighten=function(f){var h,y=this.rgba;if(this.stops)this.stops.forEach(function(e){e.brighten(f)});
else if(m(f)&&0!==f)for(h=0;3>h;h++)y[h]+=F(255*f),0>y[h]&&(y[h]=0),255<y[h]&&(y[h]=255);return this};h.prototype.setOpacity=function(f){this.rgba[3]=f;return this};h.prototype.tweenTo=function(f,h){var y=this.rgba,e=f.rgba;e.length&&y&&y.length?(f=1!==e[3]||1!==y[3],h=(f?"rgba(":"rgb(")+Math.round(e[0]+(y[0]-e[0])*(1-h))+","+Math.round(e[1]+(y[1]-e[1])*(1-h))+","+Math.round(e[2]+(y[2]-e[2])*(1-h))+(f?","+(e[3]+(y[3]-e[3])*(1-h)):"")+")"):h=f.input||"none";return h};h.names={white:"#ffffff",black:"#000000"};
return h}();f.Color=h;f.color=h.parse;return h});N(m,"Core/Animation/Fx.js",[m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h){var m=f.win,z=h.isNumber,F=h.objectEach;h=function(){function h(f,h,y){this.pos=NaN;this.options=h;this.elem=f;this.prop=y}h.prototype.dSetter=function(){var f=this.paths,h=f&&f[0];f=f&&f[1];var y=[],e=this.now||0;if(1!==e&&h&&f)if(h.length===f.length&&1>e)for(var I=0;I<f.length;I++){for(var v=h[I],x=f[I],D=[],n=0;n<x.length;n++){var l=v[n],J=x[n];D[n]="number"===
typeof l&&"number"===typeof J&&("A"!==x[0]||4!==n&&5!==n)?l+e*(J-l):J}y.push(D)}else y=f;else y=this.toD||[];this.elem.attr("d",y,void 0,!0)};h.prototype.update=function(){var f=this.elem,h=this.prop,y=this.now,e=this.options.step;if(this[h+"Setter"])this[h+"Setter"]();else f.attr?f.element&&f.attr(h,y,null,!0):f.style[h]=y+this.unit;e&&e.call(f,y,this)};h.prototype.run=function(h,C,y){var e=this,I=e.options,v=function(n){return v.stopped?!1:e.step(n)},x=m.requestAnimationFrame||function(n){setTimeout(n,
13)},D=function(){for(var n=0;n<f.timers.length;n++)f.timers[n]()||f.timers.splice(n--,1);f.timers.length&&x(D)};h!==C||this.elem["forceAnimate:"+this.prop]?(this.startTime=+new Date,this.start=h,this.end=C,this.unit=y,this.now=this.start,this.pos=0,v.elem=this.elem,v.prop=this.prop,v()&&1===f.timers.push(v)&&x(D)):(delete I.curAnim[this.prop],I.complete&&0===Object.keys(I.curAnim).length&&I.complete.call(this.elem))};h.prototype.step=function(f){var h=+new Date,y=this.options,e=this.elem,I=y.complete,
v=y.duration,x=y.curAnim;if(e.attr&&!e.element)f=!1;else if(f||h>=v+this.startTime){this.now=this.end;this.pos=1;this.update();var D=x[this.prop]=!0;F(x,function(n){!0!==n&&(D=!1)});D&&I&&I.call(e);f=!1}else this.pos=y.easing((h-this.startTime)/v),this.now=this.start+(this.end-this.start)*this.pos,this.update(),f=!0;return f};h.prototype.initPath=function(f,h,y){function e(r,d){for(;r.length<w;){var g=r[0],c=d[w-r.length];c&&"M"===g[0]&&(r[0]="C"===c[0]?["C",g[1],g[2],g[1],g[2],g[1],g[2]]:["L",g[1],
g[2]]);r.unshift(g);D&&r.push(r[r.length-1])}}function I(r,d){for(;r.length<w;)if(d=r[r.length/n-1].slice(),"C"===d[0]&&(d[1]=d[5],d[2]=d[6]),D){var g=r[r.length/n].slice();r.splice(r.length/2,0,d,g)}else r.push(d)}var v=f.startX,x=f.endX;h=h&&h.slice();y=y.slice();var D=f.isArea,n=D?2:1;if(!h)return[y,y];if(v&&x){for(f=0;f<v.length;f++)if(v[f]===x[0]){var l=f;break}else if(v[0]===x[x.length-v.length+f]){l=f;var J=!0;break}else if(v[v.length-1]===x[x.length-v.length+f]){l=v.length-f;break}"undefined"===
typeof l&&(h=[])}if(h.length&&z(l)){var w=y.length+l*n;J?(e(h,y),I(y,h)):(e(y,h),I(h,y))}return[h,y]};h.prototype.fillSetter=function(){h.prototype.strokeSetter.apply(this,arguments)};h.prototype.strokeSetter=function(){this.elem.attr(this.prop,f.color(this.start).tweenTo(f.color(this.end),this.pos),null,!0)};return h}();return f.Fx=h});N(m,"Core/Animation/AnimationUtilities.js",[m["Core/Animation/Fx.js"],m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h,m){var z=m.defined,P=m.getStyle,L=
m.isArray,K=m.isNumber,C=m.isObject,y=m.merge,e=m.objectEach,I=m.pick;m=h.setAnimation=function(l,n){n.renderer.globalAnimation=I(l,n.options.chart.animation,!0)};var v=h.animObject=function(l){return C(l)?h.merge({duration:500,defer:0},l):{duration:l?500:0,defer:0}},x=h.getDeferredAnimation=function(l,n,w){var r=v(n),d=0,g=0;(w?[w]:l.series).forEach(function(c){c=v(c.options.animation);d=n&&z(n.defer)?r.defer:Math.max(d,c.duration+c.defer);g=Math.min(r.duration,c.duration)});l.renderer.forExport&&
(d=0);return{defer:Math.max(0,d-g),duration:Math.min(d,g)}},D=h.animate=function(l,v,w){var r,d="",g,c;if(!C(w)){var a=arguments;w={duration:a[2],easing:a[3],complete:a[4]}}K(w.duration)||(w.duration=400);w.easing="function"===typeof w.easing?w.easing:Math[w.easing]||Math.easeInOutSine;w.curAnim=y(v);e(v,function(a,p){n(l,p);c=new f(l,w,p);g=null;"d"===p&&L(v.d)?(c.paths=c.initPath(l,l.pathArray,v.d),c.toD=v.d,r=0,g=1):l.attr?r=l.attr(p):(r=parseFloat(P(l,p))||0,"opacity"!==p&&(d="px"));g||(g=a);
g&&g.match&&g.match("px")&&(g=g.replace(/px/g,""));c.run(r,g,d)})},n=h.stop=function(l,n){for(var w=h.timers.length;w--;)h.timers[w].elem!==l||n&&n!==h.timers[w].prop||(h.timers[w].stopped=!0)};return{animate:D,animObject:v,getDeferredAnimation:x,setAnimation:m,stop:n}});N(m,"Core/Renderer/SVG/SVGElement.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Color/Color.js"],m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h,m,z){var F=f.animate,P=f.animObject,K=f.stop,C=m.deg2rad,y=m.doc,
e=m.hasTouch,I=m.isFirefox,v=m.noop,x=m.svg,D=m.SVG_NS,n=m.win,l=z.attr,J=z.createElement,w=z.css,r=z.defined,d=z.erase,g=z.extend,c=z.fireEvent,a=z.isArray,q=z.isFunction,p=z.isNumber,B=z.isString,A=z.merge,G=z.objectEach,M=z.pick,T=z.pInt,Q=z.syncTimeout,O=z.uniqueKey;"";f=function(){function E(){this.height=this.element=void 0;this.opacity=1;this.renderer=void 0;this.SVG_NS=D;this.symbolCustomAttribs="x y width height r start end innerR anchorX anchorY rounded".split(" ");this.width=void 0}E.prototype._defaultGetter=
function(a){a=M(this[a+"Value"],this[a],this.element?this.element.getAttribute(a):null,0);/^[\-0-9\.]+$/.test(a)&&(a=parseFloat(a));return a};E.prototype._defaultSetter=function(a,b,k){k.setAttribute(b,a)};E.prototype.add=function(a){var b=this.renderer,k=this.element;a&&(this.parentGroup=a);this.parentInverted=a&&a.inverted;"undefined"!==typeof this.textStr&&"text"===this.element.nodeName&&b.buildText(this);this.added=!0;if(!a||a.handleZ||this.zIndex)var t=this.zIndexSetter();t||(a?a.element:b.box).appendChild(k);
if(this.onAdd)this.onAdd();return this};E.prototype.addClass=function(a,b){var k=b?"":this.attr("class")||"";a=(a||"").split(/ /g).reduce(function(b,a){-1===k.indexOf(a)&&b.push(a);return b},k?[k]:[]).join(" ");a!==k&&this.attr("class",a);return this};E.prototype.afterSetters=function(){this.doTransform&&(this.updateTransform(),this.doTransform=!1)};E.prototype.align=function(a,b,k){var t,c={};var u=this.renderer;var g=u.alignedObjects;var p,q;if(a){if(this.alignOptions=a,this.alignByTranslate=b,
!k||B(k))this.alignTo=t=k||"renderer",d(g,this),g.push(this),k=void 0}else a=this.alignOptions,b=this.alignByTranslate,t=this.alignTo;k=M(k,u[t],u);t=a.align;u=a.verticalAlign;g=(k.x||0)+(a.x||0);var r=(k.y||0)+(a.y||0);"right"===t?p=1:"center"===t&&(p=2);p&&(g+=(k.width-(a.width||0))/p);c[b?"translateX":"x"]=Math.round(g);"bottom"===u?q=1:"middle"===u&&(q=2);q&&(r+=(k.height-(a.height||0))/q);c[b?"translateY":"y"]=Math.round(r);this[this.placed?"animate":"attr"](c);this.placed=!0;this.alignAttr=
c;return this};E.prototype.alignSetter=function(a){var b={left:"start",center:"middle",right:"end"};b[a]&&(this.alignValue=a,this.element.setAttribute("text-anchor",b[a]))};E.prototype.animate=function(a,b,k){var t=this,c=P(M(b,this.renderer.globalAnimation,!0));b=c.defer;M(y.hidden,y.msHidden,y.webkitHidden,!1)&&(c.duration=0);0!==c.duration?(k&&(c.complete=k),Q(function(){t.element&&F(t,a,c)},b)):(this.attr(a,void 0,k),G(a,function(b,k){c.step&&c.step.call(this,b,{prop:k,pos:1})},this));return this};
E.prototype.applyTextOutline=function(a){var b=this.element,k;-1!==a.indexOf("contrast")&&(a=a.replace(/contrast/g,this.renderer.getContrast(b.style.fill)));a=a.split(" ");var t=a[a.length-1];if((k=a[0])&&"none"!==k&&m.svg){this.fakeTS=!0;a=[].slice.call(b.getElementsByTagName("tspan"));this.ySetter=this.xSetter;k=k.replace(/(^[\d\.]+)(.*?)$/g,function(b,k,t){return 2*k+t});this.removeTextOutline(a);var c=b.textContent?/^[\u0591-\u065F\u066A-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(b.textContent):
!1;var u=b.firstChild;a.forEach(function(a,H){0===H&&(a.setAttribute("x",b.getAttribute("x")),H=b.getAttribute("y"),a.setAttribute("y",H||0),null===H&&b.setAttribute("y",0));H=a.cloneNode(!0);l(c&&!I?a:H,{"class":"highcharts-text-outline",fill:t,stroke:t,"stroke-width":k,"stroke-linejoin":"round"});b.insertBefore(H,u)});c&&I&&a[0]&&(a=a[0].cloneNode(!0),a.textContent=" ",b.insertBefore(a,u))}};E.prototype.attr=function(a,b,k,t){var c=this.element,u,d=this,g,p,q=this.symbolCustomAttribs;if("string"===
typeof a&&"undefined"!==typeof b){var r=a;a={};a[r]=b}"string"===typeof a?d=(this[a+"Getter"]||this._defaultGetter).call(this,a,c):(G(a,function(b,k){g=!1;t||K(this,k);this.symbolName&&-1!==q.indexOf(k)&&(u||(this.symbolAttr(a),u=!0),g=!0);!this.rotation||"x"!==k&&"y"!==k||(this.doTransform=!0);g||(p=this[k+"Setter"]||this._defaultSetter,p.call(this,b,k,c),!this.styledMode&&this.shadows&&/^(width|height|visibility|x|y|d|transform|cx|cy|r)$/.test(k)&&this.updateShadows(k,b,p))},this),this.afterSetters());
k&&k.call(this);return d};E.prototype.clip=function(a){return this.attr("clip-path",a?"url("+this.renderer.url+"#"+a.id+")":"none")};E.prototype.crisp=function(a,b){b=b||a.strokeWidth||0;var k=Math.round(b)%2/2;a.x=Math.floor(a.x||this.x||0)+k;a.y=Math.floor(a.y||this.y||0)+k;a.width=Math.floor((a.width||this.width||0)-2*k);a.height=Math.floor((a.height||this.height||0)-2*k);r(a.strokeWidth)&&(a.strokeWidth=b);return a};E.prototype.complexColor=function(u,b,k){var t=this.renderer,H,d,g,p,q,B,l,n,
w,E,V=[],v;c(this.renderer,"complexColor",{args:arguments},function(){u.radialGradient?d="radialGradient":u.linearGradient&&(d="linearGradient");if(d){g=u[d];q=t.gradients;B=u.stops;w=k.radialReference;a(g)&&(u[d]=g={x1:g[0],y1:g[1],x2:g[2],y2:g[3],gradientUnits:"userSpaceOnUse"});"radialGradient"===d&&w&&!r(g.gradientUnits)&&(p=g,g=A(g,t.getRadialAttr(w,p),{gradientUnits:"userSpaceOnUse"}));G(g,function(b,k){"id"!==k&&V.push(k,b)});G(B,function(b){V.push(b)});V=V.join(",");if(q[V])E=q[V].attr("id");
else{g.id=E=O();var c=q[V]=t.createElement(d).attr(g).add(t.defs);c.radAttr=p;c.stops=[];B.forEach(function(b){0===b[1].indexOf("rgba")?(H=h.parse(b[1]),l=H.get("rgb"),n=H.get("a")):(l=b[1],n=1);b=t.createElement("stop").attr({offset:b[0],"stop-color":l,"stop-opacity":n}).add(c);c.stops.push(b)})}v="url("+t.url+"#"+E+")";k.setAttribute(b,v);k.gradient=V;u.toString=function(){return v}}})};E.prototype.css=function(a){var b=this.styles,k={},t=this.element,c="",d=!b,u=["textOutline","textOverflow","width"];
a&&a.color&&(a.fill=a.color);b&&G(a,function(a,t){b&&b[t]!==a&&(k[t]=a,d=!0)});if(d){b&&(a=g(b,k));if(a)if(null===a.width||"auto"===a.width)delete this.textWidth;else if("text"===t.nodeName.toLowerCase()&&a.width)var p=this.textWidth=T(a.width);this.styles=a;p&&!x&&this.renderer.forExport&&delete a.width;if(t.namespaceURI===this.SVG_NS){var q=function(b,k){return"-"+k.toLowerCase()};G(a,function(b,k){-1===u.indexOf(k)&&(c+=k.replace(/([A-Z])/g,q)+":"+b+";")});c&&l(t,"style",c)}else w(t,a);this.added&&
("text"===this.element.nodeName&&this.renderer.buildText(this),a&&a.textOutline&&this.applyTextOutline(a.textOutline))}return this};E.prototype.dashstyleSetter=function(a){var b=this["stroke-width"];"inherit"===b&&(b=1);if(a=a&&a.toLowerCase()){var k=a.replace("shortdashdotdot","3,1,1,1,1,1,").replace("shortdashdot","3,1,1,1").replace("shortdot","1,1,").replace("shortdash","3,1,").replace("longdash","8,3,").replace(/dot/g,"1,3,").replace("dash","4,3,").replace(/,$/,"").split(",");for(a=k.length;a--;)k[a]=
""+T(k[a])*M(b,NaN);a=k.join(",").replace(/NaN/g,"none");this.element.setAttribute("stroke-dasharray",a)}};E.prototype.destroy=function(){var a=this,b=a.element||{},k=a.renderer,t=k.isSVG&&"SPAN"===b.nodeName&&a.parentGroup||void 0,c=b.ownerSVGElement;b.onclick=b.onmouseout=b.onmouseover=b.onmousemove=b.point=null;K(a);if(a.clipPath&&c){var g=a.clipPath;[].forEach.call(c.querySelectorAll("[clip-path],[CLIP-PATH]"),function(b){-1<b.getAttribute("clip-path").indexOf(g.element.id)&&b.removeAttribute("clip-path")});
a.clipPath=g.destroy()}if(a.stops){for(c=0;c<a.stops.length;c++)a.stops[c].destroy();a.stops.length=0;a.stops=void 0}a.safeRemoveChild(b);for(k.styledMode||a.destroyShadows();t&&t.div&&0===t.div.childNodes.length;)b=t.parentGroup,a.safeRemoveChild(t.div),delete t.div,t=b;a.alignTo&&d(k.alignedObjects,a);G(a,function(b,k){a[k]&&a[k].parentGroup===a&&a[k].destroy&&a[k].destroy();delete a[k]})};E.prototype.destroyShadows=function(){(this.shadows||[]).forEach(function(a){this.safeRemoveChild(a)},this);
this.shadows=void 0};E.prototype.destroyTextPath=function(a,b){var k=a.getElementsByTagName("text")[0];if(k){if(k.removeAttribute("dx"),k.removeAttribute("dy"),b.element.setAttribute("id",""),this.textPathWrapper&&k.getElementsByTagName("textPath").length){for(a=this.textPathWrapper.element.childNodes;a.length;)k.appendChild(a[0]);k.removeChild(this.textPathWrapper.element)}}else if(a.getAttribute("dx")||a.getAttribute("dy"))a.removeAttribute("dx"),a.removeAttribute("dy");this.textPathWrapper&&(this.textPathWrapper=
this.textPathWrapper.destroy())};E.prototype.dSetter=function(c,b,k){a(c)&&("string"===typeof c[0]&&(c=this.renderer.pathToSegments(c)),this.pathArray=c,c=c.reduce(function(b,k,a){return k&&k.join?(a?b+" ":"")+k.join(" "):(k||"").toString()},""));/(NaN| {2}|^$)/.test(c)&&(c="M 0 0");this[b]!==c&&(k.setAttribute(b,c),this[b]=c)};E.prototype.fadeOut=function(a){var b=this;b.animate({opacity:0},{duration:M(a,150),complete:function(){b.attr({y:-9999}).hide()}})};E.prototype.fillSetter=function(a,b,k){"string"===
typeof a?k.setAttribute(b,a):a&&this.complexColor(a,b,k)};E.prototype.getBBox=function(a,b){var k,t=this.renderer,c=this.element,d=this.styles,p=this.textStr,u=t.cache,B=t.cacheKeys,A=c.namespaceURI===this.SVG_NS;b=M(b,this.rotation,0);var l=t.styledMode?c&&E.prototype.getStyle.call(c,"font-size"):d&&d.fontSize;if(r(p)){var n=p.toString();-1===n.indexOf("<")&&(n=n.replace(/[0-9]/g,"0"));n+=["",b,l,this.textWidth,d&&d.textOverflow,d&&d.fontWeight].join()}n&&!a&&(k=u[n]);if(!k){if(A||t.forExport){try{var w=
this.fakeTS&&function(b){[].forEach.call(c.querySelectorAll(".highcharts-text-outline"),function(k){k.style.display=b})};q(w)&&w("none");k=c.getBBox?g({},c.getBBox()):{width:c.offsetWidth,height:c.offsetHeight};q(w)&&w("")}catch(ca){""}if(!k||0>k.width)k={width:0,height:0}}else k=this.htmlGetBBox();t.isSVG&&(a=k.width,t=k.height,A&&(k.height=t={"11px,17":14,"13px,20":16}[d&&d.fontSize+","+Math.round(t)]||t),b&&(d=b*C,k.width=Math.abs(t*Math.sin(d))+Math.abs(a*Math.cos(d)),k.height=Math.abs(t*Math.cos(d))+
Math.abs(a*Math.sin(d))));if(n&&0<k.height){for(;250<B.length;)delete u[B.shift()];u[n]||B.push(n);u[n]=k}}return k};E.prototype.getStyle=function(a){return n.getComputedStyle(this.element||this,"").getPropertyValue(a)};E.prototype.hasClass=function(a){return-1!==(""+this.attr("class")).split(" ").indexOf(a)};E.prototype.hide=function(a){a?this.attr({y:-9999}):this.attr({visibility:"hidden"});return this};E.prototype.htmlGetBBox=function(){return{height:0,width:0,x:0,y:0}};E.prototype.init=function(a,
b){this.element="span"===b?J(b):y.createElementNS(this.SVG_NS,b);this.renderer=a;c(this,"afterInit")};E.prototype.invert=function(a){this.inverted=a;this.updateTransform();return this};E.prototype.on=function(a,b){var k,t,c=this.element,d;e&&"click"===a?(c.ontouchstart=function(b){k=b.touches[0].clientX;t=b.touches[0].clientY},c.ontouchend=function(a){k&&4<=Math.sqrt(Math.pow(k-a.changedTouches[0].clientX,2)+Math.pow(t-a.changedTouches[0].clientY,2))||b.call(c,a);d=!0;!1!==a.cancelable&&a.preventDefault()},
c.onclick=function(k){d||b.call(c,k)}):c["on"+a]=b;return this};E.prototype.opacitySetter=function(a,b,k){this.opacity=a=Number(Number(a).toFixed(3));k.setAttribute(b,a)};E.prototype.removeClass=function(a){return this.attr("class",(""+this.attr("class")).replace(B(a)?new RegExp("(^| )"+a+"( |$)"):a," ").replace(/ +/g," ").trim())};E.prototype.removeTextOutline=function(a){for(var b=a.length,k;b--;)k=a[b],"highcharts-text-outline"===k.getAttribute("class")&&d(a,this.element.removeChild(k))};E.prototype.safeRemoveChild=
function(a){var b=a.parentNode;b&&b.removeChild(a)};E.prototype.setRadialReference=function(a){var b=this.element.gradient&&this.renderer.gradients[this.element.gradient];this.element.radialReference=a;b&&b.radAttr&&b.animate(this.renderer.getRadialAttr(a,b.radAttr));return this};E.prototype.setTextPath=function(a,b){var k=this.element,t={textAnchor:"text-anchor"},c=!1,d=this.textPathWrapper,g=!d;b=A(!0,{enabled:!0,attributes:{dy:-5,startOffset:"50%",textAnchor:"middle"}},b);var q=b.attributes;if(a&&
b&&b.enabled){d&&null===d.element.parentNode?(g=!0,d=d.destroy()):d&&this.removeTextOutline.call(d.parentGroup,[].slice.call(k.getElementsByTagName("tspan")));this.options&&this.options.padding&&(q.dx=-this.options.padding);d||(this.textPathWrapper=d=this.renderer.createElement("textPath"),c=!0);var u=d.element;(b=a.element.getAttribute("id"))||a.element.setAttribute("id",b=O());if(g)for(a=k.getElementsByTagName("tspan");a.length;)a[0].setAttribute("y",0),p(q.dx)&&a[0].setAttribute("x",-q.dx),u.appendChild(a[0]);
c&&d&&d.add({element:this.text?this.text.element:k});u.setAttributeNS("http://www.w3.org/1999/xlink","href",this.renderer.url+"#"+b);r(q.dy)&&(u.parentNode.setAttribute("dy",q.dy),delete q.dy);r(q.dx)&&(u.parentNode.setAttribute("dx",q.dx),delete q.dx);G(q,function(b,k){u.setAttribute(t[k]||k,b)});k.removeAttribute("transform");this.removeTextOutline.call(d,[].slice.call(k.getElementsByTagName("tspan")));this.text&&!this.renderer.styledMode&&this.attr({fill:"none","stroke-width":0});this.applyTextOutline=
this.updateTransform=v}else d&&(delete this.updateTransform,delete this.applyTextOutline,this.destroyTextPath(k,a),this.updateTransform(),this.options&&this.options.rotation&&this.applyTextOutline(this.options.style.textOutline));return this};E.prototype.shadow=function(a,b,k){var t=[],c=this.element,d=!1,p=this.oldShadowOptions;var q={color:"#000000",offsetX:1,offsetY:1,opacity:.15,width:3};var u;!0===a?u=q:"object"===typeof a&&(u=g(q,a));u&&(u&&p&&G(u,function(b,k){b!==p[k]&&(d=!0)}),d&&this.destroyShadows(),
this.oldShadowOptions=u);if(!u)this.destroyShadows();else if(!this.shadows){var r=u.opacity/u.width;var B=this.parentInverted?"translate(-1,-1)":"translate("+u.offsetX+", "+u.offsetY+")";for(q=1;q<=u.width;q++){var A=c.cloneNode(!1);var n=2*u.width+1-2*q;l(A,{stroke:a.color||"#000000","stroke-opacity":r*q,"stroke-width":n,transform:B,fill:"none"});A.setAttribute("class",(A.getAttribute("class")||"")+" highcharts-shadow");k&&(l(A,"height",Math.max(l(A,"height")-n,0)),A.cutHeight=n);b?b.element.appendChild(A):
c.parentNode&&c.parentNode.insertBefore(A,c);t.push(A)}this.shadows=t}return this};E.prototype.show=function(a){return this.attr({visibility:a?"inherit":"visible"})};E.prototype.strokeSetter=function(a,b,k){this[b]=a;this.stroke&&this["stroke-width"]?(E.prototype.fillSetter.call(this,this.stroke,"stroke",k),k.setAttribute("stroke-width",this["stroke-width"]),this.hasStroke=!0):"stroke-width"===b&&0===a&&this.hasStroke?(k.removeAttribute("stroke"),this.hasStroke=!1):this.renderer.styledMode&&this["stroke-width"]&&
(k.setAttribute("stroke-width",this["stroke-width"]),this.hasStroke=!0)};E.prototype.strokeWidth=function(){if(!this.renderer.styledMode)return this["stroke-width"]||0;var a=this.getStyle("stroke-width"),b=0;if(a.indexOf("px")===a.length-2)b=T(a);else if(""!==a){var k=y.createElementNS(D,"rect");l(k,{width:a,"stroke-width":0});this.element.parentNode.appendChild(k);b=k.getBBox().width;k.parentNode.removeChild(k)}return b};E.prototype.symbolAttr=function(a){var b=this;"x y r start end width height innerR anchorX anchorY clockwise".split(" ").forEach(function(k){b[k]=
M(a[k],b[k])});b.attr({d:b.renderer.symbols[b.symbolName](b.x,b.y,b.width,b.height,b)})};E.prototype.textSetter=function(a){a!==this.textStr&&(delete this.textPxLength,this.textStr=a,this.added&&this.renderer.buildText(this))};E.prototype.titleSetter=function(a){var b=this.element.getElementsByTagName("title")[0];b||(b=y.createElementNS(this.SVG_NS,"title"),this.element.appendChild(b));b.firstChild&&b.removeChild(b.firstChild);b.appendChild(y.createTextNode(String(M(a,"")).replace(/<[^>]*>/g,"").replace(/&lt;/g,
"<").replace(/&gt;/g,">")))};E.prototype.toFront=function(){var a=this.element;a.parentNode.appendChild(a);return this};E.prototype.translate=function(a,b){return this.attr({translateX:a,translateY:b})};E.prototype.updateShadows=function(a,b,k){var t=this.shadows;if(t)for(var c=t.length;c--;)k.call(t[c],"height"===a?Math.max(b-(t[c].cutHeight||0),0):"d"===a?this.d:b,a,t[c])};E.prototype.updateTransform=function(){var a=this.translateX||0,b=this.translateY||0,k=this.scaleX,t=this.scaleY,c=this.inverted,
d=this.rotation,g=this.matrix,p=this.element;c&&(a+=this.width,b+=this.height);a=["translate("+a+","+b+")"];r(g)&&a.push("matrix("+g.join(",")+")");c?a.push("rotate(90) scale(-1,1)"):d&&a.push("rotate("+d+" "+M(this.rotationOriginX,p.getAttribute("x"),0)+" "+M(this.rotationOriginY,p.getAttribute("y")||0)+")");(r(k)||r(t))&&a.push("scale("+M(k,1)+" "+M(t,1)+")");a.length&&p.setAttribute("transform",a.join(" "))};E.prototype.visibilitySetter=function(a,b,k){"inherit"===a?k.removeAttribute(b):this[b]!==
a&&k.setAttribute(b,a);this[b]=a};E.prototype.xGetter=function(a){"circle"===this.element.nodeName&&("x"===a?a="cx":"y"===a&&(a="cy"));return this._defaultGetter(a)};E.prototype.zIndexSetter=function(a,b){var k=this.renderer,t=this.parentGroup,c=(t||k).element||k.box,d=this.element,g=!1;k=c===k.box;var p=this.added;var q;r(a)?(d.setAttribute("data-z-index",a),a=+a,this[b]===a&&(p=!1)):r(this[b])&&d.removeAttribute("data-z-index");this[b]=a;if(p){(a=this.zIndex)&&t&&(t.handleZ=!0);b=c.childNodes;for(q=
b.length-1;0<=q&&!g;q--){t=b[q];p=t.getAttribute("data-z-index");var u=!r(p);if(t!==d)if(0>a&&u&&!k&&!q)c.insertBefore(d,b[q]),g=!0;else if(T(p)<=a||u&&(!r(a)||0<=a))c.insertBefore(d,b[q+1]||null),g=!0}g||(c.insertBefore(d,b[k?3:0]||null),g=!0)}return g};return E}();f.prototype["stroke-widthSetter"]=f.prototype.strokeSetter;f.prototype.yGetter=f.prototype.xGetter;f.prototype.matrixSetter=f.prototype.rotationOriginXSetter=f.prototype.rotationOriginYSetter=f.prototype.rotationSetter=f.prototype.scaleXSetter=
f.prototype.scaleYSetter=f.prototype.translateXSetter=f.prototype.translateYSetter=f.prototype.verticalAlignSetter=function(a,c){this[c]=a;this.doTransform=!0};m.SVGElement=f;return m.SVGElement});N(m,"Core/Renderer/SVG/SVGLabel.js",[m["Core/Renderer/SVG/SVGElement.js"],m["Core/Utilities.js"]],function(f,h){var m=this&&this.__extends||function(){var f=function(e,I){f=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(v,e){v.__proto__=e}||function(v,e){for(var f in e)e.hasOwnProperty(f)&&
(v[f]=e[f])};return f(e,I)};return function(e,I){function v(){this.constructor=e}f(e,I);e.prototype=null===I?Object.create(I):(v.prototype=I.prototype,new v)}}(),z=h.defined,F=h.extend,L=h.isNumber,K=h.merge,C=h.removeEvent;return function(h){function e(f,v,x,D,n,l,J,w,r,d){var g=h.call(this)||this;g.init(f,"g");g.textStr=v;g.x=x;g.y=D;g.anchorX=l;g.anchorY=J;g.baseline=r;g.className=d;"button"!==d&&g.addClass("highcharts-label");d&&g.addClass("highcharts-"+d);g.text=f.text("",0,0,w).attr({zIndex:1});
if("string"===typeof n){var c=/^url\((.*?)\)$/.test(n);if(g.renderer.symbols[n]||c)g.symbolKey=n}g.bBox=e.emptyBBox;g.padding=3;g.paddingLeft=0;g.baselineOffset=0;g.needsBox=f.styledMode||c;g.deferredAttr={};g.alignFactor=0;return g}m(e,h);e.prototype.alignSetter=function(e){e={left:0,center:.5,right:1}[e];e!==this.alignFactor&&(this.alignFactor=e,this.bBox&&L(this.xSetting)&&this.attr({x:this.xSetting}))};e.prototype.anchorXSetter=function(e,v){this.anchorX=e;this.boxAttr(v,Math.round(e)-this.getCrispAdjust()-
this.xSetting)};e.prototype.anchorYSetter=function(e,v){this.anchorY=e;this.boxAttr(v,e-this.ySetting)};e.prototype.boxAttr=function(e,v){this.box?this.box.attr(e,v):this.deferredAttr[e]=v};e.prototype.css=function(h){if(h){var v={};h=K(h);e.textProps.forEach(function(e){"undefined"!==typeof h[e]&&(v[e]=h[e],delete h[e])});this.text.css(v);var I="fontSize"in v||"fontWeight"in v;if("width"in v||I)this.updateBoxSize(),I&&this.updateTextPadding()}return f.prototype.css.call(this,h)};e.prototype.destroy=
function(){C(this.element,"mouseenter");C(this.element,"mouseleave");this.text&&this.text.destroy();this.box&&(this.box=this.box.destroy());f.prototype.destroy.call(this)};e.prototype.fillSetter=function(e,v){e&&(this.needsBox=!0);this.fill=e;this.boxAttr(v,e)};e.prototype.getBBox=function(){var e=this.bBox,v=this.padding;return{width:e.width+2*v,height:e.height+2*v,x:e.x-v,y:e.y-v}};e.prototype.getCrispAdjust=function(){return this.renderer.styledMode&&this.box?this.box.strokeWidth()%2/2:(this["stroke-width"]?
parseInt(this["stroke-width"],10):0)%2/2};e.prototype.heightSetter=function(e){this.heightSetting=e};e.prototype.on=function(e,v){var h=this,D=h.text,n=D&&"SPAN"===D.element.tagName?D:void 0;if(n){var l=function(l){("mouseenter"===e||"mouseleave"===e)&&l.relatedTarget instanceof Element&&(h.element.contains(l.relatedTarget)||n.element.contains(l.relatedTarget))||v.call(h.element,l)};n.on(e,l)}f.prototype.on.call(h,e,l||v);return h};e.prototype.onAdd=function(){var e=this.textStr;this.text.add(this);
this.attr({text:z(e)?e:"",x:this.x,y:this.y});this.box&&z(this.anchorX)&&this.attr({anchorX:this.anchorX,anchorY:this.anchorY})};e.prototype.paddingSetter=function(e){z(e)&&e!==this.padding&&(this.padding=e,this.updateTextPadding())};e.prototype.paddingLeftSetter=function(e){z(e)&&e!==this.paddingLeft&&(this.paddingLeft=e,this.updateTextPadding())};e.prototype.rSetter=function(e,v){this.boxAttr(v,e)};e.prototype.shadow=function(e){e&&!this.renderer.styledMode&&(this.updateBoxSize(),this.box&&this.box.shadow(e));
return this};e.prototype.strokeSetter=function(e,v){this.stroke=e;this.boxAttr(v,e)};e.prototype["stroke-widthSetter"]=function(e,v){e&&(this.needsBox=!0);this["stroke-width"]=e;this.boxAttr(v,e)};e.prototype["text-alignSetter"]=function(e){this.textAlign=e};e.prototype.textSetter=function(e){"undefined"!==typeof e&&this.text.attr({text:e});this.updateBoxSize();this.updateTextPadding()};e.prototype.updateBoxSize=function(){var f=this.text.element.style,v={},h=this.padding,D=this.paddingLeft,n=L(this.widthSetting)&&
L(this.heightSetting)&&!this.textAlign||!z(this.text.textStr)?e.emptyBBox:this.text.getBBox();this.width=(this.widthSetting||n.width||0)+2*h+D;this.height=(this.heightSetting||n.height||0)+2*h;this.baselineOffset=h+Math.min(this.renderer.fontMetrics(f&&f.fontSize,this.text).b,n.height||Infinity);this.needsBox&&(this.box||(f=this.box=this.symbolKey?this.renderer.symbol(this.symbolKey):this.renderer.rect(),f.addClass(("button"===this.className?"":"highcharts-label-box")+(this.className?" highcharts-"+
this.className+"-box":"")),f.add(this),f=this.getCrispAdjust(),v.x=f,v.y=(this.baseline?-this.baselineOffset:0)+f),v.width=Math.round(this.width),v.height=Math.round(this.height),this.box.attr(F(v,this.deferredAttr)),this.deferredAttr={});this.bBox=n};e.prototype.updateTextPadding=function(){var e=this.text,f=this.baseline?0:this.baselineOffset,h=this.paddingLeft+this.padding;z(this.widthSetting)&&this.bBox&&("center"===this.textAlign||"right"===this.textAlign)&&(h+={center:.5,right:1}[this.textAlign]*
(this.widthSetting-this.bBox.width));if(h!==e.x||f!==e.y)e.attr("x",h),e.hasBoxWidthChanged&&(this.bBox=e.getBBox(!0),this.updateBoxSize()),"undefined"!==typeof f&&e.attr("y",f);e.x=h;e.y=f};e.prototype.widthSetter=function(e){this.widthSetting=L(e)?e:void 0};e.prototype.xSetter=function(e){this.x=e;this.alignFactor&&(e-=this.alignFactor*((this.widthSetting||this.bBox.width)+2*this.padding),this["forceAnimate:x"]=!0);this.xSetting=Math.round(e);this.attr("translateX",this.xSetting)};e.prototype.ySetter=
function(e){this.ySetting=this.y=Math.round(e);this.attr("translateY",this.ySetting)};e.emptyBBox={width:0,height:0,x:0,y:0};e.textProps="color cursor direction fontFamily fontSize fontStyle fontWeight lineHeight textAlign textDecoration textOutline textOverflow width".split(" ");return e}(f)});N(m,"Core/Renderer/SVG/SVGRenderer.js",[m["Core/Color/Color.js"],m["Core/Globals.js"],m["Core/Renderer/SVG/SVGElement.js"],m["Core/Renderer/SVG/SVGLabel.js"],m["Core/Utilities.js"]],function(f,h,m,z,F){var P=
F.addEvent,K=F.attr,C=F.createElement,y=F.css,e=F.defined,I=F.destroyObjectProperties,v=F.extend,x=F.isArray,D=F.isNumber,n=F.isObject,l=F.isString,J=F.merge,w=F.objectEach,r=F.pick,d=F.pInt,g=F.splat,c=F.uniqueKey,a=h.charts,q=h.deg2rad,p=h.doc,B=h.isFirefox,A=h.isMS,G=h.isWebKit;F=h.noop;var M=h.svg,T=h.SVG_NS,Q=h.symbolSizes,O=h.win,E=function(){function u(b,k,a,c,d,g,p){this.width=this.url=this.style=this.isSVG=this.imgCount=this.height=this.gradients=this.globalAnimation=this.defs=this.chartIndex=
this.cacheKeys=this.cache=this.boxWrapper=this.box=this.alignedObjects=void 0;this.init(b,k,a,c,d,g,p)}u.prototype.init=function(b,k,a,c,d,g,q){var t=this.createElement("svg").attr({version:"1.1","class":"highcharts-root"});q||t.css(this.getStyle(c));c=t.element;b.appendChild(c);K(b,"dir","ltr");-1===b.innerHTML.indexOf("xmlns")&&K(c,"xmlns",this.SVG_NS);this.isSVG=!0;this.box=c;this.boxWrapper=t;this.alignedObjects=[];this.url=(B||G)&&p.getElementsByTagName("base").length?O.location.href.split("#")[0].replace(/<[^>]*>/g,
"").replace(/([\('\)])/g,"\\$1").replace(/ /g,"%20"):"";this.createElement("desc").add().element.appendChild(p.createTextNode("Created with Highcharts 8.2.2"));this.defs=this.createElement("defs").add();this.allowHTML=g;this.forExport=d;this.styledMode=q;this.gradients={};this.cache={};this.cacheKeys=[];this.imgCount=0;this.setSize(k,a,!1);var H;B&&b.getBoundingClientRect&&(k=function(){y(b,{left:0,top:0});H=b.getBoundingClientRect();y(b,{left:Math.ceil(H.left)-H.left+"px",top:Math.ceil(H.top)-H.top+
"px"})},k(),this.unSubPixelFix=P(O,"resize",k))};u.prototype.definition=function(b){function k(b,t){var c;g(b).forEach(function(b){var d=a.createElement(b.tagName),g={};w(b,function(b,k){"tagName"!==k&&"children"!==k&&"textContent"!==k&&(g[k]=b)});d.attr(g);d.add(t||a.defs);b.textContent&&d.element.appendChild(p.createTextNode(b.textContent));k(b.children||[],d);c=d});return c}var a=this;return k(b)};u.prototype.getStyle=function(b){return this.style=v({fontFamily:'"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
fontSize:"12px"},b)};u.prototype.setStyle=function(b){this.boxWrapper.css(this.getStyle(b))};u.prototype.isHidden=function(){return!this.boxWrapper.getBBox().width};u.prototype.destroy=function(){var b=this.defs;this.box=null;this.boxWrapper=this.boxWrapper.destroy();I(this.gradients||{});this.gradients=null;b&&(this.defs=b.destroy());this.unSubPixelFix&&this.unSubPixelFix();return this.alignedObjects=null};u.prototype.createElement=function(b){var k=new this.Element;k.init(this,b);return k};u.prototype.getRadialAttr=
function(b,k){return{cx:b[0]-b[2]/2+k.cx*b[2],cy:b[1]-b[2]/2+k.cy*b[2],r:k.r*b[2]}};u.prototype.truncate=function(b,k,a,c,d,g,q){var t=this,H=b.rotation,R,u=c?1:0,A=(a||c).length,r=A,B=[],n=function(b){k.firstChild&&k.removeChild(k.firstChild);b&&k.appendChild(p.createTextNode(b))},l=function(g,p){p=p||g;if("undefined"===typeof B[p])if(k.getSubStringLength)try{B[p]=d+k.getSubStringLength(0,c?p+1:p)}catch(ja){""}else t.getSpanWidth&&(n(q(a||c,g)),B[p]=d+t.getSpanWidth(b,k));return B[p]},e;b.rotation=
0;var w=l(k.textContent.length);if(e=d+w>g){for(;u<=A;)r=Math.ceil((u+A)/2),c&&(R=q(c,r)),w=l(r,R&&R.length-1),u===A?u=A+1:w>g?A=r-1:u=r;0===A?n(""):a&&A===a.length-1||n(R||q(a||c,r))}c&&c.splice(0,r);b.actualWidth=w;b.rotation=H;return e};u.prototype.buildText=function(b){var k=b.element,a=this,c=a.forExport,g=r(b.textStr,"").toString(),q=-1!==g.indexOf("<"),u=k.childNodes,A,B=K(k,"x"),n=b.styles,e=b.textWidth,G=n&&n.lineHeight,f=n&&n.textOutline,V=n&&"ellipsis"===n.textOverflow,E=n&&"nowrap"===
n.whiteSpace,h=n&&n.fontSize,v,D=u.length;n=e&&!b.added&&this.box;var O=function(b){var t;a.styledMode||(t=/(px|em)$/.test(b&&b.style.fontSize)?b.style.fontSize:h||a.style.fontSize||12);return G?d(G):a.fontMetrics(t,b.getAttribute("style")?b:k).h},J=function(b,k){w(a.escapes,function(a,t){k&&-1!==k.indexOf(a)||(b=b.toString().replace(new RegExp(a,"g"),t))});return b},x=function(b,k){var a=b.indexOf("<");b=b.substring(a,b.indexOf(">")-a);a=b.indexOf(k+"=");if(-1!==a&&(a=a+k.length+1,k=b.charAt(a),
'"'===k||"'"===k))return b=b.substring(a+1),b.substring(0,b.indexOf(k))},I=/<br.*?>/g;var m=[g,V,E,G,f,h,e].join();if(m!==b.textCache){for(b.textCache=m;D--;)k.removeChild(u[D]);q||f||V||e||-1!==g.indexOf(" ")&&(!E||I.test(g))?(n&&n.appendChild(k),q?(g=a.styledMode?g.replace(/<(b|strong)>/g,'<span class="highcharts-strong">').replace(/<(i|em)>/g,'<span class="highcharts-emphasized">'):g.replace(/<(b|strong)>/g,'<span style="font-weight:bold">').replace(/<(i|em)>/g,'<span style="font-style:italic">'),
g=g.replace(/<a/g,"<span").replace(/<\/(b|strong|i|em|a)>/g,"</span>").split(I)):g=[g],g=g.filter(function(b){return""!==b}),g.forEach(function(t,d){var g=0,H=0;t=t.replace(/^\s+|\s+$/g,"").replace(/<span/g,"|||<span").replace(/<\/span>/g,"</span>|||");var q=t.split("|||");q.forEach(function(t){if(""!==t||1===q.length){var R={},u=p.createElementNS(a.SVG_NS,"tspan"),n,r;(n=x(t,"class"))&&K(u,"class",n);if(n=x(t,"style"))n=n.replace(/(;| |^)color([ :])/,"$1fill$2"),K(u,"style",n);if((r=x(t,"href"))&&
!c&&-1===r.split(":")[0].toLowerCase().indexOf("javascript")){var l=p.createElementNS(a.SVG_NS,"a");K(l,"href",r);K(u,"class","highcharts-anchor");l.appendChild(u);a.styledMode||y(u,{cursor:"pointer"})}t=J(t.replace(/<[a-zA-Z\/](.|\n)*?>/g,"")||" ");if(" "!==t){u.appendChild(p.createTextNode(t));g?R.dx=0:d&&null!==B&&(R.x=B);K(u,R);k.appendChild(l||u);!g&&v&&(!M&&c&&y(u,{display:"block"}),K(u,"dy",O(u)));if(e){var w=t.replace(/([^\^])-/g,"$1- ").split(" ");R=!E&&(1<q.length||d||1<w.length);l=0;r=
O(u);if(V)A=a.truncate(b,u,t,void 0,0,Math.max(0,e-parseInt(h||12,10)),function(b,k){return b.substring(0,k)+"\u2026"});else if(R)for(;w.length;)w.length&&!E&&0<l&&(u=p.createElementNS(T,"tspan"),K(u,{dy:r,x:B}),n&&K(u,"style",n),u.appendChild(p.createTextNode(w.join(" ").replace(/- /g,"-"))),k.appendChild(u)),a.truncate(b,u,null,w,0===l?H:0,e,function(b,k){return w.slice(0,k).join(" ").replace(/- /g,"-")}),H=b.actualWidth,l++}g++}}});v=v||k.childNodes.length}),V&&A&&b.attr("title",J(b.textStr||"",
["&lt;","&gt;"])),n&&n.removeChild(k),l(f)&&b.applyTextOutline&&b.applyTextOutline(f)):k.appendChild(p.createTextNode(J(g)))}};u.prototype.getContrast=function(b){b=f.parse(b).rgba;b[0]*=1;b[1]*=1.2;b[2]*=.5;return 459<b[0]+b[1]+b[2]?"#000000":"#FFFFFF"};u.prototype.button=function(b,k,a,c,d,g,p,q,u,n){var t=this.label(b,k,a,u,void 0,void 0,n,void 0,"button"),H=0,R=this.styledMode;b=(d=d?J(d):d)&&d.style||{};d&&d.style&&delete d.style;t.attr(J({padding:8,r:2},d));if(!R){d=J({fill:"#f7f7f7",stroke:"#cccccc",
"stroke-width":1,style:{color:"#333333",cursor:"pointer",fontWeight:"normal"}},{style:b},d);var r=d.style;delete d.style;g=J(d,{fill:"#e6e6e6"},g);var B=g.style;delete g.style;p=J(d,{fill:"#e6ebf5",style:{color:"#000000",fontWeight:"bold"}},p);var l=p.style;delete p.style;q=J(d,{style:{color:"#cccccc"}},q);var e=q.style;delete q.style}P(t.element,A?"mouseover":"mouseenter",function(){3!==H&&t.setState(1)});P(t.element,A?"mouseout":"mouseleave",function(){3!==H&&t.setState(H)});t.setState=function(b){1!==
b&&(t.state=H=b);t.removeClass(/highcharts-button-(normal|hover|pressed|disabled)/).addClass("highcharts-button-"+["normal","hover","pressed","disabled"][b||0]);R||t.attr([d,g,p,q][b||0]).css([r,B,l,e][b||0])};R||t.attr(d).css(v({cursor:"default"},r));return t.on("click",function(b){3!==H&&c.call(t,b)})};u.prototype.crispLine=function(b,k,a){void 0===a&&(a="round");var t=b[0],c=b[1];t[1]===c[1]&&(t[1]=c[1]=Math[a](t[1])-k%2/2);t[2]===c[2]&&(t[2]=c[2]=Math[a](t[2])+k%2/2);return b};u.prototype.path=
function(b){var k=this.styledMode?{}:{fill:"none"};x(b)?k.d=b:n(b)&&v(k,b);return this.createElement("path").attr(k)};u.prototype.circle=function(b,k,a){b=n(b)?b:"undefined"===typeof b?{}:{x:b,y:k,r:a};k=this.createElement("circle");k.xSetter=k.ySetter=function(b,k,a){a.setAttribute("c"+k,b)};return k.attr(b)};u.prototype.arc=function(b,k,a,c,d,g){n(b)?(c=b,k=c.y,a=c.r,b=c.x):c={innerR:c,start:d,end:g};b=this.symbol("arc",b,k,a,a,c);b.r=a;return b};u.prototype.rect=function(b,k,a,c,d,g){d=n(b)?b.r:
d;var t=this.createElement("rect");b=n(b)?b:"undefined"===typeof b?{}:{x:b,y:k,width:Math.max(a,0),height:Math.max(c,0)};this.styledMode||("undefined"!==typeof g&&(b.strokeWidth=g,b=t.crisp(b)),b.fill="none");d&&(b.r=d);t.rSetter=function(b,k,a){t.r=b;K(a,{rx:b,ry:b})};t.rGetter=function(){return t.r};return t.attr(b)};u.prototype.setSize=function(b,k,a){var t=this.alignedObjects,c=t.length;this.width=b;this.height=k;for(this.boxWrapper.animate({width:b,height:k},{step:function(){this.attr({viewBox:"0 0 "+
this.attr("width")+" "+this.attr("height")})},duration:r(a,!0)?void 0:0});c--;)t[c].align()};u.prototype.g=function(b){var k=this.createElement("g");return b?k.attr({"class":"highcharts-"+b}):k};u.prototype.image=function(b,k,a,c,d,g){var t={preserveAspectRatio:"none"},p=function(b,k){b.setAttributeNS?b.setAttributeNS("http://www.w3.org/1999/xlink","href",k):b.setAttribute("hc-svg-href",k)},q=function(k){p(H.element,b);g.call(H,k)};1<arguments.length&&v(t,{x:k,y:a,width:c,height:d});var H=this.createElement("image").attr(t);
g?(p(H.element,"data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="),t=new O.Image,P(t,"load",q),t.src=b,t.complete&&q({})):p(H.element,b);return H};u.prototype.symbol=function(b,k,t,c,d,g){var q=this,H=/^url\((.*?)\)$/,u=H.test(b),R=!u&&(this.symbols[b]?b:"circle"),n=R&&this.symbols[R],A;if(n){"number"===typeof k&&(A=n.call(this.symbols,Math.round(k||0),Math.round(t||0),c||0,d||0,g));var B=this.path(A);q.styledMode||B.attr("fill","none");v(B,{symbolName:R,x:k,y:t,width:c,
height:d});g&&v(B,g)}else if(u){var l=b.match(H)[1];B=this.image(l);B.imgwidth=r(Q[l]&&Q[l].width,g&&g.width);B.imgheight=r(Q[l]&&Q[l].height,g&&g.height);var w=function(){B.attr({width:B.width,height:B.height})};["width","height"].forEach(function(b){B[b+"Setter"]=function(b,k){var a={},t=this["img"+k],c="width"===k?"translateX":"translateY";this[k]=b;e(t)&&(g&&"within"===g.backgroundSize&&this.width&&this.height&&(t=Math.round(t*Math.min(this.width/this.imgwidth,this.height/this.imgheight))),this.element&&
this.element.setAttribute(k,t),this.alignByTranslate||(a[c]=((this[k]||0)-t)/2,this.attr(a)))}});e(k)&&B.attr({x:k,y:t});B.isImg=!0;e(B.imgwidth)&&e(B.imgheight)?w():(B.attr({width:0,height:0}),C("img",{onload:function(){var b=a[q.chartIndex];0===this.width&&(y(this,{position:"absolute",top:"-999em"}),p.body.appendChild(this));Q[l]={width:this.width,height:this.height};B.imgwidth=this.width;B.imgheight=this.height;B.element&&w();this.parentNode&&this.parentNode.removeChild(this);q.imgCount--;if(!q.imgCount&&
b&&!b.hasLoaded)b.onload()},src:l}),this.imgCount++)}return B};u.prototype.clipRect=function(b,k,a,d){var t=c()+"-",g=this.createElement("clipPath").attr({id:t}).add(this.defs);b=this.rect(b,k,a,d,0).add(g);b.id=t;b.clipPath=g;b.count=0;return b};u.prototype.text=function(b,k,a,c){var t={};if(c&&(this.allowHTML||!this.forExport))return this.html(b,k,a);t.x=Math.round(k||0);a&&(t.y=Math.round(a));e(b)&&(t.text=b);b=this.createElement("text").attr(t);c||(b.xSetter=function(b,k,a){var t=a.getElementsByTagName("tspan"),
c=a.getAttribute(k),d;for(d=0;d<t.length;d++){var g=t[d];g.getAttribute(k)===c&&g.setAttribute(k,b)}a.setAttribute(k,b)});return b};u.prototype.fontMetrics=function(b,k){b=!this.styledMode&&/px/.test(b)||!O.getComputedStyle?b||k&&k.style&&k.style.fontSize||this.style&&this.style.fontSize:k&&m.prototype.getStyle.call(k,"font-size");b=/px/.test(b)?d(b):12;k=24>b?b+3:Math.round(1.2*b);return{h:k,b:Math.round(.8*k),f:b}};u.prototype.rotCorr=function(b,k,a){var t=b;k&&a&&(t=Math.max(t*Math.cos(k*q),4));
return{x:-b/3*Math.sin(k*q),y:t}};u.prototype.pathToSegments=function(b){for(var k=[],a=[],c={A:8,C:7,H:2,L:3,M:3,Q:5,S:5,T:3,V:2},d=0;d<b.length;d++)l(a[0])&&D(b[d])&&a.length===c[a[0].toUpperCase()]&&b.splice(d,0,a[0].replace("M","L").replace("m","l")),"string"===typeof b[d]&&(a.length&&k.push(a.slice(0)),a.length=0),a.push(b[d]);k.push(a.slice(0));return k};u.prototype.label=function(b,k,a,c,d,g,p,q,u){return new z(this,b,k,a,c,d,g,p,q,u)};return u}();E.prototype.Element=m;E.prototype.SVG_NS=T;
E.prototype.draw=F;E.prototype.escapes={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"};E.prototype.symbols={circle:function(a,b,k,t){return this.arc(a+k/2,b+t/2,k/2,t/2,{start:.5*Math.PI,end:2.5*Math.PI,open:!1})},square:function(a,b,k,t){return[["M",a,b],["L",a+k,b],["L",a+k,b+t],["L",a,b+t],["Z"]]},triangle:function(a,b,k,t){return[["M",a+k/2,b],["L",a+k,b+t],["L",a,b+t],["Z"]]},"triangle-down":function(a,b,k,t){return[["M",a,b],["L",a+k,b],["L",a+k/2,b+t],["Z"]]},diamond:function(a,
b,k,t){return[["M",a+k/2,b],["L",a+k,b+t/2],["L",a+k/2,b+t],["L",a,b+t/2],["Z"]]},arc:function(a,b,k,t,c){var d=[];if(c){var g=c.start||0,p=c.end||0,q=c.r||k;k=c.r||t||k;var H=.001>Math.abs(p-g-2*Math.PI);p-=.001;t=c.innerR;H=r(c.open,H);var u=Math.cos(g),B=Math.sin(g),n=Math.cos(p),A=Math.sin(p);g=r(c.longArc,.001>p-g-Math.PI?0:1);d.push(["M",a+q*u,b+k*B],["A",q,k,0,g,r(c.clockwise,1),a+q*n,b+k*A]);e(t)&&d.push(H?["M",a+t*n,b+t*A]:["L",a+t*n,b+t*A],["A",t,t,0,g,e(c.clockwise)?1-c.clockwise:0,a+t*
u,b+t*B]);H||d.push(["Z"])}return d},callout:function(a,b,k,t,c){var d=Math.min(c&&c.r||0,k,t),g=d+6,p=c&&c.anchorX||0;c=c&&c.anchorY||0;var q=[["M",a+d,b],["L",a+k-d,b],["C",a+k,b,a+k,b,a+k,b+d],["L",a+k,b+t-d],["C",a+k,b+t,a+k,b+t,a+k-d,b+t],["L",a+d,b+t],["C",a,b+t,a,b+t,a,b+t-d],["L",a,b+d],["C",a,b,a,b,a+d,b]];p&&p>k?c>b+g&&c<b+t-g?q.splice(3,1,["L",a+k,c-6],["L",a+k+6,c],["L",a+k,c+6],["L",a+k,b+t-d]):q.splice(3,1,["L",a+k,t/2],["L",p,c],["L",a+k,t/2],["L",a+k,b+t-d]):p&&0>p?c>b+g&&c<b+t-g?
q.splice(7,1,["L",a,c+6],["L",a-6,c],["L",a,c-6],["L",a,b+d]):q.splice(7,1,["L",a,t/2],["L",p,c],["L",a,t/2],["L",a,b+d]):c&&c>t&&p>a+g&&p<a+k-g?q.splice(5,1,["L",p+6,b+t],["L",p,b+t+6],["L",p-6,b+t],["L",a+d,b+t]):c&&0>c&&p>a+g&&p<a+k-g&&q.splice(1,1,["L",p-6,b],["L",p,b-6],["L",p+6,b],["L",k-d,b]);return q}};h.SVGRenderer=E;h.Renderer=h.SVGRenderer;return h.Renderer});N(m,"Core/Renderer/HTML/HTMLElement.js",[m["Core/Globals.js"],m["Core/Renderer/SVG/SVGElement.js"],m["Core/Utilities.js"]],function(f,
h,m){var z=m.css,F=m.defined,P=m.extend,K=m.pick,C=m.pInt,y=f.isFirefox;P(h.prototype,{htmlCss:function(e){var f="SPAN"===this.element.tagName&&e&&"width"in e,h=K(f&&e.width,void 0);if(f){delete e.width;this.textWidth=h;var x=!0}e&&"ellipsis"===e.textOverflow&&(e.whiteSpace="nowrap",e.overflow="hidden");this.styles=P(this.styles,e);z(this.element,e);x&&this.htmlUpdateTransform();return this},htmlGetBBox:function(){var e=this.element;return{x:e.offsetLeft,y:e.offsetTop,width:e.offsetWidth,height:e.offsetHeight}},
htmlUpdateTransform:function(){if(this.added){var e=this.renderer,f=this.element,h=this.translateX||0,x=this.translateY||0,D=this.x||0,n=this.y||0,l=this.textAlign||"left",J={left:0,center:.5,right:1}[l],w=this.styles,r=w&&w.whiteSpace;z(f,{marginLeft:h,marginTop:x});!e.styledMode&&this.shadows&&this.shadows.forEach(function(a){z(a,{marginLeft:h+1,marginTop:x+1})});this.inverted&&[].forEach.call(f.childNodes,function(a){e.invertChild(a,f)});if("SPAN"===f.tagName){w=this.rotation;var d=this.textWidth&&
C(this.textWidth),g=[w,l,f.innerHTML,this.textWidth,this.textAlign].join(),c;(c=d!==this.oldTextWidth)&&!(c=d>this.oldTextWidth)&&((c=this.textPxLength)||(z(f,{width:"",whiteSpace:r||"nowrap"}),c=f.offsetWidth),c=c>d);c&&(/[ \-]/.test(f.textContent||f.innerText)||"ellipsis"===f.style.textOverflow)?(z(f,{width:d+"px",display:"block",whiteSpace:r||"normal"}),this.oldTextWidth=d,this.hasBoxWidthChanged=!0):this.hasBoxWidthChanged=!1;g!==this.cTT&&(r=e.fontMetrics(f.style.fontSize,f).b,!F(w)||w===(this.oldRotation||
0)&&l===this.oldAlign||this.setSpanRotation(w,J,r),this.getSpanCorrection(!F(w)&&this.textPxLength||f.offsetWidth,r,J,w,l));z(f,{left:D+(this.xCorr||0)+"px",top:n+(this.yCorr||0)+"px"});this.cTT=g;this.oldRotation=w;this.oldAlign=l}}else this.alignOnAdd=!0},setSpanRotation:function(e,f,h){var v={},D=this.renderer.getTransformKey();v[D]=v.transform="rotate("+e+"deg)";v[D+(y?"Origin":"-origin")]=v.transformOrigin=100*f+"% "+h+"px";z(this.element,v)},getSpanCorrection:function(e,f,h){this.xCorr=-e*h;
this.yCorr=-f}});return h});N(m,"Core/Renderer/HTML/HTMLRenderer.js",[m["Core/Globals.js"],m["Core/Renderer/SVG/SVGElement.js"],m["Core/Renderer/SVG/SVGRenderer.js"],m["Core/Utilities.js"]],function(f,h,m,z){var F=f.isFirefox,P=f.isMS,K=f.isWebKit,C=f.win,y=z.attr,e=z.createElement,I=z.extend,v=z.pick;I(m.prototype,{getTransformKey:function(){return P&&!/Edge/.test(C.navigator.userAgent)?"-ms-transform":K?"-webkit-transform":F?"MozTransform":C.opera?"-o-transform":""},html:function(f,D,n){var l=this.createElement("span"),
J=l.element,w=l.renderer,r=w.isSVG,d=function(d,c){["opacity","visibility"].forEach(function(a){d[a+"Setter"]=function(g,p,B){var q=d.div?d.div.style:c;h.prototype[a+"Setter"].call(this,g,p,B);q&&(q[p]=g)}});d.addedSetters=!0};l.textSetter=function(d){d!==J.innerHTML&&(delete this.bBox,delete this.oldTextWidth);this.textStr=d;J.innerHTML=v(d,"");l.doTransform=!0};r&&d(l,l.element.style);l.xSetter=l.ySetter=l.alignSetter=l.rotationSetter=function(d,c){"align"===c?l.alignValue=l.textAlign=d:l[c]=d;
l.doTransform=!0};l.afterSetters=function(){this.doTransform&&(this.htmlUpdateTransform(),this.doTransform=!1)};l.attr({text:f,x:Math.round(D),y:Math.round(n)}).css({position:"absolute"});w.styledMode||l.css({fontFamily:this.style.fontFamily,fontSize:this.style.fontSize});J.style.whiteSpace="nowrap";l.css=l.htmlCss;r&&(l.add=function(g){var c=w.box.parentNode,a=[];if(this.parentGroup=g){var q=g.div;if(!q){for(;g;)a.push(g),g=g.parentGroup;a.reverse().forEach(function(g){function p(a,c){g[c]=a;"translateX"===
c?r.left=a+"px":r.top=a+"px";g.doTransform=!0}var n=y(g.element,"class");q=g.div=g.div||e("div",n?{className:n}:void 0,{position:"absolute",left:(g.translateX||0)+"px",top:(g.translateY||0)+"px",display:g.display,opacity:g.opacity,pointerEvents:g.styles&&g.styles.pointerEvents},q||c);var r=q.style;I(g,{classSetter:function(a){return function(c){this.element.setAttribute("class",c);a.className=c}}(q),on:function(){a[0].div&&l.on.apply({element:a[0].div},arguments);return g},translateXSetter:p,translateYSetter:p});
g.addedSetters||d(g)})}}else q=c;q.appendChild(J);l.added=!0;l.alignOnAdd&&l.htmlUpdateTransform();return l});return l}});return m});N(m,"Core/Axis/Tick.js",[m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h){var m=h.clamp,z=h.correctFloat,F=h.defined,L=h.destroyObjectProperties,K=h.extend,C=h.fireEvent,y=h.isNumber,e=h.merge,I=h.objectEach,v=h.pick,x=f.deg2rad;h=function(){function f(n,l,e,w,r){this.isNewLabel=this.isNew=!0;this.axis=n;this.pos=l;this.type=e||"";this.parameters=r||{};this.tickmarkOffset=
this.parameters.tickmarkOffset;this.options=this.parameters.options;C(this,"init");e||w||this.addLabel()}f.prototype.addLabel=function(){var n=this,l=n.axis,e=l.options,w=l.chart,r=l.categories,d=l.logarithmic,g=l.names,c=n.pos,a=v(n.options&&n.options.labels,e.labels),q=l.tickPositions,p=c===q[0],B=c===q[q.length-1];g=this.parameters.category||(r?v(r[c],g[c],c):c);var A=n.label;r=(!a.step||1===a.step)&&1===l.tickInterval;q=q.info;var f,h;if(l.dateTime&&q){var D=w.time.resolveDTLFormat(e.dateTimeLabelFormats[!e.grid&&
q.higherRanks[c]||q.unitName]);var x=D.main}n.isFirst=p;n.isLast=B;n.formatCtx={axis:l,chart:w,isFirst:p,isLast:B,dateTimeLabelFormat:x,tickPositionInfo:q,value:d?z(d.lin2log(g)):g,pos:c};e=l.labelFormatter.call(n.formatCtx,this.formatCtx);if(h=D&&D.list)n.shortenLabel=function(){for(f=0;f<h.length;f++)if(A.attr({text:l.labelFormatter.call(K(n.formatCtx,{dateTimeLabelFormat:h[f]}))}),A.getBBox().width<l.getSlotWidth(n)-2*v(a.padding,5))return;A.attr({text:""})};r&&l._addedPlotLB&&n.moveLabel(e,a);
F(A)||n.movedLabel?A&&A.textStr!==e&&!r&&(!A.textWidth||a.style&&a.style.width||A.styles.width||A.css({width:null}),A.attr({text:e}),A.textPxLength=A.getBBox().width):(n.label=A=n.createLabel({x:0,y:0},e,a),n.rotation=0)};f.prototype.createLabel=function(n,l,f){var w=this.axis,r=w.chart;if(n=F(l)&&f.enabled?r.renderer.text(l,n.x,n.y,f.useHTML).add(w.labelGroup):null)r.styledMode||n.css(e(f.style)),n.textPxLength=n.getBBox().width;return n};f.prototype.destroy=function(){L(this,this.axis)};f.prototype.getPosition=
function(n,l,e,w){var r=this.axis,d=r.chart,g=w&&d.oldChartHeight||d.chartHeight;n={x:n?z(r.translate(l+e,null,null,w)+r.transB):r.left+r.offset+(r.opposite?(w&&d.oldChartWidth||d.chartWidth)-r.right-r.left:0),y:n?g-r.bottom+r.offset-(r.opposite?r.height:0):z(g-r.translate(l+e,null,null,w)-r.transB)};n.y=m(n.y,-1E5,1E5);C(this,"afterGetPosition",{pos:n});return n};f.prototype.getLabelPosition=function(n,l,e,w,r,d,g,c){var a=this.axis,q=a.transA,p=a.isLinked&&a.linkedParent?a.linkedParent.reversed:
a.reversed,B=a.staggerLines,A=a.tickRotCorr||{x:0,y:0},f=r.y,h=w||a.reserveSpaceDefault?0:-a.labelOffset*("center"===a.labelAlign?.5:1),v={};F(f)||(f=0===a.side?e.rotation?-8:-e.getBBox().height:2===a.side?A.y+8:Math.cos(e.rotation*x)*(A.y-e.getBBox(!1,0).height/2));n=n+r.x+h+A.x-(d&&w?d*q*(p?-1:1):0);l=l+f-(d&&!w?d*q*(p?1:-1):0);B&&(e=g/(c||1)%B,a.opposite&&(e=B-e-1),l+=a.labelOffset/B*e);v.x=n;v.y=Math.round(l);C(this,"afterGetLabelPosition",{pos:v,tickmarkOffset:d,index:g});return v};f.prototype.getLabelSize=
function(){return this.label?this.label.getBBox()[this.axis.horiz?"height":"width"]:0};f.prototype.getMarkPath=function(n,e,f,w,r,d){return d.crispLine([["M",n,e],["L",n+(r?0:-f),e+(r?f:0)]],w)};f.prototype.handleOverflow=function(n){var e=this.axis,f=e.options.labels,w=n.x,r=e.chart.chartWidth,d=e.chart.spacing,g=v(e.labelLeft,Math.min(e.pos,d[3]));d=v(e.labelRight,Math.max(e.isRadial?0:e.pos+e.len,r-d[1]));var c=this.label,a=this.rotation,q={left:0,center:.5,right:1}[e.labelAlign||c.attr("align")],
p=c.getBBox().width,B=e.getSlotWidth(this),A=B,G=1,h,D={};if(a||"justify"!==v(f.overflow,"justify"))0>a&&w-q*p<g?h=Math.round(w/Math.cos(a*x)-g):0<a&&w+q*p>d&&(h=Math.round((r-w)/Math.cos(a*x)));else if(r=w+(1-q)*p,w-q*p<g?A=n.x+A*(1-q)-g:r>d&&(A=d-n.x+A*q,G=-1),A=Math.min(B,A),A<B&&"center"===e.labelAlign&&(n.x+=G*(B-A-q*(B-Math.min(p,A)))),p>A||e.autoRotation&&(c.styles||{}).width)h=A;h&&(this.shortenLabel?this.shortenLabel():(D.width=Math.floor(h)+"px",(f.style||{}).textOverflow||(D.textOverflow=
"ellipsis"),c.css(D)))};f.prototype.moveLabel=function(n,e){var l=this,w=l.label,r=!1,d=l.axis,g=d.reversed;w&&w.textStr===n?(l.movedLabel=w,r=!0,delete l.label):I(d.ticks,function(a){r||a.isNew||a===l||!a.label||a.label.textStr!==n||(l.movedLabel=a.label,r=!0,a.labelPos=l.movedLabel.xy,delete a.label)});if(!r&&(l.labelPos||w)){var c=l.labelPos||w.xy;w=d.horiz?g?0:d.width+d.left:c.x;d=d.horiz?c.y:g?d.width+d.left:0;l.movedLabel=l.createLabel({x:w,y:d},n,e);l.movedLabel&&l.movedLabel.attr({opacity:0})}};
f.prototype.render=function(e,l,f){var n=this.axis,r=n.horiz,d=this.pos,g=v(this.tickmarkOffset,n.tickmarkOffset);d=this.getPosition(r,d,g,l);g=d.x;var c=d.y;n=r&&g===n.pos+n.len||!r&&c===n.pos?-1:1;f=v(f,1);this.isActive=!0;this.renderGridLine(l,f,n);this.renderMark(d,f,n);this.renderLabel(d,l,f,e);this.isNew=!1;C(this,"afterRender")};f.prototype.renderGridLine=function(n,e,f){var l=this.axis,r=l.options,d=this.gridLine,g={},c=this.pos,a=this.type,q=v(this.tickmarkOffset,l.tickmarkOffset),p=l.chart.renderer,
B=a?a+"Grid":"grid",A=r[B+"LineWidth"],G=r[B+"LineColor"];r=r[B+"LineDashStyle"];d||(l.chart.styledMode||(g.stroke=G,g["stroke-width"]=A,r&&(g.dashstyle=r)),a||(g.zIndex=1),n&&(e=0),this.gridLine=d=p.path().attr(g).addClass("highcharts-"+(a?a+"-":"")+"grid-line").add(l.gridGroup));if(d&&(f=l.getPlotLinePath({value:c+q,lineWidth:d.strokeWidth()*f,force:"pass",old:n})))d[n||this.isNew?"attr":"animate"]({d:f,opacity:e})};f.prototype.renderMark=function(n,e,f){var l=this.axis,r=l.options,d=l.chart.renderer,
g=this.type,c=g?g+"Tick":"tick",a=l.tickSize(c),q=this.mark,p=!q,B=n.x;n=n.y;var A=v(r[c+"Width"],!g&&l.isXAxis?1:0);r=r[c+"Color"];a&&(l.opposite&&(a[0]=-a[0]),p&&(this.mark=q=d.path().addClass("highcharts-"+(g?g+"-":"")+"tick").add(l.axisGroup),l.chart.styledMode||q.attr({stroke:r,"stroke-width":A})),q[p?"attr":"animate"]({d:this.getMarkPath(B,n,a[0],q.strokeWidth()*f,l.horiz,d),opacity:e}))};f.prototype.renderLabel=function(e,l,f,w){var n=this.axis,d=n.horiz,g=n.options,c=this.label,a=g.labels,
q=a.step;n=v(this.tickmarkOffset,n.tickmarkOffset);var p=!0,B=e.x;e=e.y;c&&y(B)&&(c.xy=e=this.getLabelPosition(B,e,c,d,a,n,w,q),this.isFirst&&!this.isLast&&!v(g.showFirstLabel,1)||this.isLast&&!this.isFirst&&!v(g.showLastLabel,1)?p=!1:!d||a.step||a.rotation||l||0===f||this.handleOverflow(e),q&&w%q&&(p=!1),p&&y(e.y)?(e.opacity=f,c[this.isNewLabel?"attr":"animate"](e),this.isNewLabel=!1):(c.attr("y",-9999),this.isNewLabel=!0))};f.prototype.replaceMovedLabel=function(){var e=this.label,l=this.axis,f=
l.reversed;if(e&&!this.isNew){var w=l.horiz?f?l.left:l.width+l.left:e.xy.x;f=l.horiz?e.xy.y:f?l.width+l.top:l.top;e.animate({x:w,y:f,opacity:0},void 0,e.destroy);delete this.label}l.isDirty=!0;this.label=this.movedLabel;delete this.movedLabel};return f}();f.Tick=h;return f.Tick});N(m,"Core/Time.js",[m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h){var m=h.defined,z=h.error,F=h.extend,L=h.isObject,K=h.merge,C=h.objectEach,y=h.pad,e=h.pick,I=h.splat,v=h.timeUnits,x=f.win;h=function(){function h(e){this.options=
{};this.variableTimezone=this.useUTC=!1;this.Date=x.Date;this.getTimezoneOffset=this.timezoneOffsetFunction();this.update(e)}h.prototype.get=function(e,l){if(this.variableTimezone||this.timezoneOffset){var n=l.getTime(),f=n-this.getTimezoneOffset(l);l.setTime(f);e=l["getUTC"+e]();l.setTime(n);return e}return this.useUTC?l["getUTC"+e]():l["get"+e]()};h.prototype.set=function(e,l,f){if(this.variableTimezone||this.timezoneOffset){if("Milliseconds"===e||"Seconds"===e||"Minutes"===e)return l["setUTC"+
e](f);var n=this.getTimezoneOffset(l);n=l.getTime()-n;l.setTime(n);l["setUTC"+e](f);e=this.getTimezoneOffset(l);n=l.getTime()+e;return l.setTime(n)}return this.useUTC?l["setUTC"+e](f):l["set"+e](f)};h.prototype.update=function(n){var l=e(n&&n.useUTC,!0);this.options=n=K(!0,this.options||{},n);this.Date=n.Date||x.Date||Date;this.timezoneOffset=(this.useUTC=l)&&n.timezoneOffset;this.getTimezoneOffset=this.timezoneOffsetFunction();this.variableTimezone=!(l&&!n.getTimezoneOffset&&!n.timezone)};h.prototype.makeTime=
function(n,l,h,w,r,d){if(this.useUTC){var g=this.Date.UTC.apply(0,arguments);var c=this.getTimezoneOffset(g);g+=c;var a=this.getTimezoneOffset(g);c!==a?g+=a-c:c-36E5!==this.getTimezoneOffset(g-36E5)||f.isSafari||(g-=36E5)}else g=(new this.Date(n,l,e(h,1),e(w,0),e(r,0),e(d,0))).getTime();return g};h.prototype.timezoneOffsetFunction=function(){var e=this,l=this.options,f=l.moment||x.moment;if(!this.useUTC)return function(e){return 6E4*(new Date(e.toString())).getTimezoneOffset()};if(l.timezone){if(f)return function(e){return 6E4*
-f.tz(e,l.timezone).utcOffset()};z(25)}return this.useUTC&&l.getTimezoneOffset?function(e){return 6E4*l.getTimezoneOffset(e.valueOf())}:function(){return 6E4*(e.timezoneOffset||0)}};h.prototype.dateFormat=function(n,l,h){var w;if(!m(l)||isNaN(l))return(null===(w=f.defaultOptions.lang)||void 0===w?void 0:w.invalidDate)||"";n=e(n,"%Y-%m-%d %H:%M:%S");var r=this;w=new this.Date(l);var d=this.get("Hours",w),g=this.get("Day",w),c=this.get("Date",w),a=this.get("Month",w),q=this.get("FullYear",w),p=f.defaultOptions.lang,
B=null===p||void 0===p?void 0:p.weekdays,A=null===p||void 0===p?void 0:p.shortWeekdays;w=F({a:A?A[g]:B[g].substr(0,3),A:B[g],d:y(c),e:y(c,2," "),w:g,b:p.shortMonths[a],B:p.months[a],m:y(a+1),o:a+1,y:q.toString().substr(2,2),Y:q,H:y(d),k:d,I:y(d%12||12),l:d%12||12,M:y(this.get("Minutes",w)),p:12>d?"AM":"PM",P:12>d?"am":"pm",S:y(w.getSeconds()),L:y(Math.floor(l%1E3),3)},f.dateFormats);C(w,function(a,c){for(;-1!==n.indexOf("%"+c);)n=n.replace("%"+c,"function"===typeof a?a.call(r,l):a)});return h?n.substr(0,
1).toUpperCase()+n.substr(1):n};h.prototype.resolveDTLFormat=function(e){return L(e,!0)?e:(e=I(e),{main:e[0],from:e[1],to:e[2]})};h.prototype.getTimeTicks=function(n,l,f,h){var r=this,d=[],g={};var c=new r.Date(l);var a=n.unitRange,q=n.count||1,p;h=e(h,1);if(m(l)){r.set("Milliseconds",c,a>=v.second?0:q*Math.floor(r.get("Milliseconds",c)/q));a>=v.second&&r.set("Seconds",c,a>=v.minute?0:q*Math.floor(r.get("Seconds",c)/q));a>=v.minute&&r.set("Minutes",c,a>=v.hour?0:q*Math.floor(r.get("Minutes",c)/q));
a>=v.hour&&r.set("Hours",c,a>=v.day?0:q*Math.floor(r.get("Hours",c)/q));a>=v.day&&r.set("Date",c,a>=v.month?1:Math.max(1,q*Math.floor(r.get("Date",c)/q)));if(a>=v.month){r.set("Month",c,a>=v.year?0:q*Math.floor(r.get("Month",c)/q));var B=r.get("FullYear",c)}a>=v.year&&r.set("FullYear",c,B-B%q);a===v.week&&(B=r.get("Day",c),r.set("Date",c,r.get("Date",c)-B+h+(B<h?-7:0)));B=r.get("FullYear",c);h=r.get("Month",c);var A=r.get("Date",c),w=r.get("Hours",c);l=c.getTime();r.variableTimezone&&(p=f-l>4*v.month||
r.getTimezoneOffset(l)!==r.getTimezoneOffset(f));l=c.getTime();for(c=1;l<f;)d.push(l),l=a===v.year?r.makeTime(B+c*q,0):a===v.month?r.makeTime(B,h+c*q):!p||a!==v.day&&a!==v.week?p&&a===v.hour&&1<q?r.makeTime(B,h,A,w+c*q):l+a*q:r.makeTime(B,h,A+c*q*(a===v.day?1:7)),c++;d.push(l);a<=v.hour&&1E4>d.length&&d.forEach(function(a){0===a%18E5&&"000000000"===r.dateFormat("%H%M%S%L",a)&&(g[a]="day")})}d.info=F(n,{higherRanks:g,totalRange:a*q});return d};return h}();f.Time=h;return f.Time});N(m,"Core/Options.js",
[m["Core/Globals.js"],m["Core/Color/Color.js"],m["Core/Time.js"],m["Core/Utilities.js"]],function(f,h,m,z){var F=f.isTouchDevice,P=f.svg;h=h.parse;z=z.merge;"";f.defaultOptions={colors:"#7cb5ec #434348 #90ed7d #f7a35c #8085e9 #f15c80 #e4d354 #2b908f #f45b5b #91e8e1".split(" "),symbols:["circle","diamond","square","triangle","triangle-down"],lang:{loading:"Loading...",months:"January February March April May June July August September October November December".split(" "),shortMonths:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
weekdays:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),decimalPoint:".",numericSymbols:"kMGTPE".split(""),resetZoom:"Reset zoom",resetZoomTitle:"Reset zoom level 1:1",thousandsSep:" "},global:{},time:{Date:void 0,getTimezoneOffset:void 0,timezone:void 0,timezoneOffset:0,useUTC:!0},chart:{styledMode:!1,borderRadius:0,colorCount:10,defaultSeriesType:"line",ignoreHiddenSeries:!0,spacing:[10,10,15,10],resetZoomButton:{theme:{zIndex:6},position:{align:"right",x:-10,y:10}},width:null,
height:null,borderColor:"#335cad",backgroundColor:"#ffffff",plotBorderColor:"#cccccc"},title:{text:"Chart title",align:"center",margin:15,widthAdjust:-44},subtitle:{text:"",align:"center",widthAdjust:-44},caption:{margin:15,text:"",align:"left",verticalAlign:"bottom"},plotOptions:{},labels:{style:{position:"absolute",color:"#333333"}},legend:{enabled:!0,align:"center",alignColumns:!0,layout:"horizontal",labelFormatter:function(){return this.name},borderColor:"#999999",borderRadius:0,navigation:{activeColor:"#003399",
inactiveColor:"#cccccc"},itemStyle:{color:"#333333",cursor:"pointer",fontSize:"12px",fontWeight:"bold",textOverflow:"ellipsis"},itemHoverStyle:{color:"#000000"},itemHiddenStyle:{color:"#cccccc"},shadow:!1,itemCheckboxStyle:{position:"absolute",width:"13px",height:"13px"},squareSymbol:!0,symbolPadding:5,verticalAlign:"bottom",x:0,y:0,title:{style:{fontWeight:"bold"}}},loading:{labelStyle:{fontWeight:"bold",position:"relative",top:"45%"},style:{position:"absolute",backgroundColor:"#ffffff",opacity:.5,
textAlign:"center"}},tooltip:{enabled:!0,animation:P,borderRadius:3,dateTimeLabelFormats:{millisecond:"%A, %b %e, %H:%M:%S.%L",second:"%A, %b %e, %H:%M:%S",minute:"%A, %b %e, %H:%M",hour:"%A, %b %e, %H:%M",day:"%A, %b %e, %Y",week:"Week from %A, %b %e, %Y",month:"%B %Y",year:"%Y"},footerFormat:"",padding:8,snap:F?25:10,headerFormat:'<span style="font-size: 10px">{point.key}</span><br/>',pointFormat:'<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.y}</b><br/>',backgroundColor:h("#f7f7f7").setOpacity(.85).get(),
borderWidth:1,shadow:!0,style:{color:"#333333",cursor:"default",fontSize:"12px",whiteSpace:"nowrap"}},credits:{enabled:!0,href:"https://www.highcharts.com?credits",position:{align:"right",x:-10,verticalAlign:"bottom",y:-5},style:{cursor:"pointer",color:"#999999",fontSize:"9px"},text:"Highcharts.com"}};"";f.time=new m(z(f.defaultOptions.global,f.defaultOptions.time));f.dateFormat=function(h,m,y){return f.time.dateFormat(h,m,y)};return{dateFormat:f.dateFormat,defaultOptions:f.defaultOptions,time:f.time}});
N(m,"Core/Axis/Axis.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Color/Color.js"],m["Core/Globals.js"],m["Core/Axis/Tick.js"],m["Core/Utilities.js"],m["Core/Options.js"]],function(f,h,m,z,F,L){var K=f.animObject,C=F.addEvent,y=F.arrayMax,e=F.arrayMin,I=F.clamp,v=F.correctFloat,x=F.defined,D=F.destroyObjectProperties,n=F.error,l=F.extend,J=F.fireEvent,w=F.format,r=F.getMagnitude,d=F.isArray,g=F.isFunction,c=F.isNumber,a=F.isString,q=F.merge,p=F.normalizeTickInterval,B=F.objectEach,A=F.pick,
G=F.relativeLength,M=F.removeEvent,T=F.splat,Q=F.syncTimeout,O=L.defaultOptions,E=m.deg2rad;f=function(){function u(b,k){this.zoomEnabled=this.width=this.visible=this.userOptions=this.translationSlope=this.transB=this.transA=this.top=this.ticks=this.tickRotCorr=this.tickPositions=this.tickmarkOffset=this.tickInterval=this.tickAmount=this.side=this.series=this.right=this.positiveValuesOnly=this.pos=this.pointRangePadding=this.pointRange=this.plotLinesAndBandsGroups=this.plotLinesAndBands=this.paddedTicks=
this.overlap=this.options=this.oldMin=this.oldMax=this.offset=this.names=this.minPixelPadding=this.minorTicks=this.minorTickInterval=this.min=this.maxLabelLength=this.max=this.len=this.left=this.labelFormatter=this.labelEdge=this.isLinked=this.height=this.hasVisibleSeries=this.hasNames=this.coll=this.closestPointRange=this.chart=this.categories=this.bottom=this.alternateBands=void 0;this.init(b,k)}u.prototype.init=function(b,k){var a=k.isX,c=this;c.chart=b;c.horiz=b.inverted&&!c.isZAxis?!a:a;c.isXAxis=
a;c.coll=c.coll||(a?"xAxis":"yAxis");J(this,"init",{userOptions:k});c.opposite=k.opposite;c.side=k.side||(c.horiz?c.opposite?0:2:c.opposite?1:3);c.setOptions(k);var d=this.options,p=d.type;c.labelFormatter=d.labels.formatter||c.defaultLabelFormatter;c.userOptions=k;c.minPixelPadding=0;c.reversed=d.reversed;c.visible=!1!==d.visible;c.zoomEnabled=!1!==d.zoomEnabled;c.hasNames="category"===p||!0===d.categories;c.categories=d.categories||c.hasNames;c.names||(c.names=[],c.names.keys={});c.plotLinesAndBandsGroups=
{};c.positiveValuesOnly=!!c.logarithmic;c.isLinked=x(d.linkedTo);c.ticks={};c.labelEdge=[];c.minorTicks={};c.plotLinesAndBands=[];c.alternateBands={};c.len=0;c.minRange=c.userMinRange=d.minRange||d.maxZoom;c.range=d.range;c.offset=d.offset||0;c.max=null;c.min=null;c.crosshair=A(d.crosshair,T(b.options.tooltip.crosshairs)[a?0:1],!1);k=c.options.events;-1===b.axes.indexOf(c)&&(a?b.axes.splice(b.xAxis.length,0,c):b.axes.push(c),b[c.coll].push(c));c.series=c.series||[];b.inverted&&!c.isZAxis&&a&&"undefined"===
typeof c.reversed&&(c.reversed=!0);c.labelRotation=c.options.labels.rotation;B(k,function(b,k){g(b)&&C(c,k,b)});J(this,"afterInit")};u.prototype.setOptions=function(b){this.options=q(u.defaultOptions,"yAxis"===this.coll&&u.defaultYAxisOptions,[u.defaultTopAxisOptions,u.defaultRightAxisOptions,u.defaultBottomAxisOptions,u.defaultLeftAxisOptions][this.side],q(O[this.coll],b));J(this,"afterSetOptions",{userOptions:b})};u.prototype.defaultLabelFormatter=function(){var b=this.axis,k=c(this.value)?this.value:
NaN,a=b.chart.time,d=b.categories,g=this.dateTimeLabelFormat,p=O.lang,q=p.numericSymbols;p=p.numericSymbolMagnitude||1E3;var e=q&&q.length,u=b.options.labels.format;b=b.logarithmic?Math.abs(k):b.tickInterval;var B=this.chart,l=B.numberFormatter;if(u)var A=w(u,this,B);else if(d)A=""+this.value;else if(g)A=a.dateFormat(g,k);else if(e&&1E3<=b)for(;e--&&"undefined"===typeof A;)a=Math.pow(p,e+1),b>=a&&0===10*k%a&&null!==q[e]&&0!==k&&(A=l(k/a,-1)+q[e]);"undefined"===typeof A&&(A=1E4<=Math.abs(k)?l(k,-1):
l(k,-1,void 0,""));return A};u.prototype.getSeriesExtremes=function(){var b=this,k=b.chart,a;J(this,"getSeriesExtremes",null,function(){b.hasVisibleSeries=!1;b.dataMin=b.dataMax=b.threshold=null;b.softThreshold=!b.isXAxis;b.stacking&&b.stacking.buildStacks();b.series.forEach(function(t){if(t.visible||!k.options.chart.ignoreHiddenSeries){var d=t.options,g=d.threshold;b.hasVisibleSeries=!0;b.positiveValuesOnly&&0>=g&&(g=null);if(b.isXAxis){if(d=t.xData,d.length){d=b.logarithmic?d.filter(b.validatePositiveValue):
d;a=t.getXExtremes(d);var p=a.min;var q=a.max;c(p)||p instanceof Date||(d=d.filter(c),a=t.getXExtremes(d),p=a.min,q=a.max);d.length&&(b.dataMin=Math.min(A(b.dataMin,p),p),b.dataMax=Math.max(A(b.dataMax,q),q))}}else if(t=t.applyExtremes(),c(t.dataMin)&&(p=t.dataMin,b.dataMin=Math.min(A(b.dataMin,p),p)),c(t.dataMax)&&(q=t.dataMax,b.dataMax=Math.max(A(b.dataMax,q),q)),x(g)&&(b.threshold=g),!d.softThreshold||b.positiveValuesOnly)b.softThreshold=!1}})});J(this,"afterGetSeriesExtremes")};u.prototype.translate=
function(b,a,t,d,g,p){var k=this.linkedParent||this,q=1,e=0,H=d?k.oldTransA:k.transA;d=d?k.oldMin:k.min;var u=k.minPixelPadding;g=(k.isOrdinal||k.brokenAxis&&k.brokenAxis.hasBreaks||k.logarithmic&&g)&&k.lin2val;H||(H=k.transA);t&&(q*=-1,e=k.len);k.reversed&&(q*=-1,e-=q*(k.sector||k.len));a?(b=(b*q+e-u)/H+d,g&&(b=k.lin2val(b))):(g&&(b=k.val2lin(b)),b=c(d)?q*(b-d)*H+e+q*u+(c(p)?H*p:0):void 0);return b};u.prototype.toPixels=function(b,k){return this.translate(b,!1,!this.horiz,null,!0)+(k?0:this.pos)};
u.prototype.toValue=function(b,k){return this.translate(b-(k?0:this.pos),!0,!this.horiz,null,!0)};u.prototype.getPlotLinePath=function(b){function k(b,a,k){if("pass"!==l&&b<a||b>k)l?b=I(b,a,k):E=!0;return b}var a=this,d=a.chart,g=a.left,p=a.top,q=b.old,e=b.value,u=b.translatedValue,B=b.lineWidth,l=b.force,r,n,f,h,w=q&&d.oldChartHeight||d.chartHeight,G=q&&d.oldChartWidth||d.chartWidth,E,v=a.transB;b={value:e,lineWidth:B,old:q,force:l,acrossPanes:b.acrossPanes,translatedValue:u};J(this,"getPlotLinePath",
b,function(b){u=A(u,a.translate(e,null,null,q));u=I(u,-1E5,1E5);r=f=Math.round(u+v);n=h=Math.round(w-u-v);c(u)?a.horiz?(n=p,h=w-a.bottom,r=f=k(r,g,g+a.width)):(r=g,f=G-a.right,n=h=k(n,p,p+a.height)):(E=!0,l=!1);b.path=E&&!l?null:d.renderer.crispLine([["M",r,n],["L",f,h]],B||1)});return b.path};u.prototype.getLinearTickPositions=function(b,a,c){var k=v(Math.floor(a/b)*b);c=v(Math.ceil(c/b)*b);var t=[],d;v(k+b)===k&&(d=20);if(this.single)return[a];for(a=k;a<=c;){t.push(a);a=v(a+b,d);if(a===g)break;
var g=a}return t};u.prototype.getMinorTickInterval=function(){var b=this.options;return!0===b.minorTicks?A(b.minorTickInterval,"auto"):!1===b.minorTicks?null:b.minorTickInterval};u.prototype.getMinorTickPositions=function(){var b=this.options,a=this.tickPositions,c=this.minorTickInterval,d=[],g=this.pointRangePadding||0,p=this.min-g;g=this.max+g;var q=g-p;if(q&&q/c<this.len/3){var e=this.logarithmic;if(e)this.paddedTicks.forEach(function(b,a,k){a&&d.push.apply(d,e.getLogTickPositions(c,k[a-1],k[a],
!0))});else if(this.dateTime&&"auto"===this.getMinorTickInterval())d=d.concat(this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(c),p,g,b.startOfWeek));else for(b=p+(a[0]-p)%c;b<=g&&b!==d[0];b+=c)d.push(b)}0!==d.length&&this.trimTicks(d);return d};u.prototype.adjustForMinRange=function(){var b=this.options,a=this.min,c=this.max,d=this.logarithmic,g,p,q,u,B;this.isXAxis&&"undefined"===typeof this.minRange&&!d&&(x(b.min)||x(b.max)?this.minRange=null:(this.series.forEach(function(b){u=b.xData;
for(p=B=b.xIncrement?1:u.length-1;0<p;p--)if(q=u[p]-u[p-1],"undefined"===typeof g||q<g)g=q}),this.minRange=Math.min(5*g,this.dataMax-this.dataMin)));if(c-a<this.minRange){var l=this.dataMax-this.dataMin>=this.minRange;var r=this.minRange;var n=(r-c+a)/2;n=[a-n,A(b.min,a-n)];l&&(n[2]=this.logarithmic?this.logarithmic.log2lin(this.dataMin):this.dataMin);a=y(n);c=[a+r,A(b.max,a+r)];l&&(c[2]=d?d.log2lin(this.dataMax):this.dataMax);c=e(c);c-a<r&&(n[0]=c-r,n[1]=A(b.min,c-r),a=y(n))}this.min=a;this.max=
c};u.prototype.getClosest=function(){var b;this.categories?b=1:this.series.forEach(function(a){var k=a.closestPointRange,c=a.visible||!a.chart.options.chart.ignoreHiddenSeries;!a.noSharedTooltip&&x(k)&&c&&(b=x(b)?Math.min(b,k):k)});return b};u.prototype.nameToX=function(b){var a=d(this.categories),c=a?this.categories:this.names,g=b.options.x;b.series.requireSorting=!1;x(g)||(g=!1===this.options.uniqueNames?b.series.autoIncrement():a?c.indexOf(b.name):A(c.keys[b.name],-1));if(-1===g){if(!a)var p=c.length}else p=
g;"undefined"!==typeof p&&(this.names[p]=b.name,this.names.keys[b.name]=p);return p};u.prototype.updateNames=function(){var b=this,a=this.names;0<a.length&&(Object.keys(a.keys).forEach(function(b){delete a.keys[b]}),a.length=0,this.minRange=this.userMinRange,(this.series||[]).forEach(function(a){a.xIncrement=null;if(!a.points||a.isDirtyData)b.max=Math.max(b.max,a.xData.length-1),a.processData(),a.generatePoints();a.data.forEach(function(k,c){if(k&&k.options&&"undefined"!==typeof k.name){var d=b.nameToX(k);
"undefined"!==typeof d&&d!==k.x&&(k.x=d,a.xData[c]=d)}})}))};u.prototype.setAxisTranslation=function(b){var k=this,c=k.max-k.min,d=k.axisPointRange||0,g=0,p=0,q=k.linkedParent,e=!!k.categories,u=k.transA,B=k.isXAxis;if(B||e||d){var l=k.getClosest();q?(g=q.minPointOffset,p=q.pointRangePadding):k.series.forEach(function(b){var c=e?1:B?A(b.options.pointRange,l,0):k.axisPointRange||0,t=b.options.pointPlacement;d=Math.max(d,c);if(!k.single||e)b=b.is("xrange")?!B:B,g=Math.max(g,b&&a(t)?0:c/2),p=Math.max(p,
b&&"on"===t?0:c)});q=k.ordinal&&k.ordinal.slope&&l?k.ordinal.slope/l:1;k.minPointOffset=g*=q;k.pointRangePadding=p*=q;k.pointRange=Math.min(d,k.single&&e?1:c);B&&(k.closestPointRange=l)}b&&(k.oldTransA=u);k.translationSlope=k.transA=u=k.staticScale||k.len/(c+p||1);k.transB=k.horiz?k.left:k.bottom;k.minPixelPadding=u*g;J(this,"afterSetAxisTranslation")};u.prototype.minFromRange=function(){return this.max-this.range};u.prototype.setTickInterval=function(b){var a=this,d=a.chart,g=a.logarithmic,q=a.options,
e=a.isXAxis,u=a.isLinked,B=q.maxPadding,l=q.minPadding,f=q.tickInterval,h=q.tickPixelInterval,w=a.categories,G=c(a.threshold)?a.threshold:null,E=a.softThreshold;a.dateTime||w||u||this.getTickAmount();var O=A(a.userMin,q.min);var D=A(a.userMax,q.max);if(u){a.linkedParent=d[a.coll][q.linkedTo];var M=a.linkedParent.getExtremes();a.min=A(M.min,M.dataMin);a.max=A(M.max,M.dataMax);q.type!==a.linkedParent.options.type&&n(11,1,d)}else{if(E&&x(G))if(a.dataMin>=G)M=G,l=0;else if(a.dataMax<=G){var m=G;B=0}a.min=
A(O,M,a.dataMin);a.max=A(D,m,a.dataMax)}g&&(a.positiveValuesOnly&&!b&&0>=Math.min(a.min,A(a.dataMin,a.min))&&n(10,1,d),a.min=v(g.log2lin(a.min),16),a.max=v(g.log2lin(a.max),16));a.range&&x(a.max)&&(a.userMin=a.min=O=Math.max(a.dataMin,a.minFromRange()),a.userMax=D=a.max,a.range=null);J(a,"foundExtremes");a.beforePadding&&a.beforePadding();a.adjustForMinRange();!(w||a.axisPointRange||a.stacking&&a.stacking.usePercentage||u)&&x(a.min)&&x(a.max)&&(d=a.max-a.min)&&(!x(O)&&l&&(a.min-=d*l),!x(D)&&B&&(a.max+=
d*B));c(a.userMin)||(c(q.softMin)&&q.softMin<a.min&&(a.min=O=q.softMin),c(q.floor)&&(a.min=Math.max(a.min,q.floor)));c(a.userMax)||(c(q.softMax)&&q.softMax>a.max&&(a.max=D=q.softMax),c(q.ceiling)&&(a.max=Math.min(a.max,q.ceiling)));E&&x(a.dataMin)&&(G=G||0,!x(O)&&a.min<G&&a.dataMin>=G?a.min=a.options.minRange?Math.min(G,a.max-a.minRange):G:!x(D)&&a.max>G&&a.dataMax<=G&&(a.max=a.options.minRange?Math.max(G,a.min+a.minRange):G));a.tickInterval=a.min===a.max||"undefined"===typeof a.min||"undefined"===
typeof a.max?1:u&&!f&&h===a.linkedParent.options.tickPixelInterval?f=a.linkedParent.tickInterval:A(f,this.tickAmount?(a.max-a.min)/Math.max(this.tickAmount-1,1):void 0,w?1:(a.max-a.min)*h/Math.max(a.len,h));e&&!b&&a.series.forEach(function(b){b.processData(a.min!==a.oldMin||a.max!==a.oldMax)});a.setAxisTranslation(!0);J(this,"initialAxisTranslation");a.pointRange&&!f&&(a.tickInterval=Math.max(a.pointRange,a.tickInterval));b=A(q.minTickInterval,a.dateTime&&!a.series.some(function(b){return b.noSharedTooltip})?
a.closestPointRange:0);!f&&a.tickInterval<b&&(a.tickInterval=b);a.dateTime||a.logarithmic||f||(a.tickInterval=p(a.tickInterval,void 0,r(a.tickInterval),A(q.allowDecimals,.5>a.tickInterval||void 0!==this.tickAmount),!!this.tickAmount));this.tickAmount||(a.tickInterval=a.unsquish());this.setTickPositions()};u.prototype.setTickPositions=function(){var b=this.options,a=b.tickPositions;var c=this.getMinorTickInterval();var d=b.tickPositioner,g=this.hasVerticalPanning(),p="colorAxis"===this.coll,q=(p||
!g)&&b.startOnTick;g=(p||!g)&&b.endOnTick;this.tickmarkOffset=this.categories&&"between"===b.tickmarkPlacement&&1===this.tickInterval?.5:0;this.minorTickInterval="auto"===c&&this.tickInterval?this.tickInterval/5:c;this.single=this.min===this.max&&x(this.min)&&!this.tickAmount&&(parseInt(this.min,10)===this.min||!1!==b.allowDecimals);this.tickPositions=c=a&&a.slice();!c&&(this.ordinal&&this.ordinal.positions||!((this.max-this.min)/this.tickInterval>Math.max(2*this.len,200))?c=this.dateTime?this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(this.tickInterval,
b.units),this.min,this.max,b.startOfWeek,this.ordinal&&this.ordinal.positions,this.closestPointRange,!0):this.logarithmic?this.logarithmic.getLogTickPositions(this.tickInterval,this.min,this.max):this.getLinearTickPositions(this.tickInterval,this.min,this.max):(c=[this.min,this.max],n(19,!1,this.chart)),c.length>this.len&&(c=[c[0],c.pop()],c[0]===c[1]&&(c.length=1)),this.tickPositions=c,d&&(d=d.apply(this,[this.min,this.max])))&&(this.tickPositions=c=d);this.paddedTicks=c.slice(0);this.trimTicks(c,
q,g);this.isLinked||(this.single&&2>c.length&&!this.categories&&!this.series.some(function(b){return b.is("heatmap")&&"between"===b.options.pointPlacement})&&(this.min-=.5,this.max+=.5),a||d||this.adjustTickAmount());J(this,"afterSetTickPositions")};u.prototype.trimTicks=function(b,a,c){var k=b[0],d=b[b.length-1],t=!this.isOrdinal&&this.minPointOffset||0;J(this,"trimTicks");if(!this.isLinked){if(a&&-Infinity!==k)this.min=k;else for(;this.min-t>b[0];)b.shift();if(c)this.max=d;else for(;this.max+t<
b[b.length-1];)b.pop();0===b.length&&x(k)&&!this.options.tickPositions&&b.push((d+k)/2)}};u.prototype.alignToOthers=function(){var b={},a,c=this.options;!1===this.chart.options.chart.alignTicks||!1===c.alignTicks||!1===c.startOnTick||!1===c.endOnTick||this.logarithmic||this.chart[this.coll].forEach(function(k){var c=k.options;c=[k.horiz?c.left:c.top,c.width,c.height,c.pane].join();k.series.length&&(b[c]?a=!0:b[c]=1)});return a};u.prototype.getTickAmount=function(){var b=this.options,a=b.tickAmount,
c=b.tickPixelInterval;!x(b.tickInterval)&&!a&&this.len<c&&!this.isRadial&&!this.logarithmic&&b.startOnTick&&b.endOnTick&&(a=2);!a&&this.alignToOthers()&&(a=Math.ceil(this.len/c)+1);4>a&&(this.finalTickAmt=a,a=5);this.tickAmount=a};u.prototype.adjustTickAmount=function(){var b=this.options,a=this.tickInterval,c=this.tickPositions,d=this.tickAmount,g=this.finalTickAmt,p=c&&c.length,q=A(this.threshold,this.softThreshold?0:null),e;if(this.hasData()){if(p<d){for(e=this.min;c.length<d;)c.length%2||e===
q?c.push(v(c[c.length-1]+a)):c.unshift(v(c[0]-a));this.transA*=(p-1)/(d-1);this.min=b.startOnTick?c[0]:Math.min(this.min,c[0]);this.max=b.endOnTick?c[c.length-1]:Math.max(this.max,c[c.length-1])}else p>d&&(this.tickInterval*=2,this.setTickPositions());if(x(g)){for(a=b=c.length;a--;)(3===g&&1===a%2||2>=g&&0<a&&a<b-1)&&c.splice(a,1);this.finalTickAmt=void 0}}};u.prototype.setScale=function(){var b,a=!1,c=!1;this.series.forEach(function(b){var k;a=a||b.isDirtyData||b.isDirty;c=c||(null===(k=b.xAxis)||
void 0===k?void 0:k.isDirty)||!1});this.oldMin=this.min;this.oldMax=this.max;this.oldAxisLength=this.len;this.setAxisSize();(b=this.len!==this.oldAxisLength)||a||c||this.isLinked||this.forceRedraw||this.userMin!==this.oldUserMin||this.userMax!==this.oldUserMax||this.alignToOthers()?(this.stacking&&this.stacking.resetStacks(),this.forceRedraw=!1,this.getSeriesExtremes(),this.setTickInterval(),this.oldUserMin=this.userMin,this.oldUserMax=this.userMax,this.isDirty||(this.isDirty=b||this.min!==this.oldMin||
this.max!==this.oldMax)):this.stacking&&this.stacking.cleanStacks();a&&this.panningState&&(this.panningState.isDirty=!0);J(this,"afterSetScale")};u.prototype.setExtremes=function(b,a,c,d,g){var k=this,t=k.chart;c=A(c,!0);k.series.forEach(function(b){delete b.kdTree});g=l(g,{min:b,max:a});J(k,"setExtremes",g,function(){k.userMin=b;k.userMax=a;k.eventArgs=g;c&&t.redraw(d)})};u.prototype.zoom=function(b,a){var k=this,c=this.dataMin,d=this.dataMax,g=this.options,p=Math.min(c,A(g.min,c)),q=Math.max(d,
A(g.max,d));b={newMin:b,newMax:a};J(this,"zoom",b,function(b){var a=b.newMin,g=b.newMax;if(a!==k.min||g!==k.max)k.allowZoomOutside||(x(c)&&(a<p&&(a=p),a>q&&(a=q)),x(d)&&(g<p&&(g=p),g>q&&(g=q))),k.displayBtn="undefined"!==typeof a||"undefined"!==typeof g,k.setExtremes(a,g,!1,void 0,{trigger:"zoom"});b.zoomed=!0});return b.zoomed};u.prototype.setAxisSize=function(){var b=this.chart,a=this.options,c=a.offsets||[0,0,0,0],d=this.horiz,g=this.width=Math.round(G(A(a.width,b.plotWidth-c[3]+c[1]),b.plotWidth)),
p=this.height=Math.round(G(A(a.height,b.plotHeight-c[0]+c[2]),b.plotHeight)),q=this.top=Math.round(G(A(a.top,b.plotTop+c[0]),b.plotHeight,b.plotTop));a=this.left=Math.round(G(A(a.left,b.plotLeft+c[3]),b.plotWidth,b.plotLeft));this.bottom=b.chartHeight-p-q;this.right=b.chartWidth-g-a;this.len=Math.max(d?g:p,0);this.pos=d?a:q};u.prototype.getExtremes=function(){var b=this.logarithmic;return{min:b?v(b.lin2log(this.min)):this.min,max:b?v(b.lin2log(this.max)):this.max,dataMin:this.dataMin,dataMax:this.dataMax,
userMin:this.userMin,userMax:this.userMax}};u.prototype.getThreshold=function(b){var a=this.logarithmic,c=a?a.lin2log(this.min):this.min;a=a?a.lin2log(this.max):this.max;null===b||-Infinity===b?b=c:Infinity===b?b=a:c>b?b=c:a<b&&(b=a);return this.translate(b,0,1,0,1)};u.prototype.autoLabelAlign=function(b){var a=(A(b,0)-90*this.side+720)%360;b={align:"center"};J(this,"autoLabelAlign",b,function(b){15<a&&165>a?b.align="right":195<a&&345>a&&(b.align="left")});return b.align};u.prototype.tickSize=function(b){var a=
this.options,c=a["tick"===b?"tickLength":"minorTickLength"],d=A(a["tick"===b?"tickWidth":"minorTickWidth"],"tick"===b&&this.isXAxis&&!this.categories?1:0);if(d&&c){"inside"===a[b+"Position"]&&(c=-c);var g=[c,d]}b={tickSize:g};J(this,"afterTickSize",b);return b.tickSize};u.prototype.labelMetrics=function(){var b=this.tickPositions&&this.tickPositions[0]||0;return this.chart.renderer.fontMetrics(this.options.labels.style&&this.options.labels.style.fontSize,this.ticks[b]&&this.ticks[b].label)};u.prototype.unsquish=
function(){var b=this.options.labels,a=this.horiz,c=this.tickInterval,d=c,g=this.len/(((this.categories?1:0)+this.max-this.min)/c),p,q=b.rotation,e=this.labelMetrics(),u,B=Number.MAX_VALUE,l,r=this.max-this.min,n=function(b){var a=b/(g||1);a=1<a?Math.ceil(a):1;a*c>r&&Infinity!==b&&Infinity!==g&&r&&(a=Math.ceil(r/c));return v(a*c)};a?(l=!b.staggerLines&&!b.step&&(x(q)?[q]:g<A(b.autoRotationLimit,80)&&b.autoRotation))&&l.forEach(function(b){if(b===q||b&&-90<=b&&90>=b){u=n(Math.abs(e.h/Math.sin(E*b)));
var a=u+Math.abs(b/360);a<B&&(B=a,p=b,d=u)}}):b.step||(d=n(e.h));this.autoRotation=l;this.labelRotation=A(p,q);return d};u.prototype.getSlotWidth=function(b){var a,d=this.chart,g=this.horiz,p=this.options.labels,q=Math.max(this.tickPositions.length-(this.categories?0:1),1),e=d.margin[3];if(b&&c(b.slotWidth))return b.slotWidth;if(g&&p&&2>(p.step||0))return p.rotation?0:(this.staggerLines||1)*this.len/q;if(!g){b=null===(a=null===p||void 0===p?void 0:p.style)||void 0===a?void 0:a.width;if(void 0!==b)return parseInt(b,
10);if(e)return e-d.spacing[3]}return.33*d.chartWidth};u.prototype.renderUnsquish=function(){var b=this.chart,k=b.renderer,c=this.tickPositions,d=this.ticks,g=this.options.labels,p=g&&g.style||{},q=this.horiz,e=this.getSlotWidth(),u=Math.max(1,Math.round(e-2*(g.padding||5))),B={},l=this.labelMetrics(),r=g.style&&g.style.textOverflow,n=0;a(g.rotation)||(B.rotation=g.rotation||0);c.forEach(function(b){b=d[b];b.movedLabel&&b.replaceMovedLabel();b&&b.label&&b.label.textPxLength>n&&(n=b.label.textPxLength)});
this.maxLabelLength=n;if(this.autoRotation)n>u&&n>l.h?B.rotation=this.labelRotation:this.labelRotation=0;else if(e){var A=u;if(!r){var f="clip";for(u=c.length;!q&&u--;){var h=c[u];if(h=d[h].label)h.styles&&"ellipsis"===h.styles.textOverflow?h.css({textOverflow:"clip"}):h.textPxLength>e&&h.css({width:e+"px"}),h.getBBox().height>this.len/c.length-(l.h-l.f)&&(h.specificTextOverflow="ellipsis")}}}B.rotation&&(A=n>.5*b.chartHeight?.33*b.chartHeight:n,r||(f="ellipsis"));if(this.labelAlign=g.align||this.autoLabelAlign(this.labelRotation))B.align=
this.labelAlign;c.forEach(function(b){var a=(b=d[b])&&b.label,k=p.width,c={};a&&(a.attr(B),b.shortenLabel?b.shortenLabel():A&&!k&&"nowrap"!==p.whiteSpace&&(A<a.textPxLength||"SPAN"===a.element.tagName)?(c.width=A+"px",r||(c.textOverflow=a.specificTextOverflow||f),a.css(c)):a.styles&&a.styles.width&&!c.width&&!k&&a.css({width:null}),delete a.specificTextOverflow,b.rotation=B.rotation)},this);this.tickRotCorr=k.rotCorr(l.b,this.labelRotation||0,0!==this.side)};u.prototype.hasData=function(){return this.series.some(function(b){return b.hasData()})||
this.options.showEmpty&&x(this.min)&&x(this.max)};u.prototype.addTitle=function(b){var a=this.chart.renderer,c=this.horiz,d=this.opposite,g=this.options.title,p,e=this.chart.styledMode;this.axisTitle||((p=g.textAlign)||(p=(c?{low:"left",middle:"center",high:"right"}:{low:d?"right":"left",middle:"center",high:d?"left":"right"})[g.align]),this.axisTitle=a.text(g.text,0,0,g.useHTML).attr({zIndex:7,rotation:g.rotation||0,align:p}).addClass("highcharts-axis-title"),e||this.axisTitle.css(q(g.style)),this.axisTitle.add(this.axisGroup),
this.axisTitle.isNew=!0);e||g.style.width||this.isRadial||this.axisTitle.css({width:this.len+"px"});this.axisTitle[b?"show":"hide"](b)};u.prototype.generateTick=function(b){var a=this.ticks;a[b]?a[b].addLabel():a[b]=new z(this,b)};u.prototype.getOffset=function(){var b=this,a=b.chart,c=a.renderer,d=b.options,g=b.tickPositions,p=b.ticks,q=b.horiz,e=b.side,u=a.inverted&&!b.isZAxis?[1,0,3,2][e]:e,l,n=0,r=0,f=d.title,h=d.labels,G=0,w=a.axisOffset;a=a.clipOffset;var E=[-1,1,1,-1][e],v=d.className,O=b.axisParent;
var D=b.hasData();b.showAxis=l=D||A(d.showEmpty,!0);b.staggerLines=b.horiz&&h.staggerLines;b.axisGroup||(b.gridGroup=c.g("grid").attr({zIndex:d.gridZIndex||1}).addClass("highcharts-"+this.coll.toLowerCase()+"-grid "+(v||"")).add(O),b.axisGroup=c.g("axis").attr({zIndex:d.zIndex||2}).addClass("highcharts-"+this.coll.toLowerCase()+" "+(v||"")).add(O),b.labelGroup=c.g("axis-labels").attr({zIndex:h.zIndex||7}).addClass("highcharts-"+b.coll.toLowerCase()+"-labels "+(v||"")).add(O));D||b.isLinked?(g.forEach(function(a,
c){b.generateTick(a,c)}),b.renderUnsquish(),b.reserveSpaceDefault=0===e||2===e||{1:"left",3:"right"}[e]===b.labelAlign,A(h.reserveSpace,"center"===b.labelAlign?!0:null,b.reserveSpaceDefault)&&g.forEach(function(b){G=Math.max(p[b].getLabelSize(),G)}),b.staggerLines&&(G*=b.staggerLines),b.labelOffset=G*(b.opposite?-1:1)):B(p,function(b,a){b.destroy();delete p[a]});if(f&&f.text&&!1!==f.enabled&&(b.addTitle(l),l&&!1!==f.reserveSpace)){b.titleOffset=n=b.axisTitle.getBBox()[q?"height":"width"];var M=f.offset;
r=x(M)?0:A(f.margin,q?5:10)}b.renderLine();b.offset=E*A(d.offset,w[e]?w[e]+(d.margin||0):0);b.tickRotCorr=b.tickRotCorr||{x:0,y:0};c=0===e?-b.labelMetrics().h:2===e?b.tickRotCorr.y:0;r=Math.abs(G)+r;G&&(r=r-c+E*(q?A(h.y,b.tickRotCorr.y+8*E):h.x));b.axisTitleMargin=A(M,r);b.getMaxLabelDimensions&&(b.maxLabelDimensions=b.getMaxLabelDimensions(p,g));q=this.tickSize("tick");w[e]=Math.max(w[e],b.axisTitleMargin+n+E*b.offset,r,g&&g.length&&q?q[0]+E*b.offset:0);d=d.offset?0:2*Math.floor(b.axisLine.strokeWidth()/
2);a[u]=Math.max(a[u],d);J(this,"afterGetOffset")};u.prototype.getLinePath=function(b){var a=this.chart,c=this.opposite,d=this.offset,g=this.horiz,p=this.left+(c?this.width:0)+d;d=a.chartHeight-this.bottom-(c?this.height:0)+d;c&&(b*=-1);return a.renderer.crispLine([["M",g?this.left:p,g?d:this.top],["L",g?a.chartWidth-this.right:p,g?d:a.chartHeight-this.bottom]],b)};u.prototype.renderLine=function(){this.axisLine||(this.axisLine=this.chart.renderer.path().addClass("highcharts-axis-line").add(this.axisGroup),
this.chart.styledMode||this.axisLine.attr({stroke:this.options.lineColor,"stroke-width":this.options.lineWidth,zIndex:7}))};u.prototype.getTitlePosition=function(){var b=this.horiz,a=this.left,c=this.top,d=this.len,g=this.options.title,p=b?a:c,q=this.opposite,e=this.offset,u=g.x||0,B=g.y||0,l=this.axisTitle,r=this.chart.renderer.fontMetrics(g.style&&g.style.fontSize,l);l=Math.max(l.getBBox(null,0).height-r.h-1,0);d={low:p+(b?0:d),middle:p+d/2,high:p+(b?d:0)}[g.align];a=(b?c+this.height:a)+(b?1:-1)*
(q?-1:1)*this.axisTitleMargin+[-l,l,r.f,-l][this.side];b={x:b?d+u:a+(q?this.width:0)+e+u,y:b?a+B-(q?this.height:0)+e:d+B};J(this,"afterGetTitlePosition",{titlePosition:b});return b};u.prototype.renderMinorTick=function(b){var a=this.chart.hasRendered&&c(this.oldMin),d=this.minorTicks;d[b]||(d[b]=new z(this,b,"minor"));a&&d[b].isNew&&d[b].render(null,!0);d[b].render(null,!1,1)};u.prototype.renderTick=function(b,a){var k,d=this.isLinked,g=this.ticks,p=this.chart.hasRendered&&c(this.oldMin);if(!d||b>=
this.min&&b<=this.max||(null===(k=this.grid)||void 0===k?0:k.isColumn))g[b]||(g[b]=new z(this,b)),p&&g[b].isNew&&g[b].render(a,!0,-1),g[b].render(a)};u.prototype.render=function(){var b=this,a=b.chart,d=b.logarithmic,g=b.options,p=b.isLinked,q=b.tickPositions,e=b.axisTitle,u=b.ticks,l=b.minorTicks,r=b.alternateBands,n=g.stackLabels,f=g.alternateGridColor,A=b.tickmarkOffset,h=b.axisLine,G=b.showAxis,w=K(a.renderer.globalAnimation),E,v;b.labelEdge.length=0;b.overlap=!1;[u,l,r].forEach(function(b){B(b,
function(b){b.isActive=!1})});if(b.hasData()||p)b.minorTickInterval&&!b.categories&&b.getMinorTickPositions().forEach(function(a){b.renderMinorTick(a)}),q.length&&(q.forEach(function(a,c){b.renderTick(a,c)}),A&&(0===b.min||b.single)&&(u[-1]||(u[-1]=new z(b,-1,null,!0)),u[-1].render(-1))),f&&q.forEach(function(c,k){v="undefined"!==typeof q[k+1]?q[k+1]+A:b.max-A;0===k%2&&c<b.max&&v<=b.max+(a.polar?-A:A)&&(r[c]||(r[c]=new m.PlotLineOrBand(b)),E=c+A,r[c].options={from:d?d.lin2log(E):E,to:d?d.lin2log(v):
v,color:f,className:"highcharts-alternate-grid"},r[c].render(),r[c].isActive=!0)}),b._addedPlotLB||((g.plotLines||[]).concat(g.plotBands||[]).forEach(function(a){b.addPlotBandOrLine(a)}),b._addedPlotLB=!0);[u,l,r].forEach(function(b){var c,k=[],d=w.duration;B(b,function(b,a){b.isActive||(b.render(a,!1,0),b.isActive=!1,k.push(a))});Q(function(){for(c=k.length;c--;)b[k[c]]&&!b[k[c]].isActive&&(b[k[c]].destroy(),delete b[k[c]])},b!==r&&a.hasRendered&&d?d:0)});h&&(h[h.isPlaced?"animate":"attr"]({d:this.getLinePath(h.strokeWidth())}),
h.isPlaced=!0,h[G?"show":"hide"](G));e&&G&&(g=b.getTitlePosition(),c(g.y)?(e[e.isNew?"attr":"animate"](g),e.isNew=!1):(e.attr("y",-9999),e.isNew=!0));n&&n.enabled&&b.stacking&&b.stacking.renderStackTotals();b.isDirty=!1;J(this,"afterRender")};u.prototype.redraw=function(){this.visible&&(this.render(),this.plotLinesAndBands.forEach(function(b){b.render()}));this.series.forEach(function(b){b.isDirty=!0})};u.prototype.getKeepProps=function(){return this.keepProps||u.keepProps};u.prototype.destroy=function(b){var a=
this,c=a.plotLinesAndBands,d;J(this,"destroy",{keepEvents:b});b||M(a);[a.ticks,a.minorTicks,a.alternateBands].forEach(function(b){D(b)});if(c)for(b=c.length;b--;)c[b].destroy();"axisLine axisTitle axisGroup gridGroup labelGroup cross scrollbar".split(" ").forEach(function(b){a[b]&&(a[b]=a[b].destroy())});for(d in a.plotLinesAndBandsGroups)a.plotLinesAndBandsGroups[d]=a.plotLinesAndBandsGroups[d].destroy();B(a,function(b,c){-1===a.getKeepProps().indexOf(c)&&delete a[c]})};u.prototype.drawCrosshair=
function(b,a){var c=this.crosshair,k=A(c.snap,!0),d,g=this.cross,p=this.chart;J(this,"drawCrosshair",{e:b,point:a});b||(b=this.cross&&this.cross.e);if(this.crosshair&&!1!==(x(a)||!k)){k?x(a)&&(d=A("colorAxis"!==this.coll?a.crosshairPos:null,this.isXAxis?a.plotX:this.len-a.plotY)):d=b&&(this.horiz?b.chartX-this.pos:this.len-b.chartY+this.pos);if(x(d)){var q={value:a&&(this.isXAxis?a.x:A(a.stackY,a.y)),translatedValue:d};p.polar&&l(q,{isCrosshair:!0,chartX:b&&b.chartX,chartY:b&&b.chartY,point:a});q=
this.getPlotLinePath(q)||null}if(!x(q)){this.hideCrosshair();return}k=this.categories&&!this.isRadial;g||(this.cross=g=p.renderer.path().addClass("highcharts-crosshair highcharts-crosshair-"+(k?"category ":"thin ")+c.className).attr({zIndex:A(c.zIndex,2)}).add(),p.styledMode||(g.attr({stroke:c.color||(k?h.parse("#ccd6eb").setOpacity(.25).get():"#cccccc"),"stroke-width":A(c.width,1)}).css({"pointer-events":"none"}),c.dashStyle&&g.attr({dashstyle:c.dashStyle})));g.show().attr({d:q});k&&!c.width&&g.attr({"stroke-width":this.transA});
this.cross.e=b}else this.hideCrosshair();J(this,"afterDrawCrosshair",{e:b,point:a})};u.prototype.hideCrosshair=function(){this.cross&&this.cross.hide();J(this,"afterHideCrosshair")};u.prototype.hasVerticalPanning=function(){var b,a;return/y/.test((null===(a=null===(b=this.chart.options.chart)||void 0===b?void 0:b.panning)||void 0===a?void 0:a.type)||"")};u.prototype.validatePositiveValue=function(b){return c(b)&&0<b};u.defaultOptions={dateTimeLabelFormats:{millisecond:{main:"%H:%M:%S.%L",range:!1},
second:{main:"%H:%M:%S",range:!1},minute:{main:"%H:%M",range:!1},hour:{main:"%H:%M",range:!1},day:{main:"%e. %b"},week:{main:"%e. %b"},month:{main:"%b '%y"},year:{main:"%Y"}},endOnTick:!1,labels:{enabled:!0,indentation:10,x:0,style:{color:"#666666",cursor:"default",fontSize:"11px"}},maxPadding:.01,minorTickLength:2,minorTickPosition:"outside",minPadding:.01,showEmpty:!0,startOfWeek:1,startOnTick:!1,tickLength:10,tickPixelInterval:100,tickmarkPlacement:"between",tickPosition:"outside",title:{align:"middle",
style:{color:"#666666"}},type:"linear",minorGridLineColor:"#f2f2f2",minorGridLineWidth:1,minorTickColor:"#999999",lineColor:"#ccd6eb",lineWidth:1,gridLineColor:"#e6e6e6",tickColor:"#ccd6eb"};u.defaultYAxisOptions={endOnTick:!0,maxPadding:.05,minPadding:.05,tickPixelInterval:72,showLastLabel:!0,labels:{x:-8},startOnTick:!0,title:{rotation:270,text:"Values"},stackLabels:{animation:{},allowOverlap:!1,enabled:!1,crop:!0,overflow:"justify",formatter:function(){var b=this.axis.chart.numberFormatter;return b(this.total,
-1)},style:{color:"#000000",fontSize:"11px",fontWeight:"bold",textOutline:"1px contrast"}},gridLineWidth:1,lineWidth:0};u.defaultLeftAxisOptions={labels:{x:-15},title:{rotation:270}};u.defaultRightAxisOptions={labels:{x:15},title:{rotation:90}};u.defaultBottomAxisOptions={labels:{autoRotation:[-45],x:0},margin:15,title:{rotation:0}};u.defaultTopAxisOptions={labels:{autoRotation:[-45],x:0},margin:15,title:{rotation:0}};u.keepProps="extKey hcEvents names series userMax userMin".split(" ");return u}();
m.Axis=f;return m.Axis});N(m,"Core/Axis/DateTimeAxis.js",[m["Core/Axis/Axis.js"],m["Core/Utilities.js"]],function(f,h){var m=h.addEvent,z=h.getMagnitude,F=h.normalizeTickInterval,L=h.timeUnits,K=function(){function f(f){this.axis=f}f.prototype.normalizeTimeTickInterval=function(f,e){var h=e||[["millisecond",[1,2,5,10,20,25,50,100,200,500]],["second",[1,2,5,10,15,30]],["minute",[1,2,5,10,15,30]],["hour",[1,2,3,4,6,8,12]],["day",[1,2]],["week",[1,2]],["month",[1,2,3,4,6]],["year",null]];e=h[h.length-
1];var v=L[e[0]],x=e[1],D;for(D=0;D<h.length&&!(e=h[D],v=L[e[0]],x=e[1],h[D+1]&&f<=(v*x[x.length-1]+L[h[D+1][0]])/2);D++);v===L.year&&f<5*v&&(x=[1,2,5]);f=F(f/v,x,"year"===e[0]?Math.max(z(f/v),1):1);return{unitRange:v,count:f,unitName:e[0]}};return f}();h=function(){function f(){}f.compose=function(f){f.keepProps.push("dateTime");f.prototype.getTimeTicks=function(){return this.chart.time.getTimeTicks.apply(this.chart.time,arguments)};m(f,"init",function(e){"datetime"!==e.userOptions.type?this.dateTime=
void 0:this.dateTime||(this.dateTime=new K(this))})};f.AdditionsClass=K;return f}();h.compose(f);return h});N(m,"Core/Axis/LogarithmicAxis.js",[m["Core/Axis/Axis.js"],m["Core/Utilities.js"]],function(f,h){var m=h.addEvent,z=h.getMagnitude,F=h.normalizeTickInterval,L=h.pick,K=function(){function f(f){this.axis=f}f.prototype.getLogTickPositions=function(f,e,h,v){var x=this.axis,D=x.len,n=x.options,l=[];v||(this.minorAutoInterval=void 0);if(.5<=f)f=Math.round(f),l=x.getLinearTickPositions(f,e,h);else if(.08<=
f){n=Math.floor(e);var m,w;for(D=.3<f?[1,2,4]:.15<f?[1,2,4,6,8]:[1,2,3,4,5,6,7,8,9];n<h+1&&!w;n++){var r=D.length;for(m=0;m<r&&!w;m++){var d=this.log2lin(this.lin2log(n)*D[m]);d>e&&(!v||g<=h)&&"undefined"!==typeof g&&l.push(g);g>h&&(w=!0);var g=d}}}else e=this.lin2log(e),h=this.lin2log(h),f=v?x.getMinorTickInterval():n.tickInterval,f=L("auto"===f?null:f,this.minorAutoInterval,n.tickPixelInterval/(v?5:1)*(h-e)/((v?D/x.tickPositions.length:D)||1)),f=F(f,void 0,z(f)),l=x.getLinearTickPositions(f,e,h).map(this.log2lin),
v||(this.minorAutoInterval=f/5);v||(x.tickInterval=f);return l};f.prototype.lin2log=function(f){return Math.pow(10,f)};f.prototype.log2lin=function(f){return Math.log(f)/Math.LN10};return f}();h=function(){function f(){}f.compose=function(f){f.keepProps.push("logarithmic");var e=f.prototype,h=K.prototype;e.log2lin=h.log2lin;e.lin2log=h.lin2log;m(f,"init",function(e){var f=this.logarithmic;"logarithmic"!==e.userOptions.type?this.logarithmic=void 0:(f||(f=this.logarithmic=new K(this)),this.log2lin!==
f.log2lin&&(f.log2lin=this.log2lin.bind(this)),this.lin2log!==f.lin2log&&(f.lin2log=this.lin2log.bind(this)))});m(f,"afterInit",function(){var e=this.logarithmic;e&&(this.lin2val=function(f){return e.lin2log(f)},this.val2lin=function(f){return e.log2lin(f)})})};return f}();h.compose(f);return h});N(m,"Core/Axis/PlotLineOrBand.js",[m["Core/Axis/Axis.js"],m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h,m){var z=m.arrayMax,F=m.arrayMin,P=m.defined,K=m.destroyObjectProperties,C=m.erase,y=m.extend,
e=m.merge,I=m.objectEach,v=m.pick;m=function(){function f(e,f){this.axis=e;f&&(this.options=f,this.id=f.id)}f.prototype.render=function(){h.fireEvent(this,"render");var f=this,n=f.axis,l=n.horiz,m=n.logarithmic,w=f.options,r=w.label,d=f.label,g=w.to,c=w.from,a=w.value,q=P(c)&&P(g),p=P(a),B=f.svgElem,A=!B,G=[],M=w.color,x=v(w.zIndex,0),Q=w.events;G={"class":"highcharts-plot-"+(q?"band ":"line ")+(w.className||"")};var O={},E=n.chart.renderer,u=q?"bands":"lines";m&&(c=m.log2lin(c),g=m.log2lin(g),a=
m.log2lin(a));n.chart.styledMode||(p?(G.stroke=M||"#999999",G["stroke-width"]=v(w.width,1),w.dashStyle&&(G.dashstyle=w.dashStyle)):q&&(G.fill=M||"#e6ebf5",w.borderWidth&&(G.stroke=w.borderColor,G["stroke-width"]=w.borderWidth)));O.zIndex=x;u+="-"+x;(m=n.plotLinesAndBandsGroups[u])||(n.plotLinesAndBandsGroups[u]=m=E.g("plot-"+u).attr(O).add());A&&(f.svgElem=B=E.path().attr(G).add(m));if(p)G=n.getPlotLinePath({value:a,lineWidth:B.strokeWidth(),acrossPanes:w.acrossPanes});else if(q)G=n.getPlotBandPath(c,
g,w);else return;!f.eventsAdded&&Q&&(I(Q,function(b,a){B.on(a,function(b){Q[a].apply(f,[b])})}),f.eventsAdded=!0);(A||!B.d)&&G&&G.length?B.attr({d:G}):B&&(G?(B.show(!0),B.animate({d:G})):B.d&&(B.hide(),d&&(f.label=d=d.destroy())));r&&(P(r.text)||P(r.formatter))&&G&&G.length&&0<n.width&&0<n.height&&!G.isFlat?(r=e({align:l&&q&&"center",x:l?!q&&4:10,verticalAlign:!l&&q&&"middle",y:l?q?16:10:q?6:-4,rotation:l&&!q&&90},r),this.renderLabel(r,G,q,x)):d&&d.hide();return f};f.prototype.renderLabel=function(e,
f,l,h){var n=this.label,r=this.axis.chart.renderer;n||(n={align:e.textAlign||e.align,rotation:e.rotation,"class":"highcharts-plot-"+(l?"band":"line")+"-label "+(e.className||"")},n.zIndex=h,h=this.getLabelText(e),this.label=n=r.text(h,0,0,e.useHTML).attr(n).add(),this.axis.chart.styledMode||n.css(e.style));r=f.xBounds||[f[0][1],f[1][1],l?f[2][1]:f[0][1]];f=f.yBounds||[f[0][2],f[1][2],l?f[2][2]:f[0][2]];l=F(r);h=F(f);n.align(e,!1,{x:l,y:h,width:z(r)-l,height:z(f)-h});n.show(!0)};f.prototype.getLabelText=
function(e){return P(e.formatter)?e.formatter.call(this):e.text};f.prototype.destroy=function(){C(this.axis.plotLinesAndBands,this);delete this.axis;K(this)};return f}();y(f.prototype,{getPlotBandPath:function(e,f,n){void 0===n&&(n=this.options);var l=this.getPlotLinePath({value:f,force:!0,acrossPanes:n.acrossPanes});n=this.getPlotLinePath({value:e,force:!0,acrossPanes:n.acrossPanes});var h=[],w=this.horiz,r=1;e=e<this.min&&f<this.min||e>this.max&&f>this.max;if(n&&l){if(e){var d=n.toString()===l.toString();
r=0}for(e=0;e<n.length;e+=2){f=n[e];var g=n[e+1],c=l[e],a=l[e+1];"M"!==f[0]&&"L"!==f[0]||"M"!==g[0]&&"L"!==g[0]||"M"!==c[0]&&"L"!==c[0]||"M"!==a[0]&&"L"!==a[0]||(w&&c[1]===f[1]?(c[1]+=r,a[1]+=r):w||c[2]!==f[2]||(c[2]+=r,a[2]+=r),h.push(["M",f[1],f[2]],["L",g[1],g[2]],["L",a[1],a[2]],["L",c[1],c[2]],["Z"]));h.isFlat=d}}return h},addPlotBand:function(e){return this.addPlotBandOrLine(e,"plotBands")},addPlotLine:function(e){return this.addPlotBandOrLine(e,"plotLines")},addPlotBandOrLine:function(e,f){var n=
new h.PlotLineOrBand(this,e),l=this.userOptions;this.visible&&(n=n.render());if(n){if(f){var v=l[f]||[];v.push(e);l[f]=v}this.plotLinesAndBands.push(n);this._addedPlotLB=!0}return n},removePlotBandOrLine:function(e){for(var f=this.plotLinesAndBands,n=this.options,l=this.userOptions,h=f.length;h--;)f[h].id===e&&f[h].destroy();[n.plotLines||[],l.plotLines||[],n.plotBands||[],l.plotBands||[]].forEach(function(f){for(h=f.length;h--;)(f[h]||{}).id===e&&C(f,f[h])})},removePlotBand:function(e){this.removePlotBandOrLine(e)},
removePlotLine:function(e){this.removePlotBandOrLine(e)}});h.PlotLineOrBand=m;return h.PlotLineOrBand});N(m,"Core/Tooltip.js",[m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h){var m=f.doc,z=h.clamp,F=h.css,L=h.defined,K=h.discardElement,C=h.extend,y=h.fireEvent,e=h.format,I=h.isNumber,v=h.isString,x=h.merge,D=h.pick,n=h.splat,l=h.syncTimeout,J=h.timeUnits;"";var w=function(){function r(d,g){this.container=void 0;this.crosshairs=[];this.distance=0;this.isHidden=!0;this.isSticky=!1;this.now=
{};this.options={};this.outside=!1;this.chart=d;this.init(d,g)}r.prototype.applyFilter=function(){var d=this.chart;d.renderer.definition({tagName:"filter",id:"drop-shadow-"+d.index,opacity:.5,children:[{tagName:"feGaussianBlur","in":"SourceAlpha",stdDeviation:1},{tagName:"feOffset",dx:1,dy:1},{tagName:"feComponentTransfer",children:[{tagName:"feFuncA",type:"linear",slope:.3}]},{tagName:"feMerge",children:[{tagName:"feMergeNode"},{tagName:"feMergeNode","in":"SourceGraphic"}]}]});d.renderer.definition({tagName:"style",
textContent:".highcharts-tooltip-"+d.index+"{filter:url(#drop-shadow-"+d.index+")}"})};r.prototype.bodyFormatter=function(d){return d.map(function(d){var c=d.series.tooltipOptions;return(c[(d.point.formatPrefix||"point")+"Formatter"]||d.point.tooltipFormatter).call(d.point,c[(d.point.formatPrefix||"point")+"Format"]||"")})};r.prototype.cleanSplit=function(d){this.chart.series.forEach(function(g){var c=g&&g.tt;c&&(!c.isActive||d?g.tt=c.destroy():c.isActive=!1)})};r.prototype.defaultFormatter=function(d){var g=
this.points||n(this);var c=[d.tooltipFooterHeaderFormatter(g[0])];c=c.concat(d.bodyFormatter(g));c.push(d.tooltipFooterHeaderFormatter(g[0],!0));return c};r.prototype.destroy=function(){this.label&&(this.label=this.label.destroy());this.split&&this.tt&&(this.cleanSplit(this.chart,!0),this.tt=this.tt.destroy());this.renderer&&(this.renderer=this.renderer.destroy(),K(this.container));h.clearTimeout(this.hideTimer);h.clearTimeout(this.tooltipTimeout)};r.prototype.getAnchor=function(d,g){var c=this.chart,
a=c.pointer,q=c.inverted,p=c.plotTop,e=c.plotLeft,f=0,l=0,r,h;d=n(d);this.followPointer&&g?("undefined"===typeof g.chartX&&(g=a.normalize(g)),d=[g.chartX-e,g.chartY-p]):d[0].tooltipPos?d=d[0].tooltipPos:(d.forEach(function(a){r=a.series.yAxis;h=a.series.xAxis;f+=a.plotX+(!q&&h?h.left-e:0);l+=(a.plotLow?(a.plotLow+a.plotHigh)/2:a.plotY)+(!q&&r?r.top-p:0)}),f/=d.length,l/=d.length,d=[q?c.plotWidth-l:f,this.shared&&!q&&1<d.length&&g?g.chartY-p:q?c.plotHeight-f:l]);return d.map(Math.round)};r.prototype.getDateFormat=
function(d,g,c,a){var q=this.chart.time,p=q.dateFormat("%m-%d %H:%M:%S.%L",g),e={millisecond:15,second:12,minute:9,hour:6,day:3},f="millisecond";for(l in J){if(d===J.week&&+q.dateFormat("%w",g)===c&&"00:00:00.000"===p.substr(6)){var l="week";break}if(J[l]>d){l=f;break}if(e[l]&&p.substr(e[l])!=="01-01 00:00:00.000".substr(e[l]))break;"week"!==l&&(f=l)}if(l)var r=q.resolveDTLFormat(a[l]).main;return r};r.prototype.getLabel=function(){var d,g,c=this,a=this.chart.renderer,q=this.chart.styledMode,p=this.options,
e="tooltip"+(L(p.className)?" "+p.className:""),l=(null===(d=p.style)||void 0===d?void 0:d.pointerEvents)||(!this.followPointer&&p.stickOnContact?"auto":"none"),r;d=function(){c.inContact=!0};var n=function(){var a=c.chart.hoverSeries;c.inContact=!1;if(a&&a.onMouseOut)a.onMouseOut()};if(!this.label){this.outside&&(this.container=r=f.doc.createElement("div"),r.className="highcharts-tooltip-container",F(r,{position:"absolute",top:"1px",pointerEvents:l,zIndex:3}),f.doc.body.appendChild(r),this.renderer=
a=new f.Renderer(r,0,0,null===(g=this.chart.options.chart)||void 0===g?void 0:g.style,void 0,void 0,a.styledMode));this.split?this.label=a.g(e):(this.label=a.label("",0,0,p.shape||"callout",null,null,p.useHTML,null,e).attr({padding:p.padding,r:p.borderRadius}),q||this.label.attr({fill:p.backgroundColor,"stroke-width":p.borderWidth}).css(p.style).css({pointerEvents:l}).shadow(p.shadow));q&&(this.applyFilter(),this.label.addClass("highcharts-tooltip-"+this.chart.index));if(c.outside&&!c.split){var h=
this.label,w=h.xSetter,v=h.ySetter;h.xSetter=function(a){w.call(h,c.distance);r.style.left=a+"px"};h.ySetter=function(a){v.call(h,c.distance);r.style.top=a+"px"}}this.label.on("mouseenter",d).on("mouseleave",n).attr({zIndex:8}).add()}return this.label};r.prototype.getPosition=function(d,g,c){var a=this.chart,q=this.distance,p={},e=a.inverted&&c.h||0,f,l=this.outside,r=l?m.documentElement.clientWidth-2*q:a.chartWidth,n=l?Math.max(m.body.scrollHeight,m.documentElement.scrollHeight,m.body.offsetHeight,
m.documentElement.offsetHeight,m.documentElement.clientHeight):a.chartHeight,h=a.pointer.getChartPosition(),w=a.containerScaling,E=function(b){return w?b*w.scaleX:b},u=function(b){return w?b*w.scaleY:b},b=function(b){var k="x"===b;return[b,k?r:n,k?d:g].concat(l?[k?E(d):u(g),k?h.left-q+E(c.plotX+a.plotLeft):h.top-q+u(c.plotY+a.plotTop),0,k?r:n]:[k?d:g,k?c.plotX+a.plotLeft:c.plotY+a.plotTop,k?a.plotLeft:a.plotTop,k?a.plotLeft+a.plotWidth:a.plotTop+a.plotHeight])},k=b("y"),t=b("x"),H=!this.followPointer&&
D(c.ttBelow,!a.inverted===!!c.negative),v=function(b,a,c,k,d,g,t){var f="y"===b?u(q):E(q),l=(c-k)/2,r=k<d-q,B=d+q+k<a,n=d-f-c+l;d=d+f-l;if(H&&B)p[b]=d;else if(!H&&r)p[b]=n;else if(r)p[b]=Math.min(t-k,0>n-e?n:n-e);else if(B)p[b]=Math.max(g,d+e+c>a?d:d+e);else return!1},U=function(b,a,c,k,d){var g;d<q||d>a-q?g=!1:p[b]=d<c/2?1:d>a-k/2?a-k-2:d-c/2;return g},x=function(b){var a=k;k=t;t=a;f=b},I=function(){!1!==v.apply(0,k)?!1!==U.apply(0,t)||f||(x(!0),I()):f?p.x=p.y=0:(x(!0),I())};(a.inverted||1<this.len)&&
x();I();return p};r.prototype.getXDateFormat=function(d,g,c){g=g.dateTimeLabelFormats;var a=c&&c.closestPointRange;return(a?this.getDateFormat(a,d.x,c.options.startOfWeek,g):g.day)||g.year};r.prototype.hide=function(d){var g=this;h.clearTimeout(this.hideTimer);d=D(d,this.options.hideDelay,500);this.isHidden||(this.hideTimer=l(function(){g.getLabel().fadeOut(d?void 0:d);g.isHidden=!0},d))};r.prototype.init=function(d,g){this.chart=d;this.options=g;this.crosshairs=[];this.now={x:0,y:0};this.isHidden=
!0;this.split=g.split&&!d.inverted&&!d.polar;this.shared=g.shared||this.split;this.outside=D(g.outside,!(!d.scrollablePixelsX&&!d.scrollablePixelsY))};r.prototype.isStickyOnContact=function(){return!(this.followPointer||!this.options.stickOnContact||!this.inContact)};r.prototype.move=function(d,g,c,a){var q=this,p=q.now,e=!1!==q.options.animation&&!q.isHidden&&(1<Math.abs(d-p.x)||1<Math.abs(g-p.y)),f=q.followPointer||1<q.len;C(p,{x:e?(2*p.x+d)/3:d,y:e?(p.y+g)/2:g,anchorX:f?void 0:e?(2*p.anchorX+c)/
3:c,anchorY:f?void 0:e?(p.anchorY+a)/2:a});q.getLabel().attr(p);q.drawTracker();e&&(h.clearTimeout(this.tooltipTimeout),this.tooltipTimeout=setTimeout(function(){q&&q.move(d,g,c,a)},32))};r.prototype.refresh=function(d,g){var c=this.chart,a=this.options,q=d,p={},e=[],f=a.formatter||this.defaultFormatter;p=this.shared;var l=c.styledMode;if(a.enabled){h.clearTimeout(this.hideTimer);this.followPointer=n(q)[0].series.tooltipOptions.followPointer;var r=this.getAnchor(q,g);g=r[0];var w=r[1];!p||q.series&&
q.series.noSharedTooltip?p=q.getLabelConfig():(c.pointer.applyInactiveState(q),q.forEach(function(a){a.setState("hover");e.push(a.getLabelConfig())}),p={x:q[0].category,y:q[0].y},p.points=e,q=q[0]);this.len=e.length;c=f.call(p,this);f=q.series;this.distance=D(f.tooltipOptions.distance,16);!1===c?this.hide():(this.split?this.renderSplit(c,n(d)):(d=this.getLabel(),a.style.width&&!l||d.css({width:this.chart.spacingBox.width+"px"}),d.attr({text:c&&c.join?c.join(""):c}),d.removeClass(/highcharts-color-[\d]+/g).addClass("highcharts-color-"+
D(q.colorIndex,f.colorIndex)),l||d.attr({stroke:a.borderColor||q.color||f.color||"#666666"}),this.updatePosition({plotX:g,plotY:w,negative:q.negative,ttBelow:q.ttBelow,h:r[2]||0})),this.isHidden&&this.label&&this.label.attr({opacity:1}).show(),this.isHidden=!1);y(this,"refresh")}};r.prototype.renderSplit=function(d,g){function c(b,a,c,d,g){void 0===g&&(g=!0);c?(a=I?0:F,b=z(b-d/2,m.left,m.right-d)):(a-=y,b=g?b-d-k:b+k,b=z(b,g?b:m.left,m.right));return{x:b,y:a}}var a=this,q=a.chart,p=a.chart,e=p.plotHeight,
l=p.plotLeft,r=p.plotTop,n=p.pointer,h=p.renderer,w=p.scrollablePixelsY,O=void 0===w?0:w;w=p.scrollingContainer;w=void 0===w?{scrollLeft:0,scrollTop:0}:w;var E=w.scrollLeft,u=w.scrollTop,b=p.styledMode,k=a.distance,t=a.options,H=a.options.positioner,m={left:E,right:E+p.chartWidth,top:u,bottom:u+p.chartHeight},x=a.getLabel(),I=!(!q.xAxis[0]||!q.xAxis[0].opposite),y=r+u,J=0,F=e-O;v(d)&&(d=[!1,d]);d=d.slice(0,g.length+1).reduce(function(d,p,q){if(!1!==p&&""!==p){q=g[q-1]||{isHeader:!0,plotX:g[0].plotX,
plotY:e,series:{}};var f=q.isHeader,n=f?a:q.series,B=n.tt,A=q.isHeader;var w=q.series;var E="highcharts-color-"+D(q.colorIndex,w.colorIndex,"none");B||(B={padding:t.padding,r:t.borderRadius},b||(B.fill=t.backgroundColor,B["stroke-width"]=t.borderWidth),B=h.label("",0,0,t[A?"headerShape":"shape"]||"callout",void 0,void 0,t.useHTML).addClass((A?"highcharts-tooltip-header ":"")+"highcharts-tooltip-box "+E).attr(B).add(x));B.isActive=!0;B.attr({text:p});b||B.css(t.style).shadow(t.shadow).attr({stroke:t.borderColor||
q.color||w.color||"#333333"});p=n.tt=B;A=p.getBBox();n=A.width+p.strokeWidth();f&&(J=A.height,F+=J,I&&(y-=J));w=q.plotX;w=void 0===w?0:w;E=q.plotY;E=void 0===E?0:E;var v=q.series;if(q.isHeader){w=l+w;var G=r+e/2}else B=v.xAxis,v=v.yAxis,w=B.pos+z(w,-k,B.len+k),v.pos+E>=u+r&&v.pos+E<=u+r+e-O&&(G=v.pos+E);w=z(w,m.left-k,m.right+k);"number"===typeof G?(A=A.height+1,E=H?H.call(a,n,A,q):c(w,G,f,n),d.push({align:H?0:void 0,anchorX:w,anchorY:G,boxWidth:n,point:q,rank:D(E.rank,f?1:0),size:A,target:E.y,tt:p,
x:E.x})):p.isActive=!1}return d},[]);!H&&d.some(function(b){return b.x<m.left})&&(d=d.map(function(b){var a=c(b.anchorX,b.anchorY,b.point.isHeader,b.boxWidth,!1);return C(b,{target:a.y,x:a.x})}));a.cleanSplit();f.distribute(d,F);d.forEach(function(b){var a=b.pos;b.tt.attr({visibility:"undefined"===typeof a?"hidden":"inherit",x:b.x,y:a+y,anchorX:b.anchorX,anchorY:b.anchorY})});d=a.container;q=a.renderer;a.outside&&d&&q&&(p=x.getBBox(),q.setSize(p.width+p.x,p.height+p.y,!1),n=n.getChartPosition(),d.style.left=
n.left+"px",d.style.top=n.top+"px")};r.prototype.drawTracker=function(){if(this.followPointer||!this.options.stickOnContact)this.tracker&&this.tracker.destroy();else{var d=this.chart,g=this.label,c=d.hoverPoint;if(g&&c){var a={x:0,y:0,width:0,height:0};c=this.getAnchor(c);var q=g.getBBox();c[0]+=d.plotLeft-g.translateX;c[1]+=d.plotTop-g.translateY;a.x=Math.min(0,c[0]);a.y=Math.min(0,c[1]);a.width=0>c[0]?Math.max(Math.abs(c[0]),q.width-c[0]):Math.max(Math.abs(c[0]),q.width);a.height=0>c[1]?Math.max(Math.abs(c[1]),
q.height-Math.abs(c[1])):Math.max(Math.abs(c[1]),q.height);this.tracker?this.tracker.attr(a):(this.tracker=g.renderer.rect(a).addClass("highcharts-tracker").add(g),d.styledMode||this.tracker.attr({fill:"rgba(0,0,0,0)"}))}}};r.prototype.styledModeFormat=function(d){return d.replace('style="font-size: 10px"','class="highcharts-header"').replace(/style="color:{(point|series)\.color}"/g,'class="highcharts-color-{$1.colorIndex}"')};r.prototype.tooltipFooterHeaderFormatter=function(d,g){var c=g?"footer":
"header",a=d.series,q=a.tooltipOptions,p=q.xDateFormat,f=a.xAxis,l=f&&"datetime"===f.options.type&&I(d.key),r=q[c+"Format"];g={isFooter:g,labelConfig:d};y(this,"headerFormatter",g,function(c){l&&!p&&(p=this.getXDateFormat(d,q,f));l&&p&&(d.point&&d.point.tooltipDateKeys||["key"]).forEach(function(a){r=r.replace("{point."+a+"}","{point."+a+":"+p+"}")});a.chart.styledMode&&(r=this.styledModeFormat(r));c.text=e(r,{point:d,series:a},this.chart)});return g.text};r.prototype.update=function(d){this.destroy();
x(!0,this.chart.options.tooltip.userOptions,d);this.init(this.chart,x(!0,this.options,d))};r.prototype.updatePosition=function(d){var g=this.chart,c=g.pointer,a=this.getLabel(),q=d.plotX+g.plotLeft,p=d.plotY+g.plotTop;c=c.getChartPosition();d=(this.options.positioner||this.getPosition).call(this,a.width,a.height,d);if(this.outside){var e=(this.options.borderWidth||0)+2*this.distance;this.renderer.setSize(a.width+e,a.height+e,!1);if(g=g.containerScaling)F(this.container,{transform:"scale("+g.scaleX+
", "+g.scaleY+")"}),q*=g.scaleX,p*=g.scaleY;q+=c.left-d.x;p+=c.top-d.y}this.move(Math.round(d.x),Math.round(d.y||0),q,p)};return r}();f.Tooltip=w;return f.Tooltip});N(m,"Core/Pointer.js",[m["Core/Color/Color.js"],m["Core/Globals.js"],m["Core/Tooltip.js"],m["Core/Utilities.js"]],function(f,h,m,z){var F=f.parse,P=h.charts,K=h.noop,C=z.addEvent,y=z.attr,e=z.css,I=z.defined,v=z.extend,x=z.find,D=z.fireEvent,n=z.isNumber,l=z.isObject,J=z.objectEach,w=z.offset,r=z.pick,d=z.splat;"";f=function(){function g(c,
a){this.lastValidTouch={};this.pinchDown=[];this.runChartClick=!1;this.chart=c;this.hasDragged=!1;this.options=a;this.unbindContainerMouseLeave=function(){};this.unbindContainerMouseEnter=function(){};this.init(c,a)}g.prototype.applyInactiveState=function(c){var a=[],d;(c||[]).forEach(function(c){d=c.series;a.push(d);d.linkedParent&&a.push(d.linkedParent);d.linkedSeries&&(a=a.concat(d.linkedSeries));d.navigatorSeries&&a.push(d.navigatorSeries)});this.chart.series.forEach(function(c){-1===a.indexOf(c)?
c.setState("inactive",!0):c.options.inactiveOtherPoints&&c.setAllPointsToState("inactive")})};g.prototype.destroy=function(){var c=this;"undefined"!==typeof c.unDocMouseMove&&c.unDocMouseMove();this.unbindContainerMouseLeave();h.chartCount||(h.unbindDocumentMouseUp&&(h.unbindDocumentMouseUp=h.unbindDocumentMouseUp()),h.unbindDocumentTouchEnd&&(h.unbindDocumentTouchEnd=h.unbindDocumentTouchEnd()));clearInterval(c.tooltipTimeout);J(c,function(a,d){c[d]=void 0})};g.prototype.drag=function(c){var a=this.chart,
d=a.options.chart,g=c.chartX,e=c.chartY,f=this.zoomHor,r=this.zoomVert,n=a.plotLeft,h=a.plotTop,w=a.plotWidth,v=a.plotHeight,E=this.selectionMarker,u=this.mouseDownX||0,b=this.mouseDownY||0,k=l(d.panning)?d.panning&&d.panning.enabled:d.panning,t=d.panKey&&c[d.panKey+"Key"];if(!E||!E.touch)if(g<n?g=n:g>n+w&&(g=n+w),e<h?e=h:e>h+v&&(e=h+v),this.hasDragged=Math.sqrt(Math.pow(u-g,2)+Math.pow(b-e,2)),10<this.hasDragged){var H=a.isInsidePlot(u-n,b-h);a.hasCartesianSeries&&(this.zoomX||this.zoomY)&&H&&!t&&
!E&&(this.selectionMarker=E=a.renderer.rect(n,h,f?1:w,r?1:v,0).attr({"class":"highcharts-selection-marker",zIndex:7}).add(),a.styledMode||E.attr({fill:d.selectionMarkerFill||F("#335cad").setOpacity(.25).get()}));E&&f&&(g-=u,E.attr({width:Math.abs(g),x:(0<g?0:g)+u}));E&&r&&(g=e-b,E.attr({height:Math.abs(g),y:(0<g?0:g)+b}));H&&!E&&k&&a.pan(c,d.panning)}};g.prototype.dragStart=function(c){var a=this.chart;a.mouseIsDown=c.type;a.cancelClick=!1;a.mouseDownX=this.mouseDownX=c.chartX;a.mouseDownY=this.mouseDownY=
c.chartY};g.prototype.drop=function(c){var a=this,d=this.chart,g=this.hasPinched;if(this.selectionMarker){var f={originalEvent:c,xAxis:[],yAxis:[]},l=this.selectionMarker,r=l.attr?l.attr("x"):l.x,h=l.attr?l.attr("y"):l.y,w=l.attr?l.attr("width"):l.width,m=l.attr?l.attr("height"):l.height,O;if(this.hasDragged||g)d.axes.forEach(function(d){if(d.zoomEnabled&&I(d.min)&&(g||a[{xAxis:"zoomX",yAxis:"zoomY"}[d.coll]])&&n(r)&&n(h)){var p=d.horiz,b="touchend"===c.type?d.minPixelPadding:0,k=d.toValue((p?r:h)+
b);p=d.toValue((p?r+w:h+m)-b);f[d.coll].push({axis:d,min:Math.min(k,p),max:Math.max(k,p)});O=!0}}),O&&D(d,"selection",f,function(a){d.zoom(v(a,g?{animation:!1}:null))});n(d.index)&&(this.selectionMarker=this.selectionMarker.destroy());g&&this.scaleGroups()}d&&n(d.index)&&(e(d.container,{cursor:d._cursor}),d.cancelClick=10<this.hasDragged,d.mouseIsDown=this.hasDragged=this.hasPinched=!1,this.pinchDown=[])};g.prototype.findNearestKDPoint=function(c,a,d){var g=this.chart,q=g.hoverPoint;g=g.tooltip;if(q&&
g&&g.isStickyOnContact())return q;var e;c.forEach(function(c){var g=!(c.noSharedTooltip&&a)&&0>c.options.findNearestPointBy.indexOf("y");c=c.searchPoint(d,g);if((g=l(c,!0))&&!(g=!l(e,!0))){g=e.distX-c.distX;var p=e.dist-c.dist,q=(c.series.group&&c.series.group.zIndex)-(e.series.group&&e.series.group.zIndex);g=0<(0!==g&&a?g:0!==p?p:0!==q?q:e.series.index>c.series.index?-1:1)}g&&(e=c)});return e};g.prototype.getChartCoordinatesFromPoint=function(c,a){var d=c.series,g=d.xAxis;d=d.yAxis;var e=r(c.clientX,
c.plotX),f=c.shapeArgs;if(g&&d)return a?{chartX:g.len+g.pos-e,chartY:d.len+d.pos-c.plotY}:{chartX:e+g.pos,chartY:c.plotY+d.pos};if(f&&f.x&&f.y)return{chartX:f.x,chartY:f.y}};g.prototype.getChartPosition=function(){return this.chartPosition||(this.chartPosition=w(this.chart.container))};g.prototype.getCoordinates=function(c){var a={xAxis:[],yAxis:[]};this.chart.axes.forEach(function(d){a[d.isXAxis?"xAxis":"yAxis"].push({axis:d,value:d.toValue(c[d.horiz?"chartX":"chartY"])})});return a};g.prototype.getHoverData=
function(c,a,d,g,e,f){var p,q=[];g=!(!g||!c);var n=a&&!a.stickyTracking,h={chartX:f?f.chartX:void 0,chartY:f?f.chartY:void 0,shared:e};D(this,"beforeGetHoverData",h);n=n?[a]:d.filter(function(a){return h.filter?h.filter(a):a.visible&&!(!e&&a.directTouch)&&r(a.options.enableMouseTracking,!0)&&a.stickyTracking});a=(p=g||!f?c:this.findNearestKDPoint(n,e,f))&&p.series;p&&(e&&!a.noSharedTooltip?(n=d.filter(function(a){return h.filter?h.filter(a):a.visible&&!(!e&&a.directTouch)&&r(a.options.enableMouseTracking,
!0)&&!a.noSharedTooltip}),n.forEach(function(a){var c=x(a.points,function(a){return a.x===p.x&&!a.isNull});l(c)&&(a.chart.isBoosting&&(c=a.getPoint(c)),q.push(c))})):q.push(p));h={hoverPoint:p};D(this,"afterGetHoverData",h);return{hoverPoint:h.hoverPoint,hoverSeries:a,hoverPoints:q}};g.prototype.getPointFromEvent=function(c){c=c.target;for(var a;c&&!a;)a=c.point,c=c.parentNode;return a};g.prototype.onTrackerMouseOut=function(c){c=c.relatedTarget||c.toElement;var a=this.chart.hoverSeries;this.isDirectTouch=
!1;if(!(!a||!c||a.stickyTracking||this.inClass(c,"highcharts-tooltip")||this.inClass(c,"highcharts-series-"+a.index)&&this.inClass(c,"highcharts-tracker")))a.onMouseOut()};g.prototype.inClass=function(c,a){for(var d;c;){if(d=y(c,"class")){if(-1!==d.indexOf(a))return!0;if(-1!==d.indexOf("highcharts-container"))return!1}c=c.parentNode}};g.prototype.init=function(c,a){this.options=a;this.chart=c;this.runChartClick=a.chart.events&&!!a.chart.events.click;this.pinchDown=[];this.lastValidTouch={};m&&(c.tooltip=
new m(c,a.tooltip),this.followTouchMove=r(a.tooltip.followTouchMove,!0));this.setDOMEvents()};g.prototype.normalize=function(c,a){var d=c.touches,g=d?d.length?d.item(0):r(d.changedTouches,c.changedTouches)[0]:c;a||(a=this.getChartPosition());d=g.pageX-a.left;a=g.pageY-a.top;if(g=this.chart.containerScaling)d/=g.scaleX,a/=g.scaleY;return v(c,{chartX:Math.round(d),chartY:Math.round(a)})};g.prototype.onContainerClick=function(c){var a=this.chart,d=a.hoverPoint;c=this.normalize(c);var g=a.plotLeft,e=
a.plotTop;a.cancelClick||(d&&this.inClass(c.target,"highcharts-tracker")?(D(d.series,"click",v(c,{point:d})),a.hoverPoint&&d.firePointEvent("click",c)):(v(c,this.getCoordinates(c)),a.isInsidePlot(c.chartX-g,c.chartY-e)&&D(a,"click",c)))};g.prototype.onContainerMouseDown=function(c){var a=1===((c.buttons||c.button)&1);c=this.normalize(c);if(h.isFirefox&&0!==c.button)this.onContainerMouseMove(c);if("undefined"===typeof c.button||a)this.zoomOption(c),a&&c.preventDefault&&c.preventDefault(),this.dragStart(c)};
g.prototype.onContainerMouseLeave=function(c){var a=P[r(h.hoverChartIndex,-1)],d=this.chart.tooltip;c=this.normalize(c);a&&(c.relatedTarget||c.toElement)&&(a.pointer.reset(),a.pointer.chartPosition=void 0);d&&!d.isHidden&&this.reset()};g.prototype.onContainerMouseEnter=function(c){delete this.chartPosition};g.prototype.onContainerMouseMove=function(c){var a=this.chart;c=this.normalize(c);this.setHoverChartIndex();c.preventDefault||(c.returnValue=!1);"mousedown"===a.mouseIsDown&&this.drag(c);a.openMenu||
!this.inClass(c.target,"highcharts-tracker")&&!a.isInsidePlot(c.chartX-a.plotLeft,c.chartY-a.plotTop)||this.runPointActions(c)};g.prototype.onDocumentTouchEnd=function(c){P[h.hoverChartIndex]&&P[h.hoverChartIndex].pointer.drop(c)};g.prototype.onContainerTouchMove=function(c){this.touch(c)};g.prototype.onContainerTouchStart=function(c){this.zoomOption(c);this.touch(c,!0)};g.prototype.onDocumentMouseMove=function(c){var a=this.chart,d=this.chartPosition;c=this.normalize(c,d);var g=a.tooltip;!d||g&&
g.isStickyOnContact()||a.isInsidePlot(c.chartX-a.plotLeft,c.chartY-a.plotTop)||this.inClass(c.target,"highcharts-tracker")||this.reset()};g.prototype.onDocumentMouseUp=function(c){var a=P[r(h.hoverChartIndex,-1)];a&&a.pointer.drop(c)};g.prototype.pinch=function(c){var a=this,d=a.chart,g=a.pinchDown,e=c.touches||[],f=e.length,l=a.lastValidTouch,n=a.hasZoom,h=a.selectionMarker,w={},m=1===f&&(a.inClass(c.target,"highcharts-tracker")&&d.runTrackerClick||a.runChartClick),E={};1<f&&(a.initiated=!0);n&&
a.initiated&&!m&&!1!==c.cancelable&&c.preventDefault();[].map.call(e,function(c){return a.normalize(c)});"touchstart"===c.type?([].forEach.call(e,function(a,b){g[b]={chartX:a.chartX,chartY:a.chartY}}),l.x=[g[0].chartX,g[1]&&g[1].chartX],l.y=[g[0].chartY,g[1]&&g[1].chartY],d.axes.forEach(function(a){if(a.zoomEnabled){var b=d.bounds[a.horiz?"h":"v"],c=a.minPixelPadding,g=a.toPixels(Math.min(r(a.options.min,a.dataMin),a.dataMin)),p=a.toPixels(Math.max(r(a.options.max,a.dataMax),a.dataMax)),q=Math.max(g,
p);b.min=Math.min(a.pos,Math.min(g,p)-c);b.max=Math.max(a.pos+a.len,q+c)}}),a.res=!0):a.followTouchMove&&1===f?this.runPointActions(a.normalize(c)):g.length&&(h||(a.selectionMarker=h=v({destroy:K,touch:!0},d.plotBox)),a.pinchTranslate(g,e,w,h,E,l),a.hasPinched=n,a.scaleGroups(w,E),a.res&&(a.res=!1,this.reset(!1,0)))};g.prototype.pinchTranslate=function(c,a,d,g,e,f){this.zoomHor&&this.pinchTranslateDirection(!0,c,a,d,g,e,f);this.zoomVert&&this.pinchTranslateDirection(!1,c,a,d,g,e,f)};g.prototype.pinchTranslateDirection=
function(c,a,d,g,e,f,l,r){var p=this.chart,q=c?"x":"y",n=c?"X":"Y",h="chart"+n,u=c?"width":"height",b=p["plot"+(c?"Left":"Top")],k,t,B=r||1,w=p.inverted,A=p.bounds[c?"h":"v"],v=1===a.length,G=a[0][h],m=d[0][h],D=!v&&a[1][h],M=!v&&d[1][h];d=function(){"number"===typeof M&&20<Math.abs(G-D)&&(B=r||Math.abs(m-M)/Math.abs(G-D));t=(b-m)/B+G;k=p["plot"+(c?"Width":"Height")]/B};d();a=t;if(a<A.min){a=A.min;var x=!0}else a+k>A.max&&(a=A.max-k,x=!0);x?(m-=.8*(m-l[q][0]),"number"===typeof M&&(M-=.8*(M-l[q][1])),
d()):l[q]=[m,M];w||(f[q]=t-b,f[u]=k);f=w?1/B:B;e[u]=k;e[q]=a;g[w?c?"scaleY":"scaleX":"scale"+n]=B;g["translate"+n]=f*b+(m-f*G)};g.prototype.reset=function(c,a){var g=this.chart,p=g.hoverSeries,e=g.hoverPoint,f=g.hoverPoints,l=g.tooltip,r=l&&l.shared?f:e;c&&r&&d(r).forEach(function(a){a.series.isCartesian&&"undefined"===typeof a.plotX&&(c=!1)});if(c)l&&r&&d(r).length&&(l.refresh(r),l.shared&&f?f.forEach(function(a){a.setState(a.state,!0);a.series.isCartesian&&(a.series.xAxis.crosshair&&a.series.xAxis.drawCrosshair(null,
a),a.series.yAxis.crosshair&&a.series.yAxis.drawCrosshair(null,a))}):e&&(e.setState(e.state,!0),g.axes.forEach(function(a){a.crosshair&&e.series[a.coll]===a&&a.drawCrosshair(null,e)})));else{if(e)e.onMouseOut();f&&f.forEach(function(a){a.setState()});if(p)p.onMouseOut();l&&l.hide(a);this.unDocMouseMove&&(this.unDocMouseMove=this.unDocMouseMove());g.axes.forEach(function(a){a.hideCrosshair()});this.hoverX=g.hoverPoints=g.hoverPoint=null}};g.prototype.runPointActions=function(c,a){var d=this.chart,
g=d.tooltip&&d.tooltip.options.enabled?d.tooltip:void 0,e=g?g.shared:!1,f=a||d.hoverPoint,l=f&&f.series||d.hoverSeries;l=this.getHoverData(f,l,d.series,(!c||"touchmove"!==c.type)&&(!!a||l&&l.directTouch&&this.isDirectTouch),e,c);f=l.hoverPoint;var n=l.hoverPoints;a=(l=l.hoverSeries)&&l.tooltipOptions.followPointer;e=e&&l&&!l.noSharedTooltip;if(f&&(f!==d.hoverPoint||g&&g.isHidden)){(d.hoverPoints||[]).forEach(function(a){-1===n.indexOf(a)&&a.setState()});if(d.hoverSeries!==l)l.onMouseOver();this.applyInactiveState(n);
(n||[]).forEach(function(a){a.setState("hover")});d.hoverPoint&&d.hoverPoint.firePointEvent("mouseOut");if(!f.series)return;d.hoverPoints=n;d.hoverPoint=f;f.firePointEvent("mouseOver");g&&g.refresh(e?n:f,c)}else a&&g&&!g.isHidden&&(f=g.getAnchor([{}],c),g.updatePosition({plotX:f[0],plotY:f[1]}));this.unDocMouseMove||(this.unDocMouseMove=C(d.container.ownerDocument,"mousemove",function(a){var c=P[h.hoverChartIndex];if(c)c.pointer.onDocumentMouseMove(a)}));d.axes.forEach(function(a){var g=r((a.crosshair||
{}).snap,!0),p;g&&((p=d.hoverPoint)&&p.series[a.coll]===a||(p=x(n,function(c){return c.series[a.coll]===a})));p||!g?a.drawCrosshair(c,p):a.hideCrosshair()})};g.prototype.scaleGroups=function(c,a){var d=this.chart,g;d.series.forEach(function(p){g=c||p.getPlotBox();p.xAxis&&p.xAxis.zoomEnabled&&p.group&&(p.group.attr(g),p.markerGroup&&(p.markerGroup.attr(g),p.markerGroup.clip(a?d.clipRect:null)),p.dataLabelsGroup&&p.dataLabelsGroup.attr(g))});d.clipRect.attr(a||d.clipBox)};g.prototype.setDOMEvents=
function(){var c=this.chart.container,a=c.ownerDocument;c.onmousedown=this.onContainerMouseDown.bind(this);c.onmousemove=this.onContainerMouseMove.bind(this);c.onclick=this.onContainerClick.bind(this);this.unbindContainerMouseEnter=C(c,"mouseenter",this.onContainerMouseEnter.bind(this));this.unbindContainerMouseLeave=C(c,"mouseleave",this.onContainerMouseLeave.bind(this));h.unbindDocumentMouseUp||(h.unbindDocumentMouseUp=C(a,"mouseup",this.onDocumentMouseUp.bind(this)));h.hasTouch&&(C(c,"touchstart",
this.onContainerTouchStart.bind(this)),C(c,"touchmove",this.onContainerTouchMove.bind(this)),h.unbindDocumentTouchEnd||(h.unbindDocumentTouchEnd=C(a,"touchend",this.onDocumentTouchEnd.bind(this))))};g.prototype.setHoverChartIndex=function(){var c=this.chart,a=h.charts[r(h.hoverChartIndex,-1)];if(a&&a!==c)a.pointer.onContainerMouseLeave({relatedTarget:!0});a&&a.mouseIsDown||(h.hoverChartIndex=c.index)};g.prototype.touch=function(c,a){var d=this.chart,g;this.setHoverChartIndex();if(1===c.touches.length)if(c=
this.normalize(c),(g=d.isInsidePlot(c.chartX-d.plotLeft,c.chartY-d.plotTop))&&!d.openMenu){a&&this.runPointActions(c);if("touchmove"===c.type){a=this.pinchDown;var e=a[0]?4<=Math.sqrt(Math.pow(a[0].chartX-c.chartX,2)+Math.pow(a[0].chartY-c.chartY,2)):!1}r(e,!0)&&this.pinch(c)}else a&&this.reset();else 2===c.touches.length&&this.pinch(c)};g.prototype.zoomOption=function(c){var a=this.chart,d=a.options.chart,g=d.zoomType||"";a=a.inverted;/touch/.test(c.type)&&(g=r(d.pinchType,g));this.zoomX=c=/x/.test(g);
this.zoomY=g=/y/.test(g);this.zoomHor=c&&!a||g&&a;this.zoomVert=g&&!a||c&&a;this.hasZoom=c||g};return g}();return h.Pointer=f});N(m,"Core/MSPointer.js",[m["Core/Globals.js"],m["Core/Pointer.js"],m["Core/Utilities.js"]],function(f,h,m){function z(){var e=[];e.item=function(e){return this[e]};v(D,function(f){e.push({pageX:f.pageX,pageY:f.pageY,target:f.target})});return e}function F(e,n,h,r){"touch"!==e.pointerType&&e.pointerType!==e.MSPOINTER_TYPE_TOUCH||!K[f.hoverChartIndex]||(r(e),r=K[f.hoverChartIndex].pointer,
r[n]({type:h,target:e.currentTarget,preventDefault:y,touches:z()}))}var P=this&&this.__extends||function(){var e=function(f,l){e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,d){e.__proto__=d}||function(e,d){for(var g in d)d.hasOwnProperty(g)&&(e[g]=d[g])};return e(f,l)};return function(f,l){function r(){this.constructor=f}e(f,l);f.prototype=null===l?Object.create(l):(r.prototype=l.prototype,new r)}}(),K=f.charts,C=f.doc,y=f.noop,e=m.addEvent,I=m.css,v=m.objectEach,x=m.removeEvent,
D={},n=!!f.win.PointerEvent;return function(f){function l(){return null!==f&&f.apply(this,arguments)||this}P(l,f);l.prototype.batchMSEvents=function(e){e(this.chart.container,n?"pointerdown":"MSPointerDown",this.onContainerPointerDown);e(this.chart.container,n?"pointermove":"MSPointerMove",this.onContainerPointerMove);e(C,n?"pointerup":"MSPointerUp",this.onDocumentPointerUp)};l.prototype.destroy=function(){this.batchMSEvents(x);f.prototype.destroy.call(this)};l.prototype.init=function(e,l){f.prototype.init.call(this,
e,l);this.hasZoom&&I(e.container,{"-ms-touch-action":"none","touch-action":"none"})};l.prototype.onContainerPointerDown=function(e){F(e,"onContainerTouchStart","touchstart",function(e){D[e.pointerId]={pageX:e.pageX,pageY:e.pageY,target:e.currentTarget}})};l.prototype.onContainerPointerMove=function(e){F(e,"onContainerTouchMove","touchmove",function(e){D[e.pointerId]={pageX:e.pageX,pageY:e.pageY};D[e.pointerId].target||(D[e.pointerId].target=e.currentTarget)})};l.prototype.onDocumentPointerUp=function(e){F(e,
"onDocumentTouchEnd","touchend",function(e){delete D[e.pointerId]})};l.prototype.setDOMEvents=function(){f.prototype.setDOMEvents.call(this);(this.hasZoom||this.followTouchMove)&&this.batchMSEvents(e)};return l}(h)});N(m,"Core/Legend.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h,m){var z=f.animObject,F=f.setAnimation,L=m.addEvent,K=m.css,C=m.defined,y=m.discardElement,e=m.find,I=m.fireEvent,v=m.format,x=m.isNumber,D=m.merge,n=m.pick,l=m.relativeLength,
J=m.stableSort,w=m.syncTimeout;f=m.wrap;m=h.isFirefox;var r=h.marginNames,d=h.win,g=function(){function c(a,c){this.allItems=[];this.contentGroup=this.box=void 0;this.display=!1;this.group=void 0;this.offsetWidth=this.maxLegendWidth=this.maxItemWidth=this.legendWidth=this.legendHeight=this.lastLineHeight=this.lastItemY=this.itemY=this.itemX=this.itemMarginTop=this.itemMarginBottom=this.itemHeight=this.initialItemY=0;this.options={};this.padding=0;this.pages=[];this.proximate=!1;this.scrollGroup=void 0;
this.widthOption=this.totalItemWidth=this.titleHeight=this.symbolWidth=this.symbolHeight=0;this.chart=a;this.init(a,c)}c.prototype.init=function(a,c){this.chart=a;this.setOptions(c);c.enabled&&(this.render(),L(this.chart,"endResize",function(){this.legend.positionCheckboxes()}),this.proximate?this.unchartrender=L(this.chart,"render",function(){this.legend.proximatePositions();this.legend.positionItems()}):this.unchartrender&&this.unchartrender())};c.prototype.setOptions=function(a){var c=n(a.padding,
8);this.options=a;this.chart.styledMode||(this.itemStyle=a.itemStyle,this.itemHiddenStyle=D(this.itemStyle,a.itemHiddenStyle));this.itemMarginTop=a.itemMarginTop||0;this.itemMarginBottom=a.itemMarginBottom||0;this.padding=c;this.initialItemY=c-5;this.symbolWidth=n(a.symbolWidth,16);this.pages=[];this.proximate="proximate"===a.layout&&!this.chart.inverted;this.baseline=void 0};c.prototype.update=function(a,c){var d=this.chart;this.setOptions(D(!0,this.options,a));this.destroy();d.isDirtyLegend=d.isDirtyBox=
!0;n(c,!0)&&d.redraw();I(this,"afterUpdate")};c.prototype.colorizeItem=function(a,c){a.legendGroup[c?"removeClass":"addClass"]("highcharts-legend-item-hidden");if(!this.chart.styledMode){var d=this.options,g=a.legendItem,e=a.legendLine,f=a.legendSymbol,q=this.itemHiddenStyle.color;d=c?d.itemStyle.color:q;var l=c?a.color||q:q,r=a.options&&a.options.marker,n={fill:l};g&&g.css({fill:d,color:d});e&&e.attr({stroke:l});f&&(r&&f.isMarker&&(n=a.pointAttribs(),c||(n.stroke=n.fill=q)),f.attr(n))}I(this,"afterColorizeItem",
{item:a,visible:c})};c.prototype.positionItems=function(){this.allItems.forEach(this.positionItem,this);this.chart.isResizing||this.positionCheckboxes()};c.prototype.positionItem=function(a){var c=this,d=this.options,g=d.symbolPadding,e=!d.rtl,f=a._legendItemPos;d=f[0];f=f[1];var l=a.checkbox,n=a.legendGroup;n&&n.element&&(g={translateX:e?d:this.legendWidth-d-2*g-4,translateY:f},e=function(){I(c,"afterPositionItem",{item:a})},C(n.translateY)?n.animate(g,void 0,e):(n.attr(g),e()));l&&(l.x=d,l.y=f)};
c.prototype.destroyItem=function(a){var c=a.checkbox;["legendItem","legendLine","legendSymbol","legendGroup"].forEach(function(c){a[c]&&(a[c]=a[c].destroy())});c&&y(a.checkbox)};c.prototype.destroy=function(){function a(a){this[a]&&(this[a]=this[a].destroy())}this.getAllItems().forEach(function(c){["legendItem","legendGroup"].forEach(a,c)});"clipRect up down pager nav box title group".split(" ").forEach(a,this);this.display=null};c.prototype.positionCheckboxes=function(){var a=this.group&&this.group.alignAttr,
c=this.clipHeight||this.legendHeight,d=this.titleHeight;if(a){var g=a.translateY;this.allItems.forEach(function(e){var p=e.checkbox;if(p){var f=g+d+p.y+(this.scrollOffset||0)+3;K(p,{left:a.translateX+e.checkboxOffset+p.x-20+"px",top:f+"px",display:this.proximate||f>g-6&&f<g+c-6?"":"none"})}},this)}};c.prototype.renderTitle=function(){var a=this.options,c=this.padding,d=a.title,g=0;d.text&&(this.title||(this.title=this.chart.renderer.label(d.text,c-3,c-4,null,null,null,a.useHTML,null,"legend-title").attr({zIndex:1}),
this.chart.styledMode||this.title.css(d.style),this.title.add(this.group)),d.width||this.title.css({width:this.maxLegendWidth+"px"}),a=this.title.getBBox(),g=a.height,this.offsetWidth=a.width,this.contentGroup.attr({translateY:g}));this.titleHeight=g};c.prototype.setText=function(a){var c=this.options;a.legendItem.attr({text:c.labelFormat?v(c.labelFormat,a,this.chart):c.labelFormatter.call(a)})};c.prototype.renderItem=function(a){var c=this.chart,d=c.renderer,g=this.options,e=this.symbolWidth,f=g.symbolPadding,
l=this.itemStyle,r=this.itemHiddenStyle,h="horizontal"===g.layout?n(g.itemDistance,20):0,w=!g.rtl,v=a.legendItem,u=!a.series,b=!u&&a.series.drawLegendSymbol?a.series:a,k=b.options;k=this.createCheckboxForItem&&k&&k.showCheckbox;h=e+f+h+(k?20:0);var t=g.useHTML,H=a.options.className;v||(a.legendGroup=d.g("legend-item").addClass("highcharts-"+b.type+"-series highcharts-color-"+a.colorIndex+(H?" "+H:"")+(u?" highcharts-series-"+a.index:"")).attr({zIndex:1}).add(this.scrollGroup),a.legendItem=v=d.text("",
w?e+f:-f,this.baseline||0,t),c.styledMode||v.css(D(a.visible?l:r)),v.attr({align:w?"left":"right",zIndex:2}).add(a.legendGroup),this.baseline||(this.fontMetrics=d.fontMetrics(c.styledMode?12:l.fontSize,v),this.baseline=this.fontMetrics.f+3+this.itemMarginTop,v.attr("y",this.baseline)),this.symbolHeight=g.symbolHeight||this.fontMetrics.f,b.drawLegendSymbol(this,a),this.setItemEvents&&this.setItemEvents(a,v,t));k&&!a.checkbox&&this.createCheckboxForItem&&this.createCheckboxForItem(a);this.colorizeItem(a,
a.visible);!c.styledMode&&l.width||v.css({width:(g.itemWidth||this.widthOption||c.spacingBox.width)-h+"px"});this.setText(a);c=v.getBBox();a.itemWidth=a.checkboxOffset=g.itemWidth||a.legendItemWidth||c.width+h;this.maxItemWidth=Math.max(this.maxItemWidth,a.itemWidth);this.totalItemWidth+=a.itemWidth;this.itemHeight=a.itemHeight=Math.round(a.legendItemHeight||c.height||this.symbolHeight)};c.prototype.layoutItem=function(a){var c=this.options,d=this.padding,g="horizontal"===c.layout,e=a.itemHeight,
f=this.itemMarginBottom,l=this.itemMarginTop,r=g?n(c.itemDistance,20):0,h=this.maxLegendWidth;c=c.alignColumns&&this.totalItemWidth>h?this.maxItemWidth:a.itemWidth;g&&this.itemX-d+c>h&&(this.itemX=d,this.lastLineHeight&&(this.itemY+=l+this.lastLineHeight+f),this.lastLineHeight=0);this.lastItemY=l+this.itemY+f;this.lastLineHeight=Math.max(e,this.lastLineHeight);a._legendItemPos=[this.itemX,this.itemY];g?this.itemX+=c:(this.itemY+=l+e+f,this.lastLineHeight=e);this.offsetWidth=this.widthOption||Math.max((g?
this.itemX-d-(a.checkbox?0:r):c)+d,this.offsetWidth)};c.prototype.getAllItems=function(){var a=[];this.chart.series.forEach(function(c){var d=c&&c.options;c&&n(d.showInLegend,C(d.linkedTo)?!1:void 0,!0)&&(a=a.concat(c.legendItems||("point"===d.legendType?c.data:c)))});I(this,"afterGetAllItems",{allItems:a});return a};c.prototype.getAlignment=function(){var a=this.options;return this.proximate?a.align.charAt(0)+"tv":a.floating?"":a.align.charAt(0)+a.verticalAlign.charAt(0)+a.layout.charAt(0)};c.prototype.adjustMargins=
function(a,c){var d=this.chart,g=this.options,e=this.getAlignment();e&&[/(lth|ct|rth)/,/(rtv|rm|rbv)/,/(rbh|cb|lbh)/,/(lbv|lm|ltv)/].forEach(function(f,p){f.test(e)&&!C(a[p])&&(d[r[p]]=Math.max(d[r[p]],d.legend[(p+1)%2?"legendHeight":"legendWidth"]+[1,-1,-1,1][p]*g[p%2?"x":"y"]+n(g.margin,12)+c[p]+(d.titleOffset[p]||0)))})};c.prototype.proximatePositions=function(){var a=this.chart,c=[],d="left"===this.options.align;this.allItems.forEach(function(g){var f;var p=d;if(g.yAxis){g.xAxis.options.reversed&&
(p=!p);g.points&&(f=e(p?g.points:g.points.slice(0).reverse(),function(a){return x(a.plotY)}));p=this.itemMarginTop+g.legendItem.getBBox().height+this.itemMarginBottom;var q=g.yAxis.top-a.plotTop;g.visible?(f=f?f.plotY:g.yAxis.height,f+=q-.3*p):f=q+g.yAxis.height;c.push({target:f,size:p,item:g})}},this);h.distribute(c,a.plotHeight);c.forEach(function(c){c.item._legendItemPos[1]=a.plotTop-a.spacing[0]+c.pos})};c.prototype.render=function(){var a=this.chart,c=a.renderer,d=this.group,g=this.box,e=this.options,
f=this.padding;this.itemX=f;this.itemY=this.initialItemY;this.lastItemY=this.offsetWidth=0;this.widthOption=l(e.width,a.spacingBox.width-f);var n=a.spacingBox.width-2*f-e.x;-1<["rm","lm"].indexOf(this.getAlignment().substring(0,2))&&(n/=2);this.maxLegendWidth=this.widthOption||n;d||(this.group=d=c.g("legend").attr({zIndex:7}).add(),this.contentGroup=c.g().attr({zIndex:1}).add(d),this.scrollGroup=c.g().add(this.contentGroup));this.renderTitle();var r=this.getAllItems();J(r,function(a,c){return(a.options&&
a.options.legendIndex||0)-(c.options&&c.options.legendIndex||0)});e.reversed&&r.reverse();this.allItems=r;this.display=n=!!r.length;this.itemHeight=this.totalItemWidth=this.maxItemWidth=this.lastLineHeight=0;r.forEach(this.renderItem,this);r.forEach(this.layoutItem,this);r=(this.widthOption||this.offsetWidth)+f;var h=this.lastItemY+this.lastLineHeight+this.titleHeight;h=this.handleOverflow(h);h+=f;g||(this.box=g=c.rect().addClass("highcharts-legend-box").attr({r:e.borderRadius}).add(d),g.isNew=!0);
a.styledMode||g.attr({stroke:e.borderColor,"stroke-width":e.borderWidth||0,fill:e.backgroundColor||"none"}).shadow(e.shadow);0<r&&0<h&&(g[g.isNew?"attr":"animate"](g.crisp.call({},{x:0,y:0,width:r,height:h},g.strokeWidth())),g.isNew=!1);g[n?"show":"hide"]();a.styledMode&&"none"===d.getStyle("display")&&(r=h=0);this.legendWidth=r;this.legendHeight=h;n&&this.align();this.proximate||this.positionItems();I(this,"afterRender")};c.prototype.align=function(a){void 0===a&&(a=this.chart.spacingBox);var c=
this.chart,d=this.options,g=a.y;/(lth|ct|rth)/.test(this.getAlignment())&&0<c.titleOffset[0]?g+=c.titleOffset[0]:/(lbh|cb|rbh)/.test(this.getAlignment())&&0<c.titleOffset[2]&&(g-=c.titleOffset[2]);g!==a.y&&(a=D(a,{y:g}));this.group.align(D(d,{width:this.legendWidth,height:this.legendHeight,verticalAlign:this.proximate?"top":d.verticalAlign}),!0,a)};c.prototype.handleOverflow=function(a){var c=this,d=this.chart,g=d.renderer,e=this.options,f=e.y,l=this.padding;f=d.spacingBox.height+("top"===e.verticalAlign?
-f:f)-l;var r=e.maxHeight,h,w=this.clipRect,v=e.navigation,u=n(v.animation,!0),b=v.arrowSize||12,k=this.nav,t=this.pages,H,m=this.allItems,D=function(a){"number"===typeof a?w.attr({height:a}):w&&(c.clipRect=w.destroy(),c.contentGroup.clip());c.contentGroup.div&&(c.contentGroup.div.style.clip=a?"rect("+l+"px,9999px,"+(l+a)+"px,0)":"auto")},x=function(a){c[a]=g.circle(0,0,1.3*b).translate(b/2,b/2).add(k);d.styledMode||c[a].attr("fill","rgba(0,0,0,0.0001)");return c[a]};"horizontal"!==e.layout||"middle"===
e.verticalAlign||e.floating||(f/=2);r&&(f=Math.min(f,r));t.length=0;a>f&&!1!==v.enabled?(this.clipHeight=h=Math.max(f-20-this.titleHeight-l,0),this.currentPage=n(this.currentPage,1),this.fullHeight=a,m.forEach(function(a,b){var c=a._legendItemPos[1],d=Math.round(a.legendItem.getBBox().height),g=t.length;if(!g||c-t[g-1]>h&&(H||c)!==t[g-1])t.push(H||c),g++;a.pageIx=g-1;H&&(m[b-1].pageIx=g-1);b===m.length-1&&c+d-t[g-1]>h&&c!==H&&(t.push(c),a.pageIx=g);c!==H&&(H=c)}),w||(w=c.clipRect=g.clipRect(0,l,9999,
0),c.contentGroup.clip(w)),D(h),k||(this.nav=k=g.g().attr({zIndex:1}).add(this.group),this.up=g.symbol("triangle",0,0,b,b).add(k),x("upTracker").on("click",function(){c.scroll(-1,u)}),this.pager=g.text("",15,10).addClass("highcharts-legend-navigation"),d.styledMode||this.pager.css(v.style),this.pager.add(k),this.down=g.symbol("triangle-down",0,0,b,b).add(k),x("downTracker").on("click",function(){c.scroll(1,u)})),c.scroll(0),a=f):k&&(D(),this.nav=k.destroy(),this.scrollGroup.attr({translateY:1}),this.clipHeight=
0);return a};c.prototype.scroll=function(a,c){var d=this,g=this.chart,e=this.pages,f=e.length,l=this.currentPage+a;a=this.clipHeight;var q=this.options.navigation,r=this.pager,h=this.padding;l>f&&(l=f);0<l&&("undefined"!==typeof c&&F(c,g),this.nav.attr({translateX:h,translateY:a+this.padding+7+this.titleHeight,visibility:"visible"}),[this.up,this.upTracker].forEach(function(a){a.attr({"class":1===l?"highcharts-legend-nav-inactive":"highcharts-legend-nav-active"})}),r.attr({text:l+"/"+f}),[this.down,
this.downTracker].forEach(function(a){a.attr({x:18+this.pager.getBBox().width,"class":l===f?"highcharts-legend-nav-inactive":"highcharts-legend-nav-active"})},this),g.styledMode||(this.up.attr({fill:1===l?q.inactiveColor:q.activeColor}),this.upTracker.css({cursor:1===l?"default":"pointer"}),this.down.attr({fill:l===f?q.inactiveColor:q.activeColor}),this.downTracker.css({cursor:l===f?"default":"pointer"})),this.scrollOffset=-e[l-1]+this.initialItemY,this.scrollGroup.animate({translateY:this.scrollOffset}),
this.currentPage=l,this.positionCheckboxes(),c=z(n(c,g.renderer.globalAnimation,!0)),w(function(){I(d,"afterScroll",{currentPage:l})},c.duration))};return c}();(/Trident\/7\.0/.test(d.navigator&&d.navigator.userAgent)||m)&&f(g.prototype,"positionItem",function(c,a){var d=this,g=function(){a._legendItemPos&&c.call(d,a)};g();d.bubbleLegend||setTimeout(g)});h.Legend=g;return h.Legend});N(m,"Core/Series/Point.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Globals.js"],m["Core/Utilities.js"]],
function(f,h,m){var z=f.animObject,F=m.defined,L=m.erase,K=m.extend,C=m.fireEvent,y=m.format,e=m.getNestedProperty,I=m.isArray,v=m.isNumber,x=m.isObject,D=m.syncTimeout,n=m.pick,l=m.removeEvent,J=m.uniqueKey;"";f=function(){function f(){this.colorIndex=this.category=void 0;this.formatPrefix="point";this.id=void 0;this.isNull=!1;this.percentage=this.options=this.name=void 0;this.selected=!1;this.total=this.series=void 0;this.visible=!0;this.x=void 0}f.prototype.animateBeforeDestroy=function(){var e=
this,d={x:e.startXPos,opacity:0},g,c=e.getGraphicalProps();c.singular.forEach(function(a){g="dataLabel"===a;e[a]=e[a].animate(g?{x:e[a].startXPos,y:e[a].startYPos,opacity:0}:d)});c.plural.forEach(function(a){e[a].forEach(function(a){a.element&&a.animate(K({x:e.startXPos},a.startYPos?{x:a.startXPos,y:a.startYPos}:{}))})})};f.prototype.applyOptions=function(e,d){var g=this.series,c=g.options.pointValKey||g.pointValKey;e=f.prototype.optionsToObject.call(this,e);K(this,e);this.options=this.options?K(this.options,
e):e;e.group&&delete this.group;e.dataLabels&&delete this.dataLabels;c&&(this.y=f.prototype.getNestedProperty.call(this,c));this.formatPrefix=(this.isNull=n(this.isValid&&!this.isValid(),null===this.x||!v(this.y)))?"null":"point";this.selected&&(this.state="select");"name"in this&&"undefined"===typeof d&&g.xAxis&&g.xAxis.hasNames&&(this.x=g.xAxis.nameToX(this));"undefined"===typeof this.x&&g&&(this.x="undefined"===typeof d?g.autoIncrement(this):d);return this};f.prototype.destroy=function(){function e(){if(d.graphic||
d.dataLabel||d.dataLabels)l(d),d.destroyElements();for(p in d)d[p]=null}var d=this,g=d.series,c=g.chart;g=g.options.dataSorting;var a=c.hoverPoints,f=z(d.series.chart.renderer.globalAnimation),p;d.legendItem&&c.legend.destroyItem(d);a&&(d.setState(),L(a,d),a.length||(c.hoverPoints=null));if(d===c.hoverPoint)d.onMouseOut();g&&g.enabled?(this.animateBeforeDestroy(),D(e,f.duration)):e();c.pointCount--};f.prototype.destroyElements=function(e){var d=this;e=d.getGraphicalProps(e);e.singular.forEach(function(g){d[g]=
d[g].destroy()});e.plural.forEach(function(g){d[g].forEach(function(c){c.element&&c.destroy()});delete d[g]})};f.prototype.firePointEvent=function(e,d,g){var c=this,a=this.series.options;(a.point.events[e]||c.options&&c.options.events&&c.options.events[e])&&c.importEvents();"click"===e&&a.allowPointSelect&&(g=function(a){c.select&&c.select(null,a.ctrlKey||a.metaKey||a.shiftKey)});C(c,e,d,g)};f.prototype.getClassName=function(){return"highcharts-point"+(this.selected?" highcharts-point-select":"")+
(this.negative?" highcharts-negative":"")+(this.isNull?" highcharts-null-point":"")+("undefined"!==typeof this.colorIndex?" highcharts-color-"+this.colorIndex:"")+(this.options.className?" "+this.options.className:"")+(this.zone&&this.zone.className?" "+this.zone.className.replace("highcharts-negative",""):"")};f.prototype.getGraphicalProps=function(e){var d=this,g=[],c,a={singular:[],plural:[]};e=e||{graphic:1,dataLabel:1};e.graphic&&g.push("graphic","shadowGroup");e.dataLabel&&g.push("dataLabel",
"dataLabelUpper","connector");for(c=g.length;c--;){var f=g[c];d[f]&&a.singular.push(f)}["dataLabel","connector"].forEach(function(c){var g=c+"s";e[c]&&d[g]&&a.plural.push(g)});return a};f.prototype.getLabelConfig=function(){return{x:this.category,y:this.y,color:this.color,colorIndex:this.colorIndex,key:this.name||this.category,series:this.series,point:this,percentage:this.percentage,total:this.total||this.stackTotal}};f.prototype.getNestedProperty=function(f){if(f)return 0===f.indexOf("custom.")?
e(f,this.options):this[f]};f.prototype.getZone=function(){var e=this.series,d=e.zones;e=e.zoneAxis||"y";var g=0,c;for(c=d[g];this[e]>=c.value;)c=d[++g];this.nonZonedColor||(this.nonZonedColor=this.color);this.color=c&&c.color&&!this.options.color?c.color:this.nonZonedColor;return c};f.prototype.hasNewShapeType=function(){return(this.graphic&&(this.graphic.symbolName||this.graphic.element.nodeName))!==this.shapeType};f.prototype.init=function(e,d,g){this.series=e;this.applyOptions(d,g);this.id=F(this.id)?
this.id:J();this.resolveColor();e.chart.pointCount++;C(this,"afterInit");return this};f.prototype.optionsToObject=function(e){var d={},g=this.series,c=g.options.keys,a=c||g.pointArrayMap||["y"],l=a.length,p=0,n=0;if(v(e)||null===e)d[a[0]]=e;else if(I(e))for(!c&&e.length>l&&(g=typeof e[0],"string"===g?d.name=e[0]:"number"===g&&(d.x=e[0]),p++);n<l;)c&&"undefined"===typeof e[p]||(0<a[n].indexOf(".")?f.prototype.setNestedProperty(d,e[p],a[n]):d[a[n]]=e[p]),p++,n++;else"object"===typeof e&&(d=e,e.dataLabels&&
(g._hasPointLabels=!0),e.marker&&(g._hasPointMarkers=!0));return d};f.prototype.resolveColor=function(){var e=this.series;var d=e.chart.options.chart.colorCount;var g=e.chart.styledMode;delete this.nonZonedColor;g||this.options.color||(this.color=e.color);e.options.colorByPoint?(g||(d=e.options.colors||e.chart.options.colors,this.color=this.color||d[e.colorCounter],d=d.length),g=e.colorCounter,e.colorCounter++,e.colorCounter===d&&(e.colorCounter=0)):g=e.colorIndex;this.colorIndex=n(this.colorIndex,
g)};f.prototype.setNestedProperty=function(e,d,g){g.split(".").reduce(function(c,a,g,e){c[a]=e.length-1===g?d:x(c[a],!0)?c[a]:{};return c[a]},e);return e};f.prototype.tooltipFormatter=function(e){var d=this.series,g=d.tooltipOptions,c=n(g.valueDecimals,""),a=g.valuePrefix||"",f=g.valueSuffix||"";d.chart.styledMode&&(e=d.chart.tooltip.styledModeFormat(e));(d.pointArrayMap||["y"]).forEach(function(d){d="{point."+d;if(a||f)e=e.replace(RegExp(d+"}","g"),a+d+"}"+f);e=e.replace(RegExp(d+"}","g"),d+":,."+
c+"f}")});return y(e,{point:this,series:this.series},d.chart)};return f}();return h.Point=f});N(m,"Core/Series/Series.js",[m["Core/Globals.js"],m["Core/Series/Point.js"],m["Core/Utilities.js"]],function(f,h,m){var z=m.error,F=m.extendClass,L=m.fireEvent,K=m.getOptions,C=m.isObject,y=m.merge,e=m.objectEach;m=function(){function f(e,h){var v=y(f.defaultOptions,h);this.chart=e;this._i=e.series.length;e.series.push(this);this.options=v;this.userOptions=y(h)}f.addSeries=function(e,h){f.seriesTypes[e]=
h};f.cleanRecursively=function(h,m){var v={};e(h,function(e,l){if(C(h[l],!0)&&!h.nodeType&&m[l])e=f.cleanRecursively(h[l],m[l]),Object.keys(e).length&&(v[l]=e);else if(C(h[l])||h[l]!==m[l])v[l]=h[l]});return v};f.getSeries=function(e,h){void 0===h&&(h={});var v=e.options.chart;v=h.type||v.type||v.defaultSeriesType||"";var n=f.seriesTypes[v];n||z(17,!0,e,{missingModuleFor:v});return new n(e,h)};f.seriesType=function(e,m,D,n,l){var v=K().plotOptions||{},w=f.seriesTypes;m=m||"";v[e]=y(v[m],D);f.addSeries(e,
F(w[m]||function(){},n));w[e].prototype.type=e;l&&(w[e].prototype.pointClass=F(h,l));return w[e]};f.prototype.update=function(e,h){void 0===h&&(h=!0);var m=this;e=f.cleanRecursively(e,this.userOptions);var n=e.type;"undefined"!==typeof n&&n!==m.type&&(m=f.getSeries(m.chart,e));L(m,"update",{newOptions:e});m.userOptions=y(e);L(m,"afterUpdate",{newOptions:e});h&&m.chart.redraw();return m};f.defaultOptions={type:"base"};f.seriesTypes={};return f}();m.prototype.pointClass=h;f.seriesType=m.seriesType;
f.seriesTypes=m.seriesTypes;return m});N(m,"Core/Chart/Chart.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Axis/Axis.js"],m["Core/Series/Series.js"],m["Core/Globals.js"],m["Core/Legend.js"],m["Core/MSPointer.js"],m["Core/Options.js"],m["Core/Pointer.js"],m["Core/Time.js"],m["Core/Utilities.js"]],function(f,h,m,z,F,L,K,C,y,e){var I=f.animate,v=f.animObject,x=f.setAnimation,D=z.charts,n=z.doc,l=z.win,J=K.defaultOptions,w=e.addEvent,r=e.attr,d=e.createElement,g=e.css,c=e.defined,a=e.discardElement,
q=e.erase,p=e.error,B=e.extend,A=e.find,G=e.fireEvent,M=e.getStyle,T=e.isArray,Q=e.isFunction,O=e.isNumber,E=e.isObject,u=e.isString,b=e.merge,k=e.numberFormat,t=e.objectEach,H=e.pick,R=e.pInt,U=e.relativeLength,Z=e.removeEvent,aa=e.splat,ba=e.syncTimeout,S=e.uniqueKey,Y=z.marginNames,W=function(){function f(a,b,c){this.yAxis=this.xAxis=this.userOptions=this.titleOffset=this.time=this.symbolCounter=this.spacingBox=this.spacing=this.series=this.renderTo=this.renderer=this.pointer=this.pointCount=this.plotWidth=
this.plotTop=this.plotLeft=this.plotHeight=this.plotBox=this.options=this.numberFormatter=this.margin=this.legend=this.labelCollectors=this.isResizing=this.index=this.container=this.colorCounter=this.clipBox=this.chartWidth=this.chartHeight=this.bounds=this.axisOffset=this.axes=void 0;this.getArgs(a,b,c)}f.prototype.getArgs=function(a,b,c){u(a)||a.nodeName?(this.renderTo=a,this.init(b,c)):this.init(a,b)};f.prototype.init=function(a,c){var d,g=a.series,e=a.plotOptions||{};G(this,"init",{args:arguments},
function(){a.series=null;d=b(J,a);var f=d.chart||{};t(d.plotOptions,function(a,c){E(a)&&(a.tooltip=e[c]&&b(e[c].tooltip)||void 0)});d.tooltip.userOptions=a.chart&&a.chart.forExport&&a.tooltip.userOptions||a.tooltip;d.series=a.series=g;this.userOptions=a;var p=f.events;this.margin=[];this.spacing=[];this.bounds={h:{},v:{}};this.labelCollectors=[];this.callback=c;this.isResizing=0;this.options=d;this.axes=[];this.series=[];this.time=a.time&&Object.keys(a.time).length?new y(a.time):z.time;this.numberFormatter=
f.numberFormatter||k;this.styledMode=f.styledMode;this.hasCartesianSeries=f.showAxes;var l=this;l.index=D.length;D.push(l);z.chartCount++;p&&t(p,function(a,b){Q(a)&&w(l,b,a)});l.xAxis=[];l.yAxis=[];l.pointCount=l.colorCounter=l.symbolCounter=0;G(l,"afterInit");l.firstRender()})};f.prototype.initSeries=function(a){var b=this.options.chart;b=a.type||b.type||b.defaultSeriesType;var c=m.seriesTypes[b];c||p(17,!0,this,{missingModuleFor:b});b=new c(this,a);"function"===typeof b.init&&b.init(this,a);return b};
f.prototype.setSeriesData=function(){this.getSeriesOrderByLinks().forEach(function(a){a.points||a.data||!a.enabledDataSorting||a.setData(a.options.data,!1)})};f.prototype.getSeriesOrderByLinks=function(){return this.series.concat().sort(function(a,b){return a.linkedSeries.length||b.linkedSeries.length?b.linkedSeries.length-a.linkedSeries.length:0})};f.prototype.orderSeries=function(a){var b=this.series;for(a=a||0;a<b.length;a++)b[a]&&(b[a].index=a,b[a].name=b[a].getName())};f.prototype.isInsidePlot=
function(a,b,c){var d=c?b:a;a=c?a:b;d={x:d,y:a,isInsidePlot:0<=d&&d<=this.plotWidth&&0<=a&&a<=this.plotHeight};G(this,"afterIsInsidePlot",d);return d.isInsidePlot};f.prototype.redraw=function(a){G(this,"beforeRedraw");var b=this,c=b.axes,d=b.series,g=b.pointer,k=b.legend,e=b.userOptions.legend,f=b.isDirtyLegend,t=b.hasCartesianSeries,p=b.isDirtyBox,l=b.renderer,q=l.isHidden(),h=[];b.setResponsive&&b.setResponsive(!1);x(b.hasRendered?a:!1,b);q&&b.temporaryDisplay();b.layOutTitles();for(a=d.length;a--;){var n=
d[a];if(n.options.stacking){var u=!0;if(n.isDirty){var r=!0;break}}}if(r)for(a=d.length;a--;)n=d[a],n.options.stacking&&(n.isDirty=!0);d.forEach(function(a){a.isDirty&&("point"===a.options.legendType?("function"===typeof a.updateTotals&&a.updateTotals(),f=!0):e&&(e.labelFormatter||e.labelFormat)&&(f=!0));a.isDirtyData&&G(a,"updatedData")});f&&k&&k.options.enabled&&(k.render(),b.isDirtyLegend=!1);u&&b.getStacks();t&&c.forEach(function(a){b.isResizing&&O(a.min)||(a.updateNames(),a.setScale())});b.getMargins();
t&&(c.forEach(function(a){a.isDirty&&(p=!0)}),c.forEach(function(a){var b=a.min+","+a.max;a.extKey!==b&&(a.extKey=b,h.push(function(){G(a,"afterSetExtremes",B(a.eventArgs,a.getExtremes()));delete a.eventArgs}));(p||u)&&a.redraw()}));p&&b.drawChartBox();G(b,"predraw");d.forEach(function(a){(p||a.isDirty)&&a.visible&&a.redraw();a.isDirtyData=!1});g&&g.reset(!0);l.draw();G(b,"redraw");G(b,"render");q&&b.temporaryDisplay(!0);h.forEach(function(a){a.call()})};f.prototype.get=function(a){function b(b){return b.id===
a||b.options&&b.options.id===a}var c=this.series,d;var g=A(this.axes,b)||A(this.series,b);for(d=0;!g&&d<c.length;d++)g=A(c[d].points||[],b);return g};f.prototype.getAxes=function(){var a=this,b=this.options,c=b.xAxis=aa(b.xAxis||{});b=b.yAxis=aa(b.yAxis||{});G(this,"getAxes");c.forEach(function(a,b){a.index=b;a.isX=!0});b.forEach(function(a,b){a.index=b});c.concat(b).forEach(function(b){new h(a,b)});G(this,"afterGetAxes")};f.prototype.getSelectedPoints=function(){var a=[];this.series.forEach(function(b){a=
a.concat(b.getPointsCollection().filter(function(a){return H(a.selectedStaging,a.selected)}))});return a};f.prototype.getSelectedSeries=function(){return this.series.filter(function(a){return a.selected})};f.prototype.setTitle=function(a,b,c){this.applyDescription("title",a);this.applyDescription("subtitle",b);this.applyDescription("caption",void 0);this.layOutTitles(c)};f.prototype.applyDescription=function(a,c){var d=this,g="title"===a?{color:"#333333",fontSize:this.options.isStock?"16px":"18px"}:
{color:"#666666"};g=this.options[a]=b(!this.styledMode&&{style:g},this.options[a],c);var k=this[a];k&&c&&(this[a]=k=k.destroy());g&&!k&&(k=this.renderer.text(g.text,0,0,g.useHTML).attr({align:g.align,"class":"highcharts-"+a,zIndex:g.zIndex||4}).add(),k.update=function(b){d[{title:"setTitle",subtitle:"setSubtitle",caption:"setCaption"}[a]](b)},this.styledMode||k.css(g.style),this[a]=k)};f.prototype.layOutTitles=function(a){var b=[0,0,0],c=this.renderer,d=this.spacingBox;["title","subtitle","caption"].forEach(function(a){var g=
this[a],k=this.options[a],e=k.verticalAlign||"top";a="title"===a?-3:"top"===e?b[0]+2:0;if(g){if(!this.styledMode)var f=k.style.fontSize;f=c.fontMetrics(f,g).b;g.css({width:(k.width||d.width+(k.widthAdjust||0))+"px"});var t=Math.round(g.getBBox(k.useHTML).height);g.align(B({y:"bottom"===e?f:a+f,height:t},k),!1,"spacingBox");k.floating||("top"===e?b[0]=Math.ceil(b[0]+t):"bottom"===e&&(b[2]=Math.ceil(b[2]+t)))}},this);b[0]&&"top"===(this.options.title.verticalAlign||"top")&&(b[0]+=this.options.title.margin);
b[2]&&"bottom"===this.options.caption.verticalAlign&&(b[2]+=this.options.caption.margin);var g=!this.titleOffset||this.titleOffset.join(",")!==b.join(",");this.titleOffset=b;G(this,"afterLayOutTitles");!this.isDirtyBox&&g&&(this.isDirtyBox=this.isDirtyLegend=g,this.hasRendered&&H(a,!0)&&this.isDirtyBox&&this.redraw())};f.prototype.getChartSize=function(){var a=this.options.chart,b=a.width;a=a.height;var d=this.renderTo;c(b)||(this.containerWidth=M(d,"width"));c(a)||(this.containerHeight=M(d,"height"));
this.chartWidth=Math.max(0,b||this.containerWidth||600);this.chartHeight=Math.max(0,U(a,this.chartWidth)||(1<this.containerHeight?this.containerHeight:400))};f.prototype.temporaryDisplay=function(a){var b=this.renderTo;if(a)for(;b&&b.style;)b.hcOrigStyle&&(g(b,b.hcOrigStyle),delete b.hcOrigStyle),b.hcOrigDetached&&(n.body.removeChild(b),b.hcOrigDetached=!1),b=b.parentNode;else for(;b&&b.style;){n.body.contains(b)||b.parentNode||(b.hcOrigDetached=!0,n.body.appendChild(b));if("none"===M(b,"display",
!1)||b.hcOricDetached)b.hcOrigStyle={display:b.style.display,height:b.style.height,overflow:b.style.overflow},a={display:"block",overflow:"hidden"},b!==this.renderTo&&(a.height=0),g(b,a),b.offsetWidth||b.style.setProperty("display","block","important");b=b.parentNode;if(b===n.body)break}};f.prototype.setClassName=function(a){this.container.className="highcharts-container "+(a||"")};f.prototype.getContainer=function(){var a=this.options,b=a.chart;var c=this.renderTo;var k=S(),e,f;c||(this.renderTo=
c=b.renderTo);u(c)&&(this.renderTo=c=n.getElementById(c));c||p(13,!0,this);var t=R(r(c,"data-highcharts-chart"));O(t)&&D[t]&&D[t].hasRendered&&D[t].destroy();r(c,"data-highcharts-chart",this.index);c.innerHTML="";b.skipClone||c.offsetWidth||this.temporaryDisplay();this.getChartSize();t=this.chartWidth;var l=this.chartHeight;g(c,{overflow:"hidden"});this.styledMode||(e=B({position:"relative",overflow:"hidden",width:t+"px",height:l+"px",textAlign:"left",lineHeight:"normal",zIndex:0,"-webkit-tap-highlight-color":"rgba(0,0,0,0)",
userSelect:"none"},b.style));this.container=c=d("div",{id:k},e,c);this._cursor=c.style.cursor;this.renderer=new (z[b.renderer]||z.Renderer)(c,t,l,null,b.forExport,a.exporting&&a.exporting.allowHTML,this.styledMode);x(void 0,this);this.setClassName(b.className);if(this.styledMode)for(f in a.defs)this.renderer.definition(a.defs[f]);else this.renderer.setStyle(b.style);this.renderer.chartIndex=this.index;G(this,"afterGetContainer")};f.prototype.getMargins=function(a){var b=this.spacing,d=this.margin,
g=this.titleOffset;this.resetMargins();g[0]&&!c(d[0])&&(this.plotTop=Math.max(this.plotTop,g[0]+b[0]));g[2]&&!c(d[2])&&(this.marginBottom=Math.max(this.marginBottom,g[2]+b[2]));this.legend&&this.legend.display&&this.legend.adjustMargins(d,b);G(this,"getMargins");a||this.getAxisMargins()};f.prototype.getAxisMargins=function(){var a=this,b=a.axisOffset=[0,0,0,0],d=a.colorAxis,g=a.margin,k=function(a){a.forEach(function(a){a.visible&&a.getOffset()})};a.hasCartesianSeries?k(a.axes):d&&d.length&&k(d);
Y.forEach(function(d,k){c(g[k])||(a[d]+=b[k])});a.setChartSize()};f.prototype.reflow=function(a){var b=this,d=b.options.chart,g=b.renderTo,k=c(d.width)&&c(d.height),f=d.width||M(g,"width");d=d.height||M(g,"height");g=a?a.target:l;if(!k&&!b.isPrinting&&f&&d&&(g===l||g===n)){if(f!==b.containerWidth||d!==b.containerHeight)e.clearTimeout(b.reflowTimeout),b.reflowTimeout=ba(function(){b.container&&b.setSize(void 0,void 0,!1)},a?100:0);b.containerWidth=f;b.containerHeight=d}};f.prototype.setReflow=function(a){var b=
this;!1===a||this.unbindReflow?!1===a&&this.unbindReflow&&(this.unbindReflow=this.unbindReflow()):(this.unbindReflow=w(l,"resize",function(a){b.options&&b.reflow(a)}),w(this,"destroy",this.unbindReflow))};f.prototype.setSize=function(a,b,c){var d=this,k=d.renderer;d.isResizing+=1;x(c,d);c=k.globalAnimation;d.oldChartHeight=d.chartHeight;d.oldChartWidth=d.chartWidth;"undefined"!==typeof a&&(d.options.chart.width=a);"undefined"!==typeof b&&(d.options.chart.height=b);d.getChartSize();d.styledMode||(c?
I:g)(d.container,{width:d.chartWidth+"px",height:d.chartHeight+"px"},c);d.setChartSize(!0);k.setSize(d.chartWidth,d.chartHeight,c);d.axes.forEach(function(a){a.isDirty=!0;a.setScale()});d.isDirtyLegend=!0;d.isDirtyBox=!0;d.layOutTitles();d.getMargins();d.redraw(c);d.oldChartHeight=null;G(d,"resize");ba(function(){d&&G(d,"endResize",null,function(){--d.isResizing})},v(c).duration)};f.prototype.setChartSize=function(a){var b=this.inverted,c=this.renderer,d=this.chartWidth,g=this.chartHeight,k=this.options.chart,
e=this.spacing,f=this.clipOffset,t,p,l,q;this.plotLeft=t=Math.round(this.plotLeft);this.plotTop=p=Math.round(this.plotTop);this.plotWidth=l=Math.max(0,Math.round(d-t-this.marginRight));this.plotHeight=q=Math.max(0,Math.round(g-p-this.marginBottom));this.plotSizeX=b?q:l;this.plotSizeY=b?l:q;this.plotBorderWidth=k.plotBorderWidth||0;this.spacingBox=c.spacingBox={x:e[3],y:e[0],width:d-e[3]-e[1],height:g-e[0]-e[2]};this.plotBox=c.plotBox={x:t,y:p,width:l,height:q};d=2*Math.floor(this.plotBorderWidth/
2);b=Math.ceil(Math.max(d,f[3])/2);c=Math.ceil(Math.max(d,f[0])/2);this.clipBox={x:b,y:c,width:Math.floor(this.plotSizeX-Math.max(d,f[1])/2-b),height:Math.max(0,Math.floor(this.plotSizeY-Math.max(d,f[2])/2-c))};a||this.axes.forEach(function(a){a.setAxisSize();a.setAxisTranslation()});G(this,"afterSetChartSize",{skipAxes:a})};f.prototype.resetMargins=function(){G(this,"resetMargins");var a=this,b=a.options.chart;["margin","spacing"].forEach(function(c){var d=b[c],g=E(d)?d:[d,d,d,d];["Top","Right",
"Bottom","Left"].forEach(function(d,k){a[c][k]=H(b[c+d],g[k])})});Y.forEach(function(b,c){a[b]=H(a.margin[c],a.spacing[c])});a.axisOffset=[0,0,0,0];a.clipOffset=[0,0,0,0]};f.prototype.drawChartBox=function(){var a=this.options.chart,b=this.renderer,c=this.chartWidth,d=this.chartHeight,g=this.chartBackground,k=this.plotBackground,e=this.plotBorder,f=this.styledMode,t=this.plotBGImage,p=a.backgroundColor,l=a.plotBackgroundColor,q=a.plotBackgroundImage,h,n=this.plotLeft,u=this.plotTop,r=this.plotWidth,
m=this.plotHeight,w=this.plotBox,v=this.clipRect,H=this.clipBox,B="animate";g||(this.chartBackground=g=b.rect().addClass("highcharts-background").add(),B="attr");if(f)var A=h=g.strokeWidth();else{A=a.borderWidth||0;h=A+(a.shadow?8:0);p={fill:p||"none"};if(A||g["stroke-width"])p.stroke=a.borderColor,p["stroke-width"]=A;g.attr(p).shadow(a.shadow)}g[B]({x:h/2,y:h/2,width:c-h-A%2,height:d-h-A%2,r:a.borderRadius});B="animate";k||(B="attr",this.plotBackground=k=b.rect().addClass("highcharts-plot-background").add());
k[B](w);f||(k.attr({fill:l||"none"}).shadow(a.plotShadow),q&&(t?(q!==t.attr("href")&&t.attr("href",q),t.animate(w)):this.plotBGImage=b.image(q,n,u,r,m).add()));v?v.animate({width:H.width,height:H.height}):this.clipRect=b.clipRect(H);B="animate";e||(B="attr",this.plotBorder=e=b.rect().addClass("highcharts-plot-border").attr({zIndex:1}).add());f||e.attr({stroke:a.plotBorderColor,"stroke-width":a.plotBorderWidth||0,fill:"none"});e[B](e.crisp({x:n,y:u,width:r,height:m},-e.strokeWidth()));this.isDirtyBox=
!1;G(this,"afterDrawChartBox")};f.prototype.propFromSeries=function(){var a=this,b=a.options.chart,c,d=a.options.series,g,k;["inverted","angular","polar"].forEach(function(e){c=m.seriesTypes[b.type||b.defaultSeriesType];k=b[e]||c&&c.prototype[e];for(g=d&&d.length;!k&&g--;)(c=m.seriesTypes[d[g].type])&&c.prototype[e]&&(k=!0);a[e]=k})};f.prototype.linkSeries=function(){var a=this,b=a.series;b.forEach(function(a){a.linkedSeries.length=0});b.forEach(function(b){var c=b.options.linkedTo;u(c)&&(c=":previous"===
c?a.series[b.index-1]:a.get(c))&&c.linkedParent!==b&&(c.linkedSeries.push(b),b.linkedParent=c,c.enabledDataSorting&&b.setDataSortingOptions(),b.visible=H(b.options.visible,c.options.visible,b.visible))});G(this,"afterLinkSeries")};f.prototype.renderSeries=function(){this.series.forEach(function(a){a.translate();a.render()})};f.prototype.renderLabels=function(){var a=this,b=a.options.labels;b.items&&b.items.forEach(function(c){var d=B(b.style,c.style),g=R(d.left)+a.plotLeft,k=R(d.top)+a.plotTop+12;
delete d.left;delete d.top;a.renderer.text(c.html,g,k).attr({zIndex:2}).css(d).add()})};f.prototype.render=function(){var a=this.axes,b=this.colorAxis,c=this.renderer,d=this.options,g=0,k=function(a){a.forEach(function(a){a.visible&&a.render()})};this.setTitle();this.legend=new F(this,d.legend);this.getStacks&&this.getStacks();this.getMargins(!0);this.setChartSize();d=this.plotWidth;a.some(function(a){if(a.horiz&&a.visible&&a.options.labels.enabled&&a.series.length)return g=21,!0});var e=this.plotHeight=
Math.max(this.plotHeight-g,0);a.forEach(function(a){a.setScale()});this.getAxisMargins();var f=1.1<d/this.plotWidth;var t=1.05<e/this.plotHeight;if(f||t)a.forEach(function(a){(a.horiz&&f||!a.horiz&&t)&&a.setTickInterval(!0)}),this.getMargins();this.drawChartBox();this.hasCartesianSeries?k(a):b&&b.length&&k(b);this.seriesGroup||(this.seriesGroup=c.g("series-group").attr({zIndex:3}).add());this.renderSeries();this.renderLabels();this.addCredits();this.setResponsive&&this.setResponsive();this.updateContainerScaling();
this.hasRendered=!0};f.prototype.addCredits=function(a){var c=this,d=b(!0,this.options.credits,a);d.enabled&&!this.credits&&(this.credits=this.renderer.text(d.text+(this.mapCredits||""),0,0).addClass("highcharts-credits").on("click",function(){d.href&&(l.location.href=d.href)}).attr({align:d.position.align,zIndex:8}),c.styledMode||this.credits.css(d.style),this.credits.add().align(d.position),this.credits.update=function(a){c.credits=c.credits.destroy();c.addCredits(a)})};f.prototype.updateContainerScaling=
function(){var a=this.container;if(2<a.offsetWidth&&2<a.offsetHeight&&a.getBoundingClientRect){var b=a.getBoundingClientRect(),c=b.width/a.offsetWidth;a=b.height/a.offsetHeight;1!==c||1!==a?this.containerScaling={scaleX:c,scaleY:a}:delete this.containerScaling}};f.prototype.destroy=function(){var b=this,c=b.axes,d=b.series,g=b.container,k,e=g&&g.parentNode;G(b,"destroy");b.renderer.forExport?q(D,b):D[b.index]=void 0;z.chartCount--;b.renderTo.removeAttribute("data-highcharts-chart");Z(b);for(k=c.length;k--;)c[k]=
c[k].destroy();this.scroller&&this.scroller.destroy&&this.scroller.destroy();for(k=d.length;k--;)d[k]=d[k].destroy();"title subtitle chartBackground plotBackground plotBGImage plotBorder seriesGroup clipRect credits pointer rangeSelector legend resetZoomButton tooltip renderer".split(" ").forEach(function(a){var c=b[a];c&&c.destroy&&(b[a]=c.destroy())});g&&(g.innerHTML="",Z(g),e&&a(g));t(b,function(a,c){delete b[c]})};f.prototype.firstRender=function(){var a=this,b=a.options;if(!a.isReadyToRender||
a.isReadyToRender()){a.getContainer();a.resetMargins();a.setChartSize();a.propFromSeries();a.getAxes();(T(b.series)?b.series:[]).forEach(function(b){a.initSeries(b)});a.linkSeries();a.setSeriesData();G(a,"beforeRender");C&&(a.pointer=z.hasTouch||!l.PointerEvent&&!l.MSPointerEvent?new C(a,b):new L(a,b));a.render();if(!a.renderer.imgCount&&!a.hasLoaded)a.onload();a.temporaryDisplay(!0)}};f.prototype.onload=function(){this.callbacks.concat([this.callback]).forEach(function(a){a&&"undefined"!==typeof this.index&&
a.apply(this,[this])},this);G(this,"load");G(this,"render");c(this.index)&&this.setReflow(this.options.chart.reflow);this.hasLoaded=!0};return f}();W.prototype.callbacks=[];z.chart=function(a,b,c){return new W(a,b,c)};return z.Chart=W});N(m,"Extensions/ScrollablePlotArea.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Chart/Chart.js"],m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h,m,z){var F=f.stop,L=z.addEvent,K=z.createElement,C=z.pick;"";L(h,"afterSetChartSize",function(f){var e=
this.options.chart.scrollablePlotArea,h=e&&e.minWidth;e=e&&e.minHeight;if(!this.renderer.forExport){if(h){if(this.scrollablePixelsX=h=Math.max(0,h-this.chartWidth)){this.plotWidth+=h;this.inverted?(this.clipBox.height+=h,this.plotBox.height+=h):(this.clipBox.width+=h,this.plotBox.width+=h);var v={1:{name:"right",value:h}}}}else e&&(this.scrollablePixelsY=h=Math.max(0,e-this.chartHeight))&&(this.plotHeight+=h,this.inverted?(this.clipBox.width+=h,this.plotBox.width+=h):(this.clipBox.height+=h,this.plotBox.height+=
h),v={2:{name:"bottom",value:h}});v&&!f.skipAxes&&this.axes.forEach(function(e){v[e.side]?e.getPlotLinePath=function(){var f=v[e.side].name,h=this[f];this[f]=h-v[e.side].value;var l=m.Axis.prototype.getPlotLinePath.apply(this,arguments);this[f]=h;return l}:(e.setAxisSize(),e.setAxisTranslation())})}});L(h,"render",function(){this.scrollablePixelsX||this.scrollablePixelsY?(this.setUpScrolling&&this.setUpScrolling(),this.applyFixed()):this.fixedDiv&&this.applyFixed()});h.prototype.setUpScrolling=function(){var f=
this,e={WebkitOverflowScrolling:"touch",overflowX:"hidden",overflowY:"hidden"};this.scrollablePixelsX&&(e.overflowX="auto");this.scrollablePixelsY&&(e.overflowY="auto");this.scrollingParent=K("div",{className:"highcharts-scrolling-parent"},{position:"relative"},this.renderTo);this.scrollingContainer=K("div",{className:"highcharts-scrolling"},e,this.scrollingParent);L(this.scrollingContainer,"scroll",function(){f.pointer&&delete f.pointer.chartPosition});this.innerContainer=K("div",{className:"highcharts-inner-container"},
null,this.scrollingContainer);this.innerContainer.appendChild(this.container);this.setUpScrolling=null};h.prototype.moveFixedElements=function(){var f=this.container,e=this.fixedRenderer,h=".highcharts-contextbutton .highcharts-credits .highcharts-legend .highcharts-legend-checkbox .highcharts-navigator-series .highcharts-navigator-xaxis .highcharts-navigator-yaxis .highcharts-navigator .highcharts-reset-zoom .highcharts-scrollbar .highcharts-subtitle .highcharts-title".split(" "),m;this.scrollablePixelsX&&
!this.inverted?m=".highcharts-yaxis":this.scrollablePixelsX&&this.inverted?m=".highcharts-xaxis":this.scrollablePixelsY&&!this.inverted?m=".highcharts-xaxis":this.scrollablePixelsY&&this.inverted&&(m=".highcharts-yaxis");h.push(m,m+"-labels");h.forEach(function(h){[].forEach.call(f.querySelectorAll(h),function(f){(f.namespaceURI===e.SVG_NS?e.box:e.box.parentNode).appendChild(f);f.style.pointerEvents="auto"})})};h.prototype.applyFixed=function(){var f,e,h=!this.fixedDiv,v=this.options.chart.scrollablePlotArea;
h?(this.fixedDiv=K("div",{className:"highcharts-fixed"},{position:"absolute",overflow:"hidden",pointerEvents:"none",zIndex:2,top:0},null,!0),null===(f=this.scrollingContainer)||void 0===f?void 0:f.parentNode.insertBefore(this.fixedDiv,this.scrollingContainer),this.renderTo.style.overflow="visible",this.fixedRenderer=f=new m.Renderer(this.fixedDiv,this.chartWidth,this.chartHeight,null===(e=this.options.chart)||void 0===e?void 0:e.style),this.scrollableMask=f.path().attr({fill:this.options.chart.backgroundColor||
"#fff","fill-opacity":C(v.opacity,.85),zIndex:-1}).addClass("highcharts-scrollable-mask").add(),this.moveFixedElements(),L(this,"afterShowResetZoom",this.moveFixedElements),L(this,"afterLayOutTitles",this.moveFixedElements)):this.fixedRenderer.setSize(this.chartWidth,this.chartHeight);e=this.chartWidth+(this.scrollablePixelsX||0);f=this.chartHeight+(this.scrollablePixelsY||0);F(this.container);this.container.style.width=e+"px";this.container.style.height=f+"px";this.renderer.boxWrapper.attr({width:e,
height:f,viewBox:[0,0,e,f].join(" ")});this.chartBackground.attr({width:e,height:f});this.scrollingContainer.style.height=this.chartHeight+"px";h&&(v.scrollPositionX&&(this.scrollingContainer.scrollLeft=this.scrollablePixelsX*v.scrollPositionX),v.scrollPositionY&&(this.scrollingContainer.scrollTop=this.scrollablePixelsY*v.scrollPositionY));f=this.axisOffset;h=this.plotTop-f[0]-1;v=this.plotLeft-f[3]-1;e=this.plotTop+this.plotHeight+f[2]+1;f=this.plotLeft+this.plotWidth+f[1]+1;var x=this.plotLeft+
this.plotWidth-(this.scrollablePixelsX||0),D=this.plotTop+this.plotHeight-(this.scrollablePixelsY||0);h=this.scrollablePixelsX?[["M",0,h],["L",this.plotLeft-1,h],["L",this.plotLeft-1,e],["L",0,e],["Z"],["M",x,h],["L",this.chartWidth,h],["L",this.chartWidth,e],["L",x,e],["Z"]]:this.scrollablePixelsY?[["M",v,0],["L",v,this.plotTop-1],["L",f,this.plotTop-1],["L",f,0],["Z"],["M",v,D],["L",v,this.chartHeight],["L",f,this.chartHeight],["L",f,D],["Z"]]:[["M",0,0]];"adjustHeight"!==this.redrawTrigger&&this.scrollableMask.attr({d:h})}});
N(m,"Core/Axis/StackingAxis.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Utilities.js"]],function(f,h){var m=f.getDeferredAnimation,z=h.addEvent,F=h.destroyObjectProperties,L=h.fireEvent,K=h.objectEach,C=h.pick,y=function(){function e(e){this.oldStacks={};this.stacks={};this.stacksTouched=0;this.axis=e}e.prototype.buildStacks=function(){var e=this.axis,f=e.series,h=C(e.options.reversedStacks,!0),m=f.length,n;if(!e.isXAxis){this.usePercentage=!1;for(n=m;n--;){var l=f[h?n:m-n-1];l.setStackedPoints();
l.setGroupedPoints()}for(n=0;n<m;n++)f[n].modifyStacks();L(e,"afterBuildStacks")}};e.prototype.cleanStacks=function(){if(!this.axis.isXAxis){if(this.oldStacks)var e=this.stacks=this.oldStacks;K(e,function(e){K(e,function(e){e.cumulative=e.total})})}};e.prototype.resetStacks=function(){var e=this,f=e.stacks;e.axis.isXAxis||K(f,function(f){K(f,function(h,n){h.touched<e.stacksTouched?(h.destroy(),delete f[n]):(h.total=null,h.cumulative=null)})})};e.prototype.renderStackTotals=function(){var e=this.axis,
f=e.chart,h=f.renderer,D=this.stacks;e=m(f,e.options.stackLabels.animation);var n=this.stackTotalGroup=this.stackTotalGroup||h.g("stack-labels").attr({visibility:"visible",zIndex:6,opacity:0}).add();n.translate(f.plotLeft,f.plotTop);K(D,function(e){K(e,function(e){e.render(n)})});n.animate({opacity:1},e)};return e}();return function(){function e(){}e.compose=function(f){z(f,"init",e.onInit);z(f,"destroy",e.onDestroy)};e.onDestroy=function(){var e=this.stacking;if(e){var f=e.stacks;K(f,function(e,
h){F(e);f[h]=null});e&&e.stackTotalGroup&&e.stackTotalGroup.destroy()}};e.onInit=function(){this.stacking||(this.stacking=new y(this))};return e}()});N(m,"Mixins/LegendSymbol.js",[m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h){var m=h.merge,z=h.pick;return f.LegendSymbolMixin={drawRectangle:function(f,h){var m=f.symbolHeight,C=f.options.squareSymbol;h.legendSymbol=this.chart.renderer.rect(C?(f.symbolWidth-m)/2:0,f.baseline-m+1,C?m:f.symbolWidth,m,z(f.options.symbolRadius,m/2)).addClass("highcharts-point").attr({zIndex:3}).add(h.legendGroup)},
drawLineMarker:function(f){var h=this.options,F=h.marker,C=f.symbolWidth,y=f.symbolHeight,e=y/2,I=this.chart.renderer,v=this.legendGroup;f=f.baseline-Math.round(.3*f.fontMetrics.b);var x={};this.chart.styledMode||(x={"stroke-width":h.lineWidth||0},h.dashStyle&&(x.dashstyle=h.dashStyle));this.legendLine=I.path([["M",0,f],["L",C,f]]).addClass("highcharts-graph").attr(x).add(v);F&&!1!==F.enabled&&C&&(h=Math.min(z(F.radius,e),e),0===this.symbol.indexOf("url")&&(F=m(F,{width:y,height:y}),h=0),this.legendSymbol=
F=I.symbol(this.symbol,C/2-h,f-h,2*h,2*h,F).addClass("highcharts-point").add(v),F.isMarker=!0)}}});N(m,"Core/Series/CartesianSeries.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Series/Series.js"],m["Core/Globals.js"],m["Mixins/LegendSymbol.js"],m["Core/Options.js"],m["Core/Series/Point.js"],m["Core/Renderer/SVG/SVGElement.js"],m["Core/Utilities.js"]],function(f,h,m,z,F,L,K,C){var y=f.animObject,e=F.defaultOptions,I=C.addEvent,v=C.arrayMax,x=C.arrayMin,D=C.clamp,n=C.correctFloat,l=C.defined,
J=C.erase,w=C.error,r=C.extend,d=C.find,g=C.fireEvent,c=C.getNestedProperty,a=C.isArray,q=C.isFunction,p=C.isNumber,B=C.isString,A=C.merge,G=C.objectEach,M=C.pick,T=C.removeEvent,Q=C.splat,O=C.syncTimeout;"";var E=h.seriesTypes,u=m.win;f=h.seriesType("line",void 0,{lineWidth:2,allowPointSelect:!1,crisp:!0,showCheckbox:!1,animation:{duration:1E3},events:{},marker:{enabledThreshold:2,lineColor:"#ffffff",lineWidth:0,radius:4,states:{normal:{animation:!0},hover:{animation:{duration:50},enabled:!0,radiusPlus:2,
lineWidthPlus:1},select:{fillColor:"#cccccc",lineColor:"#000000",lineWidth:2}}},point:{events:{}},dataLabels:{animation:{},align:"center",defer:!0,formatter:function(){var a=this.series.chart.numberFormatter;return"number"!==typeof this.y?"":a(this.y,-1)},padding:5,style:{fontSize:"11px",fontWeight:"bold",color:"contrast",textOutline:"1px contrast"},verticalAlign:"bottom",x:0,y:0},cropThreshold:300,opacity:1,pointRange:0,softThreshold:!0,states:{normal:{animation:!0},hover:{animation:{duration:50},
lineWidthPlus:1,marker:{},halo:{size:10,opacity:.25}},select:{animation:{duration:0}},inactive:{animation:{duration:50},opacity:.2}},stickyTracking:!0,turboThreshold:1E3,findNearestPointBy:"x"},{axisTypes:["xAxis","yAxis"],coll:"series",colorCounter:0,cropShoulder:1,directTouch:!1,isCartesian:!0,parallelArrays:["x","y"],pointClass:L,requireSorting:!0,sorted:!0,init:function(a,c){g(this,"init",{options:c});var b=this,d=a.series,k;this.eventOptions=this.eventOptions||{};this.eventsToUnbind=[];b.chart=
a;b.options=c=b.setOptions(c);b.linkedSeries=[];b.bindAxes();r(b,{name:c.name,state:"",visible:!1!==c.visible,selected:!0===c.selected});var e=c.events;G(e,function(a,c){q(a)&&b.eventOptions[c]!==a&&(q(b.eventOptions[c])&&T(b,c,b.eventOptions[c]),b.eventOptions[c]=a,I(b,c,a))});if(e&&e.click||c.point&&c.point.events&&c.point.events.click||c.allowPointSelect)a.runTrackerClick=!0;b.getColor();b.getSymbol();b.parallelArrays.forEach(function(a){b[a+"Data"]||(b[a+"Data"]=[])});b.isCartesian&&(a.hasCartesianSeries=
!0);d.length&&(k=d[d.length-1]);b._i=M(k&&k._i,-1)+1;b.opacity=b.options.opacity;a.orderSeries(this.insert(d));c.dataSorting&&c.dataSorting.enabled?b.setDataSortingOptions():b.points||b.data||b.setData(c.data,!1);g(this,"afterInit")},is:function(a){return E[a]&&this instanceof E[a]},insert:function(a){var b=this.options.index,c;if(p(b)){for(c=a.length;c--;)if(b>=M(a[c].options.index,a[c]._i)){a.splice(c+1,0,this);break}-1===c&&a.unshift(this);c+=1}else a.push(this);return M(c,a.length-1)},bindAxes:function(){var a=
this,c=a.options,d=a.chart,e;g(this,"bindAxes",null,function(){(a.axisTypes||[]).forEach(function(b){d[b].forEach(function(d){e=d.options;if(c[b]===e.index||"undefined"!==typeof c[b]&&c[b]===e.id||"undefined"===typeof c[b]&&0===e.index)a.insert(d.series),a[b]=d,d.isDirty=!0});a[b]||a.optionalAxis===b||w(18,!0,d)})});g(this,"afterBindAxes")},updateParallelArrays:function(a,c){var b=a.series,d=arguments,g=p(c)?function(d){var g="y"===d&&b.toYData?b.toYData(a):a[d];b[d+"Data"][c]=g}:function(a){Array.prototype[c].apply(b[a+
"Data"],Array.prototype.slice.call(d,2))};b.parallelArrays.forEach(g)},hasData:function(){return this.visible&&"undefined"!==typeof this.dataMax&&"undefined"!==typeof this.dataMin||this.visible&&this.yData&&0<this.yData.length},autoIncrement:function(){var a=this.options,c=this.xIncrement,d,g=a.pointIntervalUnit,e=this.chart.time;c=M(c,a.pointStart,0);this.pointInterval=d=M(this.pointInterval,a.pointInterval,1);g&&(a=new e.Date(c),"day"===g?e.set("Date",a,e.get("Date",a)+d):"month"===g?e.set("Month",
a,e.get("Month",a)+d):"year"===g&&e.set("FullYear",a,e.get("FullYear",a)+d),d=a.getTime()-c);this.xIncrement=c+d;return c},setDataSortingOptions:function(){var a=this.options;r(this,{requireSorting:!1,sorted:!1,enabledDataSorting:!0,allowDG:!1});l(a.pointRange)||(a.pointRange=1)},setOptions:function(a){var b=this.chart,c=b.options,d=c.plotOptions,f=b.userOptions||{};a=A(a);b=b.styledMode;var p={plotOptions:d,userOptions:a};g(this,"setOptions",p);var h=p.plotOptions[this.type],q=f.plotOptions||{};
this.userOptions=p.userOptions;f=A(h,d.series,f.plotOptions&&f.plotOptions[this.type],a);this.tooltipOptions=A(e.tooltip,e.plotOptions.series&&e.plotOptions.series.tooltip,e.plotOptions[this.type].tooltip,c.tooltip.userOptions,d.series&&d.series.tooltip,d[this.type].tooltip,a.tooltip);this.stickyTracking=M(a.stickyTracking,q[this.type]&&q[this.type].stickyTracking,q.series&&q.series.stickyTracking,this.tooltipOptions.shared&&!this.noSharedTooltip?!0:f.stickyTracking);null===h.marker&&delete f.marker;
this.zoneAxis=f.zoneAxis;c=this.zones=(f.zones||[]).slice();!f.negativeColor&&!f.negativeFillColor||f.zones||(d={value:f[this.zoneAxis+"Threshold"]||f.threshold||0,className:"highcharts-negative"},b||(d.color=f.negativeColor,d.fillColor=f.negativeFillColor),c.push(d));c.length&&l(c[c.length-1].value)&&c.push(b?{}:{color:this.color,fillColor:this.fillColor});g(this,"afterSetOptions",{options:f});return f},getName:function(){return M(this.options.name,"Series "+(this.index+1))},getCyclic:function(a,
c,d){var b=this.chart,g=this.userOptions,k=a+"Index",e=a+"Counter",f=d?d.length:M(b.options.chart[a+"Count"],b[a+"Count"]);if(!c){var p=M(g[k],g["_"+k]);l(p)||(b.series.length||(b[e]=0),g["_"+k]=p=b[e]%f,b[e]+=1);d&&(c=d[p])}"undefined"!==typeof p&&(this[k]=p);this[a]=c},getColor:function(){this.chart.styledMode?this.getCyclic("color"):this.options.colorByPoint?this.options.color=null:this.getCyclic("color",this.options.color||e.plotOptions[this.type].color,this.chart.options.colors)},getPointsCollection:function(){return(this.hasGroupedData?
this.points:this.data)||[]},getSymbol:function(){this.getCyclic("symbol",this.options.marker.symbol,this.chart.options.symbols)},findPointIndex:function(a,c){var b=a.id,g=a.x,k=this.points,e,f=this.options.dataSorting;if(b)var l=this.chart.get(b);else if(this.linkedParent||this.enabledDataSorting){var h=f&&f.matchByName?"name":"index";l=d(k,function(b){return!b.touched&&b[h]===a[h]});if(!l)return}if(l){var q=l&&l.index;"undefined"!==typeof q&&(e=!0)}"undefined"===typeof q&&p(g)&&(q=this.xData.indexOf(g,
c));-1!==q&&"undefined"!==typeof q&&this.cropped&&(q=q>=this.cropStart?q-this.cropStart:q);!e&&k[q]&&k[q].touched&&(q=void 0);return q},drawLegendSymbol:z.drawLineMarker,updateData:function(a,c){var b=this.options,d=b.dataSorting,g=this.points,k=[],e,f,h,q=this.requireSorting,n=a.length===g.length,u=!0;this.xIncrement=null;a.forEach(function(a,c){var f=l(a)&&this.pointClass.prototype.optionsToObject.call({series:this},a)||{};var t=f.x;if(f.id||p(t)){if(t=this.findPointIndex(f,h),-1===t||"undefined"===
typeof t?k.push(a):g[t]&&a!==b.data[t]?(g[t].update(a,!1,null,!1),g[t].touched=!0,q&&(h=t+1)):g[t]&&(g[t].touched=!0),!n||c!==t||d&&d.enabled||this.hasDerivedData)e=!0}else k.push(a)},this);if(e)for(a=g.length;a--;)(f=g[a])&&!f.touched&&f.remove&&f.remove(!1,c);else!n||d&&d.enabled?u=!1:(a.forEach(function(a,b){g[b].update&&a!==g[b].y&&g[b].update(a,!1,null,!1)}),k.length=0);g.forEach(function(a){a&&(a.touched=!1)});if(!u)return!1;k.forEach(function(a){this.addPoint(a,!1,null,null,!1)},this);null===
this.xIncrement&&this.xData&&this.xData.length&&(this.xIncrement=v(this.xData),this.autoIncrement());return!0},setData:function(b,c,d,g){var k=this,e=k.points,f=e&&e.length||0,t,l=k.options,h=k.chart,q=l.dataSorting,n=null,u=k.xAxis;n=l.turboThreshold;var r=this.xData,m=this.yData,A=(t=k.pointArrayMap)&&t.length,v=l.keys,E=0,H=1,O;b=b||[];t=b.length;c=M(c,!0);q&&q.enabled&&(b=this.sortData(b));!1!==g&&t&&f&&!k.cropped&&!k.hasGroupedData&&k.visible&&!k.isSeriesBoosting&&(O=this.updateData(b,d));if(!O){k.xIncrement=
null;k.colorCounter=0;this.parallelArrays.forEach(function(a){k[a+"Data"].length=0});if(n&&t>n)if(n=k.getFirstValidPoint(b),p(n))for(d=0;d<t;d++)r[d]=this.autoIncrement(),m[d]=b[d];else if(a(n))if(A)for(d=0;d<t;d++)g=b[d],r[d]=g[0],m[d]=g.slice(1,A+1);else for(v&&(E=v.indexOf("x"),H=v.indexOf("y"),E=0<=E?E:0,H=0<=H?H:1),d=0;d<t;d++)g=b[d],r[d]=g[E],m[d]=g[H];else w(12,!1,h);else for(d=0;d<t;d++)"undefined"!==typeof b[d]&&(g={series:k},k.pointClass.prototype.applyOptions.apply(g,[b[d]]),k.updateParallelArrays(g,
d));m&&B(m[0])&&w(14,!0,h);k.data=[];k.options.data=k.userOptions.data=b;for(d=f;d--;)e[d]&&e[d].destroy&&e[d].destroy();u&&(u.minRange=u.userMinRange);k.isDirty=h.isDirtyBox=!0;k.isDirtyData=!!e;d=!1}"point"===l.legendType&&(this.processData(),this.generatePoints());c&&h.redraw(d)},sortData:function(a){var b=this,d=b.options.dataSorting.sortKey||"y",g=function(a,b){return l(b)&&a.pointClass.prototype.optionsToObject.call({series:a},b)||{}};a.forEach(function(c,d){a[d]=g(b,c);a[d].index=d},this);
a.concat().sort(function(a,b){a=c(d,a);b=c(d,b);return b<a?-1:b>a?1:0}).forEach(function(a,b){a.x=b},this);b.linkedSeries&&b.linkedSeries.forEach(function(b){var c=b.options,d=c.data;c.dataSorting&&c.dataSorting.enabled||!d||(d.forEach(function(c,k){d[k]=g(b,c);a[k]&&(d[k].x=a[k].x,d[k].index=k)}),b.setData(d,!1))});return a},getProcessedData:function(a){var b=this.xData,c=this.yData,d=b.length;var g=0;var e=this.xAxis,f=this.options;var p=f.cropThreshold;var l=a||this.getExtremesFromAll||f.getExtremesFromAll,
h=this.isCartesian;a=e&&e.val2lin;f=!(!e||!e.logarithmic);var q=this.requireSorting;if(e){e=e.getExtremes();var n=e.min;var u=e.max}if(h&&this.sorted&&!l&&(!p||d>p||this.forceCrop))if(b[d-1]<n||b[0]>u)b=[],c=[];else if(this.yData&&(b[0]<n||b[d-1]>u)){g=this.cropData(this.xData,this.yData,n,u);b=g.xData;c=g.yData;g=g.start;var r=!0}for(p=b.length||1;--p;)if(d=f?a(b[p])-a(b[p-1]):b[p]-b[p-1],0<d&&("undefined"===typeof m||d<m))var m=d;else 0>d&&q&&(w(15,!1,this.chart),q=!1);return{xData:b,yData:c,cropped:r,
cropStart:g,closestPointRange:m}},processData:function(a){var b=this.xAxis;if(this.isCartesian&&!this.isDirty&&!b.isDirty&&!this.yAxis.isDirty&&!a)return!1;a=this.getProcessedData();this.cropped=a.cropped;this.cropStart=a.cropStart;this.processedXData=a.xData;this.processedYData=a.yData;this.closestPointRange=this.basePointRange=a.closestPointRange},cropData:function(a,c,d,g,e){var b=a.length,k=0,f=b,p;e=M(e,this.cropShoulder);for(p=0;p<b;p++)if(a[p]>=d){k=Math.max(0,p-e);break}for(d=p;d<b;d++)if(a[d]>
g){f=d+e;break}return{xData:a.slice(k,f),yData:c.slice(k,f),start:k,end:f}},generatePoints:function(){var a=this.options,c=a.data,d=this.data,e,f=this.processedXData,p=this.processedYData,l=this.pointClass,h=f.length,q=this.cropStart||0,n=this.hasGroupedData;a=a.keys;var u=[],m;d||n||(d=[],d.length=c.length,d=this.data=d);a&&n&&(this.options.keys=!1);for(m=0;m<h;m++){var w=q+m;if(n){var v=(new l).init(this,[f[m]].concat(Q(p[m])));v.dataGroup=this.groupMap[m];v.dataGroup.options&&(v.options=v.dataGroup.options,
r(v,v.dataGroup.options),delete v.dataLabels)}else(v=d[w])||"undefined"===typeof c[w]||(d[w]=v=(new l).init(this,c[w],f[m]));v&&(v.index=w,u[m]=v)}this.options.keys=a;if(d&&(h!==(e=d.length)||n))for(m=0;m<e;m++)m!==q||n||(m+=h),d[m]&&(d[m].destroyElements(),d[m].plotX=void 0);this.data=d;this.points=u;g(this,"afterGeneratePoints")},getXExtremes:function(a){return{min:x(a),max:v(a)}},getExtremes:function(b,c){var d=this.xAxis,k=this.yAxis,e=this.processedXData||this.xData,f=[],l=0,h=0;var q=0;var n=
this.requireSorting?this.cropShoulder:0,u=k?k.positiveValuesOnly:!1,r;b=b||this.stackedYData||this.processedYData||[];k=b.length;d&&(q=d.getExtremes(),h=q.min,q=q.max);for(r=0;r<k;r++){var m=e[r];var w=b[r];var A=(p(w)||a(w))&&(w.length||0<w||!u);m=c||this.getExtremesFromAll||this.options.getExtremesFromAll||this.cropped||!d||(e[r+n]||m)>=h&&(e[r-n]||m)<=q;if(A&&m)if(A=w.length)for(;A--;)p(w[A])&&(f[l++]=w[A]);else f[l++]=w}b={dataMin:x(f),dataMax:v(f)};g(this,"afterGetExtremes",{dataExtremes:b});
return b},applyExtremes:function(){var a=this.getExtremes();this.dataMin=a.dataMin;this.dataMax=a.dataMax;return a},getFirstValidPoint:function(a){for(var b=null,c=a.length,d=0;null===b&&d<c;)b=a[d],d++;return b},translate:function(){this.processedXData||this.processData();this.generatePoints();var b=this.options,c=b.stacking,d=this.xAxis,e=d.categories,f=this.enabledDataSorting,h=this.yAxis,q=this.points,u=q.length,r=!!this.modifyValue,m,w=this.pointPlacementToXValue(),v=!!w,A=b.threshold,B=b.startFromThreshold?
A:0,E,O=this.zoneAxis||"y",G=Number.MAX_VALUE;for(m=0;m<u;m++){var x=q[m],y=x.x,z=x.y,C=x.low,J=c&&h.stacking&&h.stacking.stacks[(this.negStacks&&z<(B?0:A)?"-":"")+this.stackKey];if(h.positiveValuesOnly&&!h.validatePositiveValue(z)||d.positiveValuesOnly&&!d.validatePositiveValue(y))x.isNull=!0;x.plotX=E=n(D(d.translate(y,0,0,0,1,w,"flags"===this.type),-1E5,1E5));if(c&&this.visible&&J&&J[y]){var F=this.getStackIndicator(F,y,this.index);if(!x.isNull){var Q=J[y];var I=Q.points[F.key]}}a(I)&&(C=I[0],
z=I[1],C===B&&F.key===J[y].base&&(C=M(p(A)&&A,h.min)),h.positiveValuesOnly&&0>=C&&(C=null),x.total=x.stackTotal=Q.total,x.percentage=Q.total&&x.y/Q.total*100,x.stackY=z,this.irregularWidths||Q.setOffset(this.pointXOffset||0,this.barW||0));x.yBottom=l(C)?D(h.translate(C,0,1,0,1),-1E5,1E5):null;r&&(z=this.modifyValue(z,x));x.plotY="number"===typeof z&&Infinity!==z?D(h.translate(z,0,1,0,1),-1E5,1E5):void 0;x.isInside=this.isPointInside(x);x.clientX=v?n(d.translate(y,0,0,0,1,w)):E;x.negative=x[O]<(b[O+
"Threshold"]||A||0);x.category=e&&"undefined"!==typeof e[x.x]?e[x.x]:x.x;if(!x.isNull&&!1!==x.visible){"undefined"!==typeof K&&(G=Math.min(G,Math.abs(E-K)));var K=E}x.zone=this.zones.length&&x.getZone();!x.graphic&&this.group&&f&&(x.isNew=!0)}this.closestPointRangePx=G;g(this,"afterTranslate")},getValidPoints:function(a,c,d){var b=this.chart;return(a||this.points||[]).filter(function(a){return c&&!b.isInsidePlot(a.plotX,a.plotY,b.inverted)?!1:!1!==a.visible&&(d||!a.isNull)})},getClipBox:function(a,
c){var b=this.options,d=this.chart,g=d.inverted,k=this.xAxis,e=k&&this.yAxis,f=d.options.chart.scrollablePlotArea||{};a&&!1===b.clip&&e?a=g?{y:-d.chartWidth+e.len+e.pos,height:d.chartWidth,width:d.chartHeight,x:-d.chartHeight+k.len+k.pos}:{y:-e.pos,height:d.chartHeight,width:d.chartWidth,x:-k.pos}:(a=this.clipBox||d.clipBox,c&&(a.width=d.plotSizeX,a.x=(d.scrollablePixelsX||0)*(f.scrollPositionX||0)));return c?{width:a.width,x:a.x}:a},setClip:function(a){var b=this.chart,c=this.options,d=b.renderer,
g=b.inverted,e=this.clipBox,f=this.getClipBox(a),p=this.sharedClipKey||["_sharedClip",a&&a.duration,a&&a.easing,f.height,c.xAxis,c.yAxis].join(),l=b[p],h=b[p+"m"];a&&(f.width=0,g&&(f.x=b.plotHeight+(!1!==c.clip?0:b.plotTop)));l?b.hasLoaded||l.attr(f):(a&&(b[p+"m"]=h=d.clipRect(g?b.plotSizeX+99:-99,g?-b.plotLeft:-b.plotTop,99,g?b.chartWidth:b.chartHeight)),b[p]=l=d.clipRect(f),l.count={length:0});a&&!l.count[this.index]&&(l.count[this.index]=!0,l.count.length+=1);if(!1!==c.clip||a)this.group.clip(a||
e?l:b.clipRect),this.markerGroup.clip(h),this.sharedClipKey=p;a||(l.count[this.index]&&(delete l.count[this.index],--l.count.length),0===l.count.length&&p&&b[p]&&(e||(b[p]=b[p].destroy()),b[p+"m"]&&(b[p+"m"]=b[p+"m"].destroy())))},animate:function(a){var b=this.chart,c=y(this.options.animation);if(!b.hasRendered)if(a)this.setClip(c);else{var d=this.sharedClipKey;a=b[d];var g=this.getClipBox(c,!0);a&&a.animate(g,c);b[d+"m"]&&b[d+"m"].animate({width:g.width+99,x:g.x-(b.inverted?0:99)},c)}},afterAnimate:function(){this.setClip();
g(this,"afterAnimate");this.finishedAnimating=!0},drawPoints:function(){var a=this.points,c=this.chart,d,g,e=this.options.marker,f=this[this.specialGroup]||this.markerGroup,p=this.xAxis,l=M(e.enabled,!p||p.isRadial?!0:null,this.closestPointRangePx>=e.enabledThreshold*e.radius);if(!1!==e.enabled||this._hasPointMarkers)for(d=0;d<a.length;d++){var h=a[d];var q=(g=h.graphic)?"animate":"attr";var n=h.marker||{};var u=!!h.marker;if((l&&"undefined"===typeof n.enabled||n.enabled)&&!h.isNull&&!1!==h.visible){var r=
M(n.symbol,this.symbol);var m=this.markerAttribs(h,h.selected&&"select");this.enabledDataSorting&&(h.startXPos=p.reversed?-m.width:p.width);var w=!1!==h.isInside;g?g[w?"show":"hide"](w).animate(m):w&&(0<m.width||h.hasImage)&&(h.graphic=g=c.renderer.symbol(r,m.x,m.y,m.width,m.height,u?n:e).add(f),this.enabledDataSorting&&c.hasRendered&&(g.attr({x:h.startXPos}),q="animate"));g&&"animate"===q&&g[w?"show":"hide"](w).animate(m);if(g&&!c.styledMode)g[q](this.pointAttribs(h,h.selected&&"select"));g&&g.addClass(h.getClassName(),
!0)}else g&&(h.graphic=g.destroy())}},markerAttribs:function(a,c){var b=this.options,d=b.marker,g=a.marker||{},e=g.symbol||d.symbol,k=M(g.radius,d.radius);c&&(d=d.states[c],c=g.states&&g.states[c],k=M(c&&c.radius,d&&d.radius,k+(d&&d.radiusPlus||0)));a.hasImage=e&&0===e.indexOf("url");a.hasImage&&(k=0);a={x:b.crisp?Math.floor(a.plotX)-k:a.plotX-k,y:a.plotY-k};k&&(a.width=a.height=2*k);return a},pointAttribs:function(a,c){var b=this.options.marker,d=a&&a.options,g=d&&d.marker||{},e=this.color,k=d&&
d.color,f=a&&a.color;d=M(g.lineWidth,b.lineWidth);var p=a&&a.zone&&a.zone.color;a=1;e=k||p||f||e;k=g.fillColor||b.fillColor||e;e=g.lineColor||b.lineColor||e;c=c||"normal";b=b.states[c];c=g.states&&g.states[c]||{};d=M(c.lineWidth,b.lineWidth,d+M(c.lineWidthPlus,b.lineWidthPlus,0));k=c.fillColor||b.fillColor||k;e=c.lineColor||b.lineColor||e;a=M(c.opacity,b.opacity,a);return{stroke:e,"stroke-width":d,fill:k,opacity:a}},destroy:function(a){var b=this,c=b.chart,d=/AppleWebKit\/533/.test(u.navigator.userAgent),
e,f,p=b.data||[],h,l;g(b,"destroy");this.removeEvents(a);(b.axisTypes||[]).forEach(function(a){(l=b[a])&&l.series&&(J(l.series,b),l.isDirty=l.forceRedraw=!0)});b.legendItem&&b.chart.legend.destroyItem(b);for(f=p.length;f--;)(h=p[f])&&h.destroy&&h.destroy();b.points=null;C.clearTimeout(b.animationTimeout);G(b,function(a,b){a instanceof K&&!a.survive&&(e=d&&"group"===b?"hide":"destroy",a[e]())});c.hoverSeries===b&&(c.hoverSeries=null);J(c.series,b);c.orderSeries();G(b,function(c,d){a&&"hcEvents"===
d||delete b[d]})},getGraphPath:function(a,c,d){var b=this,g=b.options,e=g.step,k,f=[],p=[],h;a=a||b.points;(k=a.reversed)&&a.reverse();(e={right:1,center:2}[e]||e&&3)&&k&&(e=4-e);a=this.getValidPoints(a,!1,!(g.connectNulls&&!c&&!d));a.forEach(function(k,q){var t=k.plotX,n=k.plotY,u=a[q-1];(k.leftCliff||u&&u.rightCliff)&&!d&&(h=!0);k.isNull&&!l(c)&&0<q?h=!g.connectNulls:k.isNull&&!c?h=!0:(0===q||h?q=[["M",k.plotX,k.plotY]]:b.getPointSpline?q=[b.getPointSpline(a,k,q)]:e?(q=1===e?[["L",u.plotX,n]]:2===
e?[["L",(u.plotX+t)/2,u.plotY],["L",(u.plotX+t)/2,n]]:[["L",t,u.plotY]],q.push(["L",t,n])):q=[["L",t,n]],p.push(k.x),e&&(p.push(k.x),2===e&&p.push(k.x)),f.push.apply(f,q),h=!1)});f.xMap=p;return b.graphPath=f},drawGraph:function(){var a=this,c=this.options,d=(this.gappedPath||this.getGraphPath).call(this),g=this.chart.styledMode,e=[["graph","highcharts-graph"]];g||e[0].push(c.lineColor||this.color||"#cccccc",c.dashStyle);e=a.getZonesGraphs(e);e.forEach(function(b,e){var k=b[0],f=a[k],p=f?"animate":
"attr";f?(f.endX=a.preventGraphAnimation?null:d.xMap,f.animate({d:d})):d.length&&(a[k]=f=a.chart.renderer.path(d).addClass(b[1]).attr({zIndex:1}).add(a.group));f&&!g&&(k={stroke:b[2],"stroke-width":c.lineWidth,fill:a.fillGraph&&a.color||"none"},b[3]?k.dashstyle=b[3]:"square"!==c.linecap&&(k["stroke-linecap"]=k["stroke-linejoin"]="round"),f[p](k).shadow(2>e&&c.shadow));f&&(f.startX=d.xMap,f.isArea=d.isArea)})},getZonesGraphs:function(a){this.zones.forEach(function(b,c){c=["zone-graph-"+c,"highcharts-graph highcharts-zone-graph-"+
c+" "+(b.className||"")];this.chart.styledMode||c.push(b.color||this.color,b.dashStyle||this.options.dashStyle);a.push(c)},this);return a},applyZones:function(){var a=this,c=this.chart,d=c.renderer,g=this.zones,e,f,p=this.clips||[],h,l=this.graph,q=this.area,n=Math.max(c.chartWidth,c.chartHeight),u=this[(this.zoneAxis||"y")+"Axis"],r=c.inverted,m,w,v,A=!1,B,E;if(g.length&&(l||q)&&u&&"undefined"!==typeof u.min){var O=u.reversed;var G=u.horiz;l&&!this.showLine&&l.hide();q&&q.hide();var x=u.getExtremes();
g.forEach(function(b,g){e=O?G?c.plotWidth:0:G?0:u.toPixels(x.min)||0;e=D(M(f,e),0,n);f=D(Math.round(u.toPixels(M(b.value,x.max),!0)||0),0,n);A&&(e=f=u.toPixels(x.max));m=Math.abs(e-f);w=Math.min(e,f);v=Math.max(e,f);u.isXAxis?(h={x:r?v:w,y:0,width:m,height:n},G||(h.x=c.plotHeight-h.x)):(h={x:0,y:r?v:w,width:n,height:m},G&&(h.y=c.plotWidth-h.y));r&&d.isVML&&(h=u.isXAxis?{x:0,y:O?w:v,height:h.width,width:c.chartWidth}:{x:h.y-c.plotLeft-c.spacingBox.x,y:0,width:h.height,height:c.chartHeight});p[g]?p[g].animate(h):
p[g]=d.clipRect(h);B=a["zone-area-"+g];E=a["zone-graph-"+g];l&&E&&E.clip(p[g]);q&&B&&B.clip(p[g]);A=b.value>x.max;a.resetZones&&0===f&&(f=void 0)});this.clips=p}else a.visible&&(l&&l.show(!0),q&&q.show(!0))},invertGroups:function(a){function b(){["group","markerGroup"].forEach(function(b){c[b]&&(d.renderer.isVML&&c[b].attr({width:c.yAxis.len,height:c.xAxis.len}),c[b].width=c.yAxis.len,c[b].height=c.xAxis.len,c[b].invert(c.isRadialSeries?!1:a))})}var c=this,d=c.chart;c.xAxis&&(c.eventsToUnbind.push(I(d,
"resize",b)),b(),c.invertGroups=b)},plotGroup:function(a,c,d,g,e){var b=this[a],k=!b;d={visibility:d,zIndex:g||.1};"undefined"===typeof this.opacity||this.chart.styledMode||"inactive"===this.state||(d.opacity=this.opacity);k&&(this[a]=b=this.chart.renderer.g().add(e));b.addClass("highcharts-"+c+" highcharts-series-"+this.index+" highcharts-"+this.type+"-series "+(l(this.colorIndex)?"highcharts-color-"+this.colorIndex+" ":"")+(this.options.className||"")+(b.hasClass("highcharts-tracker")?" highcharts-tracker":
""),!0);b.attr(d)[k?"attr":"animate"](this.getPlotBox());return b},getPlotBox:function(){var a=this.chart,c=this.xAxis,d=this.yAxis;a.inverted&&(c=d,d=this.xAxis);return{translateX:c?c.left:a.plotLeft,translateY:d?d.top:a.plotTop,scaleX:1,scaleY:1}},removeEvents:function(a){a?this.eventsToUnbind.length&&(this.eventsToUnbind.forEach(function(a){a()}),this.eventsToUnbind.length=0):T(this)},render:function(){var a=this,c=a.chart,d=a.options,e=y(d.animation),f=!a.finishedAnimating&&c.renderer.isSVG&&
e.duration,p=a.visible?"inherit":"hidden",h=d.zIndex,l=a.hasRendered,q=c.seriesGroup,n=c.inverted;g(this,"render");var u=a.plotGroup("group","series",p,h,q);a.markerGroup=a.plotGroup("markerGroup","markers",p,h,q);f&&a.animate&&a.animate(!0);u.inverted=a.isCartesian||a.invertable?n:!1;a.drawGraph&&(a.drawGraph(),a.applyZones());a.visible&&a.drawPoints();a.drawDataLabels&&a.drawDataLabels();a.redrawPoints&&a.redrawPoints();a.drawTracker&&!1!==a.options.enableMouseTracking&&a.drawTracker();a.invertGroups(n);
!1===d.clip||a.sharedClipKey||l||u.clip(c.clipRect);f&&a.animate&&a.animate();l||(f&&e.defer&&(f+=e.defer),a.animationTimeout=O(function(){a.afterAnimate()},f||0));a.isDirty=!1;a.hasRendered=!0;g(a,"afterRender")},redraw:function(){var a=this.chart,c=this.isDirty||this.isDirtyData,d=this.group,g=this.xAxis,e=this.yAxis;d&&(a.inverted&&d.attr({width:a.plotWidth,height:a.plotHeight}),d.animate({translateX:M(g&&g.left,a.plotLeft),translateY:M(e&&e.top,a.plotTop)}));this.translate();this.render();c&&
delete this.kdTree},kdAxisArray:["clientX","plotY"],searchPoint:function(a,c){var b=this.xAxis,d=this.yAxis,g=this.chart.inverted;return this.searchKDTree({clientX:g?b.len-a.chartY+b.pos:a.chartX-b.pos,plotY:g?d.len-a.chartX+d.pos:a.chartY-d.pos},c,a)},buildKDTree:function(a){function b(a,d,g){var e;if(e=a&&a.length){var f=c.kdAxisArray[d%g];a.sort(function(a,b){return a[f]-b[f]});e=Math.floor(e/2);return{point:a[e],left:b(a.slice(0,e),d+1,g),right:b(a.slice(e+1),d+1,g)}}}this.buildingKdTree=!0;var c=
this,d=-1<c.options.findNearestPointBy.indexOf("y")?2:1;delete c.kdTree;O(function(){c.kdTree=b(c.getValidPoints(null,!c.directTouch),d,d);c.buildingKdTree=!1},c.options.kdNow||a&&"touchstart"===a.type?0:1)},searchKDTree:function(a,c,d){function b(a,c,d,p){var h=c.point,q=g.kdAxisArray[d%p],n=h;var u=l(a[e])&&l(h[e])?Math.pow(a[e]-h[e],2):null;var t=l(a[f])&&l(h[f])?Math.pow(a[f]-h[f],2):null;t=(u||0)+(t||0);h.dist=l(t)?Math.sqrt(t):Number.MAX_VALUE;h.distX=l(u)?Math.sqrt(u):Number.MAX_VALUE;q=a[q]-
h[q];t=0>q?"left":"right";u=0>q?"right":"left";c[t]&&(t=b(a,c[t],d+1,p),n=t[k]<n[k]?t:h);c[u]&&Math.sqrt(q*q)<n[k]&&(a=b(a,c[u],d+1,p),n=a[k]<n[k]?a:n);return n}var g=this,e=this.kdAxisArray[0],f=this.kdAxisArray[1],k=c?"distX":"dist";c=-1<g.options.findNearestPointBy.indexOf("y")?2:1;this.kdTree||this.buildingKdTree||this.buildKDTree(d);if(this.kdTree)return b(a,this.kdTree,c,c)},pointPlacementToXValue:function(){var a=this.options,c=a.pointRange,d=this.xAxis;a=a.pointPlacement;"between"===a&&(a=
d.reversed?-.5:.5);return p(a)?a*M(c,d.pointRange):0},isPointInside:function(a){return"undefined"!==typeof a.plotY&&"undefined"!==typeof a.plotX&&0<=a.plotY&&a.plotY<=this.yAxis.len&&0<=a.plotX&&a.plotX<=this.xAxis.len}});"";return f});N(m,"Series/LineSeries.js",[m["Core/Series/CartesianSeries.js"],m["Core/Globals.js"]],function(f,h){h.Series=f;return h.Series});N(m,"Extensions/Stacking.js",[m["Core/Axis/Axis.js"],m["Core/Chart/Chart.js"],m["Core/Globals.js"],m["Core/Axis/StackingAxis.js"],m["Core/Utilities.js"]],
function(f,h,m,z,F){var L=F.correctFloat,K=F.defined,C=F.destroyObjectProperties,y=F.format,e=F.isNumber,I=F.pick;"";var v=m.Series,x=function(){function f(e,f,h,m,r){var d=e.chart.inverted;this.axis=e;this.isNegative=h;this.options=f=f||{};this.x=m;this.total=null;this.points={};this.hasValidPoints=!1;this.stack=r;this.rightCliff=this.leftCliff=0;this.alignOptions={align:f.align||(d?h?"left":"right":"center"),verticalAlign:f.verticalAlign||(d?"middle":h?"bottom":"top"),y:f.y,x:f.x};this.textAlign=
f.textAlign||(d?h?"right":"left":"center")}f.prototype.destroy=function(){C(this,this.axis)};f.prototype.render=function(e){var f=this.axis.chart,h=this.options,n=h.format;n=n?y(n,this,f):h.formatter.call(this);this.label?this.label.attr({text:n,visibility:"hidden"}):(this.label=f.renderer.label(n,null,null,h.shape,null,null,h.useHTML,!1,"stack-labels"),n={r:h.borderRadius||0,text:n,rotation:h.rotation,padding:I(h.padding,5),visibility:"hidden"},f.styledMode||(n.fill=h.backgroundColor,n.stroke=h.borderColor,
n["stroke-width"]=h.borderWidth,this.label.css(h.style)),this.label.attr(n),this.label.added||this.label.add(e));this.label.labelrank=f.plotHeight};f.prototype.setOffset=function(f,h,m,w,r){var d=this.axis,g=d.chart;w=d.translate(d.stacking.usePercentage?100:w?w:this.total,0,0,0,1);m=d.translate(m?m:0);m=K(w)&&Math.abs(w-m);f=I(r,g.xAxis[0].translate(this.x))+f;d=K(w)&&this.getStackBox(g,this,f,w,h,m,d);h=this.label;m=this.isNegative;f="justify"===I(this.options.overflow,"justify");var c=this.textAlign;
h&&d&&(r=h.getBBox(),w=h.padding,c="left"===c?g.inverted?-w:w:"right"===c?r.width:g.inverted&&"center"===c?r.width/2:g.inverted?m?r.width+w:-w:r.width/2,m=g.inverted?r.height/2:m?-w:r.height,this.alignOptions.x=I(this.options.x,0),this.alignOptions.y=I(this.options.y,0),d.x-=c,d.y-=m,h.align(this.alignOptions,null,d),g.isInsidePlot(h.alignAttr.x+c-this.alignOptions.x,h.alignAttr.y+m-this.alignOptions.y)?h.show():(h.alignAttr.y=-9999,f=!1),f&&v.prototype.justifyDataLabel.call(this.axis,h,this.alignOptions,
h.alignAttr,r,d),h.attr({x:h.alignAttr.x,y:h.alignAttr.y}),I(!f&&this.options.crop,!0)&&((g=e(h.x)&&e(h.y)&&g.isInsidePlot(h.x-w+h.width,h.y)&&g.isInsidePlot(h.x+w,h.y))||h.hide()))};f.prototype.getStackBox=function(e,f,h,m,r,d,g){var c=f.axis.reversed,a=e.inverted,q=g.height+g.pos-(a?e.plotLeft:e.plotTop);f=f.isNegative&&!c||!f.isNegative&&c;return{x:a?f?m-g.right:m-d+g.pos-e.plotLeft:h+e.xAxis[0].transB-e.plotLeft,y:a?g.height-h-r:f?q-m-d:q-m,width:a?d:r,height:a?r:d}};return f}();h.prototype.getStacks=
function(){var e=this,f=e.inverted;e.yAxis.forEach(function(e){e.stacking&&e.stacking.stacks&&e.hasVisibleSeries&&(e.stacking.oldStacks=e.stacking.stacks)});e.series.forEach(function(h){var l=h.xAxis&&h.xAxis.options||{};!h.options.stacking||!0!==h.visible&&!1!==e.options.chart.ignoreHiddenSeries||(h.stackKey=[h.type,I(h.options.stack,""),f?l.top:l.left,f?l.height:l.width].join())})};z.compose(f);v.prototype.setGroupedPoints=function(){this.options.centerInCategory&&(this.is("column")||this.is("columnrange"))&&
!this.options.stacking&&1<this.chart.series.length&&v.prototype.setStackedPoints.call(this,"group")};v.prototype.setStackedPoints=function(e){var f=e||this.options.stacking;if(f&&(!0===this.visible||!1===this.chart.options.chart.ignoreHiddenSeries)){var h=this.processedXData,m=this.processedYData,w=[],r=m.length,d=this.options,g=d.threshold,c=I(d.startFromThreshold&&g,0);d=d.stack;e=e?this.type+","+f:this.stackKey;var a="-"+e,q=this.negStacks,p=this.yAxis,v=p.stacking.stacks,A=p.stacking.oldStacks,
G,D;p.stacking.stacksTouched+=1;for(D=0;D<r;D++){var y=h[D];var z=m[D];var O=this.getStackIndicator(O,y,this.index);var E=O.key;var u=(G=q&&z<(c?0:g))?a:e;v[u]||(v[u]={});v[u][y]||(A[u]&&A[u][y]?(v[u][y]=A[u][y],v[u][y].total=null):v[u][y]=new x(p,p.options.stackLabels,G,y,d));u=v[u][y];null!==z?(u.points[E]=u.points[this.index]=[I(u.cumulative,c)],K(u.cumulative)||(u.base=E),u.touched=p.stacking.stacksTouched,0<O.index&&!1===this.singleStacks&&(u.points[E][0]=u.points[this.index+","+y+",0"][0])):
u.points[E]=u.points[this.index]=null;"percent"===f?(G=G?e:a,q&&v[G]&&v[G][y]?(G=v[G][y],u.total=G.total=Math.max(G.total,u.total)+Math.abs(z)||0):u.total=L(u.total+(Math.abs(z)||0))):"group"===f?null!==z&&(u.total=(u.total||0)+1):u.total=L(u.total+(z||0));u.cumulative="group"===f?(u.total||1)-1:I(u.cumulative,c)+(z||0);null!==z&&(u.points[E].push(u.cumulative),w[D]=u.cumulative,u.hasValidPoints=!0)}"percent"===f&&(p.stacking.usePercentage=!0);"group"!==f&&(this.stackedYData=w);p.stacking.oldStacks=
{}}};v.prototype.modifyStacks=function(){var e=this,f=e.stackKey,h=e.yAxis.stacking.stacks,m=e.processedXData,w,r=e.options.stacking;e[r+"Stacker"]&&[f,"-"+f].forEach(function(d){for(var g=m.length,c,a;g--;)if(c=m[g],w=e.getStackIndicator(w,c,e.index,d),a=(c=h[d]&&h[d][c])&&c.points[w.key])e[r+"Stacker"](a,c,g)})};v.prototype.percentStacker=function(e,f,h){f=f.total?100/f.total:0;e[0]=L(e[0]*f);e[1]=L(e[1]*f);this.stackedYData[h]=e[1]};v.prototype.getStackIndicator=function(e,f,h,m){!K(e)||e.x!==
f||m&&e.key!==m?e={x:f,index:0,key:m}:e.index++;e.key=[h,f,e.index].join();return e};m.StackItem=x;return m.StackItem});N(m,"Core/Dynamics.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Axis/Axis.js"],m["Core/Series/Series.js"],m["Core/Chart/Chart.js"],m["Core/Globals.js"],m["Series/LineSeries.js"],m["Core/Options.js"],m["Core/Series/Point.js"],m["Core/Time.js"],m["Core/Utilities.js"]],function(f,h,m,z,F,L,K,C,y,e){var I=f.animate,v=f.setAnimation,x=m.seriesTypes,D=K.time,n=e.addEvent,l=e.createElement,
J=e.css,w=e.defined,r=e.erase,d=e.error,g=e.extend,c=e.fireEvent,a=e.isArray,q=e.isNumber,p=e.isObject,B=e.isString,A=e.merge,G=e.objectEach,M=e.pick,T=e.relativeLength,Q=e.splat;F.cleanRecursively=function(a,c){var d={};G(a,function(b,g){if(p(a[g],!0)&&!a.nodeType&&c[g])b=F.cleanRecursively(a[g],c[g]),Object.keys(b).length&&(d[g]=b);else if(p(a[g])||a[g]!==c[g])d[g]=a[g]});return d};g(z.prototype,{addSeries:function(a,d,g){var b,e=this;a&&(d=M(d,!0),c(e,"addSeries",{options:a},function(){b=e.initSeries(a);
e.isDirtyLegend=!0;e.linkSeries();b.enabledDataSorting&&b.setData(a.data,!1);c(e,"afterAddSeries",{series:b});d&&e.redraw(g)}));return b},addAxis:function(a,c,d,b){return this.createAxis(c?"xAxis":"yAxis",{axis:a,redraw:d,animation:b})},addColorAxis:function(a,c,d){return this.createAxis("colorAxis",{axis:a,redraw:c,animation:d})},createAxis:function(a,c){var d=this.options,b="colorAxis"===a,g=c.redraw,e=c.animation;c=A(c.axis,{index:this[a].length,isX:"xAxis"===a});var f=b?new F.ColorAxis(this,c):
new h(this,c);d[a]=Q(d[a]||{});d[a].push(c);b&&(this.isDirtyLegend=!0,this.axes.forEach(function(a){a.series=[]}),this.series.forEach(function(a){a.bindAxes();a.isDirtyData=!0}));M(g,!0)&&this.redraw(e);return f},showLoading:function(a){var c=this,d=c.options,b=c.loadingDiv,e=d.loading,f=function(){b&&J(b,{left:c.plotLeft+"px",top:c.plotTop+"px",width:c.plotWidth+"px",height:c.plotHeight+"px"})};b||(c.loadingDiv=b=l("div",{className:"highcharts-loading highcharts-loading-hidden"},null,c.container),
c.loadingSpan=l("span",{className:"highcharts-loading-inner"},null,b),n(c,"redraw",f));b.className="highcharts-loading";c.loadingSpan.innerHTML=M(a,d.lang.loading,"");c.styledMode||(J(b,g(e.style,{zIndex:10})),J(c.loadingSpan,e.labelStyle),c.loadingShown||(J(b,{opacity:0,display:""}),I(b,{opacity:e.style.opacity||.5},{duration:e.showDuration||0})));c.loadingShown=!0;f()},hideLoading:function(){var a=this.options,c=this.loadingDiv;c&&(c.className="highcharts-loading highcharts-loading-hidden",this.styledMode||
I(c,{opacity:0},{duration:a.loading.hideDuration||100,complete:function(){J(c,{display:"none"})}}));this.loadingShown=!1},propsRequireDirtyBox:"backgroundColor borderColor borderWidth borderRadius plotBackgroundColor plotBackgroundImage plotBorderColor plotBorderWidth plotShadow shadow".split(" "),propsRequireReflow:"margin marginTop marginRight marginBottom marginLeft spacing spacingTop spacingRight spacingBottom spacingLeft".split(" "),propsRequireUpdateSeries:"chart.inverted chart.polar chart.ignoreHiddenSeries chart.type colors plotOptions time tooltip".split(" "),
collectionsWithUpdate:["xAxis","yAxis","zAxis","series"],update:function(a,d,g,b){var e=this,f={credits:"addCredits",title:"setTitle",subtitle:"setSubtitle",caption:"setCaption"},p,h,l,n=a.isResponsiveOptions,u=[];c(e,"update",{options:a});n||e.setResponsive(!1,!0);a=F.cleanRecursively(a,e.options);A(!0,e.userOptions,a);if(p=a.chart){A(!0,e.options.chart,p);"className"in p&&e.setClassName(p.className);"reflow"in p&&e.setReflow(p.reflow);if("inverted"in p||"polar"in p||"type"in p){e.propFromSeries();
var m=!0}"alignTicks"in p&&(m=!0);G(p,function(a,b){-1!==e.propsRequireUpdateSeries.indexOf("chart."+b)&&(h=!0);-1!==e.propsRequireDirtyBox.indexOf(b)&&(e.isDirtyBox=!0);-1!==e.propsRequireReflow.indexOf(b)&&(n?e.isDirtyBox=!0:l=!0)});!e.styledMode&&"style"in p&&e.renderer.setStyle(p.style)}!e.styledMode&&a.colors&&(this.options.colors=a.colors);a.time&&(this.time===D&&(this.time=new y(a.time)),A(!0,e.options.time,a.time));G(a,function(b,c){if(e[c]&&"function"===typeof e[c].update)e[c].update(b,!1);
else if("function"===typeof e[f[c]])e[f[c]](b);else"color"!==c&&-1===e.collectionsWithUpdate.indexOf(c)&&A(!0,e.options[c],a[c]);"chart"!==c&&-1!==e.propsRequireUpdateSeries.indexOf(c)&&(h=!0)});this.collectionsWithUpdate.forEach(function(b){if(a[b]){if("series"===b){var c=[];e[b].forEach(function(a,b){a.options.isInternal||c.push(M(a.options.index,b))})}Q(a[b]).forEach(function(a,d){var f=w(a.id),k;f&&(k=e.get(a.id));k||(k=e[b][c?c[d]:d])&&f&&w(k.options.id)&&(k=void 0);k&&k.coll===b&&(k.update(a,
!1),g&&(k.touched=!0));!k&&g&&e.collectionsWithInit[b]&&(e.collectionsWithInit[b][0].apply(e,[a].concat(e.collectionsWithInit[b][1]||[]).concat([!1])).touched=!0)});g&&e[b].forEach(function(a){a.touched||a.options.isInternal?delete a.touched:u.push(a)})}});u.forEach(function(a){a.remove&&a.remove(!1)});m&&e.axes.forEach(function(a){a.update({},!1)});h&&e.getSeriesOrderByLinks().forEach(function(a){a.chart&&a.update({},!1)},this);m=p&&p.width;p=p&&p.height;B(p)&&(p=T(p,m||e.chartWidth));l||q(m)&&m!==
e.chartWidth||q(p)&&p!==e.chartHeight?e.setSize(m,p,b):M(d,!0)&&e.redraw(b);c(e,"afterUpdate",{options:a,redraw:d,animation:b})},setSubtitle:function(a,c){this.applyDescription("subtitle",a);this.layOutTitles(c)},setCaption:function(a,c){this.applyDescription("caption",a);this.layOutTitles(c)}});z.prototype.collectionsWithInit={xAxis:[z.prototype.addAxis,[!0]],yAxis:[z.prototype.addAxis,[!1]],series:[z.prototype.addSeries]};g(C.prototype,{update:function(a,c,d,b){function g(){e.applyOptions(a);var b=
h&&e.hasDummyGraphic;b=null===e.y?!b:b;h&&b&&(e.graphic=h.destroy(),delete e.hasDummyGraphic);p(a,!0)&&(h&&h.element&&a&&a.marker&&"undefined"!==typeof a.marker.symbol&&(e.graphic=h.destroy()),a&&a.dataLabels&&e.dataLabel&&(e.dataLabel=e.dataLabel.destroy()),e.connector&&(e.connector=e.connector.destroy()));q=e.index;f.updateParallelArrays(e,q);n.data[q]=p(n.data[q],!0)||p(a,!0)?e.options:M(a,n.data[q]);f.isDirty=f.isDirtyData=!0;!f.fixedBox&&f.hasCartesianSeries&&(l.isDirtyBox=!0);"point"===n.legendType&&
(l.isDirtyLegend=!0);c&&l.redraw(d)}var e=this,f=e.series,h=e.graphic,q,l=f.chart,n=f.options;c=M(c,!0);!1===b?g():e.firePointEvent("update",{options:a},g)},remove:function(a,c){this.series.removePoint(this.series.data.indexOf(this),a,c)}});g(L.prototype,{addPoint:function(a,d,g,b,e){var f=this.options,k=this.data,p=this.chart,h=this.xAxis;h=h&&h.hasNames&&h.names;var q=f.data,l=this.xData,n;d=M(d,!0);var u={series:this};this.pointClass.prototype.applyOptions.apply(u,[a]);var m=u.x;var r=l.length;
if(this.requireSorting&&m<l[r-1])for(n=!0;r&&l[r-1]>m;)r--;this.updateParallelArrays(u,"splice",r,0,0);this.updateParallelArrays(u,r);h&&u.name&&(h[m]=u.name);q.splice(r,0,a);n&&(this.data.splice(r,0,null),this.processData());"point"===f.legendType&&this.generatePoints();g&&(k[0]&&k[0].remove?k[0].remove(!1):(k.shift(),this.updateParallelArrays(u,"shift"),q.shift()));!1!==e&&c(this,"addPoint",{point:u});this.isDirtyData=this.isDirty=!0;d&&p.redraw(b)},removePoint:function(a,c,d){var b=this,g=b.data,
e=g[a],f=b.points,p=b.chart,h=function(){f&&f.length===g.length&&f.splice(a,1);g.splice(a,1);b.options.data.splice(a,1);b.updateParallelArrays(e||{series:b},"splice",a,1);e&&e.destroy();b.isDirty=!0;b.isDirtyData=!0;c&&p.redraw()};v(d,p);c=M(c,!0);e?e.firePointEvent("remove",null,h):h()},remove:function(a,d,g,b){function e(){f.destroy(b);f.remove=null;p.isDirtyLegend=p.isDirtyBox=!0;p.linkSeries();M(a,!0)&&p.redraw(d)}var f=this,p=f.chart;!1!==g?c(f,"remove",null,e):e()},update:function(a,e){a=F.cleanRecursively(a,
this.userOptions);c(this,"update",{options:a});var f=this,b=f.chart,k=f.userOptions,p=f.initialType||f.type,h=b.options.plotOptions,q=a.type||k.type||b.options.chart.type,l=!(this.hasDerivedData||q&&q!==this.type||"undefined"!==typeof a.pointStart||"undefined"!==typeof a.pointInterval||f.hasOptionChanged("dataGrouping")||f.hasOptionChanged("pointStart")||f.hasOptionChanged("pointInterval")||f.hasOptionChanged("pointIntervalUnit")||f.hasOptionChanged("keys")),n=x[p].prototype,m,r=["eventOptions","navigatorSeries",
"baseSeries"],w=f.finishedAnimating&&{animation:!1},v={};l&&(r.push("data","isDirtyData","points","processedXData","processedYData","xIncrement","cropped","_hasPointMarkers","_hasPointLabels","mapMap","mapData","minY","maxY","minX","maxX"),!1!==a.visible&&r.push("area","graph"),f.parallelArrays.forEach(function(a){r.push(a+"Data")}),a.data&&(a.dataSorting&&g(f.options.dataSorting,a.dataSorting),this.setData(a.data,!1)));a=A(k,w,{index:"undefined"===typeof k.index?f.index:k.index,pointStart:M(h&&h.series&&
h.series.pointStart,k.pointStart,f.xData[0])},!l&&{data:f.options.data},a);l&&a.data&&(a.data=f.options.data);r=["group","markerGroup","dataLabelsGroup","transformGroup"].concat(r);r.forEach(function(a){r[a]=f[a];delete f[a]});f.remove(!1,null,!1,!0);for(m in n)f[m]=void 0;x[q||p]?g(f,x[q||p].prototype):d(17,!0,b,{missingModuleFor:q||p});r.forEach(function(a){f[a]=r[a]});f.init(b,a);if(l&&this.points){var B=f.options;!1===B.visible?(v.graphic=1,v.dataLabel=1):f._hasPointLabels||(a=B.marker,k=B.dataLabels,
a&&(!1===a.enabled||"symbol"in a)&&(v.graphic=1),k&&!1===k.enabled&&(v.dataLabel=1));this.points.forEach(function(a){a&&a.series&&(a.resolveColor(),Object.keys(v).length&&a.destroyElements(v),!1===B.showInLegend&&a.legendItem&&b.legend.destroyItem(a))},this)}f.initialType=p;b.linkSeries();c(this,"afterUpdate");M(e,!0)&&b.redraw(l?void 0:!1)},setName:function(a){this.name=this.options.name=this.userOptions.name=a;this.chart.isDirtyLegend=!0},hasOptionChanged:function(a){var c=this.options[a],d=this.chart.options.plotOptions,
b=this.userOptions[a];return b?c!==b:c!==M(d&&d[this.type]&&d[this.type][a],d&&d.series&&d.series[a],c)}});g(h.prototype,{update:function(a,c){var d=this.chart,b=a&&a.events||{};a=A(this.userOptions,a);d.options[this.coll].indexOf&&(d.options[this.coll][d.options[this.coll].indexOf(this.userOptions)]=a);G(d.options[this.coll].events,function(a,c){"undefined"===typeof b[c]&&(b[c]=void 0)});this.destroy(!0);this.init(d,g(a,{events:b}));d.isDirtyBox=!0;M(c,!0)&&d.redraw()},remove:function(c){for(var d=
this.chart,g=this.coll,b=this.series,e=b.length;e--;)b[e]&&b[e].remove(!1);r(d.axes,this);r(d[g],this);a(d.options[g])?d.options[g].splice(this.options.index,1):delete d.options[g];d[g].forEach(function(a,b){a.options.index=a.userOptions.index=b});this.destroy();d.isDirtyBox=!0;M(c,!0)&&d.redraw()},setTitle:function(a,c){this.update({title:a},c)},setCategories:function(a,c){this.update({categories:a},c)}})});N(m,"Series/AreaSeries.js",[m["Core/Series/Series.js"],m["Core/Color/Color.js"],m["Core/Globals.js"],
m["Mixins/LegendSymbol.js"],m["Core/Utilities.js"]],function(f,h,m,z,F){var L=h.parse,K=F.objectEach,C=F.pick,y=m.Series;f.seriesType("area","line",{threshold:0},{singleStacks:!1,getStackPoints:function(e){var f=[],h=[],m=this.xAxis,D=this.yAxis,n=D.stacking.stacks[this.stackKey],l={},y=this.index,w=D.series,r=w.length,d=C(D.options.reversedStacks,!0)?1:-1,g;e=e||this.points;if(this.options.stacking){for(g=0;g<e.length;g++)e[g].leftNull=e[g].rightNull=void 0,l[e[g].x]=e[g];K(n,function(a,c){null!==
a.total&&h.push(c)});h.sort(function(a,c){return a-c});var c=w.map(function(a){return a.visible});h.forEach(function(a,e){var p=0,q,w;if(l[a]&&!l[a].isNull)f.push(l[a]),[-1,1].forEach(function(f){var p=1===f?"rightNull":"leftNull",m=0,v=n[h[e+f]];if(v)for(g=y;0<=g&&g<r;)q=v.points[g],q||(g===y?l[a][p]=!0:c[g]&&(w=n[a].points[g])&&(m-=w[1]-w[0])),g+=d;l[a][1===f?"rightCliff":"leftCliff"]=m});else{for(g=y;0<=g&&g<r;){if(q=n[a].points[g]){p=q[1];break}g+=d}p=D.translate(p,0,1,0,1);f.push({isNull:!0,
plotX:m.translate(a,0,0,0,1),x:a,plotY:p,yBottom:p})}})}return f},getGraphPath:function(e){var f=y.prototype.getGraphPath,h=this.options,m=h.stacking,D=this.yAxis,n,l=[],z=[],w=this.index,r=D.stacking.stacks[this.stackKey],d=h.threshold,g=Math.round(D.getThreshold(h.threshold));h=C(h.connectNulls,"percent"===m);var c=function(a,c,f){var p=e[a];a=m&&r[p.x].points[w];var h=p[f+"Null"]||0;f=p[f+"Cliff"]||0;p=!0;if(f||h){var n=(h?a[0]:a[1])+f;var v=a[0]+f;p=!!h}else!m&&e[c]&&e[c].isNull&&(n=v=d);"undefined"!==
typeof n&&(z.push({plotX:q,plotY:null===n?g:D.getThreshold(n),isNull:p,isCliff:!0}),l.push({plotX:q,plotY:null===v?g:D.getThreshold(v),doCurve:!1}))};e=e||this.points;m&&(e=this.getStackPoints(e));for(n=0;n<e.length;n++){m||(e[n].leftCliff=e[n].rightCliff=e[n].leftNull=e[n].rightNull=void 0);var a=e[n].isNull;var q=C(e[n].rectPlotX,e[n].plotX);var p=m?e[n].yBottom:g;if(!a||h)h||c(n,n-1,"left"),a&&!m&&h||(z.push(e[n]),l.push({x:n,plotX:q,plotY:p})),h||c(n,n+1,"right")}n=f.call(this,z,!0,!0);l.reversed=
!0;a=f.call(this,l,!0,!0);(p=a[0])&&"M"===p[0]&&(a[0]=["L",p[1],p[2]]);a=n.concat(a);f=f.call(this,z,!1,h);a.xMap=n.xMap;this.areaPath=a;return f},drawGraph:function(){this.areaPath=[];y.prototype.drawGraph.apply(this);var e=this,f=this.areaPath,h=this.options,m=[["area","highcharts-area",this.color,h.fillColor]];this.zones.forEach(function(f,n){m.push(["zone-area-"+n,"highcharts-area highcharts-zone-area-"+n+" "+f.className,f.color||e.color,f.fillColor||h.fillColor])});m.forEach(function(m){var n=
m[0],l=e[n],v=l?"animate":"attr",w={};l?(l.endX=e.preventGraphAnimation?null:f.xMap,l.animate({d:f})):(w.zIndex=0,l=e[n]=e.chart.renderer.path(f).addClass(m[1]).add(e.group),l.isArea=!0);e.chart.styledMode||(w.fill=C(m[3],L(m[2]).setOpacity(C(h.fillOpacity,.75)).get()));l[v](w);l.startX=f.xMap;l.shiftUnit=h.step?2:1})},drawLegendSymbol:z.drawRectangle});""});N(m,"Series/SplineSeries.js",[m["Core/Series/Series.js"],m["Core/Utilities.js"]],function(f,h){var m=h.pick;f.seriesType("spline","line",{},
{getPointSpline:function(f,h,L){var z=h.plotX||0,C=h.plotY||0,y=f[L-1];L=f[L+1];if(y&&!y.isNull&&!1!==y.doCurve&&!h.isCliff&&L&&!L.isNull&&!1!==L.doCurve&&!h.isCliff){f=y.plotY||0;var e=L.plotX||0;L=L.plotY||0;var F=0;var v=(1.5*z+(y.plotX||0))/2.5;var x=(1.5*C+f)/2.5;e=(1.5*z+e)/2.5;var D=(1.5*C+L)/2.5;e!==v&&(F=(D-x)*(e-z)/(e-v)+C-D);x+=F;D+=F;x>f&&x>C?(x=Math.max(f,C),D=2*C-x):x<f&&x<C&&(x=Math.min(f,C),D=2*C-x);D>L&&D>C?(D=Math.max(L,C),x=2*C-D):D<L&&D<C&&(D=Math.min(L,C),x=2*C-D);h.rightContX=
e;h.rightContY=D}h=["C",m(y.rightContX,y.plotX,0),m(y.rightContY,y.plotY,0),m(v,z,0),m(x,C,0),z,C];y.rightContX=y.rightContY=void 0;return h}});""});N(m,"Series/AreaSplineSeries.js",[m["Core/Series/Series.js"],m["Mixins/LegendSymbol.js"],m["Core/Options.js"]],function(f,h,m){var z=f.seriesTypes.area.prototype;f.seriesType("areaspline","spline",m.defaultOptions.plotOptions.area,{getStackPoints:z.getStackPoints,getGraphPath:z.getGraphPath,drawGraph:z.drawGraph,drawLegendSymbol:h.drawRectangle});""});
N(m,"Series/ColumnSeries.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Series/Series.js"],m["Core/Color/Color.js"],m["Core/Globals.js"],m["Mixins/LegendSymbol.js"],m["Series/LineSeries.js"],m["Core/Utilities.js"]],function(f,h,m,z,F,L,K){var C=f.animObject,y=m.parse;f=z.noop;var e=K.clamp,I=K.defined,v=K.extend,x=K.isArray,D=K.isNumber,n=K.merge,l=K.pick,J=K.objectEach;"";h=h.seriesType("column","line",{borderRadius:0,centerInCategory:!1,groupPadding:.2,marker:null,pointPadding:.1,minPointLength:0,
cropThreshold:50,pointRange:null,states:{hover:{halo:!1,brightness:.1},select:{color:"#cccccc",borderColor:"#000000"}},dataLabels:{align:void 0,verticalAlign:void 0,y:void 0},startFromThreshold:!0,stickyTracking:!1,tooltip:{distance:6},threshold:0,borderColor:"#ffffff"},{cropShoulder:0,directTouch:!0,trackerGroups:["group","dataLabelsGroup"],negStacks:!0,init:function(){L.prototype.init.apply(this,arguments);var e=this,f=e.chart;f.hasRendered&&f.series.forEach(function(d){d.type===e.type&&(d.isDirty=
!0)})},getColumnMetrics:function(){var e=this,f=e.options,d=e.xAxis,g=e.yAxis,c=d.options.reversedStacks;c=d.reversed&&!c||!d.reversed&&c;var a,h={},p=0;!1===f.grouping?p=1:e.chart.series.forEach(function(c){var d=c.yAxis,f=c.options;if(c.type===e.type&&(c.visible||!e.chart.options.chart.ignoreHiddenSeries)&&g.len===d.len&&g.pos===d.pos){if(f.stacking&&"group"!==f.stacking){a=c.stackKey;"undefined"===typeof h[a]&&(h[a]=p++);var q=h[a]}else!1!==f.grouping&&(q=p++);c.columnIndex=q}});var n=Math.min(Math.abs(d.transA)*
(d.ordinal&&d.ordinal.slope||f.pointRange||d.closestPointRange||d.tickInterval||1),d.len),m=n*f.groupPadding,v=(n-2*m)/(p||1);f=Math.min(f.maxPointWidth||d.len,l(f.pointWidth,v*(1-2*f.pointPadding)));e.columnMetrics={width:f,offset:(v-f)/2+(m+((e.columnIndex||0)+(c?1:0))*v-n/2)*(c?-1:1),paddedWidth:v,columnCount:p};return e.columnMetrics},crispCol:function(e,f,d,g){var c=this.chart,a=this.borderWidth,h=-(a%2?.5:0);a=a%2?.5:1;c.inverted&&c.renderer.isVML&&(a+=1);this.options.crisp&&(d=Math.round(e+
d)+h,e=Math.round(e)+h,d-=e);g=Math.round(f+g)+a;h=.5>=Math.abs(f)&&.5<g;f=Math.round(f)+a;g-=f;h&&g&&(--f,g+=1);return{x:e,y:f,width:d,height:g}},adjustForMissingColumns:function(e,f,d,g){var c=this,a=this.options.stacking;if(!d.isNull&&1<g.columnCount){var h=0,p=0;J(this.yAxis.stacking&&this.yAxis.stacking.stacks,function(g){if("number"===typeof d.x&&(g=g[d.x.toString()])){var e=g.points[c.index],f=g.total;a?(e&&(h=p),g.hasValidPoints&&p++):x(e)&&(h=e[1],p=f||0)}});e=(d.plotX||0)+((p-1)*g.paddedWidth+
f)/2-f-h*g.paddedWidth}return e},translate:function(){var f=this,h=f.chart,d=f.options,g=f.dense=2>f.closestPointRange*f.xAxis.transA;g=f.borderWidth=l(d.borderWidth,g?0:1);var c=f.xAxis,a=f.yAxis,q=d.threshold,p=f.translatedThreshold=a.getThreshold(q),n=l(d.minPointLength,5),m=f.getColumnMetrics(),v=m.width,x=f.barW=Math.max(v,1+2*g),y=f.pointXOffset=m.offset,z=f.dataMin,C=f.dataMax;h.inverted&&(p-=.5);d.pointPadding&&(x=Math.ceil(x));L.prototype.translate.apply(f);f.points.forEach(function(g){var u=
l(g.yBottom,p),b=999+Math.abs(u),k=v,t=g.plotX||0;b=e(g.plotY,-b,a.len+b);var r=t+y,w=x,A=Math.min(b,u),B=Math.max(b,u)-A;if(n&&Math.abs(B)<n){B=n;var E=!a.reversed&&!g.negative||a.reversed&&g.negative;D(q)&&D(C)&&g.y===q&&C<=q&&(a.min||0)<q&&z!==C&&(E=!E);A=Math.abs(A-p)>n?u-n:p-(E?n:0)}I(g.options.pointWidth)&&(k=w=Math.ceil(g.options.pointWidth),r-=Math.round((k-v)/2));d.centerInCategory&&(r=f.adjustForMissingColumns(r,k,g,m));g.barX=r;g.pointWidth=k;g.tooltipPos=h.inverted?[a.len+a.pos-h.plotLeft-
b,c.len+c.pos-h.plotTop-(t||0)-y-w/2,B]:[r+w/2,b+a.pos-h.plotTop,B];g.shapeType=f.pointClass.prototype.shapeType||"rect";g.shapeArgs=f.crispCol.apply(f,g.isNull?[r,p,w,0]:[r,A,w,B])})},getSymbol:f,drawLegendSymbol:F.drawRectangle,drawGraph:function(){this.group[this.dense?"addClass":"removeClass"]("highcharts-dense-data")},pointAttribs:function(e,f){var d=this.options,g=this.pointAttrToOptions||{};var c=g.stroke||"borderColor";var a=g["stroke-width"]||"borderWidth",h=e&&e.color||this.color,p=e&&e[c]||
d[c]||this.color||h,m=e&&e[a]||d[a]||this[a]||0;g=e&&e.options.dashStyle||d.dashStyle;var r=l(e&&e.opacity,d.opacity,1);if(e&&this.zones.length){var v=e.getZone();h=e.options.color||v&&(v.color||e.nonZonedColor)||this.color;v&&(p=v.borderColor||p,g=v.dashStyle||g,m=v.borderWidth||m)}f&&e&&(e=n(d.states[f],e.options.states&&e.options.states[f]||{}),f=e.brightness,h=e.color||"undefined"!==typeof f&&y(h).brighten(e.brightness).get()||h,p=e[c]||p,m=e[a]||m,g=e.dashStyle||g,r=l(e.opacity,r));c={fill:h,
stroke:p,"stroke-width":m,opacity:r};g&&(c.dashstyle=g);return c},drawPoints:function(){var e=this,f=this.chart,d=e.options,g=f.renderer,c=d.animationLimit||250,a;e.points.forEach(function(h){var p=h.graphic,l=!!p,q=p&&f.pointCount<c?"animate":"attr";if(D(h.plotY)&&null!==h.y){a=h.shapeArgs;p&&h.hasNewShapeType()&&(p=p.destroy());e.enabledDataSorting&&(h.startXPos=e.xAxis.reversed?-(a?a.width:0):e.xAxis.width);p||(h.graphic=p=g[h.shapeType](a).add(h.group||e.group))&&e.enabledDataSorting&&f.hasRendered&&
f.pointCount<c&&(p.attr({x:h.startXPos}),l=!0,q="animate");if(p&&l)p[q](n(a));if(d.borderRadius)p[q]({r:d.borderRadius});f.styledMode||p[q](e.pointAttribs(h,h.selected&&"select")).shadow(!1!==h.allowShadow&&d.shadow,null,d.stacking&&!d.borderRadius);p.addClass(h.getClassName(),!0)}else p&&(h.graphic=p.destroy())})},animate:function(f){var h=this,d=this.yAxis,g=h.options,c=this.chart.inverted,a={},l=c?"translateX":"translateY";if(f)a.scaleY=.001,f=e(d.toPixels(g.threshold),d.pos,d.pos+d.len),c?a.translateX=
f-d.len:a.translateY=f,h.clipBox&&h.setClip(),h.group.attr(a);else{var p=h.group.attr(l);h.group.animate({scaleY:1},v(C(h.options.animation),{step:function(c,g){h.group&&(a[l]=p+g.pos*(d.pos-p),h.group.attr(a))}}))}},remove:function(){var e=this,f=e.chart;f.hasRendered&&f.series.forEach(function(d){d.type===e.type&&(d.isDirty=!0)});L.prototype.remove.apply(e,arguments)}});"";return h});N(m,"Series/BarSeries.js",[m["Core/Series/Series.js"]],function(f){f.seriesType("bar","column",null,{inverted:!0});
""});N(m,"Series/ScatterSeries.js",[m["Core/Series/Series.js"],m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h,m){m=m.addEvent;var z=h.Series;f.seriesType("scatter","line",{lineWidth:0,findNearestPointBy:"xy",jitter:{x:0,y:0},marker:{enabled:!0},tooltip:{headerFormat:'<span style="color:{point.color}">\u25cf</span> <span style="font-size: 10px"> {series.name}</span><br/>',pointFormat:"x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>"}},{sorted:!1,requireSorting:!1,noSharedTooltip:!0,trackerGroups:["group",
"markerGroup","dataLabelsGroup"],takeOrdinalPosition:!1,drawGraph:function(){(this.options.lineWidth||0===this.options.lineWidth&&this.graph&&this.graph.strokeWidth())&&z.prototype.drawGraph.call(this)},applyJitter:function(){var f=this,h=this.options.jitter,m=this.points.length;h&&this.points.forEach(function(z,y){["x","y"].forEach(function(e,C){var v="plot"+e.toUpperCase();if(h[e]&&!z.isNull){var x=f[e+"Axis"];var D=h[e]*x.transA;if(x&&!x.isLog){var n=Math.max(0,z[v]-D);x=Math.min(x.len,z[v]+D);
C=1E4*Math.sin(y+C*m);z[v]=n+(x-n)*(C-Math.floor(C));"x"===e&&(z.clientX=z.plotX)}}})})}});m(z,"afterTranslate",function(){this.applyJitter&&this.applyJitter()});""});N(m,"Mixins/CenteredSeries.js",[m["Core/Globals.js"],m["Core/Utilities.js"]],function(f,h){var m=h.isNumber,z=h.pick,F=h.relativeLength,L=f.deg2rad;return f.CenteredSeriesMixin={getCenter:function(){var h=this.options,m=this.chart,y=2*(h.slicedOffset||0),e=m.plotWidth-2*y,I=m.plotHeight-2*y,v=h.center,x=Math.min(e,I),D=h.size,n=h.innerSize||
0;"string"===typeof D&&(D=parseFloat(D));"string"===typeof n&&(n=parseFloat(n));h=[z(v[0],"50%"),z(v[1],"50%"),z(D&&0>D?void 0:h.size,"100%"),z(n&&0>n?void 0:h.innerSize||0,"0%")];!m.angular||this instanceof f.Series||(h[3]=0);for(v=0;4>v;++v)D=h[v],m=2>v||2===v&&/%$/.test(D),h[v]=F(D,[e,I,x,h[2]][v])+(m?y:0);h[3]>h[2]&&(h[3]=h[2]);return h},getStartAndEndRadians:function(f,h){f=m(f)?f:0;h=m(h)&&h>f&&360>h-f?h:f+360;return{start:L*(f+-90),end:L*(h+-90)}}}});N(m,"Series/PieSeries.js",[m["Core/Animation/AnimationUtilities.js"],
m["Core/Series/Series.js"],m["Mixins/CenteredSeries.js"],m["Core/Globals.js"],m["Mixins/LegendSymbol.js"],m["Series/LineSeries.js"],m["Core/Series/Point.js"],m["Core/Renderer/SVG/SVGRenderer.js"],m["Core/Utilities.js"]],function(f,h,m,z,F,L,K,C,y){var e=f.setAnimation,I=m.getStartAndEndRadians;f=z.noop;var v=y.addEvent,x=y.clamp,D=y.defined,n=y.fireEvent,l=y.isNumber,J=y.merge,w=y.pick,r=y.relativeLength;h.seriesType("pie","line",{center:[null,null],clip:!1,colorByPoint:!0,dataLabels:{allowOverlap:!0,
connectorPadding:5,connectorShape:"fixedOffset",crookDistance:"70%",distance:30,enabled:!0,formatter:function(){return this.point.isNull?void 0:this.point.name},softConnector:!0,x:0},fillColor:void 0,ignoreHiddenPoint:!0,inactiveOtherPoints:!0,legendType:"point",marker:null,size:null,showInLegend:!1,slicedOffset:10,stickyTracking:!1,tooltip:{followPointer:!0},borderColor:"#ffffff",borderWidth:1,lineWidth:void 0,states:{hover:{brightness:.1}}},{isCartesian:!1,requireSorting:!1,directTouch:!0,noSharedTooltip:!0,
trackerGroups:["group","dataLabelsGroup"],axisTypes:[],pointAttribs:h.seriesTypes.column.prototype.pointAttribs,animate:function(d){var g=this,c=g.points,a=g.startAngleRad;d||c.forEach(function(c){var d=c.graphic,e=c.shapeArgs;d&&e&&(d.attr({r:w(c.startR,g.center&&g.center[3]/2),start:a,end:a}),d.animate({r:e.r,start:e.start,end:e.end},g.options.animation))})},hasData:function(){return!!this.processedXData.length},updateTotals:function(){var d,g=0,c=this.points,a=c.length,e=this.options.ignoreHiddenPoint;
for(d=0;d<a;d++){var f=c[d];g+=e&&!f.visible?0:f.isNull?0:f.y}this.total=g;for(d=0;d<a;d++)f=c[d],f.percentage=0<g&&(f.visible||!e)?f.y/g*100:0,f.total=g},generatePoints:function(){L.prototype.generatePoints.call(this);this.updateTotals()},getX:function(d,g,c){var a=this.center,e=this.radii?this.radii[c.index]:a[2]/2;d=Math.asin(x((d-a[1])/(e+c.labelDistance),-1,1));return a[0]+(g?-1:1)*Math.cos(d)*(e+c.labelDistance)+(0<c.labelDistance?(g?-1:1)*this.options.dataLabels.padding:0)},translate:function(d){this.generatePoints();
var g=0,c=this.options,a=c.slicedOffset,e=a+(c.borderWidth||0),f=I(c.startAngle,c.endAngle),h=this.startAngleRad=f.start;f=(this.endAngleRad=f.end)-h;var l=this.points,m=c.dataLabels.distance;c=c.ignoreHiddenPoint;var v,x=l.length;d||(this.center=d=this.getCenter());for(v=0;v<x;v++){var y=l[v];var z=h+g*f;if(!c||y.visible)g+=y.percentage/100;var E=h+g*f;y.shapeType="arc";y.shapeArgs={x:d[0],y:d[1],r:d[2]/2,innerR:d[3]/2,start:Math.round(1E3*z)/1E3,end:Math.round(1E3*E)/1E3};y.labelDistance=w(y.options.dataLabels&&
y.options.dataLabels.distance,m);y.labelDistance=r(y.labelDistance,y.shapeArgs.r);this.maxLabelDistance=Math.max(this.maxLabelDistance||0,y.labelDistance);E=(E+z)/2;E>1.5*Math.PI?E-=2*Math.PI:E<-Math.PI/2&&(E+=2*Math.PI);y.slicedTranslation={translateX:Math.round(Math.cos(E)*a),translateY:Math.round(Math.sin(E)*a)};var u=Math.cos(E)*d[2]/2;var b=Math.sin(E)*d[2]/2;y.tooltipPos=[d[0]+.7*u,d[1]+.7*b];y.half=E<-Math.PI/2||E>Math.PI/2?1:0;y.angle=E;z=Math.min(e,y.labelDistance/5);y.labelPosition={natural:{x:d[0]+
u+Math.cos(E)*y.labelDistance,y:d[1]+b+Math.sin(E)*y.labelDistance},"final":{},alignment:0>y.labelDistance?"center":y.half?"right":"left",connectorPosition:{breakAt:{x:d[0]+u+Math.cos(E)*z,y:d[1]+b+Math.sin(E)*z},touchingSliceAt:{x:d[0]+u,y:d[1]+b}}}}n(this,"afterTranslate")},drawEmpty:function(){var d=this.startAngleRad,g=this.endAngleRad,c=this.options;if(0===this.total&&this.center){var a=this.center[0];var e=this.center[1];this.graph||(this.graph=this.chart.renderer.arc(a,e,this.center[1]/2,0,
d,g).addClass("highcharts-empty-series").add(this.group));this.graph.attr({d:C.prototype.symbols.arc(a,e,this.center[2]/2,0,{start:d,end:g,innerR:this.center[3]/2})});this.chart.styledMode||this.graph.attr({"stroke-width":c.borderWidth,fill:c.fillColor||"none",stroke:c.color||"#cccccc"})}else this.graph&&(this.graph=this.graph.destroy())},redrawPoints:function(){var d=this,e=d.chart,c=e.renderer,a,f,h,l,n=d.options.shadow;this.drawEmpty();!n||d.shadowGroup||e.styledMode||(d.shadowGroup=c.g("shadow").attr({zIndex:-1}).add(d.group));
d.points.forEach(function(g){var p={};f=g.graphic;if(!g.isNull&&f){l=g.shapeArgs;a=g.getTranslate();if(!e.styledMode){var q=g.shadowGroup;n&&!q&&(q=g.shadowGroup=c.g("shadow").add(d.shadowGroup));q&&q.attr(a);h=d.pointAttribs(g,g.selected&&"select")}g.delayedRendering?(f.setRadialReference(d.center).attr(l).attr(a),e.styledMode||f.attr(h).attr({"stroke-linejoin":"round"}).shadow(n,q),g.delayedRendering=!1):(f.setRadialReference(d.center),e.styledMode||J(!0,p,h),J(!0,p,l,a),f.animate(p));f.attr({visibility:g.visible?
"inherit":"hidden"});f.addClass(g.getClassName())}else f&&(g.graphic=f.destroy())})},drawPoints:function(){var d=this.chart.renderer;this.points.forEach(function(e){e.graphic&&e.hasNewShapeType()&&(e.graphic=e.graphic.destroy());e.graphic||(e.graphic=d[e.shapeType](e.shapeArgs).add(e.series.group),e.delayedRendering=!0)})},searchPoint:f,sortByAngle:function(d,e){d.sort(function(c,a){return"undefined"!==typeof c.angle&&(a.angle-c.angle)*e})},drawLegendSymbol:F.drawRectangle,getCenter:m.getCenter,getSymbol:f,
drawGraph:null},{init:function(){K.prototype.init.apply(this,arguments);var d=this;d.name=w(d.name,"Slice");var e=function(c){d.slice("select"===c.type)};v(d,"select",e);v(d,"unselect",e);return d},isValid:function(){return l(this.y)&&0<=this.y},setVisible:function(d,e){var c=this,a=c.series,g=a.chart,f=a.options.ignoreHiddenPoint;e=w(e,f);d!==c.visible&&(c.visible=c.options.visible=d="undefined"===typeof d?!c.visible:d,a.options.data[a.data.indexOf(c)]=c.options,["graphic","dataLabel","connector",
"shadowGroup"].forEach(function(a){if(c[a])c[a][d?"show":"hide"](!0)}),c.legendItem&&g.legend.colorizeItem(c,d),d||"hover"!==c.state||c.setState(""),f&&(a.isDirty=!0),e&&g.redraw())},slice:function(d,g,c){var a=this.series;e(c,a.chart);w(g,!0);this.sliced=this.options.sliced=D(d)?d:!this.sliced;a.options.data[a.data.indexOf(this)]=this.options;this.graphic&&this.graphic.animate(this.getTranslate());this.shadowGroup&&this.shadowGroup.animate(this.getTranslate())},getTranslate:function(){return this.sliced?
this.slicedTranslation:{translateX:0,translateY:0}},haloPath:function(d){var e=this.shapeArgs;return this.sliced||!this.visible?[]:this.series.chart.renderer.symbols.arc(e.x,e.y,e.r+d,e.r+d,{innerR:e.r-1,start:e.start,end:e.end})},connectorShapes:{fixedOffset:function(d,e,c){var a=e.breakAt;e=e.touchingSliceAt;return[["M",d.x,d.y],c.softConnector?["C",d.x+("left"===d.alignment?-5:5),d.y,2*a.x-e.x,2*a.y-e.y,a.x,a.y]:["L",a.x,a.y],["L",e.x,e.y]]},straight:function(d,e){e=e.touchingSliceAt;return[["M",
d.x,d.y],["L",e.x,e.y]]},crookedLine:function(d,e,c){e=e.touchingSliceAt;var a=this.series,g=a.center[0],f=a.chart.plotWidth,h=a.chart.plotLeft;a=d.alignment;var l=this.shapeArgs.r;c=r(c.crookDistance,1);f="left"===a?g+l+(f+h-g-l)*(1-c):h+(g-l)*c;c=["L",f,d.y];g=!0;if("left"===a?f>d.x||f<e.x:f<d.x||f>e.x)g=!1;d=[["M",d.x,d.y]];g&&d.push(c);d.push(["L",e.x,e.y]);return d}},getConnectorPath:function(){var d=this.labelPosition,e=this.series.options.dataLabels,c=e.connectorShape,a=this.connectorShapes;
a[c]&&(c=a[c]);return c.call(this,{x:d.final.x,y:d.final.y,alignment:d.alignment},d.connectorPosition,e)}});""});N(m,"Core/Series/DataLabels.js",[m["Core/Animation/AnimationUtilities.js"],m["Core/Globals.js"],m["Core/Series/CartesianSeries.js"],m["Core/Utilities.js"]],function(f,h,m,z){var F=f.getDeferredAnimation;f=h.noop;var L=h.seriesTypes,K=z.arrayMax,C=z.clamp,y=z.defined,e=z.extend,I=z.fireEvent,v=z.format,x=z.isArray,D=z.merge,n=z.objectEach,l=z.pick,J=z.relativeLength,w=z.splat,r=z.stableSort;
"";h.distribute=function(d,e,c){function a(a,c){return a.target-c.target}var f,g=!0,n=d,m=[];var v=0;var w=n.reducedLen||e;for(f=d.length;f--;)v+=d[f].size;if(v>w){r(d,function(a,c){return(c.rank||0)-(a.rank||0)});for(v=f=0;v<=w;)v+=d[f].size,f++;m=d.splice(f-1,d.length)}r(d,a);for(d=d.map(function(a){return{size:a.size,targets:[a.target],align:l(a.align,.5)}});g;){for(f=d.length;f--;)g=d[f],v=(Math.min.apply(0,g.targets)+Math.max.apply(0,g.targets))/2,g.pos=C(v-g.size*g.align,0,e-g.size);f=d.length;
for(g=!1;f--;)0<f&&d[f-1].pos+d[f-1].size>d[f].pos&&(d[f-1].size+=d[f].size,d[f-1].targets=d[f-1].targets.concat(d[f].targets),d[f-1].align=.5,d[f-1].pos+d[f-1].size>e&&(d[f-1].pos=e-d[f-1].size),d.splice(f,1),g=!0)}n.push.apply(n,m);f=0;d.some(function(a){var d=0;if(a.targets.some(function(){n[f].pos=a.pos+d;if("undefined"!==typeof c&&Math.abs(n[f].pos-n[f].target)>c)return n.slice(0,f+1).forEach(function(a){delete a.pos}),n.reducedLen=(n.reducedLen||e)-.1*e,n.reducedLen>.1*e&&h.distribute(n,e,c),
!0;d+=n[f].size;f++}))return!0});r(n,a)};m.prototype.drawDataLabels=function(){function d(a,c){var d=c.filter;return d?(c=d.operator,a=a[d.property],d=d.value,">"===c&&a>d||"<"===c&&a<d||">="===c&&a>=d||"<="===c&&a<=d||"=="===c&&a==d||"==="===c&&a===d?!0:!1):!0}function e(a,c){var d=[],b;if(x(a)&&!x(c))d=a.map(function(a){return D(a,c)});else if(x(c)&&!x(a))d=c.map(function(b){return D(a,b)});else if(x(a)||x(c))for(b=Math.max(a.length,c.length);b--;)d[b]=D(a[b],c[b]);else d=D(a,c);return d}var c=
this,a=c.chart,f=c.options,h=f.dataLabels,m=c.points,r,G=c.hasRendered||0,z=h.animation;z=h.defer?F(a,z,c):{defer:0,duration:0};var C=a.renderer;h=e(e(a.options.plotOptions&&a.options.plotOptions.series&&a.options.plotOptions.series.dataLabels,a.options.plotOptions&&a.options.plotOptions[c.type]&&a.options.plotOptions[c.type].dataLabels),h);I(this,"drawDataLabels");if(x(h)||h.enabled||c._hasPointLabels){var J=c.plotGroup("dataLabelsGroup","data-labels",G?"inherit":"hidden",h.zIndex||6);J.attr({opacity:+G});
!G&&(G=c.dataLabelsGroup)&&(c.visible&&J.show(!0),G[f.animation?"animate":"attr"]({opacity:1},z));m.forEach(function(g){r=w(e(h,g.dlOptions||g.options&&g.options.dataLabels));r.forEach(function(e,h){var b=e.enabled&&(!g.isNull||g.dataLabelOnNull)&&d(g,e),k=g.dataLabels?g.dataLabels[h]:g.dataLabel,p=g.connectors?g.connectors[h]:g.connector,m=l(e.distance,g.labelDistance),q=!k;if(b){var u=g.getLabelConfig();var r=l(e[g.formatPrefix+"Format"],e.format);u=y(r)?v(r,u,a):(e[g.formatPrefix+"Formatter"]||
e.formatter).call(u,e);r=e.style;var A=e.rotation;a.styledMode||(r.color=l(e.color,r.color,c.color,"#000000"),"contrast"===r.color?(g.contrastColor=C.getContrast(g.color||c.color),r.color=!y(m)&&e.inside||0>m||f.stacking?g.contrastColor:"#000000"):delete g.contrastColor,f.cursor&&(r.cursor=f.cursor));var w={r:e.borderRadius||0,rotation:A,padding:e.padding,zIndex:1};a.styledMode||(w.fill=e.backgroundColor,w.stroke=e.borderColor,w["stroke-width"]=e.borderWidth);n(w,function(a,b){"undefined"===typeof a&&
delete w[b]})}!k||b&&y(u)?b&&y(u)&&(k?w.text=u:(g.dataLabels=g.dataLabels||[],k=g.dataLabels[h]=A?C.text(u,0,-9999,e.useHTML).addClass("highcharts-data-label"):C.label(u,0,-9999,e.shape,null,null,e.useHTML,null,"data-label"),h||(g.dataLabel=k),k.addClass(" highcharts-data-label-color-"+g.colorIndex+" "+(e.className||"")+(e.useHTML?" highcharts-tracker":""))),k.options=e,k.attr(w),a.styledMode||k.css(r).shadow(e.shadow),k.added||k.add(J),e.textPath&&!e.useHTML&&(k.setTextPath(g.getDataLabelPath&&g.getDataLabelPath(k)||
g.graphic,e.textPath),g.dataLabelPath&&!e.textPath.enabled&&(g.dataLabelPath=g.dataLabelPath.destroy())),c.alignDataLabel(g,k,e,null,q)):(g.dataLabel=g.dataLabel&&g.dataLabel.destroy(),g.dataLabels&&(1===g.dataLabels.length?delete g.dataLabels:delete g.dataLabels[h]),h||delete g.dataLabel,p&&(g.connector=g.connector.destroy(),g.connectors&&(1===g.connectors.length?delete g.connectors:delete g.connectors[h])))})})}I(this,"afterDrawDataLabels")};m.prototype.alignDataLabel=function(d,g,c,a,f){var h=
this,n=this.chart,m=this.isCartesian&&n.inverted,q=this.enabledDataSorting,r=l(d.dlBox&&d.dlBox.centerX,d.plotX,-9999),v=l(d.plotY,-9999),w=g.getBBox(),x=c.rotation,y=c.align,u=n.isInsidePlot(r,Math.round(v),m),b="justify"===l(c.overflow,q?"none":"justify"),k=this.visible&&!1!==d.visible&&(d.series.forceDL||q&&!b||u||c.inside&&a&&n.isInsidePlot(r,m?a.x+1:a.y+a.height-1,m));var t=function(a){q&&h.xAxis&&!b&&h.setDataLabelStartPos(d,g,f,u,a)};if(k){var z=n.renderer.fontMetrics(n.styledMode?void 0:c.style.fontSize,
g).b;a=e({x:m?this.yAxis.len-v:r,y:Math.round(m?this.xAxis.len-r:v),width:0,height:0},a);e(c,{width:w.width,height:w.height});x?(b=!1,r=n.renderer.rotCorr(z,x),r={x:a.x+(c.x||0)+a.width/2+r.x,y:a.y+(c.y||0)+{top:0,middle:.5,bottom:1}[c.verticalAlign]*a.height},t(r),g[f?"attr":"animate"](r).attr({align:y}),t=(x+720)%360,t=180<t&&360>t,"left"===y?r.y-=t?w.height:0:"center"===y?(r.x-=w.width/2,r.y-=w.height/2):"right"===y&&(r.x-=w.width,r.y-=t?0:w.height),g.placed=!0,g.alignAttr=r):(t(a),g.align(c,null,
a),r=g.alignAttr);b&&0<=a.height?this.justifyDataLabel(g,c,r,w,a,f):l(c.crop,!0)&&(k=n.isInsidePlot(r.x,r.y)&&n.isInsidePlot(r.x+w.width,r.y+w.height));if(c.shape&&!x)g[f?"attr":"animate"]({anchorX:m?n.plotWidth-d.plotY:d.plotX,anchorY:m?n.plotHeight-d.plotX:d.plotY})}f&&q&&(g.placed=!1);k||q&&!b||(g.hide(!0),g.placed=!1)};m.prototype.setDataLabelStartPos=function(d,e,c,a,f){var g=this.chart,h=g.inverted,l=this.xAxis,n=l.reversed,m=h?e.height/2:e.width/2;d=(d=d.pointWidth)?d/2:0;l=h?f.x:n?-m-d:l.width-
m+d;f=h?n?this.yAxis.height-m+d:-m-d:f.y;e.startXPos=l;e.startYPos=f;a?"hidden"===e.visibility&&(e.show(),e.attr({opacity:0}).animate({opacity:1})):e.attr({opacity:1}).animate({opacity:0},void 0,e.hide);g.hasRendered&&(c&&e.attr({x:e.startXPos,y:e.startYPos}),e.placed=!0)};m.prototype.justifyDataLabel=function(d,e,c,a,f,h){var g=this.chart,p=e.align,l=e.verticalAlign,n=d.box?0:d.padding||0,m=e.x;m=void 0===m?0:m;var q=e.y;var r=void 0===q?0:q;q=c.x+n;if(0>q){"right"===p&&0<=m?(e.align="left",e.inside=
!0):m-=q;var v=!0}q=c.x+a.width-n;q>g.plotWidth&&("left"===p&&0>=m?(e.align="right",e.inside=!0):m+=g.plotWidth-q,v=!0);q=c.y+n;0>q&&("bottom"===l&&0<=r?(e.verticalAlign="top",e.inside=!0):r-=q,v=!0);q=c.y+a.height-n;q>g.plotHeight&&("top"===l&&0>=r?(e.verticalAlign="bottom",e.inside=!0):r+=g.plotHeight-q,v=!0);v&&(e.x=m,e.y=r,d.placed=!h,d.align(e,void 0,f));return v};L.pie&&(L.pie.prototype.dataLabelPositioners={radialDistributionY:function(d){return d.top+d.distributeBox.pos},radialDistributionX:function(d,
e,c,a){return d.getX(c<e.top+2||c>e.bottom-2?a:c,e.half,e)},justify:function(d,e,c){return c[0]+(d.half?-1:1)*(e+d.labelDistance)},alignToPlotEdges:function(d,e,c,a){d=d.getBBox().width;return e?d+a:c-d-a},alignToConnectors:function(d,e,c,a){var f=0,g;d.forEach(function(a){g=a.dataLabel.getBBox().width;g>f&&(f=g)});return e?f+a:c-f-a}},L.pie.prototype.drawDataLabels=function(){var d=this,e=d.data,c,a=d.chart,f=d.options.dataLabels||{},p=f.connectorPadding,n,r=a.plotWidth,v=a.plotHeight,w=a.plotLeft,
x=Math.round(a.chartWidth/3),z,C=d.center,E=C[2]/2,u=C[1],b,k,t,F,I=[[],[]],J,L,N,P,S=[0,0,0,0],Y=d.dataLabelPositioners,W;d.visible&&(f.enabled||d._hasPointLabels)&&(e.forEach(function(a){a.dataLabel&&a.visible&&a.dataLabel.shortened&&(a.dataLabel.attr({width:"auto"}).css({width:"auto",textOverflow:"clip"}),a.dataLabel.shortened=!1)}),m.prototype.drawDataLabels.apply(d),e.forEach(function(a){a.dataLabel&&(a.visible?(I[a.half].push(a),a.dataLabel._pos=null,!y(f.style.width)&&!y(a.options.dataLabels&&
a.options.dataLabels.style&&a.options.dataLabels.style.width)&&a.dataLabel.getBBox().width>x&&(a.dataLabel.css({width:Math.round(.7*x)+"px"}),a.dataLabel.shortened=!0)):(a.dataLabel=a.dataLabel.destroy(),a.dataLabels&&1===a.dataLabels.length&&delete a.dataLabels))}),I.forEach(function(e,g){var n=e.length,m=[],q;if(n){d.sortByAngle(e,g-.5);if(0<d.maxLabelDistance){var A=Math.max(0,u-E-d.maxLabelDistance);var B=Math.min(u+E+d.maxLabelDistance,a.plotHeight);e.forEach(function(b){0<b.labelDistance&&b.dataLabel&&
(b.top=Math.max(0,u-E-b.labelDistance),b.bottom=Math.min(u+E+b.labelDistance,a.plotHeight),q=b.dataLabel.getBBox().height||21,b.distributeBox={target:b.labelPosition.natural.y-b.top+q/2,size:q,rank:b.y},m.push(b.distributeBox))});A=B+q-A;h.distribute(m,A,A/5)}for(P=0;P<n;P++){c=e[P];t=c.labelPosition;b=c.dataLabel;N=!1===c.visible?"hidden":"inherit";L=A=t.natural.y;m&&y(c.distributeBox)&&("undefined"===typeof c.distributeBox.pos?N="hidden":(F=c.distributeBox.size,L=Y.radialDistributionY(c)));delete c.positionIndex;
if(f.justify)J=Y.justify(c,E,C);else switch(f.alignTo){case "connectors":J=Y.alignToConnectors(e,g,r,w);break;case "plotEdges":J=Y.alignToPlotEdges(b,g,r,w);break;default:J=Y.radialDistributionX(d,c,L,A)}b._attr={visibility:N,align:t.alignment};W=c.options.dataLabels||{};b._pos={x:J+l(W.x,f.x)+({left:p,right:-p}[t.alignment]||0),y:L+l(W.y,f.y)-10};t.final.x=J;t.final.y=L;l(f.crop,!0)&&(k=b.getBBox().width,A=null,J-k<p&&1===g?(A=Math.round(k-J+p),S[3]=Math.max(A,S[3])):J+k>r-p&&0===g&&(A=Math.round(J+
k-r+p),S[1]=Math.max(A,S[1])),0>L-F/2?S[0]=Math.max(Math.round(-L+F/2),S[0]):L+F/2>v&&(S[2]=Math.max(Math.round(L+F/2-v),S[2])),b.sideOverflow=A)}}}),0===K(S)||this.verifyDataLabelOverflow(S))&&(this.placeDataLabels(),this.points.forEach(function(c){W=D(f,c.options.dataLabels);if(n=l(W.connectorWidth,1)){var e;z=c.connector;if((b=c.dataLabel)&&b._pos&&c.visible&&0<c.labelDistance){N=b._attr.visibility;if(e=!z)c.connector=z=a.renderer.path().addClass("highcharts-data-label-connector  highcharts-color-"+
c.colorIndex+(c.className?" "+c.className:"")).add(d.dataLabelsGroup),a.styledMode||z.attr({"stroke-width":n,stroke:W.connectorColor||c.color||"#666666"});z[e?"attr":"animate"]({d:c.getConnectorPath()});z.attr("visibility",N)}else z&&(c.connector=z.destroy())}}))},L.pie.prototype.placeDataLabels=function(){this.points.forEach(function(d){var e=d.dataLabel,c;e&&d.visible&&((c=e._pos)?(e.sideOverflow&&(e._attr.width=Math.max(e.getBBox().width-e.sideOverflow,0),e.css({width:e._attr.width+"px",textOverflow:(this.options.dataLabels.style||
{}).textOverflow||"ellipsis"}),e.shortened=!0),e.attr(e._attr),e[e.moved?"animate":"attr"](c),e.moved=!0):e&&e.attr({y:-9999}));delete d.distributeBox},this)},L.pie.prototype.alignDataLabel=f,L.pie.prototype.verifyDataLabelOverflow=function(d){var e=this.center,c=this.options,a=c.center,f=c.minSize||80,h=null!==c.size;if(!h){if(null!==a[0])var l=Math.max(e[2]-Math.max(d[1],d[3]),f);else l=Math.max(e[2]-d[1]-d[3],f),e[0]+=(d[3]-d[1])/2;null!==a[1]?l=C(l,f,e[2]-Math.max(d[0],d[2])):(l=C(l,f,e[2]-d[0]-
d[2]),e[1]+=(d[0]-d[2])/2);l<e[2]?(e[2]=l,e[3]=Math.min(J(c.innerSize||0,l),l),this.translate(e),this.drawDataLabels&&this.drawDataLabels()):h=!0}return h});L.column&&(L.column.prototype.alignDataLabel=function(d,e,c,a,f){var g=this.chart.inverted,h=d.series,n=d.dlBox||d.shapeArgs,q=l(d.below,d.plotY>l(this.translatedThreshold,h.yAxis.len)),r=l(c.inside,!!this.options.stacking);n&&(a=D(n),0>a.y&&(a.height+=a.y,a.y=0),n=a.y+a.height-h.yAxis.len,0<n&&n<a.height&&(a.height-=n),g&&(a={x:h.yAxis.len-a.y-
a.height,y:h.xAxis.len-a.x-a.width,width:a.height,height:a.width}),r||(g?(a.x+=q?0:a.width,a.width=0):(a.y+=q?a.height:0,a.height=0)));c.align=l(c.align,!g||r?"center":q?"right":"left");c.verticalAlign=l(c.verticalAlign,g||r?"middle":q?"top":"bottom");m.prototype.alignDataLabel.call(this,d,e,c,a,f);c.inside&&d.contrastColor&&e.css({color:d.contrastColor})})});N(m,"Extensions/OverlappingDataLabels.js",[m["Core/Chart/Chart.js"],m["Core/Utilities.js"]],function(f,h){var m=h.addEvent,z=h.fireEvent,F=
h.isArray,L=h.isNumber,K=h.objectEach,C=h.pick;m(f,"render",function(){var f=[];(this.labelCollectors||[]).forEach(function(e){f=f.concat(e())});(this.yAxis||[]).forEach(function(e){e.stacking&&e.options.stackLabels&&!e.options.stackLabels.allowOverlap&&K(e.stacking.stacks,function(e){K(e,function(e){f.push(e.label)})})});(this.series||[]).forEach(function(e){var h=e.options.dataLabels;e.visible&&(!1!==h.enabled||e._hasPointLabels)&&(e.nodes||e.points).forEach(function(e){e.visible&&(F(e.dataLabels)?
e.dataLabels:e.dataLabel?[e.dataLabel]:[]).forEach(function(h){var m=h.options;h.labelrank=C(m.labelrank,e.labelrank,e.shapeArgs&&e.shapeArgs.height);m.allowOverlap||f.push(h)})})});this.hideOverlappingLabels(f)});f.prototype.hideOverlappingLabels=function(f){var e=this,h=f.length,m=e.renderer,x,y,n,l=!1;var C=function(d){var e,c=d.box?0:d.padding||0,a=e=0,f;if(d&&(!d.alignAttr||d.placed)){var h=d.alignAttr||{x:d.attr("x"),y:d.attr("y")};var l=d.parentGroup;d.width||(e=d.getBBox(),d.width=e.width,
d.height=e.height,e=m.fontMetrics(null,d.element).h);var n=d.width-2*c;(f={left:"0",center:"0.5",right:"1"}[d.alignValue])?a=+f*n:L(d.x)&&Math.round(d.x)!==d.translateX&&(a=d.x-d.translateX);return{x:h.x+(l.translateX||0)+c-(a||0),y:h.y+(l.translateY||0)+c-e,width:d.width-2*c,height:d.height-2*c}}};for(y=0;y<h;y++)if(x=f[y])x.oldOpacity=x.opacity,x.newOpacity=1,x.absoluteBox=C(x);f.sort(function(d,e){return(e.labelrank||0)-(d.labelrank||0)});for(y=0;y<h;y++){var w=(C=f[y])&&C.absoluteBox;for(x=y+
1;x<h;++x){var r=(n=f[x])&&n.absoluteBox;!w||!r||C===n||0===C.newOpacity||0===n.newOpacity||r.x>=w.x+w.width||r.x+r.width<=w.x||r.y>=w.y+w.height||r.y+r.height<=w.y||((C.labelrank<n.labelrank?C:n).newOpacity=0)}}f.forEach(function(d){if(d){var f=d.newOpacity;d.oldOpacity!==f&&(d.alignAttr&&d.placed?(d[f?"removeClass":"addClass"]("highcharts-data-label-hidden"),l=!0,d.alignAttr.opacity=f,d[d.isOld?"animate":"attr"](d.alignAttr,null,function(){e.styledMode||d.css({pointerEvents:f?"auto":"none"});d.visibility=
f?"inherit":"hidden"}),z(e,"afterHideOverlappingLabel")):d.attr({opacity:f}));d.isOld=!0}});l&&z(e,"afterHideAllOverlappingLabels")}});N(m,"Core/Interaction.js",[m["Core/Series/Series.js"],m["Core/Chart/Chart.js"],m["Core/Globals.js"],m["Core/Legend.js"],m["Series/LineSeries.js"],m["Core/Options.js"],m["Core/Series/Point.js"],m["Core/Utilities.js"]],function(f,h,m,z,F,L,K,C){f=f.seriesTypes;var y=m.hasTouch,e=m.svg,I=L.defaultOptions,v=C.addEvent,x=C.createElement,D=C.css,n=C.defined,l=C.extend,J=
C.fireEvent,w=C.isArray,r=C.isFunction,d=C.isNumber,g=C.isObject,c=C.merge,a=C.objectEach,q=C.pick;"";m=m.TrackerMixin={drawTrackerPoint:function(){var a=this,c=a.chart,d=c.pointer,e=function(a){var c=d.getPointFromEvent(a);"undefined"!==typeof c&&(d.isDirectTouch=!0,c.onMouseOver(a))},f;a.points.forEach(function(a){f=w(a.dataLabels)?a.dataLabels:a.dataLabel?[a.dataLabel]:[];a.graphic&&(a.graphic.element.point=a);f.forEach(function(c){c.div?c.div.point=a:c.element.point=a})});a._hasTracking||(a.trackerGroups.forEach(function(f){if(a[f]){a[f].addClass("highcharts-tracker").on("mouseover",
e).on("mouseout",function(a){d.onTrackerMouseOut(a)});if(y)a[f].on("touchstart",e);!c.styledMode&&a.options.cursor&&a[f].css(D).css({cursor:a.options.cursor})}}),a._hasTracking=!0);J(this,"afterDrawTracker")},drawTrackerGraph:function(){var a=this,c=a.options,d=c.trackByArea,f=[].concat(d?a.areaPath:a.graphPath),g=a.chart,h=g.pointer,l=g.renderer,n=g.options.tooltip.snap,m=a.tracker,q=function(b){if(g.hoverSeries!==a)a.onMouseOver()},b="rgba(192,192,192,"+(e?.0001:.002)+")";m?m.attr({d:f}):a.graph&&
(a.tracker=l.path(f).attr({visibility:a.visible?"visible":"hidden",zIndex:2}).addClass(d?"highcharts-tracker-area":"highcharts-tracker-line").add(a.group),g.styledMode||a.tracker.attr({"stroke-linecap":"round","stroke-linejoin":"round",stroke:b,fill:d?b:"none","stroke-width":a.graph.strokeWidth()+(d?0:2*n)}),[a.tracker,a.markerGroup].forEach(function(a){a.addClass("highcharts-tracker").on("mouseover",q).on("mouseout",function(a){h.onTrackerMouseOut(a)});c.cursor&&!g.styledMode&&a.css({cursor:c.cursor});
if(y)a.on("touchstart",q)}));J(this,"afterDrawTracker")}};f.column&&(f.column.prototype.drawTracker=m.drawTrackerPoint);f.pie&&(f.pie.prototype.drawTracker=m.drawTrackerPoint);f.scatter&&(f.scatter.prototype.drawTracker=m.drawTrackerPoint);l(z.prototype,{setItemEvents:function(a,d,e){var f=this,g=f.chart.renderer.boxWrapper,h=a instanceof K,p="highcharts-legend-"+(h?"point":"series")+"-active",l=f.chart.styledMode;(e?[d,a.legendSymbol]:[a.legendGroup]).forEach(function(e){if(e)e.on("mouseover",function(){a.visible&&
f.allItems.forEach(function(c){a!==c&&c.setState("inactive",!h)});a.setState("hover");a.visible&&g.addClass(p);l||d.css(f.options.itemHoverStyle)}).on("mouseout",function(){f.chart.styledMode||d.css(c(a.visible?f.itemStyle:f.itemHiddenStyle));f.allItems.forEach(function(c){a!==c&&c.setState("",!h)});g.removeClass(p);a.setState()}).on("click",function(c){var b=function(){a.setVisible&&a.setVisible();f.allItems.forEach(function(b){a!==b&&b.setState(a.visible?"inactive":"",!h)})};g.removeClass(p);c=
{browserEvent:c};a.firePointEvent?a.firePointEvent("legendItemClick",c,b):J(a,"legendItemClick",c,b)})})},createCheckboxForItem:function(a){a.checkbox=x("input",{type:"checkbox",className:"highcharts-legend-checkbox",checked:a.selected,defaultChecked:a.selected},this.options.itemCheckboxStyle,this.chart.container);v(a.checkbox,"click",function(c){J(a.series||a,"checkboxClick",{checked:c.target.checked,item:a},function(){a.select()})})}});l(h.prototype,{showResetZoom:function(){function a(){c.zoomOut()}
var c=this,d=I.lang,e=c.options.chart.resetZoomButton,f=e.theme,g=f.states,h="chart"===e.relativeTo||"spaceBox"===e.relativeTo?null:"plotBox";J(this,"beforeShowResetZoom",null,function(){c.resetZoomButton=c.renderer.button(d.resetZoom,null,null,a,f,g&&g.hover).attr({align:e.position.align,title:d.resetZoomTitle}).addClass("highcharts-reset-zoom").add().align(e.position,!1,h)});J(this,"afterShowResetZoom")},zoomOut:function(){J(this,"selection",{resetSelection:!0},this.zoom)},zoom:function(a){var c=
this,d,e=c.pointer,f=!1,h=c.inverted?e.mouseDownX:e.mouseDownY;!a||a.resetSelection?(c.axes.forEach(function(a){d=a.zoom()}),e.initiated=!1):a.xAxis.concat(a.yAxis).forEach(function(a){var g=a.axis,p=c.inverted?g.left:g.top,b=c.inverted?p+g.width:p+g.height,k=g.isXAxis,l=!1;if(!k&&h>=p&&h<=b||k||!n(h))l=!0;e[k?"zoomX":"zoomY"]&&l&&(d=g.zoom(a.min,a.max),g.displayBtn&&(f=!0))});var p=c.resetZoomButton;f&&!p?c.showResetZoom():!f&&g(p)&&(c.resetZoomButton=p.destroy());d&&c.redraw(q(c.options.chart.animation,
a&&a.animation,100>c.pointCount))},pan:function(a,c){var e=this,f=e.hoverPoints,g=e.options.chart,h=e.options.mapNavigation&&e.options.mapNavigation.enabled,p;c="object"===typeof c?c:{enabled:c,type:"x"};g&&g.panning&&(g.panning=c);var l=c.type;J(this,"pan",{originalEvent:a},function(){f&&f.forEach(function(a){a.setState()});var c=[1];"xy"===l?c=[1,0]:"y"===l&&(c=[0]);c.forEach(function(c){var b=e[c?"xAxis":"yAxis"][0],f=b.horiz,g=a[f?"chartX":"chartY"];f=f?"mouseDownX":"mouseDownY";var n=e[f],m=
(b.pointRange||0)/2,r=b.reversed&&!e.inverted||!b.reversed&&e.inverted?-1:1,u=b.getExtremes(),v=b.toValue(n-g,!0)+m*r;r=b.toValue(n+b.len-g,!0)-m*r;var w=r<v;n=w?r:v;v=w?v:r;var A=b.hasVerticalPanning(),x=b.panningState;b.series.forEach(function(a){if(A&&!c&&(!x||x.isDirty)){var b=a.getProcessedData(!0);a=a.getExtremes(b.yData,!0);x||(x={startMin:Number.MAX_VALUE,startMax:-Number.MAX_VALUE});d(a.dataMin)&&d(a.dataMax)&&(x.startMin=Math.min(a.dataMin,x.startMin),x.startMax=Math.max(a.dataMax,x.startMax))}});
r=Math.min(q(null===x||void 0===x?void 0:x.startMin,u.dataMin),m?u.min:b.toValue(b.toPixels(u.min)-b.minPixelPadding));m=Math.max(q(null===x||void 0===x?void 0:x.startMax,u.dataMax),m?u.max:b.toValue(b.toPixels(u.max)+b.minPixelPadding));b.panningState=x;b.isOrdinal||(w=r-n,0<w&&(v+=w,n=r),w=v-m,0<w&&(v=m,n-=w),b.series.length&&n!==u.min&&v!==u.max&&n>=r&&v<=m&&(b.setExtremes(n,v,!1,!1,{trigger:"pan"}),e.resetZoomButton||h||n===r||v===m||!l.match("y")||(e.showResetZoom(),b.displayBtn=!1),p=!0),e[f]=
g)});p&&e.redraw(!1);D(e.container,{cursor:"move"})})}});l(K.prototype,{select:function(a,c){var d=this,e=d.series,f=e.chart;this.selectedStaging=a=q(a,!d.selected);d.firePointEvent(a?"select":"unselect",{accumulate:c},function(){d.selected=d.options.selected=a;e.options.data[e.data.indexOf(d)]=d.options;d.setState(a&&"select");c||f.getSelectedPoints().forEach(function(a){var c=a.series;a.selected&&a!==d&&(a.selected=a.options.selected=!1,c.options.data[c.data.indexOf(a)]=a.options,a.setState(f.hoverPoints&&
c.options.inactiveOtherPoints?"inactive":""),a.firePointEvent("unselect"))})});delete this.selectedStaging},onMouseOver:function(a){var c=this.series.chart,d=c.pointer;a=a?d.normalize(a):d.getChartCoordinatesFromPoint(this,c.inverted);d.runPointActions(a,this)},onMouseOut:function(){var a=this.series.chart;this.firePointEvent("mouseOut");this.series.options.inactiveOtherPoints||(a.hoverPoints||[]).forEach(function(a){a.setState()});a.hoverPoints=a.hoverPoint=null},importEvents:function(){if(!this.hasImportedEvents){var d=
this,e=c(d.series.options.point,d.options).events;d.events=e;a(e,function(a,c){r(a)&&v(d,c,a)});this.hasImportedEvents=!0}},setState:function(a,c){var d=this.series,e=this.state,f=d.options.states[a||"normal"]||{},g=I.plotOptions[d.type].marker&&d.options.marker,h=g&&!1===g.enabled,p=g&&g.states&&g.states[a||"normal"]||{},n=!1===p.enabled,m=d.stateMarkerGraphic,b=this.marker||{},k=d.chart,r=d.halo,v,w=g&&d.markerAttribs;a=a||"";if(!(a===this.state&&!c||this.selected&&"select"!==a||!1===f.enabled||
a&&(n||h&&!1===p.enabled)||a&&b.states&&b.states[a]&&!1===b.states[a].enabled)){this.state=a;w&&(v=d.markerAttribs(this,a));if(this.graphic){e&&this.graphic.removeClass("highcharts-point-"+e);a&&this.graphic.addClass("highcharts-point-"+a);if(!k.styledMode){var x=d.pointAttribs(this,a);var y=q(k.options.chart.animation,f.animation);d.options.inactiveOtherPoints&&x.opacity&&((this.dataLabels||[]).forEach(function(a){a&&a.animate({opacity:x.opacity},y)}),this.connector&&this.connector.animate({opacity:x.opacity},
y));this.graphic.animate(x,y)}v&&this.graphic.animate(v,q(k.options.chart.animation,p.animation,g.animation));m&&m.hide()}else{if(a&&p){e=b.symbol||d.symbol;m&&m.currentSymbol!==e&&(m=m.destroy());if(v)if(m)m[c?"animate":"attr"]({x:v.x,y:v.y});else e&&(d.stateMarkerGraphic=m=k.renderer.symbol(e,v.x,v.y,v.width,v.height).add(d.markerGroup),m.currentSymbol=e);!k.styledMode&&m&&m.attr(d.pointAttribs(this,a))}m&&(m[a&&this.isInside?"show":"hide"](),m.element.point=this)}a=f.halo;f=(m=this.graphic||m)&&
m.visibility||"inherit";a&&a.size&&m&&"hidden"!==f&&!this.isCluster?(r||(d.halo=r=k.renderer.path().add(m.parentGroup)),r.show()[c?"animate":"attr"]({d:this.haloPath(a.size)}),r.attr({"class":"highcharts-halo highcharts-color-"+q(this.colorIndex,d.colorIndex)+(this.className?" "+this.className:""),visibility:f,zIndex:-1}),r.point=this,k.styledMode||r.attr(l({fill:this.color||d.color,"fill-opacity":a.opacity},a.attributes))):r&&r.point&&r.point.haloPath&&r.animate({d:r.point.haloPath(0)},null,r.hide);
J(this,"afterSetState")}},haloPath:function(a){return this.series.chart.renderer.symbols.circle(Math.floor(this.plotX)-a,this.plotY-a,2*a,2*a)}});l(F.prototype,{onMouseOver:function(){var a=this.chart,c=a.hoverSeries;a.pointer.setHoverChartIndex();if(c&&c!==this)c.onMouseOut();this.options.events.mouseOver&&J(this,"mouseOver");this.setState("hover");a.hoverSeries=this},onMouseOut:function(){var a=this.options,c=this.chart,d=c.tooltip,e=c.hoverPoint;c.hoverSeries=null;if(e)e.onMouseOut();this&&a.events.mouseOut&&
J(this,"mouseOut");!d||this.stickyTracking||d.shared&&!this.noSharedTooltip||d.hide();c.series.forEach(function(a){a.setState("",!0)})},setState:function(a,c){var d=this,e=d.options,f=d.graph,g=e.inactiveOtherPoints,h=e.states,l=e.lineWidth,m=e.opacity,n=q(h[a||"normal"]&&h[a||"normal"].animation,d.chart.options.chart.animation);e=0;a=a||"";if(d.state!==a&&([d.group,d.markerGroup,d.dataLabelsGroup].forEach(function(b){b&&(d.state&&b.removeClass("highcharts-series-"+d.state),a&&b.addClass("highcharts-series-"+
a))}),d.state=a,!d.chart.styledMode)){if(h[a]&&!1===h[a].enabled)return;a&&(l=h[a].lineWidth||l+(h[a].lineWidthPlus||0),m=q(h[a].opacity,m));if(f&&!f.dashstyle)for(h={"stroke-width":l},f.animate(h,n);d["zone-graph-"+e];)d["zone-graph-"+e].attr(h),e+=1;g||[d.group,d.markerGroup,d.dataLabelsGroup,d.labelBySeries].forEach(function(a){a&&a.animate({opacity:m},n)})}c&&g&&d.points&&d.setAllPointsToState(a)},setAllPointsToState:function(a){this.points.forEach(function(c){c.setState&&c.setState(a)})},setVisible:function(a,
c){var d=this,e=d.chart,f=d.legendItem,g=e.options.chart.ignoreHiddenSeries,h=d.visible;var l=(d.visible=a=d.options.visible=d.userOptions.visible="undefined"===typeof a?!h:a)?"show":"hide";["group","dataLabelsGroup","markerGroup","tracker","tt"].forEach(function(a){if(d[a])d[a][l]()});if(e.hoverSeries===d||(e.hoverPoint&&e.hoverPoint.series)===d)d.onMouseOut();f&&e.legend.colorizeItem(d,a);d.isDirty=!0;d.options.stacking&&e.series.forEach(function(a){a.options.stacking&&a.visible&&(a.isDirty=!0)});
d.linkedSeries.forEach(function(c){c.setVisible(a,!1)});g&&(e.isDirtyBox=!0);J(d,l);!1!==c&&e.redraw()},show:function(){this.setVisible(!0)},hide:function(){this.setVisible(!1)},select:function(a){this.selected=a=this.options.selected="undefined"===typeof a?!this.selected:a;this.checkbox&&(this.checkbox.checked=a);J(this,a?"select":"unselect")},drawTracker:m.drawTrackerGraph})});N(m,"Core/Responsive.js",[m["Core/Chart/Chart.js"],m["Core/Utilities.js"]],function(f,h){var m=h.find,z=h.isArray,F=h.isObject,
L=h.merge,K=h.objectEach,C=h.pick,y=h.splat,e=h.uniqueKey;f.prototype.setResponsive=function(f,h){var v=this.options.responsive,y=[],n=this.currentResponsive;!h&&v&&v.rules&&v.rules.forEach(function(f){"undefined"===typeof f._id&&(f._id=e());this.matchResponsiveRule(f,y)},this);h=L.apply(0,y.map(function(e){return m(v.rules,function(f){return f._id===e}).chartOptions}));h.isResponsiveOptions=!0;y=y.toString()||void 0;y!==(n&&n.ruleIds)&&(n&&this.update(n.undoOptions,f,!0),y?(n=this.currentOptions(h),
n.isResponsiveOptions=!0,this.currentResponsive={ruleIds:y,mergedOptions:h,undoOptions:n},this.update(h,f,!0)):this.currentResponsive=void 0)};f.prototype.matchResponsiveRule=function(e,f){var h=e.condition;(h.callback||function(){return this.chartWidth<=C(h.maxWidth,Number.MAX_VALUE)&&this.chartHeight<=C(h.maxHeight,Number.MAX_VALUE)&&this.chartWidth>=C(h.minWidth,0)&&this.chartHeight>=C(h.minHeight,0)}).call(this)&&f.push(e._id)};f.prototype.currentOptions=function(e){function f(e,l,m,v){var n;
K(e,function(d,e){if(!v&&-1<h.collectionsWithUpdate.indexOf(e))for(d=y(d),m[e]=[],n=0;n<Math.max(d.length,l[e].length);n++)l[e][n]&&(void 0===d[n]?m[e][n]=l[e][n]:(m[e][n]={},f(d[n],l[e][n],m[e][n],v+1)));else F(d)?(m[e]=z(d)?[]:{},f(d,l[e]||{},m[e],v+1)):m[e]="undefined"===typeof l[e]?null:l[e]})}var h=this,m={};f(e,this.options,m,0);return m}});N(m,"masters/highcharts.src.js",[m["Core/Globals.js"]],function(f){return f});m["masters/highcharts.src.js"]._modules=m;return m["masters/highcharts.src.js"]});
//# sourceMappingURL=highcharts.js.map

/***/ }),

/***/ "./node_modules/highcharts/modules/data.js":
/*!*************************************************!*
  !*** ./node_modules/highcharts/modules/data.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 Highcharts JS v8.2.2 (2020-10-22)

 Data module

 (c) 2012-2019 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(b){ true&&module.exports?(b["default"]=b,module.exports=b): true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! highcharts */ "./node_modules/highcharts/highcharts.js")], __WEBPACK_AMD_DEFINE_RESULT__ = (function(q){b(q);b.Highcharts=q;return b}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):0})(function(b){function q(b,x,q,v){b.hasOwnProperty(x)||(b[x]=v.apply(null,q))}b=b?b._modules:{};q(b,"Extensions/Ajax.js",[b["Core/Globals.js"],b["Core/Utilities.js"]],function(b,x){var q=x.merge,v=x.objectEach;b.ajax=function(b){var m=
q(!0,{url:!1,type:"get",dataType:"json",success:!1,error:!1,data:!1,headers:{}},b);b={json:"application/json",xml:"application/xml",text:"text/plain",octet:"application/octet-stream"};var r=new XMLHttpRequest;if(!m.url)return!1;r.open(m.type.toUpperCase(),m.url,!0);m.headers["Content-Type"]||r.setRequestHeader("Content-Type",b[m.dataType]||b.text);v(m.headers,function(b,m){r.setRequestHeader(m,b)});r.onreadystatechange=function(){if(4===r.readyState){if(200===r.status){var b=r.responseText;if("json"===
m.dataType)try{b=JSON.parse(b)}catch(C){m.error&&m.error(r,C);return}return m.success&&m.success(b)}m.error&&m.error(r,r.responseText)}};try{m.data=JSON.stringify(m.data)}catch(O){}r.send(m.data||!0)};b.getJSON=function(q,m){b.ajax({url:q,success:m,dataType:"json",headers:{"Content-Type":"text/plain"}})};return{ajax:b.ajax,getJSON:b.getJSON}});q(b,"Extensions/Data.js",[b["Extensions/Ajax.js"],b["Core/Series/Series.js"],b["Core/Chart/Chart.js"],b["Core/Globals.js"],b["Core/Series/Point.js"],b["Core/Utilities.js"]],
function(b,q,H,v,I,m){var r=b.ajax,x=v.doc;b=m.addEvent;var C=m.defined,J=m.extend,K=m.fireEvent,E=m.isNumber,B=m.merge,L=m.objectEach,M=m.pick,N=m.splat,D=q.seriesTypes;q=function(){function b(a,c,f){this.options=this.rawColumns=this.firstRowAsNames=this.chartOptions=this.chart=void 0;this.dateFormats={"YYYY/mm/dd":{regex:/^([0-9]{4})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{1,2})$/,parser:function(a){return a?Date.UTC(+a[1],a[2]-1,+a[3]):NaN}},"dd/mm/YYYY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,
parser:function(a){return a?Date.UTC(+a[3],a[2]-1,+a[1]):NaN},alternative:"mm/dd/YYYY"},"mm/dd/YYYY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,parser:function(a){return a?Date.UTC(+a[3],a[1]-1,+a[2]):NaN}},"dd/mm/YY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,parser:function(a){if(!a)return NaN;var c=+a[3];c=c>(new Date).getFullYear()-2E3?c+1900:c+2E3;return Date.UTC(c,a[2]-1,+a[1])},alternative:"mm/dd/YY"},"mm/dd/YY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,
parser:function(a){return a?Date.UTC(+a[3]+2E3,a[1]-1,+a[2]):NaN}}};this.init(a,c,f)}b.prototype.init=function(a,c,f){var d=a.decimalPoint;c&&(this.chartOptions=c);f&&(this.chart=f);"."!==d&&","!==d&&(d=void 0);this.options=a;this.columns=a.columns||this.rowsToColumns(a.rows)||[];this.firstRowAsNames=M(a.firstRowAsNames,this.firstRowAsNames,!0);this.decimalRegex=d&&new RegExp("^(-?[0-9]+)"+d+"([0-9]+)$");this.rawColumns=[];if(this.columns.length){this.dataFound();var h=!0}this.hasURLOption(a)&&(clearTimeout(this.liveDataTimeout),
h=!1);h||(h=this.fetchLiveData());h||(h=!!this.parseCSV().length);h||(h=!!this.parseTable().length);h||(h=this.parseGoogleSpreadsheet());!h&&a.afterComplete&&a.afterComplete()};b.prototype.hasURLOption=function(a){return!(!a||!(a.rowsURL||a.csvURL||a.columnsURL))};b.prototype.getColumnDistribution=function(){var a=this.chartOptions,c=this.options,f=[],d=function(a){return(D[a||"line"].prototype.pointArrayMap||[0]).length},h=a&&a.chart&&a.chart.type,g=[],b=[],l=0;c=c&&c.seriesMapping||a&&a.series&&
a.series.map(function(){return{x:0}})||[];var e;(a&&a.series||[]).forEach(function(a){g.push(d(a.type||h))});c.forEach(function(a){f.push(a.x||0)});0===f.length&&f.push(0);c.forEach(function(c){var f=new G,k=g[l]||d(h),n=(a&&a.series||[])[l]||{},m=D[n.type||h||"line"].prototype.pointArrayMap,y=m||["y"];(C(c.x)||n.isCartesian||!m)&&f.addColumnReader(c.x,"x");L(c,function(a,c){"x"!==c&&f.addColumnReader(a,c)});for(e=0;e<k;e++)f.hasReader(y[e])||f.addColumnReader(void 0,y[e]);b.push(f);l++});c=D[h||
"line"].prototype.pointArrayMap;"undefined"===typeof c&&(c=["y"]);this.valueCount={global:d(h),xColumns:f,individual:g,seriesBuilders:b,globalPointArrayMap:c}};b.prototype.dataFound=function(){this.options.switchRowsAndColumns&&(this.columns=this.rowsToColumns(this.columns));this.getColumnDistribution();this.parseTypes();!1!==this.parsed()&&this.complete()};b.prototype.parseCSV=function(a){function c(a,c,f,d){function b(c){k=a[c];l=a[c-1];p=a[c+1]}function h(a){w.length<t+1&&w.push([a]);w[t][w[t].length-
1]!==a&&w[t].push(a)}function g(){e>u||u>m?(++u,n=""):(!isNaN(parseFloat(n))&&isFinite(n)?(n=parseFloat(n),h("number")):isNaN(Date.parse(n))?h("string"):(n=n.replace(/\//g,"-"),h("date")),A.length<t+1&&A.push([]),f||(A[t][c]=n),n="",++t,++u)}var z=0,k="",l="",p="",n="",u=0,t=0;if(a.trim().length&&"#"!==a.trim()[0]){for(;z<a.length;z++){b(z);if("#"===k){g();return}if('"'===k)for(b(++z);z<a.length&&('"'!==k||'"'===l||'"'===p);){if('"'!==k||'"'===k&&'"'!==l)n+=k;b(++z)}else d&&d[k]?d[k](k,n)&&g():k===
y?g():n+=k}g()}}function f(a){var c=0,f=0,d=!1;a.some(function(a,d){var b=!1,h="";if(13<d)return!0;for(var g=0;g<a.length;g++){d=a[g];var k=a[g+1];var e=a[g-1];if("#"===d)break;if('"'===d)if(b){if('"'!==e&&'"'!==k){for(;" "===k&&g<a.length;)k=a[++g];"undefined"!==typeof n[k]&&n[k]++;b=!1}}else b=!0;else"undefined"!==typeof n[d]?(h=h.trim(),isNaN(Date.parse(h))?!isNaN(h)&&isFinite(h)||n[d]++:n[d]++,h=""):h+=d;","===d&&f++;"."===d&&c++}});d=n[";"]>n[","]?";":",";b.decimalPoint||(b.decimalPoint=c>f?
".":",",h.decimalRegex=new RegExp("^(-?[0-9]+)"+b.decimalPoint+"([0-9]+)$"));return d}function d(a,c){var d=[],f=0,g=!1,k=[],n=[],e;if(!c||c>a.length)c=a.length;for(;f<c;f++)if("undefined"!==typeof a[f]&&a[f]&&a[f].length){var l=a[f].trim().replace(/\//g," ").replace(/\-/g," ").replace(/\./g," ").split(" ");d=["","",""];for(e=0;e<l.length;e++)e<d.length&&(l[e]=parseInt(l[e],10),l[e]&&(n[e]=!n[e]||n[e]<l[e]?l[e]:n[e],"undefined"!==typeof k[e]?k[e]!==l[e]&&(k[e]=!1):k[e]=l[e],31<l[e]?d[e]=100>l[e]?
"YY":"YYYY":12<l[e]&&31>=l[e]?(d[e]="dd",g=!0):d[e].length||(d[e]="mm")))}if(g){for(e=0;e<k.length;e++)!1!==k[e]?12<n[e]&&"YY"!==d[e]&&"YYYY"!==d[e]&&(d[e]="YY"):12<n[e]&&"mm"===d[e]&&(d[e]="dd");3===d.length&&"dd"===d[1]&&"dd"===d[2]&&(d[2]="YY");a=d.join("/");return(b.dateFormats||h.dateFormats)[a]?a:(K("deduceDateFailed"),"YYYY/mm/dd")}return"YYYY/mm/dd"}var h=this,b=a||this.options,k=b.csv;a="undefined"!==typeof b.startRow&&b.startRow?b.startRow:0;var l=b.endRow||Number.MAX_VALUE,e="undefined"!==
typeof b.startColumn&&b.startColumn?b.startColumn:0,m=b.endColumn||Number.MAX_VALUE,p=0,w=[],n={",":0,";":0,"\t":0};var A=this.columns=[];k&&b.beforeParse&&(k=b.beforeParse.call(this,k));if(k){k=k.replace(/\r\n/g,"\n").replace(/\r/g,"\n").split(b.lineDelimiter||"\n");if(!a||0>a)a=0;if(!l||l>=k.length)l=k.length-1;if(b.itemDelimiter)var y=b.itemDelimiter;else y=null,y=f(k);var t=0;for(p=a;p<=l;p++)"#"===k[p][0]?t++:c(k[p],p-a-t);b.columnTypes&&0!==b.columnTypes.length||!w.length||!w[0].length||"date"!==
w[0][1]||b.dateFormat||(b.dateFormat=d(A[0]));this.dataFound()}return A};b.prototype.parseTable=function(){var a=this.options,c=a.table,f=this.columns||[],d=a.startRow||0,b=a.endRow||Number.MAX_VALUE,g=a.startColumn||0,k=a.endColumn||Number.MAX_VALUE;c&&("string"===typeof c&&(c=x.getElementById(c)),[].forEach.call(c.getElementsByTagName("tr"),function(a,c){c>=d&&c<=b&&[].forEach.call(a.children,function(a,b){var h=f[b-g],e=1;if(("TD"===a.tagName||"TH"===a.tagName)&&b>=g&&b<=k)for(f[b-g]||(f[b-g]=
[]),f[b-g][c-d]=a.innerHTML;c-d>=e&&void 0===h[c-d-e];)h[c-d-e]=null,e++})}),this.dataFound());return f};b.prototype.fetchLiveData=function(){function a(h){function e(e,l,n){function m(){g&&f.liveDataURL===e&&(c.liveDataTimeout=setTimeout(a,k))}if(!e||0!==e.indexOf("http"))return e&&d.error&&d.error("Invalid URL"),!1;h&&(clearTimeout(c.liveDataTimeout),f.liveDataURL=e);r({url:e,dataType:n||"json",success:function(a){f&&f.series&&l(a);m()},error:function(a,c){3>++b&&m();return d.error&&d.error(c,a)}});
return!0}e(l.csvURL,function(a){f.update({data:{csv:a}})},"text")||e(l.rowsURL,function(a){f.update({data:{rows:a}})})||e(l.columnsURL,function(a){f.update({data:{columns:a}})})}var c=this,f=this.chart,d=this.options,b=0,g=d.enablePolling,k=1E3*(d.dataRefreshRate||2),l=B(d);if(!this.hasURLOption(d))return!1;1E3>k&&(k=1E3);delete d.csvURL;delete d.rowsURL;delete d.columnsURL;a(!0);return this.hasURLOption(d)};b.prototype.parseGoogleSpreadsheet=function(){function a(c){var b=["https://spreadsheets.google.com/feeds/cells",
d,g,"public/values?alt=json"].join("/");r({url:b,dataType:"json",success:function(d){c(d);f.enablePolling&&setTimeout(function(){a(c)},1E3*(f.dataRefreshRate||2))},error:function(a,c){return f.error&&f.error(c,a)}})}var c=this,f=this.options,d=f.googleSpreadsheetKey,b=this.chart,g=f.googleSpreadsheetWorksheet||1,k=f.startRow||0,l=f.endRow||Number.MAX_VALUE,e=f.startColumn||0,m=f.endColumn||Number.MAX_VALUE,p=1E3*(f.dataRefreshRate||2);4E3>p&&(p=4E3);d&&(delete f.googleSpreadsheetKey,a(function(a){var d=
[];a=a.feed.entry;var f=(a||[]).length,h=0,g;if(!a||0===a.length)return!1;for(g=0;g<f;g++){var p=a[g];h=Math.max(h,p.gs$cell.col)}for(g=0;g<h;g++)g>=e&&g<=m&&(d[g-e]=[]);for(g=0;g<f;g++){p=a[g];h=p.gs$cell.row-1;var q=p.gs$cell.col-1;if(q>=e&&q<=m&&h>=k&&h<=l){var u=p.gs$cell||p.content;p=null;u.numericValue?p=0<=u.$t.indexOf("/")||0<=u.$t.indexOf("-")?u.$t:0<u.$t.indexOf("%")?100*parseFloat(u.numericValue):parseFloat(u.numericValue):u.$t&&u.$t.length&&(p=u.$t);d[q-e][h-k]=p}}d.forEach(function(a){for(g=
0;g<a.length;g++)"undefined"===typeof a[g]&&(a[g]=null)});b&&b.series?b.update({data:{columns:d}}):(c.columns=d,c.dataFound())}));return!1};b.prototype.trim=function(a,c){"string"===typeof a&&(a=a.replace(/^\s+|\s+$/g,""),c&&/^[0-9\s]+$/.test(a)&&(a=a.replace(/\s/g,"")),this.decimalRegex&&(a=a.replace(this.decimalRegex,"$1.$2")));return a};b.prototype.parseTypes=function(){for(var a=this.columns,c=a.length;c--;)this.parseColumn(a[c],c)};b.prototype.parseColumn=function(a,c){var f=this.rawColumns,
d=this.columns,b=a.length,g=this.firstRowAsNames,k=-1!==this.valueCount.xColumns.indexOf(c),l,e=[],m=this.chartOptions,p,q=(this.options.columnTypes||[])[c];m=k&&(m&&m.xAxis&&"category"===N(m.xAxis)[0].type||"string"===q);for(f[c]||(f[c]=[]);b--;){var n=e[b]||a[b];var r=this.trim(n);var F=this.trim(n,!0);var t=parseFloat(F);"undefined"===typeof f[c][b]&&(f[c][b]=r);m||0===b&&g?a[b]=""+r:+F===t?(a[b]=t,31536E6<t&&"float"!==q?a.isDatetime=!0:a.isNumeric=!0,"undefined"!==typeof a[b+1]&&(p=t>a[b+1])):
(r&&r.length&&(l=this.parseDate(n)),k&&E(l)&&"float"!==q?(e[b]=n,a[b]=l,a.isDatetime=!0,"undefined"!==typeof a[b+1]&&(n=l>a[b+1],n!==p&&"undefined"!==typeof p&&(this.alternativeFormat?(this.dateFormat=this.alternativeFormat,b=a.length,this.alternativeFormat=this.dateFormats[this.dateFormat].alternative):a.unsorted=!0),p=n)):(a[b]=""===r?null:r,0!==b&&(a.isDatetime||a.isNumeric)&&(a.mixed=!0)))}k&&a.mixed&&(d[c]=f[c]);if(k&&p&&this.options.sort)for(c=0;c<d.length;c++)d[c].reverse(),g&&d[c].unshift(d[c].pop())};
b.prototype.parseDate=function(a){var c=this.options.parseDate,b,d=this.options.dateFormat||this.dateFormat,h;if(c)var g=c(a);else if("string"===typeof a){if(d)(c=this.dateFormats[d])||(c=this.dateFormats["YYYY/mm/dd"]),(h=a.match(c.regex))&&(g=c.parser(h));else for(b in this.dateFormats)if(c=this.dateFormats[b],h=a.match(c.regex)){this.dateFormat=b;this.alternativeFormat=c.alternative;g=c.parser(h);break}h||(h=Date.parse(a),"object"===typeof h&&null!==h&&h.getTime?g=h.getTime()-6E4*h.getTimezoneOffset():
E(h)&&(g=h-6E4*(new Date(h)).getTimezoneOffset()))}return g};b.prototype.rowsToColumns=function(a){var c,b;if(a){var d=[];var h=a.length;for(c=0;c<h;c++){var g=a[c].length;for(b=0;b<g;b++)d[b]||(d[b]=[]),d[b][c]=a[c][b]}}return d};b.prototype.getData=function(){if(this.columns)return this.rowsToColumns(this.columns).slice(1)};b.prototype.parsed=function(){if(this.options.parsed)return this.options.parsed.call(this,this.columns)};b.prototype.getFreeIndexes=function(a,c){var b,d=[],h=[];for(b=0;b<a;b+=
1)d.push(!0);for(a=0;a<c.length;a+=1){var g=c[a].getReferencedColumnIndexes();for(b=0;b<g.length;b+=1)d[g[b]]=!1}for(b=0;b<d.length;b+=1)d[b]&&h.push(b);return h};b.prototype.complete=function(){var a=this.columns,b,f=this.options,d,h,g=[];if(f.complete||f.afterComplete){if(this.firstRowAsNames)for(d=0;d<a.length;d++)a[d].name=a[d].shift();var k=[];var l=this.getFreeIndexes(a.length,this.valueCount.seriesBuilders);for(d=0;d<this.valueCount.seriesBuilders.length;d++){var e=this.valueCount.seriesBuilders[d];
e.populateColumns(l)&&g.push(e)}for(;0<l.length;){e=new G;e.addColumnReader(0,"x");d=l.indexOf(0);-1!==d&&l.splice(d,1);for(d=0;d<this.valueCount.global;d++)e.addColumnReader(void 0,this.valueCount.globalPointArrayMap[d]);e.populateColumns(l)&&g.push(e)}0<g.length&&0<g[0].readers.length&&(e=a[g[0].readers[0].columnIndex],"undefined"!==typeof e&&(e.isDatetime?b="datetime":e.isNumeric||(b="category")));if("category"===b)for(d=0;d<g.length;d++)for(e=g[d],l=0;l<e.readers.length;l++)"x"===e.readers[l].configName&&
(e.readers[l].configName="name");for(d=0;d<g.length;d++){e=g[d];l=[];for(h=0;h<a[0].length;h++)l[h]=e.read(a,h);k[d]={data:l};e.name&&(k[d].name=e.name);"category"===b&&(k[d].turboThreshold=0)}a={series:k};b&&(a.xAxis={type:b},"category"===b&&(a.xAxis.uniqueNames=!1));f.complete&&f.complete(a);f.afterComplete&&f.afterComplete(a)}};b.prototype.update=function(a,b){var c=this.chart;a&&(a.afterComplete=function(a){a&&(a.xAxis&&c.xAxis[0]&&a.xAxis.type===c.xAxis[0].options.type&&delete a.xAxis,c.update(a,
b,!0))},B(!0,c.options.data,a),this.init(c.options.data))};return b}();v.data=function(b,a,c){return new v.Data(b,a,c)};b(H,"init",function(b){var a=this,c=b.args[0]||{},f=b.args[1];c&&c.data&&!a.hasDataDef&&(a.hasDataDef=!0,a.data=new v.Data(J(c.data,{afterComplete:function(b){var d;if(Object.hasOwnProperty.call(c,"series"))if("object"===typeof c.series)for(d=Math.max(c.series.length,b&&b.series?b.series.length:0);d--;){var g=c.series[d]||{};c.series[d]=B(g,b&&b.series?b.series[d]:{})}else delete c.series;
c=B(b,c);a.init(c,f)}}),c,a),b.preventDefault())});var G=function(){function b(){this.readers=[];this.pointIsArray=!0;this.name=void 0}b.prototype.populateColumns=function(a){var b=!0;this.readers.forEach(function(b){"undefined"===typeof b.columnIndex&&(b.columnIndex=a.shift())});this.readers.forEach(function(a){"undefined"===typeof a.columnIndex&&(b=!1)});return b};b.prototype.read=function(a,b){var c=this.pointIsArray,d=c?[]:{};this.readers.forEach(function(g){var f=a[g.columnIndex][b];c?d.push(f):
0<g.configName.indexOf(".")?I.prototype.setNestedProperty(d,f,g.configName):d[g.configName]=f});if("undefined"===typeof this.name&&2<=this.readers.length){var h=this.getReferencedColumnIndexes();2<=h.length&&(h.shift(),h.sort(function(a,b){return a-b}),this.name=a[h.shift()].name)}return d};b.prototype.addColumnReader=function(a,b){this.readers.push({columnIndex:a,configName:b});"x"!==b&&"y"!==b&&"undefined"!==typeof b&&(this.pointIsArray=!1)};b.prototype.getReferencedColumnIndexes=function(){var a,
b=[];for(a=0;a<this.readers.length;a+=1){var f=this.readers[a];"undefined"!==typeof f.columnIndex&&b.push(f.columnIndex)}return b};b.prototype.hasReader=function(a){var b;for(b=0;b<this.readers.length;b+=1){var f=this.readers[b];if(f.configName===a)return!0}};return b}();v.Data=q;return v.Data});q(b,"masters/modules/data.src.js",[],function(){})});
//# sourceMappingURL=data.js.map

/***/ }),

/***/ "./node_modules/highcharts/modules/exporting.js":
/*!******************************************************!*
  !*** ./node_modules/highcharts/modules/exporting.js ***!
  \******************************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 Highcharts JS v8.2.2 (2020-10-22)

 Exporting module

 (c) 2010-2019 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(e){ true&&module.exports?(e["default"]=e,module.exports=e): true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! highcharts */ "./node_modules/highcharts/highcharts.js")], __WEBPACK_AMD_DEFINE_RESULT__ = (function(q){e(q);e.Highcharts=q;return e}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):0})(function(e){function q(e,l,g,k){e.hasOwnProperty(l)||(e[l]=k.apply(null,g))}e=e?e._modules:{};q(e,"Extensions/FullScreen.js",[e["Core/Chart/Chart.js"],e["Core/Globals.js"],e["Core/Utilities.js"]],function(e,l,g){var k=g.addEvent;
g=function(){function e(f){this.chart=f;this.isOpen=!1;f=f.renderTo;this.browserProps||("function"===typeof f.requestFullscreen?this.browserProps={fullscreenChange:"fullscreenchange",requestFullscreen:"requestFullscreen",exitFullscreen:"exitFullscreen"}:f.mozRequestFullScreen?this.browserProps={fullscreenChange:"mozfullscreenchange",requestFullscreen:"mozRequestFullScreen",exitFullscreen:"mozCancelFullScreen"}:f.webkitRequestFullScreen?this.browserProps={fullscreenChange:"webkitfullscreenchange",
requestFullscreen:"webkitRequestFullScreen",exitFullscreen:"webkitExitFullscreen"}:f.msRequestFullscreen&&(this.browserProps={fullscreenChange:"MSFullscreenChange",requestFullscreen:"msRequestFullscreen",exitFullscreen:"msExitFullscreen"}))}e.prototype.close=function(){var f=this.chart;if(this.isOpen&&this.browserProps&&f.container.ownerDocument instanceof Document)f.container.ownerDocument[this.browserProps.exitFullscreen]();this.unbindFullscreenEvent&&this.unbindFullscreenEvent();this.isOpen=!1;
this.setButtonText()};e.prototype.open=function(){var f=this,e=f.chart;if(f.browserProps){f.unbindFullscreenEvent=k(e.container.ownerDocument,f.browserProps.fullscreenChange,function(){f.isOpen?(f.isOpen=!1,f.close()):(f.isOpen=!0,f.setButtonText())});var g=e.renderTo[f.browserProps.requestFullscreen]();if(g)g["catch"](function(){alert("Full screen is not supported inside a frame.")});k(e,"destroy",f.unbindFullscreenEvent)}};e.prototype.setButtonText=function(){var f,e=this.chart,g=e.exportDivElements,
k=e.options.exporting,l=null===(f=null===k||void 0===k?void 0:k.buttons)||void 0===f?void 0:f.contextButton.menuItems;f=e.options.lang;(null===k||void 0===k?0:k.menuItemDefinitions)&&(null===f||void 0===f?0:f.exitFullscreen)&&f.viewFullscreen&&l&&g&&g.length&&(g[l.indexOf("viewFullscreen")].innerHTML=this.isOpen?f.exitFullscreen:k.menuItemDefinitions.viewFullscreen.text||f.viewFullscreen)};e.prototype.toggle=function(){this.isOpen?this.close():this.open()};return e}();l.Fullscreen=g;k(e,"beforeRender",
function(){this.fullscreen=new l.Fullscreen(this)});return l.Fullscreen});q(e,"Mixins/Navigation.js",[],function(){return{initUpdate:function(e){e.navigation||(e.navigation={updates:[],update:function(e,g){this.updates.forEach(function(k){k.update.call(k.context,e,g)})}})},addUpdate:function(e,l){l.navigation||this.initUpdate(l);l.navigation.updates.push({update:e,context:l})}}});q(e,"Extensions/Exporting.js",[e["Core/Chart/Chart.js"],e["Mixins/Navigation.js"],e["Core/Globals.js"],e["Core/Options.js"],
e["Core/Renderer/SVG/SVGRenderer.js"],e["Core/Utilities.js"]],function(e,l,g,k,q,f){var A=g.doc,H=g.isTouchDevice,y=g.win;k=k.defaultOptions;var v=f.addEvent,r=f.css,x=f.createElement,D=f.discardElement,z=f.extend,I=f.find,C=f.fireEvent,J=f.isObject,p=f.merge,E=f.objectEach,t=f.pick,K=f.removeEvent,L=f.uniqueKey,F=y.navigator.userAgent,G=g.Renderer.prototype.symbols,M=/Edge\/|Trident\/|MSIE /.test(F),N=/firefox/i.test(F);z(k.lang,{viewFullscreen:"View in full screen",exitFullscreen:"Exit from full screen",
printChart:"Print chart",downloadPNG:"Download PNG image",downloadJPEG:"Download JPEG image",downloadPDF:"Download PDF document",downloadSVG:"Download SVG vector image",contextButtonTitle:"Chart context menu"});k.navigation||(k.navigation={});p(!0,k.navigation,{buttonOptions:{theme:{},symbolSize:14,symbolX:12.5,symbolY:10.5,align:"right",buttonSpacing:3,height:22,verticalAlign:"top",width:24}});p(!0,k.navigation,{menuStyle:{border:"1px solid #999999",background:"#ffffff",padding:"5px 0"},menuItemStyle:{padding:"0.5em 1em",
color:"#333333",background:"none",fontSize:H?"14px":"11px",transition:"background 250ms, color 250ms"},menuItemHoverStyle:{background:"#335cad",color:"#ffffff"},buttonOptions:{symbolFill:"#666666",symbolStroke:"#666666",symbolStrokeWidth:3,theme:{padding:5}}});k.exporting={type:"image/png",url:"https://export.highcharts.com/",printMaxWidth:780,scale:2,buttons:{contextButton:{className:"highcharts-contextbutton",menuClassName:"highcharts-contextmenu",symbol:"menu",titleKey:"contextButtonTitle",menuItems:"viewFullscreen printChart separator downloadPNG downloadJPEG downloadPDF downloadSVG".split(" ")}},
menuItemDefinitions:{viewFullscreen:{textKey:"viewFullscreen",onclick:function(){this.fullscreen.toggle()}},printChart:{textKey:"printChart",onclick:function(){this.print()}},separator:{separator:!0},downloadPNG:{textKey:"downloadPNG",onclick:function(){this.exportChart()}},downloadJPEG:{textKey:"downloadJPEG",onclick:function(){this.exportChart({type:"image/jpeg"})}},downloadPDF:{textKey:"downloadPDF",onclick:function(){this.exportChart({type:"application/pdf"})}},downloadSVG:{textKey:"downloadSVG",
onclick:function(){this.exportChart({type:"image/svg+xml"})}}}};g.post=function(a,b,c){var d=x("form",p({method:"post",action:a,enctype:"multipart/form-data"},c),{display:"none"},A.body);E(b,function(a,b){x("input",{type:"hidden",name:b,value:a},null,d)});d.submit();D(d)};g.isSafari&&g.win.matchMedia("print").addListener(function(a){g.printingChart&&(a.matches?g.printingChart.beforePrint():g.printingChart.afterPrint())});z(e.prototype,{sanitizeSVG:function(a,b){var c=a.indexOf("</svg>")+6,d=a.substr(c);
a=a.substr(0,c);b&&b.exporting&&b.exporting.allowHTML&&d&&(d='<foreignObject x="0" y="0" width="'+b.chart.width+'" height="'+b.chart.height+'"><body xmlns="http://www.w3.org/1999/xhtml">'+d.replace(/(<(?:img|br).*?(?=>))>/g,"$1 />")+"</body></foreignObject>",a=a.replace("</svg>",d+"</svg>"));a=a.replace(/zIndex="[^"]+"/g,"").replace(/symbolName="[^"]+"/g,"").replace(/jQuery[0-9]+="[^"]+"/g,"").replace(/url\(("|&quot;)(.*?)("|&quot;);?\)/g,"url($2)").replace(/url\([^#]+#/g,"url(#").replace(/<svg /,
'<svg xmlns:xlink="http://www.w3.org/1999/xlink" ').replace(/ (|NS[0-9]+:)href=/g," xlink:href=").replace(/\n/," ").replace(/(fill|stroke)="rgba\(([ 0-9]+,[ 0-9]+,[ 0-9]+),([ 0-9\.]+)\)"/g,'$1="rgb($2)" $1-opacity="$3"').replace(/&nbsp;/g,"\u00a0").replace(/&shy;/g,"\u00ad");this.ieSanitizeSVG&&(a=this.ieSanitizeSVG(a));return a},getChartHTML:function(){this.styledMode&&this.inlineStyles();return this.container.innerHTML},getSVG:function(a){var b,c=p(this.options,a);c.plotOptions=p(this.userOptions.plotOptions,
a&&a.plotOptions);c.time=p(this.userOptions.time,a&&a.time);var d=x("div",null,{position:"absolute",top:"-9999em",width:this.chartWidth+"px",height:this.chartHeight+"px"},A.body);var f=this.renderTo.style.width;var w=this.renderTo.style.height;f=c.exporting.sourceWidth||c.chart.width||/px$/.test(f)&&parseInt(f,10)||(c.isGantt?800:600);w=c.exporting.sourceHeight||c.chart.height||/px$/.test(w)&&parseInt(w,10)||400;z(c.chart,{animation:!1,renderTo:d,forExport:!0,renderer:"SVGRenderer",width:f,height:w});
c.exporting.enabled=!1;delete c.data;c.series=[];this.series.forEach(function(a){b=p(a.userOptions,{animation:!1,enableMouseTracking:!1,showCheckbox:!1,visible:a.visible});b.isInternal||c.series.push(b)});this.axes.forEach(function(a){a.userOptions.internalKey||(a.userOptions.internalKey=L())});var g=new e(c,this.callback);a&&["xAxis","yAxis","series"].forEach(function(b){var d={};a[b]&&(d[b]=a[b],g.update(d))});this.axes.forEach(function(a){var b=I(g.axes,function(b){return b.options.internalKey===
a.userOptions.internalKey}),d=a.getExtremes(),c=d.userMin;d=d.userMax;b&&("undefined"!==typeof c&&c!==b.min||"undefined"!==typeof d&&d!==b.max)&&b.setExtremes(c,d,!0,!1)});f=g.getChartHTML();C(this,"getSVG",{chartCopy:g});f=this.sanitizeSVG(f,c);c=null;g.destroy();D(d);return f},getSVGForExport:function(a,b){var c=this.options.exporting;return this.getSVG(p({chart:{borderRadius:0}},c.chartOptions,b,{exporting:{sourceWidth:a&&a.sourceWidth||c.sourceWidth,sourceHeight:a&&a.sourceHeight||c.sourceHeight}}))},
getFilename:function(){var a=this.userOptions.title&&this.userOptions.title.text,b=this.options.exporting.filename;if(b)return b.replace(/\//g,"-");"string"===typeof a&&(b=a.toLowerCase().replace(/<\/?[^>]+(>|$)/g,"").replace(/[\s_]+/g,"-").replace(/[^a-z0-9\-]/g,"").replace(/^[\-]+/g,"").replace(/[\-]+/g,"-").substr(0,24).replace(/[\-]+$/g,""));if(!b||5>b.length)b="chart";return b},exportChart:function(a,b){b=this.getSVGForExport(a,b);a=p(this.options.exporting,a);g.post(a.url,{filename:a.filename?
a.filename.replace(/\//g,"-"):this.getFilename(),type:a.type,width:a.width||0,scale:a.scale,svg:b},a.formAttributes)},moveContainers:function(a){(this.fixedDiv?[this.fixedDiv,this.scrollingContainer]:[this.container]).forEach(function(b){a.appendChild(b)})},beforePrint:function(){var a=A.body,b=this.options.exporting.printMaxWidth,c={childNodes:a.childNodes,origDisplay:[],resetParams:void 0};this.isPrinting=!0;this.pointer.reset(null,0);C(this,"beforePrint");b&&this.chartWidth>b&&(c.resetParams=[this.options.chart.width,
void 0,!1],this.setSize(b,void 0,!1));[].forEach.call(c.childNodes,function(a,b){1===a.nodeType&&(c.origDisplay[b]=a.style.display,a.style.display="none")});this.moveContainers(a);this.printReverseInfo=c},afterPrint:function(){if(this.printReverseInfo){var a=this.printReverseInfo.childNodes,b=this.printReverseInfo.origDisplay,c=this.printReverseInfo.resetParams;this.moveContainers(this.renderTo);[].forEach.call(a,function(a,c){1===a.nodeType&&(a.style.display=b[c]||"")});this.isPrinting=!1;c&&this.setSize.apply(this,
c);delete this.printReverseInfo;delete g.printingChart;C(this,"afterPrint")}},print:function(){var a=this;a.isPrinting||(g.printingChart=a,g.isSafari||a.beforePrint(),setTimeout(function(){y.focus();y.print();g.isSafari||setTimeout(function(){a.afterPrint()},1E3)},1))},contextMenu:function(a,b,c,d,e,g,k){var h=this,w=h.options.navigation,l=h.chartWidth,B=h.chartHeight,n="cache-"+a,m=h[n],u=Math.max(e,g);if(!m){h.exportContextMenu=h[n]=m=x("div",{className:a},{position:"absolute",zIndex:1E3,padding:u+
"px",pointerEvents:"auto"},h.fixedDiv||h.container);var p=x("ul",{className:"highcharts-menu"},{listStyle:"none",margin:0,padding:0},m);h.styledMode||r(p,z({MozBoxShadow:"3px 3px 10px #888",WebkitBoxShadow:"3px 3px 10px #888",boxShadow:"3px 3px 10px #888"},w.menuStyle));m.hideMenu=function(){r(m,{display:"none"});k&&k.setState(0);h.openMenu=!1;r(h.renderTo,{overflow:"hidden"});f.clearTimeout(m.hideTimer);C(h,"exportMenuHidden")};h.exportEvents.push(v(m,"mouseleave",function(){m.hideTimer=y.setTimeout(m.hideMenu,
500)}),v(m,"mouseenter",function(){f.clearTimeout(m.hideTimer)}),v(A,"mouseup",function(b){h.pointer.inClass(b.target,a)||m.hideMenu()}),v(m,"click",function(){h.openMenu&&m.hideMenu()}));b.forEach(function(a){"string"===typeof a&&(a=h.options.exporting.menuItemDefinitions[a]);if(J(a,!0)){if(a.separator)var b=x("hr",null,null,p);else"viewData"===a.textKey&&h.isDataTableVisible&&(a.textKey="hideData"),b=x("li",{className:"highcharts-menu-item",onclick:function(b){b&&b.stopPropagation();m.hideMenu();
a.onclick&&a.onclick.apply(h,arguments)},innerHTML:a.text||h.options.lang[a.textKey]},null,p),h.styledMode||(b.onmouseover=function(){r(this,w.menuItemHoverStyle)},b.onmouseout=function(){r(this,w.menuItemStyle)},r(b,z({cursor:"pointer"},w.menuItemStyle)));h.exportDivElements.push(b)}});h.exportDivElements.push(p,m);h.exportMenuWidth=m.offsetWidth;h.exportMenuHeight=m.offsetHeight}b={display:"block"};c+h.exportMenuWidth>l?b.right=l-c-e-u+"px":b.left=c-u+"px";d+g+h.exportMenuHeight>B&&"top"!==k.alignOptions.verticalAlign?
b.bottom=B-d-u+"px":b.top=d+g-u+"px";r(m,b);r(h.renderTo,{overflow:""});h.openMenu=!0;C(h,"exportMenuShown")},addButton:function(a){var b=this,c=b.renderer,d=p(b.options.navigation.buttonOptions,a),e=d.onclick,f=d.menuItems,g=d.symbolSize||12;b.btnCount||(b.btnCount=0);b.exportDivElements||(b.exportDivElements=[],b.exportSVGElements=[]);if(!1!==d.enabled){var h=d.theme,k=h.states,l=k&&k.hover;k=k&&k.select;var B;b.styledMode||(h.fill=t(h.fill,"#ffffff"),h.stroke=t(h.stroke,"none"));delete h.states;
e?B=function(a){a&&a.stopPropagation();e.call(b,a)}:f&&(B=function(a){a&&a.stopPropagation();b.contextMenu(n.menuClassName,f,n.translateX,n.translateY,n.width,n.height,n);n.setState(2)});d.text&&d.symbol?h.paddingLeft=t(h.paddingLeft,25):d.text||z(h,{width:d.width,height:d.height,padding:0});b.styledMode||(h["stroke-linecap"]="round",h.fill=t(h.fill,"#ffffff"),h.stroke=t(h.stroke,"none"));var n=c.button(d.text,0,0,B,h,l,k).addClass(a.className).attr({title:t(b.options.lang[d._titleKey||d.titleKey],
"")});n.menuClassName=a.menuClassName||"highcharts-menu-"+b.btnCount++;if(d.symbol){var m=c.symbol(d.symbol,d.symbolX-g/2,d.symbolY-g/2,g,g,{width:g,height:g}).addClass("highcharts-button-symbol").attr({zIndex:1}).add(n);b.styledMode||m.attr({stroke:d.symbolStroke,fill:d.symbolFill,"stroke-width":d.symbolStrokeWidth||1})}n.add(b.exportingGroup).align(z(d,{width:n.width,x:t(d.x,b.buttonOffset)}),!0,"spacingBox");b.buttonOffset+=(n.width+d.buttonSpacing)*("right"===d.align?-1:1);b.exportSVGElements.push(n,
m)}},destroyExport:function(a){var b=a?a.target:this;a=b.exportSVGElements;var c=b.exportDivElements,d=b.exportEvents,e;a&&(a.forEach(function(a,d){a&&(a.onclick=a.ontouchstart=null,e="cache-"+a.menuClassName,b[e]&&delete b[e],b.exportSVGElements[d]=a.destroy())}),a.length=0);b.exportingGroup&&(b.exportingGroup.destroy(),delete b.exportingGroup);c&&(c.forEach(function(a,d){f.clearTimeout(a.hideTimer);K(a,"mouseleave");b.exportDivElements[d]=a.onmouseout=a.onmouseover=a.ontouchstart=a.onclick=null;
D(a)}),c.length=0);d&&(d.forEach(function(a){a()}),d.length=0)}});q.prototype.inlineToAttributes="fill stroke strokeLinecap strokeLinejoin strokeWidth textAnchor x y".split(" ");q.prototype.inlineBlacklist=[/-/,/^(clipPath|cssText|d|height|width)$/,/^font$/,/[lL]ogical(Width|Height)$/,/perspective/,/TapHighlightColor/,/^transition/,/^length$/];q.prototype.unstyledElements=["clipPath","defs","desc"];e.prototype.inlineStyles=function(){function a(a){return a.replace(/([A-Z])/g,function(a,b){return"-"+
b.toLowerCase()})}function b(c){function n(b,g){u=q=!1;if(f){for(r=f.length;r--&&!q;)q=f[r].test(g);u=!q}"transform"===g&&"none"===b&&(u=!0);for(r=e.length;r--&&!u;)u=e[r].test(g)||"function"===typeof b;u||w[g]===b&&"svg"!==c.nodeName||h[c.nodeName][g]===b||(d&&-1===d.indexOf(g)?m+=a(g)+":"+b+";":b&&c.setAttribute(a(g),b))}var m="",u,q,r;if(1===c.nodeType&&-1===g.indexOf(c.nodeName)){var t=y.getComputedStyle(c,null);var w="svg"===c.nodeName?{}:y.getComputedStyle(c.parentNode,null);if(!h[c.nodeName]){k=
l.getElementsByTagName("svg")[0];var v=l.createElementNS(c.namespaceURI,c.nodeName);k.appendChild(v);h[c.nodeName]=p(y.getComputedStyle(v,null));"text"===c.nodeName&&delete h.text.fill;k.removeChild(v)}if(N||M)for(var x in t)n(t[x],x);else E(t,n);m&&(t=c.getAttribute("style"),c.setAttribute("style",(t?t+";":"")+m));"svg"===c.nodeName&&c.setAttribute("stroke-width","1px");"text"!==c.nodeName&&[].forEach.call(c.children||c.childNodes,b)}}var c=this.renderer,d=c.inlineToAttributes,e=c.inlineBlacklist,
f=c.inlineWhitelist,g=c.unstyledElements,h={},k;c=A.createElement("iframe");r(c,{width:"1px",height:"1px",visibility:"hidden"});A.body.appendChild(c);var l=c.contentWindow.document;l.open();l.write('<svg xmlns="http://www.w3.org/2000/svg"></svg>');l.close();b(this.container.querySelector("svg"));k.parentNode.remove();c.remove()};G.menu=function(a,b,c,d){return[["M",a,b+2.5],["L",a+c,b+2.5],["M",a,b+d/2+.5],["L",a+c,b+d/2+.5],["M",a,b+d-1.5],["L",a+c,b+d-1.5]]};G.menuball=function(a,b,c,d){a=[];d=
d/3-2;return a=a.concat(this.circle(c-d,b,d,d),this.circle(c-d,b+d+4,d,d),this.circle(c-d,b+2*(d+4),d,d))};e.prototype.renderExporting=function(){var a=this,b=a.options.exporting,c=b.buttons,d=a.isDirtyExporting||!a.exportSVGElements;a.buttonOffset=0;a.isDirtyExporting&&a.destroyExport();d&&!1!==b.enabled&&(a.exportEvents=[],a.exportingGroup=a.exportingGroup||a.renderer.g("exporting-group").attr({zIndex:3}).add(),E(c,function(b){a.addButton(b)}),a.isDirtyExporting=!1);v(a,"destroy",a.destroyExport)};
v(e,"init",function(){var a=this;a.exporting={update:function(b,c){a.isDirtyExporting=!0;p(!0,a.options.exporting,b);t(c,!0)&&a.redraw()}};l.addUpdate(function(b,c){a.isDirtyExporting=!0;p(!0,a.options.navigation,b);t(c,!0)&&a.redraw()},a)});e.prototype.callbacks.push(function(a){a.renderExporting();v(a,"redraw",a.renderExporting)})});q(e,"masters/modules/exporting.src.js",[],function(){})});
//# sourceMappingURL=exporting.js.map

/***/ }),

/***/ "./node_modules/is-buffer/index.js":
/*!*****************************************!*
  !*** ./node_modules/is-buffer/index.js ***!
  \*****************************************/
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

module.exports = function isBuffer (obj) {
  return obj != null && obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}


/***/ }),

/***/ "./node_modules/luxon/build/cjs-browser/luxon.js":
/*!*******************************************************!*
  !*** ./node_modules/luxon/build/cjs-browser/luxon.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o) {
  var i = 0;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  i = o[Symbol.iterator]();
  return i.next.bind(i);
}

// these aren't really private, but nor are they really useful to document

/**
 * @private
 */
var LuxonError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(LuxonError, _Error);

  function LuxonError() {
    return _Error.apply(this, arguments) || this;
  }

  return LuxonError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
/**
 * @private
 */


var InvalidDateTimeError = /*#__PURE__*/function (_LuxonError) {
  _inheritsLoose(InvalidDateTimeError, _LuxonError);

  function InvalidDateTimeError(reason) {
    return _LuxonError.call(this, "Invalid DateTime: " + reason.toMessage()) || this;
  }

  return InvalidDateTimeError;
}(LuxonError);
/**
 * @private
 */

var InvalidIntervalError = /*#__PURE__*/function (_LuxonError2) {
  _inheritsLoose(InvalidIntervalError, _LuxonError2);

  function InvalidIntervalError(reason) {
    return _LuxonError2.call(this, "Invalid Interval: " + reason.toMessage()) || this;
  }

  return InvalidIntervalError;
}(LuxonError);
/**
 * @private
 */

var InvalidDurationError = /*#__PURE__*/function (_LuxonError3) {
  _inheritsLoose(InvalidDurationError, _LuxonError3);

  function InvalidDurationError(reason) {
    return _LuxonError3.call(this, "Invalid Duration: " + reason.toMessage()) || this;
  }

  return InvalidDurationError;
}(LuxonError);
/**
 * @private
 */

var ConflictingSpecificationError = /*#__PURE__*/function (_LuxonError4) {
  _inheritsLoose(ConflictingSpecificationError, _LuxonError4);

  function ConflictingSpecificationError() {
    return _LuxonError4.apply(this, arguments) || this;
  }

  return ConflictingSpecificationError;
}(LuxonError);
/**
 * @private
 */

var InvalidUnitError = /*#__PURE__*/function (_LuxonError5) {
  _inheritsLoose(InvalidUnitError, _LuxonError5);

  function InvalidUnitError(unit) {
    return _LuxonError5.call(this, "Invalid unit " + unit) || this;
  }

  return InvalidUnitError;
}(LuxonError);
/**
 * @private
 */

var InvalidArgumentError = /*#__PURE__*/function (_LuxonError6) {
  _inheritsLoose(InvalidArgumentError, _LuxonError6);

  function InvalidArgumentError() {
    return _LuxonError6.apply(this, arguments) || this;
  }

  return InvalidArgumentError;
}(LuxonError);
/**
 * @private
 */

var ZoneIsAbstractError = /*#__PURE__*/function (_LuxonError7) {
  _inheritsLoose(ZoneIsAbstractError, _LuxonError7);

  function ZoneIsAbstractError() {
    return _LuxonError7.call(this, "Zone is an abstract class") || this;
  }

  return ZoneIsAbstractError;
}(LuxonError);

/**
 * @private
 */
var n = "numeric",
    s = "short",
    l = "long";
var DATE_SHORT = {
  year: n,
  month: n,
  day: n
};
var DATE_MED = {
  year: n,
  month: s,
  day: n
};
var DATE_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s
};
var DATE_FULL = {
  year: n,
  month: l,
  day: n
};
var DATE_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l
};
var TIME_SIMPLE = {
  hour: n,
  minute: n
};
var TIME_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n
};
var TIME_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
var TIME_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};
var TIME_24_SIMPLE = {
  hour: n,
  minute: n,
  hour12: false
};
/**
 * {@link toLocaleString}; format like '09:30:23', always 24-hour.
 */

var TIME_24_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n,
  hour12: false
};
/**
 * {@link toLocaleString}; format like '09:30:23 EDT', always 24-hour.
 */

var TIME_24_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hour12: false,
  timeZoneName: s
};
/**
 * {@link toLocaleString}; format like '09:30:23 Eastern Daylight Time', always 24-hour.
 */

var TIME_24_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hour12: false,
  timeZoneName: l
};
/**
 * {@link toLocaleString}; format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
 */

var DATETIME_SHORT = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n
};
/**
 * {@link toLocaleString}; format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
 */

var DATETIME_SHORT_WITH_SECONDS = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
  second: n
};
var DATETIME_MED = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n
};
var DATETIME_MED_WITH_SECONDS = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
  second: n
};
var DATETIME_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s,
  hour: n,
  minute: n
};
var DATETIME_FULL = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  timeZoneName: s
};
var DATETIME_FULL_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
var DATETIME_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  timeZoneName: l
};
var DATETIME_HUGE_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};

/*
  This is just a junk drawer, containing anything used across multiple classes.
  Because Luxon is small(ish), this should stay small and we won't worry about splitting
  it up into, say, parsingUtil.js and basicUtil.js and so on. But they are divided up by feature area.
*/
/**
 * @private
 */
// TYPES

function isUndefined(o) {
  return typeof o === "undefined";
}
function isNumber(o) {
  return typeof o === "number";
}
function isInteger(o) {
  return typeof o === "number" && o % 1 === 0;
}
function isString(o) {
  return typeof o === "string";
}
function isDate(o) {
  return Object.prototype.toString.call(o) === "[object Date]";
} // CAPABILITIES

function hasIntl() {
  try {
    return typeof Intl !== "undefined" && Intl.DateTimeFormat;
  } catch (e) {
    return false;
  }
}
function hasFormatToParts() {
  return !isUndefined(Intl.DateTimeFormat.prototype.formatToParts);
}
function hasRelative() {
  try {
    return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
  } catch (e) {
    return false;
  }
} // OBJECTS AND ARRAYS

function maybeArray(thing) {
  return Array.isArray(thing) ? thing : [thing];
}
function bestBy(arr, by, compare) {
  if (arr.length === 0) {
    return undefined;
  }

  return arr.reduce(function (best, next) {
    var pair = [by(next), next];

    if (!best) {
      return pair;
    } else if (compare(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
}
function pick(obj, keys) {
  return keys.reduce(function (a, k) {
    a[k] = obj[k];
    return a;
  }, {});
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
} // NUMBERS AND STRINGS

function integerBetween(thing, bottom, top) {
  return isInteger(thing) && thing >= bottom && thing <= top;
} // x % n but takes the sign of n instead of x

function floorMod(x, n) {
  return x - n * Math.floor(x / n);
}
function padStart(input, n) {
  if (n === void 0) {
    n = 2;
  }

  if (input.toString().length < n) {
    return ("0".repeat(n) + input).slice(-n);
  } else {
    return input.toString();
  }
}
function parseInteger(string) {
  if (isUndefined(string) || string === null || string === "") {
    return undefined;
  } else {
    return parseInt(string, 10);
  }
}
function parseMillis(fraction) {
  // Return undefined (instead of 0) in these cases, where fraction is not set
  if (isUndefined(fraction) || fraction === null || fraction === "") {
    return undefined;
  } else {
    var f = parseFloat("0." + fraction) * 1000;
    return Math.floor(f);
  }
}
function roundTo(number, digits, towardZero) {
  if (towardZero === void 0) {
    towardZero = false;
  }

  var factor = Math.pow(10, digits),
      rounder = towardZero ? Math.trunc : Math.round;
  return rounder(number * factor) / factor;
} // DATE BASICS

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}
function daysInMonth(year, month) {
  var modMonth = floorMod(month - 1, 12) + 1,
      modYear = year + (month - modMonth) / 12;

  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
  }
} // covert a calendar object to a local timestamp (epoch, but with the offset baked in)

function objToLocalTS(obj) {
  var d = Date.UTC(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second, obj.millisecond); // for legacy reasons, years between 0 and 99 are interpreted as 19XX; revert that

  if (obj.year < 100 && obj.year >= 0) {
    d = new Date(d);
    d.setUTCFullYear(d.getUTCFullYear() - 1900);
  }

  return +d;
}
function weeksInWeekYear(weekYear) {
  var p1 = (weekYear + Math.floor(weekYear / 4) - Math.floor(weekYear / 100) + Math.floor(weekYear / 400)) % 7,
      last = weekYear - 1,
      p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
  return p1 === 4 || p2 === 3 ? 53 : 52;
}
function untruncateYear(year) {
  if (year > 99) {
    return year;
  } else return year > 60 ? 1900 + year : 2000 + year;
} // PARSING

function parseZoneInfo(ts, offsetFormat, locale, timeZone) {
  if (timeZone === void 0) {
    timeZone = null;
  }

  var date = new Date(ts),
      intlOpts = {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  };

  if (timeZone) {
    intlOpts.timeZone = timeZone;
  }

  var modified = Object.assign({
    timeZoneName: offsetFormat
  }, intlOpts),
      intl = hasIntl();

  if (intl && hasFormatToParts()) {
    var parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find(function (m) {
      return m.type.toLowerCase() === "timezonename";
    });
    return parsed ? parsed.value : null;
  } else if (intl) {
    // this probably doesn't work for all locales
    var without = new Intl.DateTimeFormat(locale, intlOpts).format(date),
        included = new Intl.DateTimeFormat(locale, modified).format(date),
        diffed = included.substring(without.length),
        trimmed = diffed.replace(/^[, \u200e]+/, "");
    return trimmed;
  } else {
    return null;
  }
} // signedOffset('-5', '30') -> -330

function signedOffset(offHourStr, offMinuteStr) {
  var offHour = parseInt(offHourStr, 10); // don't || this because we want to preserve -0

  if (Number.isNaN(offHour)) {
    offHour = 0;
  }

  var offMin = parseInt(offMinuteStr, 10) || 0,
      offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
} // COERCION

function asNumber(value) {
  var numericValue = Number(value);
  if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue)) throw new InvalidArgumentError("Invalid unit value " + value);
  return numericValue;
}
function normalizeObject(obj, normalizer, nonUnitKeys) {
  var normalized = {};

  for (var u in obj) {
    if (hasOwnProperty(obj, u)) {
      if (nonUnitKeys.indexOf(u) >= 0) continue;
      var v = obj[u];
      if (v === undefined || v === null) continue;
      normalized[normalizer(u)] = asNumber(v);
    }
  }

  return normalized;
}
function formatOffset(offset, format) {
  var hours = Math.trunc(Math.abs(offset / 60)),
      minutes = Math.trunc(Math.abs(offset % 60)),
      sign = offset >= 0 ? "+" : "-";

  switch (format) {
    case "short":
      return "" + sign + padStart(hours, 2) + ":" + padStart(minutes, 2);

    case "narrow":
      return "" + sign + hours + (minutes > 0 ? ":" + minutes : "");

    case "techie":
      return "" + sign + padStart(hours, 2) + padStart(minutes, 2);

    default:
      throw new RangeError("Value format " + format + " is out of range for property format");
  }
}
function timeObject(obj) {
  return pick(obj, ["hour", "minute", "second", "millisecond"]);
}
var ianaRegex = /[A-Za-z_+-]{1,256}(:?\/[A-Za-z_+-]{1,256}(\/[A-Za-z_+-]{1,256})?)?/;

function stringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}
/**
 * @private
 */


var monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
function months(length) {
  switch (length) {
    case "narrow":
      return monthsNarrow;

    case "short":
      return monthsShort;

    case "long":
      return monthsLong;

    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

    case "2-digit":
      return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

    default:
      return null;
  }
}
var weekdaysLong = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];
function weekdays(length) {
  switch (length) {
    case "narrow":
      return weekdaysNarrow;

    case "short":
      return weekdaysShort;

    case "long":
      return weekdaysLong;

    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7"];

    default:
      return null;
  }
}
var meridiems = ["AM", "PM"];
var erasLong = ["Before Christ", "Anno Domini"];
var erasShort = ["BC", "AD"];
var erasNarrow = ["B", "A"];
function eras(length) {
  switch (length) {
    case "narrow":
      return erasNarrow;

    case "short":
      return erasShort;

    case "long":
      return erasLong;

    default:
      return null;
  }
}
function meridiemForDateTime(dt) {
  return meridiems[dt.hour < 12 ? 0 : 1];
}
function weekdayForDateTime(dt, length) {
  return weekdays(length)[dt.weekday - 1];
}
function monthForDateTime(dt, length) {
  return months(length)[dt.month - 1];
}
function eraForDateTime(dt, length) {
  return eras(length)[dt.year < 0 ? 0 : 1];
}
function formatRelativeTime(unit, count, numeric, narrow) {
  if (numeric === void 0) {
    numeric = "always";
  }

  if (narrow === void 0) {
    narrow = false;
  }

  var units = {
    years: ["year", "yr."],
    quarters: ["quarter", "qtr."],
    months: ["month", "mo."],
    weeks: ["week", "wk."],
    days: ["day", "day", "days"],
    hours: ["hour", "hr."],
    minutes: ["minute", "min."],
    seconds: ["second", "sec."]
  };
  var lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;

  if (numeric === "auto" && lastable) {
    var isDay = unit === "days";

    switch (count) {
      case 1:
        return isDay ? "tomorrow" : "next " + units[unit][0];

      case -1:
        return isDay ? "yesterday" : "last " + units[unit][0];

      case 0:
        return isDay ? "today" : "this " + units[unit][0];

    }
  }

  var isInPast = Object.is(count, -0) || count < 0,
      fmtValue = Math.abs(count),
      singular = fmtValue === 1,
      lilUnits = units[unit],
      fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
  return isInPast ? fmtValue + " " + fmtUnit + " ago" : "in " + fmtValue + " " + fmtUnit;
}
function formatString(knownFormat) {
  // these all have the offsets removed because we don't have access to them
  // without all the intl stuff this is backfilling
  var filtered = pick(knownFormat, ["weekday", "era", "year", "month", "day", "hour", "minute", "second", "timeZoneName", "hour12"]),
      key = stringify(filtered),
      dateTimeHuge = "EEEE, LLLL d, yyyy, h:mm a";

  switch (key) {
    case stringify(DATE_SHORT):
      return "M/d/yyyy";

    case stringify(DATE_MED):
      return "LLL d, yyyy";

    case stringify(DATE_MED_WITH_WEEKDAY):
      return "EEE, LLL d, yyyy";

    case stringify(DATE_FULL):
      return "LLLL d, yyyy";

    case stringify(DATE_HUGE):
      return "EEEE, LLLL d, yyyy";

    case stringify(TIME_SIMPLE):
      return "h:mm a";

    case stringify(TIME_WITH_SECONDS):
      return "h:mm:ss a";

    case stringify(TIME_WITH_SHORT_OFFSET):
      return "h:mm a";

    case stringify(TIME_WITH_LONG_OFFSET):
      return "h:mm a";

    case stringify(TIME_24_SIMPLE):
      return "HH:mm";

    case stringify(TIME_24_WITH_SECONDS):
      return "HH:mm:ss";

    case stringify(TIME_24_WITH_SHORT_OFFSET):
      return "HH:mm";

    case stringify(TIME_24_WITH_LONG_OFFSET):
      return "HH:mm";

    case stringify(DATETIME_SHORT):
      return "M/d/yyyy, h:mm a";

    case stringify(DATETIME_MED):
      return "LLL d, yyyy, h:mm a";

    case stringify(DATETIME_FULL):
      return "LLLL d, yyyy, h:mm a";

    case stringify(DATETIME_HUGE):
      return dateTimeHuge;

    case stringify(DATETIME_SHORT_WITH_SECONDS):
      return "M/d/yyyy, h:mm:ss a";

    case stringify(DATETIME_MED_WITH_SECONDS):
      return "LLL d, yyyy, h:mm:ss a";

    case stringify(DATETIME_MED_WITH_WEEKDAY):
      return "EEE, d LLL yyyy, h:mm a";

    case stringify(DATETIME_FULL_WITH_SECONDS):
      return "LLLL d, yyyy, h:mm:ss a";

    case stringify(DATETIME_HUGE_WITH_SECONDS):
      return "EEEE, LLLL d, yyyy, h:mm:ss a";

    default:
      return dateTimeHuge;
  }
}

function stringifyTokens(splits, tokenToString) {
  var s = "";

  for (var _iterator = _createForOfIteratorHelperLoose(splits), _step; !(_step = _iterator()).done;) {
    var token = _step.value;

    if (token.literal) {
      s += token.val;
    } else {
      s += tokenToString(token.val);
    }
  }

  return s;
}

var _macroTokenToFormatOpts = {
  D: DATE_SHORT,
  DD: DATE_MED,
  DDD: DATE_FULL,
  DDDD: DATE_HUGE,
  t: TIME_SIMPLE,
  tt: TIME_WITH_SECONDS,
  ttt: TIME_WITH_SHORT_OFFSET,
  tttt: TIME_WITH_LONG_OFFSET,
  T: TIME_24_SIMPLE,
  TT: TIME_24_WITH_SECONDS,
  TTT: TIME_24_WITH_SHORT_OFFSET,
  TTTT: TIME_24_WITH_LONG_OFFSET,
  f: DATETIME_SHORT,
  ff: DATETIME_MED,
  fff: DATETIME_FULL,
  ffff: DATETIME_HUGE,
  F: DATETIME_SHORT_WITH_SECONDS,
  FF: DATETIME_MED_WITH_SECONDS,
  FFF: DATETIME_FULL_WITH_SECONDS,
  FFFF: DATETIME_HUGE_WITH_SECONDS
};
/**
 * @private
 */

var Formatter = /*#__PURE__*/function () {
  Formatter.create = function create(locale, opts) {
    if (opts === void 0) {
      opts = {};
    }

    return new Formatter(locale, opts);
  };

  Formatter.parseFormat = function parseFormat(fmt) {
    var current = null,
        currentFull = "",
        bracketed = false;
    var splits = [];

    for (var i = 0; i < fmt.length; i++) {
      var c = fmt.charAt(i);

      if (c === "'") {
        if (currentFull.length > 0) {
          splits.push({
            literal: bracketed,
            val: currentFull
          });
        }

        current = null;
        currentFull = "";
        bracketed = !bracketed;
      } else if (bracketed) {
        currentFull += c;
      } else if (c === current) {
        currentFull += c;
      } else {
        if (currentFull.length > 0) {
          splits.push({
            literal: false,
            val: currentFull
          });
        }

        currentFull = c;
        current = c;
      }
    }

    if (currentFull.length > 0) {
      splits.push({
        literal: bracketed,
        val: currentFull
      });
    }

    return splits;
  };

  Formatter.macroTokenToFormatOpts = function macroTokenToFormatOpts(token) {
    return _macroTokenToFormatOpts[token];
  };

  function Formatter(locale, formatOpts) {
    this.opts = formatOpts;
    this.loc = locale;
    this.systemLoc = null;
  }

  var _proto = Formatter.prototype;

  _proto.formatWithSystemDefault = function formatWithSystemDefault(dt, opts) {
    if (this.systemLoc === null) {
      this.systemLoc = this.loc.redefaultToSystem();
    }

    var df = this.systemLoc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.format();
  };

  _proto.formatDateTime = function formatDateTime(dt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var df = this.loc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.format();
  };

  _proto.formatDateTimeParts = function formatDateTimeParts(dt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var df = this.loc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.formatToParts();
  };

  _proto.resolvedOptions = function resolvedOptions(dt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var df = this.loc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.resolvedOptions();
  };

  _proto.num = function num(n, p) {
    if (p === void 0) {
      p = 0;
    }

    // we get some perf out of doing this here, annoyingly
    if (this.opts.forceSimple) {
      return padStart(n, p);
    }

    var opts = Object.assign({}, this.opts);

    if (p > 0) {
      opts.padTo = p;
    }

    return this.loc.numberFormatter(opts).format(n);
  };

  _proto.formatDateTimeFromString = function formatDateTimeFromString(dt, fmt) {
    var _this = this;

    var knownEnglish = this.loc.listingMode() === "en",
        useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory" && hasFormatToParts(),
        string = function string(opts, extract) {
      return _this.loc.extract(dt, opts, extract);
    },
        formatOffset = function formatOffset(opts) {
      if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
        return "Z";
      }

      return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
    },
        meridiem = function meridiem() {
      return knownEnglish ? meridiemForDateTime(dt) : string({
        hour: "numeric",
        hour12: true
      }, "dayperiod");
    },
        month = function month(length, standalone) {
      return knownEnglish ? monthForDateTime(dt, length) : string(standalone ? {
        month: length
      } : {
        month: length,
        day: "numeric"
      }, "month");
    },
        weekday = function weekday(length, standalone) {
      return knownEnglish ? weekdayForDateTime(dt, length) : string(standalone ? {
        weekday: length
      } : {
        weekday: length,
        month: "long",
        day: "numeric"
      }, "weekday");
    },
        maybeMacro = function maybeMacro(token) {
      var formatOpts = Formatter.macroTokenToFormatOpts(token);

      if (formatOpts) {
        return _this.formatWithSystemDefault(dt, formatOpts);
      } else {
        return token;
      }
    },
        era = function era(length) {
      return knownEnglish ? eraForDateTime(dt, length) : string({
        era: length
      }, "era");
    },
        tokenToString = function tokenToString(token) {
      // Where possible: http://cldr.unicode.org/translation/date-time#TOC-Stand-Alone-vs.-Format-Styles
      switch (token) {
        // ms
        case "S":
          return _this.num(dt.millisecond);

        case "u": // falls through

        case "SSS":
          return _this.num(dt.millisecond, 3);
        // seconds

        case "s":
          return _this.num(dt.second);

        case "ss":
          return _this.num(dt.second, 2);
        // minutes

        case "m":
          return _this.num(dt.minute);

        case "mm":
          return _this.num(dt.minute, 2);
        // hours

        case "h":
          return _this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);

        case "hh":
          return _this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);

        case "H":
          return _this.num(dt.hour);

        case "HH":
          return _this.num(dt.hour, 2);
        // offset

        case "Z":
          // like +6
          return formatOffset({
            format: "narrow",
            allowZ: _this.opts.allowZ
          });

        case "ZZ":
          // like +06:00
          return formatOffset({
            format: "short",
            allowZ: _this.opts.allowZ
          });

        case "ZZZ":
          // like +0600
          return formatOffset({
            format: "techie",
            allowZ: _this.opts.allowZ
          });

        case "ZZZZ":
          // like EST
          return dt.zone.offsetName(dt.ts, {
            format: "short",
            locale: _this.loc.locale
          });

        case "ZZZZZ":
          // like Eastern Standard Time
          return dt.zone.offsetName(dt.ts, {
            format: "long",
            locale: _this.loc.locale
          });
        // zone

        case "z":
          // like America/New_York
          return dt.zoneName;
        // meridiems

        case "a":
          return meridiem();
        // dates

        case "d":
          return useDateTimeFormatter ? string({
            day: "numeric"
          }, "day") : _this.num(dt.day);

        case "dd":
          return useDateTimeFormatter ? string({
            day: "2-digit"
          }, "day") : _this.num(dt.day, 2);
        // weekdays - standalone

        case "c":
          // like 1
          return _this.num(dt.weekday);

        case "ccc":
          // like 'Tues'
          return weekday("short", true);

        case "cccc":
          // like 'Tuesday'
          return weekday("long", true);

        case "ccccc":
          // like 'T'
          return weekday("narrow", true);
        // weekdays - format

        case "E":
          // like 1
          return _this.num(dt.weekday);

        case "EEE":
          // like 'Tues'
          return weekday("short", false);

        case "EEEE":
          // like 'Tuesday'
          return weekday("long", false);

        case "EEEEE":
          // like 'T'
          return weekday("narrow", false);
        // months - standalone

        case "L":
          // like 1
          return useDateTimeFormatter ? string({
            month: "numeric",
            day: "numeric"
          }, "month") : _this.num(dt.month);

        case "LL":
          // like 01, doesn't seem to work
          return useDateTimeFormatter ? string({
            month: "2-digit",
            day: "numeric"
          }, "month") : _this.num(dt.month, 2);

        case "LLL":
          // like Jan
          return month("short", true);

        case "LLLL":
          // like January
          return month("long", true);

        case "LLLLL":
          // like J
          return month("narrow", true);
        // months - format

        case "M":
          // like 1
          return useDateTimeFormatter ? string({
            month: "numeric"
          }, "month") : _this.num(dt.month);

        case "MM":
          // like 01
          return useDateTimeFormatter ? string({
            month: "2-digit"
          }, "month") : _this.num(dt.month, 2);

        case "MMM":
          // like Jan
          return month("short", false);

        case "MMMM":
          // like January
          return month("long", false);

        case "MMMMM":
          // like J
          return month("narrow", false);
        // years

        case "y":
          // like 2014
          return useDateTimeFormatter ? string({
            year: "numeric"
          }, "year") : _this.num(dt.year);

        case "yy":
          // like 14
          return useDateTimeFormatter ? string({
            year: "2-digit"
          }, "year") : _this.num(dt.year.toString().slice(-2), 2);

        case "yyyy":
          // like 0012
          return useDateTimeFormatter ? string({
            year: "numeric"
          }, "year") : _this.num(dt.year, 4);

        case "yyyyyy":
          // like 000012
          return useDateTimeFormatter ? string({
            year: "numeric"
          }, "year") : _this.num(dt.year, 6);
        // eras

        case "G":
          // like AD
          return era("short");

        case "GG":
          // like Anno Domini
          return era("long");

        case "GGGGG":
          return era("narrow");

        case "kk":
          return _this.num(dt.weekYear.toString().slice(-2), 2);

        case "kkkk":
          return _this.num(dt.weekYear, 4);

        case "W":
          return _this.num(dt.weekNumber);

        case "WW":
          return _this.num(dt.weekNumber, 2);

        case "o":
          return _this.num(dt.ordinal);

        case "ooo":
          return _this.num(dt.ordinal, 3);

        case "q":
          // like 1
          return _this.num(dt.quarter);

        case "qq":
          // like 01
          return _this.num(dt.quarter, 2);

        case "X":
          return _this.num(Math.floor(dt.ts / 1000));

        case "x":
          return _this.num(dt.ts);

        default:
          return maybeMacro(token);
      }
    };

    return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
  };

  _proto.formatDurationFromString = function formatDurationFromString(dur, fmt) {
    var _this2 = this;

    var tokenToField = function tokenToField(token) {
      switch (token[0]) {
        case "S":
          return "millisecond";

        case "s":
          return "second";

        case "m":
          return "minute";

        case "h":
          return "hour";

        case "d":
          return "day";

        case "M":
          return "month";

        case "y":
          return "year";

        default:
          return null;
      }
    },
        tokenToString = function tokenToString(lildur) {
      return function (token) {
        var mapped = tokenToField(token);

        if (mapped) {
          return _this2.num(lildur.get(mapped), token.length);
        } else {
          return token;
        }
      };
    },
        tokens = Formatter.parseFormat(fmt),
        realTokens = tokens.reduce(function (found, _ref) {
      var literal = _ref.literal,
          val = _ref.val;
      return literal ? found : found.concat(val);
    }, []),
        collapsed = dur.shiftTo.apply(dur, realTokens.map(tokenToField).filter(function (t) {
      return t;
    }));

    return stringifyTokens(tokens, tokenToString(collapsed));
  };

  return Formatter;
}();

var Invalid = /*#__PURE__*/function () {
  function Invalid(reason, explanation) {
    this.reason = reason;
    this.explanation = explanation;
  }

  var _proto = Invalid.prototype;

  _proto.toMessage = function toMessage() {
    if (this.explanation) {
      return this.reason + ": " + this.explanation;
    } else {
      return this.reason;
    }
  };

  return Invalid;
}();

/**
 * @interface
 */

var Zone = /*#__PURE__*/function () {
  function Zone() {}

  var _proto = Zone.prototype;

  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  _proto.offsetName = function offsetName(ts, opts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Returns the offset's value as a string
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  ;

  _proto.formatOffset = function formatOffset(ts, format) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  ;

  _proto.offset = function offset(ts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is equal to another zone
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  ;

  _proto.equals = function equals(otherZone) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is valid.
   * @abstract
   * @type {boolean}
   */
  ;

  _createClass(Zone, [{
    key: "type",

    /**
     * The type of zone
     * @abstract
     * @type {string}
     */
    get: function get() {
      throw new ZoneIsAbstractError();
    }
    /**
     * The name of this zone.
     * @abstract
     * @type {string}
     */

  }, {
    key: "name",
    get: function get() {
      throw new ZoneIsAbstractError();
    }
    /**
     * Returns whether the offset is known to be fixed for the whole year.
     * @abstract
     * @type {boolean}
     */

  }, {
    key: "universal",
    get: function get() {
      throw new ZoneIsAbstractError();
    }
  }, {
    key: "isValid",
    get: function get() {
      throw new ZoneIsAbstractError();
    }
  }]);

  return Zone;
}();

var singleton = null;
/**
 * Represents the local zone for this Javascript environment.
 * @implements {Zone}
 */

var LocalZone = /*#__PURE__*/function (_Zone) {
  _inheritsLoose(LocalZone, _Zone);

  function LocalZone() {
    return _Zone.apply(this, arguments) || this;
  }

  var _proto = LocalZone.prototype;

  /** @override **/
  _proto.offsetName = function offsetName(ts, _ref) {
    var format = _ref.format,
        locale = _ref.locale;
    return parseZoneInfo(ts, format, locale);
  }
  /** @override **/
  ;

  _proto.formatOffset = function formatOffset$1(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /** @override **/
  ;

  _proto.offset = function offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }
  /** @override **/
  ;

  _proto.equals = function equals(otherZone) {
    return otherZone.type === "local";
  }
  /** @override **/
  ;

  _createClass(LocalZone, [{
    key: "type",

    /** @override **/
    get: function get() {
      return "local";
    }
    /** @override **/

  }, {
    key: "name",
    get: function get() {
      if (hasIntl()) {
        return new Intl.DateTimeFormat().resolvedOptions().timeZone;
      } else return "local";
    }
    /** @override **/

  }, {
    key: "universal",
    get: function get() {
      return false;
    }
  }, {
    key: "isValid",
    get: function get() {
      return true;
    }
  }], [{
    key: "instance",

    /**
     * Get a singleton instance of the local zone
     * @return {LocalZone}
     */
    get: function get() {
      if (singleton === null) {
        singleton = new LocalZone();
      }

      return singleton;
    }
  }]);

  return LocalZone;
}(Zone);

var matchingRegex = RegExp("^" + ianaRegex.source + "$");
var dtfCache = {};

function makeDTF(zone) {
  if (!dtfCache[zone]) {
    dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  return dtfCache[zone];
}

var typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};

function hackyOffset(dtf, date) {
  var formatted = dtf.format(date).replace(/\u200E/g, ""),
      parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted),
      fMonth = parsed[1],
      fDay = parsed[2],
      fYear = parsed[3],
      fHour = parsed[4],
      fMinute = parsed[5],
      fSecond = parsed[6];
  return [fYear, fMonth, fDay, fHour, fMinute, fSecond];
}

function partsOffset(dtf, date) {
  var formatted = dtf.formatToParts(date),
      filled = [];

  for (var i = 0; i < formatted.length; i++) {
    var _formatted$i = formatted[i],
        type = _formatted$i.type,
        value = _formatted$i.value,
        pos = typeToPos[type];

    if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }

  return filled;
}

var ianaZoneCache = {};
/**
 * A zone identified by an IANA identifier, like America/New_York
 * @implements {Zone}
 */

var IANAZone = /*#__PURE__*/function (_Zone) {
  _inheritsLoose(IANAZone, _Zone);

  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  IANAZone.create = function create(name) {
    if (!ianaZoneCache[name]) {
      ianaZoneCache[name] = new IANAZone(name);
    }

    return ianaZoneCache[name];
  }
  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  ;

  IANAZone.resetCache = function resetCache() {
    ianaZoneCache = {};
    dtfCache = {};
  }
  /**
   * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
   * @param {string} s - The string to check validity on
   * @example IANAZone.isValidSpecifier("America/New_York") //=> true
   * @example IANAZone.isValidSpecifier("Fantasia/Castle") //=> true
   * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
   * @return {boolean}
   */
  ;

  IANAZone.isValidSpecifier = function isValidSpecifier(s) {
    return !!(s && s.match(matchingRegex));
  }
  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  ;

  IANAZone.isValidZone = function isValidZone(zone) {
    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: zone
      }).format();
      return true;
    } catch (e) {
      return false;
    }
  } // Etc/GMT+8 -> -480

  /** @ignore */
  ;

  IANAZone.parseGMTOffset = function parseGMTOffset(specifier) {
    if (specifier) {
      var match = specifier.match(/^Etc\/GMT([+-]\d{1,2})$/i);

      if (match) {
        return -60 * parseInt(match[1]);
      }
    }

    return null;
  };

  function IANAZone(name) {
    var _this;

    _this = _Zone.call(this) || this;
    /** @private **/

    _this.zoneName = name;
    /** @private **/

    _this.valid = IANAZone.isValidZone(name);
    return _this;
  }
  /** @override **/


  var _proto = IANAZone.prototype;

  /** @override **/
  _proto.offsetName = function offsetName(ts, _ref) {
    var format = _ref.format,
        locale = _ref.locale;
    return parseZoneInfo(ts, format, locale, this.name);
  }
  /** @override **/
  ;

  _proto.formatOffset = function formatOffset$1(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /** @override **/
  ;

  _proto.offset = function offset(ts) {
    var date = new Date(ts),
        dtf = makeDTF(this.name),
        _ref2 = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date),
        year = _ref2[0],
        month = _ref2[1],
        day = _ref2[2],
        hour = _ref2[3],
        minute = _ref2[4],
        second = _ref2[5],
        adjustedHour = hour === 24 ? 0 : hour;

    var asUTC = objToLocalTS({
      year: year,
      month: month,
      day: day,
      hour: adjustedHour,
      minute: minute,
      second: second,
      millisecond: 0
    });
    var asTS = +date;
    var over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  }
  /** @override **/
  ;

  _proto.equals = function equals(otherZone) {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }
  /** @override **/
  ;

  _createClass(IANAZone, [{
    key: "type",
    get: function get() {
      return "iana";
    }
    /** @override **/

  }, {
    key: "name",
    get: function get() {
      return this.zoneName;
    }
    /** @override **/

  }, {
    key: "universal",
    get: function get() {
      return false;
    }
  }, {
    key: "isValid",
    get: function get() {
      return this.valid;
    }
  }]);

  return IANAZone;
}(Zone);

var singleton$1 = null;
/**
 * A zone with a fixed offset (meaning no DST)
 * @implements {Zone}
 */

var FixedOffsetZone = /*#__PURE__*/function (_Zone) {
  _inheritsLoose(FixedOffsetZone, _Zone);

  /**
   * Get an instance with a specified offset
   * @param {number} offset - The offset in minutes
   * @return {FixedOffsetZone}
   */
  FixedOffsetZone.instance = function instance(offset) {
    return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
  }
  /**
   * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
   * @param {string} s - The offset string to parse
   * @example FixedOffsetZone.parseSpecifier("UTC+6")
   * @example FixedOffsetZone.parseSpecifier("UTC+06")
   * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
   * @return {FixedOffsetZone}
   */
  ;

  FixedOffsetZone.parseSpecifier = function parseSpecifier(s) {
    if (s) {
      var r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);

      if (r) {
        return new FixedOffsetZone(signedOffset(r[1], r[2]));
      }
    }

    return null;
  };

  _createClass(FixedOffsetZone, null, [{
    key: "utcInstance",

    /**
     * Get a singleton instance of UTC
     * @return {FixedOffsetZone}
     */
    get: function get() {
      if (singleton$1 === null) {
        singleton$1 = new FixedOffsetZone(0);
      }

      return singleton$1;
    }
  }]);

  function FixedOffsetZone(offset) {
    var _this;

    _this = _Zone.call(this) || this;
    /** @private **/

    _this.fixed = offset;
    return _this;
  }
  /** @override **/


  var _proto = FixedOffsetZone.prototype;

  /** @override **/
  _proto.offsetName = function offsetName() {
    return this.name;
  }
  /** @override **/
  ;

  _proto.formatOffset = function formatOffset$1(ts, format) {
    return formatOffset(this.fixed, format);
  }
  /** @override **/
  ;

  /** @override **/
  _proto.offset = function offset() {
    return this.fixed;
  }
  /** @override **/
  ;

  _proto.equals = function equals(otherZone) {
    return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
  }
  /** @override **/
  ;

  _createClass(FixedOffsetZone, [{
    key: "type",
    get: function get() {
      return "fixed";
    }
    /** @override **/

  }, {
    key: "name",
    get: function get() {
      return this.fixed === 0 ? "UTC" : "UTC" + formatOffset(this.fixed, "narrow");
    }
  }, {
    key: "universal",
    get: function get() {
      return true;
    }
  }, {
    key: "isValid",
    get: function get() {
      return true;
    }
  }]);

  return FixedOffsetZone;
}(Zone);

/**
 * A zone that failed to parse. You should never need to instantiate this.
 * @implements {Zone}
 */

var InvalidZone = /*#__PURE__*/function (_Zone) {
  _inheritsLoose(InvalidZone, _Zone);

  function InvalidZone(zoneName) {
    var _this;

    _this = _Zone.call(this) || this;
    /**  @private */

    _this.zoneName = zoneName;
    return _this;
  }
  /** @override **/


  var _proto = InvalidZone.prototype;

  /** @override **/
  _proto.offsetName = function offsetName() {
    return null;
  }
  /** @override **/
  ;

  _proto.formatOffset = function formatOffset() {
    return "";
  }
  /** @override **/
  ;

  _proto.offset = function offset() {
    return NaN;
  }
  /** @override **/
  ;

  _proto.equals = function equals() {
    return false;
  }
  /** @override **/
  ;

  _createClass(InvalidZone, [{
    key: "type",
    get: function get() {
      return "invalid";
    }
    /** @override **/

  }, {
    key: "name",
    get: function get() {
      return this.zoneName;
    }
    /** @override **/

  }, {
    key: "universal",
    get: function get() {
      return false;
    }
  }, {
    key: "isValid",
    get: function get() {
      return false;
    }
  }]);

  return InvalidZone;
}(Zone);

/**
 * @private
 */
function normalizeZone(input, defaultZone) {
  var offset;

  if (isUndefined(input) || input === null) {
    return defaultZone;
  } else if (input instanceof Zone) {
    return input;
  } else if (isString(input)) {
    var lowered = input.toLowerCase();
    if (lowered === "local") return defaultZone;else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;else if ((offset = IANAZone.parseGMTOffset(input)) != null) {
      // handle Etc/GMT-4, which V8 chokes on
      return FixedOffsetZone.instance(offset);
    } else if (IANAZone.isValidSpecifier(lowered)) return IANAZone.create(input);else return FixedOffsetZone.parseSpecifier(lowered) || new InvalidZone(input);
  } else if (isNumber(input)) {
    return FixedOffsetZone.instance(input);
  } else if (typeof input === "object" && input.offset && typeof input.offset === "number") {
    // This is dumb, but the instanceof check above doesn't seem to really work
    // so we're duck checking it
    return input;
  } else {
    return new InvalidZone(input);
  }
}

var now = function now() {
  return Date.now();
},
    defaultZone = null,
    // not setting this directly to LocalZone.instance bc loading order issues
defaultLocale = null,
    defaultNumberingSystem = null,
    defaultOutputCalendar = null,
    throwOnInvalid = false;
/**
 * Settings contains static getters and setters that control Luxon's overall behavior. Luxon is a simple library with few options, but the ones it does have live here.
 */


var Settings = /*#__PURE__*/function () {
  function Settings() {}

  /**
   * Reset Luxon's global caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  Settings.resetCaches = function resetCaches() {
    Locale.resetCache();
    IANAZone.resetCache();
  };

  _createClass(Settings, null, [{
    key: "now",

    /**
     * Get the callback for returning the current timestamp.
     * @type {function}
     */
    get: function get() {
      return now;
    }
    /**
     * Set the callback for returning the current timestamp.
     * The function should return a number, which will be interpreted as an Epoch millisecond count
     * @type {function}
     * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
     * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
     */
    ,
    set: function set(n) {
      now = n;
    }
    /**
     * Get the default time zone to create DateTimes in.
     * @type {string}
     */

  }, {
    key: "defaultZoneName",
    get: function get() {
      return Settings.defaultZone.name;
    }
    /**
     * Set the default time zone to create DateTimes in. Does not affect existing instances.
     * @type {string}
     */
    ,
    set: function set(z) {
      if (!z) {
        defaultZone = null;
      } else {
        defaultZone = normalizeZone(z);
      }
    }
    /**
     * Get the default time zone object to create DateTimes in. Does not affect existing instances.
     * @type {Zone}
     */

  }, {
    key: "defaultZone",
    get: function get() {
      return defaultZone || LocalZone.instance;
    }
    /**
     * Get the default locale to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */

  }, {
    key: "defaultLocale",
    get: function get() {
      return defaultLocale;
    }
    /**
     * Set the default locale to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    ,
    set: function set(locale) {
      defaultLocale = locale;
    }
    /**
     * Get the default numbering system to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */

  }, {
    key: "defaultNumberingSystem",
    get: function get() {
      return defaultNumberingSystem;
    }
    /**
     * Set the default numbering system to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    ,
    set: function set(numberingSystem) {
      defaultNumberingSystem = numberingSystem;
    }
    /**
     * Get the default output calendar to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */

  }, {
    key: "defaultOutputCalendar",
    get: function get() {
      return defaultOutputCalendar;
    }
    /**
     * Set the default output calendar to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    ,
    set: function set(outputCalendar) {
      defaultOutputCalendar = outputCalendar;
    }
    /**
     * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
     * @type {boolean}
     */

  }, {
    key: "throwOnInvalid",
    get: function get() {
      return throwOnInvalid;
    }
    /**
     * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
     * @type {boolean}
     */
    ,
    set: function set(t) {
      throwOnInvalid = t;
    }
  }]);

  return Settings;
}();

var intlDTCache = {};

function getCachedDTF(locString, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var key = JSON.stringify([locString, opts]);
  var dtf = intlDTCache[key];

  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }

  return dtf;
}

var intlNumCache = {};

function getCachedINF(locString, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var key = JSON.stringify([locString, opts]);
  var inf = intlNumCache[key];

  if (!inf) {
    inf = new Intl.NumberFormat(locString, opts);
    intlNumCache[key] = inf;
  }

  return inf;
}

var intlRelCache = {};

function getCachedRTF(locString, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var _opts = opts,
      base = _opts.base,
      cacheKeyOpts = _objectWithoutPropertiesLoose(_opts, ["base"]); // exclude `base` from the options


  var key = JSON.stringify([locString, cacheKeyOpts]);
  var inf = intlRelCache[key];

  if (!inf) {
    inf = new Intl.RelativeTimeFormat(locString, opts);
    intlRelCache[key] = inf;
  }

  return inf;
}

var sysLocaleCache = null;

function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else if (hasIntl()) {
    var computedSys = new Intl.DateTimeFormat().resolvedOptions().locale; // node sometimes defaults to "und". Override that because that is dumb

    sysLocaleCache = !computedSys || computedSys === "und" ? "en-US" : computedSys;
    return sysLocaleCache;
  } else {
    sysLocaleCache = "en-US";
    return sysLocaleCache;
  }
}

function parseLocaleString(localeStr) {
  // I really want to avoid writing a BCP 47 parser
  // see, e.g. https://github.com/wooorm/bcp-47
  // Instead, we'll do this:
  // a) if the string has no -u extensions, just leave it alone
  // b) if it does, use Intl to resolve everything
  // c) if Intl fails, try again without the -u
  var uIndex = localeStr.indexOf("-u-");

  if (uIndex === -1) {
    return [localeStr];
  } else {
    var options;
    var smaller = localeStr.substring(0, uIndex);

    try {
      options = getCachedDTF(localeStr).resolvedOptions();
    } catch (e) {
      options = getCachedDTF(smaller).resolvedOptions();
    }

    var _options = options,
        numberingSystem = _options.numberingSystem,
        calendar = _options.calendar; // return the smaller one so that we can append the calendar and numbering overrides to it

    return [smaller, numberingSystem, calendar];
  }
}

function intlConfigString(localeStr, numberingSystem, outputCalendar) {
  if (hasIntl()) {
    if (outputCalendar || numberingSystem) {
      localeStr += "-u";

      if (outputCalendar) {
        localeStr += "-ca-" + outputCalendar;
      }

      if (numberingSystem) {
        localeStr += "-nu-" + numberingSystem;
      }

      return localeStr;
    } else {
      return localeStr;
    }
  } else {
    return [];
  }
}

function mapMonths(f) {
  var ms = [];

  for (var i = 1; i <= 12; i++) {
    var dt = DateTime.utc(2016, i, 1);
    ms.push(f(dt));
  }

  return ms;
}

function mapWeekdays(f) {
  var ms = [];

  for (var i = 1; i <= 7; i++) {
    var dt = DateTime.utc(2016, 11, 13 + i);
    ms.push(f(dt));
  }

  return ms;
}

function listStuff(loc, length, defaultOK, englishFn, intlFn) {
  var mode = loc.listingMode(defaultOK);

  if (mode === "error") {
    return null;
  } else if (mode === "en") {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}

function supportsFastNumbers(loc) {
  if (loc.numberingSystem && loc.numberingSystem !== "latn") {
    return false;
  } else {
    return loc.numberingSystem === "latn" || !loc.locale || loc.locale.startsWith("en") || hasIntl() && new Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem === "latn";
  }
}
/**
 * @private
 */


var PolyNumberFormatter = /*#__PURE__*/function () {
  function PolyNumberFormatter(intl, forceSimple, opts) {
    this.padTo = opts.padTo || 0;
    this.floor = opts.floor || false;

    if (!forceSimple && hasIntl()) {
      var intlOpts = {
        useGrouping: false
      };
      if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
      this.inf = getCachedINF(intl, intlOpts);
    }
  }

  var _proto = PolyNumberFormatter.prototype;

  _proto.format = function format(i) {
    if (this.inf) {
      var fixed = this.floor ? Math.floor(i) : i;
      return this.inf.format(fixed);
    } else {
      // to match the browser's numberformatter defaults
      var _fixed = this.floor ? Math.floor(i) : roundTo(i, 3);

      return padStart(_fixed, this.padTo);
    }
  };

  return PolyNumberFormatter;
}();
/**
 * @private
 */


var PolyDateFormatter = /*#__PURE__*/function () {
  function PolyDateFormatter(dt, intl, opts) {
    this.opts = opts;
    this.hasIntl = hasIntl();
    var z;

    if (dt.zone.universal && this.hasIntl) {
      // Chromium doesn't support fixed-offset zones like Etc/GMT+8 in its formatter,
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=364374.
      // So we have to make do. Two cases:
      // 1. The format options tell us to show the zone. We can't do that, so the best
      // we can do is format the date in UTC.
      // 2. The format options don't tell us to show the zone. Then we can adjust them
      // the time and tell the formatter to show it to us in UTC, so that the time is right
      // and the bad zone doesn't show up.
      // We can clean all this up when Chrome fixes this.
      z = "UTC";

      if (opts.timeZoneName) {
        this.dt = dt;
      } else {
        this.dt = dt.offset === 0 ? dt : DateTime.fromMillis(dt.ts + dt.offset * 60 * 1000);
      }
    } else if (dt.zone.type === "local") {
      this.dt = dt;
    } else {
      this.dt = dt;
      z = dt.zone.name;
    }

    if (this.hasIntl) {
      var intlOpts = Object.assign({}, this.opts);

      if (z) {
        intlOpts.timeZone = z;
      }

      this.dtf = getCachedDTF(intl, intlOpts);
    }
  }

  var _proto2 = PolyDateFormatter.prototype;

  _proto2.format = function format() {
    if (this.hasIntl) {
      return this.dtf.format(this.dt.toJSDate());
    } else {
      var tokenFormat = formatString(this.opts),
          loc = Locale.create("en-US");
      return Formatter.create(loc).formatDateTimeFromString(this.dt, tokenFormat);
    }
  };

  _proto2.formatToParts = function formatToParts() {
    if (this.hasIntl && hasFormatToParts()) {
      return this.dtf.formatToParts(this.dt.toJSDate());
    } else {
      // This is kind of a cop out. We actually could do this for English. However, we couldn't do it for intl strings
      // and IMO it's too weird to have an uncanny valley like that
      return [];
    }
  };

  _proto2.resolvedOptions = function resolvedOptions() {
    if (this.hasIntl) {
      return this.dtf.resolvedOptions();
    } else {
      return {
        locale: "en-US",
        numberingSystem: "latn",
        outputCalendar: "gregory"
      };
    }
  };

  return PolyDateFormatter;
}();
/**
 * @private
 */


var PolyRelFormatter = /*#__PURE__*/function () {
  function PolyRelFormatter(intl, isEnglish, opts) {
    this.opts = Object.assign({
      style: "long"
    }, opts);

    if (!isEnglish && hasRelative()) {
      this.rtf = getCachedRTF(intl, opts);
    }
  }

  var _proto3 = PolyRelFormatter.prototype;

  _proto3.format = function format(count, unit) {
    if (this.rtf) {
      return this.rtf.format(count, unit);
    } else {
      return formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
    }
  };

  _proto3.formatToParts = function formatToParts(count, unit) {
    if (this.rtf) {
      return this.rtf.formatToParts(count, unit);
    } else {
      return [];
    }
  };

  return PolyRelFormatter;
}();
/**
 * @private
 */


var Locale = /*#__PURE__*/function () {
  Locale.fromOpts = function fromOpts(opts) {
    return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.defaultToEN);
  };

  Locale.create = function create(locale, numberingSystem, outputCalendar, defaultToEN) {
    if (defaultToEN === void 0) {
      defaultToEN = false;
    }

    var specifiedLocale = locale || Settings.defaultLocale,
        // the system locale is useful for human readable strings but annoying for parsing/formatting known formats
    localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale()),
        numberingSystemR = numberingSystem || Settings.defaultNumberingSystem,
        outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    return new Locale(localeR, numberingSystemR, outputCalendarR, specifiedLocale);
  };

  Locale.resetCache = function resetCache() {
    sysLocaleCache = null;
    intlDTCache = {};
    intlNumCache = {};
    intlRelCache = {};
  };

  Locale.fromObject = function fromObject(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        locale = _ref.locale,
        numberingSystem = _ref.numberingSystem,
        outputCalendar = _ref.outputCalendar;

    return Locale.create(locale, numberingSystem, outputCalendar);
  };

  function Locale(locale, numbering, outputCalendar, specifiedLocale) {
    var _parseLocaleString = parseLocaleString(locale),
        parsedLocale = _parseLocaleString[0],
        parsedNumberingSystem = _parseLocaleString[1],
        parsedOutputCalendar = _parseLocaleString[2];

    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
    this.weekdaysCache = {
      format: {},
      standalone: {}
    };
    this.monthsCache = {
      format: {},
      standalone: {}
    };
    this.meridiemCache = null;
    this.eraCache = {};
    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }

  var _proto4 = Locale.prototype;

  _proto4.listingMode = function listingMode(defaultOK) {
    if (defaultOK === void 0) {
      defaultOK = true;
    }

    var intl = hasIntl(),
        hasFTP = intl && hasFormatToParts(),
        isActuallyEn = this.isEnglish(),
        hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");

    if (!hasFTP && !(isActuallyEn && hasNoWeirdness) && !defaultOK) {
      return "error";
    } else if (!hasFTP || isActuallyEn && hasNoWeirdness) {
      return "en";
    } else {
      return "intl";
    }
  };

  _proto4.clone = function clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(alts.locale || this.specifiedLocale, alts.numberingSystem || this.numberingSystem, alts.outputCalendar || this.outputCalendar, alts.defaultToEN || false);
    }
  };

  _proto4.redefaultToEN = function redefaultToEN(alts) {
    if (alts === void 0) {
      alts = {};
    }

    return this.clone(Object.assign({}, alts, {
      defaultToEN: true
    }));
  };

  _proto4.redefaultToSystem = function redefaultToSystem(alts) {
    if (alts === void 0) {
      alts = {};
    }

    return this.clone(Object.assign({}, alts, {
      defaultToEN: false
    }));
  };

  _proto4.months = function months$1(length, format, defaultOK) {
    var _this = this;

    if (format === void 0) {
      format = false;
    }

    if (defaultOK === void 0) {
      defaultOK = true;
    }

    return listStuff(this, length, defaultOK, months, function () {
      var intl = format ? {
        month: length,
        day: "numeric"
      } : {
        month: length
      },
          formatStr = format ? "format" : "standalone";

      if (!_this.monthsCache[formatStr][length]) {
        _this.monthsCache[formatStr][length] = mapMonths(function (dt) {
          return _this.extract(dt, intl, "month");
        });
      }

      return _this.monthsCache[formatStr][length];
    });
  };

  _proto4.weekdays = function weekdays$1(length, format, defaultOK) {
    var _this2 = this;

    if (format === void 0) {
      format = false;
    }

    if (defaultOK === void 0) {
      defaultOK = true;
    }

    return listStuff(this, length, defaultOK, weekdays, function () {
      var intl = format ? {
        weekday: length,
        year: "numeric",
        month: "long",
        day: "numeric"
      } : {
        weekday: length
      },
          formatStr = format ? "format" : "standalone";

      if (!_this2.weekdaysCache[formatStr][length]) {
        _this2.weekdaysCache[formatStr][length] = mapWeekdays(function (dt) {
          return _this2.extract(dt, intl, "weekday");
        });
      }

      return _this2.weekdaysCache[formatStr][length];
    });
  };

  _proto4.meridiems = function meridiems$1(defaultOK) {
    var _this3 = this;

    if (defaultOK === void 0) {
      defaultOK = true;
    }

    return listStuff(this, undefined, defaultOK, function () {
      return meridiems;
    }, function () {
      // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
      // for AM and PM. This is probably wrong, but it's makes parsing way easier.
      if (!_this3.meridiemCache) {
        var intl = {
          hour: "numeric",
          hour12: true
        };
        _this3.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(function (dt) {
          return _this3.extract(dt, intl, "dayperiod");
        });
      }

      return _this3.meridiemCache;
    });
  };

  _proto4.eras = function eras$1(length, defaultOK) {
    var _this4 = this;

    if (defaultOK === void 0) {
      defaultOK = true;
    }

    return listStuff(this, length, defaultOK, eras, function () {
      var intl = {
        era: length
      }; // This is utter bullshit. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
      // to definitely enumerate them.

      if (!_this4.eraCache[length]) {
        _this4.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(function (dt) {
          return _this4.extract(dt, intl, "era");
        });
      }

      return _this4.eraCache[length];
    });
  };

  _proto4.extract = function extract(dt, intlOpts, field) {
    var df = this.dtFormatter(dt, intlOpts),
        results = df.formatToParts(),
        matching = results.find(function (m) {
      return m.type.toLowerCase() === field;
    });
    return matching ? matching.value : null;
  };

  _proto4.numberFormatter = function numberFormatter(opts) {
    if (opts === void 0) {
      opts = {};
    }

    // this forcesimple option is never used (the only caller short-circuits on it, but it seems safer to leave)
    // (in contrast, the rest of the condition is used heavily)
    return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
  };

  _proto4.dtFormatter = function dtFormatter(dt, intlOpts) {
    if (intlOpts === void 0) {
      intlOpts = {};
    }

    return new PolyDateFormatter(dt, this.intl, intlOpts);
  };

  _proto4.relFormatter = function relFormatter(opts) {
    if (opts === void 0) {
      opts = {};
    }

    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  };

  _proto4.isEnglish = function isEnglish() {
    return this.locale === "en" || this.locale.toLowerCase() === "en-us" || hasIntl() && new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us");
  };

  _proto4.equals = function equals(other) {
    return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
  };

  _createClass(Locale, [{
    key: "fastNumbers",
    get: function get() {
      if (this.fastNumbersCached == null) {
        this.fastNumbersCached = supportsFastNumbers(this);
      }

      return this.fastNumbersCached;
    }
  }]);

  return Locale;
}();

/*
 * This file handles parsing for well-specified formats. Here's how it works:
 * Two things go into parsing: a regex to match with and an extractor to take apart the groups in the match.
 * An extractor is just a function that takes a regex match array and returns a { year: ..., month: ... } object
 * parse() does the work of executing the regex and applying the extractor. It takes multiple regex/extractor pairs to try in sequence.
 * Extractors can take a "cursor" representing the offset in the match to look at. This makes it easy to combine extractors.
 * combineExtractors() does the work of combining them, keeping track of the cursor through multiple extractions.
 * Some extractions are super dumb and simpleParse and fromStrings help DRY them.
 */

function combineRegexes() {
  for (var _len = arguments.length, regexes = new Array(_len), _key = 0; _key < _len; _key++) {
    regexes[_key] = arguments[_key];
  }

  var full = regexes.reduce(function (f, r) {
    return f + r.source;
  }, "");
  return RegExp("^" + full + "$");
}

function combineExtractors() {
  for (var _len2 = arguments.length, extractors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    extractors[_key2] = arguments[_key2];
  }

  return function (m) {
    return extractors.reduce(function (_ref, ex) {
      var mergedVals = _ref[0],
          mergedZone = _ref[1],
          cursor = _ref[2];

      var _ex = ex(m, cursor),
          val = _ex[0],
          zone = _ex[1],
          next = _ex[2];

      return [Object.assign(mergedVals, val), mergedZone || zone, next];
    }, [{}, null, 1]).slice(0, 2);
  };
}

function parse(s) {
  if (s == null) {
    return [null, null];
  }

  for (var _len3 = arguments.length, patterns = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    patterns[_key3 - 1] = arguments[_key3];
  }

  for (var _i = 0, _patterns = patterns; _i < _patterns.length; _i++) {
    var _patterns$_i = _patterns[_i],
        regex = _patterns$_i[0],
        extractor = _patterns$_i[1];
    var m = regex.exec(s);

    if (m) {
      return extractor(m);
    }
  }

  return [null, null];
}

function simpleParse() {
  for (var _len4 = arguments.length, keys = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    keys[_key4] = arguments[_key4];
  }

  return function (match, cursor) {
    var ret = {};
    var i;

    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = parseInteger(match[cursor + i]);
    }

    return [ret, null, cursor + i];
  };
} // ISO and SQL parsing


var offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/,
    isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/,
    isoTimeRegex = RegExp("" + isoTimeBaseRegex.source + offsetRegex.source + "?"),
    isoTimeExtensionRegex = RegExp("(?:T" + isoTimeRegex.source + ")?"),
    isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/,
    isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/,
    isoOrdinalRegex = /(\d{4})-?(\d{3})/,
    extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay"),
    extractISOOrdinalData = simpleParse("year", "ordinal"),
    sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/,
    // dumbed-down version of the ISO one
sqlTimeRegex = RegExp(isoTimeBaseRegex.source + " ?(?:" + offsetRegex.source + "|(" + ianaRegex.source + "))?"),
    sqlTimeExtensionRegex = RegExp("(?: " + sqlTimeRegex.source + ")?");

function int(match, pos, fallback) {
  var m = match[pos];
  return isUndefined(m) ? fallback : parseInteger(m);
}

function extractISOYmd(match, cursor) {
  var item = {
    year: int(match, cursor),
    month: int(match, cursor + 1, 1),
    day: int(match, cursor + 2, 1)
  };
  return [item, null, cursor + 3];
}

function extractISOTime(match, cursor) {
  var item = {
    hour: int(match, cursor, 0),
    minute: int(match, cursor + 1, 0),
    second: int(match, cursor + 2, 0),
    millisecond: parseMillis(match[cursor + 3])
  };
  return [item, null, cursor + 4];
}

function extractISOOffset(match, cursor) {
  var local = !match[cursor] && !match[cursor + 1],
      fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]),
      zone = local ? null : FixedOffsetZone.instance(fullOffset);
  return [{}, zone, cursor + 3];
}

function extractIANAZone(match, cursor) {
  var zone = match[cursor] ? IANAZone.create(match[cursor]) : null;
  return [{}, zone, cursor + 1];
} // ISO duration parsing


var isoDuration = /^-?P(?:(?:(-?\d{1,9})Y)?(?:(-?\d{1,9})M)?(?:(-?\d{1,9})W)?(?:(-?\d{1,9})D)?(?:T(?:(-?\d{1,9})H)?(?:(-?\d{1,9})M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,9}))?S)?)?)$/;

function extractISODuration(match) {
  var s = match[0],
      yearStr = match[1],
      monthStr = match[2],
      weekStr = match[3],
      dayStr = match[4],
      hourStr = match[5],
      minuteStr = match[6],
      secondStr = match[7],
      millisecondsStr = match[8];
  var hasNegativePrefix = s[0] === "-";

  var maybeNegate = function maybeNegate(num) {
    return num && hasNegativePrefix ? -num : num;
  };

  return [{
    years: maybeNegate(parseInteger(yearStr)),
    months: maybeNegate(parseInteger(monthStr)),
    weeks: maybeNegate(parseInteger(weekStr)),
    days: maybeNegate(parseInteger(dayStr)),
    hours: maybeNegate(parseInteger(hourStr)),
    minutes: maybeNegate(parseInteger(minuteStr)),
    seconds: maybeNegate(parseInteger(secondStr)),
    milliseconds: maybeNegate(parseMillis(millisecondsStr))
  }];
} // These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
// and not just that we're in -240 *right now*. But since I don't think these are used that often
// I'm just going to ignore that


var obsOffsets = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};

function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
  var result = {
    year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
    month: monthsShort.indexOf(monthStr) + 1,
    day: parseInteger(dayStr),
    hour: parseInteger(hourStr),
    minute: parseInteger(minuteStr)
  };
  if (secondStr) result.second = parseInteger(secondStr);

  if (weekdayStr) {
    result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
  }

  return result;
} // RFC 2822/5322


var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;

function extractRFC2822(match) {
  var weekdayStr = match[1],
      dayStr = match[2],
      monthStr = match[3],
      yearStr = match[4],
      hourStr = match[5],
      minuteStr = match[6],
      secondStr = match[7],
      obsOffset = match[8],
      milOffset = match[9],
      offHourStr = match[10],
      offMinuteStr = match[11],
      result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  var offset;

  if (obsOffset) {
    offset = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset = 0;
  } else {
    offset = signedOffset(offHourStr, offMinuteStr);
  }

  return [result, new FixedOffsetZone(offset)];
}

function preprocessRFC2822(s) {
  // Remove comments and folding whitespace and replace multiple-spaces with a single space
  return s.replace(/\([^)]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
} // http date


var rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,
    rfc850 = /^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,
    ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

function extractRFC1123Or850(match) {
  var weekdayStr = match[1],
      dayStr = match[2],
      monthStr = match[3],
      yearStr = match[4],
      hourStr = match[5],
      minuteStr = match[6],
      secondStr = match[7],
      result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}

function extractASCII(match) {
  var weekdayStr = match[1],
      monthStr = match[2],
      dayStr = match[3],
      hourStr = match[4],
      minuteStr = match[5],
      secondStr = match[6],
      yearStr = match[7],
      result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}

var isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
var isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
var isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
var isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
var extractISOYmdTimeAndOffset = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset);
var extractISOWeekTimeAndOffset = combineExtractors(extractISOWeekData, extractISOTime, extractISOOffset);
var extractISOOrdinalDataAndTime = combineExtractors(extractISOOrdinalData, extractISOTime);
var extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset);
/**
 * @private
 */

function parseISODate(s) {
  return parse(s, [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset], [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDataAndTime], [isoTimeCombinedRegex, extractISOTimeAndOffset]);
}
function parseRFC2822Date(s) {
  return parse(preprocessRFC2822(s), [rfc2822, extractRFC2822]);
}
function parseHTTPDate(s) {
  return parse(s, [rfc1123, extractRFC1123Or850], [rfc850, extractRFC1123Or850], [ascii, extractASCII]);
}
function parseISODuration(s) {
  return parse(s, [isoDuration, extractISODuration]);
}
var sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
var sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
var extractISOYmdTimeOffsetAndIANAZone = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset, extractIANAZone);
var extractISOTimeOffsetAndIANAZone = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
function parseSQL(s) {
  return parse(s, [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeOffsetAndIANAZone], [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]);
}

var INVALID = "Invalid Duration"; // unit conversion constants

var lowOrderMatrix = {
  weeks: {
    days: 7,
    hours: 7 * 24,
    minutes: 7 * 24 * 60,
    seconds: 7 * 24 * 60 * 60,
    milliseconds: 7 * 24 * 60 * 60 * 1000
  },
  days: {
    hours: 24,
    minutes: 24 * 60,
    seconds: 24 * 60 * 60,
    milliseconds: 24 * 60 * 60 * 1000
  },
  hours: {
    minutes: 60,
    seconds: 60 * 60,
    milliseconds: 60 * 60 * 1000
  },
  minutes: {
    seconds: 60,
    milliseconds: 60 * 1000
  },
  seconds: {
    milliseconds: 1000
  }
},
    casualMatrix = Object.assign({
  years: {
    quarters: 4,
    months: 12,
    weeks: 52,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1000
  },
  quarters: {
    months: 3,
    weeks: 13,
    days: 91,
    hours: 91 * 24,
    minutes: 91 * 24 * 60,
    seconds: 91 * 24 * 60 * 60,
    milliseconds: 91 * 24 * 60 * 60 * 1000
  },
  months: {
    weeks: 4,
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1000
  }
}, lowOrderMatrix),
    daysInYearAccurate = 146097.0 / 400,
    daysInMonthAccurate = 146097.0 / 4800,
    accurateMatrix = Object.assign({
  years: {
    quarters: 4,
    months: 12,
    weeks: daysInYearAccurate / 7,
    days: daysInYearAccurate,
    hours: daysInYearAccurate * 24,
    minutes: daysInYearAccurate * 24 * 60,
    seconds: daysInYearAccurate * 24 * 60 * 60,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000
  },
  quarters: {
    months: 3,
    weeks: daysInYearAccurate / 28,
    days: daysInYearAccurate / 4,
    hours: daysInYearAccurate * 24 / 4,
    minutes: daysInYearAccurate * 24 * 60 / 4,
    seconds: daysInYearAccurate * 24 * 60 * 60 / 4,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000 / 4
  },
  months: {
    weeks: daysInMonthAccurate / 7,
    days: daysInMonthAccurate,
    hours: daysInMonthAccurate * 24,
    minutes: daysInMonthAccurate * 24 * 60,
    seconds: daysInMonthAccurate * 24 * 60 * 60,
    milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000
  }
}, lowOrderMatrix); // units ordered by size

var orderedUnits = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
var reverseUnits = orderedUnits.slice(0).reverse(); // clone really means "create another instance just like this one, but with these changes"

function clone(dur, alts, clear) {
  if (clear === void 0) {
    clear = false;
  }

  // deep merge for vals
  var conf = {
    values: clear ? alts.values : Object.assign({}, dur.values, alts.values || {}),
    loc: dur.loc.clone(alts.loc),
    conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy
  };
  return new Duration(conf);
}

function antiTrunc(n) {
  return n < 0 ? Math.floor(n) : Math.ceil(n);
} // NB: mutates parameters


function convert(matrix, fromMap, fromUnit, toMap, toUnit) {
  var conv = matrix[toUnit][fromUnit],
      raw = fromMap[fromUnit] / conv,
      sameSign = Math.sign(raw) === Math.sign(toMap[toUnit]),
      // ok, so this is wild, but see the matrix in the tests
  added = !sameSign && toMap[toUnit] !== 0 && Math.abs(raw) <= 1 ? antiTrunc(raw) : Math.trunc(raw);
  toMap[toUnit] += added;
  fromMap[fromUnit] -= added * conv;
} // NB: mutates parameters


function normalizeValues(matrix, vals) {
  reverseUnits.reduce(function (previous, current) {
    if (!isUndefined(vals[current])) {
      if (previous) {
        convert(matrix, vals, previous, vals, current);
      }

      return current;
    } else {
      return previous;
    }
  }, null);
}
/**
 * A Duration object represents a period of time, like "2 months" or "1 day, 1 hour". Conceptually, it's just a map of units to their quantities, accompanied by some additional configuration and methods for creating, parsing, interrogating, transforming, and formatting them. They can be used on their own or in conjunction with other Luxon types; for example, you can use {@link DateTime.plus} to add a Duration object to a DateTime, producing another DateTime.
 *
 * Here is a brief overview of commonly used methods and getters in Duration:
 *
 * * **Creation** To create a Duration, use {@link Duration.fromMillis}, {@link Duration.fromObject}, or {@link Duration.fromISO}.
 * * **Unit values** See the {@link Duration.years}, {@link Duration.months}, {@link Duration.weeks}, {@link Duration.days}, {@link Duration.hours}, {@link Duration.minutes}, {@link Duration.seconds}, {@link Duration.milliseconds} accessors.
 * * **Configuration** See  {@link Duration.locale} and {@link Duration.numberingSystem} accessors.
 * * **Transformation** To create new Durations out of old ones use {@link Duration.plus}, {@link Duration.minus}, {@link Duration.normalize}, {@link Duration.set}, {@link Duration.reconfigure}, {@link Duration.shiftTo}, and {@link Duration.negate}.
 * * **Output** To convert the Duration into other representations, see {@link Duration.as}, {@link Duration.toISO}, {@link Duration.toFormat}, and {@link Duration.toJSON}
 *
 * There's are more methods documented below. In addition, for more information on subtler topics like internationalization and validity, see the external documentation.
 */


var Duration = /*#__PURE__*/function () {
  /**
   * @private
   */
  function Duration(config) {
    var accurate = config.conversionAccuracy === "longterm" || false;
    /**
     * @access private
     */

    this.values = config.values;
    /**
     * @access private
     */

    this.loc = config.loc || Locale.create();
    /**
     * @access private
     */

    this.conversionAccuracy = accurate ? "longterm" : "casual";
    /**
     * @access private
     */

    this.invalid = config.invalid || null;
    /**
     * @access private
     */

    this.matrix = accurate ? accurateMatrix : casualMatrix;
    /**
     * @access private
     */

    this.isLuxonDuration = true;
  }
  /**
   * Create Duration from a number of milliseconds.
   * @param {number} count of milliseconds
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */


  Duration.fromMillis = function fromMillis(count, opts) {
    return Duration.fromObject(Object.assign({
      milliseconds: count
    }, opts));
  }
  /**
   * Create a Duration from a Javascript object with keys like 'years' and 'hours.
   * If this object is empty then a zero milliseconds duration is returned.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.years
   * @param {number} obj.quarters
   * @param {number} obj.months
   * @param {number} obj.weeks
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @param {string} [obj.locale='en-US'] - the locale to use
   * @param {string} obj.numberingSystem - the numbering system to use
   * @param {string} [obj.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  ;

  Duration.fromObject = function fromObject(obj) {
    if (obj == null || typeof obj !== "object") {
      throw new InvalidArgumentError("Duration.fromObject: argument expected to be an object, got " + (obj === null ? "null" : typeof obj));
    }

    return new Duration({
      values: normalizeObject(obj, Duration.normalizeUnit, ["locale", "numberingSystem", "conversionAccuracy", "zone" // a bit of debt; it's super inconvenient internally not to be able to blindly pass this
      ]),
      loc: Locale.fromObject(obj),
      conversionAccuracy: obj.conversionAccuracy
    });
  }
  /**
   * Create a Duration from an ISO 8601 duration string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
   * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
   * @return {Duration}
   */
  ;

  Duration.fromISO = function fromISO(text, opts) {
    var _parseISODuration = parseISODuration(text),
        parsed = _parseISODuration[0];

    if (parsed) {
      var obj = Object.assign(parsed, opts);
      return Duration.fromObject(obj);
    } else {
      return Duration.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
    }
  }
  /**
   * Create an invalid Duration.
   * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Duration}
   */
  ;

  Duration.invalid = function invalid(reason, explanation) {
    if (explanation === void 0) {
      explanation = null;
    }

    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
    }

    var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

    if (Settings.throwOnInvalid) {
      throw new InvalidDurationError(invalid);
    } else {
      return new Duration({
        invalid: invalid
      });
    }
  }
  /**
   * @private
   */
  ;

  Duration.normalizeUnit = function normalizeUnit(unit) {
    var normalized = {
      year: "years",
      years: "years",
      quarter: "quarters",
      quarters: "quarters",
      month: "months",
      months: "months",
      week: "weeks",
      weeks: "weeks",
      day: "days",
      days: "days",
      hour: "hours",
      hours: "hours",
      minute: "minutes",
      minutes: "minutes",
      second: "seconds",
      seconds: "seconds",
      millisecond: "milliseconds",
      milliseconds: "milliseconds"
    }[unit ? unit.toLowerCase() : unit];
    if (!normalized) throw new InvalidUnitError(unit);
    return normalized;
  }
  /**
   * Check if an object is a Duration. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  ;

  Duration.isDuration = function isDuration(o) {
    return o && o.isLuxonDuration || false;
  }
  /**
   * Get  the locale of a Duration, such 'en-GB'
   * @type {string}
   */
  ;

  var _proto = Duration.prototype;

  /**
   * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
   * * `S` for milliseconds
   * * `s` for seconds
   * * `m` for minutes
   * * `h` for hours
   * * `d` for days
   * * `M` for months
   * * `y` for years
   * Notes:
   * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
   * * The duration will be converted to the set of units in the format string using {@link Duration.shiftTo} and the Durations's conversion accuracy setting.
   * @param {string} fmt - the format string
   * @param {Object} opts - options
   * @param {boolean} [opts.floor=true] - floor numerical values
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
   * @return {string}
   */
  _proto.toFormat = function toFormat(fmt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    // reverse-compat since 1.2; we always round down now, never up, and we do it by default
    var fmtOpts = Object.assign({}, opts, {
      floor: opts.round !== false && opts.floor !== false
    });
    return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID;
  }
  /**
   * Returns a Javascript object with this Duration's values.
   * @param opts - options for generating the object
   * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {Object}
   */
  ;

  _proto.toObject = function toObject(opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid) return {};
    var base = Object.assign({}, this.values);

    if (opts.includeConfig) {
      base.conversionAccuracy = this.conversionAccuracy;
      base.numberingSystem = this.loc.numberingSystem;
      base.locale = this.loc.locale;
    }

    return base;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
   * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
   * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
   * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
   * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
   * @return {string}
   */
  ;

  _proto.toISO = function toISO() {
    // we could use the formatter, but this is an easier way to get the minimum string
    if (!this.isValid) return null;
    var s = "P";
    if (this.years !== 0) s += this.years + "Y";
    if (this.months !== 0 || this.quarters !== 0) s += this.months + this.quarters * 3 + "M";
    if (this.weeks !== 0) s += this.weeks + "W";
    if (this.days !== 0) s += this.days + "D";
    if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0) s += "T";
    if (this.hours !== 0) s += this.hours + "H";
    if (this.minutes !== 0) s += this.minutes + "M";
    if (this.seconds !== 0 || this.milliseconds !== 0) // this will handle "floating point madness" by removing extra decimal places
      // https://stackoverflow.com/questions/588004/is-floating-point-math-broken
      s += roundTo(this.seconds + this.milliseconds / 1000, 3) + "S";
    if (s === "P") s += "T0S";
    return s;
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
   * @return {string}
   */
  ;

  _proto.toJSON = function toJSON() {
    return this.toISO();
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
   * @return {string}
   */
  ;

  _proto.toString = function toString() {
    return this.toISO();
  }
  /**
   * Returns an milliseconds value of this Duration.
   * @return {number}
   */
  ;

  _proto.valueOf = function valueOf() {
    return this.as("milliseconds");
  }
  /**
   * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  ;

  _proto.plus = function plus(duration) {
    if (!this.isValid) return this;
    var dur = friendlyDuration(duration),
        result = {};

    for (var _iterator = _createForOfIteratorHelperLoose(orderedUnits), _step; !(_step = _iterator()).done;) {
      var k = _step.value;

      if (hasOwnProperty(dur.values, k) || hasOwnProperty(this.values, k)) {
        result[k] = dur.get(k) + this.get(k);
      }
    }

    return clone(this, {
      values: result
    }, true);
  }
  /**
   * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  ;

  _proto.minus = function minus(duration) {
    if (!this.isValid) return this;
    var dur = friendlyDuration(duration);
    return this.plus(dur.negate());
  }
  /**
   * Scale this Duration by the specified amount. Return a newly-constructed Duration.
   * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnit(x => x * 2) //=> { hours: 2, minutes: 60 }
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnit((x, u) => u === "hour" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
   * @return {Duration}
   */
  ;

  _proto.mapUnits = function mapUnits(fn) {
    if (!this.isValid) return this;
    var result = {};

    for (var _i = 0, _Object$keys = Object.keys(this.values); _i < _Object$keys.length; _i++) {
      var k = _Object$keys[_i];
      result[k] = asNumber(fn(this.values[k], k));
    }

    return clone(this, {
      values: result
    }, true);
  }
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).years //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).months //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).days //=> 3
   * @return {number}
   */
  ;

  _proto.get = function get(unit) {
    return this[Duration.normalizeUnit(unit)];
  }
  /**
   * "Set" the values of specified units. Return a newly-constructed Duration.
   * @param {Object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  ;

  _proto.set = function set(values) {
    if (!this.isValid) return this;
    var mixed = Object.assign(this.values, normalizeObject(values, Duration.normalizeUnit, []));
    return clone(this, {
      values: mixed
    });
  }
  /**
   * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
   * @example dur.reconfigure({ locale: 'en-GB' })
   * @return {Duration}
   */
  ;

  _proto.reconfigure = function reconfigure(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        locale = _ref.locale,
        numberingSystem = _ref.numberingSystem,
        conversionAccuracy = _ref.conversionAccuracy;

    var loc = this.loc.clone({
      locale: locale,
      numberingSystem: numberingSystem
    }),
        opts = {
      loc: loc
    };

    if (conversionAccuracy) {
      opts.conversionAccuracy = conversionAccuracy;
    }

    return clone(this, opts);
  }
  /**
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  ;

  _proto.as = function as(unit) {
    return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
  }
  /**
   * Reduce this Duration to its canonical representation in its current units.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @return {Duration}
   */
  ;

  _proto.normalize = function normalize() {
    if (!this.isValid) return this;
    var vals = this.toObject();
    normalizeValues(this.matrix, vals);
    return clone(this, {
      values: vals
    }, true);
  }
  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  ;

  _proto.shiftTo = function shiftTo() {
    for (var _len = arguments.length, units = new Array(_len), _key = 0; _key < _len; _key++) {
      units[_key] = arguments[_key];
    }

    if (!this.isValid) return this;

    if (units.length === 0) {
      return this;
    }

    units = units.map(function (u) {
      return Duration.normalizeUnit(u);
    });
    var built = {},
        accumulated = {},
        vals = this.toObject();
    var lastUnit;

    for (var _iterator2 = _createForOfIteratorHelperLoose(orderedUnits), _step2; !(_step2 = _iterator2()).done;) {
      var k = _step2.value;

      if (units.indexOf(k) >= 0) {
        lastUnit = k;
        var own = 0; // anything we haven't boiled down yet should get boiled to this unit

        for (var ak in accumulated) {
          own += this.matrix[ak][k] * accumulated[ak];
          accumulated[ak] = 0;
        } // plus anything that's already in this unit


        if (isNumber(vals[k])) {
          own += vals[k];
        }

        var i = Math.trunc(own);
        built[k] = i;
        accumulated[k] = own - i; // we'd like to absorb these fractions in another unit
        // plus anything further down the chain that should be rolled up in to this

        for (var down in vals) {
          if (orderedUnits.indexOf(down) > orderedUnits.indexOf(k)) {
            convert(this.matrix, vals, down, built, k);
          }
        } // otherwise, keep it in the wings to boil it later

      } else if (isNumber(vals[k])) {
        accumulated[k] = vals[k];
      }
    } // anything leftover becomes the decimal for the last unit
    // lastUnit must be defined since units is not empty


    for (var key in accumulated) {
      if (accumulated[key] !== 0) {
        built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
      }
    }

    return clone(this, {
      values: built
    }, true).normalize();
  }
  /**
   * Return the negative of this Duration.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
   * @return {Duration}
   */
  ;

  _proto.negate = function negate() {
    if (!this.isValid) return this;
    var negated = {};

    for (var _i2 = 0, _Object$keys2 = Object.keys(this.values); _i2 < _Object$keys2.length; _i2++) {
      var k = _Object$keys2[_i2];
      negated[k] = -this.values[k];
    }

    return clone(this, {
      values: negated
    }, true);
  }
  /**
   * Get the years.
   * @type {number}
   */
  ;

  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  _proto.equals = function equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }

    if (!this.loc.equals(other.loc)) {
      return false;
    }

    for (var _iterator3 = _createForOfIteratorHelperLoose(orderedUnits), _step3; !(_step3 = _iterator3()).done;) {
      var u = _step3.value;

      if (this.values[u] !== other.values[u]) {
        return false;
      }
    }

    return true;
  };

  _createClass(Duration, [{
    key: "locale",
    get: function get() {
      return this.isValid ? this.loc.locale : null;
    }
    /**
     * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
     *
     * @type {string}
     */

  }, {
    key: "numberingSystem",
    get: function get() {
      return this.isValid ? this.loc.numberingSystem : null;
    }
  }, {
    key: "years",
    get: function get() {
      return this.isValid ? this.values.years || 0 : NaN;
    }
    /**
     * Get the quarters.
     * @type {number}
     */

  }, {
    key: "quarters",
    get: function get() {
      return this.isValid ? this.values.quarters || 0 : NaN;
    }
    /**
     * Get the months.
     * @type {number}
     */

  }, {
    key: "months",
    get: function get() {
      return this.isValid ? this.values.months || 0 : NaN;
    }
    /**
     * Get the weeks
     * @type {number}
     */

  }, {
    key: "weeks",
    get: function get() {
      return this.isValid ? this.values.weeks || 0 : NaN;
    }
    /**
     * Get the days.
     * @type {number}
     */

  }, {
    key: "days",
    get: function get() {
      return this.isValid ? this.values.days || 0 : NaN;
    }
    /**
     * Get the hours.
     * @type {number}
     */

  }, {
    key: "hours",
    get: function get() {
      return this.isValid ? this.values.hours || 0 : NaN;
    }
    /**
     * Get the minutes.
     * @type {number}
     */

  }, {
    key: "minutes",
    get: function get() {
      return this.isValid ? this.values.minutes || 0 : NaN;
    }
    /**
     * Get the seconds.
     * @return {number}
     */

  }, {
    key: "seconds",
    get: function get() {
      return this.isValid ? this.values.seconds || 0 : NaN;
    }
    /**
     * Get the milliseconds.
     * @return {number}
     */

  }, {
    key: "milliseconds",
    get: function get() {
      return this.isValid ? this.values.milliseconds || 0 : NaN;
    }
    /**
     * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
     * on invalid DateTimes or Intervals.
     * @return {boolean}
     */

  }, {
    key: "isValid",
    get: function get() {
      return this.invalid === null;
    }
    /**
     * Returns an error code if this Duration became invalid, or null if the Duration is valid
     * @return {string}
     */

  }, {
    key: "invalidReason",
    get: function get() {
      return this.invalid ? this.invalid.reason : null;
    }
    /**
     * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
     * @type {string}
     */

  }, {
    key: "invalidExplanation",
    get: function get() {
      return this.invalid ? this.invalid.explanation : null;
    }
  }]);

  return Duration;
}();
function friendlyDuration(durationish) {
  if (isNumber(durationish)) {
    return Duration.fromMillis(durationish);
  } else if (Duration.isDuration(durationish)) {
    return durationish;
  } else if (typeof durationish === "object") {
    return Duration.fromObject(durationish);
  } else {
    throw new InvalidArgumentError("Unknown duration argument " + durationish + " of type " + typeof durationish);
  }
}

var INVALID$1 = "Invalid Interval"; // checks if the start is equal to or before the end

function validateStartEnd(start, end) {
  if (!start || !start.isValid) {
    return Interval.invalid("missing or invalid start");
  } else if (!end || !end.isValid) {
    return Interval.invalid("missing or invalid end");
  } else if (end < start) {
    return Interval.invalid("end before start", "The end of an interval must be after its start, but you had start=" + start.toISO() + " and end=" + end.toISO());
  } else {
    return null;
  }
}
/**
 * An Interval object represents a half-open interval of time, where each endpoint is a {@link DateTime}. Conceptually, it's a container for those two endpoints, accompanied by methods for creating, parsing, interrogating, comparing, transforming, and formatting them.
 *
 * Here is a brief overview of the most commonly used methods and getters in Interval:
 *
 * * **Creation** To create an Interval, use {@link fromDateTimes}, {@link after}, {@link before}, or {@link fromISO}.
 * * **Accessors** Use {@link start} and {@link end} to get the start and end.
 * * **Interrogation** To analyze the Interval, use {@link count}, {@link length}, {@link hasSame}, {@link contains}, {@link isAfter}, or {@link isBefore}.
 * * **Transformation** To create other Intervals out of this one, use {@link set}, {@link splitAt}, {@link splitBy}, {@link divideEqually}, {@link merge}, {@link xor}, {@link union}, {@link intersection}, or {@link difference}.
 * * **Comparison** To compare this Interval to another one, use {@link equals}, {@link overlaps}, {@link abutsStart}, {@link abutsEnd}, {@link engulfs}.
 * * **Output** To convert the Interval into other representations, see {@link toString}, {@link toISO}, {@link toISODate}, {@link toISOTime}, {@link toFormat}, and {@link toDuration}.
 */


var Interval = /*#__PURE__*/function () {
  /**
   * @private
   */
  function Interval(config) {
    /**
     * @access private
     */
    this.s = config.start;
    /**
     * @access private
     */

    this.e = config.end;
    /**
     * @access private
     */

    this.invalid = config.invalid || null;
    /**
     * @access private
     */

    this.isLuxonInterval = true;
  }
  /**
   * Create an invalid Interval.
   * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Interval}
   */


  Interval.invalid = function invalid(reason, explanation) {
    if (explanation === void 0) {
      explanation = null;
    }

    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
    }

    var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

    if (Settings.throwOnInvalid) {
      throw new InvalidIntervalError(invalid);
    } else {
      return new Interval({
        invalid: invalid
      });
    }
  }
  /**
   * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
   * @param {DateTime|Date|Object} start
   * @param {DateTime|Date|Object} end
   * @return {Interval}
   */
  ;

  Interval.fromDateTimes = function fromDateTimes(start, end) {
    var builtStart = friendlyDateTime(start),
        builtEnd = friendlyDateTime(end);
    var validateError = validateStartEnd(builtStart, builtEnd);

    if (validateError == null) {
      return new Interval({
        start: builtStart,
        end: builtEnd
      });
    } else {
      return validateError;
    }
  }
  /**
   * Create an Interval from a start DateTime and a Duration to extend to.
   * @param {DateTime|Date|Object} start
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  ;

  Interval.after = function after(start, duration) {
    var dur = friendlyDuration(duration),
        dt = friendlyDateTime(start);
    return Interval.fromDateTimes(dt, dt.plus(dur));
  }
  /**
   * Create an Interval from an end DateTime and a Duration to extend backwards to.
   * @param {DateTime|Date|Object} end
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  ;

  Interval.before = function before(end, duration) {
    var dur = friendlyDuration(duration),
        dt = friendlyDateTime(end);
    return Interval.fromDateTimes(dt.minus(dur), dt);
  }
  /**
   * Create an Interval from an ISO 8601 string.
   * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
   * @param {string} text - the ISO string to parse
   * @param {Object} [opts] - options to pass {@link DateTime.fromISO} and optionally {@link Duration.fromISO}
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {Interval}
   */
  ;

  Interval.fromISO = function fromISO(text, opts) {
    var _split = (text || "").split("/", 2),
        s = _split[0],
        e = _split[1];

    if (s && e) {
      var start, startIsValid;

      try {
        start = DateTime.fromISO(s, opts);
        startIsValid = start.isValid;
      } catch (e) {
        startIsValid = false;
      }

      var end, endIsValid;

      try {
        end = DateTime.fromISO(e, opts);
        endIsValid = end.isValid;
      } catch (e) {
        endIsValid = false;
      }

      if (startIsValid && endIsValid) {
        return Interval.fromDateTimes(start, end);
      }

      if (startIsValid) {
        var dur = Duration.fromISO(e, opts);

        if (dur.isValid) {
          return Interval.after(start, dur);
        }
      } else if (endIsValid) {
        var _dur = Duration.fromISO(s, opts);

        if (_dur.isValid) {
          return Interval.before(end, _dur);
        }
      }
    }

    return Interval.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
  }
  /**
   * Check if an object is an Interval. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  ;

  Interval.isInterval = function isInterval(o) {
    return o && o.isLuxonInterval || false;
  }
  /**
   * Returns the start of the Interval
   * @type {DateTime}
   */
  ;

  var _proto = Interval.prototype;

  /**
   * Returns the length of the Interval in the specified unit.
   * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
   * @return {number}
   */
  _proto.length = function length(unit) {
    if (unit === void 0) {
      unit = "milliseconds";
    }

    return this.isValid ? this.toDuration.apply(this, [unit]).get(unit) : NaN;
  }
  /**
   * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
   * Unlike {@link length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
   * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
   * @param {string} [unit='milliseconds'] - the unit of time to count.
   * @return {number}
   */
  ;

  _proto.count = function count(unit) {
    if (unit === void 0) {
      unit = "milliseconds";
    }

    if (!this.isValid) return NaN;
    var start = this.start.startOf(unit),
        end = this.end.startOf(unit);
    return Math.floor(end.diff(start, unit).get(unit)) + 1;
  }
  /**
   * Returns whether this Interval's start and end are both in the same unit of time
   * @param {string} unit - the unit of time to check sameness on
   * @return {boolean}
   */
  ;

  _proto.hasSame = function hasSame(unit) {
    return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
  }
  /**
   * Return whether this Interval has the same start and end DateTimes.
   * @return {boolean}
   */
  ;

  _proto.isEmpty = function isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }
  /**
   * Return whether this Interval's start is after the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  ;

  _proto.isAfter = function isAfter(dateTime) {
    if (!this.isValid) return false;
    return this.s > dateTime;
  }
  /**
   * Return whether this Interval's end is before the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  ;

  _proto.isBefore = function isBefore(dateTime) {
    if (!this.isValid) return false;
    return this.e <= dateTime;
  }
  /**
   * Return whether this Interval contains the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  ;

  _proto.contains = function contains(dateTime) {
    if (!this.isValid) return false;
    return this.s <= dateTime && this.e > dateTime;
  }
  /**
   * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
   * @param {Object} values - the values to set
   * @param {DateTime} values.start - the starting DateTime
   * @param {DateTime} values.end - the ending DateTime
   * @return {Interval}
   */
  ;

  _proto.set = function set(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        start = _ref.start,
        end = _ref.end;

    if (!this.isValid) return this;
    return Interval.fromDateTimes(start || this.s, end || this.e);
  }
  /**
   * Split this Interval at each of the specified DateTimes
   * @param {...[DateTime]} dateTimes - the unit of time to count.
   * @return {[Interval]}
   */
  ;

  _proto.splitAt = function splitAt() {
    var _this = this;

    if (!this.isValid) return [];

    for (var _len = arguments.length, dateTimes = new Array(_len), _key = 0; _key < _len; _key++) {
      dateTimes[_key] = arguments[_key];
    }

    var sorted = dateTimes.map(friendlyDateTime).filter(function (d) {
      return _this.contains(d);
    }).sort(),
        results = [];
    var s = this.s,
        i = 0;

    while (s < this.e) {
      var added = sorted[i] || this.e,
          next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
      i += 1;
    }

    return results;
  }
  /**
   * Split this Interval into smaller Intervals, each of the specified length.
   * Left over time is grouped into a smaller interval
   * @param {Duration|Object|number} duration - The length of each resulting interval.
   * @return {[Interval]}
   */
  ;

  _proto.splitBy = function splitBy(duration) {
    var dur = friendlyDuration(duration);

    if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
      return [];
    }

    var s = this.s,
        added,
        next;
    var results = [];

    while (s < this.e) {
      added = s.plus(dur);
      next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
    }

    return results;
  }
  /**
   * Split this Interval into the specified number of smaller intervals.
   * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
   * @return {[Interval]}
   */
  ;

  _proto.divideEqually = function divideEqually(numberOfParts) {
    if (!this.isValid) return [];
    return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
  }
  /**
   * Return whether this Interval overlaps with the specified Interval
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.overlaps = function overlaps(other) {
    return this.e > other.s && this.s < other.e;
  }
  /**
   * Return whether this Interval's end is adjacent to the specified Interval's start.
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.abutsStart = function abutsStart(other) {
    if (!this.isValid) return false;
    return +this.e === +other.s;
  }
  /**
   * Return whether this Interval's start is adjacent to the specified Interval's end.
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.abutsEnd = function abutsEnd(other) {
    if (!this.isValid) return false;
    return +other.e === +this.s;
  }
  /**
   * Return whether this Interval engulfs the start and end of the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.engulfs = function engulfs(other) {
    if (!this.isValid) return false;
    return this.s <= other.s && this.e >= other.e;
  }
  /**
   * Return whether this Interval has the same start and end as the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.equals = function equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }

    return this.s.equals(other.s) && this.e.equals(other.e);
  }
  /**
   * Return an Interval representing the intersection of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
   * Returns null if the intersection is empty, meaning, the intervals don't intersect.
   * @param {Interval} other
   * @return {Interval}
   */
  ;

  _proto.intersection = function intersection(other) {
    if (!this.isValid) return this;
    var s = this.s > other.s ? this.s : other.s,
        e = this.e < other.e ? this.e : other.e;

    if (s > e) {
      return null;
    } else {
      return Interval.fromDateTimes(s, e);
    }
  }
  /**
   * Return an Interval representing the union of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
   * @param {Interval} other
   * @return {Interval}
   */
  ;

  _proto.union = function union(other) {
    if (!this.isValid) return this;
    var s = this.s < other.s ? this.s : other.s,
        e = this.e > other.e ? this.e : other.e;
    return Interval.fromDateTimes(s, e);
  }
  /**
   * Merge an array of Intervals into a equivalent minimal set of Intervals.
   * Combines overlapping and adjacent Intervals.
   * @param {[Interval]} intervals
   * @return {[Interval]}
   */
  ;

  Interval.merge = function merge(intervals) {
    var _intervals$sort$reduc = intervals.sort(function (a, b) {
      return a.s - b.s;
    }).reduce(function (_ref2, item) {
      var sofar = _ref2[0],
          current = _ref2[1];

      if (!current) {
        return [sofar, item];
      } else if (current.overlaps(item) || current.abutsStart(item)) {
        return [sofar, current.union(item)];
      } else {
        return [sofar.concat([current]), item];
      }
    }, [[], null]),
        found = _intervals$sort$reduc[0],
        final = _intervals$sort$reduc[1];

    if (final) {
      found.push(final);
    }

    return found;
  }
  /**
   * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
   * @param {[Interval]} intervals
   * @return {[Interval]}
   */
  ;

  Interval.xor = function xor(intervals) {
    var _Array$prototype;

    var start = null,
        currentCount = 0;

    var results = [],
        ends = intervals.map(function (i) {
      return [{
        time: i.s,
        type: "s"
      }, {
        time: i.e,
        type: "e"
      }];
    }),
        flattened = (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, ends),
        arr = flattened.sort(function (a, b) {
      return a.time - b.time;
    });

    for (var _iterator = _createForOfIteratorHelperLoose(arr), _step; !(_step = _iterator()).done;) {
      var i = _step.value;
      currentCount += i.type === "s" ? 1 : -1;

      if (currentCount === 1) {
        start = i.time;
      } else {
        if (start && +start !== +i.time) {
          results.push(Interval.fromDateTimes(start, i.time));
        }

        start = null;
      }
    }

    return Interval.merge(results);
  }
  /**
   * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
   * @param {...Interval} intervals
   * @return {[Interval]}
   */
  ;

  _proto.difference = function difference() {
    var _this2 = this;

    for (var _len2 = arguments.length, intervals = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      intervals[_key2] = arguments[_key2];
    }

    return Interval.xor([this].concat(intervals)).map(function (i) {
      return _this2.intersection(i);
    }).filter(function (i) {
      return i && !i.isEmpty();
    });
  }
  /**
   * Returns a string representation of this Interval appropriate for debugging.
   * @return {string}
   */
  ;

  _proto.toString = function toString() {
    if (!this.isValid) return INVALID$1;
    return "[" + this.s.toISO() + " \u2013 " + this.e.toISO() + ")";
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Interval.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime.toISO}
   * @return {string}
   */
  ;

  _proto.toISO = function toISO(opts) {
    if (!this.isValid) return INVALID$1;
    return this.s.toISO(opts) + "/" + this.e.toISO(opts);
  }
  /**
   * Returns an ISO 8601-compliant string representation of date of this Interval.
   * The time components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {string}
   */
  ;

  _proto.toISODate = function toISODate() {
    if (!this.isValid) return INVALID$1;
    return this.s.toISODate() + "/" + this.e.toISODate();
  }
  /**
   * Returns an ISO 8601-compliant string representation of time of this Interval.
   * The date components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime.toISO}
   * @return {string}
   */
  ;

  _proto.toISOTime = function toISOTime(opts) {
    if (!this.isValid) return INVALID$1;
    return this.s.toISOTime(opts) + "/" + this.e.toISOTime(opts);
  }
  /**
   * Returns a string representation of this Interval formatted according to the specified format string.
   * @param {string} dateFormat - the format string. This string formats the start and end time. See {@link DateTime.toFormat} for details.
   * @param {Object} opts - options
   * @param {string} [opts.separator =  ' – '] - a separator to place between the start and end representations
   * @return {string}
   */
  ;

  _proto.toFormat = function toFormat(dateFormat, _temp2) {
    var _ref3 = _temp2 === void 0 ? {} : _temp2,
        _ref3$separator = _ref3.separator,
        separator = _ref3$separator === void 0 ? " – " : _ref3$separator;

    if (!this.isValid) return INVALID$1;
    return "" + this.s.toFormat(dateFormat) + separator + this.e.toFormat(dateFormat);
  }
  /**
   * Return a Duration representing the time spanned by this interval.
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
   * @return {Duration}
   */
  ;

  _proto.toDuration = function toDuration(unit, opts) {
    if (!this.isValid) {
      return Duration.invalid(this.invalidReason);
    }

    return this.e.diff(this.s, unit, opts);
  }
  /**
   * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
   * @param {function} mapFn
   * @return {Interval}
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
   */
  ;

  _proto.mapEndpoints = function mapEndpoints(mapFn) {
    return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
  };

  _createClass(Interval, [{
    key: "start",
    get: function get() {
      return this.isValid ? this.s : null;
    }
    /**
     * Returns the end of the Interval
     * @type {DateTime}
     */

  }, {
    key: "end",
    get: function get() {
      return this.isValid ? this.e : null;
    }
    /**
     * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
     * @type {boolean}
     */

  }, {
    key: "isValid",
    get: function get() {
      return this.invalidReason === null;
    }
    /**
     * Returns an error code if this Interval is invalid, or null if the Interval is valid
     * @type {string}
     */

  }, {
    key: "invalidReason",
    get: function get() {
      return this.invalid ? this.invalid.reason : null;
    }
    /**
     * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
     * @type {string}
     */

  }, {
    key: "invalidExplanation",
    get: function get() {
      return this.invalid ? this.invalid.explanation : null;
    }
  }]);

  return Interval;
}();

/**
 * The Info class contains static methods for retrieving general time and date related data. For example, it has methods for finding out if a time zone has a DST, for listing the months in any supported locale, and for discovering which of Luxon features are available in the current environment.
 */

var Info = /*#__PURE__*/function () {
  function Info() {}

  /**
   * Return whether the specified zone contains a DST.
   * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
   * @return {boolean}
   */
  Info.hasDST = function hasDST(zone) {
    if (zone === void 0) {
      zone = Settings.defaultZone;
    }

    var proto = DateTime.local().setZone(zone).set({
      month: 12
    });
    return !zone.universal && proto.offset !== proto.set({
      month: 6
    }).offset;
  }
  /**
   * Return whether the specified zone is a valid IANA specifier.
   * @param {string} zone - Zone to check
   * @return {boolean}
   */
  ;

  Info.isValidIANAZone = function isValidIANAZone(zone) {
    return IANAZone.isValidSpecifier(zone) && IANAZone.isValidZone(zone);
  }
  /**
   * Converts the input into a {@link Zone} instance.
   *
   * * If `input` is already a Zone instance, it is returned unchanged.
   * * If `input` is a string containing a valid time zone name, a Zone instance
   *   with that name is returned.
   * * If `input` is a string that doesn't refer to a known time zone, a Zone
   *   instance with {@link Zone.isValid} == false is returned.
   * * If `input is a number, a Zone instance with the specified fixed offset
   *   in minutes is returned.
   * * If `input` is `null` or `undefined`, the default zone is returned.
   * @param {string|Zone|number} [input] - the value to be converted
   * @return {Zone}
   */
  ;

  Info.normalizeZone = function normalizeZone$1(input) {
    return normalizeZone(input, Settings.defaultZone);
  }
  /**
   * Return an array of standalone month names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @example Info.months()[0] //=> 'January'
   * @example Info.months('short')[0] //=> 'Jan'
   * @example Info.months('numeric')[0] //=> '1'
   * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
   * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
   * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
   * @return {[string]}
   */
  ;

  Info.months = function months(length, _temp) {
    if (length === void 0) {
      length = "long";
    }

    var _ref = _temp === void 0 ? {} : _temp,
        _ref$locale = _ref.locale,
        locale = _ref$locale === void 0 ? null : _ref$locale,
        _ref$numberingSystem = _ref.numberingSystem,
        numberingSystem = _ref$numberingSystem === void 0 ? null : _ref$numberingSystem,
        _ref$outputCalendar = _ref.outputCalendar,
        outputCalendar = _ref$outputCalendar === void 0 ? "gregory" : _ref$outputCalendar;

    return Locale.create(locale, numberingSystem, outputCalendar).months(length);
  }
  /**
   * Return an array of format month names.
   * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
   * changes the string.
   * See {@link months}
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @return {[string]}
   */
  ;

  Info.monthsFormat = function monthsFormat(length, _temp2) {
    if (length === void 0) {
      length = "long";
    }

    var _ref2 = _temp2 === void 0 ? {} : _temp2,
        _ref2$locale = _ref2.locale,
        locale = _ref2$locale === void 0 ? null : _ref2$locale,
        _ref2$numberingSystem = _ref2.numberingSystem,
        numberingSystem = _ref2$numberingSystem === void 0 ? null : _ref2$numberingSystem,
        _ref2$outputCalendar = _ref2.outputCalendar,
        outputCalendar = _ref2$outputCalendar === void 0 ? "gregory" : _ref2$outputCalendar;

    return Locale.create(locale, numberingSystem, outputCalendar).months(length, true);
  }
  /**
   * Return an array of standalone week names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @example Info.weekdays()[0] //=> 'Monday'
   * @example Info.weekdays('short')[0] //=> 'Mon'
   * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
   * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
   * @return {[string]}
   */
  ;

  Info.weekdays = function weekdays(length, _temp3) {
    if (length === void 0) {
      length = "long";
    }

    var _ref3 = _temp3 === void 0 ? {} : _temp3,
        _ref3$locale = _ref3.locale,
        locale = _ref3$locale === void 0 ? null : _ref3$locale,
        _ref3$numberingSystem = _ref3.numberingSystem,
        numberingSystem = _ref3$numberingSystem === void 0 ? null : _ref3$numberingSystem;

    return Locale.create(locale, numberingSystem, null).weekdays(length);
  }
  /**
   * Return an array of format week names.
   * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
   * changes the string.
   * See {@link weekdays}
   * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale=null] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @return {[string]}
   */
  ;

  Info.weekdaysFormat = function weekdaysFormat(length, _temp4) {
    if (length === void 0) {
      length = "long";
    }

    var _ref4 = _temp4 === void 0 ? {} : _temp4,
        _ref4$locale = _ref4.locale,
        locale = _ref4$locale === void 0 ? null : _ref4$locale,
        _ref4$numberingSystem = _ref4.numberingSystem,
        numberingSystem = _ref4$numberingSystem === void 0 ? null : _ref4$numberingSystem;

    return Locale.create(locale, numberingSystem, null).weekdays(length, true);
  }
  /**
   * Return an array of meridiems.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.meridiems() //=> [ 'AM', 'PM' ]
   * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
   * @return {[string]}
   */
  ;

  Info.meridiems = function meridiems(_temp5) {
    var _ref5 = _temp5 === void 0 ? {} : _temp5,
        _ref5$locale = _ref5.locale,
        locale = _ref5$locale === void 0 ? null : _ref5$locale;

    return Locale.create(locale).meridiems();
  }
  /**
   * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
   * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.eras() //=> [ 'BC', 'AD' ]
   * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
   * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
   * @return {[string]}
   */
  ;

  Info.eras = function eras(length, _temp6) {
    if (length === void 0) {
      length = "short";
    }

    var _ref6 = _temp6 === void 0 ? {} : _temp6,
        _ref6$locale = _ref6.locale,
        locale = _ref6$locale === void 0 ? null : _ref6$locale;

    return Locale.create(locale, null, "gregory").eras(length);
  }
  /**
   * Return the set of available features in this environment.
   * Some features of Luxon are not available in all environments. For example, on older browsers, timezone support is not available. Use this function to figure out if that's the case.
   * Keys:
   * * `zones`: whether this environment supports IANA timezones
   * * `intlTokens`: whether this environment supports internationalized token-based formatting/parsing
   * * `intl`: whether this environment supports general internationalization
   * * `relative`: whether this environment supports relative time formatting
   * @example Info.features() //=> { intl: true, intlTokens: false, zones: true, relative: false }
   * @return {Object}
   */
  ;

  Info.features = function features() {
    var intl = false,
        intlTokens = false,
        zones = false,
        relative = false;

    if (hasIntl()) {
      intl = true;
      intlTokens = hasFormatToParts();
      relative = hasRelative();

      try {
        zones = new Intl.DateTimeFormat("en", {
          timeZone: "America/New_York"
        }).resolvedOptions().timeZone === "America/New_York";
      } catch (e) {
        zones = false;
      }
    }

    return {
      intl: intl,
      intlTokens: intlTokens,
      zones: zones,
      relative: relative
    };
  };

  return Info;
}();

function dayDiff(earlier, later) {
  var utcDayStart = function utcDayStart(dt) {
    return dt.toUTC(0, {
      keepLocalTime: true
    }).startOf("day").valueOf();
  },
      ms = utcDayStart(later) - utcDayStart(earlier);

  return Math.floor(Duration.fromMillis(ms).as("days"));
}

function highOrderDiffs(cursor, later, units) {
  var differs = [["years", function (a, b) {
    return b.year - a.year;
  }], ["months", function (a, b) {
    return b.month - a.month + (b.year - a.year) * 12;
  }], ["weeks", function (a, b) {
    var days = dayDiff(a, b);
    return (days - days % 7) / 7;
  }], ["days", dayDiff]];
  var results = {};
  var lowestOrder, highWater;

  for (var _i = 0, _differs = differs; _i < _differs.length; _i++) {
    var _differs$_i = _differs[_i],
        unit = _differs$_i[0],
        differ = _differs$_i[1];

    if (units.indexOf(unit) >= 0) {
      var _cursor$plus;

      lowestOrder = unit;
      var delta = differ(cursor, later);
      highWater = cursor.plus((_cursor$plus = {}, _cursor$plus[unit] = delta, _cursor$plus));

      if (highWater > later) {
        var _cursor$plus2;

        cursor = cursor.plus((_cursor$plus2 = {}, _cursor$plus2[unit] = delta - 1, _cursor$plus2));
        delta -= 1;
      } else {
        cursor = highWater;
      }

      results[unit] = delta;
    }
  }

  return [cursor, results, highWater, lowestOrder];
}

function _diff (earlier, later, units, opts) {
  var _highOrderDiffs = highOrderDiffs(earlier, later, units),
      cursor = _highOrderDiffs[0],
      results = _highOrderDiffs[1],
      highWater = _highOrderDiffs[2],
      lowestOrder = _highOrderDiffs[3];

  var remainingMillis = later - cursor;
  var lowerOrderUnits = units.filter(function (u) {
    return ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0;
  });

  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      var _cursor$plus3;

      highWater = cursor.plus((_cursor$plus3 = {}, _cursor$plus3[lowestOrder] = 1, _cursor$plus3));
    }

    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
    }
  }

  var duration = Duration.fromObject(Object.assign(results, opts));

  if (lowerOrderUnits.length > 0) {
    var _Duration$fromMillis;

    return (_Duration$fromMillis = Duration.fromMillis(remainingMillis, opts)).shiftTo.apply(_Duration$fromMillis, lowerOrderUnits).plus(duration);
  } else {
    return duration;
  }
}

var numberingSystems = {
  arab: "[\u0660-\u0669]",
  arabext: "[\u06F0-\u06F9]",
  bali: "[\u1B50-\u1B59]",
  beng: "[\u09E6-\u09EF]",
  deva: "[\u0966-\u096F]",
  fullwide: "[\uFF10-\uFF19]",
  gujr: "[\u0AE6-\u0AEF]",
  hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
  khmr: "[\u17E0-\u17E9]",
  knda: "[\u0CE6-\u0CEF]",
  laoo: "[\u0ED0-\u0ED9]",
  limb: "[\u1946-\u194F]",
  mlym: "[\u0D66-\u0D6F]",
  mong: "[\u1810-\u1819]",
  mymr: "[\u1040-\u1049]",
  orya: "[\u0B66-\u0B6F]",
  tamldec: "[\u0BE6-\u0BEF]",
  telu: "[\u0C66-\u0C6F]",
  thai: "[\u0E50-\u0E59]",
  tibt: "[\u0F20-\u0F29]",
  latn: "\\d"
};
var numberingSystemsUTF16 = {
  arab: [1632, 1641],
  arabext: [1776, 1785],
  bali: [6992, 7001],
  beng: [2534, 2543],
  deva: [2406, 2415],
  fullwide: [65296, 65303],
  gujr: [2790, 2799],
  khmr: [6112, 6121],
  knda: [3302, 3311],
  laoo: [3792, 3801],
  limb: [6470, 6479],
  mlym: [3430, 3439],
  mong: [6160, 6169],
  mymr: [4160, 4169],
  orya: [2918, 2927],
  tamldec: [3046, 3055],
  telu: [3174, 3183],
  thai: [3664, 3673],
  tibt: [3872, 3881]
}; // eslint-disable-next-line

var hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
function parseDigits(str) {
  var value = parseInt(str, 10);

  if (isNaN(value)) {
    value = "";

    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);

      if (str[i].search(numberingSystems.hanidec) !== -1) {
        value += hanidecChars.indexOf(str[i]);
      } else {
        for (var key in numberingSystemsUTF16) {
          var _numberingSystemsUTF = numberingSystemsUTF16[key],
              min = _numberingSystemsUTF[0],
              max = _numberingSystemsUTF[1];

          if (code >= min && code <= max) {
            value += code - min;
          }
        }
      }
    }

    return parseInt(value, 10);
  } else {
    return value;
  }
}
function digitRegex(_ref, append) {
  var numberingSystem = _ref.numberingSystem;

  if (append === void 0) {
    append = "";
  }

  return new RegExp("" + numberingSystems[numberingSystem || "latn"] + append);
}

var MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";

function intUnit(regex, post) {
  if (post === void 0) {
    post = function post(i) {
      return i;
    };
  }

  return {
    regex: regex,
    deser: function deser(_ref) {
      var s = _ref[0];
      return post(parseDigits(s));
    }
  };
}

var NBSP = String.fromCharCode(160);
var spaceOrNBSP = "( |" + NBSP + ")";
var spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");

function fixListRegex(s) {
  // make dots optional and also make them literal
  // make space and non breakable space characters interchangeable
  return s.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
}

function stripInsensitivities(s) {
  return s.replace(/\./g, "") // ignore dots that were made optional
  .replace(spaceOrNBSPRegExp, " ") // interchange space and nbsp
  .toLowerCase();
}

function oneOf(strings, startIndex) {
  if (strings === null) {
    return null;
  } else {
    return {
      regex: RegExp(strings.map(fixListRegex).join("|")),
      deser: function deser(_ref2) {
        var s = _ref2[0];
        return strings.findIndex(function (i) {
          return stripInsensitivities(s) === stripInsensitivities(i);
        }) + startIndex;
      }
    };
  }
}

function offset(regex, groups) {
  return {
    regex: regex,
    deser: function deser(_ref3) {
      var h = _ref3[1],
          m = _ref3[2];
      return signedOffset(h, m);
    },
    groups: groups
  };
}

function simple(regex) {
  return {
    regex: regex,
    deser: function deser(_ref4) {
      var s = _ref4[0];
      return s;
    }
  };
}

function escapeToken(value) {
  // eslint-disable-next-line no-useless-escape
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

function unitForToken(token, loc) {
  var one = digitRegex(loc),
      two = digitRegex(loc, "{2}"),
      three = digitRegex(loc, "{3}"),
      four = digitRegex(loc, "{4}"),
      six = digitRegex(loc, "{6}"),
      oneOrTwo = digitRegex(loc, "{1,2}"),
      oneToThree = digitRegex(loc, "{1,3}"),
      oneToSix = digitRegex(loc, "{1,6}"),
      oneToNine = digitRegex(loc, "{1,9}"),
      twoToFour = digitRegex(loc, "{2,4}"),
      fourToSix = digitRegex(loc, "{4,6}"),
      literal = function literal(t) {
    return {
      regex: RegExp(escapeToken(t.val)),
      deser: function deser(_ref5) {
        var s = _ref5[0];
        return s;
      },
      literal: true
    };
  },
      unitate = function unitate(t) {
    if (token.literal) {
      return literal(t);
    }

    switch (t.val) {
      // era
      case "G":
        return oneOf(loc.eras("short", false), 0);

      case "GG":
        return oneOf(loc.eras("long", false), 0);
      // years

      case "y":
        return intUnit(oneToSix);

      case "yy":
        return intUnit(twoToFour, untruncateYear);

      case "yyyy":
        return intUnit(four);

      case "yyyyy":
        return intUnit(fourToSix);

      case "yyyyyy":
        return intUnit(six);
      // months

      case "M":
        return intUnit(oneOrTwo);

      case "MM":
        return intUnit(two);

      case "MMM":
        return oneOf(loc.months("short", true, false), 1);

      case "MMMM":
        return oneOf(loc.months("long", true, false), 1);

      case "L":
        return intUnit(oneOrTwo);

      case "LL":
        return intUnit(two);

      case "LLL":
        return oneOf(loc.months("short", false, false), 1);

      case "LLLL":
        return oneOf(loc.months("long", false, false), 1);
      // dates

      case "d":
        return intUnit(oneOrTwo);

      case "dd":
        return intUnit(two);
      // ordinals

      case "o":
        return intUnit(oneToThree);

      case "ooo":
        return intUnit(three);
      // time

      case "HH":
        return intUnit(two);

      case "H":
        return intUnit(oneOrTwo);

      case "hh":
        return intUnit(two);

      case "h":
        return intUnit(oneOrTwo);

      case "mm":
        return intUnit(two);

      case "m":
        return intUnit(oneOrTwo);

      case "q":
        return intUnit(oneOrTwo);

      case "qq":
        return intUnit(two);

      case "s":
        return intUnit(oneOrTwo);

      case "ss":
        return intUnit(two);

      case "S":
        return intUnit(oneToThree);

      case "SSS":
        return intUnit(three);

      case "u":
        return simple(oneToNine);
      // meridiem

      case "a":
        return oneOf(loc.meridiems(), 0);
      // weekYear (k)

      case "kkkk":
        return intUnit(four);

      case "kk":
        return intUnit(twoToFour, untruncateYear);
      // weekNumber (W)

      case "W":
        return intUnit(oneOrTwo);

      case "WW":
        return intUnit(two);
      // weekdays

      case "E":
      case "c":
        return intUnit(one);

      case "EEE":
        return oneOf(loc.weekdays("short", false, false), 1);

      case "EEEE":
        return oneOf(loc.weekdays("long", false, false), 1);

      case "ccc":
        return oneOf(loc.weekdays("short", true, false), 1);

      case "cccc":
        return oneOf(loc.weekdays("long", true, false), 1);
      // offset/zone

      case "Z":
      case "ZZ":
        return offset(new RegExp("([+-]" + oneOrTwo.source + ")(?::(" + two.source + "))?"), 2);

      case "ZZZ":
        return offset(new RegExp("([+-]" + oneOrTwo.source + ")(" + two.source + ")?"), 2);
      // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
      // because we don't have any way to figure out what they are

      case "z":
        return simple(/[a-z_+-/]{1,256}?/i);

      default:
        return literal(t);
    }
  };

  var unit = unitate(token) || {
    invalidReason: MISSING_FTP
  };
  unit.token = token;
  return unit;
}

var partTypeStyleToTokenVal = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy"
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM"
  },
  day: {
    numeric: "d",
    "2-digit": "dd"
  },
  weekday: {
    short: "EEE",
    long: "EEEE"
  },
  dayperiod: "a",
  dayPeriod: "a",
  hour: {
    numeric: "h",
    "2-digit": "hh"
  },
  minute: {
    numeric: "m",
    "2-digit": "mm"
  },
  second: {
    numeric: "s",
    "2-digit": "ss"
  }
};

function tokenForPart(part, locale, formatOpts) {
  var type = part.type,
      value = part.value;

  if (type === "literal") {
    return {
      literal: true,
      val: value
    };
  }

  var style = formatOpts[type];
  var val = partTypeStyleToTokenVal[type];

  if (typeof val === "object") {
    val = val[style];
  }

  if (val) {
    return {
      literal: false,
      val: val
    };
  }

  return undefined;
}

function buildRegex(units) {
  var re = units.map(function (u) {
    return u.regex;
  }).reduce(function (f, r) {
    return f + "(" + r.source + ")";
  }, "");
  return ["^" + re + "$", units];
}

function match(input, regex, handlers) {
  var matches = input.match(regex);

  if (matches) {
    var all = {};
    var matchIndex = 1;

    for (var i in handlers) {
      if (hasOwnProperty(handlers, i)) {
        var h = handlers[i],
            groups = h.groups ? h.groups + 1 : 1;

        if (!h.literal && h.token) {
          all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
        }

        matchIndex += groups;
      }
    }

    return [matches, all];
  } else {
    return [matches, {}];
  }
}

function dateTimeFromMatches(matches) {
  var toField = function toField(token) {
    switch (token) {
      case "S":
        return "millisecond";

      case "s":
        return "second";

      case "m":
        return "minute";

      case "h":
      case "H":
        return "hour";

      case "d":
        return "day";

      case "o":
        return "ordinal";

      case "L":
      case "M":
        return "month";

      case "y":
        return "year";

      case "E":
      case "c":
        return "weekday";

      case "W":
        return "weekNumber";

      case "k":
        return "weekYear";

      case "q":
        return "quarter";

      default:
        return null;
    }
  };

  var zone;

  if (!isUndefined(matches.Z)) {
    zone = new FixedOffsetZone(matches.Z);
  } else if (!isUndefined(matches.z)) {
    zone = IANAZone.create(matches.z);
  } else {
    zone = null;
  }

  if (!isUndefined(matches.q)) {
    matches.M = (matches.q - 1) * 3 + 1;
  }

  if (!isUndefined(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h += 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }

  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }

  if (!isUndefined(matches.u)) {
    matches.S = parseMillis(matches.u);
  }

  var vals = Object.keys(matches).reduce(function (r, k) {
    var f = toField(k);

    if (f) {
      r[f] = matches[k];
    }

    return r;
  }, {});
  return [vals, zone];
}

var dummyDateTimeCache = null;

function getDummyDateTime() {
  if (!dummyDateTimeCache) {
    dummyDateTimeCache = DateTime.fromMillis(1555555555555);
  }

  return dummyDateTimeCache;
}

function maybeExpandMacroToken(token, locale) {
  if (token.literal) {
    return token;
  }

  var formatOpts = Formatter.macroTokenToFormatOpts(token.val);

  if (!formatOpts) {
    return token;
  }

  var formatter = Formatter.create(locale, formatOpts);
  var parts = formatter.formatDateTimeParts(getDummyDateTime());
  var tokens = parts.map(function (p) {
    return tokenForPart(p, locale, formatOpts);
  });

  if (tokens.includes(undefined)) {
    return token;
  }

  return tokens;
}

function expandMacroTokens(tokens, locale) {
  var _Array$prototype;

  return (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, tokens.map(function (t) {
    return maybeExpandMacroToken(t, locale);
  }));
}
/**
 * @private
 */


function explainFromTokens(locale, input, format) {
  var tokens = expandMacroTokens(Formatter.parseFormat(format), locale),
      units = tokens.map(function (t) {
    return unitForToken(t, locale);
  }),
      disqualifyingUnit = units.find(function (t) {
    return t.invalidReason;
  });

  if (disqualifyingUnit) {
    return {
      input: input,
      tokens: tokens,
      invalidReason: disqualifyingUnit.invalidReason
    };
  } else {
    var _buildRegex = buildRegex(units),
        regexString = _buildRegex[0],
        handlers = _buildRegex[1],
        regex = RegExp(regexString, "i"),
        _match = match(input, regex, handlers),
        rawMatches = _match[0],
        matches = _match[1],
        _ref6 = matches ? dateTimeFromMatches(matches) : [null, null],
        result = _ref6[0],
        zone = _ref6[1];

    if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
      throw new ConflictingSpecificationError("Can't include meridiem when specifying 24-hour format");
    }

    return {
      input: input,
      tokens: tokens,
      regex: regex,
      rawMatches: rawMatches,
      matches: matches,
      result: result,
      zone: zone
    };
  }
}
function parseFromTokens(locale, input, format) {
  var _explainFromTokens = explainFromTokens(locale, input, format),
      result = _explainFromTokens.result,
      zone = _explainFromTokens.zone,
      invalidReason = _explainFromTokens.invalidReason;

  return [result, zone, invalidReason];
}

var nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
    leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

function unitOutOfRange(unit, value) {
  return new Invalid("unit out of range", "you specified " + value + " (of type " + typeof value + ") as a " + unit + ", which is invalid");
}

function dayOfWeek(year, month, day) {
  var js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return js === 0 ? 7 : js;
}

function computeOrdinal(year, month, day) {
  return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
}

function uncomputeOrdinal(year, ordinal) {
  var table = isLeapYear(year) ? leapLadder : nonLeapLadder,
      month0 = table.findIndex(function (i) {
    return i < ordinal;
  }),
      day = ordinal - table[month0];
  return {
    month: month0 + 1,
    day: day
  };
}
/**
 * @private
 */


function gregorianToWeek(gregObj) {
  var year = gregObj.year,
      month = gregObj.month,
      day = gregObj.day,
      ordinal = computeOrdinal(year, month, day),
      weekday = dayOfWeek(year, month, day);
  var weekNumber = Math.floor((ordinal - weekday + 10) / 7),
      weekYear;

  if (weekNumber < 1) {
    weekYear = year - 1;
    weekNumber = weeksInWeekYear(weekYear);
  } else if (weekNumber > weeksInWeekYear(year)) {
    weekYear = year + 1;
    weekNumber = 1;
  } else {
    weekYear = year;
  }

  return Object.assign({
    weekYear: weekYear,
    weekNumber: weekNumber,
    weekday: weekday
  }, timeObject(gregObj));
}
function weekToGregorian(weekData) {
  var weekYear = weekData.weekYear,
      weekNumber = weekData.weekNumber,
      weekday = weekData.weekday,
      weekdayOfJan4 = dayOfWeek(weekYear, 1, 4),
      yearInDays = daysInYear(weekYear);
  var ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 3,
      year;

  if (ordinal < 1) {
    year = weekYear - 1;
    ordinal += daysInYear(year);
  } else if (ordinal > yearInDays) {
    year = weekYear + 1;
    ordinal -= daysInYear(weekYear);
  } else {
    year = weekYear;
  }

  var _uncomputeOrdinal = uncomputeOrdinal(year, ordinal),
      month = _uncomputeOrdinal.month,
      day = _uncomputeOrdinal.day;

  return Object.assign({
    year: year,
    month: month,
    day: day
  }, timeObject(weekData));
}
function gregorianToOrdinal(gregData) {
  var year = gregData.year,
      month = gregData.month,
      day = gregData.day,
      ordinal = computeOrdinal(year, month, day);
  return Object.assign({
    year: year,
    ordinal: ordinal
  }, timeObject(gregData));
}
function ordinalToGregorian(ordinalData) {
  var year = ordinalData.year,
      ordinal = ordinalData.ordinal,
      _uncomputeOrdinal2 = uncomputeOrdinal(year, ordinal),
      month = _uncomputeOrdinal2.month,
      day = _uncomputeOrdinal2.day;

  return Object.assign({
    year: year,
    month: month,
    day: day
  }, timeObject(ordinalData));
}
function hasInvalidWeekData(obj) {
  var validYear = isInteger(obj.weekYear),
      validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear)),
      validWeekday = integerBetween(obj.weekday, 1, 7);

  if (!validYear) {
    return unitOutOfRange("weekYear", obj.weekYear);
  } else if (!validWeek) {
    return unitOutOfRange("week", obj.week);
  } else if (!validWeekday) {
    return unitOutOfRange("weekday", obj.weekday);
  } else return false;
}
function hasInvalidOrdinalData(obj) {
  var validYear = isInteger(obj.year),
      validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));

  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validOrdinal) {
    return unitOutOfRange("ordinal", obj.ordinal);
  } else return false;
}
function hasInvalidGregorianData(obj) {
  var validYear = isInteger(obj.year),
      validMonth = integerBetween(obj.month, 1, 12),
      validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));

  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validMonth) {
    return unitOutOfRange("month", obj.month);
  } else if (!validDay) {
    return unitOutOfRange("day", obj.day);
  } else return false;
}
function hasInvalidTimeData(obj) {
  var hour = obj.hour,
      minute = obj.minute,
      second = obj.second,
      millisecond = obj.millisecond;
  var validHour = integerBetween(hour, 0, 23) || hour === 24 && minute === 0 && second === 0 && millisecond === 0,
      validMinute = integerBetween(minute, 0, 59),
      validSecond = integerBetween(second, 0, 59),
      validMillisecond = integerBetween(millisecond, 0, 999);

  if (!validHour) {
    return unitOutOfRange("hour", hour);
  } else if (!validMinute) {
    return unitOutOfRange("minute", minute);
  } else if (!validSecond) {
    return unitOutOfRange("second", second);
  } else if (!validMillisecond) {
    return unitOutOfRange("millisecond", millisecond);
  } else return false;
}

var INVALID$2 = "Invalid DateTime";
var MAX_DATE = 8.64e15;

function unsupportedZone(zone) {
  return new Invalid("unsupported zone", "the zone \"" + zone.name + "\" is not supported");
} // we cache week data on the DT object and this intermediates the cache


function possiblyCachedWeekData(dt) {
  if (dt.weekData === null) {
    dt.weekData = gregorianToWeek(dt.c);
  }

  return dt.weekData;
} // clone really means, "make a new object with these modifications". all "setters" really use this
// to create a new object while only changing some of the properties


function clone$1(inst, alts) {
  var current = {
    ts: inst.ts,
    zone: inst.zone,
    c: inst.c,
    o: inst.o,
    loc: inst.loc,
    invalid: inst.invalid
  };
  return new DateTime(Object.assign({}, current, alts, {
    old: current
  }));
} // find the right offset a given local time. The o input is our guess, which determines which
// offset we'll pick in ambiguous cases (e.g. there are two 3 AMs b/c Fallback DST)


function fixOffset(localTS, o, tz) {
  // Our UTC time is just a guess because our offset is just a guess
  var utcGuess = localTS - o * 60 * 1000; // Test whether the zone matches the offset for this ts

  var o2 = tz.offset(utcGuess); // If so, offset didn't change and we're done

  if (o === o2) {
    return [utcGuess, o];
  } // If not, change the ts by the difference in the offset


  utcGuess -= (o2 - o) * 60 * 1000; // If that gives us the local time we want, we're done

  var o3 = tz.offset(utcGuess);

  if (o2 === o3) {
    return [utcGuess, o2];
  } // If it's different, we're in a hole time. The offset has changed, but the we don't adjust the time


  return [localTS - Math.min(o2, o3) * 60 * 1000, Math.max(o2, o3)];
} // convert an epoch timestamp into a calendar object with the given offset


function tsToObj(ts, offset) {
  ts += offset * 60 * 1000;
  var d = new Date(ts);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    millisecond: d.getUTCMilliseconds()
  };
} // convert a calendar object to a epoch timestamp


function objToTS(obj, offset, zone) {
  return fixOffset(objToLocalTS(obj), offset, zone);
} // create a new DT instance by adding a duration, adjusting for DSTs


function adjustTime(inst, dur) {
  var oPre = inst.o,
      year = inst.c.year + Math.trunc(dur.years),
      month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3,
      c = Object.assign({}, inst.c, {
    year: year,
    month: month,
    day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + Math.trunc(dur.weeks) * 7
  }),
      millisToAdd = Duration.fromObject({
    years: dur.years - Math.trunc(dur.years),
    quarters: dur.quarters - Math.trunc(dur.quarters),
    months: dur.months - Math.trunc(dur.months),
    weeks: dur.weeks - Math.trunc(dur.weeks),
    days: dur.days - Math.trunc(dur.days),
    hours: dur.hours,
    minutes: dur.minutes,
    seconds: dur.seconds,
    milliseconds: dur.milliseconds
  }).as("milliseconds"),
      localTS = objToLocalTS(c);

  var _fixOffset = fixOffset(localTS, oPre, inst.zone),
      ts = _fixOffset[0],
      o = _fixOffset[1];

  if (millisToAdd !== 0) {
    ts += millisToAdd; // that could have changed the offset by going over a DST, but we want to keep the ts the same

    o = inst.zone.offset(ts);
  }

  return {
    ts: ts,
    o: o
  };
} // helper useful in turning the results of parsing into real dates
// by handling the zone options


function parseDataToDateTime(parsed, parsedZone, opts, format, text) {
  var setZone = opts.setZone,
      zone = opts.zone;

  if (parsed && Object.keys(parsed).length !== 0) {
    var interpretationZone = parsedZone || zone,
        inst = DateTime.fromObject(Object.assign(parsed, opts, {
      zone: interpretationZone,
      // setZone is a valid option in the calling methods, but not in fromObject
      setZone: undefined
    }));
    return setZone ? inst : inst.setZone(zone);
  } else {
    return DateTime.invalid(new Invalid("unparsable", "the input \"" + text + "\" can't be parsed as " + format));
  }
} // if you want to output a technical format (e.g. RFC 2822), this helper
// helps handle the details


function toTechFormat(dt, format, allowZ) {
  if (allowZ === void 0) {
    allowZ = true;
  }

  return dt.isValid ? Formatter.create(Locale.create("en-US"), {
    allowZ: allowZ,
    forceSimple: true
  }).formatDateTimeFromString(dt, format) : null;
} // technical time formats (e.g. the time part of ISO 8601), take some options
// and this commonizes their handling


function toTechTimeFormat(dt, _ref) {
  var _ref$suppressSeconds = _ref.suppressSeconds,
      suppressSeconds = _ref$suppressSeconds === void 0 ? false : _ref$suppressSeconds,
      _ref$suppressMillisec = _ref.suppressMilliseconds,
      suppressMilliseconds = _ref$suppressMillisec === void 0 ? false : _ref$suppressMillisec,
      includeOffset = _ref.includeOffset,
      _ref$includeZone = _ref.includeZone,
      includeZone = _ref$includeZone === void 0 ? false : _ref$includeZone,
      _ref$spaceZone = _ref.spaceZone,
      spaceZone = _ref$spaceZone === void 0 ? false : _ref$spaceZone,
      _ref$format = _ref.format,
      format = _ref$format === void 0 ? "extended" : _ref$format;
  var fmt = format === "basic" ? "HHmm" : "HH:mm";

  if (!suppressSeconds || dt.second !== 0 || dt.millisecond !== 0) {
    fmt += format === "basic" ? "ss" : ":ss";

    if (!suppressMilliseconds || dt.millisecond !== 0) {
      fmt += ".SSS";
    }
  }

  if ((includeZone || includeOffset) && spaceZone) {
    fmt += " ";
  }

  if (includeZone) {
    fmt += "z";
  } else if (includeOffset) {
    fmt += format === "basic" ? "ZZZ" : "ZZ";
  }

  return toTechFormat(dt, fmt);
} // defaults for unspecified units in the supported calendars


var defaultUnitValues = {
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
},
    defaultWeekUnitValues = {
  weekNumber: 1,
  weekday: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
},
    defaultOrdinalUnitValues = {
  ordinal: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
}; // Units in the supported calendars, sorted by bigness

var orderedUnits$1 = ["year", "month", "day", "hour", "minute", "second", "millisecond"],
    orderedWeekUnits = ["weekYear", "weekNumber", "weekday", "hour", "minute", "second", "millisecond"],
    orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"]; // standardize case and plurality in units

function normalizeUnit(unit) {
  var normalized = {
    year: "year",
    years: "year",
    month: "month",
    months: "month",
    day: "day",
    days: "day",
    hour: "hour",
    hours: "hour",
    minute: "minute",
    minutes: "minute",
    quarter: "quarter",
    quarters: "quarter",
    second: "second",
    seconds: "second",
    millisecond: "millisecond",
    milliseconds: "millisecond",
    weekday: "weekday",
    weekdays: "weekday",
    weeknumber: "weekNumber",
    weeksnumber: "weekNumber",
    weeknumbers: "weekNumber",
    weekyear: "weekYear",
    weekyears: "weekYear",
    ordinal: "ordinal"
  }[unit.toLowerCase()];
  if (!normalized) throw new InvalidUnitError(unit);
  return normalized;
} // this is a dumbed down version of fromObject() that runs about 60% faster
// but doesn't do any validation, makes a bunch of assumptions about what units
// are present, and so on.


function quickDT(obj, zone) {
  // assume we have the higher-order units
  for (var _iterator = _createForOfIteratorHelperLoose(orderedUnits$1), _step; !(_step = _iterator()).done;) {
    var u = _step.value;

    if (isUndefined(obj[u])) {
      obj[u] = defaultUnitValues[u];
    }
  }

  var invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);

  if (invalid) {
    return DateTime.invalid(invalid);
  }

  var tsNow = Settings.now(),
      offsetProvis = zone.offset(tsNow),
      _objToTS = objToTS(obj, offsetProvis, zone),
      ts = _objToTS[0],
      o = _objToTS[1];

  return new DateTime({
    ts: ts,
    zone: zone,
    o: o
  });
}

function diffRelative(start, end, opts) {
  var round = isUndefined(opts.round) ? true : opts.round,
      format = function format(c, unit) {
    c = roundTo(c, round || opts.calendary ? 0 : 2, true);
    var formatter = end.loc.clone(opts).relFormatter(opts);
    return formatter.format(c, unit);
  },
      differ = function differ(unit) {
    if (opts.calendary) {
      if (!end.hasSame(start, unit)) {
        return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
      } else return 0;
    } else {
      return end.diff(start, unit).get(unit);
    }
  };

  if (opts.unit) {
    return format(differ(opts.unit), opts.unit);
  }

  for (var _iterator2 = _createForOfIteratorHelperLoose(opts.units), _step2; !(_step2 = _iterator2()).done;) {
    var unit = _step2.value;
    var count = differ(unit);

    if (Math.abs(count) >= 1) {
      return format(count, unit);
    }
  }

  return format(0, opts.units[opts.units.length - 1]);
}
/**
 * A DateTime is an immutable data structure representing a specific date and time and accompanying methods. It contains class and instance methods for creating, parsing, interrogating, transforming, and formatting them.
 *
 * A DateTime comprises of:
 * * A timestamp. Each DateTime instance refers to a specific millisecond of the Unix epoch.
 * * A time zone. Each instance is considered in the context of a specific zone (by default the local system's zone).
 * * Configuration properties that effect how output strings are formatted, such as `locale`, `numberingSystem`, and `outputCalendar`.
 *
 * Here is a brief overview of the most commonly used functionality it provides:
 *
 * * **Creation**: To create a DateTime from its components, use one of its factory class methods: {@link local}, {@link utc}, and (most flexibly) {@link fromObject}. To create one from a standard string format, use {@link fromISO}, {@link fromHTTP}, and {@link fromRFC2822}. To create one from a custom string format, use {@link fromFormat}. To create one from a native JS date, use {@link fromJSDate}.
 * * **Gregorian calendar and time**: To examine the Gregorian properties of a DateTime individually (i.e as opposed to collectively through {@link toObject}), use the {@link year}, {@link month},
 * {@link day}, {@link hour}, {@link minute}, {@link second}, {@link millisecond} accessors.
 * * **Week calendar**: For ISO week calendar attributes, see the {@link weekYear}, {@link weekNumber}, and {@link weekday} accessors.
 * * **Configuration** See the {@link locale} and {@link numberingSystem} accessors.
 * * **Transformation**: To transform the DateTime into other DateTimes, use {@link set}, {@link reconfigure}, {@link setZone}, {@link setLocale}, {@link plus}, {@link minus}, {@link endOf}, {@link startOf}, {@link toUTC}, and {@link toLocal}.
 * * **Output**: To convert the DateTime to other representations, use the {@link toRelative}, {@link toRelativeCalendar}, {@link toJSON}, {@link toISO}, {@link toHTTP}, {@link toObject}, {@link toRFC2822}, {@link toString}, {@link toLocaleString}, {@link toFormat}, {@link toMillis} and {@link toJSDate}.
 *
 * There's plenty others documented below. In addition, for more information on subtler topics like internationalization, time zones, alternative calendars, validity, and so on, see the external documentation.
 */


var DateTime = /*#__PURE__*/function () {
  /**
   * @access private
   */
  function DateTime(config) {
    var zone = config.zone || Settings.defaultZone;
    var invalid = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
    /**
     * @access private
     */

    this.ts = isUndefined(config.ts) ? Settings.now() : config.ts;
    var c = null,
        o = null;

    if (!invalid) {
      var unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);

      if (unchanged) {
        var _ref2 = [config.old.c, config.old.o];
        c = _ref2[0];
        o = _ref2[1];
      } else {
        var ot = zone.offset(this.ts);
        c = tsToObj(this.ts, ot);
        invalid = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
        c = invalid ? null : c;
        o = invalid ? null : ot;
      }
    }
    /**
     * @access private
     */


    this._zone = zone;
    /**
     * @access private
     */

    this.loc = config.loc || Locale.create();
    /**
     * @access private
     */

    this.invalid = invalid;
    /**
     * @access private
     */

    this.weekData = null;
    /**
     * @access private
     */

    this.c = c;
    /**
     * @access private
     */

    this.o = o;
    /**
     * @access private
     */

    this.isLuxonDateTime = true;
  } // CONSTRUCT

  /**
   * Create a local DateTime
   * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @example DateTime.local()                            //~> now
   * @example DateTime.local(2017)                        //~> 2017-01-01T00:00:00
   * @example DateTime.local(2017, 3)                     //~> 2017-03-01T00:00:00
   * @example DateTime.local(2017, 3, 12)                 //~> 2017-03-12T00:00:00
   * @example DateTime.local(2017, 3, 12, 5)              //~> 2017-03-12T05:00:00
   * @example DateTime.local(2017, 3, 12, 5, 45)          //~> 2017-03-12T05:45:00
   * @example DateTime.local(2017, 3, 12, 5, 45, 10)      //~> 2017-03-12T05:45:10
   * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765) //~> 2017-03-12T05:45:10.765
   * @return {DateTime}
   */


  DateTime.local = function local(year, month, day, hour, minute, second, millisecond) {
    if (isUndefined(year)) {
      return new DateTime({
        ts: Settings.now()
      });
    } else {
      return quickDT({
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        second: second,
        millisecond: millisecond
      }, Settings.defaultZone);
    }
  }
  /**
   * Create a DateTime in UTC
   * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @example DateTime.utc()                            //~> now
   * @example DateTime.utc(2017)                        //~> 2017-01-01T00:00:00Z
   * @example DateTime.utc(2017, 3)                     //~> 2017-03-01T00:00:00Z
   * @example DateTime.utc(2017, 3, 12)                 //~> 2017-03-12T00:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5)              //~> 2017-03-12T05:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45)          //~> 2017-03-12T05:45:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10)      //~> 2017-03-12T05:45:10Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765) //~> 2017-03-12T05:45:10.765Z
   * @return {DateTime}
   */
  ;

  DateTime.utc = function utc(year, month, day, hour, minute, second, millisecond) {
    if (isUndefined(year)) {
      return new DateTime({
        ts: Settings.now(),
        zone: FixedOffsetZone.utcInstance
      });
    } else {
      return quickDT({
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        second: second,
        millisecond: millisecond
      }, FixedOffsetZone.utcInstance);
    }
  }
  /**
   * Create a DateTime from a Javascript Date object. Uses the default zone.
   * @param {Date} date - a Javascript Date object
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @return {DateTime}
   */
  ;

  DateTime.fromJSDate = function fromJSDate(date, options) {
    if (options === void 0) {
      options = {};
    }

    var ts = isDate(date) ? date.valueOf() : NaN;

    if (Number.isNaN(ts)) {
      return DateTime.invalid("invalid input");
    }

    var zoneToUse = normalizeZone(options.zone, Settings.defaultZone);

    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }

    return new DateTime({
      ts: ts,
      zone: zoneToUse,
      loc: Locale.fromObject(options)
    });
  }
  /**
   * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} milliseconds - a number of milliseconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @return {DateTime}
   */
  ;

  DateTime.fromMillis = function fromMillis(milliseconds, options) {
    if (options === void 0) {
      options = {};
    }

    if (!isNumber(milliseconds)) {
      throw new InvalidArgumentError("fromMillis requires a numerical input, but received a " + typeof milliseconds + " with value " + milliseconds);
    } else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) {
      // this isn't perfect because because we can still end up out of range because of additional shifting, but it's a start
      return DateTime.invalid("Timestamp out of range");
    } else {
      return new DateTime({
        ts: milliseconds,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} seconds - a number of seconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @return {DateTime}
   */
  ;

  DateTime.fromSeconds = function fromSeconds(seconds, options) {
    if (options === void 0) {
      options = {};
    }

    if (!isNumber(seconds)) {
      throw new InvalidArgumentError("fromSeconds requires a numerical input");
    } else {
      return new DateTime({
        ts: seconds * 1000,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a Javascript object with keys like 'year' and 'hour' with reasonable defaults.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.year - a year, such as 1987
   * @param {number} obj.month - a month, 1-12
   * @param {number} obj.day - a day of the month, 1-31, depending on the month
   * @param {number} obj.ordinal - day of the year, 1-365 or 366
   * @param {number} obj.weekYear - an ISO week year
   * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
   * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
   * @param {number} obj.hour - hour of the day, 0-23
   * @param {number} obj.minute - minute of the hour, 0-59
   * @param {number} obj.second - second of the minute, 0-59
   * @param {number} obj.millisecond - millisecond of the second, 0-999
   * @param {string|Zone} [obj.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
   * @param {string} [obj.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} obj.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} obj.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
   * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6, zone: 'utc' }),
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6, zone: 'local' })
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6, zone: 'America/New_York' })
   * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
   * @return {DateTime}
   */
  ;

  DateTime.fromObject = function fromObject(obj) {
    var zoneToUse = normalizeZone(obj.zone, Settings.defaultZone);

    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }

    var tsNow = Settings.now(),
        offsetProvis = zoneToUse.offset(tsNow),
        normalized = normalizeObject(obj, normalizeUnit, ["zone", "locale", "outputCalendar", "numberingSystem"]),
        containsOrdinal = !isUndefined(normalized.ordinal),
        containsGregorYear = !isUndefined(normalized.year),
        containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day),
        containsGregor = containsGregorYear || containsGregorMD,
        definiteWeekDef = normalized.weekYear || normalized.weekNumber,
        loc = Locale.fromObject(obj); // cases:
    // just a weekday -> this week's instance of that weekday, no worries
    // (gregorian data or ordinal) + (weekYear or weekNumber) -> error
    // (gregorian month or day) + ordinal -> error
    // otherwise just use weeks or ordinals or gregorian, depending on what's specified

    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
    }

    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }

    var useWeekData = definiteWeekDef || normalized.weekday && !containsGregor; // configure ourselves to deal with gregorian dates or week stuff

    var units,
        defaultValues,
        objNow = tsToObj(tsNow, offsetProvis);

    if (useWeekData) {
      units = orderedWeekUnits;
      defaultValues = defaultWeekUnitValues;
      objNow = gregorianToWeek(objNow);
    } else if (containsOrdinal) {
      units = orderedOrdinalUnits;
      defaultValues = defaultOrdinalUnitValues;
      objNow = gregorianToOrdinal(objNow);
    } else {
      units = orderedUnits$1;
      defaultValues = defaultUnitValues;
    } // set default values for missing stuff


    var foundFirst = false;

    for (var _iterator3 = _createForOfIteratorHelperLoose(units), _step3; !(_step3 = _iterator3()).done;) {
      var u = _step3.value;
      var v = normalized[u];

      if (!isUndefined(v)) {
        foundFirst = true;
      } else if (foundFirst) {
        normalized[u] = defaultValues[u];
      } else {
        normalized[u] = objNow[u];
      }
    } // make sure the values we have are in range


    var higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized),
        invalid = higherOrderInvalid || hasInvalidTimeData(normalized);

    if (invalid) {
      return DateTime.invalid(invalid);
    } // compute the actual time


    var gregorian = useWeekData ? weekToGregorian(normalized) : containsOrdinal ? ordinalToGregorian(normalized) : normalized,
        _objToTS2 = objToTS(gregorian, offsetProvis, zoneToUse),
        tsFinal = _objToTS2[0],
        offsetFinal = _objToTS2[1],
        inst = new DateTime({
      ts: tsFinal,
      zone: zoneToUse,
      o: offsetFinal,
      loc: loc
    }); // gregorian data + weekday serves only to validate


    if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
      return DateTime.invalid("mismatched weekday", "you can't specify both a weekday of " + normalized.weekday + " and a date of " + inst.toISO());
    }

    return inst;
  }
  /**
   * Create a DateTime from an ISO 8601 string
   * @param {string} text - the ISO string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromISO('2016-05-25T09:08:34.123')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
   * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
   * @example DateTime.fromISO('2016-W05-4')
   * @return {DateTime}
   */
  ;

  DateTime.fromISO = function fromISO(text, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _parseISODate = parseISODate(text),
        vals = _parseISODate[0],
        parsedZone = _parseISODate[1];

    return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
  }
  /**
   * Create a DateTime from an RFC 2822 string
   * @param {string} text - the RFC 2822 string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
   * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
   * @return {DateTime}
   */
  ;

  DateTime.fromRFC2822 = function fromRFC2822(text, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _parseRFC2822Date = parseRFC2822Date(text),
        vals = _parseRFC2822Date[0],
        parsedZone = _parseRFC2822Date[1];

    return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
  }
  /**
   * Create a DateTime from an HTTP header date
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @param {string} text - the HTTP header date
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
   * @return {DateTime}
   */
  ;

  DateTime.fromHTTP = function fromHTTP(text, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _parseHTTPDate = parseHTTPDate(text),
        vals = _parseHTTPDate[0],
        parsedZone = _parseHTTPDate[1];

    return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
  }
  /**
   * Create a DateTime from an input string and format string.
   * Defaults to en-US if no locale has been specified, regardless of the system's locale.
   * @see https://moment.github.io/luxon/docs/manual/parsing.html#table-of-tokens
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @return {DateTime}
   */
  ;

  DateTime.fromFormat = function fromFormat(text, fmt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (isUndefined(text) || isUndefined(fmt)) {
      throw new InvalidArgumentError("fromFormat requires an input string and a format");
    }

    var _opts = opts,
        _opts$locale = _opts.locale,
        locale = _opts$locale === void 0 ? null : _opts$locale,
        _opts$numberingSystem = _opts.numberingSystem,
        numberingSystem = _opts$numberingSystem === void 0 ? null : _opts$numberingSystem,
        localeToUse = Locale.fromOpts({
      locale: locale,
      numberingSystem: numberingSystem,
      defaultToEN: true
    }),
        _parseFromTokens = parseFromTokens(localeToUse, text, fmt),
        vals = _parseFromTokens[0],
        parsedZone = _parseFromTokens[1],
        invalid = _parseFromTokens[2];

    if (invalid) {
      return DateTime.invalid(invalid);
    } else {
      return parseDataToDateTime(vals, parsedZone, opts, "format " + fmt, text);
    }
  }
  /**
   * @deprecated use fromFormat instead
   */
  ;

  DateTime.fromString = function fromString(text, fmt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    return DateTime.fromFormat(text, fmt, opts);
  }
  /**
   * Create a DateTime from a SQL date, time, or datetime
   * Defaults to en-US if no locale has been specified, regardless of the system's locale
   * @param {string} text - the string to parse
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @example DateTime.fromSQL('2017-05-15')
   * @example DateTime.fromSQL('2017-05-15 09:12:34')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
   * @example DateTime.fromSQL('09:12:34.342')
   * @return {DateTime}
   */
  ;

  DateTime.fromSQL = function fromSQL(text, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _parseSQL = parseSQL(text),
        vals = _parseSQL[0],
        parsedZone = _parseSQL[1];

    return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
  }
  /**
   * Create an invalid DateTime.
   * @param {string} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {DateTime}
   */
  ;

  DateTime.invalid = function invalid(reason, explanation) {
    if (explanation === void 0) {
      explanation = null;
    }

    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
    }

    var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

    if (Settings.throwOnInvalid) {
      throw new InvalidDateTimeError(invalid);
    } else {
      return new DateTime({
        invalid: invalid
      });
    }
  }
  /**
   * Check if an object is a DateTime. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  ;

  DateTime.isDateTime = function isDateTime(o) {
    return o && o.isLuxonDateTime || false;
  } // INFO

  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
   * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
   * @return {number}
   */
  ;

  var _proto = DateTime.prototype;

  _proto.get = function get(unit) {
    return this[unit];
  }
  /**
   * Returns whether the DateTime is valid. Invalid DateTimes occur when:
   * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
   * * The DateTime was created by an operation on another invalid date
   * @type {boolean}
   */
  ;

  /**
   * Returns the resolved Intl options for this DateTime.
   * This is useful in understanding the behavior of formatting methods
   * @param {Object} opts - the same options as toLocaleString
   * @return {Object}
   */
  _proto.resolvedLocaleOpts = function resolvedLocaleOpts(opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _Formatter$create$res = Formatter.create(this.loc.clone(opts), opts).resolvedOptions(this),
        locale = _Formatter$create$res.locale,
        numberingSystem = _Formatter$create$res.numberingSystem,
        calendar = _Formatter$create$res.calendar;

    return {
      locale: locale,
      numberingSystem: numberingSystem,
      outputCalendar: calendar
    };
  } // TRANSFORM

  /**
   * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
   *
   * Equivalent to {@link setZone}('utc')
   * @param {number} [offset=0] - optionally, an offset from UTC in minutes
   * @param {Object} [opts={}] - options to pass to `setZone()`
   * @return {DateTime}
   */
  ;

  _proto.toUTC = function toUTC(offset, opts) {
    if (offset === void 0) {
      offset = 0;
    }

    if (opts === void 0) {
      opts = {};
    }

    return this.setZone(FixedOffsetZone.instance(offset), opts);
  }
  /**
   * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
   *
   * Equivalent to `setZone('local')`
   * @return {DateTime}
   */
  ;

  _proto.toLocal = function toLocal() {
    return this.setZone(Settings.defaultZone);
  }
  /**
   * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
   *
   * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link plus}. You may wish to use {@link toLocal} and {@link toUTC} which provide simple convenience wrappers for commonly used zones.
   * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link Zone} class.
   * @param {Object} opts - options
   * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
   * @return {DateTime}
   */
  ;

  _proto.setZone = function setZone(zone, _temp) {
    var _ref3 = _temp === void 0 ? {} : _temp,
        _ref3$keepLocalTime = _ref3.keepLocalTime,
        keepLocalTime = _ref3$keepLocalTime === void 0 ? false : _ref3$keepLocalTime,
        _ref3$keepCalendarTim = _ref3.keepCalendarTime,
        keepCalendarTime = _ref3$keepCalendarTim === void 0 ? false : _ref3$keepCalendarTim;

    zone = normalizeZone(zone, Settings.defaultZone);

    if (zone.equals(this.zone)) {
      return this;
    } else if (!zone.isValid) {
      return DateTime.invalid(unsupportedZone(zone));
    } else {
      var newTS = this.ts;

      if (keepLocalTime || keepCalendarTime) {
        var offsetGuess = zone.offset(this.ts);
        var asObj = this.toObject();

        var _objToTS3 = objToTS(asObj, offsetGuess, zone);

        newTS = _objToTS3[0];
      }

      return clone$1(this, {
        ts: newTS,
        zone: zone
      });
    }
  }
  /**
   * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
   * @param {Object} properties - the properties to set
   * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
   * @return {DateTime}
   */
  ;

  _proto.reconfigure = function reconfigure(_temp2) {
    var _ref4 = _temp2 === void 0 ? {} : _temp2,
        locale = _ref4.locale,
        numberingSystem = _ref4.numberingSystem,
        outputCalendar = _ref4.outputCalendar;

    var loc = this.loc.clone({
      locale: locale,
      numberingSystem: numberingSystem,
      outputCalendar: outputCalendar
    });
    return clone$1(this, {
      loc: loc
    });
  }
  /**
   * "Set" the locale. Returns a newly-constructed DateTime.
   * Just a convenient alias for reconfigure({ locale })
   * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
   * @return {DateTime}
   */
  ;

  _proto.setLocale = function setLocale(locale) {
    return this.reconfigure({
      locale: locale
    });
  }
  /**
   * "Set" the values of specified units. Returns a newly-constructed DateTime.
   * You can only set units with this method; for "setting" metadata, see {@link reconfigure} and {@link setZone}.
   * @param {Object} values - a mapping of units to numbers
   * @example dt.set({ year: 2017 })
   * @example dt.set({ hour: 8, minute: 30 })
   * @example dt.set({ weekday: 5 })
   * @example dt.set({ year: 2005, ordinal: 234 })
   * @return {DateTime}
   */
  ;

  _proto.set = function set(values) {
    if (!this.isValid) return this;
    var normalized = normalizeObject(values, normalizeUnit, []),
        settingWeekStuff = !isUndefined(normalized.weekYear) || !isUndefined(normalized.weekNumber) || !isUndefined(normalized.weekday);
    var mixed;

    if (settingWeekStuff) {
      mixed = weekToGregorian(Object.assign(gregorianToWeek(this.c), normalized));
    } else if (!isUndefined(normalized.ordinal)) {
      mixed = ordinalToGregorian(Object.assign(gregorianToOrdinal(this.c), normalized));
    } else {
      mixed = Object.assign(this.toObject(), normalized); // if we didn't set the day but we ended up on an overflow date,
      // use the last day of the right month

      if (isUndefined(normalized.day)) {
        mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
      }
    }

    var _objToTS4 = objToTS(mixed, this.o, this.zone),
        ts = _objToTS4[0],
        o = _objToTS4[1];

    return clone$1(this, {
      ts: ts,
      o: o
    });
  }
  /**
   * Add a period of time to this DateTime and return the resulting DateTime
   *
   * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @example DateTime.local().plus(123) //~> in 123 milliseconds
   * @example DateTime.local().plus({ minutes: 15 }) //~> in 15 minutes
   * @example DateTime.local().plus({ days: 1 }) //~> this time tomorrow
   * @example DateTime.local().plus({ days: -1 }) //~> this time yesterday
   * @example DateTime.local().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
   * @example DateTime.local().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
   * @return {DateTime}
   */
  ;

  _proto.plus = function plus(duration) {
    if (!this.isValid) return this;
    var dur = friendlyDuration(duration);
    return clone$1(this, adjustTime(this, dur));
  }
  /**
   * Subtract a period of time to this DateTime and return the resulting DateTime
   * See {@link plus}
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   @return {DateTime}
  */
  ;

  _proto.minus = function minus(duration) {
    if (!this.isValid) return this;
    var dur = friendlyDuration(duration).negate();
    return clone$1(this, adjustTime(this, dur));
  }
  /**
   * "Set" this DateTime to the beginning of a unit of time.
   * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
   * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
   * @return {DateTime}
   */
  ;

  _proto.startOf = function startOf(unit) {
    if (!this.isValid) return this;
    var o = {},
        normalizedUnit = Duration.normalizeUnit(unit);

    switch (normalizedUnit) {
      case "years":
        o.month = 1;
      // falls through

      case "quarters":
      case "months":
        o.day = 1;
      // falls through

      case "weeks":
      case "days":
        o.hour = 0;
      // falls through

      case "hours":
        o.minute = 0;
      // falls through

      case "minutes":
        o.second = 0;
      // falls through

      case "seconds":
        o.millisecond = 0;
        break;
      // no default, invalid units throw in normalizeUnit()
    }

    if (normalizedUnit === "weeks") {
      o.weekday = 1;
    }

    if (normalizedUnit === "quarters") {
      var q = Math.ceil(this.month / 3);
      o.month = (q - 1) * 3 + 1;
    }

    return this.set(o);
  }
  /**
   * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
   * @param {string} unit - The unit to go to the end of. Can be 'year', 'month', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
   * @return {DateTime}
   */
  ;

  _proto.endOf = function endOf(unit) {
    var _this$plus;

    return this.isValid ? this.plus((_this$plus = {}, _this$plus[unit] = 1, _this$plus)).startOf(unit).minus(1) : this;
  } // OUTPUT

  /**
   * Returns a string representation of this DateTime formatted according to the specified format string.
   * **You may not want this.** See {@link toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens).
   * Defaults to en-US if no locale has been specified, regardless of the system's locale.
   * @see https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
   * @param {string} fmt - the format string
   * @param {Object} opts - opts to override the configuration options
   * @example DateTime.local().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
   * @example DateTime.local().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
   * @example DateTime.local().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
   * @example DateTime.local().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
   * @return {string}
   */
  ;

  _proto.toFormat = function toFormat(fmt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : INVALID$2;
  }
  /**
   * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
   * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
   * of the DateTime in the assigned locale.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param opts {Object} - Intl.DateTimeFormat constructor options and configuration options
   * @example DateTime.local().toLocaleString(); //=> 4/20/2017
   * @example DateTime.local().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
   * @example DateTime.local().toLocaleString({ locale: 'en-gb' }); //=> '20/04/2017'
   * @example DateTime.local().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
   * @example DateTime.local().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
   * @example DateTime.local().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
   * @example DateTime.local().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
   * @example DateTime.local().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
   * @example DateTime.local().toLocaleString({ hour: '2-digit', minute: '2-digit', hour12: false }); //=> '11:32'
   * @return {string}
   */
  ;

  _proto.toLocaleString = function toLocaleString(opts) {
    if (opts === void 0) {
      opts = DATE_SHORT;
    }

    return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTime(this) : INVALID$2;
  }
  /**
   * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
   * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
   * @example DateTime.local().toLocaleParts(); //=> [
   *                                   //=>   { type: 'day', value: '25' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'month', value: '05' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'year', value: '1982' }
   *                                   //=> ]
   */
  ;

  _proto.toLocaleParts = function toLocaleParts(opts) {
    if (opts === void 0) {
      opts = {};
    }

    return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1982, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
   * @example DateTime.local().toISO() //=> '2017-04-22T20:47:05.335-04:00'
   * @example DateTime.local().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
   * @example DateTime.local().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
   * @return {string}
   */
  ;

  _proto.toISO = function toISO(opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid) {
      return null;
    }

    return this.toISODate(opts) + "T" + this.toISOTime(opts);
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's date component
   * @param {Object} opts - options
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
   * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
   * @return {string}
   */
  ;

  _proto.toISODate = function toISODate(_temp3) {
    var _ref5 = _temp3 === void 0 ? {} : _temp3,
        _ref5$format = _ref5.format,
        format = _ref5$format === void 0 ? "extended" : _ref5$format;

    var fmt = format === "basic" ? "yyyyMMdd" : "yyyy-MM-dd";

    if (this.year > 9999) {
      fmt = "+" + fmt;
    }

    return toTechFormat(this, fmt);
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's week date
   * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
   * @return {string}
   */
  ;

  _proto.toISOWeekDate = function toISOWeekDate() {
    return toTechFormat(this, "kkkk-'W'WW-c");
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's time component
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
   * @return {string}
   */
  ;

  _proto.toISOTime = function toISOTime(_temp4) {
    var _ref6 = _temp4 === void 0 ? {} : _temp4,
        _ref6$suppressMillise = _ref6.suppressMilliseconds,
        suppressMilliseconds = _ref6$suppressMillise === void 0 ? false : _ref6$suppressMillise,
        _ref6$suppressSeconds = _ref6.suppressSeconds,
        suppressSeconds = _ref6$suppressSeconds === void 0 ? false : _ref6$suppressSeconds,
        _ref6$includeOffset = _ref6.includeOffset,
        includeOffset = _ref6$includeOffset === void 0 ? true : _ref6$includeOffset,
        _ref6$format = _ref6.format,
        format = _ref6$format === void 0 ? "extended" : _ref6$format;

    return toTechTimeFormat(this, {
      suppressSeconds: suppressSeconds,
      suppressMilliseconds: suppressMilliseconds,
      includeOffset: includeOffset,
      format: format
    });
  }
  /**
   * Returns an RFC 2822-compatible string representation of this DateTime, always in UTC
   * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
   * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
   * @return {string}
   */
  ;

  _proto.toRFC2822 = function toRFC2822() {
    return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in HTTP headers.
   * Specifically, the string conforms to RFC 1123.
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
   * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
   * @return {string}
   */
  ;

  _proto.toHTTP = function toHTTP() {
    return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Date
   * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
   * @return {string}
   */
  ;

  _proto.toSQLDate = function toSQLDate() {
    return toTechFormat(this, "yyyy-MM-dd");
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Time
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @example DateTime.utc().toSQL() //=> '05:15:16.345'
   * @example DateTime.local().toSQL() //=> '05:15:16.345 -04:00'
   * @example DateTime.local().toSQL({ includeOffset: false }) //=> '05:15:16.345'
   * @example DateTime.local().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
   * @return {string}
   */
  ;

  _proto.toSQLTime = function toSQLTime(_temp5) {
    var _ref7 = _temp5 === void 0 ? {} : _temp5,
        _ref7$includeOffset = _ref7.includeOffset,
        includeOffset = _ref7$includeOffset === void 0 ? true : _ref7$includeOffset,
        _ref7$includeZone = _ref7.includeZone,
        includeZone = _ref7$includeZone === void 0 ? false : _ref7$includeZone;

    return toTechTimeFormat(this, {
      includeOffset: includeOffset,
      includeZone: includeZone,
      spaceZone: true
    });
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
   * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
   * @return {string}
   */
  ;

  _proto.toSQL = function toSQL(opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid) {
      return null;
    }

    return this.toSQLDate() + " " + this.toSQLTime(opts);
  }
  /**
   * Returns a string representation of this DateTime appropriate for debugging
   * @return {string}
   */
  ;

  _proto.toString = function toString() {
    return this.isValid ? this.toISO() : INVALID$2;
  }
  /**
   * Returns the epoch milliseconds of this DateTime. Alias of {@link toMillis}
   * @return {number}
   */
  ;

  _proto.valueOf = function valueOf() {
    return this.toMillis();
  }
  /**
   * Returns the epoch milliseconds of this DateTime.
   * @return {number}
   */
  ;

  _proto.toMillis = function toMillis() {
    return this.isValid ? this.ts : NaN;
  }
  /**
   * Returns the epoch seconds of this DateTime.
   * @return {number}
   */
  ;

  _proto.toSeconds = function toSeconds() {
    return this.isValid ? this.ts / 1000 : NaN;
  }
  /**
   * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
   * @return {string}
   */
  ;

  _proto.toJSON = function toJSON() {
    return this.toISO();
  }
  /**
   * Returns a BSON serializable equivalent to this DateTime.
   * @return {Date}
   */
  ;

  _proto.toBSON = function toBSON() {
    return this.toJSDate();
  }
  /**
   * Returns a Javascript object with this DateTime's year, month, day, and so on.
   * @param opts - options for generating the object
   * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
   * @example DateTime.local().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
   * @return {Object}
   */
  ;

  _proto.toObject = function toObject(opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid) return {};
    var base = Object.assign({}, this.c);

    if (opts.includeConfig) {
      base.outputCalendar = this.outputCalendar;
      base.numberingSystem = this.loc.numberingSystem;
      base.locale = this.loc.locale;
    }

    return base;
  }
  /**
   * Returns a Javascript Date equivalent to this DateTime.
   * @return {Date}
   */
  ;

  _proto.toJSDate = function toJSDate() {
    return new Date(this.isValid ? this.ts : NaN);
  } // COMPARE

  /**
   * Return the difference between two DateTimes as a Duration.
   * @param {DateTime} otherDateTime - the DateTime to compare this one to
   * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example
   * var i1 = DateTime.fromISO('1982-05-25T09:45'),
   *     i2 = DateTime.fromISO('1983-10-14T10:30');
   * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
   * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
   * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
   * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
   * @return {Duration}
   */
  ;

  _proto.diff = function diff(otherDateTime, unit, opts) {
    if (unit === void 0) {
      unit = "milliseconds";
    }

    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid || !otherDateTime.isValid) {
      return Duration.invalid(this.invalid || otherDateTime.invalid, "created by diffing an invalid DateTime");
    }

    var durOpts = Object.assign({
      locale: this.locale,
      numberingSystem: this.numberingSystem
    }, opts);

    var units = maybeArray(unit).map(Duration.normalizeUnit),
        otherIsLater = otherDateTime.valueOf() > this.valueOf(),
        earlier = otherIsLater ? this : otherDateTime,
        later = otherIsLater ? otherDateTime : this,
        diffed = _diff(earlier, later, units, durOpts);

    return otherIsLater ? diffed.negate() : diffed;
  }
  /**
   * Return the difference between this DateTime and right now.
   * See {@link diff}
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  ;

  _proto.diffNow = function diffNow(unit, opts) {
    if (unit === void 0) {
      unit = "milliseconds";
    }

    if (opts === void 0) {
      opts = {};
    }

    return this.diff(DateTime.local(), unit, opts);
  }
  /**
   * Return an Interval spanning between this DateTime and another DateTime
   * @param {DateTime} otherDateTime - the other end point of the Interval
   * @return {Interval}
   */
  ;

  _proto.until = function until(otherDateTime) {
    return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
  }
  /**
   * Return whether this DateTime is in the same unit of time as another DateTime
   * @param {DateTime} otherDateTime - the other DateTime
   * @param {string} unit - the unit of time to check sameness on
   * @example DateTime.local().hasSame(otherDT, 'day'); //~> true if both the same calendar day
   * @return {boolean}
   */
  ;

  _proto.hasSame = function hasSame(otherDateTime, unit) {
    if (!this.isValid) return false;

    if (unit === "millisecond") {
      return this.valueOf() === otherDateTime.valueOf();
    } else {
      var inputMs = otherDateTime.valueOf();
      return this.startOf(unit) <= inputMs && inputMs <= this.endOf(unit);
    }
  }
  /**
   * Equality check
   * Two DateTimes are equal iff they represent the same millisecond, have the same zone and location, and are both valid.
   * To compare just the millisecond values, use `+dt1 === +dt2`.
   * @param {DateTime} other - the other DateTime
   * @return {boolean}
   */
  ;

  _proto.equals = function equals(other) {
    return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
  }
  /**
   * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
   * platform supports Intl.RelativeTimeFormat. Rounds down by default.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.local()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
   * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
   * @param {boolean} [options.round=true] - whether to round the numbers in the output.
   * @param {boolean} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.local().plus({ days: 1 }).toRelative() //=> "in 1 day"
   * @example DateTime.local().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
   * @example DateTime.local().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
   * @example DateTime.local().minus({ days: 2 }).toRelative() //=> "2 days ago"
   * @example DateTime.local().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
   * @example DateTime.local().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
   */
  ;

  _proto.toRelative = function toRelative(options) {
    if (options === void 0) {
      options = {};
    }

    if (!this.isValid) return null;
    var base = options.base || DateTime.fromObject({
      zone: this.zone
    }),
        padding = options.padding ? this < base ? -options.padding : options.padding : 0;
    return diffRelative(base, this.plus(padding), Object.assign(options, {
      numeric: "always",
      units: ["years", "months", "days", "hours", "minutes", "seconds"]
    }));
  }
  /**
   * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
   * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.local()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.local().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
   * @example DateTime.local().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
   * @example DateTime.local().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
   * @example DateTime.local().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
   */
  ;

  _proto.toRelativeCalendar = function toRelativeCalendar(options) {
    if (options === void 0) {
      options = {};
    }

    if (!this.isValid) return null;
    return diffRelative(options.base || DateTime.fromObject({
      zone: this.zone
    }), this, Object.assign(options, {
      numeric: "auto",
      units: ["years", "months", "days"],
      calendary: true
    }));
  }
  /**
   * Return the min of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
   * @return {DateTime} the min DateTime, or undefined if called with no argument
   */
  ;

  DateTime.min = function min() {
    for (var _len = arguments.length, dateTimes = new Array(_len), _key = 0; _key < _len; _key++) {
      dateTimes[_key] = arguments[_key];
    }

    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("min requires all arguments be DateTimes");
    }

    return bestBy(dateTimes, function (i) {
      return i.valueOf();
    }, Math.min);
  }
  /**
   * Return the max of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
   * @return {DateTime} the max DateTime, or undefined if called with no argument
   */
  ;

  DateTime.max = function max() {
    for (var _len2 = arguments.length, dateTimes = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      dateTimes[_key2] = arguments[_key2];
    }

    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("max requires all arguments be DateTimes");
    }

    return bestBy(dateTimes, function (i) {
      return i.valueOf();
    }, Math.max);
  } // MISC

  /**
   * Explain how a string would be parsed by fromFormat()
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see description)
   * @param {Object} options - options taken by fromFormat()
   * @return {Object}
   */
  ;

  DateTime.fromFormatExplain = function fromFormatExplain(text, fmt, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        _options$locale = _options.locale,
        locale = _options$locale === void 0 ? null : _options$locale,
        _options$numberingSys = _options.numberingSystem,
        numberingSystem = _options$numberingSys === void 0 ? null : _options$numberingSys,
        localeToUse = Locale.fromOpts({
      locale: locale,
      numberingSystem: numberingSystem,
      defaultToEN: true
    });
    return explainFromTokens(localeToUse, text, fmt);
  }
  /**
   * @deprecated use fromFormatExplain instead
   */
  ;

  DateTime.fromStringExplain = function fromStringExplain(text, fmt, options) {
    if (options === void 0) {
      options = {};
    }

    return DateTime.fromFormatExplain(text, fmt, options);
  } // FORMAT PRESETS

  /**
   * {@link toLocaleString} format like 10/14/1983
   * @type {Object}
   */
  ;

  _createClass(DateTime, [{
    key: "isValid",
    get: function get() {
      return this.invalid === null;
    }
    /**
     * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
     * @type {string}
     */

  }, {
    key: "invalidReason",
    get: function get() {
      return this.invalid ? this.invalid.reason : null;
    }
    /**
     * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
     * @type {string}
     */

  }, {
    key: "invalidExplanation",
    get: function get() {
      return this.invalid ? this.invalid.explanation : null;
    }
    /**
     * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
     *
     * @type {string}
     */

  }, {
    key: "locale",
    get: function get() {
      return this.isValid ? this.loc.locale : null;
    }
    /**
     * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
     *
     * @type {string}
     */

  }, {
    key: "numberingSystem",
    get: function get() {
      return this.isValid ? this.loc.numberingSystem : null;
    }
    /**
     * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
     *
     * @type {string}
     */

  }, {
    key: "outputCalendar",
    get: function get() {
      return this.isValid ? this.loc.outputCalendar : null;
    }
    /**
     * Get the time zone associated with this DateTime.
     * @type {Zone}
     */

  }, {
    key: "zone",
    get: function get() {
      return this._zone;
    }
    /**
     * Get the name of the time zone.
     * @type {string}
     */

  }, {
    key: "zoneName",
    get: function get() {
      return this.isValid ? this.zone.name : null;
    }
    /**
     * Get the year
     * @example DateTime.local(2017, 5, 25).year //=> 2017
     * @type {number}
     */

  }, {
    key: "year",
    get: function get() {
      return this.isValid ? this.c.year : NaN;
    }
    /**
     * Get the quarter
     * @example DateTime.local(2017, 5, 25).quarter //=> 2
     * @type {number}
     */

  }, {
    key: "quarter",
    get: function get() {
      return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
    }
    /**
     * Get the month (1-12).
     * @example DateTime.local(2017, 5, 25).month //=> 5
     * @type {number}
     */

  }, {
    key: "month",
    get: function get() {
      return this.isValid ? this.c.month : NaN;
    }
    /**
     * Get the day of the month (1-30ish).
     * @example DateTime.local(2017, 5, 25).day //=> 25
     * @type {number}
     */

  }, {
    key: "day",
    get: function get() {
      return this.isValid ? this.c.day : NaN;
    }
    /**
     * Get the hour of the day (0-23).
     * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
     * @type {number}
     */

  }, {
    key: "hour",
    get: function get() {
      return this.isValid ? this.c.hour : NaN;
    }
    /**
     * Get the minute of the hour (0-59).
     * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
     * @type {number}
     */

  }, {
    key: "minute",
    get: function get() {
      return this.isValid ? this.c.minute : NaN;
    }
    /**
     * Get the second of the minute (0-59).
     * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
     * @type {number}
     */

  }, {
    key: "second",
    get: function get() {
      return this.isValid ? this.c.second : NaN;
    }
    /**
     * Get the millisecond of the second (0-999).
     * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
     * @type {number}
     */

  }, {
    key: "millisecond",
    get: function get() {
      return this.isValid ? this.c.millisecond : NaN;
    }
    /**
     * Get the week year
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2014, 11, 31).weekYear //=> 2015
     * @type {number}
     */

  }, {
    key: "weekYear",
    get: function get() {
      return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
    }
    /**
     * Get the week number of the week year (1-52ish).
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
     * @type {number}
     */

  }, {
    key: "weekNumber",
    get: function get() {
      return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
    }
    /**
     * Get the day of the week.
     * 1 is Monday and 7 is Sunday
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2014, 11, 31).weekday //=> 4
     * @type {number}
     */

  }, {
    key: "weekday",
    get: function get() {
      return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
    }
    /**
     * Get the ordinal (meaning the day of the year)
     * @example DateTime.local(2017, 5, 25).ordinal //=> 145
     * @type {number|DateTime}
     */

  }, {
    key: "ordinal",
    get: function get() {
      return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
    }
    /**
     * Get the human readable short month name, such as 'Oct'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
     * @type {string}
     */

  }, {
    key: "monthShort",
    get: function get() {
      return this.isValid ? Info.months("short", {
        locale: this.locale
      })[this.month - 1] : null;
    }
    /**
     * Get the human readable long month name, such as 'October'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).monthLong //=> October
     * @type {string}
     */

  }, {
    key: "monthLong",
    get: function get() {
      return this.isValid ? Info.months("long", {
        locale: this.locale
      })[this.month - 1] : null;
    }
    /**
     * Get the human readable short weekday, such as 'Mon'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
     * @type {string}
     */

  }, {
    key: "weekdayShort",
    get: function get() {
      return this.isValid ? Info.weekdays("short", {
        locale: this.locale
      })[this.weekday - 1] : null;
    }
    /**
     * Get the human readable long weekday, such as 'Monday'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
     * @type {string}
     */

  }, {
    key: "weekdayLong",
    get: function get() {
      return this.isValid ? Info.weekdays("long", {
        locale: this.locale
      })[this.weekday - 1] : null;
    }
    /**
     * Get the UTC offset of this DateTime in minutes
     * @example DateTime.local().offset //=> -240
     * @example DateTime.utc().offset //=> 0
     * @type {number}
     */

  }, {
    key: "offset",
    get: function get() {
      return this.isValid ? +this.o : NaN;
    }
    /**
     * Get the short human name for the zone's current offset, for example "EST" or "EDT".
     * Defaults to the system's locale if no locale has been specified
     * @type {string}
     */

  }, {
    key: "offsetNameShort",
    get: function get() {
      if (this.isValid) {
        return this.zone.offsetName(this.ts, {
          format: "short",
          locale: this.locale
        });
      } else {
        return null;
      }
    }
    /**
     * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
     * Defaults to the system's locale if no locale has been specified
     * @type {string}
     */

  }, {
    key: "offsetNameLong",
    get: function get() {
      if (this.isValid) {
        return this.zone.offsetName(this.ts, {
          format: "long",
          locale: this.locale
        });
      } else {
        return null;
      }
    }
    /**
     * Get whether this zone's offset ever changes, as in a DST.
     * @type {boolean}
     */

  }, {
    key: "isOffsetFixed",
    get: function get() {
      return this.isValid ? this.zone.universal : null;
    }
    /**
     * Get whether the DateTime is in a DST.
     * @type {boolean}
     */

  }, {
    key: "isInDST",
    get: function get() {
      if (this.isOffsetFixed) {
        return false;
      } else {
        return this.offset > this.set({
          month: 1
        }).offset || this.offset > this.set({
          month: 5
        }).offset;
      }
    }
    /**
     * Returns true if this DateTime is in a leap year, false otherwise
     * @example DateTime.local(2016).isInLeapYear //=> true
     * @example DateTime.local(2013).isInLeapYear //=> false
     * @type {boolean}
     */

  }, {
    key: "isInLeapYear",
    get: function get() {
      return isLeapYear(this.year);
    }
    /**
     * Returns the number of days in this DateTime's month
     * @example DateTime.local(2016, 2).daysInMonth //=> 29
     * @example DateTime.local(2016, 3).daysInMonth //=> 31
     * @type {number}
     */

  }, {
    key: "daysInMonth",
    get: function get() {
      return daysInMonth(this.year, this.month);
    }
    /**
     * Returns the number of days in this DateTime's year
     * @example DateTime.local(2016).daysInYear //=> 366
     * @example DateTime.local(2013).daysInYear //=> 365
     * @type {number}
     */

  }, {
    key: "daysInYear",
    get: function get() {
      return this.isValid ? daysInYear(this.year) : NaN;
    }
    /**
     * Returns the number of weeks in this DateTime's year
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2004).weeksInWeekYear //=> 53
     * @example DateTime.local(2013).weeksInWeekYear //=> 52
     * @type {number}
     */

  }, {
    key: "weeksInWeekYear",
    get: function get() {
      return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
    }
  }], [{
    key: "DATE_SHORT",
    get: function get() {
      return DATE_SHORT;
    }
    /**
     * {@link toLocaleString} format like 'Oct 14, 1983'
     * @type {Object}
     */

  }, {
    key: "DATE_MED",
    get: function get() {
      return DATE_MED;
    }
    /**
     * {@link toLocaleString} format like 'Fri, Oct 14, 1983'
     * @type {Object}
     */

  }, {
    key: "DATE_MED_WITH_WEEKDAY",
    get: function get() {
      return DATE_MED_WITH_WEEKDAY;
    }
    /**
     * {@link toLocaleString} format like 'October 14, 1983'
     * @type {Object}
     */

  }, {
    key: "DATE_FULL",
    get: function get() {
      return DATE_FULL;
    }
    /**
     * {@link toLocaleString} format like 'Tuesday, October 14, 1983'
     * @type {Object}
     */

  }, {
    key: "DATE_HUGE",
    get: function get() {
      return DATE_HUGE;
    }
    /**
     * {@link toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "TIME_SIMPLE",
    get: function get() {
      return TIME_SIMPLE;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "TIME_WITH_SECONDS",
    get: function get() {
      return TIME_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "TIME_WITH_SHORT_OFFSET",
    get: function get() {
      return TIME_WITH_SHORT_OFFSET;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "TIME_WITH_LONG_OFFSET",
    get: function get() {
      return TIME_WITH_LONG_OFFSET;
    }
    /**
     * {@link toLocaleString} format like '09:30', always 24-hour.
     * @type {Object}
     */

  }, {
    key: "TIME_24_SIMPLE",
    get: function get() {
      return TIME_24_SIMPLE;
    }
    /**
     * {@link toLocaleString} format like '09:30:23', always 24-hour.
     * @type {Object}
     */

  }, {
    key: "TIME_24_WITH_SECONDS",
    get: function get() {
      return TIME_24_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 EDT', always 24-hour.
     * @type {Object}
     */

  }, {
    key: "TIME_24_WITH_SHORT_OFFSET",
    get: function get() {
      return TIME_24_WITH_SHORT_OFFSET;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
     * @type {Object}
     */

  }, {
    key: "TIME_24_WITH_LONG_OFFSET",
    get: function get() {
      return TIME_24_WITH_LONG_OFFSET;
    }
    /**
     * {@link toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_SHORT",
    get: function get() {
      return DATETIME_SHORT;
    }
    /**
     * {@link toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_SHORT_WITH_SECONDS",
    get: function get() {
      return DATETIME_SHORT_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_MED",
    get: function get() {
      return DATETIME_MED;
    }
    /**
     * {@link toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_MED_WITH_SECONDS",
    get: function get() {
      return DATETIME_MED_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_MED_WITH_WEEKDAY",
    get: function get() {
      return DATETIME_MED_WITH_WEEKDAY;
    }
    /**
     * {@link toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_FULL",
    get: function get() {
      return DATETIME_FULL;
    }
    /**
     * {@link toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_FULL_WITH_SECONDS",
    get: function get() {
      return DATETIME_FULL_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_HUGE",
    get: function get() {
      return DATETIME_HUGE;
    }
    /**
     * {@link toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_HUGE_WITH_SECONDS",
    get: function get() {
      return DATETIME_HUGE_WITH_SECONDS;
    }
  }]);

  return DateTime;
}();
function friendlyDateTime(dateTimeish) {
  if (DateTime.isDateTime(dateTimeish)) {
    return dateTimeish;
  } else if (dateTimeish && dateTimeish.valueOf && isNumber(dateTimeish.valueOf())) {
    return DateTime.fromJSDate(dateTimeish);
  } else if (dateTimeish && typeof dateTimeish === "object") {
    return DateTime.fromObject(dateTimeish);
  } else {
    throw new InvalidArgumentError("Unknown datetime argument: " + dateTimeish + ", of type " + typeof dateTimeish);
  }
}

exports.DateTime = DateTime;
exports.Duration = Duration;
exports.FixedOffsetZone = FixedOffsetZone;
exports.IANAZone = IANAZone;
exports.Info = Info;
exports.Interval = Interval;
exports.InvalidZone = InvalidZone;
exports.LocalZone = LocalZone;
exports.Settings = Settings;
exports.Zone = Zone;
//# sourceMappingURL=luxon.js.map


/***/ }),

/***/ "./src/js/cookies.ts":
/*!***************************!*
  !*** ./src/js/cookies.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getMaximumCustomersCookie": () => /* binding */ getMaximumCustomersCookie,
/* harmony export */   "getWarningRangeCookie": () => /* binding */ getWarningRangeCookie,
/* harmony export */   "getEmailCookie": () => /* binding */ getEmailCookie
/* harmony export */ });
/* harmony import */ var _graph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./graph */ "./src/js/graph.ts");

var maximumCustomers = document.getElementById("maximumCustomersInput");
var warningRange = document.getElementById("warningRangeInput");
var email = document.getElementById("emailInput");
var maximumCustomersValue = maximumCustomers.value;
var warningRangeValue = warningRange.value;
var emailValue = email.value;
var setCookieButton = document.getElementById("setCookieButton");
setCookieButton.addEventListener("click", setCookie);
var getCookieButton = document.getElementById("getCookieButton");
getCookieButton.addEventListener("click", getCookie);
var clearTextBoxesButton = document.getElementById("clearTextBoxesButton");
clearTextBoxesButton.addEventListener("click", clearTextBoxes);
var deleteCookiesButtonSettings = document.getElementById("deleteCookiesButtonSettings");
deleteCookiesButtonSettings.addEventListener("click", deleteCookies);
var deleteCookiesButtonOverlay = document.getElementById("deleteCookiesButtonOverlay");
deleteCookiesButtonOverlay.addEventListener("click", deleteCookies);
//  Cookies
function setCookie() {
    setAnyCookie("maximumCustomers", maximumCustomers.value);
    setAnyCookie("warningRange", warningRange.value);
    setAnyCookie("email", email.value);
    alert("Settings saved succesfully.");
    (0,_graph__WEBPACK_IMPORTED_MODULE_0__.default)();
}
function setAnyCookie(cookieName, cookieValue) {
    var d = new Date();
    d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    var cookieString = cookieName + "=" + cookieValue;
    document.cookie = cookieString + ";" + expires + ";path=/";
}
function getCookie() {
    alert(document.cookie);
}
function getMaximumCustomersCookie() {
    var name = "maximumCustomers=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function getWarningRangeCookie() {
    var name = "warningRange=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function getEmailCookie() {
    var name = "email=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function clearTextBoxes() {
    maximumCustomers.value = "";
    warningRange.value = "";
    email.value = "";
}
function deleteCookies() {
    document.cookie = "maximumCustomers= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "warningRange= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "email= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    alert("Settings cleared succesfully.");
    (0,_graph__WEBPACK_IMPORTED_MODULE_0__.default)();
}
// collapsible start
var coll = document.getElementsByClassName("collapsible");
var i;
for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        }
        else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}
// collapsible end
// console.log(maximumCustomersValue);
// console.log(warningRangeValue);
// console.log(emailValue);
var saveSettingsButton = document.getElementById("saveSettingsButton");
//saveSettingsButton.addEventListener("click", SaveSettings);
var maximumCustomersContent = document.getElementById("maximumCustomersContent");
var warningRangeContent = document.getElementById("warningRangeContent");
var emailContent = document.getElementById("emailContent");
// Check if Warning Range is smaller than Maximum Customers
function WarningRangeLimit() {
    var maximumCustomersValue = +maximumCustomers.value;
    warningRange.setAttribute("max", (maximumCustomersValue - 1).toString());
}
maximumCustomers.onchange = warningRange.onchange = WarningRangeLimit;


/***/ }),

/***/ "./src/js/graph.ts":
/*!*************************!*
  !*** ./src/js/graph.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ createAreaChart,
/* harmony export */   "createHistogramChart": () => /* binding */ createHistogramChart
/* harmony export */ });
/* harmony import */ var _cookies__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cookies */ "./src/js/cookies.ts");


var Highcharts = __webpack_require__(/*! highcharts */ "./node_modules/highcharts/highcharts.js");
// Load module after Highcharts is loaded
__webpack_require__(/*! highcharts/modules/exporting */ "./node_modules/highcharts/modules/exporting.js")(Highcharts);
__webpack_require__(/*! highcharts/modules/data */ "./node_modules/highcharts/modules/data.js")(Highcharts);
var pollingCheckbox = document.getElementById('enablePolling');
var pollingInput = document.getElementById('pollingTime');
document.addEventListener('DOMContentLoaded', createAreaChart);
Highcharts.setOptions({
    time: {
        timezoneOffset: 1 * 60
    }
});
function createAreaChart() {
    var chart = Highcharts.chart('AreaContainer', {
        chart: {
            type: 'area',
            zoomType: 'x'
        },
        title: {
            text: 'Occupancy'
        },
        xAxis: {
            title: {
                text: 'Time'
            },
        },
        yAxis: {
            title: {
                text: 'Occupancy'
            },
            plotLines: [{
                    value: +(0,_cookies__WEBPACK_IMPORTED_MODULE_0__.getMaximumCustomersCookie)(),
                    color: 'black',
                    width: 1,
                    zIndex: 3,
                    label: {
                        text: 'Maximum Customers',
                        align: 'center',
                        x: -60,
                        style: {
                            color: 'black'
                        }
                    }
                },
                {
                    value: +(0,_cookies__WEBPACK_IMPORTED_MODULE_0__.getMaximumCustomersCookie)() - (+(0,_cookies__WEBPACK_IMPORTED_MODULE_0__.getWarningRangeCookie)()),
                    color: 'red',
                    width: 1,
                    dashStyle: 'dash',
                    zIndex: 4,
                    label: {
                        text: 'Warning limit',
                        align: 'center',
                        x: 60,
                        style: {
                            color: 'red'
                        }
                    }
                }
            ],
            plotBands: [{
                    from: +(0,_cookies__WEBPACK_IMPORTED_MODULE_0__.getMaximumCustomersCookie)(),
                    to: +(0,_cookies__WEBPACK_IMPORTED_MODULE_0__.getMaximumCustomersCookie)() - (+(0,_cookies__WEBPACK_IMPORTED_MODULE_0__.getWarningRangeCookie)()),
                    color: 'rgba(255, 255, 0, 0.2)',
                    width: 1
                }]
        },
        // subtitle: {
        //   text: 'Data input from a remote JSON file'
        // },
        legend: {
            enabled: false
        },
        data: {
            rowsURL: jsonGraphUrl,
            firstRowAsNames: false,
            enablePolling: pollingCheckbox.checked === true,
            dataRefreshRate: validatePollingInput()
        }
    });
}
function validatePollingInput() {
    if (+pollingInput.value < 5 || !+pollingInput.value) {
        pollingInput.value = "5";
    }
    return parseInt(pollingInput.value, 10);
}
// We recreate instead of using chart update to make sure the loaded CSV
// and such is completely gone.
pollingCheckbox.onchange = pollingInput.onchange = createAreaChart;
function createHistogramChart() {
    var chart = Highcharts.chart('HistogramContainer', {
        chart: {
            type: 'column',
            zoomType: 'x'
        },
        title: {
            text: 'Daily Customers'
        },
        xAxis: {
            title: {
                text: 'Date'
            },
            type: 'datetime',
            // Use the date format in the 
            // labels property of the chart 
            labels: {
                formatter: function () {
                    return Highcharts.dateFormat('%A<br>%b %e ', this.value);
                }
            }
        },
        yAxis: {
            title: {
                text: 'Total Customers'
            },
        },
        // subtitle: {
        //   text: 'Data input from a remote JSON file'
        // },
        legend: {
            enabled: false
        },
        data: {
            rowsURL: lastWeekEntranceJsonStringUrl,
            firstRowAsNames: false,
            enablePolling: pollingCheckbox.checked === true,
            dataRefreshRate: validatePollingInput()
        },
        tooltip: {
            headerFormat: '{point.x:%A, %b %e, %Y} <br>',
            pointFormat: '<b>{point.y}</b> people entered',
            shared: true
        },
    });
}
var lastWeekEntranceJsonStringUrl = "https://counttrackulawebapi.azurewebsites.net/api/DoorsTracking/GetLastWeekEntranceToJson";
// Create the chart
createAreaChart();
createHistogramChart();
// Graphs buttons
var todayJsonStringUrl = "https://counttrackulawebapi.azurewebsites.net/api/DoorsTracking/GetTodayToJson";
var lastWeekJsonStringUrl = "https://counttrackulawebapi.azurewebsites.net/api/DoorsTracking/GetLastWeekToJson";
var lastMonthJsonStringUrl = "https://counttrackulawebapi.azurewebsites.net/api/DoorsTracking/GetLastMonthToJson";
var allJsonStringUrl = "https://counttrackulawebapi.azurewebsites.net/api/DoorsTracking/GetAllToJson";
var jsonGraphUrl = todayJsonStringUrl;
var GetAllToJsonButton = document.getElementById("GetAllToJsonButton");
var GetLastMonthToJsonButton = document.getElementById("GetLastMonthToJsonButton");
var GetLastWeekToJsonButton = document.getElementById("GetLastWeekToJsonButton");
var GetTodayToJsonButton = document.getElementById("GetTodayToJsonButton");
GetAllToJsonButton.addEventListener("click", function () { jsonGraphUrl = allJsonStringUrl; createAreaChart(); });
GetLastMonthToJsonButton.addEventListener("click", function () { jsonGraphUrl = lastMonthJsonStringUrl; createAreaChart(); });
GetLastWeekToJsonButton.addEventListener("click", function () { jsonGraphUrl = lastWeekJsonStringUrl; createAreaChart(); });
GetTodayToJsonButton.addEventListener("click", function () { jsonGraphUrl = todayJsonStringUrl; createAreaChart(); });
var btns = document.getElementsByClassName("graphButtons");
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
    });
}


/***/ }),

/***/ "./src/js/index.ts":
/*!*************************!*
  !*** ./src/js/index.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_axios_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/axios/index */ "./node_modules/axios/index.js");
/* harmony import */ var _node_modules_axios_index__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_axios_index__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _cookies__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./cookies */ "./src/js/cookies.ts");
/* harmony import */ var _weather__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./weather */ "./src/js/weather.ts");





var doorTrackingWebUrl = "https://counttrackulawebapi.azurewebsites.net/api/DoorsTracking";
var getLastContent = document.getElementById("Occupancy");
setInterval(function GetCurrentOccupancy() {
    _node_modules_axios_index__WEBPACK_IMPORTED_MODULE_0___default().get(doorTrackingWebUrl + "/GetCurrentOccupancyValue")
        .then(function (AxiosResponse) {
        //console.log("AxiosResponse: ",AxiosResponse);
        //console.log("Status Code: ",AxiosResponse.status);
        getLastContent.innerHTML = AxiosResponse.data.toString();
        if ((0,_cookies__WEBPACK_IMPORTED_MODULE_1__.getMaximumCustomersCookie)() != "") {
            if (AxiosResponse.data >= +(0,_cookies__WEBPACK_IMPORTED_MODULE_1__.getMaximumCustomersCookie)() - (+(0,_cookies__WEBPACK_IMPORTED_MODULE_1__.getWarningRangeCookie)())) {
                overlayOn();
                SendWarningEmail();
            }
        }
    })
        .catch(function (error) {
        console.log(error);
        var errorMessage = "Error Code: " + error.response.status;
        console.log(errorMessage);
    });
}, 3000); //run  every 3 seconds
// Overlay
function overlayOn() {
    document.getElementById("overlay").style.display = "block";
}
function overlayOff() {
    document.getElementById("overlay").style.display = "none";
}
var overlayButton = document.getElementById("overlayButton");
overlayButton.addEventListener("click", overlayOn);
var overlay = document.getElementById("overlay");
overlay.addEventListener("click", overlayOff);
// GRAPHS PAGE
// Use Weather API
(0,_weather__WEBPACK_IMPORTED_MODULE_2__.default)();
// NODEMAILER 
var sendEmailButton = document.getElementById("sendEmailButton");
sendEmailButton.addEventListener("click", SendWarningEmail);
function SendWarningEmail() {
    var email = (0,_cookies__WEBPACK_IMPORTED_MODULE_1__.getEmailCookie)().toString();
    _node_modules_axios_index__WEBPACK_IMPORTED_MODULE_0___default().post(doorTrackingWebUrl + "/WarningEmail", "\"" + email + "\"", {
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        }
    })
        .then(function (AxiosResponse) {
        console.log("AxiosResponse: ", AxiosResponse);
        console.log("Status Code: ", AxiosResponse.status);
    })
        .catch(function (error) {
        console.log(error);
        var errorMessage = "Error Code: " + error.response.status;
        console.log(errorMessage);
    });
}


/***/ }),

/***/ "./src/js/weather.ts":
/*!***************************!*
  !*** ./src/js/weather.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ getWeatherWidget
/* harmony export */ });
/* harmony import */ var _node_modules_axios_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/axios/index */ "./node_modules/axios/index.js");
/* harmony import */ var _node_modules_axios_index__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_axios_index__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var luxon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! luxon */ "./node_modules/luxon/build/cjs-browser/luxon.js");


var city = "copenhagen";
var apikey = "7610a348061b41ee3454732884890eda";
var units = "metric";
var lat = "55.6709184";
var lon = "12.5599191";
var exclude = "minutely,hourly";
function getWeatherWidget() {
    _node_modules_axios_index__WEBPACK_IMPORTED_MODULE_0___default().get("https://api.openweathermap.org/data/2.5/onecall" + "?lat=" + lat + "&lon=" + lon + "&exclude=" + exclude + "&appid=" + apikey + "&units=" + units)
        .then(function (AxiosResponse) {
        //console.log("AxiosResponse: ", AxiosResponse);
        //console.log("Status Code: ", AxiosResponse.status);
        // This needs refactoring!!!!!
        // Load Temps
        document.getElementById('currentTemp').innerHTML = AxiosResponse.data.current.temp.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMaxTempDay1').innerHTML = "Max: " + AxiosResponse.data.daily[0].temp.max.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMinTempDay1').innerHTML = "Min: " + AxiosResponse.data.daily[0].temp.min.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMaxTempDay2').innerHTML = "Max: " + AxiosResponse.data.daily[1].temp.max.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMinTempDay2').innerHTML = "Min: " + AxiosResponse.data.daily[1].temp.min.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMaxTempDay3').innerHTML = "Max: " + AxiosResponse.data.daily[2].temp.max.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMinTempDay3').innerHTML = "Min: " + AxiosResponse.data.daily[2].temp.min.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMaxTempDay4').innerHTML = "Max: " + AxiosResponse.data.daily[3].temp.max.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMinTempDay4').innerHTML = "Min: " + AxiosResponse.data.daily[3].temp.min.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMaxTempDay5').innerHTML = "Max: " + AxiosResponse.data.daily[4].temp.max.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMinTempDay5').innerHTML = "Min: " + AxiosResponse.data.daily[4].temp.min.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMaxTempDay6').innerHTML = "Max: " + AxiosResponse.data.daily[5].temp.max.toString().slice(0, -3) + "°C";
        document.getElementById('forecastMinTempDay6').innerHTML = "Min: " + AxiosResponse.data.daily[5].temp.min.toString().slice(0, -3) + "°C";
        // Load Current Weather name
        document.getElementById('currentWeather').innerHTML = AxiosResponse.data.current.weather[0].main;
        // Load Weather icons
        document.getElementById('currentWeatherIcon').setAttribute("src", "http://openweathermap.org/img/wn/" + AxiosResponse.data.current.weather[0].icon + "@2x.png");
        document.getElementById('forecastWeatherIconDay1').setAttribute("src", "http://openweathermap.org/img/wn/" + AxiosResponse.data.daily[0].weather[0].icon + ".png");
        document.getElementById('forecastWeatherIconDay2').setAttribute("src", "http://openweathermap.org/img/wn/" + AxiosResponse.data.daily[1].weather[0].icon + ".png");
        document.getElementById('forecastWeatherIconDay3').setAttribute("src", "http://openweathermap.org/img/wn/" + AxiosResponse.data.daily[2].weather[0].icon + ".png");
        document.getElementById('forecastWeatherIconDay4').setAttribute("src", "http://openweathermap.org/img/wn/" + AxiosResponse.data.daily[3].weather[0].icon + ".png");
        document.getElementById('forecastWeatherIconDay5').setAttribute("src", "http://openweathermap.org/img/wn/" + AxiosResponse.data.daily[4].weather[0].icon + ".png");
        document.getElementById('forecastWeatherIconDay6').setAttribute("src", "http://openweathermap.org/img/wn/" + AxiosResponse.data.daily[5].weather[0].icon + ".png");
        // Load Days
        document.getElementById('forecastDay1').innerHTML = luxon__WEBPACK_IMPORTED_MODULE_1__.DateTime.fromSeconds(AxiosResponse.data.daily[0].dt).weekdayLong.toString();
        document.getElementById('forecastDay2').innerHTML = luxon__WEBPACK_IMPORTED_MODULE_1__.DateTime.fromSeconds(AxiosResponse.data.daily[1].dt).weekdayLong.toString();
        document.getElementById('forecastDay3').innerHTML = luxon__WEBPACK_IMPORTED_MODULE_1__.DateTime.fromSeconds(AxiosResponse.data.daily[2].dt).weekdayLong.toString();
        document.getElementById('forecastDay4').innerHTML = luxon__WEBPACK_IMPORTED_MODULE_1__.DateTime.fromSeconds(AxiosResponse.data.daily[3].dt).weekdayLong.toString();
        document.getElementById('forecastDay5').innerHTML = luxon__WEBPACK_IMPORTED_MODULE_1__.DateTime.fromSeconds(AxiosResponse.data.daily[4].dt).weekdayLong.toString();
        document.getElementById('forecastDay6').innerHTML = luxon__WEBPACK_IMPORTED_MODULE_1__.DateTime.fromSeconds(AxiosResponse.data.daily[5].dt).weekdayLong.toString();
    })
        .catch(function (error) {
        console.log(error);
        var errorMessage = "Error Code: " + error.response.status;
        console.log(errorMessage);
    });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/dist/";
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__("./src/index.htm");
/******/ 	__webpack_require__("./src/scss/styles.scss");
/******/ 	__webpack_require__("./src/js/index.ts");
/******/ })()
;
//# sourceMappingURL=bundle.js.map