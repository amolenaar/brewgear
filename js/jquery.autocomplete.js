/*
 * Autocomplete - jQuery plugin 1.0 Alpha
 *
 * Copyright (c) 2007 Dylan Verheul, Dan G. Switzer, Anjesh Tuladhar, Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id$
 *
 * AJM: changed code to also accept functions. This isput in the URL property, since they behave alike.
 *
 */

/**
 * Provide autocomplete for text-inputs or textareas.
 *
 * Depends on dimensions plugin's offset method for correct positioning of the select box and bgiframe plugin
 * to fix IE's problem with selects.
 *
 * @example $("#input_box").autocomplete("my_autocomplete_backend.php");
 * @before <input id="input_box" />
 * @desc Autocomplete a text-input with remote data. For small to giant datasets.
 *
 * When the user starts typing, a request is send to the specified backend ("my_autocomplete_backend.php"),
 * with a GET parameter named q that contains the current value of the input box and a paremeter "limit" with
 * the value specified for the max option.
 *
 * A value of "foo" would result in this request url: my_autocomplete_backend.php?q=foo&limit=10
 *
 * The result must return with one value on each line. The result is presented in the order
 * the backend sends it.
 *
 * @example $("#input_box").autocomplete(["Cologne", "Berlin", "Munich"]);
 * @before <input id="input_box" />
 * @desc Autcomplete a text-input with local data. For small datasets.
 *
 * @example $.getJSON("my_backend.php", function(data) {
 *   $("#input_box").autocomplete(data);
 * });
 * @before <input id="input_box" />
 * @desc Autcomplete a text-input with data received via AJAX. For small to medium sized datasets.
 *
 * @example $("#mytextarea").autocomplete(["Cologne", "Berlin", "Munich"], {
 *  multiple: true
 * });
 * @before <textarea id="mytextarea" />
 * @desc Autcomplete a textarea with local data (for small datasets). Once the user chooses one
 * value, a separator is appended (by default a comma, see multipleSeparator option) and more values
 * are autocompleted.
 *
 * @name autocomplete
 * @cat Plugins/Autocomplete
 * @type jQuery
 * @param String|Array urlOrData Pass either an URL for remote-autocompletion or an array of data for local auto-completion
 * @param Map options Optional settings
 * @option String inputClass This class will be added to the input box. Default: "ac_input"
 * @option String resultsClass The class for the UL that will contain the result items (result items are LI elements). Default: "ac_results"
 * @option String loadingClass The class for the input box while results are being fetched from the server. Default: "ac_loading"
 * @option Number minChars The minimum number of characters a user has to type before the autocompleter activates. Default: 1
 * @option Number delay The delay in milliseconds the autocompleter waits after a keystroke to activate itself. Default: 400 for remote, 10 for local
 * @option Number cacheLength The number of backend query results to store in cache. If set to 1 (the current result), no caching will happen. Do not set below 1. Default: 10
 * @option Boolean matchSubset Whether or not the autocompleter can use a cache for more specific queries. This means that all matches of "foot" are a subset of all matches for "foo". Usually this is true, and using this options decreases server load and increases performance. Only useful with cacheLength settings bigger than one, like 10. Default: true
 * @option Boolean matchCase Whether or not the comparison is case sensitive. Only important only if you use caching. Default: false
 * @option Boolean matchContains Whether or not the comparison looks inside (i.e. does "ba" match "foo bar") the search results. Only important if you use caching. Don't mix with autofill. Default: false
 * @option Booolean mustMatch If set to true, the autocompleter will only allow results that are presented by the backend. Note that illegal values result in an empty input box. Default: false
 * @option Object extraParams Extra parameters for the backend. If you were to specify { bar:4 }, the autocompleter would call my_autocomplete_backend.php?q=foo&bar=4 (assuming the input box contains "foo"). The param can be a function that is called to calculate the param before each request. Default: none
 * @option Boolean selectFirst If this is set to true, the first autocomplete value will be automatically selected on tab/return, even if it has not been handpicked by keyboard or mouse action. If there is a handpicked (highlighted) result, that result will take precedence. Default: true
 * @option Function|Boolean formatItem Provides advanced markup for an item. For each row of results, this function will be called. If false is returned, the row is skipped. Otherwise the returned value will be displayed inside an LI element in the results list. Autocompleter will provide 3 parameters: the results row, the position of the row in the list of results (starting at 1), and the number of items in the list of results. Default: none, assumes that a single row contains a single value.
 * @option Function formatResult Similar to formatResult, but provides the formatting for the value to be put into the input field. Again three arguments: Data, position (starting with one) and total number of data. Default: none, assumes either plain data to use as result or uses the same value as provided by formatItem.
 * @option Boolean multiple Whether to allow more than one autocomplted-value to enter. Default: false
 * @option String multipleSeparator Seperator to put between values when using multiple option. Default: ", "
 * @option Number width Specify a custom width for the select box. Default: width of the input element
 * @option Boolean autoFill Fill the textinput while still selecting a value, replacing the value if more is type or something else is selected. Default: false
 * @option Number max Limit the number of items in the select box. Is also send as a "limit" parameter with a remote request. Default: 10
 * @option Boolean|Function highlight Whether and how to highlight matches in the select box. Set to false to disable. Set to a function to customize. The function gets the value as the first argument and the search term as the second and must return the formatted value. Default: Wraps the search term in a <strong> element 
 * @option Boolean|String moreItems Whether or not to show the "more items" text if there are more items than are currently be displayed. Set to false to disable. Set to a string to customize the html. Default: Displays "more", surrounded with three arrows.
 */

