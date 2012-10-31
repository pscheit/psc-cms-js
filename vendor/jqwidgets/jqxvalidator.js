/*
jQWidgets v2.4.2 (2012-Sep-12)
Copyright (c) 2011-2012 jQWidgets.
License: http://jqwidgets.com/license/
*/

/*
* Low priority rule is rule which index is smaller than another.
*
*   1) Required using masked input  -   DONE
*/
(function ($) {

    $.jqx.jqxWidget('jqxValidator', '', {});

    $.extend($.jqx._jqxValidator.prototype, {

        defineInstance: function () {
            this.rules = null;
            this.scroll = true;
            this.focus = true;
            this.scrollDuration = 300;
            this.scrollCallback = null;
            this.position = 'right';
            this.arrow = true;
            this.animation = 'fade';
            this.animationDuration = 150;
            this.closeOnClick = true;
            this.onError = null;
            this.onSuccess = null;
            this.ownerElement = null;
            this._events = ['validationError', 'validationSuccess'];
            this._margin = 5;
            this._inputHint = [];

        },

        createInstance: function () {
            this._configureInputs();
            this._removeEventListeners();
            this._addEventListeners();
        },

        destroy: function () {
            this._removeEventListeners();
            this.hide();
        },

        validate: function () {
            var valid = true,
                temp,
                minTop = Infinity,
                currentTop,
                topElement,
                tempElement,
                invalid = [],
                minTopElement;
            this.updatePosition();
            for (var i = 0; i < this.rules.length; i += 1) {
                temp = this._validateRule(this.rules[i]);
                if (!temp) {
                    valid = false;
                    tempElement = $(this.rules[i].input);
                    invalid.push(tempElement);
                    currentTop = tempElement.offset().top;
                    if (minTop > currentTop) {
                        minTop = currentTop;
                        topElement = tempElement;
                    }
                }
            }
            this._handleValidation(valid, minTop, topElement, invalid);
            return valid;
        },

        validateInput: function (input) {
            var rules = this._getRulesForInput(input),
                valid = true;
            for (var i = 0; i < rules.length; i += 1) {
                if (!this._validateRule(rules[i])) {
                    valid = false;
                }
            }
            return valid;
        },

        hideHint: function (input) {
            var rules = this._getRulesForInput(input);
            for (var i = 0; i < rules.length; i += 1) {
                this._hideHintByRule(rules[i]);
            }
        },

        hide: function () {
            var rule;
            for (var i = 0; i < this.rules.length; i += 1) {
                rule = this.rules[i];
                this._hideHintByRule(this.rules[i]);
            }
        },

        updatePosition: function () {
            var rule;
            for (var i = 0; i < this.rules.length; i += 1) {
                rule = this.rules[i];
                if (rule.hint) {
                    this._hintLayout(rule.hint, $(rule.input), rule.position);
                }
            }
        },

        _getRulesForInput: function (input) {
            var rules = [];
            for (var i = 0; i < this.rules.length; i += 1) {
                if (this.rules[i].input === input) {
                    rules.push(this.rules[i]);
                }
            }
            return rules;
        },

        _validateRule: function (rule) {
            var input = $(rule.input),
                hint,
                valid = true;
            if (typeof rule.rule === 'function' && !rule.rule.call(this, input)) {
                if (typeof rule.hintRender === 'function' && !rule.hint && !this._higherPriorityActive(rule) && input.is(':visible')) {
                    hint = rule.hintRender.apply(this, [rule.message, input]);
                    this._hintLayout(hint, input, rule.position);
                    this._showHint(hint);
                    rule.hint = hint;
                    this._removeLowPriorityHints(rule);
                }
                valid = false;
            } else {
                this._hideHintByRule(rule);
            }
            return valid;
        },

        _hideHintByRule: function (rule) {
            var self = this,
                hint;
            if (rule) {
                hint = rule.hint;
                if (hint) {
                    if (this.animation === 'fade') {
                        hint.fadeOut(this.animationDuration, function () {
                            hint.remove();
                        });
                    } else {
                        hint.remove();
                    }
                }
                rule.hint = null;
            }
        },

        _handleValidation: function (valid, minTop, topElement, invalid) {
            if (!valid) {
                this._scrollHandler(minTop);
                if (this.focus) {
                    topElement.focus()
                }
                this._raiseEvent(0, { invalidInputs: invalid });
                if (typeof this.onError === 'function') {
                    this.onError(invalid);
                }
            } else {
                this._raiseEvent(1);
                if (typeof this.onSuccess === 'function') {
                    this.onSuccess();
                }
            }
        },

        _scrollHandler: function (minTop) {
            if (this.scroll) {
                var self = this;
                $('html,body').animate({ scrollTop: minTop }, this.scrollDuration, function () {
                    if (typeof self.scrollCallback === 'function') {
                        self.scrollCallback.call(self);
                    }
                });
            }
        },

        _higherPriorityActive: function (rule) {
            var reach = false,
                current;
            for (var i = this.rules.length - 1; i >= 0; i -= 1) {
                current = this.rules[i];
                if (reach && current.input === rule.input && current.hint) {
                    return true;
                }
                if (current === rule) {
                    reach = true;
                }
            }
            return false;
        },

        _removeLowPriorityHints: function (rule) {
            var reach = false,
                current;
            for (var i = 0; i < this.rules.length; i += 1) {
                current = this.rules[i];
                if (reach && current.input === rule.input) {
                    this._hideHintByRule(current);
                }
                if (current === rule) {
                    reach = true;
                }
            }
        },

        _getHintRuleByInput: function (input) {
            var current;
            for (var i = 0; i < this.rules.length; i += 1) {
                current = this.rules[i];
                if ($(current.input)[0] === input[0] && current.hint) {
                    return current;
                }
            }
            return null;
        },

        _removeEventListeners: function () {
            var rule,
                input,
                listeners;
            for (var i = 0; i < this.rules.length; i += 1) {
                rule = this.rules[i];
                listeners = rule.action.split(',');
                input = $(rule.input);
                for (var j = 0; j < listeners.length; j += 1) {
                    this.removeHandler(input, $.trim(listeners[j]) + '.jqx-validator');
                }
            }
        },

        _addEventListeners: function () {
            var rule,
                input;
            if (this.host.parents('.jqx-window').length > 0) {
                var self = this;
                var update = function () {
                    self.updatePosition();
                }

                var window = this.host.parents('.jqx-window');
                this.addHandler(window, 'closed',
                function () {
                    self.hide()
                 });
                this.addHandler(window, 'moved', update);
                this.addHandler(window, 'moving', update);
                this.addHandler(window, 'resized', update);
                this.addHandler(window, 'resizing', update);
            }

            for (var i = 0; i < this.rules.length; i += 1) {
                rule = this.rules[i];
                input = $(rule.input);
                this._addListenerTo(input, rule);
            }
        },

        _addListenerTo: function (input, rule) {
            var self = this,
                listeners = rule.action.split(',');

            var isJQWidget = false;
            if (this._isjQWidget(input)) {
                isJQWidget = true;
            }

            for (var i = 0; i < listeners.length; i += 1) {
                var event = $.trim(listeners[i]);

                if (isJQWidget && (event == 'blur' || event == 'focus')) {
                    input = input.find('input');
                }

                this.addHandler(input, event + '.jqx-validator', function (event) {
                    self._validateRule(rule);
                });
            }
        },

        _configureInputs: function () {
            var input,
                count;
            this.rules = this.rules || [];
            for (var i = 0; i < this.rules.length; i += 1) {
                this._handleInput(i);
            }
        },

        _handleInput: function (ruleId) {
            var rule = this.rules[ruleId];
            if (!rule['position']) {
                rule['position'] = this.position;
            }
            if (!rule['message']) {
                rule['message'] = 'test';
            }
            if (!rule['action']) {
                rule['action'] = 'blur';
            }
            if (!rule['hintRender']) {
                rule['hintRender'] = this._hintRender;
            }
            if (!rule['rule']) {
                rule['rule'] = null;
            } else {
                this._handleRule(rule);
            }
        },

        _handleRule: function (rule) {
            var validation = rule.rule,
                func,
                parameters,
                wrongParameter = false;
            if (typeof validation === 'string') {
                if (validation.indexOf('=') >= 0) {
                    validation = validation.split('=');
                    parameters = validation[1].split(',');
                    validation = validation[0];
                }
                func = this['_' + validation];
                if (func) {
                    rule.rule = function (input) {
                        return func.apply(this, [input].concat(parameters));
                    };
                } else {
                    wrongParameter = true;
                }
            } else {
                if (typeof validation !== 'function') {
                    wrongParameter = true;
                } else {
                    rule.rule = validation;
                }
            }
            if (wrongParameter) {
                throw new Error('Wrong parameter!');
            }
        },

        _required: function (input) {
            switch (this._getType(input)) {
                case 'textarea':
                case 'password':
                case 'jqx-input':
                case 'text':
                    var data = $.data(input[0]);
                    if (data.jqxMaskedInput) {
                        var promptChar = input.jqxMaskedInput('promptChar'),
                            value = input.jqxMaskedInput('value');
                        return value && value.indexOf(promptChar) < 0;
                    } else if (data.jqxNumberInput) {
                        return input.jqxNumberInput('inputValue') !== '';
                    } else if (data.jqxDateTimeInput) {
                        return true;
                    } else {
                        return $.trim(input.val()) !== '';
                    }
                case 'checkbox':
                    return input.is(':checked');
                case 'radio':
                    return input.is(':checked');
                case 'div':
                    if (input.is('.jqx-checkbox')) {
                        return input.jqxCheckBox('checked');
                    }
                    return false;
            }
            return false;
        },

        _notNumber: function (input) {
            return this._validateText(input, function (text) {
                if (text == "")
                    return true;

                var re = /\d/;
                return !re.test(text);
            });
        },

        _number: function (input) {
            return this._validateText(input, function (text) {
                if (text == "")
                    return true;

                return !isNaN(parseInt(text, 10));
            });
        },

        _phone: function (input) {
            return this._validateText(input, function (text) {
                if (text == "")
                    return true;

                var phone = /^\(\d{3}\)(\d){3}-(\d){4}$/;
                return phone.test(text);
            });
        },

        _length: function (input, min, max) {
            return this._minLength(input, min) && this._maxLength(input, max);
        },

        _maxLength: function (input, len) {
            len = parseInt(len, 10);
            return this._validateText(input, function (text) {
                return text.length <= len;
            });
        },

        _minLength: function (input, len) {
            len = parseInt(len, 10);
            return this._validateText(input, function (text) {
                return text.length >= len;
            });
        },

        _email: function (input) {
            return this._validateText(input, function (text) {
                if (text == "")
                    return true;

                var email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return email.test(text);
            });
        },

        _zipCode: function (input) {
            return this._validateText(input, function (text) {
                if (text == "")
                    return true;

                var zip = /^(^\d{5}$)|(^\d{5}-\d{4}$)|(\d{3}-\d{2}-\d{4})$/;
                return zip.test(text);
            });
        },

        _ssn: function (input) {
            return this._validateText(input, function (text) {
                if (text == "")
                    return true;

                var ssn = /\d{3}-\d{2}-\d{4}/;
                return ssn.test(text);
            });
        },

        _validateText: function (input, condition) {
            var value;
            if (this._isTextInput(input)) {
                if (this._isjQWidget(input)) {
                    value = input.find('input').val()
                } else {
                    value = input.val();
                }
                return condition(value);
            }
            return false;
        },

        _isjQWidget: function (input) {
            var data = $.data(input[0]);
            if (data.jqxMaskedInput || data.jqxNumberInput || data.jqxDateTimeInput) {
                return true;
            }
            return false;
        },

        _isTextInput: function (input) {
            var type = this._getType(input);
            return type === 'text' || type === 'textarea' || type === 'password' || input.is('.jqx-input');
        },

        _getType: function (input) {
            var tag = input[0].tagName.toLowerCase(),
                type;
            if (tag === 'textarea') {
                return 'textarea';
            } else if (input.is('.jqx-input')) {
                return 'jqx-input';
            } else if (tag === 'input') {
                type = $(input).attr('type') ? $(input).attr('type').toLowerCase() : 'text';
                return type;
            }
            return tag;
        },

        _hintRender: function (message, input) {
            var hint = $('<div class="' + this.toThemeProperty('jqx-validator-hint') + ' jqx-rc-all"></div>'),
                self = this;
            hint.html(message);
            if (this.closeOnClick) {
                hint.click(function () {
                    self.hideHint(input.selector);
                });
            }
            if (this.ownerElement == null) {
                hint.appendTo(document.body);
            }
            else {
                if (this.ownerElement.innerHTML) {
                    hint.appendTo($(this.ownerElement));
                }
                else hint.appendTo(this.ownerElement);
            }

            return hint;
        },

        _hintLayout: function (hint, input, position) {
            var pos;
            pos = this._getPosition(input, position, hint);
            hint.css({
                position: 'absolute',
                left: pos.left,
                top: pos.top
            });
            if (this.arrow) {
                this._addArrow(input, hint, position, pos);
            }
        },

        _showHint: function (hint) {
            if (this.animation === 'fade') {
                hint.fadeOut(0);
                hint.fadeIn(this.animationDuration);
            }
        },

        _getPosition: function (input, position, hint) {
            var offset = input.offset(),
                top, left;

            if (this.ownerElement != null) {
                offset = { left: 0, top: 0 };
                offset.top = parseInt(offset.top) + input.position().top;
                offset.left = parseInt(offset.left) + input.position().left;
            }

            if (position.indexOf('top') >= 0) {
                top = offset.top - input.outerHeight();
            } else if (position.indexOf('bottom') >= 0) {
                top = offset.top + hint.outerHeight() + this._margin;
            } else {
                top = offset.top;
            }
            if (position.indexOf('center') >= 0) {
                left = offset.left + this._margin + (input.outerWidth() - hint.outerWidth()) / 2;
            } else if (position.indexOf('left') >= 0) {
                left = offset.left - hint.outerWidth() - this._margin;
            } else if (position.indexOf('right') >= 0) {
                left = offset.left + input.outerWidth() + this._margin;
            } else {
                left = offset.left + this._margin;
            }
            if (position.indexOf(':') >= 0) {
                position = position.split(':')[1].split(',');
                left += parseInt(position[0], 10);
                top += parseInt(position[1], 10);
            }
            return {
                left: left,
                top: top
            };
        },

        _addArrow: function (input, hint, position, coordinates) {
            var arrow = $('<div class="' + this.toThemeProperty('jqx-validator-hint-arrow') + '"></div>'),
                left,
                top;
            hint.children('.jqx-validator-hint-arrow').remove();
            hint.append(arrow);
            var aH = arrow.outerHeight(),
                aW = arrow.outerWidth(),
                hH = hint.outerHeight(),
                hW = hint.outerWidth();
            this._addImage(arrow);
            if (position.indexOf('top') >= 0) {
                top = hH - aH;
            } else if (position.indexOf('bottom') >= 0) {
                top = -aH;
            } else {
                top = (hH - aH) / 2 - aH / 2;
            }
            if (position.indexOf('center') >= 0) {
                left = (hW - aW) / 2;
            } else if (position.indexOf('left') >= 0) {
                left = hW + aW / 2;
            } else if (position.indexOf('right') >= 0) {
                left = -aW / 2;
            }
            if (position.indexOf('topright') >= 0 || position.indexOf('bottomright') >= 0) {
                left = 0;
            }
            if (position.indexOf('topleft') >= 0 || position.indexOf('bottomleft') >= 0) {
                left = hW - aW;
            }
            arrow.css({
                position: 'absolute',
                left: left,
                top: top
            });
        },

        _addImage: function (arrow) {
            var imgUrl = arrow.css('background-image');
            imgUrl = imgUrl.replace('url("', '');
            imgUrl = imgUrl.replace('")', '');
            imgUrl = imgUrl.replace('url(', '');
            imgUrl = imgUrl.replace(')', '');
            arrow.css('background-image', 'none');
            arrow.append('<img src="' + imgUrl + '" alt="Arrow" style="position: relative; ' +
            'top: 0px; left: 0px; width: ' + arrow.width() + 'px; height: ' + arrow.height() + 'px;" />');
        },

        _raiseEvent: function (eventId, data) {
            var event = $.Event(this._events[eventId]);
            event.args = data;
            return this.host.trigger(event);
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            if (key === 'rules') {
                this._configureInputs();
                this._removeEventListeners();
                this._addEventListeners();
            }
        }
    });
})(jQuery);