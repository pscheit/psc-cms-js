/*
* jQuery++ - 1.0.0 (2012-11-23)
* http://jquerypp.com
* Copyright (c) 2012 Bitovi
* Licensed MIT
*/
define(['jquery'], function ($) {
	// Checks if x and y coordinates are within a box with left, top, width and height
	var withinBox = function (x, y, left, top, width, height) {
		return (y >= top && y < top + height && x >= left && x < left + width);
	}

	$.fn.within = function (left, top, useOffsetCache) {
		var ret = []
		this.each(function () {
			var q = jQuery(this);

			if (this == document.documentElement) {
				return ret.push(this);
			}

			// uses either the cached offset or .offset()
			var offset = useOffsetCache ? jQuery.data(this, "offsetCache") || jQuery.data(this, "offsetCache", q.offset()) : q.offset();

			// Check if the given coordinates are within the area of the current element
			var res = withinBox(left, top, offset.left, offset.top, this.offsetWidth, this.offsetHeight);

			if (res) {
				// Add it to the results
				ret.push(this);
			}
		});

		return this.pushStack(jQuery.unique(ret), "within", left + "," + top);
	}

	$.fn.withinBox = function (left, top, width, height, useOffsetCache) {
		var ret = []
		this.each(function () {
			var q = jQuery(this);

			if (this == document.documentElement) return ret.push(this);

			// use cached offset or .offset()
			var offset = useOffsetCache ? jQuery.data(this, "offset") || jQuery.data(this, "offset", q.offset()) : q.offset();

			var ew = q.width(),
				eh = q.height(),
				// Checks if the element offset is within the given box
				res = !((offset.top > top + height) || (offset.top + eh < top) || (offset.left > left + width) || (offset.left + ew < left));

			if (res) ret.push(this);
		});
		return this.pushStack(jQuery.unique(ret), "withinBox", jQuery.makeArray(arguments).join(","));
	}

	return $;
});