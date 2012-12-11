/*
jQWidgets v2.5.5 (2012-Nov-28)
Copyright (c) 2011-2012 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function ($) {

    $.extend($.jqx._jqxGrid.prototype, {
        savestate: function (state) {
            var state = this.getstate();

            if (window.localStorage) {
                window.localStorage["jqxGrid" + this.element.id] = this._stringify(state);
            }
            this._savedstate = state;
            return state;
        },

        loadstate: function (gridstate) {
            var state = "";
            if (gridstate != undefined && gridstate.width != undefined) {
                state = gridstate;
            }
            else if (window.localStorage) {
                var state = $.parseJSON(window.localStorage["jqxGrid" + this.element.id]);
            }
            else if (this._savedstate) {
                var state = this._savedstate;
            }
            if (state != null) {
                var data = state;
                this.width = data.width;
                this.height = data.height;
                if (this.pageable) {
                    if (data.pagesize != undefined) {
                        this.pagesize = data.pagesize;
                    }
                    if (data.pagenum != undefined) {
                        this.dataview.pagenum = data.pagenum;
                    }
                    if (data.pagesizeoptions != undefined) {
                        this.pagesizeoptions = data.pagesizeoptions;
                    }
                }
                if (this.sortable) {
                    if (data.sortdirection) {
                        if (data.sortdirection.ascending || data.sortdirection.descending) {
                            this.dataview.sortfield = data.sortcolumn;
                            var direction = data.sortdirection.ascending ? 'asc' : 'desc';
                            this.dataview.sortfielddirection = direction;
                            this.source.sortcolumn = data.sortcolumn;
                            this.source.sortdirection = direction;
                            if (!this.autoloadstate) {
                                this.sortby(data.sortcolumn, direction);
                            }
                        }
                    }
                    else if (this.dataview.sortfield != null && (this.dataview.sortfielddirection == 'asc' || this.dataview.sortfielddirection == 'desc')) {
                        this.sortby(this.dataview.sortfield, null);
                    }
                }
                if (this.groupable) {
                    this.dataview.groups = data.groups;
                    this.groups = data.groups;
                }

                if (this.virtualsizeinfo) {
                    this._loadselectionandcolumnwidths(data);
                }
            }
        },

        _loadselectionandcolumnwidths: function (gridstate) {
            var state = "";

            if (gridstate != undefined && gridstate.width != undefined) {
                state = gridstate;
            }
            else if (window.localStorage) {
                var state = $.parseJSON(window.localStorage["jqxGrid" + this.element.id]);
            }
            else if (this._savedstate) {
                var state = this._savedstate;
            }
            if (state != null) {
                var data = state;
                var me = this;
                var requiresRender = false;
                var columnstomove = [];
                columnstomove.length = 0;
                var columnstomoveindexes = [];
                $.each(this.columns.records, function (index) {
                    var savedColumn = data.columns[this.datafield];
                    if (savedColumn != undefined) {
                        if (this.text != savedColumn.text) {
                            requiresRender = true;
                        }
                        if (this.hidden != savedColumn.hidden) {
                            requiresRender = true;
                        }

                        this.width = savedColumn.width;
                        this.hidden = savedColumn.hidden;
                        this.pinned = savedColumn.pinned;
                        this.groupable = savedColumn.groupable;
                        this.resizable = savedColumn.resizable;
                        this.draggable = savedColumn.draggable;
                        this.text = savedColumn.text;
                        this.align = savedColumn.align;
                        this.cellsalign = savedColumn.cellsalign;
                        if (index != savedColumn.index) {
                            columnstomove[this.datafield] = savedColumn.index;
                            columnstomove.length++;
                        }
                    }
                });

                if (columnstomove.length > 0) {
                    if (this.setcolumnindex) {
                        $.each(this.columns.records, function (index) {
                            var index = columnstomove[this.datafield];
                            me.setcolumnindex(this.datafield, index, false);
                        });
                    }
                    this.prerenderrequired = true;
                    this.rendergridcontent(true);
   
                    if (this._updatefilterrowui && this.filterable && this.showfilterrow) {
                        this._updatefilterrowui();
                    }
                    this._renderrows(this.virtualsizeinfo);
                }

                if (this.filterable) {
                    if (this.clearfilters) {
                        this.clearfilters(false);
                    }
                    for (var i = 0; i < data.filters.filterscount; i++) {
                        var condition = data.filters['filtercondition' + i];
                        var datafield = data.filters['filterdatafield' + i];
                        var column = this.getcolumn(datafield);
                        if (column) {
                            var value = data.filters['filtervalue' + i];
                            var operator = data.filters['filteroperator' + i];
                            var filtergroup = new $.jqx.filter();
                            var filtertype = data.filters['filtertype' + i];
                            var filter = filtergroup.createfilter(filtertype, value, condition);
                            filtergroup.addfilter(operator, filter);

                            if (this.showfilterrow) {
                                var widget = column._filterwidget;
                                var tablecolumn = column._filterwidget.parent();
                                if (widget != null) {
                                    switch (column.filtertype) {
                                        case 'number':
                                            tablecolumn.find('input').val(value);
                                            break;
                                        case 'date':
                                            if (this.host.jqxDateTimeInput) {
                                                var value2 = data.filters['filtervalue' + (i + 1)];
                                                var filtertype = data.filters['filtertype' + i];
                                                var filter = filtergroup.createfilter(filtertype, value2, "LESS_THAN_OR_EQUAL");
                                                filtergroup.addfilter(operator, filter);

                                                $(tablecolumn.children()[0]).jqxDateTimeInput('setRange', new Date(value), new Date(value2));
                                                i++;
                                            }
                                            else widget.val(value);
                                            break;
                                        case 'textbox':
                                        case 'default':
                                            widget.val(value);
                                            me["_oldWriteText" + widget[0].id] = value;
                                            break;
                                        case 'list':
                                            if (this.host.jqxDropDownList) {
                                                var items = $(tablecolumn.children()[0]).jqxDropDownList('getItems');
                                                var index = -1;
                                                $.each(items, function (i) {
                                                    if (this.value == value) {
                                                        index = i;
                                                        return false;
                                                    }
                                                });

                                                $(tablecolumn.children()[0]).jqxDropDownList('selectIndex', index);
                                            }
                                            else widget.val(value);
                                            break;
                                        case 'checkedlist':
                                            if (this.host.jqxDropDownList) {
                                                $(tablecolumn.children()[0]).jqxDropDownList('checkAll');
                                            }
                                            else widget.val(value);
                                            break;
                                        case 'bool':
                                        case 'boolean':
                                            if (!this.host.jqxCheckBox) {
                                                widget.val(value);
                                            }
                                            else $(tablecolumn.children()[0]).jqxCheckBox({ checked: value });
                                            break;
                                    }
                                }
                            }
                            this.addfilter(datafield, filtergroup);
                        }
                    }
                    if (data.filters.filterscount > 0) {
                        this.applyfilters();
                    }

                    if (this.pageable) {
                        if (this.gotopage) {
                            this.dataview.pagenum = -1;
                            this.gotopage(data.pagenum);
                        }
                    }
                }

                if (data.selectedrowindexes && data.selectedrowindexes.length > 0) {
                    this.selectedrowindexes = data.selectedrowindexes;
                    this.selectedrowindex = data.selectedrowindex;
                }
                if (data.selectedcells) {
                    if (this._applycellselection) {
                        $.each(data.selectedcells, function () {
                            me._applycellselection(this.rowindex, this.datafield, true, false);
                        });
                    }
                }

                if (this.groupable) {
                    this._refreshdataview();
                    this.render();
                    return;
                }

                if (requiresRender) {
                    this.prerenderrequired = true;
                    this.rendergridcontent(true);
                    if (this.updating()) {
                        return false;
                    }
                }
                else {
                    this._updatecolumnwidths();
                    this._updatecellwidths();
                }

                this._renderrows(this.virtualsizeinfo);
            }
        },

        getstate: function () {
            var datainfo = this.getdatainformation();
            var data = {};
            data.width = this.width;
            data.height = this.height;
            data.pagenum = datainfo.paginginformation.pagenum;
            data.pagesize = datainfo.paginginformation.pagesize;
            data.pagesizeoptions = this.pagesizeoptions;
            data.sortcolumn = datainfo.sortinformation.sortcolumn;
            data.sortdirection = datainfo.sortinformation.sortdirection;
            if (this.selectionmode != null) {
                if (this.getselectedcells) {
                    if (this.selectionmode.toString().indexOf('cell') != -1) {
                        var selectedcells = this.getselectedcells();
                        var cells = new Array();
                        $.each(selectedcells, function () {
                            cells.push({ datafield: this.datafield, rowindex: this.rowindex });
                        });
                        data.selectedcells = cells;
                    }
                    else {
                        var selectedrowindexes = this.getselectedrowindexes();
                        data.selectedrowindexes = selectedrowindexes;
                        data.selectedrowindex = this.selectedrowindex;
                    }
                }
            }
            var postdata = {};
            var filterslength = 0;
            if (this.dataview.filters) {
                for (var x = 0; x < this.dataview.filters.length; x++) {
                    var filterdatafield = this.dataview.filters[x].datafield;
                    var filter = this.dataview.filters[x].filter;
                    var filters = filter.getfilters();
                    postdata[filterdatafield + "operator"] = filter.operator;
                    for (var m = 0; m < filters.length; m++) {
                        filters[m].datafield = filterdatafield;
                        postdata["filtervalue" + filterslength] = filters[m].value;
                        postdata["filtercondition" + filterslength] = filters[m].condition;
                        postdata["filteroperator" + filterslength] = filters[m].operator;
                        postdata["filterdatafield" + filterslength] = filterdatafield;
                        postdata["filtertype" + filterslength] = filters[m].type;

                        filterslength++;
                    }
                }
            }
            postdata.filterscount = filterslength;
            data.filters = postdata;
            data.groups = this.groups;
            //if (this.groupable && this.groups.length > 0) {
            //    var me = this;
            //    var groupstates = [];
            //    $.each(this.dataview.loadedgroups, function () {
            //        var groupstate = me._findgroupstate(this.uniqueid);
            //        groupstates[this.group] = groupstate;
            //    });
            //    data.groupstates = groupstates;
            //}

            data.columns = {};
            $.each(this.columns.records, function (index, value) {
                var columndata = {};
                columndata.width = this.width;
                columndata.hidden = this.hidden;
                columndata.pinned = this.pinned;
                columndata.groupable = this.groupable;
                columndata.resizable = this.resizable;
                columndata.draggable = this.draggable;
                columndata.text = this.text;
                columndata.align = this.align;
                columndata.cellsalign = this.cellsalign;
                columndata.index = index;
                data.columns[this.datafield] = columndata;
            });

            return data;
        },

        _stringify: function (value) {
            if (window.JSON && typeof window.JSON.stringify === 'function') {
                var me = this;
                var json = "";
                try {
                    json = window.JSON.stringify(value);
                }
                catch (error) {
                    return me._str("", { "": value })
                }
                return json;
            }

            var json = this._str("", { "": value })
            return json;
        },

        _quote: function (string) {
            var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            meta = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            };

            return '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"';
        },


        _stringifyArray: function (value) {
            var len = value.length,
                partial = [],
                i;
            for (var i = 0; i < len; i++) {
                partial.push(this._str(i, value) || 'null');
            }

            return '[' + partial.join(',') + ']';
        },

        _stringifyObject: function (value) {
            var partial = [],
                i, v;
            var me = this;
            for (i in value) {
                if (Object.prototype.hasOwnProperty.call(value, i)) {
                    v = me._str(i, value);
                    if (v) {
                        partial.push(me._quote(i) + ':' + v);
                    }
                }
            }
            return '{' + partial.join(',') + '}';
        },

        _stringifyReference: function (value) {
            switch (Object.prototype.toString.call(value)) {
                case '[object Array]':
                    return this._stringifyArray(value);
            }
            return this._stringifyObject(value);
        },

        _stringifyPrimitive: function (value, type) {
            switch (type) {
                case 'string':
                    return this._quote(value);
                case 'number':
                    return isFinite(value) ? value : 'null';
                case 'boolean':
                    return value;
            }
            return 'null';
        },

        _str: function (key, holder) {
            var value = holder[key], type = typeof value;

            if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
                value = value.toJSON(key);
                type = typeof value;
            }
            if (/(number|string|boolean)/.test(type) || (!value && type === 'object')) {
                return this._stringifyPrimitive(value, type);
            } else {
                return this._stringifyReference(value);
            }
        }
    });
})(jQuery);
