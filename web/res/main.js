function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */
(function defineMustache(global, factory) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && exports && typeof exports.nodeName !== 'string') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    global.Mustache = {};
    factory(global.Mustache);
  }
})(this, function mustacheFactory(mustache) {
  var objectToString = Object.prototype.toString;

  var isArray = Array.isArray || function isArrayPolyfill(object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  function typeStr(obj) {
    return isArray(obj) ? 'array' : _typeof(obj);
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  function hasProperty(obj, propName) {
    return obj != null && _typeof(obj) === 'object' && propName in obj;
  }

  var regExpTest = RegExp.prototype.test;

  function testRegExp(re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;

  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  function parseTemplate(template, tags) {
    if (!template) return [];
    var sections = [];
    var tokens = [];
    var spaces = [];
    var hasTag = false;
    var nonSpace = false;

    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length) {
          delete tokens[spaces.pop()];
        }
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;

    function compileTags(tagsToCompile) {
      if (typeof tagsToCompile === 'string') tagsToCompile = tagsToCompile.split(spaceRe, 2);
      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2) throw new Error('Invalid tags: ' + tagsToCompile);
      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);
    var scanner = new Scanner(template);
    var start, type, value, chr, token, openSection;

    while (!scanner.eos()) {
      start = scanner.pos;
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push(['text', chr, start, start + 1]);
          start += 1;
          if (chr === '\n') stripSpace();
        }
      }

      if (!scanner.scan(openingTagRe)) break;
      hasTag = true;
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      if (!scanner.scan(closingTagRe)) throw new Error('Unclosed tag at ' + scanner.pos);
      token = [type, value, start, scanner.pos];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        openSection = sections.pop();
        if (!openSection) throw new Error('Unopened section "' + value + '" at ' + start);
        if (openSection[1] !== value) throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        compileTags(value);
      }
    }

    openSection = sections.pop();
    if (openSection) throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    return nestTokens(squashTokens(tokens));
  }

  function squashTokens(tokens) {
    var squashedTokens = [];
    var token, lastToken;

    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];
    var token, section;

    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;

        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;

        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  Scanner.prototype.eos = function eos() {
    return this.tail === '';
  };

  Scanner.prototype.scan = function scan(re) {
    var match = this.tail.match(re);
    if (!match || match.index !== 0) return '';
    var string = match[0];
    this.tail = this.tail.substring(string.length);
    this.pos += string.length;
    return string;
  };

  Scanner.prototype.scanUntil = function scanUntil(re) {
    var index = this.tail.search(re),
        match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;

      case 0:
        match = '';
        break;

      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;
    return match;
  };

  function Context(view, parentContext) {
    this.view = view;
    this.cache = {
      '.': this.view
    };
    this.parent = parentContext;
  }

  Context.prototype.push = function push(view) {
    return new Context(view, this);
  };

  Context.prototype.lookup = function lookup(name) {
    var cache = this.cache;
    var value;

    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this,
          names,
          index,
          lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          while (value != null && index < names.length) {
            if (index === names.length - 1) lookupHit = hasProperty(value, names[index]);
            value = value[names[index++]];
          }
        } else {
          value = context.view[name];
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit) break;
        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value)) value = value.call(this.view);
    return value;
  };

  function Writer() {
    this.cache = {};
  }

  Writer.prototype.clearCache = function clearCache() {
    this.cache = {};
  };

  Writer.prototype.parse = function parse(template, tags) {
    var cache = this.cache;
    var tokens = cache[template];
    if (tokens == null) tokens = cache[template] = parseTemplate(template, tags);
    return tokens;
  };

  Writer.prototype.render = function render(template, view, partials) {
    var tokens = this.parse(template);
    var context = _instanceof(view, Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate) {
    var buffer = '';
    var token, symbol, value;

    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];
      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate);else if (symbol === '&') value = this.unescapedValue(token, context);else if (symbol === 'name') value = this.escapedValue(token, context);else if (symbol === 'text') value = this.rawValue(token);
      if (value !== undefined) buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    function subRender(template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (_typeof(value) === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string') throw new Error('Cannot use higher-order sections without the original template');
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
      if (value != null) buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }

    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);
    if (!value || isArray(value) && value.length === 0) return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype.renderPartial = function renderPartial(token, context, partials) {
    if (!partials) return;
    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) return this.renderTokens(this.parse(value), context, partials, value);
  };

  Writer.prototype.unescapedValue = function unescapedValue(token, context) {
    var value = context.lookup(token[1]);
    if (value != null) return value;
  };

  Writer.prototype.escapedValue = function escapedValue(token, context) {
    var value = context.lookup(token[1]);
    if (value != null) return mustache.escape(value);
  };

  Writer.prototype.rawValue = function rawValue(token) {
    return token[1];
  };

  mustache.name = 'mustache.js';
  mustache.version = '2.3.0';
  mustache.tags = ['{{', '}}'];
  var defaultWriter = new Writer();

  mustache.clearCache = function clearCache() {
    return defaultWriter.clearCache();
  };

  mustache.parse = function parse(template, tags) {
    return defaultWriter.parse(template, tags);
  };

  mustache.render = function render(template, view, partials) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' + 'but "' + typeStr(template) + '" was given as the first ' + 'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials);
  };

  mustache.to_html = function to_html(template, view, partials, send) {
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  mustache.escape = escapeHtml;
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;
  return mustache;
});

