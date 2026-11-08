"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  UsageError: () => UsageError,
  activate: () => activate,
  buildHost: () => buildHost,
  default: () => index_default,
  parseArgs: () => parseArgs
});
module.exports = __toCommonJS(index_exports);
var import_fs2 = require("fs");
var os = __toESM(require("os"));
var path2 = __toESM(require("path"));
var readline = __toESM(require("readline"));

// src/config.ts
var STATE_SCHEMA_VERSION = 2;
var DEFAULT_STATE_PATH = ".dsh/lz-work-bootstrap-state.json";
var DEFAULT_PROFILE = "dev-workbench";
var PLUGINS_FENCE = "yaml dsh-plugins";
var SKILLS_FENCE = "yaml dsh-skills";
var ALLOWED_SECRET_PREFIXES = ["keychain:", "env:"];
var RESTRICTED_SOURCES = ["github", "github-release"];
var EXCLUDED_BINARY_PROJECTS = [
  "DeepSeek-Harness-Token-Free"
];
var SKILL_CATEGORIES = ["general", "dev", "internal"];
var GITLAB_GROUP_ASK = "__ask__";
var GITLAB_GROUP_VAR = "${gitlab_group}";

// node_modules/js-yaml/dist/js-yaml.mjs
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var jsYaml = {};
var loader = {};
var common = {};
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function isNothing(subject) {
    return typeof subject === "undefined" || subject === null;
  }
  function isObject(subject) {
    return typeof subject === "object" && subject !== null;
  }
  function toArray(sequence) {
    if (Array.isArray(sequence)) return sequence;
    else if (isNothing(sequence)) return [];
    return [sequence];
  }
  function extend(target, source) {
    if (source) {
      const sourceKeys = Object.keys(source);
      for (let index = 0, length = sourceKeys.length; index < length; index += 1) {
        const key = sourceKeys[index];
        target[key] = source[key];
      }
    }
    return target;
  }
  function repeat(string, count) {
    let result = "";
    for (let cycle = 0; cycle < count; cycle += 1) {
      result += string;
    }
    return result;
  }
  function isNegativeZero(number) {
    return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
  }
  common.isNothing = isNothing;
  common.isObject = isObject;
  common.toArray = toArray;
  common.repeat = repeat;
  common.isNegativeZero = isNegativeZero;
  common.extend = extend;
  return common;
}
var exception;
var hasRequiredException;
function requireException() {
  if (hasRequiredException) return exception;
  hasRequiredException = 1;
  function formatError(exception2, compact) {
    let where = "";
    const message = exception2.reason || "(unknown reason)";
    if (!exception2.mark) return message;
    if (exception2.mark.name) {
      where += 'in "' + exception2.mark.name + '" ';
    }
    where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
    if (!compact && exception2.mark.snippet) {
      where += "\n\n" + exception2.mark.snippet;
    }
    return message + " " + where;
  }
  function YAMLException2(reason, mark) {
    Error.call(this);
    this.name = "YAMLException";
    this.reason = reason;
    this.mark = mark;
    this.message = formatError(this, false);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack || "";
    }
  }
  YAMLException2.prototype = Object.create(Error.prototype);
  YAMLException2.prototype.constructor = YAMLException2;
  YAMLException2.prototype.toString = function toString(compact) {
    return this.name + ": " + formatError(this, compact);
  };
  exception = YAMLException2;
  return exception;
}
var snippet;
var hasRequiredSnippet;
function requireSnippet() {
  if (hasRequiredSnippet) return snippet;
  hasRequiredSnippet = 1;
  const common2 = requireCommon();
  function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
    let head = "";
    let tail = "";
    const maxHalfLength = Math.floor(maxLineLength / 2) - 1;
    if (position - lineStart > maxHalfLength) {
      head = " ... ";
      lineStart = position - maxHalfLength + head.length;
    }
    if (lineEnd - position > maxHalfLength) {
      tail = " ...";
      lineEnd = position + maxHalfLength - tail.length;
    }
    return {
      str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
      pos: position - lineStart + head.length
      // relative position
    };
  }
  function padStart(string, max) {
    return common2.repeat(" ", max - string.length) + string;
  }
  function makeSnippet(mark, options) {
    options = Object.create(options || null);
    if (!mark.buffer) return null;
    if (!options.maxLength) options.maxLength = 79;
    if (typeof options.indent !== "number") options.indent = 1;
    if (typeof options.linesBefore !== "number") options.linesBefore = 3;
    if (typeof options.linesAfter !== "number") options.linesAfter = 2;
    const re = /\r?\n|\r|\0/g;
    const lineStarts = [0];
    const lineEnds = [];
    let match;
    let foundLineNo = -1;
    while (match = re.exec(mark.buffer)) {
      lineEnds.push(match.index);
      lineStarts.push(match.index + match[0].length);
      if (mark.position <= match.index && foundLineNo < 0) {
        foundLineNo = lineStarts.length - 2;
      }
    }
    if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
    let result = "";
    const lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
    const maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
    for (let i = 1; i <= options.linesBefore; i++) {
      if (foundLineNo - i < 0) break;
      const line2 = getLine(
        mark.buffer,
        lineStarts[foundLineNo - i],
        lineEnds[foundLineNo - i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
        maxLineLength
      );
      result = common2.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line2.str + "\n" + result;
    }
    const line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
    result += common2.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
    result += common2.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
    for (let i = 1; i <= options.linesAfter; i++) {
      if (foundLineNo + i >= lineEnds.length) break;
      const line2 = getLine(
        mark.buffer,
        lineStarts[foundLineNo + i],
        lineEnds[foundLineNo + i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
        maxLineLength
      );
      result += common2.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line2.str + "\n";
    }
    return result.replace(/\n$/, "");
  }
  snippet = makeSnippet;
  return snippet;
}
var type;
var hasRequiredType;
function requireType() {
  if (hasRequiredType) return type;
  hasRequiredType = 1;
  const YAMLException2 = requireException();
  const TYPE_CONSTRUCTOR_OPTIONS = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ];
  const YAML_NODE_KINDS = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function compileStyleAliases(map2) {
    const result = {};
    if (map2 !== null) {
      Object.keys(map2).forEach(function(style) {
        map2[style].forEach(function(alias) {
          result[String(alias)] = style;
        });
      });
    }
    return result;
  }
  function Type2(tag, options) {
    options = options || {};
    Object.keys(options).forEach(function(name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new YAMLException2('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    });
    this.options = options;
    this.tag = tag;
    this.kind = options["kind"] || null;
    this.resolve = options["resolve"] || function() {
      return true;
    };
    this.construct = options["construct"] || function(data) {
      return data;
    };
    this.instanceOf = options["instanceOf"] || null;
    this.predicate = options["predicate"] || null;
    this.represent = options["represent"] || null;
    this.representName = options["representName"] || null;
    this.defaultStyle = options["defaultStyle"] || null;
    this.multi = options["multi"] || false;
    this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new YAMLException2('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }
  type = Type2;
  return type;
}
var schema;
var hasRequiredSchema;
function requireSchema() {
  if (hasRequiredSchema) return schema;
  hasRequiredSchema = 1;
  const YAMLException2 = requireException();
  const Type2 = requireType();
  function compileList(schema2, name) {
    const result = [];
    schema2[name].forEach(function(currentType) {
      let newIndex = result.length;
      result.forEach(function(previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
          newIndex = previousIndex;
        }
      });
      result[newIndex] = currentType;
    });
    return result;
  }
  function compileMap() {
    const result = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    };
    function collectType(type2) {
      if (type2.multi) {
        result.multi[type2.kind].push(type2);
        result.multi["fallback"].push(type2);
      } else {
        result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
      }
    }
    for (let index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }
    return result;
  }
  function Schema2(definition) {
    return this.extend(definition);
  }
  Schema2.prototype.extend = function extend(definition) {
    let implicit = [];
    let explicit = [];
    if (definition instanceof Type2) {
      explicit.push(definition);
    } else if (Array.isArray(definition)) {
      explicit = explicit.concat(definition);
    } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
      if (definition.implicit) implicit = implicit.concat(definition.implicit);
      if (definition.explicit) explicit = explicit.concat(definition.explicit);
    } else {
      throw new YAMLException2("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    }
    implicit.forEach(function(type2) {
      if (!(type2 instanceof Type2)) {
        throw new YAMLException2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      }
      if (type2.loadKind && type2.loadKind !== "scalar") {
        throw new YAMLException2("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      }
      if (type2.multi) {
        throw new YAMLException2("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
      }
    });
    explicit.forEach(function(type2) {
      if (!(type2 instanceof Type2)) {
        throw new YAMLException2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      }
    });
    const result = Object.create(Schema2.prototype);
    result.implicit = (this.implicit || []).concat(implicit);
    result.explicit = (this.explicit || []).concat(explicit);
    result.compiledImplicit = compileList(result, "implicit");
    result.compiledExplicit = compileList(result, "explicit");
    result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
    return result;
  };
  schema = Schema2;
  return schema;
}
var str;
var hasRequiredStr;
function requireStr() {
  if (hasRequiredStr) return str;
  hasRequiredStr = 1;
  const Type2 = requireType();
  str = new Type2("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(data) {
      return data !== null ? data : "";
    }
  });
  return str;
}
var seq;
var hasRequiredSeq;
function requireSeq() {
  if (hasRequiredSeq) return seq;
  hasRequiredSeq = 1;
  const Type2 = requireType();
  seq = new Type2("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(data) {
      return data !== null ? data : [];
    }
  });
  return seq;
}
var map;
var hasRequiredMap;
function requireMap() {
  if (hasRequiredMap) return map;
  hasRequiredMap = 1;
  const Type2 = requireType();
  map = new Type2("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(data) {
      return data !== null ? data : {};
    }
  });
  return map;
}
var failsafe;
var hasRequiredFailsafe;
function requireFailsafe() {
  if (hasRequiredFailsafe) return failsafe;
  hasRequiredFailsafe = 1;
  const Schema2 = requireSchema();
  failsafe = new Schema2({
    explicit: [
      requireStr(),
      requireSeq(),
      requireMap()
    ]
  });
  return failsafe;
}
var _null;
var hasRequired_null;
function require_null() {
  if (hasRequired_null) return _null;
  hasRequired_null = 1;
  const Type2 = requireType();
  function resolveYamlNull(data) {
    if (data === null) return true;
    const max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
  }
  function constructYamlNull() {
    return null;
  }
  function isNull(object) {
    return object === null;
  }
  _null = new Type2("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  });
  return _null;
}
var bool;
var hasRequiredBool;
function requireBool() {
  if (hasRequiredBool) return bool;
  hasRequiredBool = 1;
  const Type2 = requireType();
  function resolveYamlBoolean(data) {
    if (data === null) return false;
    const max = data.length;
    return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
  }
  function constructYamlBoolean(data) {
    return data === "true" || data === "True" || data === "TRUE";
  }
  function isBoolean(object) {
    return Object.prototype.toString.call(object) === "[object Boolean]";
  }
  bool = new Type2("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function(object) {
        return object ? "true" : "false";
      },
      uppercase: function(object) {
        return object ? "TRUE" : "FALSE";
      },
      camelcase: function(object) {
        return object ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  });
  return bool;
}
var int;
var hasRequiredInt;
function requireInt() {
  if (hasRequiredInt) return int;
  hasRequiredInt = 1;
  const common2 = requireCommon();
  const Type2 = requireType();
  function isHexCode(c) {
    return c >= 48 && c <= 57 || c >= 65 && c <= 70 || c >= 97 && c <= 102;
  }
  function isOctCode(c) {
    return c >= 48 && c <= 55;
  }
  function isDecCode(c) {
    return c >= 48 && c <= 57;
  }
  function resolveYamlInteger(data) {
    if (data === null) return false;
    const max = data.length;
    let index = 0;
    let hasDigits = false;
    if (!max) return false;
    let ch = data[index];
    if (ch === "-" || ch === "+") {
      ch = data[++index];
    }
    if (ch === "0") {
      if (index + 1 === max) return true;
      ch = data[++index];
      if (ch === "b") {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch !== "0" && ch !== "1") return false;
          hasDigits = true;
        }
        return hasDigits && isFinite(parseYamlInteger(data));
      }
      if (ch === "x") {
        index++;
        for (; index < max; index++) {
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && isFinite(parseYamlInteger(data));
      }
      if (ch === "o") {
        index++;
        for (; index < max; index++) {
          if (!isOctCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && isFinite(parseYamlInteger(data));
      }
    }
    for (; index < max; index++) {
      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }
    if (!hasDigits) return false;
    return isFinite(parseYamlInteger(data));
  }
  function parseYamlInteger(data) {
    let value = data;
    let sign = 1;
    let ch = value[0];
    if (ch === "-" || ch === "+") {
      if (ch === "-") sign = -1;
      value = value.slice(1);
      ch = value[0];
    }
    if (value === "0") return 0;
    if (ch === "0") {
      if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
      if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
      if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
    }
    return sign * parseInt(value, 10);
  }
  function constructYamlInteger(data) {
    return parseYamlInteger(data);
  }
  function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common2.isNegativeZero(object));
  }
  int = new Type2("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary: function(obj) {
        return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
      },
      octal: function(obj) {
        return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
      },
      decimal: function(obj) {
        return obj.toString(10);
      },
      hexadecimal: function(obj) {
        return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  });
  return int;
}
var float;
var hasRequiredFloat;
function requireFloat() {
  if (hasRequiredFloat) return float;
  hasRequiredFloat = 1;
  const common2 = requireCommon();
  const Type2 = requireType();
  const YAML_FLOAT_PATTERN = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  const YAML_FLOAT_SPECIAL_PATTERN = new RegExp(
    "^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function resolveYamlFloat(data) {
    if (data === null) return false;
    if (!YAML_FLOAT_PATTERN.test(data)) {
      return false;
    }
    if (isFinite(parseFloat(data, 10))) {
      return true;
    }
    return YAML_FLOAT_SPECIAL_PATTERN.test(data);
  }
  function constructYamlFloat(data) {
    let value = data.toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    if ("+-".indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }
    if (value === ".inf") {
      return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else if (value === ".nan") {
      return NaN;
    }
    return sign * parseFloat(value, 10);
  }
  const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
  function representYamlFloat(object, style) {
    if (isNaN(object)) {
      switch (style) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    } else if (common2.isNegativeZero(object)) {
      return "-0.0";
    }
    const res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
  }
  function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common2.isNegativeZero(object));
  }
  float = new Type2("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: "lowercase"
  });
  return float;
}
var json;
var hasRequiredJson;
function requireJson() {
  if (hasRequiredJson) return json;
  hasRequiredJson = 1;
  json = requireFailsafe().extend({
    implicit: [
      require_null(),
      requireBool(),
      requireInt(),
      requireFloat()
    ]
  });
  return json;
}
var core;
var hasRequiredCore;
function requireCore() {
  if (hasRequiredCore) return core;
  hasRequiredCore = 1;
  core = requireJson();
  return core;
}
var timestamp;
var hasRequiredTimestamp;
function requireTimestamp() {
  if (hasRequiredTimestamp) return timestamp;
  hasRequiredTimestamp = 1;
  const Type2 = requireType();
  const YAML_DATE_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  );
  const YAML_TIMESTAMP_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }
  function constructYamlTimestamp(data) {
    let fraction = 0;
    let delta = null;
    let match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null) throw new Error("Date resolve error");
    const year = +match[1];
    const month = +match[2] - 1;
    const day = +match[3];
    if (!match[4]) {
      return new Date(Date.UTC(year, month, day));
    }
    const hour = +match[4];
    const minute = +match[5];
    const second = +match[6];
    if (match[7]) {
      fraction = match[7].slice(0, 3);
      while (fraction.length < 3) {
        fraction += "0";
      }
      fraction = +fraction;
    }
    if (match[9]) {
      const tzHour = +match[10];
      const tzMinute = +(match[11] || 0);
      delta = (tzHour * 60 + tzMinute) * 6e4;
      if (match[9] === "-") delta = -delta;
    }
    const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
  }
  function representYamlTimestamp(object) {
    return object.toISOString();
  }
  timestamp = new Type2("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });
  return timestamp;
}
var merge;
var hasRequiredMerge;
function requireMerge() {
  if (hasRequiredMerge) return merge;
  hasRequiredMerge = 1;
  const Type2 = requireType();
  function resolveYamlMerge(data) {
    return data === "<<" || data === null;
  }
  merge = new Type2("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: resolveYamlMerge
  });
  return merge;
}
var binary;
var hasRequiredBinary;
function requireBinary() {
  if (hasRequiredBinary) return binary;
  hasRequiredBinary = 1;
  const Type2 = requireType();
  const BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
  function resolveYamlBinary(data) {
    if (data === null) return false;
    let bitlen = 0;
    const max = data.length;
    const map2 = BASE64_MAP;
    for (let idx = 0; idx < max; idx++) {
      const code = map2.indexOf(data.charAt(idx));
      if (code > 64) continue;
      if (code < 0) return false;
      bitlen += 6;
    }
    return bitlen % 8 === 0;
  }
  function constructYamlBinary(data) {
    const input = data.replace(/[\r\n=]/g, "");
    const max = input.length;
    const map2 = BASE64_MAP;
    let bits = 0;
    const result = [];
    for (let idx = 0; idx < max; idx++) {
      if (idx % 4 === 0 && idx) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      }
      bits = bits << 6 | map2.indexOf(input.charAt(idx));
    }
    const tailbits = max % 4 * 6;
    if (tailbits === 0) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    } else if (tailbits === 18) {
      result.push(bits >> 10 & 255);
      result.push(bits >> 2 & 255);
    } else if (tailbits === 12) {
      result.push(bits >> 4 & 255);
    }
    return new Uint8Array(result);
  }
  function representYamlBinary(object) {
    let result = "";
    let bits = 0;
    const max = object.length;
    const map2 = BASE64_MAP;
    for (let idx = 0; idx < max; idx++) {
      if (idx % 3 === 0 && idx) {
        result += map2[bits >> 18 & 63];
        result += map2[bits >> 12 & 63];
        result += map2[bits >> 6 & 63];
        result += map2[bits & 63];
      }
      bits = (bits << 8) + object[idx];
    }
    const tail = max % 3;
    if (tail === 0) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    } else if (tail === 2) {
      result += map2[bits >> 10 & 63];
      result += map2[bits >> 4 & 63];
      result += map2[bits << 2 & 63];
      result += map2[64];
    } else if (tail === 1) {
      result += map2[bits >> 2 & 63];
      result += map2[bits << 4 & 63];
      result += map2[64];
      result += map2[64];
    }
    return result;
  }
  function isBinary(obj) {
    return Object.prototype.toString.call(obj) === "[object Uint8Array]";
  }
  binary = new Type2("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });
  return binary;
}
var omap;
var hasRequiredOmap;
function requireOmap() {
  if (hasRequiredOmap) return omap;
  hasRequiredOmap = 1;
  const Type2 = requireType();
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const _toString = Object.prototype.toString;
  function resolveYamlOmap(data) {
    if (data === null) return true;
    const objectKeys = {};
    const object = data;
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      let pairHasKey = false;
      if (_toString.call(pair) !== "[object Object]") return false;
      let pairKey;
      for (pairKey in pair) {
        if (_hasOwnProperty.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;
          else return false;
        }
      }
      if (!pairHasKey) return false;
      if (_hasOwnProperty.call(objectKeys, pairKey)) return false;
      Object.defineProperty(objectKeys, pairKey, { value: true });
    }
    return true;
  }
  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }
  omap = new Type2("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });
  return omap;
}
var pairs;
var hasRequiredPairs;
function requirePairs() {
  if (hasRequiredPairs) return pairs;
  hasRequiredPairs = 1;
  const Type2 = requireType();
  const _toString = Object.prototype.toString;
  function resolveYamlPairs(data) {
    if (data === null) return true;
    const object = data;
    const result = new Array(object.length);
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      if (_toString.call(pair) !== "[object Object]") return false;
      const keys = Object.keys(pair);
      if (keys.length !== 1) return false;
      result[index] = [keys[0], pair[keys[0]]];
    }
    return true;
  }
  function constructYamlPairs(data) {
    if (data === null) return [];
    const object = data;
    const result = new Array(object.length);
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      const keys = Object.keys(pair);
      result[index] = [keys[0], pair[keys[0]]];
    }
    return result;
  }
  pairs = new Type2("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });
  return pairs;
}
var set;
var hasRequiredSet;
function requireSet() {
  if (hasRequiredSet) return set;
  hasRequiredSet = 1;
  const Type2 = requireType();
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  function resolveYamlSet(data) {
    if (data === null) return true;
    const object = data;
    for (const key in object) {
      if (_hasOwnProperty.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }
    return true;
  }
  function constructYamlSet(data) {
    return data !== null ? data : {};
  }
  set = new Type2("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });
  return set;
}
var _default;
var hasRequired_default;
function require_default() {
  if (hasRequired_default) return _default;
  hasRequired_default = 1;
  _default = requireCore().extend({
    implicit: [
      requireTimestamp(),
      requireMerge()
    ],
    explicit: [
      requireBinary(),
      requireOmap(),
      requirePairs(),
      requireSet()
    ]
  });
  return _default;
}
var hasRequiredLoader;
function requireLoader() {
  if (hasRequiredLoader) return loader;
  hasRequiredLoader = 1;
  const common2 = requireCommon();
  const YAMLException2 = requireException();
  const makeSnippet = requireSnippet();
  const DEFAULT_SCHEMA2 = require_default();
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const CONTEXT_FLOW_IN = 1;
  const CONTEXT_FLOW_OUT = 2;
  const CONTEXT_BLOCK_IN = 3;
  const CONTEXT_BLOCK_OUT = 4;
  const CHOMPING_CLIP = 1;
  const CHOMPING_STRIP = 2;
  const CHOMPING_KEEP = 3;
  const PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  const PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  const PATTERN_FLOW_INDICATORS = /[,\[\]{}]/;
  const PATTERN_TAG_HANDLE = /^(?:!|!!|![0-9A-Za-z-]+!)$/;
  const PATTERN_TAG_URI = /^(?:!|[^,\[\]{}])(?:%[0-9a-f]{2}|[0-9a-z\-#;/?:@&=+$,_.!~*'()\[\]])*$/i;
  function _class(obj) {
    return Object.prototype.toString.call(obj);
  }
  function isEol(c) {
    return c === 10 || c === 13;
  }
  function isWhiteSpace(c) {
    return c === 9 || c === 32;
  }
  function isWsOrEol(c) {
    return c === 9 || c === 32 || c === 10 || c === 13;
  }
  function isFlowIndicator(c) {
    return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
  }
  function fromHexCode(c) {
    if (c >= 48 && c <= 57) {
      return c - 48;
    }
    const lc = c | 32;
    if (lc >= 97 && lc <= 102) {
      return lc - 97 + 10;
    }
    return -1;
  }
  function escapedHexLen(c) {
    if (c === 120) {
      return 2;
    }
    if (c === 117) {
      return 4;
    }
    if (c === 85) {
      return 8;
    }
    return 0;
  }
  function fromDecimalCode(c) {
    if (c >= 48 && c <= 57) {
      return c - 48;
    }
    return -1;
  }
  function simpleEscapeSequence(c) {
    switch (c) {
      case 48:
        return "\0";
      case 97:
        return "\x07";
      case 98:
        return "\b";
      case 116:
        return "	";
      case 9:
        return "	";
      case 110:
        return "\n";
      case 118:
        return "\v";
      case 102:
        return "\f";
      case 114:
        return "\r";
      case 101:
        return "\x1B";
      case 32:
        return " ";
      case 34:
        return '"';
      case 47:
        return "/";
      case 92:
        return "\\";
      case 78:
        return "\x85";
      case 95:
        return "\xA0";
      case 76:
        return "\u2028";
      case 80:
        return "\u2029";
      default:
        return "";
    }
  }
  function charFromCodepoint(c) {
    if (c <= 65535) {
      return String.fromCharCode(c);
    }
    return String.fromCharCode(
      (c - 65536 >> 10) + 55296,
      (c - 65536 & 1023) + 56320
    );
  }
  function setProperty(object, key, value) {
    if (key === "__proto__") {
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value
      });
    } else {
      object[key] = value;
    }
  }
  const simpleEscapeCheck = new Array(256);
  const simpleEscapeMap = new Array(256);
  for (let i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }
  function State(input, options) {
    this.input = input;
    this.filename = options["filename"] || null;
    this.schema = options["schema"] || DEFAULT_SCHEMA2;
    this.onWarning = options["onWarning"] || null;
    this.legacy = options["legacy"] || false;
    this.json = options["json"] || false;
    this.listener = options["listener"] || null;
    this.maxDepth = typeof options["maxDepth"] === "number" ? options["maxDepth"] : 100;
    this.maxTotalMergeKeys = typeof options["maxTotalMergeKeys"] === "number" ? options["maxTotalMergeKeys"] : 1e4;
    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap = this.schema.compiledTypeMap;
    this.length = input.length;
    this.position = 0;
    this.line = 0;
    this.lineStart = 0;
    this.lineIndent = 0;
    this.depth = 0;
    this.totalMergeKeys = 0;
    this.firstTabInLine = -1;
    this.documents = [];
    this.anchorMapTransactions = [];
  }
  function generateError(state, message) {
    const mark = {
      name: state.filename,
      buffer: state.input.slice(0, -1),
      // omit trailing \0
      position: state.position,
      line: state.line,
      column: state.position - state.lineStart
    };
    mark.snippet = makeSnippet(mark);
    return new YAMLException2(message, mark);
  }
  function throwError(state, message) {
    throw generateError(state, message);
  }
  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }
  function storeAnchor(state, name, value) {
    const transactions = state.anchorMapTransactions;
    if (transactions.length !== 0) {
      const transaction = transactions[transactions.length - 1];
      if (!_hasOwnProperty.call(transaction, name)) {
        transaction[name] = {
          existed: _hasOwnProperty.call(state.anchorMap, name),
          value: state.anchorMap[name]
        };
      }
    }
    state.anchorMap[name] = value;
  }
  function beginAnchorTransaction(state) {
    state.anchorMapTransactions.push(/* @__PURE__ */ Object.create(null));
  }
  function commitAnchorTransaction(state) {
    const transaction = state.anchorMapTransactions.pop();
    const transactions = state.anchorMapTransactions;
    if (transactions.length === 0) return;
    const parent = transactions[transactions.length - 1];
    const names = Object.keys(transaction);
    for (let index = 0, length = names.length; index < length; index += 1) {
      const name = names[index];
      if (!_hasOwnProperty.call(parent, name)) {
        parent[name] = transaction[name];
      }
    }
  }
  function rollbackAnchorTransaction(state) {
    const transaction = state.anchorMapTransactions.pop();
    const names = Object.keys(transaction);
    for (let index = names.length - 1; index >= 0; index -= 1) {
      const entry = transaction[names[index]];
      if (entry.existed) {
        state.anchorMap[names[index]] = entry.value;
      } else {
        delete state.anchorMap[names[index]];
      }
    }
  }
  function snapshotState(state) {
    return {
      position: state.position,
      line: state.line,
      lineStart: state.lineStart,
      lineIndent: state.lineIndent,
      firstTabInLine: state.firstTabInLine,
      tag: state.tag,
      anchor: state.anchor,
      kind: state.kind,
      result: state.result
    };
  }
  function restoreState(state, snapshot) {
    state.position = snapshot.position;
    state.line = snapshot.line;
    state.lineStart = snapshot.lineStart;
    state.lineIndent = snapshot.lineIndent;
    state.firstTabInLine = snapshot.firstTabInLine;
    state.tag = snapshot.tag;
    state.anchor = snapshot.anchor;
    state.kind = snapshot.kind;
    state.result = snapshot.result;
  }
  const directiveHandlers = {
    YAML: function handleYamlDirective(state, name, args) {
      if (state.version !== null) {
        throwError(state, "duplication of %YAML directive");
      }
      if (args.length !== 1) {
        throwError(state, "YAML directive accepts exactly one argument");
      }
      const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
      if (match === null) {
        throwError(state, "ill-formed argument of the YAML directive");
      }
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      if (major !== 1) {
        throwError(state, "unacceptable YAML version of the document");
      }
      state.version = args[0];
      state.checkLineBreaks = minor < 2;
      if (minor !== 1 && minor !== 2) {
        throwWarning(state, "unsupported YAML version of the document");
      }
    },
    TAG: function handleTagDirective(state, name, args) {
      let prefix;
      if (args.length !== 2) {
        throwError(state, "TAG directive accepts exactly two arguments");
      }
      const handle = args[0];
      prefix = args[1];
      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
      }
      if (_hasOwnProperty.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }
      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
      }
      try {
        prefix = decodeURIComponent(prefix);
      } catch (err) {
        throwError(state, "tag prefix is malformed: " + prefix);
      }
      state.tagMap[handle] = prefix;
    }
  };
  function captureSegment(state, start, end, checkJson) {
    if (start < end) {
      const _result = state.input.slice(start, end);
      if (checkJson) {
        for (let _position = 0, _length = _result.length; _position < _length; _position += 1) {
          const _character = _result.charCodeAt(_position);
          if (!(_character === 9 || _character >= 32 && _character <= 1114111)) {
            throwError(state, "expected valid JSON character");
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, "the stream contains non-printable characters");
      }
      state.result += _result;
    }
  }
  function chargeMergeWork(state) {
    state.totalMergeKeys++;
    if (state.maxTotalMergeKeys !== -1 && state.totalMergeKeys > state.maxTotalMergeKeys) {
      throwError(state, "merge keys exceeded maxTotalMergeKeys (" + state.maxTotalMergeKeys + ")");
    }
  }
  function mergeMappings(state, destination, source, overridableKeys) {
    if (!common2.isObject(source)) {
      throwError(state, "cannot merge mappings; the provided source object is unacceptable");
    }
    chargeMergeWork(state);
    const sourceKeys = Object.keys(source);
    for (let index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      const key = sourceKeys[index];
      chargeMergeWork(state);
      if (!_hasOwnProperty.call(destination, key)) {
        setProperty(destination, key, source[key]);
        overridableKeys[key] = true;
      }
    }
  }
  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);
      for (let index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, "nested arrays are not supported inside keys");
        }
        if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
          keyNode[index] = "[object Object]";
        }
      }
    }
    if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
      keyNode = "[object Object]";
    }
    keyNode = String(keyNode);
    if (_result === null) {
      _result = {};
    }
    if (keyTag === "tag:yaml.org,2002:merge") {
      if (Array.isArray(valueNode)) {
        if (valueNode.length > 100) {
          throwError(state, "abnormal merge sequence size");
        }
        for (let index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.lineStart = startLineStart || state.lineStart;
        state.position = startPos || state.position;
        throwError(state, "duplicated mapping key");
      }
      setProperty(_result, keyNode, valueNode);
      delete overridableKeys[keyNode];
    }
    return _result;
  }
  function readLineBreak(state) {
    const ch = state.input.charCodeAt(state.position);
    if (ch === 10) {
      state.position++;
    } else if (ch === 13) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 10) {
        state.position++;
      }
    } else {
      throwError(state, "a line break is expected");
    }
    state.line += 1;
    state.lineStart = state.position;
    state.firstTabInLine = -1;
  }
  function skipSeparationSpace(state, allowComments, checkIndent) {
    let lineBreaks = 0;
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      while (isWhiteSpace(ch)) {
        if (ch === 9 && state.firstTabInLine === -1) {
          state.firstTabInLine = state.position;
        }
        ch = state.input.charCodeAt(++state.position);
      }
      if (allowComments && ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 10 && ch !== 13 && ch !== 0);
      }
      if (isEol(ch)) {
        readLineBreak(state);
        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;
        while (ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, "deficient indentation");
    }
    return lineBreaks;
  }
  function testDocumentSeparator(state) {
    let _position = state.position;
    let ch = state.input.charCodeAt(_position);
    if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
      _position += 3;
      ch = state.input.charCodeAt(_position);
      if (ch === 0 || isWsOrEol(ch)) {
        return true;
      }
    }
    return false;
  }
  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += " ";
    } else if (count > 1) {
      state.result += common2.repeat("\n", count - 1);
    }
  }
  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    let captureStart;
    let captureEnd;
    let hasPendingContent;
    let _line;
    let _lineStart;
    let _lineIndent;
    const _kind = state.kind;
    const _result = state.result;
    let ch = state.input.charCodeAt(state.position);
    if (isWsOrEol(ch) || isFlowIndicator(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
      return false;
    }
    if (ch === 63 || ch === 45) {
      const following = state.input.charCodeAt(state.position + 1);
      if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
        return false;
      }
    }
    state.kind = "scalar";
    state.result = "";
    captureStart = captureEnd = state.position;
    hasPendingContent = false;
    while (ch !== 0) {
      if (ch === 58) {
        const following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
          break;
        }
      } else if (ch === 35) {
        const preceding = state.input.charCodeAt(state.position - 1);
        if (isWsOrEol(preceding)) {
          break;
        }
      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && isFlowIndicator(ch)) {
        break;
      } else if (isEol(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);
        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }
      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }
      if (!isWhiteSpace(ch)) {
        captureEnd = state.position + 1;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result) {
      return true;
    }
    state.kind = _kind;
    state.result = _result;
    return false;
  }
  function readSingleQuotedScalar(state, nodeIndent) {
    let captureStart;
    let captureEnd;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 39) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 39) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (ch === 39) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }
      } else if (isEol(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a single quoted scalar");
      } else {
        state.position++;
        if (!isWhiteSpace(ch)) {
          captureEnd = state.position;
        }
      }
    }
    throwError(state, "unexpected end of the stream within a single quoted scalar");
  }
  function readDoubleQuotedScalar(state, nodeIndent) {
    let captureStart;
    let captureEnd;
    let tmp;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 34) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 34) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;
      } else if (ch === 92) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (isEol(ch)) {
          skipSeparationSpace(state, false, nodeIndent);
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;
        } else if ((tmp = escapedHexLen(ch)) > 0) {
          let hexLength = tmp;
          let hexResult = 0;
          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);
            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;
            } else {
              throwError(state, "expected hexadecimal character");
            }
          }
          state.result += charFromCodepoint(hexResult);
          state.position++;
        } else {
          throwError(state, "unknown escape sequence");
        }
        captureStart = captureEnd = state.position;
      } else if (isEol(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a double quoted scalar");
      } else {
        state.position++;
        if (!isWhiteSpace(ch)) {
          captureEnd = state.position;
        }
      }
    }
    throwError(state, "unexpected end of the stream within a double quoted scalar");
  }
  function readFlowCollection(state, nodeIndent) {
    let readNext = true;
    let _line;
    let _lineStart;
    let _pos;
    const _tag = state.tag;
    let _result;
    const _anchor = state.anchor;
    let terminator;
    let isPair;
    let isExplicitPair;
    let isMapping;
    const overridableKeys = /* @__PURE__ */ Object.create(null);
    let keyNode;
    let keyTag;
    let valueNode;
    let ch = state.input.charCodeAt(state.position);
    if (ch === 91) {
      terminator = 93;
      isMapping = false;
      _result = [];
    } else if (ch === 123) {
      terminator = 125;
      isMapping = true;
      _result = {};
    } else {
      return false;
    }
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, _result);
    }
    ch = state.input.charCodeAt(++state.position);
    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? "mapping" : "sequence";
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, "missed comma between flow collection entries");
      } else if (ch === 44) {
        throwError(state, "expected the node content, but found ','");
      }
      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;
      if (ch === 63) {
        const following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }
      _line = state.line;
      _lineStart = state.lineStart;
      _pos = state.position;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if ((isExplicitPair || state.line === _line) && ch === 58) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }
      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
      } else {
        _result.push(keyNode);
      }
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === 44) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }
    throwError(state, "unexpected end of the stream within a flow collection");
  }
  function readBlockScalar(state, nodeIndent) {
    let folding;
    let chomping = CHOMPING_CLIP;
    let didReadContent = false;
    let detectedIndent = false;
    let textIndent = nodeIndent;
    let emptyLines = 0;
    let atMoreIndented = false;
    let tmp;
    let ch = state.input.charCodeAt(state.position);
    if (ch === 124) {
      folding = false;
    } else if (ch === 62) {
      folding = true;
    } else {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
      if (ch === 43 || ch === 45) {
        if (CHOMPING_CLIP === chomping) {
          chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, "repeat of a chomping mode identifier");
        }
      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, "repeat of an indentation width identifier");
        }
      } else {
        break;
      }
    }
    if (isWhiteSpace(ch)) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (isWhiteSpace(ch));
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (!isEol(ch) && ch !== 0);
      }
    }
    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;
      ch = state.input.charCodeAt(state.position);
      while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }
      if (isEol(ch)) {
        emptyLines++;
        continue;
      }
      if (!detectedIndent && textIndent === 0) {
        throwError(state, "missing indentation for block scalar");
      }
      if (state.lineIndent < textIndent) {
        if (chomping === CHOMPING_KEEP) {
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) {
            state.result += "\n";
          }
        }
        break;
      }
      if (folding) {
        if (isWhiteSpace(ch)) {
          atMoreIndented = true;
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common2.repeat("\n", emptyLines + 1);
        } else if (emptyLines === 0) {
          if (didReadContent) {
            state.result += " ";
          }
        } else {
          state.result += common2.repeat("\n", emptyLines);
        }
      } else {
        state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      }
      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      const captureStart = state.position;
      while (!isEol(ch) && ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, state.position, false);
    }
    return true;
  }
  function readBlockSequence(state, nodeIndent) {
    const _tag = state.tag;
    const _anchor = state.anchor;
    const _result = [];
    let detected = false;
    if (state.firstTabInLine !== -1) return false;
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, _result);
    }
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, "tab characters must not be used in indentation");
      }
      if (ch !== 45) {
        break;
      }
      const following = state.input.charCodeAt(state.position + 1);
      if (!isWsOrEol(following)) {
        break;
      }
      detected = true;
      state.position++;
      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }
      const _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, "bad indentation of a sequence entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "sequence";
      state.result = _result;
      return true;
    }
    return false;
  }
  function readBlockMapping(state, nodeIndent, flowIndent) {
    let allowCompact;
    let _keyLine;
    let _keyLineStart;
    let _keyPos;
    const _tag = state.tag;
    const _anchor = state.anchor;
    const _result = {};
    const overridableKeys = /* @__PURE__ */ Object.create(null);
    let keyTag = null;
    let keyNode = null;
    let valueNode = null;
    let atExplicitKey = false;
    let detected = false;
    if (state.firstTabInLine !== -1) return false;
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, _result);
    }
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (!atExplicitKey && state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, "tab characters must not be used in indentation");
      }
      const following = state.input.charCodeAt(state.position + 1);
      const _line = state.line;
      if ((ch === 63 || ch === 58) && isWsOrEol(following)) {
        if (ch === 63) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
          atExplicitKey = false;
          allowCompact = true;
        } else {
          throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
        }
        state.position += 1;
        ch = following;
      } else {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
        if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
          break;
        }
        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);
          while (isWhiteSpace(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 58) {
            ch = state.input.charCodeAt(++state.position);
            if (!isWsOrEol(ch)) {
              throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
            }
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;
          } else if (detected) {
            throwError(state, "can not read an implicit mapping pair; a colon is missed");
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        } else if (detected) {
          throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      }
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (atExplicitKey) {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
        }
        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }
        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, "bad indentation of a mapping entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "mapping";
      state.result = _result;
    }
    return detected;
  }
  function readTagProperty(state) {
    let isVerbatim = false;
    let isNamed = false;
    let tagHandle;
    let tagName;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 33) return false;
    if (state.tag !== null) {
      throwError(state, "duplication of a tag property");
    }
    ch = state.input.charCodeAt(++state.position);
    if (ch === 60) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);
    } else if (ch === 33) {
      isNamed = true;
      tagHandle = "!!";
      ch = state.input.charCodeAt(++state.position);
    } else {
      tagHandle = "!";
    }
    let _position = state.position;
    if (isVerbatim) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0 && ch !== 62);
      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, "unexpected end of the stream within a verbatim tag");
      }
    } else {
      while (ch !== 0 && !isWsOrEol(ch)) {
        if (ch === 33) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);
            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, "named tag handle cannot contain such characters");
            }
            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, "tag suffix cannot contain exclamation marks");
          }
        }
        ch = state.input.charCodeAt(++state.position);
      }
      tagName = state.input.slice(_position, state.position);
      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, "tag suffix cannot contain flow indicator characters");
      }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, "tag name cannot contain such characters: " + tagName);
    }
    try {
      tagName = decodeURIComponent(tagName);
    } catch (err) {
      throwError(state, "tag name is malformed: " + tagName);
    }
    if (isVerbatim) {
      state.tag = tagName;
    } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === "!") {
      state.tag = "!" + tagName;
    } else if (tagHandle === "!!") {
      state.tag = "tag:yaml.org,2002:" + tagName;
    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }
    return true;
  }
  function readAnchorProperty(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 38) return false;
    if (state.anchor !== null) {
      throwError(state, "duplication of an anchor property");
    }
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an anchor node must contain at least one character");
    }
    state.anchor = state.input.slice(_position, state.position);
    return true;
  }
  function readAlias(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 42) return false;
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an alias node must contain at least one character");
    }
    const alias = state.input.slice(_position, state.position);
    if (!_hasOwnProperty.call(state.anchorMap, alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }
    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }
  function tryReadBlockMappingFromProperty(state, propertyStart, nodeIndent, flowIndent) {
    const fallbackState = snapshotState(state);
    beginAnchorTransaction(state);
    restoreState(state, propertyStart);
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    if (readBlockMapping(state, nodeIndent, flowIndent) && state.kind === "mapping") {
      commitAnchorTransaction(state);
      return true;
    }
    rollbackAnchorTransaction(state);
    restoreState(state, fallbackState);
    return false;
  }
  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    let allowBlockScalars;
    let allowBlockCollections;
    let indentStatus = 1;
    let atNewLine = false;
    let hasContent = false;
    let propertyStart = null;
    let type2;
    let flowIndent;
    let blockIndent;
    if (state.depth >= state.maxDepth) {
      throwError(state, "nesting exceeded maxDepth (" + state.maxDepth + ")");
    }
    state.depth += 1;
    if (state.listener !== null) {
      state.listener("open", state);
    }
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    const allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }
    if (indentStatus === 1) {
      while (true) {
        const ch = state.input.charCodeAt(state.position);
        const propertyState = snapshotState(state);
        if (atNewLine && (ch === 33 && state.tag !== null || ch === 38 && state.anchor !== null)) {
          break;
        }
        if (!readTagProperty(state) && !readAnchorProperty(state)) {
          break;
        }
        if (propertyStart === null) {
          propertyStart = propertyState;
        }
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }
    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }
      blockIndent = state.position - state.lineStart;
      if (indentStatus === 1) {
        if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          const ch = state.input.charCodeAt(state.position);
          if (propertyStart !== null && allowBlockStyles && !allowBlockCollections && ch !== 124 && ch !== 62 && tryReadBlockMappingFromProperty(
            state,
            propertyStart,
            propertyStart.position - propertyStart.lineStart,
            flowIndent
          )) {
            hasContent = true;
          } else if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;
          } else if (readAlias(state)) {
            hasContent = true;
            if (state.tag !== null || state.anchor !== null) {
              throwError(state, "alias node should not have any properties");
            }
          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;
            if (state.tag === null) {
              state.tag = "?";
            }
          }
          if (state.anchor !== null) {
            storeAnchor(state, state.anchor, state.result);
          }
        }
      } else if (indentStatus === 0) {
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }
    if (state.tag === null) {
      if (state.anchor !== null) {
        storeAnchor(state, state.anchor, state.result);
      }
    } else if (state.tag === "?") {
      if (state.result !== null && state.kind !== "scalar") {
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      }
      for (let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type2 = state.implicitTypes[typeIndex];
        if (type2.resolve(state.result)) {
          state.result = type2.construct(state.result);
          state.tag = type2.tag;
          if (state.anchor !== null) {
            storeAnchor(state, state.anchor, state.result);
          }
          break;
        }
      }
    } else if (state.tag !== "!") {
      if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
        type2 = state.typeMap[state.kind || "fallback"][state.tag];
      } else {
        type2 = null;
        const typeList = state.typeMap.multi[state.kind || "fallback"];
        for (let typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
          if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
            type2 = typeList[typeIndex];
            break;
          }
        }
      }
      if (!type2) {
        throwError(state, "unknown tag !<" + state.tag + ">");
      }
      if (state.result !== null && type2.kind !== state.kind) {
        throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
      }
      if (!type2.resolve(state.result, state.tag)) {
        throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
      } else {
        state.result = type2.construct(state.result, state.tag);
        if (state.anchor !== null) {
          storeAnchor(state, state.anchor, state.result);
        }
      }
    }
    if (state.listener !== null) {
      state.listener("close", state);
    }
    state.depth -= 1;
    return state.tag !== null || state.anchor !== null || hasContent;
  }
  function readDocument(state) {
    const documentStart = state.position;
    let hasDirectives = false;
    let ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = /* @__PURE__ */ Object.create(null);
    state.anchorMap = /* @__PURE__ */ Object.create(null);
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if (state.lineIndent > 0 || ch !== 37) {
        break;
      }
      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      let _position = state.position;
      while (ch !== 0 && !isWsOrEol(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      const directiveName = state.input.slice(_position, state.position);
      const directiveArgs = [];
      if (directiveName.length < 1) {
        throwError(state, "directive name must not be less than one character in length");
      }
      while (ch !== 0) {
        while (isWhiteSpace(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0 && !isEol(ch));
          break;
        }
        if (isEol(ch)) break;
        _position = state.position;
        while (ch !== 0 && !isWsOrEol(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveArgs.push(state.input.slice(_position, state.position));
      }
      if (ch !== 0) readLineBreak(state);
      if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
      throwError(state, "directives end mark is expected");
    }
    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, "non-ASCII line breaks are interpreted as content");
    }
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
      if (state.input.charCodeAt(state.position) === 46) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }
    if (state.position < state.length - 1) {
      throwError(state, "end of the stream or a document separator is expected");
    }
  }
  function loadDocuments(input, options) {
    input = String(input);
    options = options || {};
    if (input.length !== 0) {
      if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
        input += "\n";
      }
      if (input.charCodeAt(0) === 65279) {
        input = input.slice(1);
      }
    }
    const state = new State(input, options);
    const nullpos = input.indexOf("\0");
    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, "null byte is not allowed in input");
    }
    state.input += "\0";
    while (state.input.charCodeAt(state.position) === 32) {
      state.lineIndent += 1;
      state.position += 1;
    }
    while (state.position < state.length - 1) {
      readDocument(state);
    }
    return state.documents;
  }
  function loadAll2(input, iterator, options) {
    if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
      options = iterator;
      iterator = null;
    }
    const documents = loadDocuments(input, options);
    if (typeof iterator !== "function") {
      return documents;
    }
    for (let index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }
  function load2(input, options) {
    const documents = loadDocuments(input, options);
    if (documents.length === 0) {
      return void 0;
    } else if (documents.length === 1) {
      return documents[0];
    }
    throw new YAMLException2("expected a single document in the stream, but found more");
  }
  loader.loadAll = loadAll2;
  loader.load = load2;
  return loader;
}
var dumper = {};
var hasRequiredDumper;
function requireDumper() {
  if (hasRequiredDumper) return dumper;
  hasRequiredDumper = 1;
  const common2 = requireCommon();
  const YAMLException2 = requireException();
  const DEFAULT_SCHEMA2 = require_default();
  const _toString = Object.prototype.toString;
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const CHAR_BOM = 65279;
  const CHAR_TAB = 9;
  const CHAR_LINE_FEED = 10;
  const CHAR_CARRIAGE_RETURN = 13;
  const CHAR_SPACE = 32;
  const CHAR_EXCLAMATION = 33;
  const CHAR_DOUBLE_QUOTE = 34;
  const CHAR_SHARP = 35;
  const CHAR_PERCENT = 37;
  const CHAR_AMPERSAND = 38;
  const CHAR_SINGLE_QUOTE = 39;
  const CHAR_ASTERISK = 42;
  const CHAR_COMMA = 44;
  const CHAR_MINUS = 45;
  const CHAR_COLON = 58;
  const CHAR_EQUALS = 61;
  const CHAR_GREATER_THAN = 62;
  const CHAR_QUESTION = 63;
  const CHAR_COMMERCIAL_AT = 64;
  const CHAR_LEFT_SQUARE_BRACKET = 91;
  const CHAR_RIGHT_SQUARE_BRACKET = 93;
  const CHAR_GRAVE_ACCENT = 96;
  const CHAR_LEFT_CURLY_BRACKET = 123;
  const CHAR_VERTICAL_LINE = 124;
  const CHAR_RIGHT_CURLY_BRACKET = 125;
  const ESCAPE_SEQUENCES = {};
  ESCAPE_SEQUENCES[0] = "\\0";
  ESCAPE_SEQUENCES[7] = "\\a";
  ESCAPE_SEQUENCES[8] = "\\b";
  ESCAPE_SEQUENCES[9] = "\\t";
  ESCAPE_SEQUENCES[10] = "\\n";
  ESCAPE_SEQUENCES[11] = "\\v";
  ESCAPE_SEQUENCES[12] = "\\f";
  ESCAPE_SEQUENCES[13] = "\\r";
  ESCAPE_SEQUENCES[27] = "\\e";
  ESCAPE_SEQUENCES[34] = '\\"';
  ESCAPE_SEQUENCES[92] = "\\\\";
  ESCAPE_SEQUENCES[133] = "\\N";
  ESCAPE_SEQUENCES[160] = "\\_";
  ESCAPE_SEQUENCES[8232] = "\\L";
  ESCAPE_SEQUENCES[8233] = "\\P";
  const DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ];
  const DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function compileStyleMap(schema2, map2) {
    if (map2 === null) return {};
    const result = {};
    const keys = Object.keys(map2);
    for (let index = 0, length = keys.length; index < length; index += 1) {
      let tag = keys[index];
      let style = String(map2[tag]);
      if (tag.slice(0, 2) === "!!") {
        tag = "tag:yaml.org,2002:" + tag.slice(2);
      }
      const type2 = schema2.compiledTypeMap["fallback"][tag];
      if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
        style = type2.styleAliases[style];
      }
      result[tag] = style;
    }
    return result;
  }
  function encodeHex(character) {
    let handle;
    let length;
    const string = character.toString(16).toUpperCase();
    if (character <= 255) {
      handle = "x";
      length = 2;
    } else if (character <= 65535) {
      handle = "u";
      length = 4;
    } else if (character <= 4294967295) {
      handle = "U";
      length = 8;
    } else {
      throw new YAMLException2("code point within a string may not be greater than 0xFFFFFFFF");
    }
    return "\\" + handle + common2.repeat("0", length - string.length) + string;
  }
  const QUOTING_TYPE_SINGLE = 1;
  const QUOTING_TYPE_DOUBLE = 2;
  function State(options) {
    this.schema = options["schema"] || DEFAULT_SCHEMA2;
    this.indent = Math.max(1, options["indent"] || 2);
    this.noArrayIndent = options["noArrayIndent"] || false;
    this.skipInvalid = options["skipInvalid"] || false;
    this.flowLevel = common2.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
    this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
    this.sortKeys = options["sortKeys"] || false;
    this.lineWidth = options["lineWidth"] || 80;
    this.noRefs = options["noRefs"] || false;
    this.noCompatMode = options["noCompatMode"] || false;
    this.condenseFlow = options["condenseFlow"] || false;
    this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
    this.forceQuotes = options["forceQuotes"] || false;
    this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;
    this.tag = null;
    this.result = "";
    this.duplicates = [];
    this.usedDuplicates = null;
  }
  function indentString(string, spaces) {
    const ind = common2.repeat(" ", spaces);
    let position = 0;
    let result = "";
    const length = string.length;
    while (position < length) {
      let line;
      const next = string.indexOf("\n", position);
      if (next === -1) {
        line = string.slice(position);
        position = length;
      } else {
        line = string.slice(position, next + 1);
        position = next + 1;
      }
      if (line.length && line !== "\n") result += ind;
      result += line;
    }
    return result;
  }
  function generateNextLine(state, level) {
    return "\n" + common2.repeat(" ", state.indent * level);
  }
  function testImplicitResolving(state, str2) {
    for (let index = 0, length = state.implicitTypes.length; index < length; index += 1) {
      const type2 = state.implicitTypes[index];
      if (type2.resolve(str2)) {
        return true;
      }
    }
    return false;
  }
  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
  }
  function isPrintable(c) {
    return c >= 32 && c <= 126 || c >= 161 && c <= 55295 && c !== 8232 && c !== 8233 || c >= 57344 && c <= 65533 && c !== CHAR_BOM || c >= 65536 && c <= 1114111;
  }
  function isNsCharOrWhitespace(c) {
    return isPrintable(c) && c !== CHAR_BOM && // - b-char
    c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
  }
  function isPlainSafe(c, prev, inblock) {
    const cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
    const cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
    return (
      // ns-plain-safe
      (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && // - c-flow-indicator
      c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && // ns-plain-char
      c !== CHAR_SHARP && // false on '#'
      !(prev === CHAR_COLON && !cIsNsChar) || // false on ': '
      isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || // change to true on '[^ ]#'
      prev === CHAR_COLON && cIsNsChar
    );
  }
  function isPlainSafeFirst(c) {
    return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && // | “%” | “@” | “`”)
    c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
  }
  function isPlainSafeLast(c) {
    return !isWhitespace(c) && c !== CHAR_COLON;
  }
  function codePointAt(string, pos) {
    const first = string.charCodeAt(pos);
    let second;
    if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
      second = string.charCodeAt(pos + 1);
      if (second >= 56320 && second <= 57343) {
        return (first - 55296) * 1024 + second - 56320 + 65536;
      }
    }
    return first;
  }
  function needIndentIndicator(string) {
    const leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
  }
  const STYLE_PLAIN = 1;
  const STYLE_SINGLE = 2;
  const STYLE_LITERAL = 3;
  const STYLE_FOLDED = 4;
  const STYLE_DOUBLE = 5;
  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
    let i;
    let char = 0;
    let prevChar = null;
    let hasLineBreak = false;
    let hasFoldableLine = false;
    const shouldTrackWidth = lineWidth !== -1;
    let previousLineBreak = -1;
    let plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
    if (singleLineOnly || forceQuotes) {
      for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
        char = codePointAt(string, i);
        if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
    } else {
      for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
        char = codePointAt(string, i);
        if (char === CHAR_LINE_FEED) {
          hasLineBreak = true;
          if (shouldTrackWidth) {
            hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
            i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
            previousLineBreak = i;
          }
        } else if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
      hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
    }
    if (!hasLineBreak && !hasFoldableLine) {
      if (plain && !forceQuotes && !testAmbiguousType(string)) {
        return STYLE_PLAIN;
      }
      return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
    }
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
      return STYLE_DOUBLE;
    }
    if (!forceQuotes) {
      return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  function writeScalar(state, string, level, iskey, inblock) {
    state.dump = (function() {
      if (string.length === 0) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
      }
      if (!state.noCompatMode) {
        if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
          return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
        }
      }
      const indent = state.indent * Math.max(1, level);
      const lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
      const singleLineOnly = iskey || // No block styles in flow mode.
      state.flowLevel > -1 && level >= state.flowLevel;
      function testAmbiguity(string2) {
        return testImplicitResolving(state, string2);
      }
      switch (chooseScalarStyle(
        string,
        singleLineOnly,
        state.indent,
        lineWidth,
        testAmbiguity,
        state.quotingType,
        state.forceQuotes && !iskey,
        inblock
      )) {
        case STYLE_PLAIN:
          return string;
        case STYLE_SINGLE:
          return "'" + string.replace(/'/g, "''") + "'";
        case STYLE_LITERAL:
          return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
        case STYLE_FOLDED:
          return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
        case STYLE_DOUBLE:
          return '"' + escapeString(string) + '"';
        default:
          throw new YAMLException2("impossible error: invalid scalar style");
      }
    })();
  }
  function blockHeader(string, indentPerLevel) {
    const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
    const clip = string[string.length - 1] === "\n";
    const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
    const chomp = keep ? "+" : clip ? "" : "-";
    return indentIndicator + chomp + "\n";
  }
  function dropEndingNewline(string) {
    return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
  }
  function foldString(string, width) {
    const lineRe = /(\n+)([^\n]*)/g;
    let result = (function() {
      let nextLF = string.indexOf("\n");
      nextLF = nextLF !== -1 ? nextLF : string.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string.slice(0, nextLF), width);
    })();
    let prevMoreIndented = string[0] === "\n" || string[0] === " ";
    let moreIndented;
    let match;
    while (match = lineRe.exec(string)) {
      const prefix = match[1];
      const line = match[2];
      moreIndented = line[0] === " ";
      result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
      prevMoreIndented = moreIndented;
    }
    return result;
  }
  function foldLine(line, width) {
    if (line === "" || line[0] === " ") return line;
    const breakRe = / [^ ]/g;
    let match;
    let start = 0;
    let end;
    let curr = 0;
    let next = 0;
    let result = "";
    while (match = breakRe.exec(line)) {
      next = match.index;
      if (next - start > width) {
        end = curr > start ? curr : next;
        result += "\n" + line.slice(start, end);
        start = end + 1;
      }
      curr = next;
    }
    result += "\n";
    if (line.length - start > width && curr > start) {
      result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
    } else {
      result += line.slice(start);
    }
    return result.slice(1);
  }
  function escapeString(string) {
    let result = "";
    let char = 0;
    for (let i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      const escapeSeq = ESCAPE_SEQUENCES[char];
      if (!escapeSeq && isPrintable(char)) {
        result += string[i];
        if (char >= 65536) result += string[i + 1];
      } else {
        result += escapeSeq || encodeHex(char);
      }
    }
    return result;
  }
  function writeFlowSequence(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
      let value = object[index];
      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      }
      if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
        if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = "[" + _result + "]";
  }
  function writeBlockSequence(state, level, object, compact) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
      let value = object[index];
      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      }
      if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
        if (!compact || _result !== "") {
          _result += generateNextLine(state, level);
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          _result += "-";
        } else {
          _result += "- ";
        }
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = _result || "[]";
  }
  function writeFlowMapping(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    const objectKeyList = Object.keys(object);
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
      let pairBuffer = "";
      if (_result !== "") pairBuffer += ", ";
      if (state.condenseFlow) pairBuffer += '"';
      const objectKey = objectKeyList[index];
      let objectValue = object[objectKey];
      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }
      if (!writeNode(state, level, objectKey, false, false)) {
        continue;
      }
      if (state.dump.length > 1024) pairBuffer += "? ";
      pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
      if (!writeNode(state, level, objectValue, false, false)) {
        continue;
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = "{" + _result + "}";
  }
  function writeBlockMapping(state, level, object, compact) {
    let _result = "";
    const _tag = state.tag;
    const objectKeyList = Object.keys(object);
    if (state.sortKeys === true) {
      objectKeyList.sort();
    } else if (typeof state.sortKeys === "function") {
      objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
      throw new YAMLException2("sortKeys must be a boolean or a function");
    }
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
      let pairBuffer = "";
      if (!compact || _result !== "") {
        pairBuffer += generateNextLine(state, level);
      }
      const objectKey = objectKeyList[index];
      let objectValue = object[objectKey];
      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }
      if (!writeNode(state, level + 1, objectKey, true, true, true)) {
        continue;
      }
      const explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
      if (explicitPair) {
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += "?";
        } else {
          pairBuffer += "? ";
        }
      }
      pairBuffer += state.dump;
      if (explicitPair) {
        pairBuffer += generateNextLine(state, level);
      }
      if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
        continue;
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += ":";
      } else {
        pairBuffer += ": ";
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}";
  }
  function detectType(state, object, explicit) {
    const typeList = explicit ? state.explicitTypes : state.implicitTypes;
    for (let index = 0, length = typeList.length; index < length; index += 1) {
      const type2 = typeList[index];
      if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
        if (explicit) {
          if (type2.multi && type2.representName) {
            state.tag = type2.representName(object);
          } else {
            state.tag = type2.tag;
          }
        } else {
          state.tag = "?";
        }
        if (type2.represent) {
          const style = state.styleMap[type2.tag] || type2.defaultStyle;
          let _result;
          if (_toString.call(type2.represent) === "[object Function]") {
            _result = type2.represent(object, style);
          } else if (_hasOwnProperty.call(type2.represent, style)) {
            _result = type2.represent[style](object, style);
          } else {
            throw new YAMLException2("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
          }
          state.dump = _result;
        }
        return true;
      }
    }
    return false;
  }
  function writeNode(state, level, object, block, compact, iskey, isblockseq) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
      detectType(state, object, true);
    }
    const type2 = _toString.call(state.dump);
    const inblock = block;
    if (block) {
      block = state.flowLevel < 0 || state.flowLevel > level;
    }
    const objectOrArray = type2 === "[object Object]" || type2 === "[object Array]";
    let duplicateIndex;
    let duplicate;
    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
      compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
      state.dump = "*ref_" + duplicateIndex;
    } else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
        state.usedDuplicates[duplicateIndex] = true;
      }
      if (type2 === "[object Object]") {
        if (block && Object.keys(state.dump).length !== 0) {
          writeBlockMapping(state, level, state.dump, compact);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowMapping(state, level, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object Array]") {
        if (block && state.dump.length !== 0) {
          if (state.noArrayIndent && !isblockseq && level > 0) {
            writeBlockSequence(state, level - 1, state.dump, compact);
          } else {
            writeBlockSequence(state, level, state.dump, compact);
          }
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowSequence(state, level, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object String]") {
        if (state.tag !== "?") {
          writeScalar(state, state.dump, level, iskey, inblock);
        }
      } else if (type2 === "[object Undefined]") {
        return false;
      } else {
        if (state.skipInvalid) return false;
        throw new YAMLException2("unacceptable kind of an object to dump " + type2);
      }
      if (state.tag !== null && state.tag !== "?") {
        let tagStr = encodeURI(
          state.tag[0] === "!" ? state.tag.slice(1) : state.tag
        ).replace(/!/g, "%21");
        if (state.tag[0] === "!") {
          tagStr = "!" + tagStr;
        } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
          tagStr = "!!" + tagStr.slice(18);
        } else {
          tagStr = "!<" + tagStr + ">";
        }
        state.dump = tagStr + " " + state.dump;
      }
    }
    return true;
  }
  function getDuplicateReferences(object, state) {
    const objects = [];
    const duplicatesIndexes = [];
    inspectNode(object, objects, duplicatesIndexes);
    const length = duplicatesIndexes.length;
    for (let index = 0; index < length; index += 1) {
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
  }
  function inspectNode(object, objects, duplicatesIndexes) {
    if (object !== null && typeof object === "object") {
      const index = objects.indexOf(object);
      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1) {
          duplicatesIndexes.push(index);
        }
      } else {
        objects.push(object);
        if (Array.isArray(object)) {
          for (let i = 0, length = object.length; i < length; i += 1) {
            inspectNode(object[i], objects, duplicatesIndexes);
          }
        } else {
          const objectKeyList = Object.keys(object);
          for (let i = 0, length = objectKeyList.length; i < length; i += 1) {
            inspectNode(object[objectKeyList[i]], objects, duplicatesIndexes);
          }
        }
      }
    }
  }
  function dump2(input, options) {
    options = options || {};
    const state = new State(options);
    if (!state.noRefs) getDuplicateReferences(input, state);
    let value = input;
    if (state.replacer) {
      value = state.replacer.call({ "": value }, "", value);
    }
    if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
    return "";
  }
  dumper.dump = dump2;
  return dumper;
}
var hasRequiredJsYaml;
function requireJsYaml() {
  if (hasRequiredJsYaml) return jsYaml;
  hasRequiredJsYaml = 1;
  const loader2 = requireLoader();
  const dumper2 = requireDumper();
  function renamed(from, to) {
    return function() {
      throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
    };
  }
  jsYaml.Type = requireType();
  jsYaml.Schema = requireSchema();
  jsYaml.FAILSAFE_SCHEMA = requireFailsafe();
  jsYaml.JSON_SCHEMA = requireJson();
  jsYaml.CORE_SCHEMA = requireCore();
  jsYaml.DEFAULT_SCHEMA = require_default();
  jsYaml.load = loader2.load;
  jsYaml.loadAll = loader2.loadAll;
  jsYaml.dump = dumper2.dump;
  jsYaml.YAMLException = requireException();
  jsYaml.types = {
    binary: requireBinary(),
    float: requireFloat(),
    map: requireMap(),
    null: require_null(),
    pairs: requirePairs(),
    set: requireSet(),
    timestamp: requireTimestamp(),
    bool: requireBool(),
    int: requireInt(),
    merge: requireMerge(),
    omap: requireOmap(),
    seq: requireSeq(),
    str: requireStr()
  };
  jsYaml.safeLoad = renamed("safeLoad", "load");
  jsYaml.safeLoadAll = renamed("safeLoadAll", "loadAll");
  jsYaml.safeDump = renamed("safeDump", "dump");
  return jsYaml;
}
var jsYamlExports = requireJsYaml();
var yaml = /* @__PURE__ */ getDefaultExportFromCjs(jsYamlExports);
var {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
  safeLoad,
  safeLoadAll,
  safeDump
} = yaml;