/**
 * Handle the result of a search event. Is executed when the user selects a value or a
 * programmatic search event is triggered (see search()).
 *
 * You can add and remove (using unbind("result")) this event at any time.
 *
 * @example jQuery('input#suggest').result(function(event, data, formatted) {
 *   jQuery("#result").html( !data ? "No match!" : "Selected: " + formatted);
 * });
 * @desc Bind a handler to the result event to display the selected value in a #result element.
 *    The first argument is a generic event object, in this case with type "result".
 *    The second argument refers to the selected data, which can be a plain string value or an array or object.
 *    The third argument is the formatted value that is inserted into the input field.
 *
 * @param Function handler The event handler, gets a default event object as first and
 * 		the selected list item as second argument.
 * @name result
 * @cat Plugins/Autocomplete
 * @type jQuery
 */

/**
 * Trigger a search event. See result(Function) for binding to that event.
 *
 * A search event mimics the same behaviour as when the user selects a value from
 * the list of autocomplete items. You can use it to execute anything that does something
 * with the selected value, beyond simply putting the value into the input and submitting it.
 *
 * @example jQuery('input#suggest').search();
 * @desc Triggers a search event.
 *
 * @name search
 * @cat Plugins/Autocomplete
 * @type jQuery
 */
 
/**
 * Flush (empty) the cache of matched input's autocompleters.
 *
 * @example jQuery('input#suggest').flushCache();
 *
 * @name flushCache
 * @cat Plugins/Autocomplete
 * @type jQuery
 */

/**
 * Updates the options for the current autocomplete field. This allows 
 * you to change things like the URL, max items to display, etc. If you're
 * changing the URL, be sure to remember to call the flushCache() method.
 *
 * @example jQuery('input#suggest').setOptions({
 *  max: 15
 * });
 * @desc Changes the maximum number of items to display to 15.
 *
 * @name setOptions
 * @cat Plugins/Autocomplete
 * @type jQuery
 */
 
jQuery.fn.extend({
	autocomplete: function(urlOrData, options) {
		var isUrl = typeof urlOrData == "string" || typeof urlOrData == "function";
		
		options = jQuery.extend({}, jQuery.Autocompleter.defaults, {
			url: isUrl ? urlOrData : null,
			data: isUrl ? null : urlOrData,
			delay: isUrl ? jQuery.Autocompleter.defaults.delay : 10
		}, options);
		
		// if highlight is set to false, replace it with a do-nothing function
		options.highlight = options.highlight || function(value) { return value; };
		// if moreItems is false, replace it w/empty string
		options.moreItems = options.moreItems || "";
		
		return this.each(function() {
			new jQuery.Autocompleter(this, options);
		});
	},
	result: function(handler) {
		return this.bind("result", handler);
	},
	search: function(handler) {
		return this.trigger("search", [handler]);
	},
	flushCache: function() {
		return this.trigger("flushCache");
	},
	setOptions: function(options){
		return this.trigger("setOptions", [options]);
	}
});