var Utility =
/*#__PURE__*/
function () {
  "use strict";

  function Utility() {
    _classCallCheck(this, Utility);
  }

  _createClass(Utility, null, [{
    key: "strPadLeft",
    value: function strPadLeft(nr, n, str) {
      return Array(n - String(nr).length + 1).join(str || '0') + nr;
    }
  }, {
    key: "dateToTimestamp",
    value: function dateToTimestamp(date) {
      return Math.floor(date.getTime() / 1000);
    }
  }, {
    key: "createDate",
    value: function createDate(year, month, day, hour, minute, second) {
      return new Date("".concat(year, "/").concat(month, "/").concat(day, " ").concat(hour, ":").concat(minute, ":").concat(second));
    }
  }, {
    key: "isTouchDevice",
    value: function isTouchDevice() {
      return !!('ontouchstart' in window || navigator.maxTouchPoints);
    }
  }, {
    key: "logMessage",
    value: function logMessage(message) {
      var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '#000000';

      if (console && console.log) {
        console.log("%c ".concat(message), "color: ".concat(color));
      }
    }
  }, {
    key: "logError",
    value: function logError(message) {
      if (console && console.error) {
        console.error("[ERROR] ".concat(message));
      }
    }
  }, {
    key: "logException",
    value: function logException(message) {
      if (console && console.warn) {
        if (_instanceof(message, Error)) {
          console.warn("[EXCEPTION:".concat(message.name, "] ").concat(message.message));
        } else {
          console.warn("[EXCEPTION] ".concat(message));
        }
      }
    }
  }]);

  return Utility;
}();

'use strict';

var VVSDefaultSettings = function VVSDefaultSettings() {
  "use strict";

  _classCallCheck(this, VVSDefaultSettings);

  this.maxEntries = 20;
  this.minDeparture = 3;
  this.maxDeparture = 120;
  this.blacklistDirection = false;
  this.whitelistDirection = false;
  this.blacklistLine = false;
  this.whitelistLine = false;
  this.delayClasses = [];
  this.timeout = 10000;
};

'use strict';

var VVSTimetableEntry = function VVSTimetableEntry(data) {
  "use strict";

  _classCallCheck(this, VVSTimetableEntry);

  if (data) {
    for (var i in data) {
      this[i] = data[i];
    }
  }
};

'use strict';

