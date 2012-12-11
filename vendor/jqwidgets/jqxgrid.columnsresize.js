/*
jQWidgets v2.5.5 (2012-Nov-28)
Copyright (c) 2011-2012 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.extend($.jqx._jqxGrid.prototype, {
        autoresizecolumns: function(resizetype)
        {
            if (resizetype != 'cells' && resizetype != 'all' && resizetype != 'column') resizetype = 'all';
            var me = this;
            var rows = this.getrows();
            if (this.pageable) {
                rows = this.dataview.rows;
            }

            var length = rows.length;
            if (length == undefined && rows != undefined) {
                var rowsArr = new Array();
                $.each(rows, function (index) {
                    rowsArr.push(this);
                });
                rows = rowsArr;
                length = rows.length;
            }

            var span = $("<span></span>");
            span.addClass('jqx-grid-cell');
            $(document.body).append(span);
            var textlength = [];
            var maxLength = [];
            var maxText = [];
            var hostwidth = me.host.width();
            if (me.vScrollBar[0].style.visibility != 'hidden') {
                hostwidth -= this.scrollbarsize + 5;
            }
            if (hostwidth < 0) hostwidth = 0;

            for (var i = 0; i < length; i++) {
                var row = rows[i];

                for (var j = 0; j < this.columns.records.length; j++) {
                    var column = this.columns.records[j];
                    if (column.hidden) continue;

                    if (maxLength[column.datafield] == undefined) {
                        maxLength[column.datafield] = 0;
                    }

                    if (maxText[column.datafield] == undefined) {
                        maxText[column.datafield] = "";
                    }

                    var text = row[column.datafield];
                    if (column.cellsformat != '') {
                        if ($.jqx.dataFormat) {
                            if ($.jqx.dataFormat.isDate(text)) {
                                text = $.jqx.dataFormat.formatdate(text, column.cellsformat, this.gridlocalization);
                            }
                            else if ($.jqx.dataFormat.isNumber(text)) {
                                text = $.jqx.dataFormat.formatnumber(text, column.cellsformat, this.gridlocalization);
                            }
                        }
                    }
                    else if (column.cellsrenderer)
                        text = column.cellsrenderer(row, column, text).toString();

                    if (resizetype == undefined || resizetype == 'cells' || resizetype == 'all') {
                        var textlength = text.toString().length;
                        if (textlength > maxLength[column.datafield]) {
                            maxLength[column.datafield] = textlength;
                            maxText[column.datafield] = text;
                        }
                    }

                    if (resizetype == 'column' || resizetype == 'all') {
                        if (column.text.toString().length > maxLength[column.datafield]) {
                            maxText[column.datafield] = column.text;
                        }
                    }
                }
            }

            for (var j = 0; j < this.columns.records.length; j++) {
                var column = this.columns.records[j];
                if (maxText[column.datafield] == undefined) {
                    maxText[column.datafield] = column.text;
                }

                span[0].innerHTML = maxText[column.datafield];
                var maxWidth = span.outerWidth() + 20;
                if (span.children().length > 0) {
                    maxWidth = span.children().outerWidth() + 20;
                }
                if ($.browser.msie && $.browser.version < 8) {
                    maxWidth += 10;
                }

                if (maxWidth > column.maxwidth) maxWidth = column.maxwidth;

                if (column._width != undefined) column.__width = column._width;
                column._width = null;
                if (column.maxwidth == 'auto' || maxWidth <= column.maxwidth) {
                    var oldwidth = column.width;
                    column.width = maxWidth;
                    if (column._percentagewidth != undefined) {
                        column._percentagewidth = (column.width / hostwidth) * 100;
                    }
                    this._raiseEvent(14, { columntext: column.text, column: column.getcolumnproperties(), datafield: column.datafield, oldwidth: oldwidth, newwidth: maxWidth });
                }
            }

            span.remove();
            this._updatecolumnwidths();
            this._updatecellwidths();
            this._renderrows(this.virtualsizeinfo);
            for (var j = 0; j < this.columns.records.length; j++) {
                var column = this.columns.records[j];
                if (column.__width != undefined) {
                    column._width = column.__width;
                }
            }
        },

        autoresizecolumn: function(datafield, resizetype)
        {
            if (resizetype != 'cells' && resizetype != 'all' && resizetype != 'column') resizetype = 'all';
            if (datafield == undefined) return false;

            var rows = this.getrows();
            if (this.pageable) {
                rows = this.dataview.rows;
            }

            var column = this.getcolumn(datafield);
            if (column == undefined) return false;

            var length = rows.length;
            var span = $("<span></span>");
            span.addClass('jqx-grid-cell');
            $(document.body).append(span);
            var maxLength = 0;
            var maxText = "";
            var me = this;
            var hostwidth = me.host.width();
            if (me.vScrollBar[0].style.visibility != 'hidden') {
                hostwidth -= this.scrollbarsize + 5;
            }
            if (hostwidth < 0) hostwidth = 0;


            if (resizetype == undefined || resizetype == 'cells' || resizetype == 'all') {
                for (var i = 0; i < length; i++) {
                    var text = rows[i][datafield];
                    if (column.cellsformat != '') {
                        if ($.jqx.dataFormat) {
                            if ($.jqx.dataFormat.isDate(text)) {
                                text = $.jqx.dataFormat.formatdate(text, column.cellsformat, this.gridlocalization);
                            }
                            else if ($.jqx.dataFormat.isNumber(text)) {
                                text = $.jqx.dataFormat.formatnumber(text, column.cellsformat, this.gridlocalization);
                            }
                        }                
                    } else if (column.cellsrenderer)
                        text = column.cellsrenderer(row, column, text).toString();

                    var textlength = text.toString().length;
                    if (textlength > maxLength) {
                        maxLength = textlength;
                        maxText = text;
                    }
                }
            }

            if (resizetype == 'column' || resizetype == 'all') {
                if (column.text.toString().length > maxLength) {
                    maxText = column.text;
                }
            }
            if (maxText == undefined) {
                maxText = column.text;
            }

            span[0].innerHTML = maxText;
            var maxWidth = span.outerWidth() + 10;
            if ($.browser.msie && $.browser.version < 8) {
                maxWidth += 5;
            }

            span.remove();
            if (maxWidth > column.maxwidth) maxWidth = column.maxwidth;

            if (column.maxwidth == 'auto' || maxWidth <= column.maxwidth) {
                var oldwidth = column.width;
                column.width = maxWidth;
                if (column._width != undefined) column.__width = column._width;
                column._width = null;
                if (column._percentagewidth != undefined) {
                    column._percentagewidth = (column.width / hostwidth) * 100;
                }
                this._updatecolumnwidths();
                this._updatecellwidths();
                this._raiseEvent(14, { columntext: column.text, column: column.getcolumnproperties(), datafield: datafield, oldwidth: oldwidth, newwidth: maxWidth });
                this._renderrows(this.virtualsizeinfo);
                if (column._width != undefined)
                    column._width = column.__width;
            }
        },

        _handlecolumnsresize: function () {
            var self = this;
            if (this.columnsresize) {
                var touchdevice = false;
                if (self.isTouchDevice()) {
                    touchdevice = true;
                }
                var mousemove = 'mousemove.resize' + this.element.id;
                var mousedown = 'mousedown.resize' + this.element.id;
                var mouseup = 'mouseup.resize' + this.element.id;
                if (touchdevice) {
                    var mousemove = 'touchmove.resize' + this.element.id;
                    var mousedown = 'touchstart.resize' + this.element.id;
                    var mouseup = 'touchend.resize' + this.element.id;
                }

                this.removeHandler($(document), mousemove);
                this.addHandler($(document), mousemove, function (event) {
                    var openedmenu = $.data(document.body, "contextmenu" + self.element.id);
                    if (openedmenu != null)
                        return true;

                    if (self.resizablecolumn != null && !self.disabled && self.resizing) {
                        if (self.resizeline != null) {
                            var hostoffset = self.host.offset();
                            var startleft = parseInt(self.resizestartline.offset().left);

                            var minleft = startleft - self._startcolumnwidth
                            var mincolumnwidth = self.resizablecolumn.column.minwidth;
                            if (mincolumnwidth == 'auto') mincolumnwidth = 0;
                            else mincolumnwidth = parseInt(mincolumnwidth);
                            var maxcolumnwidth = self.resizablecolumn.column.maxwidth;
                            if (maxcolumnwidth == 'auto') maxcolumnwidth = 0;
                            else maxcolumnwidth = parseInt(maxcolumnwidth);
                            var pageX = event.pageX;
                            if (touchdevice) {
                                var touches = self.getTouches(event);
                                var touch = touches[0];
                                pageX = touch.pageX;
                            }

                            minleft += mincolumnwidth;

                            var maxleft = maxcolumnwidth > 0 ? startleft + maxcolumnwidth : 0;
                            var canresize = maxcolumnwidth == 0 ? true : self._startcolumnwidth + pageX - startleft < maxcolumnwidth ? true : false;

                            if (canresize) {
                                if (pageX >= hostoffset.left && pageX >= minleft && pageX <= hostoffset.left + self.host.width()) {
                                    if (maxleft != 0 && event.pageX < maxleft) {
                                        self.resizeline.css('left', pageX);
                                    }
                                    else if (maxleft == 0) {
                                        self.resizeline.css('left', pageX);
                                    }

                                    if (touchdevice)
                                        return false;
                                }
                            }
                        }
                    }

                    if (!touchdevice)
                        return false;
                });

                this.removeHandler($(document), mousedown);
                this.addHandler($(document), mousedown, function (event) {
                    var openedmenu = $.data(document.body, "contextmenu" + self.element.id);
                    if (openedmenu != null)
                        return true;

                    if (self.resizablecolumn != null && !self.disabled) {
                        var resizeElement = self.resizablecolumn.columnelement;
                        if (resizeElement.offset().top + resizeElement.height() + 5 < event.pageY) {
                            self.resizablecolumn = null;
                            return;
                        }

                        self._startcolumnwidth = self.resizablecolumn.column.width;
                        self.resizablecolumn.column._width = null;
                        $(document.body).addClass('jqx-disableselect');
                        self._mouseDownResize = new Date();
                        self.resizing = true;

                        self._resizecolumn = self.resizablecolumn.column;
                        self.resizeline = self.resizeline || $('<div style="position: absolute;"></div>');
                        self.resizestartline = self.resizestartline || $('<div style="position: absolute;"></div>');

                        self.resizebackground = self.resizebackground || $('<div style="position: absolute; left: 0; top: 0; background: #000;"></div>');
                        self.resizebackground.css('opacity', 0.01);
                        self.resizebackground.css('cursor', "col-resize");
                        self.resizeline.css('cursor', 'col-resize');
                        self.resizestartline.css('cursor', 'col-resize');

                        self.resizeline.addClass(self.toThemeProperty('jqx-grid-column-resizeline'));
                        self.resizestartline.addClass(self.toThemeProperty('jqx-grid-column-resizestartline'));

                        $(document.body).append(self.resizeline);
                        $(document.body).append(self.resizestartline);
                        $(document.body).append(self.resizebackground);
                        var resizelineoffset = self.resizablecolumn.columnelement.offset();

                        self.resizebackground.css('left', self.host.offset().left);
                        self.resizebackground.css('top', self.host.offset().top);
                        self.resizebackground.width(self.host.width());
                        self.resizebackground.height(self.host.height());
                        self.resizebackground.css('z-index', 999999999);

                        var positionline = function (resizeline) {
                            resizeline.css('left', parseInt(resizelineoffset.left) + self._startcolumnwidth);
                            var hasgroups = self._groupsheader();
                            var groupsheaderheight = hasgroups ? self.groupsheader.height() : 0;
                            var toolbarheight = self.showtoolbar ? self.toolbarheight : 0;
                            groupsheaderheight += toolbarheight;
                            var statusbarheight = self.showstatusbar ? self.statusbarheight : 0;
                            groupsheaderheight += statusbarheight;

                            var pagerheight = 0;
                            if (self.pageable) {
                                pagerheight = self.pagerheight;
                            }
                            var scrollbaroffset = self.hScrollBar.css('visibility') == 'visible' ? 17 : 0;

                            resizeline.css('top', parseInt(resizelineoffset.top));
                            resizeline.css('z-index', 9999999999);
                            resizeline.height(self.host.height() - pagerheight - groupsheaderheight - scrollbaroffset);
                            if (self.enableanimations) {
                                resizeline.show('fast');
                            }
                            else {
                                resizeline.show();
                            }
                        }
                        positionline(self.resizeline);
                        positionline(self.resizestartline);
                    }
                });

                var doresize = function () {
                    $(document.body).removeClass('jqx-disableselect');
                    if (!self.resizing)
                        return;

                    self._mouseUpResize = new Date();
                    var timeout = self._mouseUpResize - self._mouseDownResize;
                    if (timeout < 200) {
                        self.resizing = false;
                        if (self._resizecolumn != null && self.resizeline != null && self.resizeline.css('display') == 'block') {
                            self._resizecolumn = null;
                            self.resizeline.hide();
                            self.resizestartline.hide();
                            self.resizebackground.remove();
                        }
                        return;
                    }

                    self.resizing = false;

                    if (self.disabled)
                        return;

                    var hostwidth = self.host.width();
                    if (self.vScrollBar[0].style.visibility != 'hidden') hostwidth -= 20;
                    if (hostwidth < 0) hostwidth = 0;

                    if (self._resizecolumn != null && self.resizeline != null && self.resizeline.css('display') == 'block') {
                        var resizelineleft = parseInt(self.resizeline.css('left'));
                        var resizestartlineleft = parseInt(self.resizestartline.css('left'));

                        var newwidth = self._startcolumnwidth + resizelineleft - resizestartlineleft;
                        var oldwidth = self._resizecolumn.width;
                        self._closemenu();
                        self._resizecolumn.width = newwidth;
                        if (self._resizecolumn._percentagewidth != undefined) {
                            self._resizecolumn._percentagewidth = (newwidth / hostwidth) * 100;
                        }
                        self._updatecolumnwidths();
                        self._updatecellwidths();
                        self._raiseEvent(14, { columntext: self._resizecolumn.text, column: self._resizecolumn.getcolumnproperties(), datafield: self._resizecolumn.datafield, oldwidth: oldwidth, newwidth: newwidth });
                        self._renderrows(self.virtualsizeinfo);
                        if (self.autosavestate) {
                            if (self.savestate) self.savestate();
                        }
                        self._resizecolumn = null;

                        self.resizeline.hide();
                        self.resizestartline.hide();
                        self.resizebackground.remove();
                    }
                    else {
                        self.resizablecolumn = null;
                    }
                }

                if (window.frameElement) {
                    if (document.referrer != "" || window.top != null) {
                        var parentLocation = '';
                        if (window.parent && document.referrer) {
                            parentLocation = document.referrer;
                        }

                        if (parentLocation.indexOf(document.location.host) != -1) {
                            var eventHandle = function (event) {
                                doresize();
                            };

                            if (window.top.document.addEventListener) {
                                window.top.document.addEventListener('mouseup', eventHandle, false);

                            } else if (window.top.document.attachEvent) {
                                window.top.document.attachEvent("on" + 'mouseup', eventHandle);
                            }
                        }
                    }
                }

                this.removeHandler($(document), mouseup);
                this.addHandler($(document), mouseup, function (event) {
                    var openedmenu = $.data(document.body, "contextmenu" + self.element.id);
                    if (openedmenu != null)
                        return true;

                    doresize();
                });
            }
        }
    });
})(jQuery);