jQuery.Autocompleter = function(input, options) {

	var KEY = {
		UP: 38,
		DOWN: 40,
		DEL: 46,
		TAB: 9,
		RETURN: 13,
		ESC: 27,
		COMMA: 188
	};

	// Create jQuery object for input element
	var $input = jQuery(input).attr("autocomplete", "off").addClass(options.inputClass);

	var timeout;
	var previousValue = "";
	var cache = jQuery.Autocompleter.Cache(options);
	var hasFocus = 0;
	var lastKeyPressCode;
	var config = {
		mouseDownOnSelect: false
	};
	var select = jQuery.Autocompleter.Select(options, input, selectCurrent, config);
	
	$input.keydown(function(event) {
		// track last key pressed
		lastKeyPressCode = event.keyCode;
		switch(event.keyCode) {
		
			case KEY.UP:
				event.preventDefault();
				if ( select.visible() ) {
					select.prev();
				} else {
					onChange(0, true);
				}
				break;
				
			case KEY.DOWN:
				event.preventDefault();
				if ( select.visible() ) {
					select.next();
				} else {
					onChange(0, true);
				}
				break;
			
			// matches also semicolon
			case options.multiple && jQuery.trim(options.multipleSeparator) == "," && KEY.COMMA:
			case KEY.TAB:
			case KEY.RETURN:
				if( selectCurrent() ){
					// make sure to blur off the current field
					if( !options.multiple )
						$input.blur();
					event.preventDefault();
				}
				break;
				
			case KEY.ESC:
				select.hide();
				break;
				
			default:
				clearTimeout(timeout);
				timeout = setTimeout(onChange, options.delay);
				break;
		}
	}).keypress(function() {
		// having fun with opera - remove this binding and Opera submits the form when we select an entry via return
	}).focus(function(){
		// track whether the field has focus, we shouldn't process any
		// results if the field no longer has focus
		hasFocus++;
	}).blur(function() {
		hasFocus = 0;
		if (!config.mouseDownOnSelect) {
			hideResults();
		}
	}).click(function() {
		// show select when clicking in a focused field
		if ( hasFocus++ > 1 && !select.visible() ) {
			onChange(0, true);
		}
	}).bind("search", function() {
		var fn = (arguments.length > 1) ? arguments[1] : null;
		function findValueCallback(q, data) {
			var result;
			if( data && data.length ) {
				for (var i=0; i < data.length; i++) {
					if( data[i].result.toLowerCase() == q.toLowerCase() ) {
						result = data[i];
						break;
					}
				}
			}
			if( typeof fn == "function" ) fn(result);
			else $input.trigger("result", result && [result.data, result.value]);
		}
		jQuery.each(trimWords($input.val()), function(i, value) {
			request(value, findValueCallback, findValueCallback);
		});
	}).bind("flushCache", function() {
		cache.flush();
	}).bind("setOptions", function() {
		jQuery.extend(options, arguments[1]);
		// if we've updated the data, repopulate
		if ( "data" in arguments[1] )
			cache.populate();
	});
	
	hideResultsNow();
	
	function selectCurrent() {
		var selected = select.selected();
		if( !selected )
			return false;
		
		var v = selected.result;
		previousValue = v;
		
		if ( options.multiple ) {
			var words = trimWords($input.val());
			if ( words.length > 1 ) {
				v = words.slice(0, words.length - 1).join( options.multipleSeparator ) + options.multipleSeparator + v;
			}
			v += options.multipleSeparator;
		}
		
		$input.val(v);
		hideResultsNow();
		$input.trigger("result", [selected.data, selected.value]);
		return true;
	}
	
	function onChange(crap, skipPrevCheck) {
		if( lastKeyPressCode == KEY.DEL ) {
			select.hide();
			return;
		}
		
		var currentValue = $input.val();
		
		if ( !skipPrevCheck && currentValue == previousValue )
			return;
		
		previousValue = currentValue;
		
		currentValue = lastWord(currentValue);
		if ( currentValue.length >= options.minChars) {
			$input.addClass(options.loadingClass);
			if (!options.matchCase)
				currentValue = currentValue.toLowerCase();
			request(currentValue, receiveData, hideResultsNow);
		} else {
			stopLoading();
			select.hide();
		}
	};
	
	function trimWords(value) {
		if ( !value ) {
			return [""];
		}
		var words = value.split( jQuery.trim( options.multipleSeparator ) );
		var result = [];
		jQuery.each(words, function(i, value) {
			if ( jQuery.trim(value) )
				result[i] = jQuery.trim(value);
		});
		return result;
	}
	
	function lastWord(value) {
		if ( !options.multiple )
			return value;
		var words = trimWords(value);
		return words[words.length - 1];
	}
	
	// fills in the input box w/the first match (assumed to be the best match)
	function autoFill(q, sValue){
		// autofill in the complete box w/the first match as long as the user hasn't entered in more data
		// if the last user key pressed was backspace, don't autofill
		if( options.autoFill && (lastWord($input.val()).toLowerCase() == q.toLowerCase()) && lastKeyPressCode != 8 ) {
			// fill in the value (keep the case the user has typed)
			$input.val($input.val() + sValue.substring(lastWord(previousValue).length));
			// select the portion of the value not typed by the user (so the next character will erase)
			jQuery.Autocompleter.Selection(input, previousValue.length, previousValue.length + sValue.length);
		}
	};

	function hideResults() {
		clearTimeout(timeout);
		timeout = setTimeout(hideResultsNow, 200);
	};

	function hideResultsNow() {
		select.hide();
		clearTimeout(timeout);
		stopLoading();
		if (options.mustMatch) {
			// call search and run callback
			$input.search(
				function (result){
					// if no value found, clear the input box
					if( !result ) $input.val("");
				}
			);
		}
	};

	function receiveData(q, data) {
		if ( data && data.length && hasFocus ) {
			stopLoading();
			select.display(data, q);
			autoFill(q, data[0].value);
			select.show();
		} else {
			hideResultsNow();
		}
	};

	function request(term, success, failure) {
		if (!options.matchCase)
			term = term.toLowerCase();
		var data = cache.load(term);
		// recieve the cached data
		if (data && data.length) {
			success(term, data);

	    // AJM: implement code that gets info from database -> use function
		} else if( (typeof options.url == "function") ){
	        var data = options.url(term);
	        if( data ){
	            //var parsed = options.parse && options.parse(data) || parse(data);
			    cache.add(term, data);
				success(term, data);
            } else 
                failure(term);
		// if an AJAX url has been supplied, try loading the data now
		} else if( (typeof options.url == "string") && (options.url.length > 0) ){
			
			var extraParams = {};
			jQuery.each(options.extraParams, function(key, param) {
				extraParams[key] = typeof param == "function" ? param() : param;
			});
			
			jQuery.ajax({
				// try to leverage ajaxQueue plugin to abort previous requests
				mode: "abort",
				// limit abortion to this input
				port: "autocomplete" + input.name,
				url: options.url,
				data: jQuery.extend({
					q: lastWord(term),
					limit: options.max
				}, extraParams),
				success: function(data) {
					var parsed = options.parse && options.parse(data) || parse(data);
					cache.add(term, parsed);
					success(term, parsed);
				}
			});
		} else {
			failure(term);
		}
	};
	
	function parse(data) {
		var parsed = [];
		var rows = data.split("\n");
		for (var i=0; i < rows.length; i++) {
			var row = jQuery.trim(rows[i]);
			if (row) {
				row = row.split("|");
				parsed[parsed.length] = {
					data: row,
					value: row[0],
					result: options.formatResult && options.formatResult(row, row[0]) || row[0]
				};
			}
		}
		return parsed;
	};

	function stopLoading() {
		$input.removeClass(options.loadingClass);
	};

};