var VVS =
/*#__PURE__*/
function () {
  "use strict";

  function VVS(station, options) {
    _classCallCheck(this, VVS);

    this.requestUrl = 'https://efa-api.asw.io/api/v1/station/{station}/departures/';
    this.station = station;
    this.configuration = $.extend(new VVSDefaultSettings(), options);

  }

  _createClass(VVS, [{
    key: "request",
    value: function request(station) {
      var url = this.requestUrl.replace(/{station}/, String(station));
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = this.configuration.timeout;
      var promise = new Promise(function (resolve, reject) {
        xhr.onload = function () {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject("".concat(xhr.status, ": ").concat(xhr.responseText));
          }
        };

        xhr.onerror = function () {
          reject("request failed");
        };

        xhr.ontimeout = function () {
          reject("request timed out");
        };
      });
      xhr.send();
      return promise;
    }
  }, {
    key: "requestStationDepartures",
    value: function requestStationDepartures() {
      var station = this.station;

      if (VVS.stationRequestQueue[station]) {
        return VVS.stationRequestQueue[station];
      }

      var promise = this.request(station);
      promise.then(function () {
        delete VVS.stationRequestQueue[station];
      });
      promise.catch(function () {
        delete VVS.stationRequestQueue[station];
      });
      return VVS.stationRequestQueue[station] = promise;
    }
  }, {
    key: "setRequestUrl",
    value: function setRequestUrl(url) {
      this.requestUrl = url;
    }
  }, {
    key: "stationSchedule",
    value: function stationSchedule() {
      var _this = this;

      var request = this.requestStationDepartures();
      return new Promise(function (resolve, reject) {
        request.then(function (ajaxData) {
          var currentTimestamp = Utility.dateToTimestamp(new Date());
          var data = JSON.parse(JSON.stringify(ajaxData));
          var stops = [];

          var ret = _this.prepareStationData(data);

          if (data.length) {
            $.each(data, function (index, line) {
              if (line.direction === 'Zug endet hier') {
                return;
              }

              if (line.direction === 'Betriebsfahrt') {
                return;
              }

              var departureTime = line.departureTime;
              delete line.departureTime;
              line = new VVSTimetableEntry(line);
              line.departureTime = _this.calculateDepatureTime(departureTime);
              line.departure = _this.calculateDepatureTimeRel(departureTime, currentTimestamp);
              line.numberType = _this.transformLineNumberToType(line.number);
              line.delay = parseInt(line.delay);
              line.delayType = _this.transformDelayToType(line.delay);
              line.delaySign = Math.sign(line.delay);
              line.delayAbs = Math.abs(line.delay);
              line.delayClass = _this.calculateDelayClass(line);
              stops.push(line);
            });
            stops.sort(function (a, b) {
              return a.departure - b.departure;
            });

            if (!_this.configuration.maxEntries || stops.length >= _this.configuration.maxEntries) {
              stops = stops.filter(function (value) {
                return value.departure >= _this.configuration.minDeparture && value.departure <= _this.configuration.maxDeparture;
              });
            }

            if (_this.configuration.whitelistDirection) {
              stops = stops.filter(function (value) {
                return value.direction.match(_this.configuration.whitelistDirection);
              });
            }

            if (_this.configuration.blacklistDirection) {
              stops = stops.filter(function (value) {
                return !value.direction.match(_this.configuration.blacklistDirection);
              });
            }

            if (_this.configuration.blacklistLine) {
              stops = stops.filter(function (value) {
                return !value.number.match(_this.configuration.blacklistLine);
              });
            }

            if (_this.configuration.whitelistLine) {
              stops = stops.filter(function (value) {
                return value.number.match(_this.configuration.whitelistLine);
              });
            }

            if (_this.configuration.maxEntries) {
              stops.splice(_this.configuration.maxEntries);
            }
          }

          ret.stops = stops;
          resolve(ret);
        }, function (reason) {
          reject(reason);
        });
      });
    }
  }, {
    key: "calculateDepatureTime",
    value: function calculateDepatureTime(departure) {
      var date = Utility.createDate(departure.year, departure.month, departure.day, departure.hour, departure.minute, 0);
      return "".concat(Utility.strPadLeft(date.getHours(), 2, '0'), ":").concat(Utility.strPadLeft(date.getMinutes(), 2, '0'));
    }
  }, {
    key: "calculateDepatureTimeRel",
    value: function calculateDepatureTimeRel(departure, currentTimestamp) {
      var departureTimestamp = Utility.dateToTimestamp(Utility.createDate(departure.year, departure.month, departure.day, departure.hour, departure.minute, 0));
      var ret = Math.floor((departureTimestamp - currentTimestamp) / 60);
      return ret;
    }
  }, {
    key: "transformLineNumberToType",
    value: function transformLineNumberToType(lineNumber) {
      var ret = lineNumber;
      var match;

      if (!isNaN(Number(lineNumber))) {
        ret = "B" + lineNumber;
      }

      return ret;
    }
  }, {
    key: "transformDelayToType",
    value: function transformDelayToType(delay) {
      var ret = '';

      //Math.sign
      if (delay > 0)
        ret = "+";
      
      if (delay < 0)
        ret = "-";
      
      if (delay== 0)
        ret = "+";

      return ret;
    }
  }, {
    key: "calculateDelayClass",
    value: function calculateDelayClass(line) {
      var ret = '';
      $.each(this.configuration.delayClasses, function (index, delayConf) {
        switch (Math.sign(delayConf.delay)) {
          case -1:
            if (line.delay <= delayConf.delay) {
              ret = delayConf.className;
            }

            break;

          case 1:
            if (line.delay >= delayConf.delay) {
              ret = delayConf.className;
            }

            break;
        }
      });
      return ret;
    }
  }, {
    key: "prepareStationData",
    value: function prepareStationData(data) {
      var ret = {
        station: {
          id: this.station,
          name: false,
          coordinates: false
        },
        stops: []
      };

      if (data.length) {
        var firstStop = data.pop();
        ret.station.name = firstStop.stopName;
        ret.station.coordinates = firstStop.stationCoordinates;
      }

      return ret;
    }
  }]);

  return VVS;
}();