// src/manifest.ts
var ManifestError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ManifestError";
  }
};
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function extractFence(md, fence) {
  const openRe = new RegExp(
    "^```" + escapeRegex(fence) + "[^\\n]*\\n([\\s\\S]*?)\\n```",
    "m"
  );
  const m = md.match(openRe);
  return m ? m[1] : null;
}
var VALID_SOURCES = [
  "market",
  "github",
  "github-release",
  "local"
];
function asString(v, field) {
  if (typeof v !== "string" || v.length === 0) {
    throw new ManifestError(`\u5B57\u6BB5 ${field} \u5FC5\u987B\u662F\u975E\u7A7A\u5B57\u7B26\u4E32`);
  }
  return v;
}
function asBool(v, field) {
  if (v === void 0 || v === null) return void 0;
  if (typeof v !== "boolean") {
    throw new ManifestError(`\u5B57\u6BB5 ${field} \u5FC5\u987B\u662F\u5E03\u5C14\u503C`);
  }
  return v;
}
function asStringArray(v, field) {
  if (v === void 0 || v === null) return void 0;
  if (!Array.isArray(v)) {
    throw new ManifestError(`\u5B57\u6BB5 ${field} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u6570\u7EC4`);
  }
  return v.map((x, i) => asString(x, `${field}[${i}]`));
}
function assertNoPlaintextSecrets(config, path3) {
  if (config === null || config === void 0) return;
  if (typeof config === "string") {
    const looksLikeSecret = /(secret|password|token|api[_-]?key|apikey)/i.test(
      path3
    );
    const isAllowedRef = ALLOWED_SECRET_PREFIXES.some(
      (p) => config.startsWith(p)
    );
    if (looksLikeSecret && !isAllowedRef) {
      throw new ManifestError(
        `\u5B57\u6BB5 ${path3} \u7591\u4F3C\u5BC6\u94A5\uFF0C\u5FC5\u987B\u4F7F\u7528 keychain: / env: \u5F15\u7528\uFF0C\u4E0D\u5F97\u660E\u6587`
      );
    }
    return;
  }
  if (typeof config === "object") {
    for (const [k, v] of Object.entries(config)) {
      assertNoPlaintextSecrets(v, path3 ? `${path3}.${k}` : k);
    }
  }
}
function parsePluginsManifest(md) {
  const body = extractFence(md, PLUGINS_FENCE) ?? md;
  let raw;
  try {
    raw = yaml.load(body);
  } catch (e) {
    throw new ManifestError(
      `plugins.md YAML \u89E3\u6790\u5931\u8D25\uFF1A${e.message}`
    );
  }
  if (!raw || typeof raw !== "object") {
    throw new ManifestError("plugins.md \u9876\u5C42\u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61");
  }
  const obj = raw;
  const version = typeof obj.version === "number" ? obj.version : 1;
  const profile = typeof obj.profile === "string" ? obj.profile : void 0;
  const sourcesRaw = obj.sources ?? {};
  const market = asString(sourcesRaw.market ?? "dsh-market", "sources.market");
  const allow_github_orgs = asStringArray(
    sourcesRaw.allow_github_orgs,
    "sources.allow_github_orgs"
  );
  const pluginsRaw = obj.plugins;
  if (!Array.isArray(pluginsRaw)) {
    throw new ManifestError("plugins \u5FC5\u987B\u662F\u6570\u7EC4");
  }
  const plugins = pluginsRaw.map((p, i) => {
    const item = p;
    const id = asString(item.id, `plugins[${i}].id`);
    const sourceStr = asString(item.source, `plugins[${i}].source`);
    if (!VALID_SOURCES.includes(sourceStr)) {
      throw new ManifestError(
        `plugins[${i}].source "${sourceStr}" \u975E\u6CD5\uFF0C\u5141\u8BB8\uFF1A${VALID_SOURCES.join(", ")}`
      );
    }
    const source = sourceStr;
    if (EXCLUDED_BINARY_PROJECTS.includes(id)) {
      throw new ManifestError(
        `plugins[${i}].id "${id}" \u5C5E\u4E8E\u9884\u7F16\u8BD1\u4E8C\u8FDB\u5236\u9879\u76EE\uFF0C\u9ED8\u8BA4\u6392\u9664\uFF0C\u4E0D\u5F97\u7EB3\u5165\u6E05\u5355`
      );
    }
    if (source === "github" || source === "github-release") {
      const org = id.includes("/") ? id.split("/")[0] : id;
      if (!allow_github_orgs || !allow_github_orgs.includes(org)) {
      }
    }
    const config = item.config;
    if (config !== void 0) {
      assertNoPlaintextSecrets(config, "config");
    }
    return {
      id,
      source,
      required: asBool(item.required, `plugins[${i}].required`),
      manual: asBool(item.manual, `plugins[${i}].manual`),
      precheck: typeof item.precheck === "string" ? item.precheck : void 0,
      profile: typeof item.profile === "string" ? item.profile : void 0,
      config,
      notes: typeof item.notes === "string" ? item.notes : void 0,
      version: typeof item.version === "string" ? item.version : void 0
    };
  });
  return { version, profile, sources: { market, allow_github_orgs }, plugins };
}
function parseSkillEntry(s, path3) {
  const item = s;
  return {
    id: asString(item.id, `${path3}.id`),
    source: asString(item.source, `${path3}.source`),
    enabled: asBool(item.enabled, `${path3}.enabled`) ?? false,
    scope: item.scope === "project" || item.scope === "global" ? item.scope : void 0
  };
}
function parseSkillsManifest(md) {
  const body = extractFence(md, SKILLS_FENCE) ?? md;
  let raw;
  try {
    raw = yaml.load(body);
  } catch (e) {
    throw new ManifestError(
      `skills.md YAML \u89E3\u6790\u5931\u8D25\uFF1A${e.message}`
    );
  }
  if (!raw || typeof raw !== "object") {
    throw new ManifestError("skills.md \u9876\u5C42\u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61");
  }
  const obj = raw;
  const version = typeof obj.version === "number" ? obj.version : 1;
  const manager = typeof obj.manager === "string" ? obj.manager : void 0;
  const skills = [];
  let internalGitlabGroup;
  const categoriesRaw = obj.categories;
  if (categoriesRaw && typeof categoriesRaw === "object") {
    const cats = categoriesRaw;
    for (const catName of Object.keys(cats)) {
      if (!SKILL_CATEGORIES.includes(catName)) {
        throw new ManifestError(
          `\u672A\u77E5\u6280\u80FD\u5206\u7C7B\uFF1A${catName}\uFF08\u5141\u8BB8\uFF1A${SKILL_CATEGORIES.join(", ")}\uFF09`
        );
      }
      const catVal = cats[catName];
      let catSkills;
      let gitlabGroup;
      if (Array.isArray(catVal)) {
        catSkills = catVal;
      } else if (catVal && typeof catVal === "object") {
        const co = catVal;
        catSkills = co.skills;
        if (typeof co.gitlab_group === "string") gitlabGroup = co.gitlab_group;
      } else {
        throw new ManifestError(`\u5206\u7C7B ${catName} \u5FC5\u987B\u662F\u6570\u7EC4\u6216\u542B skills \u7684\u5BF9\u8C61`);
      }
      if (!Array.isArray(catSkills)) {
        throw new ManifestError(`\u5206\u7C7B ${catName} \u7F3A\u5C11 skills \u6570\u7EC4`);
      }
      if (catName === "internal") internalGitlabGroup = gitlabGroup;
      catSkills.forEach((s, i) => {
        const entry = parseSkillEntry(s, `${catName}[${i}]`);
        entry.category = catName;
        skills.push(entry);
      });
    }
  } else if (Array.isArray(obj.skills)) {
    obj.skills.forEach((s, i) => {
      skills.push(parseSkillEntry(s, `skills[${i}]`));
    });
  } else {
    throw new ManifestError("skills.md \u5FC5\u987B\u5305\u542B categories \u6216 skills");
  }
  return { version, manager, skills, internalGitlabGroup };
}
function isRestrictedSource(source) {
  return RESTRICTED_SOURCES.includes(source);
}