jQuery.Autocompleter.defaults = {
	inputClass: "ac_input",
	resultsClass: "ac_results",
	loadingClass: "ac_loading",
	minChars: 1,
	delay: 400,
	matchCase: false,
	matchSubset: true,
	matchContains: false,
	cacheLength: 10,
	mustMatch: false,
	extraParams: {},
	selectFirst: true,
	max: 10,
	moreItems: "&#x25be;&#x25be;&#x25be; more &#x25be;&#x25be;&#x25be;",
	//size: 10,
	autoFill: false,
	width: 0,
	multiple: false,
	multipleSeparator: ", ",
	highlight: function(value, term) {
		return value.replace(new RegExp("(?!<[^<>]*)(" + term + ")(?![^<>]*>)", "gi"), "<strong>$1</strong>");
	}
};

jQuery.Autocompleter.Cache = function(options) {

	var data = {};
	var length = 0;
	
	function matchSubset(s, sub) {
		if (!options.matchCase) 
			s = s.toLowerCase();
		var i = s.indexOf(sub);
		if (i == -1) return false;
		return i == 0 || options.matchContains;
	};
	
	function add(q, value) {
		if (length > options.cacheLength){
			flush();
		}
		if (!data[q]){ 
			length++;
		}
		data[q] = value;
	}
	
	function populate(){
		if( !options.data ) return false;
		// track the matches
		var stMatchSets = {},
			nullData = 0;

		// no url was specified, we need to adjust the cache length to make sure it fits the local data store
		if( !options.url ) options.cacheLength = 1;
		
		// track all options for minChars = 0
		stMatchSets[""] = [];
		
		// loop through the array and create a lookup structure
		jQuery.each(options.data, function(i, rawValue) {
			// if row is a string, make an array otherwise just reference the array
			
			var value = options.formatItem
				? options.formatItem(rawValue, i+1, options.data.length)
				: rawValue;
			if ( value === false )
				return;
				
			var firstChar = value.charAt(0).toLowerCase();
			// if no lookup array for this character exists, look it up now
			if( !stMatchSets[firstChar] ) 
				stMatchSets[firstChar] = [];

			// if the match is a string
			var row = {
				value: value,
				data: rawValue,
				result: options.formatResult && options.formatResult(rawValue) || value
			};
			
			// push the current match into the set list
			stMatchSets[firstChar].push(row);

			// keep track of minChars zero items
			if ( nullData++ < options.max ) {
				stMatchSets[""].push(row);
			}
		});

		// add the data items to the cache
		jQuery.each(stMatchSets, function(i, value) {
			// increase the cache size
			options.cacheLength++;
			// add to the cache
			add(i, value);
		});
	}
	
	// populate any existing data
	populate();
	
	function flush(){
		data = {};
		length = 0;
	}
	
	return {
		flush: flush,
		add: add,
		populate: populate,
		load: function(q) {
			if (!options.cacheLength || !length)
				return null;
			/* 
			 * if dealing w/local data and matchContains than we must make sure
			 * to loop through all the data collections looking for matches
			 */
			if( !options.url && options.matchContains ){
				// track all matches
				var csub = [];
				// loop through all the data grids for matches
				for( var k in data ){
					// don't search through the stMatchSets[""] (minChars: 0) cache
					// this prevents duplicates
					if( k.length > 0 ){
						var c = data[k];
						jQuery.each(c, function(i, x) {
							// if we've got a match, add it to the array
							if (matchSubset(x.value, q)) {
								csub.push(x);
							}
						});
					}
				}				
				return csub;
			} else 
			// if the exact item exists, use it
			if (data[q]){
				return data[q];
			} else
			if (options.matchSubset) {
				for (var i = q.length - 1; i >= options.minChars; i--) {
					var c = data[q.substr(0, i)];
					if (c) {
						var csub = [];
						jQuery.each(c, function(i, x) {
							if (matchSubset(x.value, q)) {
								csub[csub.length] = x;
							}
						});
						return csub;
					}
				}
			}
			return null;
		}
	};
};

