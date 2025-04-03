import {
  require_react_dom
} from "./chunk-TNTPHDQH.js";
import {
  require_react
} from "./chunk-32E4H3EV.js";
import {
  __commonJS
} from "./chunk-G3PMV62Z.js";

// node_modules/invariant/browser.js
var require_browser = __commonJS({
  "node_modules/invariant/browser.js"(exports, module) {
    "use strict";
    var invariant = function(condition, format, a, b, c, d, e, f) {
      if (true) {
        if (format === void 0) {
          throw new Error("invariant requires an error message argument");
        }
      }
      if (!condition) {
        var error;
        if (format === void 0) {
          error = new Error(
            "Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings."
          );
        } else {
          var args = [a, b, c, d, e, f];
          var argIndex = 0;
          error = new Error(
            format.replace(/%s/g, function() {
              return args[argIndex++];
            })
          );
          error.name = "Invariant Violation";
        }
        error.framesToPop = 1;
        throw error;
      }
    };
    module.exports = invariant;
  }
});

// node_modules/warning/warning.js
var require_warning = __commonJS({
  "node_modules/warning/warning.js"(exports, module) {
    "use strict";
    var __DEV__ = true;
    var warning = function() {
    };
    if (__DEV__) {
      printWarning = function printWarning2(format, args) {
        var len = arguments.length;
        args = new Array(len > 1 ? len - 1 : 0);
        for (var key = 1; key < len; key++) {
          args[key - 1] = arguments[key];
        }
        var argIndex = 0;
        var message = "Warning: " + format.replace(/%s/g, function() {
          return args[argIndex++];
        });
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
      warning = function(condition, format, args) {
        var len = arguments.length;
        args = new Array(len > 2 ? len - 2 : 0);
        for (var key = 2; key < len; key++) {
          args[key - 2] = arguments[key];
        }
        if (format === void 0) {
          throw new Error(
            "`warning(condition, format, ...args)` requires a warning message argument"
          );
        }
        if (!condition) {
          printWarning.apply(null, [format].concat(args));
        }
      };
    }
    var printWarning;
    module.exports = warning;
  }
});

// node_modules/react-input-mask/lib/react-input-mask.development.js
var require_react_input_mask_development = __commonJS({
  "node_modules/react-input-mask/lib/react-input-mask.development.js"(exports, module) {
    "use strict";
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var React = _interopDefault(require_react());
    var reactDom = require_react_dom();
    var invariant = _interopDefault(require_browser());
    var warning = _interopDefault(require_warning());
    function _defaults2(obj, defaults) {
      var keys = Object.getOwnPropertyNames(defaults);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = Object.getOwnPropertyDescriptor(defaults, key);
        if (value && value.configurable && obj[key] === void 0) {
          Object.defineProperty(obj, key, value);
        }
      }
      return obj;
    }
    function _extends() {
      _extends = Object.assign || function(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
      return _extends.apply(this, arguments);
    }
    function _inheritsLoose(subClass, superClass) {
      subClass.prototype = Object.create(superClass.prototype);
      subClass.prototype.constructor = subClass;
      _defaults2(subClass, superClass);
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
    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return self;
    }
    function setInputSelection(input, start, end) {
      if ("selectionStart" in input && "selectionEnd" in input) {
        input.selectionStart = start;
        input.selectionEnd = end;
      } else {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveStart("character", start);
        range.moveEnd("character", end - start);
        range.select();
      }
    }
    function getInputSelection(input) {
      var start = 0;
      var end = 0;
      if ("selectionStart" in input && "selectionEnd" in input) {
        start = input.selectionStart;
        end = input.selectionEnd;
      } else {
        var range = document.selection.createRange();
        if (range.parentElement() === input) {
          start = -range.moveStart("character", -input.value.length);
          end = -range.moveEnd("character", -input.value.length);
        }
      }
      return {
        start,
        end,
        length: end - start
      };
    }
    var defaultFormatChars = {
      "9": "[0-9]",
      "a": "[A-Za-z]",
      "*": "[A-Za-z0-9]"
    };
    var defaultMaskChar = "_";
    function parseMask(mask, maskChar, formatChars) {
      var parsedMaskString = "";
      var prefix = "";
      var lastEditablePosition = null;
      var permanents = [];
      if (maskChar === void 0) {
        maskChar = defaultMaskChar;
      }
      if (formatChars == null) {
        formatChars = defaultFormatChars;
      }
      if (!mask || typeof mask !== "string") {
        return {
          maskChar,
          formatChars,
          mask: null,
          prefix: null,
          lastEditablePosition: null,
          permanents: []
        };
      }
      var isPermanent = false;
      mask.split("").forEach(function(character) {
        if (!isPermanent && character === "\\") {
          isPermanent = true;
        } else {
          if (isPermanent || !formatChars[character]) {
            permanents.push(parsedMaskString.length);
            if (parsedMaskString.length === permanents.length - 1) {
              prefix += character;
            }
          } else {
            lastEditablePosition = parsedMaskString.length + 1;
          }
          parsedMaskString += character;
          isPermanent = false;
        }
      });
      return {
        maskChar,
        formatChars,
        prefix,
        mask: parsedMaskString,
        lastEditablePosition,
        permanents
      };
    }
    function isPermanentCharacter(maskOptions, pos) {
      return maskOptions.permanents.indexOf(pos) !== -1;
    }
    function isAllowedCharacter(maskOptions, pos, character) {
      var mask = maskOptions.mask, formatChars = maskOptions.formatChars;
      if (!character) {
        return false;
      }
      if (isPermanentCharacter(maskOptions, pos)) {
        return mask[pos] === character;
      }
      var ruleChar = mask[pos];
      var charRule = formatChars[ruleChar];
      return new RegExp(charRule).test(character);
    }
    function isEmpty(maskOptions, value) {
      return value.split("").every(function(character, i) {
        return isPermanentCharacter(maskOptions, i) || !isAllowedCharacter(maskOptions, i, character);
      });
    }
    function getFilledLength(maskOptions, value) {
      var maskChar = maskOptions.maskChar, prefix = maskOptions.prefix;
      if (!maskChar) {
        while (value.length > prefix.length && isPermanentCharacter(maskOptions, value.length - 1)) {
          value = value.slice(0, value.length - 1);
        }
        return value.length;
      }
      var filledLength = prefix.length;
      for (var i = value.length; i >= prefix.length; i--) {
        var character = value[i];
        var isEnteredCharacter = !isPermanentCharacter(maskOptions, i) && isAllowedCharacter(maskOptions, i, character);
        if (isEnteredCharacter) {
          filledLength = i + 1;
          break;
        }
      }
      return filledLength;
    }
    function isFilled(maskOptions, value) {
      return getFilledLength(maskOptions, value) === maskOptions.mask.length;
    }
    function formatValue(maskOptions, value) {
      var maskChar = maskOptions.maskChar, mask = maskOptions.mask, prefix = maskOptions.prefix;
      if (!maskChar) {
        value = insertString(maskOptions, "", value, 0);
        if (value.length < prefix.length) {
          value = prefix;
        }
        while (value.length < mask.length && isPermanentCharacter(maskOptions, value.length)) {
          value += mask[value.length];
        }
        return value;
      }
      if (value) {
        var emptyValue = formatValue(maskOptions, "");
        return insertString(maskOptions, emptyValue, value, 0);
      }
      for (var i = 0; i < mask.length; i++) {
        if (isPermanentCharacter(maskOptions, i)) {
          value += mask[i];
        } else {
          value += maskChar;
        }
      }
      return value;
    }
    function clearRange(maskOptions, value, start, len) {
      var end = start + len;
      var maskChar = maskOptions.maskChar, mask = maskOptions.mask, prefix = maskOptions.prefix;
      var arrayValue = value.split("");
      if (!maskChar) {
        for (var i = end; i < arrayValue.length; i++) {
          if (isPermanentCharacter(maskOptions, i)) {
            arrayValue[i] = "";
          }
        }
        start = Math.max(prefix.length, start);
        arrayValue.splice(start, end - start);
        value = arrayValue.join("");
        return formatValue(maskOptions, value);
      }
      return arrayValue.map(function(character, i2) {
        if (i2 < start || i2 >= end) {
          return character;
        }
        if (isPermanentCharacter(maskOptions, i2)) {
          return mask[i2];
        }
        return maskChar;
      }).join("");
    }
    function insertString(maskOptions, value, insertStr, insertPosition) {
      var mask = maskOptions.mask, maskChar = maskOptions.maskChar, prefix = maskOptions.prefix;
      var arrayInsertStr = insertStr.split("");
      var isInputFilled = isFilled(maskOptions, value);
      var isUsablePosition = function isUsablePosition2(pos, character) {
        return !isPermanentCharacter(maskOptions, pos) || character === mask[pos];
      };
      var isUsableCharacter = function isUsableCharacter2(character, pos) {
        return !maskChar || !isPermanentCharacter(maskOptions, pos) || character !== maskChar;
      };
      if (!maskChar && insertPosition > value.length) {
        value += mask.slice(value.length, insertPosition);
      }
      arrayInsertStr.every(function(insertCharacter) {
        while (!isUsablePosition(insertPosition, insertCharacter)) {
          if (insertPosition >= value.length) {
            value += mask[insertPosition];
          }
          if (!isUsableCharacter(insertCharacter, insertPosition)) {
            return true;
          }
          insertPosition++;
          if (insertPosition >= mask.length) {
            return false;
          }
        }
        var isAllowed = isAllowedCharacter(maskOptions, insertPosition, insertCharacter) || insertCharacter === maskChar;
        if (!isAllowed) {
          return true;
        }
        if (insertPosition < value.length) {
          if (maskChar || isInputFilled || insertPosition < prefix.length) {
            value = value.slice(0, insertPosition) + insertCharacter + value.slice(insertPosition + 1);
          } else {
            value = value.slice(0, insertPosition) + insertCharacter + value.slice(insertPosition);
            value = formatValue(maskOptions, value);
          }
        } else if (!maskChar) {
          value += insertCharacter;
        }
        insertPosition++;
        return insertPosition < mask.length;
      });
      return value;
    }
    function getInsertStringLength(maskOptions, value, insertStr, insertPosition) {
      var mask = maskOptions.mask, maskChar = maskOptions.maskChar;
      var arrayInsertStr = insertStr.split("");
      var initialInsertPosition = insertPosition;
      var isUsablePosition = function isUsablePosition2(pos, character) {
        return !isPermanentCharacter(maskOptions, pos) || character === mask[pos];
      };
      arrayInsertStr.every(function(insertCharacter) {
        while (!isUsablePosition(insertPosition, insertCharacter)) {
          insertPosition++;
          if (insertPosition >= mask.length) {
            return false;
          }
        }
        var isAllowed = isAllowedCharacter(maskOptions, insertPosition, insertCharacter) || insertCharacter === maskChar;
        if (isAllowed) {
          insertPosition++;
        }
        return insertPosition < mask.length;
      });
      return insertPosition - initialInsertPosition;
    }
    function getLeftEditablePosition(maskOptions, pos) {
      for (var i = pos; i >= 0; --i) {
        if (!isPermanentCharacter(maskOptions, i)) {
          return i;
        }
      }
      return null;
    }
    function getRightEditablePosition(maskOptions, pos) {
      var mask = maskOptions.mask;
      for (var i = pos; i < mask.length; ++i) {
        if (!isPermanentCharacter(maskOptions, i)) {
          return i;
        }
      }
      return null;
    }
    function getStringValue(value) {
      return !value && value !== 0 ? "" : value + "";
    }
    function processChange(maskOptions, value, selection, previousValue, previousSelection) {
      var mask = maskOptions.mask, prefix = maskOptions.prefix, lastEditablePosition = maskOptions.lastEditablePosition;
      var newValue = value;
      var enteredString = "";
      var formattedEnteredStringLength = 0;
      var removedLength = 0;
      var cursorPosition = Math.min(previousSelection.start, selection.start);
      if (selection.end > previousSelection.start) {
        enteredString = newValue.slice(previousSelection.start, selection.end);
        formattedEnteredStringLength = getInsertStringLength(maskOptions, previousValue, enteredString, cursorPosition);
        if (!formattedEnteredStringLength) {
          removedLength = 0;
        } else {
          removedLength = previousSelection.length;
        }
      } else if (newValue.length < previousValue.length) {
        removedLength = previousValue.length - newValue.length;
      }
      newValue = previousValue;
      if (removedLength) {
        if (removedLength === 1 && !previousSelection.length) {
          var deleteFromRight = previousSelection.start === selection.start;
          cursorPosition = deleteFromRight ? getRightEditablePosition(maskOptions, selection.start) : getLeftEditablePosition(maskOptions, selection.start);
        }
        newValue = clearRange(maskOptions, newValue, cursorPosition, removedLength);
      }
      newValue = insertString(maskOptions, newValue, enteredString, cursorPosition);
      cursorPosition = cursorPosition + formattedEnteredStringLength;
      if (cursorPosition >= mask.length) {
        cursorPosition = mask.length;
      } else if (cursorPosition < prefix.length && !formattedEnteredStringLength) {
        cursorPosition = prefix.length;
      } else if (cursorPosition >= prefix.length && cursorPosition < lastEditablePosition && formattedEnteredStringLength) {
        cursorPosition = getRightEditablePosition(maskOptions, cursorPosition);
      }
      newValue = formatValue(maskOptions, newValue);
      if (!enteredString) {
        enteredString = null;
      }
      return {
        value: newValue,
        enteredString,
        selection: {
          start: cursorPosition,
          end: cursorPosition
        }
      };
    }
    function isWindowsPhoneBrowser() {
      var windows = new RegExp("windows", "i");
      var phone = new RegExp("phone", "i");
      var ua = navigator.userAgent;
      return windows.test(ua) && phone.test(ua);
    }
    function isFunction(value) {
      return typeof value === "function";
    }
    function getRequestAnimationFrame() {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
    }
    function getCancelAnimationFrame() {
      return window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
    }
    function defer(fn) {
      var hasCancelAnimationFrame = !!getCancelAnimationFrame();
      var deferFn;
      if (hasCancelAnimationFrame) {
        deferFn = getRequestAnimationFrame();
      } else {
        deferFn = function deferFn2() {
          return setTimeout(fn, 1e3 / 60);
        };
      }
      return deferFn(fn);
    }
    function cancelDefer(deferId) {
      var cancelFn = getCancelAnimationFrame() || clearTimeout;
      cancelFn(deferId);
    }
    var InputElement = function(_React$Component) {
      _inheritsLoose(InputElement2, _React$Component);
      function InputElement2(props) {
        var _this;
        _this = _React$Component.call(this, props) || this;
        _this.focused = false;
        _this.mounted = false;
        _this.previousSelection = null;
        _this.selectionDeferId = null;
        _this.saveSelectionLoopDeferId = null;
        _this.saveSelectionLoop = function() {
          _this.previousSelection = _this.getSelection();
          _this.saveSelectionLoopDeferId = defer(_this.saveSelectionLoop);
        };
        _this.runSaveSelectionLoop = function() {
          if (_this.saveSelectionLoopDeferId === null) {
            _this.saveSelectionLoop();
          }
        };
        _this.stopSaveSelectionLoop = function() {
          if (_this.saveSelectionLoopDeferId !== null) {
            cancelDefer(_this.saveSelectionLoopDeferId);
            _this.saveSelectionLoopDeferId = null;
            _this.previousSelection = null;
          }
        };
        _this.getInputDOMNode = function() {
          if (!_this.mounted) {
            return null;
          }
          var input = reactDom.findDOMNode(_assertThisInitialized(_assertThisInitialized(_this)));
          var isDOMNode = typeof window !== "undefined" && input instanceof window.Element;
          if (input && !isDOMNode) {
            return null;
          }
          if (input.nodeName !== "INPUT") {
            input = input.querySelector("input");
          }
          if (!input) {
            throw new Error("react-input-mask: inputComponent doesn't contain input node");
          }
          return input;
        };
        _this.getInputValue = function() {
          var input = _this.getInputDOMNode();
          if (!input) {
            return null;
          }
          return input.value;
        };
        _this.setInputValue = function(value) {
          var input = _this.getInputDOMNode();
          if (!input) {
            return;
          }
          _this.value = value;
          input.value = value;
        };
        _this.setCursorToEnd = function() {
          var filledLength = getFilledLength(_this.maskOptions, _this.value);
          var pos = getRightEditablePosition(_this.maskOptions, filledLength);
          if (pos !== null) {
            _this.setCursorPosition(pos);
          }
        };
        _this.setSelection = function(start, end, options) {
          if (options === void 0) {
            options = {};
          }
          var input = _this.getInputDOMNode();
          var isFocused = _this.isFocused();
          if (!input || !isFocused) {
            return;
          }
          var _options = options, deferred = _options.deferred;
          if (!deferred) {
            setInputSelection(input, start, end);
          }
          if (_this.selectionDeferId !== null) {
            cancelDefer(_this.selectionDeferId);
          }
          _this.selectionDeferId = defer(function() {
            _this.selectionDeferId = null;
            setInputSelection(input, start, end);
          });
          _this.previousSelection = {
            start,
            end,
            length: Math.abs(end - start)
          };
        };
        _this.getSelection = function() {
          var input = _this.getInputDOMNode();
          return getInputSelection(input);
        };
        _this.getCursorPosition = function() {
          return _this.getSelection().start;
        };
        _this.setCursorPosition = function(pos) {
          _this.setSelection(pos, pos);
        };
        _this.isFocused = function() {
          return _this.focused;
        };
        _this.getBeforeMaskedValueChangeConfig = function() {
          var _this$maskOptions = _this.maskOptions, mask = _this$maskOptions.mask, maskChar = _this$maskOptions.maskChar, permanents = _this$maskOptions.permanents, formatChars = _this$maskOptions.formatChars;
          var alwaysShowMask = _this.props.alwaysShowMask;
          return {
            mask,
            maskChar,
            permanents,
            alwaysShowMask: !!alwaysShowMask,
            formatChars
          };
        };
        _this.isInputAutofilled = function(value, selection, previousValue, previousSelection) {
          var input = _this.getInputDOMNode();
          try {
            if (input.matches(":-webkit-autofill")) {
              return true;
            }
          } catch (e) {
          }
          if (!_this.focused) {
            return true;
          }
          return previousSelection.end < previousValue.length && selection.end === value.length;
        };
        _this.onChange = function(event) {
          var _assertThisInitialize = _assertThisInitialized(_assertThisInitialized(_this)), beforePasteState = _assertThisInitialize.beforePasteState;
          var _assertThisInitialize2 = _assertThisInitialized(_assertThisInitialized(_this)), previousSelection = _assertThisInitialize2.previousSelection;
          var beforeMaskedValueChange = _this.props.beforeMaskedValueChange;
          var value = _this.getInputValue();
          var previousValue = _this.value;
          var selection = _this.getSelection();
          if (_this.isInputAutofilled(value, selection, previousValue, previousSelection)) {
            previousValue = formatValue(_this.maskOptions, "");
            previousSelection = {
              start: 0,
              end: 0,
              length: 0
            };
          }
          if (beforePasteState) {
            previousSelection = beforePasteState.selection;
            previousValue = beforePasteState.value;
            selection = {
              start: previousSelection.start + value.length,
              end: previousSelection.start + value.length,
              length: 0
            };
            value = previousValue.slice(0, previousSelection.start) + value + previousValue.slice(previousSelection.end);
            _this.beforePasteState = null;
          }
          var changedState = processChange(_this.maskOptions, value, selection, previousValue, previousSelection);
          var enteredString = changedState.enteredString;
          var newSelection = changedState.selection;
          var newValue = changedState.value;
          if (isFunction(beforeMaskedValueChange)) {
            var modifiedValue2 = beforeMaskedValueChange({
              value: newValue,
              selection: newSelection
            }, {
              value: previousValue,
              selection: previousSelection
            }, enteredString, _this.getBeforeMaskedValueChangeConfig());
            newValue = modifiedValue2.value;
            newSelection = modifiedValue2.selection;
          }
          _this.setInputValue(newValue);
          if (isFunction(_this.props.onChange)) {
            _this.props.onChange(event);
          }
          if (_this.isWindowsPhoneBrowser) {
            _this.setSelection(newSelection.start, newSelection.end, {
              deferred: true
            });
          } else {
            _this.setSelection(newSelection.start, newSelection.end);
          }
        };
        _this.onFocus = function(event) {
          var beforeMaskedValueChange = _this.props.beforeMaskedValueChange;
          var _this$maskOptions2 = _this.maskOptions, mask = _this$maskOptions2.mask, prefix = _this$maskOptions2.prefix;
          _this.focused = true;
          _this.mounted = true;
          if (mask) {
            if (!_this.value) {
              var emptyValue = formatValue(_this.maskOptions, prefix);
              var newValue = formatValue(_this.maskOptions, emptyValue);
              var filledLength = getFilledLength(_this.maskOptions, newValue);
              var cursorPosition = getRightEditablePosition(_this.maskOptions, filledLength);
              var newSelection = {
                start: cursorPosition,
                end: cursorPosition
              };
              if (isFunction(beforeMaskedValueChange)) {
                var modifiedValue2 = beforeMaskedValueChange({
                  value: newValue,
                  selection: newSelection
                }, {
                  value: _this.value,
                  selection: null
                }, null, _this.getBeforeMaskedValueChangeConfig());
                newValue = modifiedValue2.value;
                newSelection = modifiedValue2.selection;
              }
              var isInputValueChanged = newValue !== _this.getInputValue();
              if (isInputValueChanged) {
                _this.setInputValue(newValue);
              }
              if (isInputValueChanged && isFunction(_this.props.onChange)) {
                _this.props.onChange(event);
              }
              _this.setSelection(newSelection.start, newSelection.end);
            } else if (getFilledLength(_this.maskOptions, _this.value) < _this.maskOptions.mask.length) {
              _this.setCursorToEnd();
            }
            _this.runSaveSelectionLoop();
          }
          if (isFunction(_this.props.onFocus)) {
            _this.props.onFocus(event);
          }
        };
        _this.onBlur = function(event) {
          var beforeMaskedValueChange = _this.props.beforeMaskedValueChange;
          var mask = _this.maskOptions.mask;
          _this.stopSaveSelectionLoop();
          _this.focused = false;
          if (mask && !_this.props.alwaysShowMask && isEmpty(_this.maskOptions, _this.value)) {
            var newValue = "";
            if (isFunction(beforeMaskedValueChange)) {
              var modifiedValue2 = beforeMaskedValueChange({
                value: newValue,
                selection: null
              }, {
                value: _this.value,
                selection: _this.previousSelection
              }, null, _this.getBeforeMaskedValueChangeConfig());
              newValue = modifiedValue2.value;
            }
            var isInputValueChanged = newValue !== _this.getInputValue();
            if (isInputValueChanged) {
              _this.setInputValue(newValue);
            }
            if (isInputValueChanged && isFunction(_this.props.onChange)) {
              _this.props.onChange(event);
            }
          }
          if (isFunction(_this.props.onBlur)) {
            _this.props.onBlur(event);
          }
        };
        _this.onMouseDown = function(event) {
          if (!_this.focused && document.addEventListener) {
            _this.mouseDownX = event.clientX;
            _this.mouseDownY = event.clientY;
            _this.mouseDownTime = (/* @__PURE__ */ new Date()).getTime();
            var mouseUpHandler = function mouseUpHandler2(mouseUpEvent) {
              document.removeEventListener("mouseup", mouseUpHandler2);
              if (!_this.focused) {
                return;
              }
              var deltaX = Math.abs(mouseUpEvent.clientX - _this.mouseDownX);
              var deltaY = Math.abs(mouseUpEvent.clientY - _this.mouseDownY);
              var axisDelta = Math.max(deltaX, deltaY);
              var timeDelta = (/* @__PURE__ */ new Date()).getTime() - _this.mouseDownTime;
              if (axisDelta <= 10 && timeDelta <= 200 || axisDelta <= 5 && timeDelta <= 300) {
                _this.setCursorToEnd();
              }
            };
            document.addEventListener("mouseup", mouseUpHandler);
          }
          if (isFunction(_this.props.onMouseDown)) {
            _this.props.onMouseDown(event);
          }
        };
        _this.onPaste = function(event) {
          if (isFunction(_this.props.onPaste)) {
            _this.props.onPaste(event);
          }
          if (!event.defaultPrevented) {
            _this.beforePasteState = {
              value: _this.getInputValue(),
              selection: _this.getSelection()
            };
            _this.setInputValue("");
          }
        };
        _this.handleRef = function(ref) {
          if (_this.props.children == null && isFunction(_this.props.inputRef)) {
            _this.props.inputRef(ref);
          }
        };
        var _mask = props.mask, _maskChar = props.maskChar, _formatChars = props.formatChars, _alwaysShowMask = props.alwaysShowMask, _beforeMaskedValueChange = props.beforeMaskedValueChange;
        var defaultValue = props.defaultValue, _value = props.value;
        _this.maskOptions = parseMask(_mask, _maskChar, _formatChars);
        if (defaultValue == null) {
          defaultValue = "";
        }
        if (_value == null) {
          _value = defaultValue;
        }
        var _newValue = getStringValue(_value);
        if (_this.maskOptions.mask && (_alwaysShowMask || _newValue)) {
          _newValue = formatValue(_this.maskOptions, _newValue);
          if (isFunction(_beforeMaskedValueChange)) {
            var oldValue = props.value;
            if (props.value == null) {
              oldValue = defaultValue;
            }
            oldValue = getStringValue(oldValue);
            var modifiedValue = _beforeMaskedValueChange({
              value: _newValue,
              selection: null
            }, {
              value: oldValue,
              selection: null
            }, null, _this.getBeforeMaskedValueChangeConfig());
            _newValue = modifiedValue.value;
          }
        }
        _this.value = _newValue;
        return _this;
      }
      var _proto = InputElement2.prototype;
      _proto.componentDidMount = function componentDidMount() {
        this.mounted = true;
        if (!this.getInputDOMNode()) {
          return;
        }
        this.isWindowsPhoneBrowser = isWindowsPhoneBrowser();
        if (this.maskOptions.mask && this.getInputValue() !== this.value) {
          this.setInputValue(this.value);
        }
      };
      _proto.componentDidUpdate = function componentDidUpdate() {
        var previousSelection = this.previousSelection;
        var _this$props = this.props, beforeMaskedValueChange = _this$props.beforeMaskedValueChange, alwaysShowMask = _this$props.alwaysShowMask, mask = _this$props.mask, maskChar = _this$props.maskChar, formatChars = _this$props.formatChars;
        var previousMaskOptions = this.maskOptions;
        var showEmpty = alwaysShowMask || this.isFocused();
        var hasValue = this.props.value != null;
        var newValue = hasValue ? getStringValue(this.props.value) : this.value;
        var cursorPosition = previousSelection ? previousSelection.start : null;
        this.maskOptions = parseMask(mask, maskChar, formatChars);
        if (!this.maskOptions.mask) {
          if (previousMaskOptions.mask) {
            this.stopSaveSelectionLoop();
            this.forceUpdate();
          }
          return;
        } else if (!previousMaskOptions.mask && this.isFocused()) {
          this.runSaveSelectionLoop();
        }
        var isMaskChanged = this.maskOptions.mask && this.maskOptions.mask !== previousMaskOptions.mask;
        if (!previousMaskOptions.mask && !hasValue) {
          newValue = this.getInputValue();
        }
        if (isMaskChanged || this.maskOptions.mask && (newValue || showEmpty)) {
          newValue = formatValue(this.maskOptions, newValue);
        }
        if (isMaskChanged) {
          var filledLength = getFilledLength(this.maskOptions, newValue);
          if (cursorPosition === null || filledLength < cursorPosition) {
            if (isFilled(this.maskOptions, newValue)) {
              cursorPosition = filledLength;
            } else {
              cursorPosition = getRightEditablePosition(this.maskOptions, filledLength);
            }
          }
        }
        if (this.maskOptions.mask && isEmpty(this.maskOptions, newValue) && !showEmpty && (!hasValue || !this.props.value)) {
          newValue = "";
        }
        var newSelection = {
          start: cursorPosition,
          end: cursorPosition
        };
        if (isFunction(beforeMaskedValueChange)) {
          var modifiedValue = beforeMaskedValueChange({
            value: newValue,
            selection: newSelection
          }, {
            value: this.value,
            selection: this.previousSelection
          }, null, this.getBeforeMaskedValueChangeConfig());
          newValue = modifiedValue.value;
          newSelection = modifiedValue.selection;
        }
        this.value = newValue;
        var isValueChanged = this.getInputValue() !== this.value;
        if (isValueChanged) {
          this.setInputValue(this.value);
          this.forceUpdate();
        } else if (isMaskChanged) {
          this.forceUpdate();
        }
        var isSelectionChanged = false;
        if (newSelection.start != null && newSelection.end != null) {
          isSelectionChanged = !previousSelection || previousSelection.start !== newSelection.start || previousSelection.end !== newSelection.end;
        }
        if (isSelectionChanged || isValueChanged) {
          this.setSelection(newSelection.start, newSelection.end);
        }
      };
      _proto.componentWillUnmount = function componentWillUnmount() {
        this.mounted = false;
        if (this.selectionDeferId !== null) {
          cancelDefer(this.selectionDeferId);
        }
        this.stopSaveSelectionLoop();
      };
      _proto.render = function render() {
        var _this$props2 = this.props, mask = _this$props2.mask, alwaysShowMask = _this$props2.alwaysShowMask, maskChar = _this$props2.maskChar, formatChars = _this$props2.formatChars, inputRef = _this$props2.inputRef, beforeMaskedValueChange = _this$props2.beforeMaskedValueChange, children = _this$props2.children, restProps = _objectWithoutPropertiesLoose(_this$props2, ["mask", "alwaysShowMask", "maskChar", "formatChars", "inputRef", "beforeMaskedValueChange", "children"]);
        var inputElement;
        true ? warning(
          // parse mask to test against actual mask prop as this.maskOptions
          // will be updated later in componentDidUpdate
          !restProps.maxLength || !parseMask(mask, maskChar, formatChars).mask,
          "react-input-mask: maxLength property shouldn't be passed to the masked input. It breaks masking and unnecessary because length is limited by the mask length."
        ) : void 0;
        if (children) {
          !isFunction(children) ? true ? invariant(false, "react-input-mask: children must be a function") : invariant(false) : void 0;
          var controlledProps = ["onChange", "onPaste", "onMouseDown", "onFocus", "onBlur", "value", "disabled", "readOnly"];
          var childrenProps = _extends({}, restProps);
          controlledProps.forEach(function(propId) {
            return delete childrenProps[propId];
          });
          inputElement = children(childrenProps);
          var conflictProps = controlledProps.filter(function(propId) {
            return inputElement.props[propId] != null && inputElement.props[propId] !== restProps[propId];
          });
          !!conflictProps.length ? true ? invariant(false, "react-input-mask: the following props should be passed to the react-input-mask's component and should not be altered in children's function: " + conflictProps.join(", ")) : invariant(false) : void 0;
          true ? warning(!inputRef, "react-input-mask: inputRef is ignored when children is passed, attach ref to the children instead") : void 0;
        } else {
          inputElement = React.createElement("input", _extends({
            ref: this.handleRef
          }, restProps));
        }
        var changedProps = {
          onFocus: this.onFocus,
          onBlur: this.onBlur
        };
        if (this.maskOptions.mask) {
          if (!restProps.disabled && !restProps.readOnly) {
            changedProps.onChange = this.onChange;
            changedProps.onPaste = this.onPaste;
            changedProps.onMouseDown = this.onMouseDown;
          }
          if (restProps.value != null) {
            changedProps.value = this.value;
          }
        }
        inputElement = React.cloneElement(inputElement, changedProps);
        return inputElement;
      };
      return InputElement2;
    }(React.Component);
    module.exports = InputElement;
  }
});

// node_modules/react-input-mask/index.js
var require_react_input_mask = __commonJS({
  "node_modules/react-input-mask/index.js"(exports, module) {
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_input_mask_development();
    }
  }
});
export default require_react_input_mask();
//# sourceMappingURL=react-input-mask.js.map