VVS.stationRequestQueue = {};
'use strict';

var VVSCached =
/*#__PURE__*/
function (_VVS) {
  "use strict";

  _inherits(VVSCached, _VVS);

  function VVSCached() {
    var _this2;

    _classCallCheck(this, VVSCached);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(VVSCached).apply(this, arguments));
    _this2.cacheTime = 59;
    return _this2;
  }

  _createClass(VVSCached, [{
    key: "cacheGetData",
    value: function cacheGetData(key) {
      var data = localStorage.getItem(key);

      if (data) {
        return JSON.parse(data);
      } else {
        throw new Error("".concat(this.station, ": Could not get cached data (key ").concat(key, ")"));
      }
    }
  }, {
    key: "cacheSetData",
    value: function cacheSetData(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, {
    key: "requestStationDepartures",
    value: function requestStationDepartures() {
      var _this3 = this;

      var promise;

      try {
        var keyTimestamp = "".concat(this.station, ".timestamp");
        var keyData = "".concat(this.station, ".data");
        var currentTime = Utility.dateToTimestamp(new Date());

        try {
          var lastUptimeTime = this.cacheGetData(keyTimestamp);
          var ret = this.cacheGetData(keyData);

          if (!lastUptimeTime || !ret || ret.length == 0) {
            throw new Error("".concat(this.station, ": Empty station data in cache"));
          }
        } catch (e) {
          Utility.logException(e);
          lastUptimeTime = false;
          ret = false;
        }

        if (lastUptimeTime && ret && currentTime - lastUptimeTime <= this.cacheTime) {
          promise = new Promise(function (resolve) {
            resolve(ret);
          });
        } else {
          promise = _get(_getPrototypeOf(VVSCached.prototype), "requestStationDepartures", this).call(this);
          promise.then(function (ajaxData) {
            try {
              var data = JSON.parse(JSON.stringify(ajaxData));

              _this3.cacheSetData(keyData, data);

              _this3.cacheSetData(keyTimestamp, currentTime);
            } catch (e) {
              Utility.logException(e);
            }
          });
        }
      } catch (e) {
        Utility.logException(e);
        promise = _get(_getPrototypeOf(VVSCached.prototype), "requestStationDepartures", this).call(this);
      }

      return promise;
    }
  }, {
    key: "prepareStationData",
    value: function prepareStationData(data) {
      var ret = _get(_getPrototypeOf(VVSCached.prototype), "prepareStationData", this).call(this, data);

      var cacheKeyTitle = "".concat(this.station, ".title");
      var cacheKeyInfo = "".concat(this.station, ".info");

      if (ret.station.name) {
        try {
          this.cacheSetData(cacheKeyInfo, ret.station);
        } catch (e) {
          Utility.logException(e);
        }
      } else {
        try {
          var stationInfo = this.cacheGetData(cacheKeyInfo);

          if (stationInfo) {
            ret.station = stationInfo;
          }
        } catch (e) {
          Utility.logException(e);
        }
      }

      return ret;
    }
  }]);

  return VVSCached;
}(VVS);

$.fn.clock = function (options) {
  this.each(function (index, el) {
    var $this = $(el);
    var settings = $.extend(true, {
      template: '{{hours}}:{{minutes}}:{{seconds}}'
    }, $this.data(), options);
    $this.on('click', function () {
      $this.hide();
    });

    var callback = function callback() {
      var date = new Date();
      var view = {
        hours: function hours() {
          return Utility.strPadLeft(date.getHours(), 2, '0');
        },
        minutes: function minutes() {
          return Utility.strPadLeft(date.getMinutes(), 2, '0');
        },
        seconds: function seconds() {
          return Utility.strPadLeft(date.getSeconds(), 2, '0');
        },
        day: function day() {
          return Utility.strPadLeft(date.getDay(), 2, '0');
        },
        month: function month() {
          return Utility.strPadLeft(date.getMonth(), 2, '0');
        },
        year: function year() {
          return date.getFullYear();
        }
      };
      $this.html(Mustache.render(settings.template, view));
    };

    setInterval(callback, 900);
    callback();
  });
};

'use strict';

var VVSStationDefaultSettings =
/*#__PURE__*/
function (_VVSDefaultSettings) {
  "use strict";

  _inherits(VVSStationDefaultSettings, _VVSDefaultSettings);

  function VVSStationDefaultSettings() {
    var _this4;

    _classCallCheck(this, VVSStationDefaultSettings);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(VVSStationDefaultSettings).apply(this, arguments));
    _this4.updateTime = 60 * 1000;
    _this4.localCache = true;
    _this4.timeToggle = 0;
    _this4.intelligentTimeThreshold = 60;
    _this4.loadingIndicator = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="10" stroke-miterlimit="10"/></svg></div>';
    _this4.departureType = 'relative';
    _this4.requestUrl = 'https://efa-api.asw.io/api/v1/station/{station}/departures/';
    _this4.translations = {
      noData: 'Keine Abfahrtszeiten vorhanden',
      minute: 'min',
      from: 'ab',
      departureCanceld: 'Zug fällt aus'
    };
    _this4.templateMain = "\n            <div class=\"sticky\"><h3>{{title}}<i class=\"departure-minimum-desc\">{{departureTitle}}</i></h3></div>\n            {{&content}}\n    ";
    _this4.templateTitle = "{{stationName}}";
    _this4.templateTimetable = "\n        <ul class=\"\">\n            {{#timetable}}\n            <li class=\"{{line.delayClass}}\">\n                <div class=\"overall-box\">\n                    <div class=\"departure-box\">\n                        <div class=\"line-symbol\" data-line=\"{{line.numberType}}\" data-line=\"{{line.number}}\">{{line.number}}</div>\n                        <div class=\"direction\">{{line.direction}}</div>\n                    </div>\n                    <div class=\"time-box\">\n                        <div class=\"label label-danger delay\" data-delay=\"{{delay.type}}\">{{delay.value}}</div>\n                        <div class=\"departure\" data-departure-type=\"{{departure.type}}\">\n                            <span class=\"time absolute\">{{&departure.absolute}}</span>\n                            <span class=\"time relative\">{{&departure.relative}}</span>\n                        </div>\n                    </div>\n                </div>\n            </li>\n            {{/timetable}}\n        </ul>\n    ";
    _this4.templateNoData = '<div class="alert alert-warning" role="alert">{{settings.translations.noData}}</div>';
    _this4.delayClasses = [{
      delay: -1,
      className: 'info'
    }, {
      delay: 1,
      className: 'warning'
    }, {
      delay: 3,
      className: 'danger'
    }, {
      delay: 9999,
      className: 'danger canceled'
    }, {
      delay: -9999,
      className: 'danger canceled'
    }];
    return _this4;
  }

  return VVSStationDefaultSettings;
}(VVSDefaultSettings);

