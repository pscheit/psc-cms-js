/*
* jQuery++ - 1.0.0 (2012-11-23)
* http://jquerypp.com
* Copyright (c) 2012 Bitovi
* Licensed MIT
*/
define(['jquery', 'jquerypp/event/default'], function ($) {

	var current, rnamespaces = /\.(.*)$/,
		returnFalse = function () {
			return false
		},
		returnTrue = function () {
			return true
		};

	$.Event.prototype.isPaused = returnFalse

	$.Event.prototype.pause = function () {
		// stop the event from continuing temporarily
		// keep the current state of the event ...
		this.pausedState = {
			isDefaultPrevented: this.isDefaultPrevented() ? returnTrue : returnFalse,
			isPropagationStopped: this.isPropagationStopped() ? returnTrue : returnFalse
		};

		this.stopImmediatePropagation();
		this.preventDefault();
		this.isPaused = returnTrue;
	};

	$.Event.prototype.resume = function () {
		// temporarily remove all event handlers of this type 
		var handleObj = this.handleObj,
			currentTarget = this.currentTarget;
		// temporarily overwrite special handle
		var origType = jQuery.event.special[handleObj.origType],
			origHandle = origType && origType.handle;

		if (!origType) {
			jQuery.event.special[handleObj.origType] = {};
		}
		jQuery.event.special[handleObj.origType].handle = function (ev) {
			// remove this once we have passed the handleObj
			if (ev.handleObj === handleObj && ev.currentTarget === currentTarget) {
				if (!origType) {
					delete jQuery.event.special[handleObj.origType];
				} else {
					jQuery.event.special[handleObj.origType].handle = origHandle;
				}
			}
		}
		delete this.pausedState;
		// reset stuff
		this.isPaused = this.isImmediatePropagationStopped = returnFalse;

		if (!this.isPropagationStopped()) {
			// fire the event again, no events will get fired until
			// same currentTarget / handler
			$.event.trigger(this, [], this.target);
		}

	};

	return $;
});