// src/state.ts
var import_fs = require("fs");
var path = __toESM(require("path"));
var FsStateIO = class {
  constructor(filePath) {
    this.filePath = filePath;
  }
  async read() {
    try {
      return await import_fs.promises.readFile(this.filePath, "utf8");
    } catch (e) {
      if (e.code === "ENOENT") return null;
      throw e;
    }
  }
  async write(content) {
    await import_fs.promises.mkdir(path.dirname(this.filePath), { recursive: true });
    await import_fs.promises.writeFile(this.filePath, content, "utf8");
  }
};
function emptyState() {
  return { version: STATE_SCHEMA_VERSION, profiles: {} };
}
function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalize).join(",") + "]";
  }
  const obj = value;
  const keys = Object.keys(obj).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
}
function djb2(input) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) + h + input.charCodeAt(i) >>> 0;
  }
  return h.toString(16);
}
function computeEntryHash(entry) {
  return djb2(
    canonicalize({
      id: entry.id,
      source: entry.source,
      version: entry.version ?? null,
      config: entry.config ?? null
    })
  );
}
function computeSkillHash(entry) {
  return djb2(
    canonicalize({
      id: entry.id,
      source: entry.source,
      scope: entry.scope ?? null
    })
  );
}
function resolvePlugin(entry, st, local, newHash) {
  const id = entry.id;
  if (st?.status === "removed_by_user") {
    if (local.exists) {
      const hashChanged = st.hash !== void 0 && st.hash !== newHash;
      return {
        displayStatus: "installed",
        action: hashChanged ? "update" : "skip",
        reason: "\u4F60\u624B\u52A8\u88C5\u56DE\u4E86\u8BE5\u63D2\u4EF6\uFF0C\u5DF2\u81EA\u52A8\u6062\u590D\u7BA1\u7406" + (hashChanged ? "\uFF1B\u6E05\u5355\u914D\u7F6E\u5DF2\u53D8\u5316\uFF0C\u5C06\u6309\u9700\u66F4\u65B0" : ""),
        transition: "clear-tombstone"
      };
    }
    const configChanged = st.hash !== void 0 && st.hash !== newHash;
    return {
      displayStatus: "removed_by_user",
      action: "skip",
      reason: "\u4F60\u5DF2\u672C\u5730\u79FB\u9664\uFF1B\u624B\u52A8\u88C5\u56DE\u540E\u81EA\u52A8\u6062\u590D\u7BA1\u7406" + (configChanged ? "\uFF08\u6709\u914D\u7F6E\u66F4\u65B0\u4F46\u56E0\u5DF2\u79FB\u9664\u672A\u5E94\u7528\uFF09" : ""),
      hasConfigUpdate: configChanged
    };
  }
  if (st?.status === "installed") {
    if (local.exists) {
      const manifestNewer = entry.version !== void 0 && st.version !== void 0 && entry.version > st.version;
      const hashChanged = st.hash !== newHash;
      if (manifestNewer || hashChanged) {
        return {
          displayStatus: "installed",
          action: "update",
          reason: manifestNewer ? "\u6E05\u5355\u7248\u672C\u66F4\u9AD8" : "\u6E05\u5355\u914D\u7F6E hash \u5DF2\u53D8\u5316"
        };
      }
      return {
        displayStatus: "installed",
        action: "skip",
        reason: "\u5DF2\u5B89\u88C5\u4E14\u7248\u672C\u4E00\u81F4"
      };
    }
    return {
      displayStatus: "removed_by_user",
      action: "skip",
      reason: "\u68C0\u6D4B\u5230\u672C\u5730\u5DF2\u79FB\u9664\uFF0C\u5DF2\u6807\u8BB0\u5893\u7891\uFF08install \u65F6\u5199\u5165\uFF09",
      transition: "mark-tombstone"
    };
  }
  if (st?.status === "failed") {
    return {
      displayStatus: "failed",
      action: "retry",
      reason: "\u4E0A\u6B21\u5B89\u88C5\u5931\u8D25\uFF0C\u5F85\u91CD\u8BD5" + (st.failureReason ? `\uFF1A${st.failureReason}` : "")
    };
  }
  if (st?.status === "pending" || st === void 0) {
    if (local.exists) {
      return {
        displayStatus: "installed",
        action: "skip",
        reason: "\u672C\u5730\u5DF2\u5B58\u5728\uFF0C\u7EB3\u5165\u53D7\u7BA1\uFF08install \u65F6\u8BB0\u5F55\uFF09",
        transition: "adopt-installed"
      };
    }
    return {
      displayStatus: "pending",
      action: "install",
      reason: "\u4ECE\u672A\u5B89\u88C5"
    };
  }
  return {
    displayStatus: "manual",
    action: "skip",
    reason: "\u624B\u52A8\u9879\uFF0C\u53EA\u63D0\u793A"
  };
}
var StateManager = class {
  constructor(state, profile) {
    this.state = state;
    this.profile = profile;
  }
  /** 取得（必要时创建）当前 profile 的状态分区。 */
  profileState() {
    let p = this.state.profiles[this.profile];
    if (!p) {
      p = { plugins: {}, skills: {}, removalLog: [] };
      this.state.profiles[this.profile] = p;
    }
    return p;
  }
  getPlugin(id) {
    return this.profileState().plugins[id];
  }
  setPlugin(id, st) {
    this.profileState().plugins[id] = st;
  }
  /** 标记安装成功。 */
  markInstalled(id, version, hash) {
    this.setPlugin(id, {
      status: "installed",
      version,
      hash,
      lastInstalledAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  /** 标记安装失败。 */
  markFailed(id, reason) {
    const prev = this.getPlugin(id);
    this.setPlugin(id, {
      status: "failed",
      version: prev?.version,
      hash: prev?.hash,
      lastInstalledAt: prev?.lastInstalledAt,
      failureReason: reason,
      failedAttempts: (prev?.failedAttempts ?? 0) + 1
    });
  }
  /** 标记为墓碑，并追加 removalLog（只追加）。 */
  markRemovedByUser(id, lastKnownVersion, reason) {
    const prev = this.getPlugin(id);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.setPlugin(id, {
      status: "removed_by_user",
      lastKnownVersion: lastKnownVersion ?? prev?.version,
      version: void 0,
      hash: prev?.hash,
      lastInstalledAt: prev?.lastInstalledAt,
      removedDetectedAt: now,
      removalReason: reason
    });
    this.appendRemovalLog({
      id,
      detectedAt: now,
      lastKnownVersion: lastKnownVersion ?? prev?.version,
      note: `${reason} \u2192 tombstoned`
    });
  }
  /** 清除墓碑：仅把状态改回 installed，不动 removalLog 历史。 */
  clearTombstone(id, version, hash) {
    const prev = this.getPlugin(id);
    this.setPlugin(id, {
      status: "installed",
      version,
      hash,
      lastInstalledAt: (/* @__PURE__ */ new Date()).toISOString(),
      // 保留历史线索（不影响状态机）
      removedDetectedAt: prev?.removedDetectedAt
    });
  }
  /** 纳入受管：本地已存在但无记录。 */
  adoptInstalled(id, version, hash) {
    this.setPlugin(id, {
      status: "installed",
      version,
      hash,
      lastInstalledAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  /** 标记为手动项（持久化以便 verify 报告；不影响安装）。 */
  markManual(id) {
    const prev = this.getPlugin(id);
    this.setPlugin(id, {
      status: "manual",
      version: prev?.version,
      hash: prev?.hash,
      lastInstalledAt: prev?.lastInstalledAt
    });
  }
  /** 追加 removalLog 记录（只追加，永不修改历史）。 */
  appendRemovalLog(entry) {
    this.profileState().removalLog.push(entry);
  }
  /** 取得所有 failed 插件（用于 resume）。 */
  getFailedPlugins() {
    const ps = this.profileState();
    return Object.entries(ps.plugins).filter(([, st]) => st.status === "failed").map(([id, st]) => ({ id, st }));
  }
  // ── Skill 状态 ──
  getSkill(id) {
    return this.profileState().skills[id];
  }
  markSkillSynced(id, hash) {
    this.profileState().skills[id] = {
      status: "synced",
      hash,
      lastSyncedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  markSkillFailed(id, reason) {
    const prev = this.getSkill(id);
    this.profileState().skills[id] = {
      status: "failed",
      source: prev?.source,
      hash: prev?.hash,
      failureReason: reason
    };
  }
  markSkillManualSync(id) {
    this.profileState().skills[id] = {
      status: "manual_sync_required",
      ...this.getSkill(id)
    };
  }
};
async function loadState(io, profile) {
  const raw = await io.read();
  if (raw === null) {
    return new StateManager(emptyState(), profile);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `\u72B6\u6001\u6587\u4EF6\u89E3\u6790\u5931\u8D25\uFF1A${e.message}`
    );
  }
  const state = normalizeState(parsed);
  return new StateManager(state, profile);
}
function normalizeState(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return emptyState();
  }
  const obj = parsed;
  const version = obj.version === 2 ? 2 : STATE_SCHEMA_VERSION;
  const profilesRaw = obj.profiles ?? {};
  const profiles = {};
  for (const [name, pv] of Object.entries(profilesRaw)) {
    const p = pv ?? {};
    profiles[name] = {
      plugins: p.plugins ?? {},
      skills: p.skills ?? {},
      removalLog: Array.isArray(p.removalLog) ? p.removalLog : []
    };
  }
  return { version, profiles };
}
async function saveState(mgr, io) {
  const content = JSON.stringify(mgr.state, null, 2);
  await io.write(content);
}
function pluginsByStatus(mgr, status) {
  const ps = mgr.profileState();
  return Object.entries(ps.plugins).filter(([, st]) => st.status === status).map(([id]) => id);
}

// src/plan.ts
function matchesProfile(entry, profile) {
  if (entry.profile === void 0) return true;
  return entry.profile === profile;
}
function effectiveManual(entry, allowGithubOrgs) {
  if (entry.manual === true) return true;
  if (!isRestrictedSource(entry.source)) return false;
  if (entry.manual === false) {
    const org = entry.id.includes("/") ? entry.id.split("/")[0] : entry.id;
    return !(allowGithubOrgs && allowGithubOrgs.includes(org));
  }
  return true;
}
async function probeLocal(probe, id) {
  const exists = await probe.isInstalled(id);
  let version;
  if (exists && probe.getInstalledVersion) {
    try {
      version = await probe.getInstalledVersion(id);
    } catch {
      version = void 0;
    }
  }
  return { exists, version };
}
function pluginPlanItem(entry, resolved) {
  return {
    resource: "plugin",
    id: entry.id,
    type: "plugin",
    status: resolved.displayStatus,
    action: resolved.action,
    reason: resolved.reason,
    entry,
    required: entry.required,
    manual: entry.manual,
    hasConfigUpdate: resolved.hasConfigUpdate,
    transition: resolved.transition
  };
}
function skillPlanItem(skill, status, action, reason) {
  return {
    resource: "skill",
    id: skill.id,
    type: "skill",
    status,
    action,
    reason,
    entry: skill
  };
}
async function buildPlan(mgr, input, probe) {
  const items = [];
  const allowOrgs = input.plugins.sources.allow_github_orgs;
  for (const entry of input.plugins.plugins) {
    if (!matchesProfile(entry, input.profile)) continue;
    if (effectiveManual(entry, allowOrgs)) {
      items.push({
        resource: "plugin",
        id: entry.id,
        type: "plugin",
        status: "manual",
        action: "manual",
        reason: entry.notes?.trim() ? `\u624B\u52A8\u5B89\u88C5\uFF1A${entry.notes.trim().split("\n")[0]}` : "\u624B\u52A8\u9879\uFF0C\u53EA\u63D0\u793A\u4E0D\u81EA\u52A8\u5B89\u88C5",
        entry,
        required: entry.required,
        manual: true
      });
      continue;
    }
    const st = mgr.getPlugin(entry.id);
    const local = await probeLocal(probe, entry.id);
    const newHash = computeEntryHash(entry);
    const resolved = resolvePlugin(entry, st, local, newHash);
    items.push(pluginPlanItem(entry, resolved));
  }
  if (input.skills) {
    for (const skill of input.skills.skills) {
      const newHash = computeSkillHash(skill);
      const st = mgr.getSkill(skill.id);
      const tag = skill.category === "internal" ? "\u3010\u5185\u90E8\u6280\u80FD\u3011" : "";
      if (!skill.enabled) {
        items.push(
          skillPlanItem(skill, "disabled", "skip", `${tag}\u6E05\u5355\u5DF2\u7981\u7528\uFF08enabled:false\uFF09`)
        );
        continue;
      }
      const needAsk = skill.category === "internal" && input.skills.internalGitlabGroup === GITLAB_GROUP_ASK;
      if (st?.status === "synced" && st.hash === newHash) {
        items.push(skillPlanItem(skill, "synced", "skip", `${tag}\u5DF2\u540C\u6B65\u4E14\u672A\u53D8\u5316`));
      } else {
        const base = st?.status === "synced" ? "Skill \u5185\u5BB9\u53D8\u5316\uFF0C\u9700\u91CD\u65B0\u540C\u6B65" : "\u672A\u540C\u6B65";
        const suffix = needAsk ? "\uFF08sync-skills \u65F6\u8BE2\u95EE GitLab \u5206\u7EC4\uFF09" : "";
        items.push(
          skillPlanItem(
            skill,
            st?.status ?? "pending",
            "sync",
            `${tag}${base}${suffix}`
          )
        );
      }
    }
  }
  return items;
}

// src/types.ts
var ExitCode = {
  Ok: 0,
  PartialFailure: 1,
  PrecheckBlocked: 2
};

// src/executor.ts
function sanitizeConfig(config) {
  if (!config) return void 0;
  const out = {};
  for (const [k, v] of Object.entries(config)) {
    if (typeof v === "string" && /(secret|password|token|api[_-]?key)/i.test(k)) {
      out[k] = v.startsWith("keychain:") || v.startsWith("env:") ? v : "<redacted>";
    } else if (v && typeof v === "object") {
      out[k] = sanitizeConfig(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
async function runPrecheck(host, entry) {
  if (!entry.precheck) return { ok: true };
  try {
    const ok = await host.precheck.run(entry.precheck, entry.id);
    return ok ? { ok: true } : { ok: false, reason: `\u9884\u68C0 ${entry.precheck} \u672A\u901A\u8FC7` };
  } catch (e) {
    return { ok: false, reason: `\u9884\u68C0 ${entry.precheck} \u5F02\u5E38\uFF1A${e.message}` };
  }
}
async function executeInstall(host, mgr, items, continueOnError) {
  const result = {
    exitCode: ExitCode.Ok,
    succeeded: [],
    failed: [],
    skipped: [],
    manual: []
  };
  let blocked = false;
  for (const item of items) {
    if (item.resource === "skill") continue;
    const entry = item.entry;
    const id = item.id;
    if (item.action === "manual" || item.manual) {
      mgr.markManual(id);
      result.manual.push(id);
      host.ui.info(`\u2022 ${id}\uFF1A\u624B\u52A8\u9879\uFF0C\u53EA\u63D0\u793A\uFF08\u4E0D\u81EA\u52A8\u5B89\u88C5\uFF09`);
      continue;
    }
    if (item.action === "skip") {
      await applyTransition(host, mgr, item, entry);
      result.skipped.push(id);
      continue;
    }
    await applyTransition(host, mgr, item, entry);
    const pre = await runPrecheck(host, entry);
    if (!pre.ok) {
      mgr.markFailed(id, pre.reason ?? "\u9884\u68C0\u672A\u901A\u8FC7");
      result.failed.push(id);
      host.ui.warn(`\u2717 ${id}\uFF1A${pre.reason}`);
      if (entry.required) {
        blocked = true;
        if (!continueOnError) break;
      }
      continue;
    }
    if (!host.market.available) {
      mgr.markFailed(id, "dsh-market \u4E0D\u53EF\u7528\uFF0C\u8BF7\u5148\u5B89\u88C5 dsh-market");
      result.failed.push(id);
      host.ui.warn(`\u2717 ${id}\uFF1Adsh-market \u4E0D\u53EF\u7528`);
      if (entry.required && !continueOnError) break;
      continue;
    }
    try {
      const opts = {
        version: entry.version,
        config: sanitizeConfig(entry.config)
      };
      const res = item.action === "update" ? await host.market.update(id, opts) : await host.market.install(id, opts);
      const version = res?.version ?? entry.version;
      mgr.markInstalled(id, version, computeEntryHash(entry));
      result.succeeded.push(id);
      host.ui.info(`\u2713 ${id}\uFF1A${item.action === "update" ? "\u5DF2\u66F4\u65B0" : "\u5DF2\u5B89\u88C5"}${version ? ` (${version})` : ""}`);
    } catch (e) {
      const reason = e.message;
      mgr.markFailed(id, reason);
      result.failed.push(id);
      host.ui.warn(`\u2717 ${id}\uFF1A\u5B89\u88C5\u5931\u8D25 \u2014 ${reason}`);
      if (entry.required && !continueOnError) break;
    }
  }
  if (blocked) result.exitCode = ExitCode.PrecheckBlocked;
  else if (result.failed.length > 0) result.exitCode = ExitCode.PartialFailure;
  return result;
}
async function applyTransition(host, mgr, item, entry) {
  const id = item.id;
  const hash = computeEntryHash(entry);
  switch (item.transition) {
    case "mark-tombstone": {
      const prev = mgr.getPlugin(id);
      mgr.markRemovedByUser(
        id,
        prev?.version,
        "local_missing"
      );
      host.ui.warn(`\u2022 ${id}\uFF1A\u68C0\u6D4B\u5230\u672C\u5730\u5DF2\u79FB\u9664\uFF0C\u5DF2\u6807\u8BB0\u5893\u7891`);
      break;
    }
    case "clear-tombstone": {
      const version = host.plugins.getInstalledVersion ? await host.plugins.getInstalledVersion(id).catch(() => void 0) : void 0;
      mgr.clearTombstone(id, version, hash);
      host.ui.info(`\u2022 ${id}\uFF1A\u68C0\u6D4B\u5230\u672C\u5730\u91CD\u65B0\u5B58\u5728\uFF0C\u5DF2\u6E05\u9664\u5893\u7891\u5E76\u6062\u590D\u7BA1\u7406`);
      break;
    }
    case "adopt-installed": {
      const version = host.plugins.getInstalledVersion ? await host.plugins.getInstalledVersion(id).catch(() => void 0) : void 0;
      mgr.adoptInstalled(id, version, hash);
      host.ui.info(`\u2022 ${id}\uFF1A\u672C\u5730\u5DF2\u5B58\u5728\uFF0C\u5DF2\u7EB3\u5165\u53D7\u7BA1`);
      break;
    }
    default:
      break;
  }
}
async function executeResume(host, mgr, entries, continueOnError) {
  const result = {
    exitCode: ExitCode.Ok,
    succeeded: [],
    failed: [],
    skipped: [],
    manual: []
  };
  const failed = mgr.getFailedPlugins();
  if (failed.length === 0) {
    host.ui.info("\u6CA1\u6709 failed \u9879\u9700\u8981\u91CD\u8BD5\u3002");
    return result;
  }
  for (const { id } of failed) {
    const entry = entries.get(id);
    if (!entry) {
      host.ui.warn(`\u2717 ${id}\uFF1A\u6E05\u5355\u4E2D\u5DF2\u65E0\u8BE5\u9879\uFF0C\u8DF3\u8FC7\uFF08\u4E0D\u78B0\u5893\u7891\uFF09`);
      result.skipped.push(id);
      continue;
    }
    const st = mgr.getPlugin(id);
    if (st?.status === "removed_by_user") {
      result.skipped.push(id);
      continue;
    }
    const pre = await runPrecheck(host, entry);
    if (!pre.ok) {
      mgr.markFailed(id, pre.reason ?? "\u9884\u68C0\u672A\u901A\u8FC7");
      result.failed.push(id);
      host.ui.warn(`\u2717 ${id}\uFF1A${pre.reason}`);
      if (entry.required && !continueOnError) {
        result.exitCode = ExitCode.PrecheckBlocked;
        break;
      }
      continue;
    }
    if (!host.market.available) {
      mgr.markFailed(id, "dsh-market \u4E0D\u53EF\u7528");
      result.failed.push(id);
      if (entry.required && !continueOnError) break;
      continue;
    }
    try {
      const opts = {
        version: entry.version,
        config: sanitizeConfig(entry.config)
      };
      const res = await host.market.install(id, opts);
      mgr.markInstalled(id, res?.version ?? entry.version, computeEntryHash(entry));
      result.succeeded.push(id);
      host.ui.info(`\u2713 ${id}\uFF1A\u91CD\u8BD5\u6210\u529F`);
    } catch (e) {
      mgr.markFailed(id, e.message);
      result.failed.push(id);
      host.ui.warn(`\u2717 ${id}\uFF1A\u91CD\u8BD5\u5931\u8D25 \u2014 ${e.message}`);
      if (entry.required && !continueOnError) break;
    }
  }
  if (result.failed.length > 0 && result.exitCode === ExitCode.Ok) {
    result.exitCode = ExitCode.PartialFailure;
  }
  return result;
}
async function resolveInternalSkills(host, mgr, manifest, enabled) {
  const internal = enabled.filter((s) => s.category === "internal");
  if (internal.length === 0) return enabled;
  let group = manifest.internalGitlabGroup;
  if (group === GITLAB_GROUP_ASK) {
    if (host.ui.prompt) {
      host.ui.info("\u68C0\u6D4B\u5230\u5185\u90E8\u6280\u80FD\uFF0C\u9700\u8981\u5185\u90E8\u6280\u80FD\u5E02\u573A\u7684 GitLab \u5206\u7EC4\u3002");
      group = await host.ui.prompt("\u8BF7\u8F93\u5165\u5185\u90E8\u6280\u80FD\u5E02\u573A\u7684 GitLab \u5206\u7EC4\uFF08group\uFF09\uFF1A");
    } else {
      group = void 0;
    }
    if (!group || group === GITLAB_GROUP_ASK) {
      host.ui.warn("\u672A\u63D0\u4F9B\u5185\u90E8 GitLab \u5206\u7EC4\uFF1B\u5185\u90E8\u6280\u80FD\u6807\u8BB0\u4E3A manual_sync_required\u3002");
      for (const s of internal) mgr.markSkillManualSync(s.id);
      return enabled.filter((s) => s.category !== "internal");
    }
  }
  const resolved = group ?? manifest.internalGitlabGroup;
  return enabled.map(
    (s) => s.category === "internal" && resolved ? { ...s, source: s.source.split(GITLAB_GROUP_VAR).join(resolved) } : s
  );
}
async function executeSyncSkills(host, mgr, manifest, fallbackPath) {
  let enabled = manifest.skills.filter((s) => s.enabled);
  if (enabled.length === 0) {
    host.ui.info("\u6CA1\u6709\u542F\u7528\u7684 Skill \u9700\u8981\u540C\u6B65\u3002");
    return ExitCode.Ok;
  }
  enabled = await resolveInternalSkills(host, mgr, manifest, enabled);
  if (enabled.length === 0) {
    return ExitCode.PartialFailure;
  }
  if (!host.skillsConsole.available) {
    host.ui.warn("dsh-skills-console \u4E0D\u53EF\u7528\uFF0C\u964D\u7EA7\u4E3A\u751F\u6210\u6E05\u5355 + \u63D0\u793A\u624B\u52A8\u540C\u6B65\u3002");
    const consumable = JSON.stringify(
      { version: 1, manager: "dsh-skills-console", skills: enabled },
      null,
      2
    );
    try {
      await host.fs.writeFile(fallbackPath, consumable);
      host.ui.info(`\u5DF2\u751F\u6210\u53EF\u6D88\u8D39\u6E05\u5355\uFF1A${fallbackPath}`);
      host.ui.info("\u8BF7\u624B\u52A8\u6267\u884C dsh-skills-console \u540C\u6B65\u8BE5\u6E05\u5355\u3002");
    } catch (e) {
      host.ui.warn(`\u751F\u6210\u964D\u7EA7\u6E05\u5355\u5931\u8D25\uFF1A${e.message}`);
    }
    for (const s of enabled) {
      mgr.markSkillManualSync(s.id);
    }
    return ExitCode.PartialFailure;
  }
  let failed = 0;
  for (const skill of enabled) {
    try {
      await host.skillsConsole.sync(skill);
      mgr.markSkillSynced(skill.id, computeSkillHash(skill));
      host.ui.info(`\u2713 ${skill.id}\uFF1A\u5DF2\u540C\u6B65`);
    } catch (e) {
      mgr.markSkillFailed(skill.id, e.message);
      host.ui.warn(`\u2717 ${skill.id}\uFF1A\u540C\u6B65\u5931\u8D25 \u2014 ${e.message}`);
      failed++;
    }
  }
  return failed > 0 ? ExitCode.PartialFailure : ExitCode.Ok;
}

// src/verify.ts
async function verifyAll(host, mgr) {
  const lines = [];
  let problems = 0;
  const ps = mgr.profileState();
  lines.push(`Profile: ${mgr.profile}`);
  lines.push("");
  lines.push("== \u63D2\u4EF6 ==");
  const pluginIds = Object.keys(ps.plugins);
  if (pluginIds.length === 0) {
    lines.push("  \uFF08\u65E0\u53D7\u7BA1\u63D2\u4EF6\u8BB0\u5F55\uFF09");
  }
  for (const id of pluginIds) {
    const st = ps.plugins[id];
    switch (st.status) {
      case "installed": {
        const exists = await safeProbe(host, id);
        if (exists) {
          lines.push(`  \u2713 ${id} \u2014 installed${st.version ? ` (${st.version})` : ""}`);
        } else {
          lines.push(
            `  \u26A0 ${id} \u2014 state=installed \u4F46\u672C\u5730\u7F3A\u5931\uFF08\u53EA\u62A5\u544A\uFF0C\u672A\u6539\u72B6\u6001\uFF1B\u4E0B\u6B21 install \u5C06\u5199\u5893\u7891\uFF09`
          );
          problems++;
        }
        break;
      }
      case "removed_by_user":
        lines.push(
          `  \u2717 ${id} \u2014 \u5893\u7891\uFF08removed_by_user\uFF0C\u5DF2\u4E8E ${st.removedDetectedAt ?? "?"} \u68C0\u6D4B\u5230\u79FB\u9664\uFF09`
        );
        break;
      case "failed":
        lines.push(
          `  \u2717 ${id} \u2014 failed${st.failureReason ? `\uFF1A${st.failureReason}` : ""}\uFF08\u5F85 resume \u91CD\u8BD5\uFF09`
        );
        problems++;
        break;
      case "manual":
        lines.push(`  \u2022 ${id} \u2014 manual\uFF08\u624B\u52A8\u9879\uFF09`);
        break;
      default:
        lines.push(`  ? ${id} \u2014 ${st.status}`);
        break;
    }
  }
  const tombstoned = pluginsByStatus(mgr, "removed_by_user");
  if (tombstoned.length > 0) {
    lines.push("");
    lines.push(`== \u5893\u7891 (${tombstoned.length}) ==`);
    for (const e of ps.removalLog) {
      lines.push(
        `  - ${e.id} @ ${e.detectedAt}\uFF08\u6700\u540E\u5DF2\u77E5\u7248\u672C ${e.lastKnownVersion ?? "?"}\uFF09\uFF1A${e.note}`
      );
    }
  }
  lines.push("");
  lines.push("== Skill ==");
  const skillIds = Object.keys(ps.skills);
  if (skillIds.length === 0) {
    lines.push("  \uFF08\u65E0\u53D7\u7BA1 Skill \u8BB0\u5F55\uFF09");
  }
  for (const id of skillIds) {
    const st = ps.skills[id];
    switch (st.status) {
      case "synced":
        lines.push(`  \u2713 ${id} \u2014 synced`);
        break;
      case "manual_sync_required":
        lines.push(`  \u26A0 ${id} \u2014 manual_sync_required\uFF08\u9700\u624B\u52A8\u6267\u884C dsh-skills-console\uFF09`);
        problems++;
        break;
      case "failed":
        lines.push(`  \u2717 ${id} \u2014 failed${st.failureReason ? `\uFF1A${st.failureReason}` : ""}`);
        problems++;
        break;
      default:
        lines.push(`  ? ${id} \u2014 ${st.status}`);
    }
  }
  const summary = problems === 0 ? "\u5065\u5EB7\u68C0\u67E5\u901A\u8FC7\uFF1A\u6240\u6709\u53D7\u7BA1\u9879\u72B6\u6001\u6B63\u5E38\u3002" : `\u5065\u5EB7\u68C0\u67E5\u53D1\u73B0 ${problems} \u4E2A\u95EE\u9898\uFF08\u89C1\u4E0A\u65B9 \u26A0/\u2717 \u6807\u8BB0\uFF09\u3002`;
  lines.push("");
  lines.push(summary);
  return { healthy: problems === 0, lines, summary };
}
async function safeProbe(host, id) {
  try {
    return await host.plugins.isInstalled(id);
  } catch {
    return false;
  }
}

// src/ui.ts
var ACTION_LABEL = {
  install: "\u5B89\u88C5",
  update: "\u66F4\u65B0",
  sync: "\u540C\u6B65",
  skip: "\u8DF3\u8FC7",
  manual: "\u624B\u52A8\u5B89\u88C5",
  retry: "\u91CD\u8BD5",
  fail: "\u963B\u65AD"
};
var RESOURCE_LABEL = {
  plugin: "\u63D2\u4EF6",
  skill: "Skill"
};
function formatPlanTable(items) {
  const header = "| \u8D44\u6E90 | ID | \u7C7B\u578B | \u72B6\u6001 | \u52A8\u4F5C | \u539F\u56E0 |\n|---|---|---|---|---|---|";
  const rows = items.map((it) => {
    const reason = it.hasConfigUpdate ? `${it.reason}\u3010\u6709\u914D\u7F6E\u66F4\u65B0\u4F46\u56E0\u5DF2\u79FB\u9664\u672A\u5E94\u7528\u3011` : it.reason;
    return `| ${RESOURCE_LABEL[it.resource] ?? it.resource} | \`${it.id}\` | ${it.type} | ${it.status} | ${ACTION_LABEL[it.action] ?? it.action} | ${reason} |`;
  });
  return [header, ...rows].join("\n");
}
function formatInstallSummary(result) {
  const parts = [];
  parts.push(`\u6210\u529F ${result.succeeded.length}\uFF1A${result.succeeded.join(", ") || "\uFF08\u65E0\uFF09"}`);
  parts.push(`\u5931\u8D25 ${result.failed.length}\uFF1A${result.failed.join(", ") || "\uFF08\u65E0\uFF09"}`);
  parts.push(`\u8DF3\u8FC7 ${result.skipped.length}\uFF1A${result.skipped.join(", ") || "\uFF08\u65E0\uFF09"}`);
  parts.push(`\u624B\u52A8 ${result.manual.length}\uFF1A${result.manual.join(", ") || "\uFF08\u65E0\uFF09"}`);
  parts.push(`\u9000\u51FA\u7801\uFF1A${result.exitCode}`);
  return parts.join("\n");
}

// src/index.ts
var SUBCOMMANDS = [
  "plan",
  "install",
  "sync-skills",
  "resume",
  "verify"
];
var UsageError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "UsageError";
  }
};
function parseArgs(argv) {
  if (argv.length === 0) {
    throw new UsageError(
      "\u7528\u6CD5\uFF1Alz-work <plan|install|sync-skills|resume|verify> [\u9009\u9879]"
    );
  }
  const subcommand = argv[0];
  if (!SUBCOMMANDS.includes(subcommand)) {
    throw new UsageError(`\u672A\u77E5\u5B50\u547D\u4EE4\uFF1A${subcommand}\uFF08\u5141\u8BB8\uFF1A${SUBCOMMANDS.join(", ")}\uFF09`);
  }
  const args = {
    subcommand,
    profile: void 0,
    continueOnError: false
  };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === void 0) throw new UsageError(`${a} \u9700\u8981\u4E00\u4E2A\u503C`);
      return v;
    };
    if (a === "--plugins") args.plugins = next();
    else if (a === "--skills") args.skills = next();
    else if (a === "--profile") args.profile = next();
    else if (a === "--continue-on-error") args.continueOnError = true;
    else if (a.startsWith("--plugins=")) args.plugins = a.slice("--plugins=".length);
    else if (a.startsWith("--skills=")) args.skills = a.slice("--skills=".length);
    else if (a.startsWith("--profile=")) args.profile = a.slice("--profile=".length);
    else throw new UsageError(`\u672A\u77E5\u53C2\u6570\uFF1A${a}`);
  }
  return args;
}
function defaultPluginsRoot() {
  if (process.env.DSH_PLUGINS_DIR) return process.env.DSH_PLUGINS_DIR;
  const home = process.env.DSH_HOME ?? path2.join(os.homedir(), ".dsh");
  return path2.join(home, "plugins");
}
function fsProbe() {
  const root = defaultPluginsRoot();
  return {
    async isInstalled(id) {
      try {
        await import_fs2.promises.access(path2.join(root, id));
        return true;
      } catch {
        return false;
      }
    },
    async getInstalledVersion(id) {
      for (const f of ["plugin.json", "package.json"]) {
        try {
          const raw = await import_fs2.promises.readFile(path2.join(root, id, f), "utf8");
          const obj = JSON.parse(raw);
          if (typeof obj.version === "string") return obj.version;
        } catch {
        }
      }
      return void 0;
    }
  };
}
function defaultPrompt(message) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      resolve(void 0);
      return;
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(message, (ans) => {
      rl.close();
      resolve(ans?.trim() || void 0);
    });
  });
}
function buildHost(ctx, cwd) {
  const probe = fsProbe();
  const log = ctx.log ?? ((m) => console.log(m));
  const isInstalled = async (id) => {
    if (ctx.plugins?.isInstalled) {
      return await Promise.resolve(ctx.plugins.isInstalled(id));
    }
    return probe.isInstalled(id);
  };
  const getInstalledVersion = async (id) => {
    if (ctx.plugins?.getInstalledVersion) {
      return await Promise.resolve(ctx.plugins.getInstalledVersion(id));
    }
    return probe.getInstalledVersion(id);
  };
  const ctxPlugins = ctx.plugins;
  const marketSvc = ctx.get("dsh-market");
  const installFn = ctxPlugins?.installViaMarket ?? marketSvc?.install;
  const updateFn = ctxPlugins?.updateViaMarket ?? marketSvc?.update ?? installFn;
  const market = {
    available: typeof installFn === "function",
    async install(id, opts) {
      const r = await installFn(id, opts);
      return r ?? {};
    },
    async update(id, opts) {
      const fn = updateFn ?? installFn;
      const r = await fn(id, opts);
      return r ?? {};
    }
  };
  const ctxSkills = ctx.skills;
  const skillSvc = ctx.get("dsh-skills-console");
  const syncFn = ctxSkills?.syncViaSkillsConsole ?? skillSvc?.sync;
  const skillsConsole = {
    available: typeof syncFn === "function",
    async sync(skill) {
      await syncFn(skill);
    }
  };
  const precheck = {
    async run(name, pluginId) {
      const svc = ctx.get(name);
      if (!svc) {
        throw new Error(`\u9884\u68C0\u670D\u52A1 ${name} \u4E0D\u53EF\u7528`);
      }
      if (typeof svc.check === "function") {
        return Boolean(await Promise.resolve(svc.check(pluginId)));
      }
      if (typeof svc.run === "function") {
        return Boolean(await Promise.resolve(svc.run(pluginId)));
      }
      throw new Error(`\u9884\u68C0\u670D\u52A1 ${name} \u672A\u63D0\u4F9B check/run \u65B9\u6CD5`);
    }
  };
  return {
    ui: {
      print: (t) => log(t),
      info: (t) => log(t),
      warn: (t) => log(t),
      prompt: ctx.ui?.prompt ?? defaultPrompt
    },
    fs: {
      async readFile(p) {
        const abs = path2.isAbsolute(p) ? p : path2.join(cwd, p);
        return import_fs2.promises.readFile(abs, "utf8");
      },
      async writeFile(p, content) {
        const abs = path2.isAbsolute(p) ? p : path2.join(cwd, p);
        await import_fs2.promises.mkdir(path2.dirname(abs), { recursive: true });
        await import_fs2.promises.writeFile(abs, content, "utf8");
      },
      async exists(p) {
        const abs = path2.isAbsolute(p) ? p : path2.join(cwd, p);
        try {
          await import_fs2.promises.access(abs);
          return true;
        } catch {
          return false;
        }
      }
    },
    plugins: { isInstalled, getInstalledVersion },
    market,
    skillsConsole,
    precheck
  };
}
async function readPlugins(host, file) {
  const md = await host.fs.readFile(file);
  return parsePluginsManifest(md);
}
async function readSkills(host, file) {
  const md = await host.fs.readFile(file);
  return parseSkillsManifest(md);
}
function signalExit(code) {
  if (typeof process !== "undefined" && process && "exitCode" in process) {
    process.exitCode = code;
  }
}
function activate(ctx) {
  ctx.commands.register("lz-work", async (argv) => {
    let args;
    try {
      args = parseArgs(argv);
    } catch (e) {
      ctx.log?.(e.message);
      signalExit(ExitCode.PartialFailure);
      return;
    }
    const cwd = process.cwd();
    const host = buildHost(ctx, cwd);
    const profile = args.profile ?? DEFAULT_PROFILE;
    const stateIO = new FsStateIO(
      path2.isAbsolute(DEFAULT_STATE_PATH) ? DEFAULT_STATE_PATH : path2.join(cwd, DEFAULT_STATE_PATH)
    );
    try {
      switch (args.subcommand) {
        case "plan":
          await runPlan(host, stateIO, profile, args);
          signalExit(ExitCode.Ok);
          break;
        case "install":
          await runInstall(host, stateIO, profile, args);
          break;
        case "sync-skills":
          await runSyncSkills(host, stateIO, profile, args);
          break;
        case "resume":
          await runResume(host, stateIO, profile, args);
          break;
        case "verify":
          await runVerify(host, stateIO, profile);
          break;
      }
    } catch (e) {
      const msg = e instanceof ManifestError || e instanceof UsageError ? e.message : `\u6267\u884C\u5931\u8D25\uFF1A${e.message}`;
      host.ui.warn(msg);
      signalExit(ExitCode.PartialFailure);
    }
  });
}
async function runPlan(host, stateIO, profile, args) {
  const pluginsFile = args.plugins ?? "plugins.md";
  const plugins = await readPlugins(host, pluginsFile);
  let skills;
  if (args.skills) {
    skills = await readSkills(host, args.skills);
  } else {
    if (await host.fs.exists("skills.md")) {
      skills = await readSkills(host, "skills.md");
    }
  }
  const mgr = await loadState(stateIO, profile);
  const items = await buildPlan(mgr, { plugins, skills, profile }, host.plugins);
  host.ui.print(formatPlanTable(items));
}
async function runInstall(host, stateIO, profile, args) {
  const pluginsFile = args.plugins ?? "plugins.md";
  const plugins = await readPlugins(host, pluginsFile);
  let skills;
  if (args.skills) {
    skills = await readSkills(host, args.skills);
  } else if (await host.fs.exists("skills.md")) {
    skills = await readSkills(host, "skills.md");
  }
  const mgr = await loadState(stateIO, profile);
  const items = await buildPlan(mgr, { plugins, skills, profile }, host.plugins);
  host.ui.print("\u5B89\u88C5\u8BA1\u5212\uFF1A");
  host.ui.print(formatPlanTable(items));
  host.ui.print("");
  const result = await executeInstall(host, mgr, items, !!args.continueOnError);
  await saveState(mgr, stateIO);
  host.ui.print(formatInstallSummary(result));
  signalExit(result.exitCode);
}
async function runSyncSkills(host, stateIO, profile, args) {
  const skillsFile = args.skills ?? "skills.md";
  const manifest = await readSkills(host, skillsFile);
  const mgr = await loadState(stateIO, profile);
  const fallback = path2.join(path2.dirname(DEFAULT_STATE_PATH), "skills-console-manifest.json");
  const code = await executeSyncSkills(host, mgr, manifest, fallback);
  await saveState(mgr, stateIO);
  signalExit(code);
}
async function runResume(host, stateIO, profile, args) {
  const mgr = await loadState(stateIO, profile);
  const entries = /* @__PURE__ */ new Map();
  try {
    const pluginsFile = args.plugins ?? "plugins.md";
    const plugins = await readPlugins(host, pluginsFile);
    for (const p of plugins.plugins) entries.set(p.id, p);
  } catch {
    host.ui.warn("\u672A\u8BFB\u53D6\u5230 plugins.md\uFF0C\u5C06\u4EE5\u6700\u5C0F\u4FE1\u606F\u91CD\u8BD5 failed \u9879\uFF08\u65E0\u9884\u68C0/\u914D\u7F6E\uFF09\u3002");
  }
  for (const { id } of mgr.getFailedPlugins()) {
    if (!entries.has(id)) entries.set(id, { id, source: "market" });
  }
  const result = await executeResume(host, mgr, entries, !!args.continueOnError);
  await saveState(mgr, stateIO);
  host.ui.print(formatInstallSummary(result));
  signalExit(result.exitCode);
}
async function runVerify(host, stateIO, profile) {
  const mgr = await loadState(stateIO, profile);
  const report = await verifyAll(host, mgr);
  for (const line of report.lines) host.ui.print(line);
  signalExit(report.healthy ? ExitCode.Ok : ExitCode.PartialFailure);
}
var index_default = activate;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UsageError,
  activate,
  buildHost,
  parseArgs
});
