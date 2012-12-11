/*
jQWidgets v2.5.5 (2012-Nov-28)
Copyright (c) 2011-2012 jQWidgets.
License: http://jqwidgets.com/license/
*/

/*

Depends:
jqxcore.js
jqxbuttons.js

*/
(function ($) {

    $.jqx.jqxWidget("jqxSlider", "", {});

    $.extend($.jqx._jqxSlider.prototype, {
        defineInstance: function () {
            // Type: Bool
            // Default: false
            // Sets or gets whether the slider is disabled.
            this.disabled = false;
            // Type: Number/String
            // Default: 300
            // Sets or gets slider's width.
            this.width = 300;
            // Type: Number/String
            // Default: 30
            // Sets or gets slider's height.
            this.height = 30;
            // Type: Number
            // Default: 2
            // Sets or gets slide step when the user is using the arrows or the mouse wheel for changing slider's value.
            this.step = 1;
            // Type: Number
            // Default: 10
            // Sets or gets slider's maximum value.
            this.max = 10;
            // Type: Number
            // Default: 0
            // Sets or gets slider's minimum value.
            this.min = 0;
            // Type: String
            // Default: horizontal
            // Sets or gets slider's orientation.
            this.orientation = 'horizontal';
            // Type: Bool
            // Default: true
            // Sets or gets whether ticks will be shown.
            this.showTicks = true;
            // Type: Number
            // Default: both
            // Sets or gets slider's ticks position. Possible values - 'top', 'bottom', 'both'.
            this.ticksPosition = 'both';
            // Type: Number
            // Default: 2
            // Sets or gets slider's ticks frequency.
            this.ticksFrequency = 2;
            // Type: Bool
            // Default: true
            // Sets or gets whether the scroll buttons will be shown.
            this.showButtons = true;
            // Type: String
            // Default: both
            // Sets or gets scroll buttons position. Possible values 'both', 'left', 'right'.
            this.buttonsPosition = 'both';
            // Type: String
            // Default: default
            // Sets or gets slider's mode. If the mode is default then the user can use floating values.
            this.mode = 'default';
            // Type: Bool
            // Default: true
            // Sets or gets whether the slide range is going to be shown.
            this.showRange = true;
            // Type: Bool
            // Default: false
            // Sets or gets whether the slider is a range slider.
            this.rangeSlider = false;
            // Type: Number
            // Default: 0
            // Sets or gets slider's value. This poperty will be an object with the following structure { rangeStart: range_start, rangeEnd: range_end } if the
            // slider is range slider otherwise it's going to be a number.
            this.value = 0;
            // Type: Array
            // Default: [0, 10]
            // Sets or gets range slider's values.
            this.values = [0, 10];
            // Type: Bool
            // Default: true
            // Sets or gets whether the slider title will be shown.
            this.tooltip = true;
            // Type: Number/String
            // Default: 11
            // Sets or gets whether the slider buttons size.
            this.sliderButtonSize = 14;
            // Type: Number/String
            // Default: 5
            // Sets or gets the tick size.
            this.tickSize = 7;
            // Private properties
            this._dimentions = {
                'vertical': {
                    'size': 'height',
                    'oSize': 'width',
                    'outerOSize': 'outerWidth',
                    'outerSize': 'outerHeight',
                    'dimention': 'top',
                    'oDimention': 'left',
                    'start': '_startY',
                    'mouse': '_mouseStartY',
                    'page': 'pageY',
                    'opposite': 'horizontal'
                },
                'horizontal': {
                    'size': 'width',
                    'oSize': 'height',
                    'outerOSize': 'outerHeight',
                    'outerSize': 'outerWidth',
                    'dimention': 'left',
                    'oDimention': 'top',
                    'start': '_startX',
                    'mouse': '_mouseStartX',
                    'page': 'pageX',
                    'opposite': 'vertical'
                }
            };
            this._touchEvents = {
                'mousedown': 'touchstart',
                'click': 'touchstart',
                'mouseup': 'touchend',
                'mousemove': 'touchmove',
                'mouseenter': 'mouseenter',
                'mouseleave': 'mouseleave'
            };
            this._events = ['change', 'slide', 'slideEnd', 'slideStart', 'created'];
            this._invalidArgumentExceptions = {
                'invalidWidth': 'Invalid width.',
                'invalidHeight': 'Invalid height.',
                'invalidStep': 'Invalid step.',
                'invalidMaxValue': 'Invalid maximum value.',
                'invalidMinValue': 'Invalid minimum value.',
                'invalidTickFrequency': 'Invalid tick frequency.',
                'invalidValue': 'Invalid value.',
                'invalidValues': 'Invalid values.',
                'invalidTicksPosition': 'Invalid ticksPosition',
                'invalidButtonsPosition': 'Invalid buttonsPosition'
            };
            //Containing the last value. This varialbe is used in the _raiseEvent method and it's our criteria for checking
            //whether we need to trigger event.
            this._lastValue = [];
            this._track = null;
            this._leftButton = null;
            this._rightButton = null;
            this._slider = null;
            this._rangeBar = null;
            this._slideEvent = null;
            this._capturedElement = null;
            this._slideStarted = false;
        },

        createInstance: function (args) {
            this.host.addClass(this.toThemeProperty('jqx-slider'));
            this.host.addClass(this.toThemeProperty('jqx-widget'));

            this._isTouchDevice = $.jqx.mobile.isTouchDevice();
            this.host.width(this.width);
            this.host.height(this.height);
            this._refresh();
            this._raiseEvent(4, { value: this.getValue() });
            this._addInput();
        },

        destroy: function () {
            this.host.remove();
        },

        _addInput: function () {
            var name = this.host.attr('name');
            if (!name) name = this.element.id;
            this.input = $("<input type='hidden'/>");
            this.host.append(this.input);
            this.input.attr('name', name);
            if (!this.rangeSlider) {
                this.input.val(this.value.toString());
            }
            else {
                if (this.values) {
                    this.input.val(this.value.rangeStart.toString() + "-" + this.value.rangeEnd.toString());
                }
            }
        },

        _getDimention: function (dimention) {
            return this._dimentions[this.orientation][dimention];
        },

        _getEvent: function (event) {
            if (this._isTouchDevice) {
                return this._touchEvents[event];
            } else {
                return event;
            }
        },

        refresh: function (initialRefresh) {
            if (!initialRefresh) {
                this._refresh();
            }
        },

        _refresh: function () {
            this._render();
            this._performLayout();
            this._removeEventHandlers();
            this._addEventHandlers();
            this._initialSettings();
        },

        _render: function () {
            this._addTrack();
            this._addSliders();
            this._addTickContainers();
            this._addContentWrapper();
            this._addButtons();
            this._addRangeBar();
        },

        _addTrack: function () {
            if (this._track === null || this._track.length < 1) {
                this._track = $('<div class="' + this.toThemeProperty('jqx-slider-track') + '"></div>');
                this.host.append(this._track);
            }
            this._track.attr('style', '');
            this._track.removeClass(this.toThemeProperty('jqx-slider-track-' + this._getDimention('opposite')));
            this._track.addClass(this.toThemeProperty('jqx-slider-track-' + this.orientation));
            this._track.addClass(this.toThemeProperty('jqx-fill-state-normal'));
            this._track.addClass(this.toThemeProperty('jqx-rc-all'));
        },

        _addSliders: function () {
            if (this._slider === null || this._slider.length < 1) {
                this._slider = {};
                this._slider.left = $('<div class="' + this.toThemeProperty('jqx-slider-slider') + '"></div>');
                this._track.append(this._slider.left);
                this._slider.right = $('<div class="' + this.toThemeProperty('jqx-slider-slider') + '"></div>');
                this._track.append(this._slider.right);
            }
            this._slider.left.removeClass(this.toThemeProperty('jqx-slider-slider-' + this._getDimention('opposite')));
            this._slider.left.addClass(this.toThemeProperty('jqx-slider-slider-' + this.orientation));
            this._slider.right.removeClass(this.toThemeProperty('jqx-slider-slider-' + this._getDimention('opposite')));
            this._slider.right.addClass(this.toThemeProperty('jqx-slider-slider-' + this.orientation));
            this._slider.right.addClass(this.toThemeProperty('jqx-fill-state-normal'));
            this._slider.left.addClass(this.toThemeProperty('jqx-fill-state-normal'));
        },

        _addTickContainers: function () {
            if (this._bottomTicks !== null || this._bottomTicks.length < 1 ||
                this._topTicks !== null || this._topTicks.length < 1) {
                this._addTickContainers();
            }
            if (!this.showTicks) {
                this._bottomTicks.css('visibility', 'hidden');
                this._topTicks.css('visibility', 'hidden');
            } else {
                this._bottomTicks.css('visibility', 'visible');
                this._topTicks.css('visibility', 'visibility');
            }
        },

        _addTickContainers: function () {
            if (typeof this._bottomTicks === 'undefined' || this._bottomTicks.length < 1) {
                this._bottomTicks = $('<div class="' + this.toThemeProperty('jqx-slider-tickscontainer') + '" style=""></div>');
                this.host.prepend(this._bottomTicks);
            }
            if (typeof this._topTicks === 'undefined' || this._topTicks.length < 1) {
                this._topTicks = $('<div class="' + this.toThemeProperty('jqx-slider-tickscontainer') + '" style=""></div>');
                this.host.append(this._topTicks);
            }
        },

        _addButtons: function () {
            if (this._leftButton === null || this._leftButton.length < 1 ||
                this._rightButton === null || this._rightButton.length < 1) {
                this._createButtons();
            }
            if (!this.showButtons || this.rangeSlider) {
                this._rightButton.css('display', 'none');
                this._leftButton.css('display', 'none');
            } else {
                this._rightButton.css('display', 'block');
                this._leftButton.css('display', 'block');
            }
        },

        _createButtons: function () {
            this._leftButton = $('<div class="jqx-slider-left"><div style="width: 100%; height: 100%;"></div></div>');
            this._rightButton = $('<div class="jqx-slider-right"><div style="width: 100%; height: 100%;"></div></div>');
            this.host.prepend(this._rightButton);
            this.host.prepend(this._leftButton);
            this._leftButton.jqxRepeatButton({ theme: this.theme, delay: 250, width: this.sliderButtonSize, height: this.sliderButtonSize });
            this._rightButton.jqxRepeatButton({ theme: this.theme, delay: 250, width: this.sliderButtonSize, height: this.sliderButtonSize });
        },

        _addContentWrapper: function () {
            if (this._contentWrapper === undefined || this._contentWrapper.length === 0) {
                this.host.wrapInner('<div></div>');
                this._contentWrapper = this.host.children(0);
            }
            if (this.orientation === 'horizontal') {
                this._contentWrapper.css('float', 'left');
            } else {
                this._contentWrapper.css('float', 'none');
            }
        },

        //Webkit don't know how to handle with width with floating point. We are correcting the error using displacement and error varaibles
        _addTicks: function (container) {
            if (!this.showTicks)
                return;

            var count = this.max - this.min,
                width = container[this._getDimention('size')](),
                tickscount = Math.round(count / this.ticksFrequency),
                distance = width / tickscount;
            container.empty();
            this._addTick(container, 0, this.min);
            for (var i = 1; i < tickscount; i++) {
                var number = i * distance;
                number = Math.floor(number);
                this._addTick(container, number, i);
            }
            this._addTick(container, tickscount * distance, this.max);
        },

        _addTick: function (container, position, value) {
            var currentTick, size = container[this._getDimention('oSize')]();
            if (this.orientation === 'horizontal') {
                currentTick = $('<div style="float: left; position:absolute; left:' + position +
                                'px;" class="' + this.toThemeProperty('jqx-slider-tick-horizontal') + '"></div>');
                this._tickLayout(container, currentTick);
            } else {
                currentTick = $('<div style="float: none; position:absolute; top:' + position +
                                'px;" class="' + this.toThemeProperty('jqx-slider-tick-vertical') + '"></div>');
                this._tickLayout(container, currentTick);
            }
            //currentTick[0].value = value;
            currentTick.addClass(this.toThemeProperty('jqx-slider-tick'));
            currentTick.addClass(this.toThemeProperty('jqx-fill-state-pressed'));
            container.append(currentTick);
            currentTick[this._getDimention('oSize')](this.tickSize);
        },

        _tickLayout: function (container, currentTick) {
            var size = container[this._getDimention('oSize')]();
            if (container[0] === this._topTicks[0]) {
                currentTick.css(this._getDimention('oDimention'), '2px');
            } else {
                currentTick.css(this._getDimention('oDimention'), size - this.tickSize - 2);
            }
        },

        _addRangeBar: function () {
            if (this._rangeBar === null || this._rangeBar.length < 1) {
                this._rangeBar = $('<div class="' + this.toThemeProperty('jqx-slider-rangebar') + '"></div>');
                this._rangeBar.addClass(this.toThemeProperty('jqx-fill-state-pressed'));
                this._rangeBar.addClass(this.toThemeProperty('jqx-rc-all'));
                this._track.append(this._rangeBar);
            }
            if (!this.showRange) {
                this._rangeBar.css('display', 'none');
            } else {
                this._rangeBar.css('display', 'block');
            }
        },

        _getLeftDisplacement: function () {
            if (!this.showButtons) {
                return 0;
            }
            if (this.rangeSlider) {
                return 0;
            }
            switch (this.buttonsPosition) {
                case 'left':
                    return this._leftButton[this._getDimention('outerSize')](true) + this._rightButton[this._getDimention('outerSize')](true);
                case 'right':
                    return 0;
                default:
                    return this._leftButton[this._getDimention('outerSize')](true);
            }
            return 0;
        },

        _performLayout: function () {
            this.host.width(this.width);
            this.host.height(this.height);
            var size = this.host.height();
            if (this._getDimention('size') == 'width') {
                size = this.host.width();
            }

            this._performButtonsLayout();
            this._performTrackLayout(size);
            this._contentWrapper[this._getDimention('size')](this._track[this._getDimention('size')]());
            this._contentWrapper[this._getDimention('oSize')](this[this._getDimention('oSize')]);
            this._performTicksLayout();
            this._performRangeBarLayout();
            if (this.rangeSlider) {
                this._slider.left.css('visibility', 'visible');
            } else {
                this._slider.left.css('visibility', 'hidden');
            }
            this._refreshRangeBar();
            if (this.orientation == 'vertical') {
                if (this.showButtons) {
                    //   var leftMargin = parseInt(this._leftButton.css('margin-left'));
                    var centerLeft = parseInt((this._leftButton.width() - this._track.width()) / 2);

                    this._track.css('margin-left', -2 + centerLeft + 'px');
                }
            }
        },

        _performTrackLayout: function (size) {
            this._track[this._getDimention('size')](size - ((this.showButtons && !this.rangeSlider) ?
                        this._leftButton[this._getDimention('outerSize')](true) + this._rightButton[this._getDimention('outerSize')](true) : 0));
            this._slider.left.css('left', 0);
            this._slider.left.css('top', 0);
            this._slider.right.css('left', 0);
            this._slider.right.css('top', 0);
        },

        _performTicksLayout: function () {
            this._performTicksContainerLayout();
            this._addTicks(this._topTicks);
            this._addTicks(this._bottomTicks);
            this._topTicks.css('visibility', 'hidden');
            this._bottomTicks.css('visibility', 'hidden');
            if ((this.ticksPosition === 'top' || this.ticksPosition === 'both') && this.showTicks) {
                this._bottomTicks.css('visibility', 'visible');
            }
            if ((this.ticksPosition === 'bottom' || this.ticksPosition === 'both') && this.showTicks) {
                this._topTicks.css('visibility', 'visible');
            }
        },

        _performTicksContainerLayout: function () {
            var sizeDimension = this._getDimention('size');
            var oSizeDimension = this._getDimention('oSize');
            var outerSizeDimension = this._getDimention('outerOSize');

            this._topTicks[sizeDimension](this._track[sizeDimension]());
            this._bottomTicks[sizeDimension](this._track[sizeDimension]());
            var topTicksSize = -1 + (this[oSizeDimension] - this._track[outerSizeDimension](true)) / 2;
            this._topTicks[oSizeDimension](parseInt(topTicksSize));
            var bottomTicksSize = -1 + (this[oSizeDimension] - this._track[outerSizeDimension](true)) / 2;
            this._bottomTicks[oSizeDimension](parseInt(bottomTicksSize));

            if (this.orientation === 'vertical') {
                this._topTicks.css('float', 'left');
                this._track.css('float', 'left');
                this._bottomTicks.css('float', 'left');
            } else {
                this._topTicks.css('float', 'none');
                this._track.css('float', 'none');
                this._bottomTicks.css('float', 'none');
            }
        },

        _performButtonsLayout: function () {
            this._addButtonsStyles();
            this._addButtonsClasses();
            this._addButtonsHover();
            this._orderButtons();
            this._centerElement(this._rightButton);
            this._centerElement(this._leftButton);
            this._layoutButtons();
        },

        _addButtonsStyles: function () {
            this._leftButton.css('background-position', 'center');
            this._rightButton.css('background-position', 'center');
            if (this.orientation === 'vertical') {
                this._leftButton.css('float', 'none');
                this._rightButton.css('float', 'none');
            } else {
                this._leftButton.css('float', 'left');
                this._rightButton.css('float', 'left');
            }
        },

        _addButtonsClasses: function () {
            var icons = { prev: 'left', next: 'right' };
            if (this.orientation === 'vertical') {
                icons = { prev: 'up', next: 'down' };
            }
            this._leftButton.addClass(this.toThemeProperty('jqx-rc-all'));
            this._rightButton.addClass(this.toThemeProperty('jqx-rc-all'));
            this._leftButton.addClass(this.toThemeProperty('jqx-slider-button'));
            this._rightButton.addClass(this.toThemeProperty('jqx-slider-button'));
            this._leftArrow = this._leftButton.find('div');
            this._rightArrow = this._rightButton.find('div');
            this._leftArrow.removeClass(this.toThemeProperty('icon-arrow-left'));
            this._rightArrow.removeClass(this.toThemeProperty('icon-arrow-right'));
            this._leftArrow.removeClass(this.toThemeProperty('icon-arrow-up'));
            this._rightArrow.removeClass(this.toThemeProperty('icon-arrow-down'));
            this._leftArrow.addClass(this.toThemeProperty('icon-arrow-' + icons.prev));
            this._rightArrow.addClass(this.toThemeProperty('icon-arrow-' + icons.next));
        },

        _addButtonsHover: function () {
            var me = this, icons = { prev: 'left', next: 'right' };
            if (this.orientation === 'vertical') {
                icons = { prev: 'up', next: 'down' };
            }

            this.addHandler($(document), 'mouseup.arrow' + this.element.id, function () {
                me._leftArrow.removeClass(me.toThemeProperty('icon-arrow-' + icons.prev + '-selected'));
                me._rightArrow.removeClass(me.toThemeProperty('icon-arrow-' + icons.next + '-selected'));
            });

            this.addHandler(this._leftButton, 'mousedown', function () {
                if (!me.disabled)
                me._leftArrow.addClass(me.toThemeProperty('icon-arrow-' + icons.prev + '-selected'));
            });
            this.addHandler(this._leftButton, 'mouseup', function () {
                if (!me.disabled)
                    me._leftArrow.removeClass(me.toThemeProperty('icon-arrow-' + icons.prev + '-selected'));
            });
            this.addHandler(this._rightButton, 'mousedown', function () {
                if (!me.disabled)
                    me._rightArrow.addClass(me.toThemeProperty('icon-arrow-' + icons.next + '-selected'));
            });
            this.addHandler(this._rightButton, 'mouseup', function () {
                if (!me.disabled)
                    me._rightArrow.removeClass(me.toThemeProperty('icon-arrow-' + icons.next + '-selected'));
            });

            this._leftButton.hover(function () {
                if (!me.disabled)
                    me._leftArrow.addClass(me.toThemeProperty('icon-arrow-' + icons.prev + '-hover'));
            }, function () {
                if (!me.disabled)
                    me._leftArrow.removeClass(me.toThemeProperty('icon-arrow-' + icons.prev + '-hover'));
            });
            this._rightButton.hover(function () {
                if (!me.disabled)
                    me._rightArrow.addClass(me.toThemeProperty('icon-arrow-' + icons.next + '-hover'));
            }, function () {
                if (!me.disabled)
                    me._rightArrow.removeClass(me.toThemeProperty('icon-arrow-' + icons.next + '-hover'));
            });
        },

        _layoutButtons: function () {
            if (this.orientation === 'horizontal') {
                this._horizontalButtonsLayout();
            } else {
                this._verticalButtonsLayout();
            }
        },

        _horizontalButtonsLayout: function () {
            var offset = (2 + Math.ceil(this.sliderButtonSize / 2));
            if (this.buttonsPosition == 'left') {
                this._leftButton.css('margin-right', '0px');
                this._rightButton.css('margin-right', offset);
            } else if (this.buttonsPosition == 'right') {
                this._leftButton.css('margin-left', 2 + offset);
                this._rightButton.css('margin-right', '0px');
            } else {
                this._leftButton.css('margin-right', offset);
                this._rightButton.css('margin-left', 2 + offset);
            }
        },

        _verticalButtonsLayout: function () {
            var offset = (2 + Math.ceil(this.sliderButtonSize / 2));
            if (this.buttonsPosition == 'left') {
                this._leftButton.css('margin-bottom', '0px');
                this._rightButton.css('margin-bottom', offset);
            } else if (this.buttonsPosition == 'right') {
                this._leftButton.css('margin-top', 2 + offset);
                this._rightButton.css('margin-bottom', '0px');
            } else {
                this._leftButton.css('margin-bottom', offset);
                this._rightButton.css('margin-top', 2 + offset);
            }
        },

        _orderButtons: function () {
            this._rightButton.detach();
            this._leftButton.detach();
            switch (this.buttonsPosition) {
                case 'left':
                    this.host.prepend(this._rightButton);
                    this.host.prepend(this._leftButton);
                    break;
                case 'right':
                    this.host.append(this._leftButton);
                    this.host.append(this._rightButton);
                    break;
                case 'both':
                    this.host.prepend(this._leftButton);
                    this.host.append(this._rightButton);
                    break;
            }
        },

        _performRangeBarLayout: function () {
            this._rangeBar[this._getDimention('oSize')](this._track[this._getDimention('oSize')]());
            this._rangeBar[this._getDimention('size')](this._track[this._getDimention('size')]());
            this._rangeBar.css('position', 'absolute');
            this._rangeBar.css('left', 0);
            this._rangeBar.css('top', 0);
        },

        _centerElement: function (element) {
            var displacement = ($(element.parent())[this._getDimention('oSize')]() - element[this._getDimention('outerOSize')]()) / 2;
            element.css('margin-' + [this._getDimention('dimention')], 0);
            element.css('margin-' + [this._getDimention('oDimention')], displacement);
            return element;
        },

        _raiseEvent: function (id, arg) {
            var event = $.Event(this._events[id]);
            event.args = arg;
            if (id === 1) {
                event.args.cancel = false;
                this._slideEvent = event;
            }
            this._lastValue[id] = arg.value;
            return this.host.trigger(event);
        },

        //Initializing the slider - setting it's values, disabling it if
        //disabled is true and setting tab-indexes for the keyboard navigation
        _initialSettings: function () {
            if (this.rangeSlider) {
                if (typeof this.value !== 'number') {
                    this.setValue(this.value);
                } else {
                    this.setValue(this.values);
                }
            } else {
                this.setValue(this.value);
            }
            if (this.disabled) {
                this.disable();
            }
            this.element.tabIndex = 0;
            this.host.find('DIV').css('tab-index', 0);
        },

        //Mouse down handlers for the left and right buttons are because of the mousedown handler for
        //the host (used for directly setting value). When the user clicks on the button first the host
        //triggers mousedown so the _trackMouseDownHandler is executing but we don't want this that's why we are
        //stopping event propagation.
        _addEventHandlers: function () {
            var self = this;
            this.addHandler(this._slider.right, this._getEvent('mousedown'), this._startDrag, { self: this });
            this.addHandler(this._slider.left, this._getEvent('mousedown'), this._startDrag, { self: this });
            this.addHandler($(document), this._getEvent('mouseup') + '.' + this.host.attr('id'), function () {
                self._stopDrag(self);
            });

            if (document.referrer != "" || window.frameElement) {
                if (window.top != null) {
                    var eventHandle = function (event) {
                        self._stopDrag(self);
                    };
                    if (window.parent && document.referrer) {
                        parentLocation = document.referrer;
                    }

                    if (parentLocation.indexOf(document.location.host) != -1) {
                        if (window.top.document) {
                            if (window.top.document.addEventListener) {
                                window.top.document.addEventListener('mouseup', eventHandle, false);

                            } else if (window.top.document.attachEvent) {
                                window.top.document.attachEvent("on" + 'mouseup', eventHandle);
                            }
                        }
                    }
                }
            }
            this.addHandler($(document), this._getEvent('mousemove') + '.' + this.host.attr('id'), this._performDrag, { self: this });
            var me = this;
            this.addHandler(this._slider.left, 'mouseenter', function () {
                if (!me.disabled)
                    self._slider.left.addClass(self.toThemeProperty('jqx-fill-state-hover'));
            });

            this.addHandler(this._slider.right, 'mouseenter', function () {
                if (!me.disabled)
                    self._slider.right.addClass(self.toThemeProperty('jqx-fill-state-hover'));
            });

            this.addHandler(this._slider.left, 'mouseleave', function () {
                if (!me.disabled)
                    self._slider.left.removeClass(self.toThemeProperty('jqx-fill-state-hover'));
            });

            this.addHandler(this._slider.right, 'mouseleave', function () {
                if (!me.disabled)
                    self._slider.right.removeClass(self.toThemeProperty('jqx-fill-state-hover'));
            });

            this.addHandler(this._slider.left, 'mousedown', function () {
                if (!me.disabled)
                    self._slider.left.addClass(self.toThemeProperty('jqx-fill-state-pressed'));
            });

            this.addHandler(this._slider.right, 'mousedown', function () {
                if (!me.disabled)
                    self._slider.right.addClass(self.toThemeProperty('jqx-fill-state-pressed'));
            });

            this.addHandler(this._slider.left, 'mouseup', function () {
                if (!me.disabled)
                    self._slider.left.removeClass(self.toThemeProperty('jqx-fill-state-pressed'));
            });

            this.addHandler(this._slider.right, 'mouseup', function () {
                if (!me.disabled)
                    self._slider.right.removeClass(self.toThemeProperty('jqx-fill-state-pressed'));
            });

            this.addHandler(this._leftButton, this._getEvent('click'), this._leftButtonHandler, { self: this });
            this.addHandler(this._rightButton, this._getEvent('click'), this._rightButtonHandler, { self: this });
            this.addHandler(this._track, this._getEvent('mousedown'), this._trackMouseDownHandler, { self: this });
            this.element.onselectstart = function () { return false; }
            this._addMouseWheelListeners();
            this._addKeyboardListeners();
        },

        _addMouseWheelListeners: function () {
            var self = this;
            this.addHandler(this.host, 'mousewheel', function (event) {
                var scroll = event.wheelDelta;
                if (event.originalEvent && event.originalEvent.wheelDelta) {
                    event.wheelDelta = event.originalEvent.wheelDelta;
                }

                if (!('wheelDelta' in event)) {
                    scroll = event.detail * -40;
                }
                if (scroll > 0) {
                    self.incrementValue();
                } else {
                    self.decrementValue();
                }
                event.preventDefault();
            });
        },

        _addKeyboardListeners: function () {
            var self = this;
            this.addHandler(this.host, 'keydown', function (event) {
                switch (event.keyCode) {
                    case 40:
                    case 37:    //left arrow
                        self.decrementValue();
                        return false;
                    case 38:
                    case 39:    //right arrow
                        self.incrementValue();
                        return false;
                    case 36:    //home
                        if (self.rangeSlider) {
                            self.setValue([self.values[0], self.max]);
                        } else {
                            self.setValue(self.min);
                        }
                        return false;
                    case 35:    //end
                        if (self.rangeSlider) {
                            self.setValue([self.min, self.values[1]]);
                        } else {
                            self.setValue(self.max);
                        }
                        return false;
                }
            });
        },

        _trackMouseDownHandler: function (event) {
            var self = event.data.self,
                event = (self._isTouchDevice) ? event.originalEvent.touches[0] : event,
                position = self._track.offset()[self._getDimention('dimention')],
                pagePos = event[self._getDimention('page')] - self._slider.left[self._getDimention('size')]() / 2,
                slider = self._getClosest(pagePos),
                size = parseInt(self._track[self._getDimention('size')]());
            var value = self._getValueByPosition(pagePos);
            self._setValue(value, slider);
            event.target = slider;
            self._startDrag(event);
        },

        _getClosest: function (position) {
            if (!this.rangeSlider) {
                return this._slider.right;
            } else {
                position = position - this._track.offset()[this._getDimention('dimention')] - this._slider.left[this._getDimention('size')]() / 2;
                if (Math.abs(parseInt(this._slider.left.css(this._getDimention('dimention')), 10) - position) <
                Math.abs(parseInt(this._slider.right.css(this._getDimention('dimention')), 10) - position)) {
                    return this._slider.left;
                } else {
                    return this._slider.right;
                }
            }
        },

        _removeEventHandlers: function () {
            this.removeHandler(this._slider.right, this._getEvent('mousedown'), this._startDrag);
            this.removeHandler(this._slider.left, this._getEvent('mousedown'), this._startDrag);
            this.removeHandler($(document), this._getEvent('mouseup') + '.' + this.host.attr('id'), this._stopDrag);
            this.removeHandler($(document), this._getEvent('mousemove') + '.' + this.host.attr('id'), this._performDrag);
            this.removeHandler(this._leftButton, this._getEvent('click'), this._leftButtonHandler);
            this.removeHandler(this._rightButton, this._getEvent('click'), this._rightButtonHandler);
            this.removeHandler(this._track, this._getEvent('mousedown'), this._trackMouseDownHandler);
            this.element.onselectstart = null;
            this.removeHandler(this.host, this._getEvent('mousewheel'));
            this.removeHandler(this.host, this._getEvent('keydown'));
        },

        _rightButtonHandler: function (event) {
            var self = event.data.self;
            if (self.orientation == 'horizontal') {
                self.incrementValue();
            }
            else {
                self.decrementValue();
            }
        },

        _leftButtonHandler: function (event) {
            var self = event.data.self;
            if (self.orientation == 'horizontal') {
                self.decrementValue();
            }
            else self.incrementValue();
        },

        _startDrag: function (event) {
            var self = event.data.self;
            self._capturedElement = $(event.target);
            self._startX = $(event.target).offset().left;
            self._startY = $(event.target).offset().top;
            self._mouseStartX = (self._isTouchDevice) ? event.originalEvent.touches[0].pageX : event.pageX;
            self._mouseStartY = (self._isTouchDevice) ? event.originalEvent.touches[0].pageY : event.pageY;
            return false;
        },

        _stopDrag: function (self) {
            if (self._slideStarted) {   //if the slideStart event have been triggered and the user is dropping the thumb we are firing a slideStop event
                self._raiseEvent(2, { value: self.getValue() });
            }

            self._slider.left.removeClass(self.toThemeProperty('jqx-fill-state-pressed'));
            self._slider.right.removeClass(self.toThemeProperty('jqx-fill-state-pressed'));

            self._slideStarted = false;
            self._capturedElement = null;
        },

        _performDrag: function (event) {
            var self = event.data.self,
                event = (self._isTouchDevice) ? event.originalEvent.touches[0] : event;
            if (self._capturedElement !== null) {
                if (event.which === 0 && $.browser.msie && $.browser.version < 9) {
                    self._stopDrag(self);
                    return false;
                }
                //if the thumb is dragged more than 3 pixels we are firing an event
                self._isDragged(event[self._getDimention('page')])
                if (self._slideStarted) {
                    return self._dragHandler(event[self._getDimention('page')]);
                }
            }
        },

        _isDragged: function (position) {
            if (Math.abs(position - this[this._getDimention('mouse')]) > 2 && !this._slideStarted) {
                this._slideStarted = true;
                if (this._valueChanged(3)) {
                    this._raiseEvent(3, { value: this.getValue() });
                }
            } else {
                if (this._capturedElement === null) {   //!FIXED!
                    this._slideStarted = false;
                }
            }
        },

        _dragHandler: function (position) {
            position = (position - this[this._getDimention('mouse')]) + this[this._getDimention('start')];
            var newvalue = this._getValueByPosition(position);
            if (this.rangeSlider) {
                var second = this._slider.right,
                     first = this._slider.left;
                var dimension = this._getDimention('dimention');

                if (this._capturedElement[0] === first[0]) {
                    if (parseFloat(position) > second.offset()[dimension]) {
                        position = second.offset()[dimension];
                    }
                } else {
                    if (parseFloat(position) < first.offset()[dimension]) {
                        position = first.offset()[dimension];
                    }
                }
            }
            this._setValue(newvalue, this._capturedElement, position);
            return false;
        },

        _getValueByPosition: function (position) {
            if (this.mode === 'default') {
                return this._getFloatingValueByPosition(position);
            } else {
                return this._getFixedValueByPosition(position);
            }
        },

        _getFloatingValueByPosition: function (position) {
            var relativePosition = position - this._track.offset()[this._getDimention('dimention')] + this._slider.left.width() / 2,
                ratio = relativePosition / this._track[this._getDimention('size')](),
                value = (this.max - this.min) * ratio + this.min;
            if (this.orientation === 'horizontal') {
                return value;
            } else {
                return (this.max + this.min) - value;
            }
        },

        _getFixedValueByPosition: function (position) {
            var step = this.step,
                count = (this.max - this.min) / step, sectorSize = (this._track[this._getDimention('size')]()) / count,
                currentSectorPosition = this._track.offset()[this._getDimention('dimention')] - this._slider.left[this._getDimention('size')]() / 2,
                closestSector = { number: -1, distance: Number.MAX_VALUE };
            //position -= this._track.offset()[this._getDimention('dimention')];
            for (var sector = this.min; sector <= this.max + this.step; sector += this.step) {
                if (Math.abs(closestSector.distance - position) > Math.abs(currentSectorPosition - position)) {
                    closestSector.distance = currentSectorPosition;
                    closestSector.number = sector;
                }
                currentSectorPosition += sectorSize;
            }
            if (this.orientation === 'horizontal') {
                return closestSector.number;
            } else {
                return (this.max + this.min) - closestSector.number;
            }
        },

        _setValue: function (value, slider, position) {
            if (!this._slideEvent || !this._slideEvent.args.cancel) {
                value = this._handleValue(value, slider);
                this._setSliderPosition(value, slider, position);
                this._fixZIndexes();
                if (this._valueChanged(1)) {
                    var event = this._raiseEvent(1, { value: this.getValue() });
                }
                if (this._valueChanged(0)) {
                    this._raiseEvent(0, { value: this.getValue() });
                }
                if (this.tooltip) {
                    slider.attr('title', value);
                }
                if (this.input) {
                    if (!this.rangeSlider) {
                        this.input.val(this.value.toString());
                    }
                    else {
                        if (this.values) {
                            this.input.val(this.value.rangeStart.toString() + "-" + this.value.rangeEnd.toString());
                        }
                    }
                }
            }
        },

        _valueChanged: function (id) {
            var value = this.getValue();
            return (!this.rangeSlider && this._lastValue[id] !== value) ||
                    (this.rangeSlider && (typeof this._lastValue[id] !== 'object' ||
                     Math.round(this._lastValue[id].rangeEnd) !== Math.round(value.rangeEnd) || Math.round(this._lastValue[id].rangeStart) !== Math.round(value.rangeStart)));
        },

        _handleValue: function (value, slider) {
            value = this._validateValue(value, slider);
            if (slider[0] === this._slider.left[0]) {
                this.values[0] = value;
            }
            if (slider[0] === this._slider.right[0]) {
                this.values[1] = value;
            }
            if (this.rangeSlider) {
                this.value = { rangeStart: this.values[0], rangeEnd: this.values[1] };
            } else {
                this.value = value;
            }
            return value;
        },

        _fixZIndexes: function () {
            if (this.values[1] - this.values[0] < 0.5 && this.max - this.values[0] < 0.5) {
                this._slider.left.css('z-index', 20);
                this._slider.right.css('z-index', 15);
            } else {
                this._slider.left.css('z-index', 15);
                this._slider.right.css('z-index', 20);
            }
        },

        _refreshRangeBar: function () {
            var position = this._slider.left.position()[this._getDimention('dimention')];
            if (this.orientation === 'vertical') {
                position = this._slider.right.position()[this._getDimention('dimention')];
            }
            this._rangeBar.css(this._getDimention('dimention'), position + this._slider.left[this._getDimention('size')]() / 2);
            this._rangeBar[this._getDimention('size')](Math.abs(
                this._slider.right.position()[this._getDimention('dimention')] - this._slider.left.position()[this._getDimention('dimention')]));
        },

        _validateValue: function (value, slider) {
            if (value > this.max) {
                value = this.max;
            }
            if (value < this.min) {
                value = this.min;
            }
            if (slider[0] === this._slider.left[0]) {
                if (value >= this.values[1]) {
                    value = this.values[1];
                }
            } else {
                if (value <= this.values[0]) {
                    value = this.values[0];
                }
            }
            return value;
        },

        _setSliderPosition: function (value, slider, position) {
            var trackSize = this._track[this._getDimention('size')](), ratio, distance;
            if (position) {
                position -= this._track.offset()[this._getDimention('dimention')];
            }
            if (this.orientation === 'horizontal') {
                ratio = (value - this.min) / (this.max - this.min);
            } else {
                ratio = 1 - ((value - this.min) / (this.max - this.min));
            }
            distance = (typeof position === 'undefined' || this.mode !== 'default') ?
                            (trackSize * ratio - this._slider.left[this._getDimention('size')]() / 2) : position;
            distance = this._validateDropPosition(distance, slider);
            slider.css(this._getDimention('dimention'), distance);
            this._refreshRangeBar();
        },

        _validateDropPosition: function (distance, slider) {
            var trackSize = this._track[this._getDimention('size')](),
                sliderWidth = slider[this._getDimention('size')]();
            if (distance < -sliderWidth / 2) {
                distance = -sliderWidth / 2;
            }
            if (distance > trackSize - sliderWidth / 2) {
                distance = trackSize - sliderWidth / 2;
            }
            return Math.floor(distance);
        },

        _addDisabledClasses: function () {
            this.host.addClass(this.toThemeProperty('jqx-fill-state-disabled'));
        },

        _removeDisabledClasses: function () {
            this.host.removeClass(this.toThemeProperty('jqx-fill-state-disabled'));
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            switch (key) {
                case 'theme':
                    $.jqx.utilities.setTheme(oldvalue, value, object.host);
                    object._leftButton.jqxRepeatButton({ theme: value });
                    object._rightButton.jqxRepeatButton({ theme: value });
                    break;
                case 'disabled':
                    if (value) {
                        object.disabled = true;
                        object.disable();
                    } else {
                        object.disabled = false;
                        object.enable();
                    }
                    break;
                case 'width':
                    object.width = parseInt(value);
                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'height':
                    object.height = parseInt(value);
                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'min':
                    //   object._performLayout();
                    object.min = parseFloat(value);
                    if (!object.rangeSlider) {
                        object._setValue(value, object._slider.left);
                    }
                    object._initialSettings();
                    break;
                case 'step':
                    break;
                case 'max':
                    object.max = parseFloat(value);
                    if (!object.rangeSlider) {
                        object._setValue(value, object._slider.left);
                    }
                    object._initialSettings();
                    break;
                case 'showTicks':
                case 'ticksPosition':
                case 'ticksFrequency':
                case 'tickSize':
                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'showRange':
                case 'showButtons':
                case 'orientation':
                    object._render();
                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'buttonsPosition':
                    object._refresh();
                    break;
                case 'mode':
                    break;
                case 'rangeSlider':
                    if (!value) {
                        object.value = object.value.rangeEnd;
                    } else {
                        object.value = { rangeEnd: object.value, rangeStart: object.value };
                    }
                    object._render();
                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'value':
                    if (!object.rangeSlider) {
                        object.value = parseFloat(value);
                    }
                    object.setValue(value);
                    break;
                case 'values':
                    object.setValue(value);
                    break;
                case 'tooltip':
                    if (!value) {
                        object._slider.left.removeAttr('title');
                        object._slider.right.removeAttr('title');
                    }
                    break;
                default: object._refresh();
            }
        },

        //Increment slider's value. If it's a range slider it's increment it's end range.
        incrementValue: function (step) {
            if (step == undefined || isNaN(parseFloat(step))) {
                step = this.step;
            }
            if (this.rangeSlider) {
                if (this.values[1] < this.max) {
                    this._setValue(this.values[1] + step, this._slider.right);
                }
            } else {
                if (this.values[1] >= this.min && this.values[1] < this.max) {
                    this._setValue(this.values[1] + step, this._slider.right);
                }
            }
        },

        //Decrementing slider's value. If it's range slider it's decrement it's start range.
        decrementValue: function (step) {
            if (step == undefined || isNaN(parseFloat(step))) {
                step = this.step;
            }
            if (this.rangeSlider) {
                if (this.values[0] > this.min) {
                    this._setValue(this.values[0] - step, this._slider.left);
                }
            } else {
                if (this.values[1] <= this.max && this.values[1] > this.min) {
                    this._setValue(this.values[1] - step, this._slider.right);
                }
            }
        },

        //Setting slider's value. Possible value types - array, one or two numbers.
        setValue: function (value) {
            if (this.rangeSlider) {
                var rangeLeft, rangeRight;
                if (arguments.length < 2) {
                    if (value instanceof Array) {
                        rangeLeft = value[0];
                        rangeRight = value[1];
                    } else if (typeof value === 'object' && typeof value.rangeStart !== 'undefined' && typeof value.rangeEnd !== 'undefined') {
                        rangeLeft = value.rangeStart;
                        rangeRight = value.rangeEnd;
                    }
                } else {
                    rangeLeft = arguments[0];
                    rangeRight = arguments[1];
                }
                this._setValue(rangeRight, this._slider.right);
                this._setValue(rangeLeft, this._slider.left);
            } else {
                this._setValue(this.min, this._slider.left);
                this._setValue(value, this._slider.right);
            }
        },

        //Getting slider's value. If it's a range slider this method returns an array.
        getValue: function () {
            //            if (this.rangeSlider) {
            //                return this.values;
            //            } else {
            return this.value;
            //}
        },

        //Disabling the slider.
        disable: function () {
            this._removeEventHandlers();
            this.disabled = true;
            this._addDisabledClasses();
            this._leftButton.jqxRepeatButton({ disabled: this.disabled });
            this._rightButton.jqxRepeatButton({ disabled: this.disabled });
        },

        //Enabling the slider.
        enable: function () {
            this._addEventHandlers();
            this.disabled = false;
            this._removeDisabledClasses();
            this._leftButton.jqxRepeatButton({ disabled: this.disabled });
            this._rightButton.jqxRepeatButton({ disabled: this.disabled });
        }
    });
})(jQuery);