jQuery.Autocompleter.Select = function (options, input, select, config) {
	var CLASSES = {
		ACTIVE: "ac_over"
	};
	
	// Create results
	var element = jQuery("<div>")
		.hide()
		.addClass(options.resultsClass)
		.css("position", "absolute")
		.appendTo("body");
	
	var list = jQuery("<ul>").appendTo(element).mouseover( function(event) {
		active = jQuery("li", list).removeClass().index(target(event));
		jQuery(target(event)).addClass(CLASSES.ACTIVE);
	}).mouseout( function(event) {
		jQuery(target(event)).removeClass();
	}).click(function(event) {
		jQuery(target(event)).addClass(CLASSES.ACTIVE);
		select();
		input.focus();
		return false;
	}).mousedown(function() {
		config.mouseDownOnSelect = true;
	}).mouseup(function() {
		config.mouseDownOnSelect = false;
	});
	var listItems,
		active = -1,
		data,
		term = "";
		
	if( options.moreItems.length > 0 ) 
		var moreItems = jQuery("<div>")
			.addClass("ac_moreItems")
			.css("display", "none")
			.html(options.moreItems)
			.appendTo(element);
		
	if( options.width > 0 )
		element.css("width", options.width);
		
	function target(event) {
		var element = event.target;
		while(element && element.tagName != "LI")
			element = element.parentNode;
		// more fun with IE, sometimes event.target is empty, just ignore it then
		if(!element)
			return [];
		return element;
	}

	function moveSelect(step) {
		active += step;
		wrapSelection();
		listItems.removeClass().slice(active, active + 1).addClass(CLASSES.ACTIVE);
	};
	
	function wrapSelection() {
		if (active < 0) {
			active = listItems.size() - 1;
		} else if (active >= listItems.size()) {
			active = 0;
		}
	}
	
	function limitNumberOfItems(available) {
		return (options.max > 0) && (options.max < available)
			? options.max
			: available;
	}
	
	function fillList() {
		list.empty();
		var num = limitNumberOfItems(data.length);
		for (var i=0; i < num; i++) {
			if (!data[i])
				continue;
			
			var formatted = options.formatItem ? options.formatItem(data[i].data, i+1, num, data[i].value) : data[i].value;
			if ( formatted === false )
				continue;
			
			jQuery("<li>").html( options.highlight(formatted, term) ).appendTo(list)[0].index = i;
		}
		listItems = list.find("li");
		if ( options.selectFirst ) {
			listItems.slice(0, 1).addClass(CLASSES.ACTIVE);
			active = 0;
		}
		if( options.moreItems.length > 0 ) moreItems.css("display", (data.length > num)? "block" : "none");
		list.bgiframe();
	}
	
	return {
		display: function(d, q) {
			data = d;
			term = q;
			fillList();
		},
		next: function() {
			moveSelect(1);
		},
		prev: function() {
			moveSelect(-1);
		},
		hide: function() {
			element.hide();
			active = -1;
		},
		visible : function() {
			return element.is(":visible");
		},
		current: function() {
			return this.visible() && (listItems.filter("." + CLASSES.ACTIVE)[0] || options.selectFirst && listItems[0]);
		},
		show: function() {
			var offset = jQuery(input).offset();
			element.css({
				width: typeof options.width == "string" || options.width > 0 ? options.width : jQuery(input).width(),
				top: offset.top + input.offsetHeight,
				left: offset.left
				//height: jQuery(listItems[0]).height() * options.size,
			}).show();
		},
		selected: function() {
			return data && data[ listItems.filter("." + CLASSES.ACTIVE)[0].index ];
		}
	};
};

jQuery.Autocompleter.Selection = function(field, start, end) {
	if( field.createTextRange ){
		var selRange = field.createTextRange();
		selRange.collapse(true);
		selRange.moveStart("character", start);
		selRange.moveEnd("character", end);
		selRange.select();
	} else if( field.setSelectionRange ){
		field.setSelectionRange(start, end);
	} else {
		if( field.selectionStart ){
			field.selectionStart = start;
			field.selectionEnd = end;
		}
	}
	field.focus();
};