$.fn.vvsStation = function (options) {
  this.each(function (index, el) {
    var $this = $(el);
    var vvs;
    var settings = $.extend(true, new VVSStationDefaultSettings(), $this.data(), options);

    if (!settings.station) {
      Utility.logError('VVS station not set');
      $this.text('VVS Station not set!');
      return;
    }

    if (settings.blacklistDirection) settings.blacklistDirection = new RegExp(settings.blacklistDirection);
    if (settings.whitelistDirection) settings.whitelistDirection = new RegExp(settings.whitelistDirection);
    if (settings.blacklistLine) settings.blacklistLine = new RegExp(settings.blacklistLine);
    if (settings.whitelistLine) settings.whitelistLine = new RegExp(settings.whitelistLine);

    try {
      if (settings.localCache && localStorage) {
        vvs = new VVSCached(settings.station, settings);
        Utility.logMessage("Init VVS Station Monitor for station ".concat(settings.station, " (localCache: yes)"), '#008000');
      } else {
        vvs = new VVS(settings.station, settings);
        Utility.logMessage("Init VVS Station Monitor for station ".concat(settings.station, " (localCache: no)"), '#008000');
      }
    } catch (e) {
      $this.html("<div class=\"alert alert-danger\" role=\"alert\">".concat(e.message, "</div>"));
      return;
    }

    if (settings.requestUrl) {
      vvs.setRequestUrl(settings.requestUrl);
    }

    $this.addClass("time-".concat(settings.departureType));

    if (!Utility.isTouchDevice()) {
      $this.on('click', function () {
        $this.toggleClass('hover');
      });
    }

    if (settings.timeToggle) {
      setInterval(function () {
        $this.toggleClass('time-toggle');
      }, settings.timeToggle * 1000);
    }

    var addLoadingIndicator = function addLoadingIndicator() {
      if (!$this.find('.spinner-content').length) {
        $this.append('<div class="spinner-content">' + settings.loadingIndicator + '</div>');
      }
    };

    var humanRelativeTime = function humanRelativeTime(line) {
      var ret = '';
      var departure = line.departure;

      if (departure >= 60) {
        var hours = Math.floor(departure / 60);
        var minutes = String(Math.floor(departure % 60));
        ret = "<i class=\"hours\">".concat(hours, "</i><i class=\"minutes\">").concat(minutes, "</i>");
      } else {
        ret = "<i class=\"minutes\">".concat(departure, "</i>");
      }

      return ret;
    };

    var processStationDataRow = function processStationDataRow(line) {
      return {
        line: line,
        delay: {
          type: line.delayType,
          value: line.delayAbs
        },
        departure: {
          relative: function relative() {
            if (line.delay === 9999 || line.delay === -9999) {
              return "<span class=\"marquee\"><span>".concat(settings.translations.departureCanceld, " &mdash; ").concat(line.departureTime, " &mdash; ").concat(settings.translations.departureCanceld, "</span></span>");
            }

            if (settings.departureType === 'intelligent' && line.departure >= settings.intelligentTimeThreshold) {
              return line.departureTime;
            } else {
              return humanRelativeTime(line);
            }
          },
          absolute: function absolute() {
            if (line.delay === 9999 || line.delay === -9999) {
              return "<span class=\"marquee\"><span>".concat(settings.translations.departureCanceld, " - ").concat(line.departureTime, " - ").concat(settings.translations.departureCanceld, "</span></span>");
            }

            return line.departureTime;
          }
        }
      };
    };

    var updateSchedule = function updateSchedule() {
      addLoadingIndicator();
      var schedule = vvs.stationSchedule();
      schedule.then(function (data) {
        var stationName = function stationName() {
          if (data && data.station && data.station.name) {
            return data.station.name;
          } else {
            return "Haltestelle ".concat(settings.station);
          }
        };

        var viewMain = {
          settings: settings,
          stationName: stationName,
          title: function title() {
            var viewTitle = {
              stationName: stationName
            };
            return Mustache.render(settings.templateTitle, viewTitle);
          },
          departureTitle: function departureTitle() {
            if (data && data.stops && data.stops.length) {
              return "".concat(settings.translations.from, " ").concat(settings.minDeparture, " ").concat(settings.translations.minute);
            }
          },
          content: function content() {
            var template;
            var viewContent = {
              settings: settings,
              station: stationName,
              timetable: []
            };

            if (data && data.stops && data.stops.length) {
              template = settings.templateTimetable;
              $.each(data.stops, function (index, line) {
                viewContent.timetable.push(processStationDataRow(line));
              });
            } else {
              template = settings.templateNoData;
            }

            return Mustache.render(template, viewContent);
          }
        };
        $this.html(Mustache.render(settings.templateMain, viewMain));
      });
      schedule.catch(function (message) {
        $this.html("<div class=\"alert alert-danger\" role=\"alert\">".concat(message, "</div>"));
      });
    };

    addLoadingIndicator();
    setInterval(updateSchedule, settings.updateTime);
    setTimeout(updateSchedule, 100);
  });
  return this;
};
