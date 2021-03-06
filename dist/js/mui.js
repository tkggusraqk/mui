/*!
 * =====================================================
 * Mui v0.5.1 (https://github.com/dcloudio/mui)
 * =====================================================
 */
/**
 * MUI核心JS
 * 支持ID,CSS,TAG选择器
 * @type Function|_L4.$
 */
var mui = (function(window, document, undefined) {
	var readyRE = /complete|loaded|interactive/;
	var idSelectorRE = /^#([\w-]*)$/;
	var classSelectorRE = /^\.([\w-]+)$/;
	var tagSelectorRE = /^[\w-]+$/;
	var translateRE = /translate(?:3d)?\((.+?)\)/;
	var translateMatrixRE = /matrix(3d)?\((.+?)\)/;

	var $ = function(selector, context) {
		context = context || document;
		if (!selector)
			return wrap();
		if ( typeof selector === 'object')
			return wrap([selector], null);
		try {
			if (idSelectorRE.test(selector)) {
				var found = context.getElementById(RegExp.$1);
				return wrap( found ? [found] : []);
			}
			return wrap($.qsa(selector, context), selector);
		} catch (e) {

		}
		return wrap();
	};

	var wrap = function(dom, selector) {
		dom = dom || [];
		dom.__proto__ = $.fn;
		dom.selector = selector || '';
		return dom;
	};

	$.uuid = 0;

	$.data = {};
	/**
	 * extend(simple)
	 * @param {type} target
	 * @param {type} source
	 * @param {type} deep
	 * @returns {unresolved}
	 */
	$.extend = function(target, source, deep) {
		if (!target) {
			target = {};
		}
		if (!source) {
			source = {};
		}
		for (var key in source)
		if (source[key] !== undefined) {
			if (deep && typeof target[key] === 'object') {
				$.extend(target[key], source[key], deep);
			} else {
				target[key] = source[key];
			}
		}

		return target;
	};
	/**
	 * mui slice(array)
	 */
	$.slice = [].slice;
	/**
	 * mui querySelectorAll
	 * @param {type} selector
	 * @param {type} context
	 * @returns {Array}
	 */
	$.qsa = function(selector, context) {
		context = context || document;
		return $.slice.call(classSelectorRE.test(selector) ? context.getElementsByClassName(RegExp.$1) : tagSelectorRE.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector));
	};
	/**
	 * ready(DOMContentLoaded)
	 * @param {type} callback
	 * @returns {_L6.$}
	 */
	$.ready = function(callback) {
		if (readyRE.test(document.readyState)) {
			callback($);
		} else {
			document.addEventListener('DOMContentLoaded', function() {
				callback($);
			}, false);
		}
		return this;
	};
	/**
	 * each
	 * @param {type} array
	 * @param {type} callback
	 * @returns {_L8.$}
	 */
	$.each = function(array, callback) {
		[].every.call(array, function(el, idx) {
			return callback.call(el, idx, el) !== false;
		});
		return this;
	};
	/**
	 * trigger event
	 * @param {type} element
	 * @param {type} eventType
	 * @param {type} eventData
	 * @returns {_L8.$}
	 */
	$.trigger = function(element, eventType, eventData) {
		element.dispatchEvent(new CustomEvent(eventType, {
			detail : eventData,
			bubbles : true,
			cancelable : true
		}));
		return this;
	};
	/**
	 * getStyles
	 */
	$.getStyles = function(element, property) {
		var styles = element.ownerDocument.defaultView.getComputedStyle(element, null);
		if (property) {
			return styles.getPropertyValue(property) || styles[property];
		}
		return styles;
	};
	/**
	 * parseTranslate
	 */
	$.parseTranslate = function(translateString, position) {
		var result = translateString.match(translateRE || '');
		if (!result || !result[1]) {
			result = ['', '0,0,0'];
		}
		result = result[1].split(",");
		result = {
			x : parseFloat(result[0]),
			y : parseFloat(result[1]),
			z : parseFloat(result[2])
		};
		if (position && result.hasOwnProperty(position)) {
			return result[position];
		}
		return result;
	};
	/**
	 * parseTranslateMatrix
	 */
	$.parseTranslateMatrix = function(translateString, position) {
		var matrix = translateString.match(translateMatrixRE);
		var is3D = matrix && matrix[1];
		if (matrix) {
			matrix = matrix[2].split(",");
			if (is3D === "3d")
				matrix = matrix.slice(12, 15);
			else {
				matrix.push(0);
				matrix = matrix.slice(4, 7)
			}
		} else {
			matrix = [0, 0, 0];
		}
		var result = {
			x : parseFloat(matrix[0]),
			y : parseFloat(matrix[1]),
			z : parseFloat(matrix[2])
		}
		if (position && result.hasOwnProperty(position)) {
			return result[position];
		}
		return result;
	};
	/**
	 * $.fn
	 */
	$.fn = {
		each : function(callback) {
			[].every.call(this, function(el, idx) {
				return callback.call(el, idx, el) !== false;
			});
			return this;
		}
	};
	return $;
})(window, document);
window.mui = mui;
'$' in window || (window.$ = mui);

/**
 * mui target(action>popover>modal>tab>toggle)
 */
(function($, window, document) {
	/**
	 * targets
	 */
	$.targets = {};
	/**
	 * target handles
	 */
	$.targetHandles = [];
	/**
	 * register target
	 * @param {type} target
	 * @returns {$.targets}
	 */
	$.registerTarget = function(target) {

		target.index = target.index || 1000;

		$.targetHandles.push(target);

		$.targetHandles.sort(function(a, b) {
			return a.index - b.index;
		});

		return $.targetHandles;
	};
	window.addEventListener('touchstart', function(event) {
		var target = event.target;
		var founds = {};
		for (; target && target !== document; target = target.parentNode) {
			var isFound = false;
			$.each($.targetHandles, function(index, targetHandle) {
				var name = targetHandle.name;
				if (!isFound && !founds[name] && targetHandle.hasOwnProperty('handle')) {
					$.targets[name] = targetHandle.handle(event, target);
					if ($.targets[name]) {
						founds[name] = true;
						if (targetHandle.isContinue !== true) {
							isFound = true;
						}
					}
				} else {
					if (!founds[name]) {
						if (targetHandle.isReset !== false)
							$.targets[name] = false;
					}
				}
			});
			if (isFound) {
				break;
			}
		}

	});
})(mui, window, document);

/**
 * fixed trim
 * @param {type} undefined
 * @returns {undefined}
 */
(function(undefined) {
	if (String.prototype.trim === undefined) {// fix for iOS 3.2
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}

})();
/**
 * fixed CustomEvent
 */
(function() {
	if ( typeof window.CustomEvent === 'undefined') {
		function CustomEvent(event, params) {
			params = params || {
				bubbles : false,
				cancelable : false,
				detail : undefined
			};
			var evt = document.createEvent('Events');
			var bubbles = true;
			if (params) {
				for (var name in params) {
					(name === 'bubbles') ? ( bubbles = !!params[name]) : (evt[name] = params[name]);
				}
			}
			evt.initEvent(event, bubbles, true);
			return evt;
		};
		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	}
})();

/**
 * mui fixed classList
 * @param {type} document
 * @returns {undefined}
 */
(function(document) {
    if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {

        Object.defineProperty(HTMLElement.prototype, 'classList', {
            get: function() {
                var self = this;
                function update(fn) {
                    return function(value) {
                        var classes = self.className.split(/\s+/),
                                index = classes.indexOf(value);

                        fn(classes, index, value);
                        self.className = classes.join(" ");
                    };
                }

                var ret = {
                    add: update(function(classes, index, value) {
                        ~index || classes.push(value);
                    }),
                    remove: update(function(classes, index) {
                        ~index && classes.splice(index, 1);
                    }),
                    toggle: update(function(classes, index, value) {
                        ~index ? classes.splice(index, 1) : classes.push(value);
                    }),
                    contains: function(value) {
                        return !!~self.className.split(/\s+/).indexOf(value);
                    },
                    item: function(i) {
                        return self.className.split(/\s+/)[i] || null;
                    }
                };

                Object.defineProperty(ret, 'length', {
                    get: function() {
                        return self.className.split(/\s+/).length;
                    }
                });

                return ret;
            }
        });
    }
})(document);

/**
 * mui fixed requestAnimationFrame
 * @param {type} window
 * @returns {undefined}
 */
(function(window) {
    var lastTime = 0;
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
        window.cancelAnimationFrame = window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame;
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}(window));
/**
 * fastclick(only for radio,checkbox)
 */
(function($, window, name) {
	if (window.FastClick) {
		return;
	}

	var handle = function(event, target) {
		if (target.type && (target.type === 'radio' || target.type === 'checkbox')) {
			return target;
		}
		return false;
	};

	$.registerTarget({
		name : name,
		index : 40,
		handle : handle,
		target : false
	});

	window.addEventListener('tap', function(event) {
		var targetElement = $.targets.click;
		if (targetElement) {
			var clickEvent, touch;

			// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
			if (document.activeElement && document.activeElement !== targetElement) {
				document.activeElement.blur();
			}

			touch = event.detail.gesture.changedTouches[0];

			// Synthesise a click event, with an extra attribute so it can be tracked
			clickEvent = document.createEvent('MouseEvents');
			clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
			clickEvent.forwardedTouchEvent = true;
			targetElement.dispatchEvent(clickEvent);
		}
	});
	//捕获
	window.addEventListener('click', function(event) {
		if ($.targets.click) {
			if (!event.forwardedTouchEvent) {//stop click
				if (event.stopImmediatePropagation) {
					event.stopImmediatePropagation();
				} else {
					// Part of the hack for browsers that don't support Event#stopImmediatePropagation
					event.propagationStopped = true;
				}
				event.stopPropagation();
				event.preventDefault();
				return false;
			}
		}
	}, true);

})(mui, window, 'click');

/**
 * mui namespace(optimization)
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, undefined) {
	$.namespace = 'mui';
	$.classNamePrefix = $.namespace + '-';
	$.classSelectorPrefix = '.' + $.classNamePrefix;
	/**
	 * 返回正确的className
	 * @param {type} className
	 * @returns {unresolved}
	 */
	$.className = function(className) {
		return $.classNamePrefix + className;
	};
	/**
	 * 返回正确的classSelector
	 * @param {type} classSelector
	 * @returns {unresolved}
	 */
	$.classSelector = function(classSelector) {
		return classSelector.replace(/\./g, $.classSelectorPrefix);
	};
	/**
	 * 返回正确的eventName
	 */
	$.eventName = function(event, module) {
		return event + ($.namespace ? ('.' + $.namespace) : '') + ( module ? ('.' + module) : '');
	}
})(mui, window, document);

/**
 * mui gestures
 * @param {type} $
 * @param {type} window
 * @returns {undefined}
 */
(function($, window) {
	$.EVENT_START = 'touchstart';
	$.EVENT_MOVE = 'touchmove';
	$.EVENT_END = 'touchend';
	$.EVENT_CANCEL = 'touchcancel';
	$.EVENT_CLICK = 'click';
	/**
	 * Gesture preventDefault
	 * @param {type} e
	 * @returns {undefined}
	 */
	$.preventDefault = function(e) {
		e.preventDefault();
	};
	/**
	 * Gesture stopPropagation
	 * @param {type} e
	 * @returns {undefined}
	 */
	$.stopPropagation = function(e) {
		e.stopPropagation();
	};
	/**
	 * Gesture functions
	 */
	$.gestures = [];

	/**
	 * register gesture
	 * @param {type} gesture
	 * @returns {$.gestures}
	 */
	$.registerGesture = function(gesture) {

		gesture.index = gesture.index || 1000;

		$.gestures.push(gesture);

		$.gestures.sort(function(a, b) {
			return a.index - b.index;
		});

		return $.gestures;
	};
	/**
	 * distance
	 * @param {type} p1
	 * @param {type} p2
	 * @returns {Number}
	 */
	var getDistance = function(p1, p2) {
		var x = p2.x - p1.x;
		var y = p2.y - p1.y;
		return Math.sqrt((x * x) + (y * y));
	};
	/**
	 * angle
	 * @param {type} p1
	 * @param {type} p2
	 * @returns {Number}
	 */
	var getAngle = function(p1, p2) {
		return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
	};
	/**
	 * direction
	 * @param {type} angle
	 * @returns {unresolved}
	 */
	var getDirectionByAngle = function(angle) {
		if (angle < -45 && angle > -135) {
			return 'up';
		} else if (angle >= 45 && angle < 135) {
			return 'down';
		} else if (angle >= 135 || angle <= -135) {
			return 'left';
		} else if (angle >= -45 && angle <= 45) {
			return 'right';
		}
		return null;
	};
	/**
	 * detect gestures
	 * @param {type} event
	 * @param {type} touch
	 * @returns {undefined}
	 */
	var detect = function(event, touch) {
		if ($.gestures.stoped) {
			return;
		}
		$.each($.gestures, function(index, gesture) {
			if (!$.gestures.stoped) {
				if (gesture.hasOwnProperty('handle')) {
					gesture.handle(event, touch);
				}
			}
		});
	};
	var touch = {};
	var detectTouchStart = function(event) {
		$.gestures.stoped = false;
		touch = {
			startTime : Date.now(),
			touchTime : 0,
			prevTabTime : (touch.prevTabTime ? touch.prevTabTime : 0),
			start : {
				x : event.touches[0].pageX,
				y : event.touches[0].pageY
			},
			move : {
				x : 0,
				y : 0
			},
			deltaX : 0,
			deltaY : 0,
			lastDeltaX : 0,
			lastDeltaY : 0,
			angle : '',
			direction : '',
			distance : 0,
			drag : false,
			swipe : false,
			gesture : event
		};

		detect(event, touch);
	};
	var detectTouchMove = function(event) {
		if ($.gestures.stoped) {
			return;
		}
		touch.touchTime = Date.now() - touch.startTime;
		touch.move = {
			x : event.touches[0].pageX,
			y : event.touches[0].pageY
		};
		touch.distance = getDistance(touch.start, touch.move);
		touch.angle = getAngle(touch.start, touch.move);
		touch.direction = getDirectionByAngle(touch.angle);
		touch.lastDeltaX = touch.deltaX;
		touch.lastDeltaY = touch.deltaY;
		touch.deltaX = touch.move.x - touch.start.x;
		touch.deltaY = touch.move.y - touch.start.y;
		touch.gesture = event;

		detect(event, touch);
	};
	var detectTouchEnd = function(event) {
		if ($.gestures.stoped) {
			return;
		}
		touch.touchTime = Date.now() - touch.startTime;
		touch.gesture = event;

		detect(event, touch);
	};

	window.addEventListener($.EVENT_START, detectTouchStart);
	window.addEventListener($.EVENT_MOVE, detectTouchMove);
	window.addEventListener($.EVENT_END, detectTouchEnd);
	window.addEventListener($.EVENT_CANCEL, detectTouchEnd);

	/**
	 * mui delegate events
	 * @param {type} event
	 * @param {type} selector
	 * @param {type} callback
	 * @returns {undefined}
	 */
	$.fn.on = function(event, selector, callback) {
		this.each(function() {
			var element = this;
			element.addEventListener(event, function(e) {
				var delegates = $.qsa(selector, element);
				var target = e.target;
				if (delegates && delegates.length > 0) {
					for (; target && target !== document; target = target.parentNode) {
						if (target === element) {
							break;
						}
						if (target && ~delegates.indexOf(target)) {
							if (!e.detail) {
								e.detail = {
									currentTarget : target
								};
							} else {
								e.detail.currentTarget = target;
							}
							callback.call(target, e);
						}
					}
				}
			});
			////避免多次on的时候重复绑定
			element.removeEventListener($.EVENT_CLICK, preventDefault);
			//click event preventDefault
			element.addEventListener($.EVENT_CLICK, preventDefault);
		});
	};
	var preventDefault = function(e) {
		if (e.target && e.target.tagName !== 'INPUT') {
			e.preventDefault();
		}
	}
})(mui, window);

/**
 * mui gesture swipe[left|right|up|down]
 * @param {type} $
 * @param {type} name
 * @returns {undefined}
 */
(function($, name) {
    var handle = function(event, touch) {
        if (event.type === $.EVENT_END || event.type === $.EVENT_CANCEL) {
            var options = this.options;
            if (touch.direction && options.swipeMaxTime > touch.touchTime && touch.distance > options.swipeMinDistince) {
                if (event.target.type !== 'range') {//ignore input range
                    touch.swipe = true;
                    $.trigger(event.target, name + touch.direction, touch);
                }
            }
        }
    };
    /**
     * mui gesture swipe
     */
    $.registerGesture({
        name: name,
        index: 10,
        handle: handle,
        options: {
            swipeMaxTime: 300,
            swipeMinDistince: 18
        }
    });
})(mui, 'swipe');
/**
 * mui gesture drag[start|left|right|up|down|end]
 * @param {type} $
 * @param {type} name
 * @returns {undefined}
 */
(function($, name) {

    var handle = function(event, touch) {
        switch (event.type) {
            case $.EVENT_MOVE:
                if (touch.direction) {//drag
                    if (!touch.drag) {
                        touch.drag = true;
                        $.trigger(event.target, name + 'start', touch);
                    }
                    $.trigger(event.target, name, touch);
                    $.trigger(event.target, name + touch.direction, touch);
                }
                break;
            case $.EVENT_END:
            case $.EVENT_CANCEL:
                if (touch.drag) {
                    $.trigger(event.target, name + 'end', touch);
                }
                break;
        }
    };
    /**
     * mui gesture drag
     */
    $.registerGesture({
        name: name,
        index: 20,
        handle: handle,
        options: {
        }
    });
})(mui, 'drag');
/**
 * mui gesture tap and doubleTap
 * @param {type} $
 * @param {type} name
 * @returns {undefined}
 */
(function($, name) {
    var handle = function(event, touch) {
        if (event.type === $.EVENT_END || event.type === $.EVENT_CANCEL) {
            var options = this.options;
            if (touch.distance < options.tabMaxDistance && touch.touchTime < options.tapMaxTime) {
                if (touch.prevTabTime && (touch.startTime - touch.prevTabTime) < options.tabMaxInterval) {
                    $.trigger(event.target, 'doubletap', touch);
                    touch.prevTabTime = Date.now();
                    return;
                }
                $.trigger(event.target, name, touch);
                touch.prevTabTime = Date.now();
            }
        }
    };
    /**
     * mui gesture tab
     */
    $.registerGesture({
        name: name,
        index: 30,
        handle: handle,
        options: {
            tabMaxInterval: 300,
            tabMaxDistance: 5,
            tapMaxTime: 250
        }
    });
})(mui, 'tap');
/**
 * mui gesture longtap
 * @param {type} $
 * @param {type} name
 * @returns {undefined}
 */
(function($, name) {
	var timer;
	var handle = function(event, touch) {
		var options = this.options;
		switch (event.type) {
			case $.EVENT_START:
				clearTimeout(timer);
				timer = setTimeout(function() {
					if (!touch.drag) {
						$.trigger(event.target, name, touch);
					}
				}, options.holdTimeout);
				break;
			case $.EVENT_MOVE:
				if (touch.distance > options.holdThreshold) {
					clearTimeout(timer);
				}
				break;
			case $.EVENT_END:
			case $.EVENT_CANCEL:
				clearTimeout(timer);
				break;
		}
	};
	/**
	 * mui gesture drag
	 */
	$.registerGesture({
		name : name,
		index : 10,
		handle : handle,
		options : {
			holdTimeout : 500,
			holdThreshold : 2
		}
	});
})(mui, 'longtap'); 
/**
 * $.os
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    function detect(ua) {
        this.os = {};
        var funcs = [function() {//android
                var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
                if (android) {
                    this.os.android = true;
                    this.os.version = android[2];
                }
                return this.os.android === true;
            }, function() {//ios
                var iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);
                if (iphone) {//iphone
                    this.os.ios = this.os.iphone = true;
                    this.os.version = iphone[2].replace(/_/g, '.');
                } else {
                    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
                    if (ipad) {//ipad
                        this.os.ios = this.os.ipad = true;
                        this.os.version = ipad[2].replace(/_/g, '.');
                    }
                }
                return this.os.ios === true;
            }];
        [].every.call(funcs, function(func) {
            return !func.call($);
        });
    }
    detect.call($, navigator.userAgent);
})(mui);

/**
 * $.os.plus
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    function detect(ua) {
        this.os = this.os || {};
        var plus = ua.match(/Html5Plus/i);//TODO 5\+Browser?
        if (plus) {
            this.os.plus = true;
        }
    }
    detect.call($, navigator.userAgent);
})(mui);

/**
 * mui.init
 * @param {type} $
 * @param {type} document
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, document, undefined) {
    var funcs = [];
    $.global = $.options = {};
    /**
     * 
     * @param {type} options
     * @returns {undefined}
     */
    $.initGlobal = function(options) {
        $.options = $.extend($.global, options);
        return this;
    };
    /**
     * 单页配置 初始化
     * @param {object} options
     */
    $.init = function(options) {
        $.options = $.extend($.global, options || {});
        //需考虑重复init的问题
        $.ready(function() {
            for (var i = 0, len = funcs.length; i < len; i++) {
                funcs[i].call($);
            }
        });
        return this;
    };
    /**
     * 增加初始化执行流程
     * @param {function} func
     */
    $.init.add = function(func) {
        funcs.push(func);
    };
})(mui, document);
/**
 * mui.init 5+
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
	var defaultOptions = {
		optimize: true,
		swipeBack: false,
		preloadPages: [], //5+ lazyLoad webview
		preloadLimit: 10 //预加载窗口的数量限制(一旦超出，先进先出)

	};

	$.extend($.global, defaultOptions);
	$.extend($.options, defaultOptions);
	/**
	 *  等待动画配置
	 */
	$.waitingOptions = function(options) {
		return $.extend({}, options);
	};
	/**
	 * 窗口显示配置
	 */
	$.showOptions = function(options) {
		var duration = 100;
		if($.os.ios){
			duration = 200;
		}
		return $.extend({
			aniShow: 'slide-in-right',
			duration: duration
		}, options);
	};
	/**
	 * 窗口默认配置
	 */
	$.windowOptions = function(options) {
		return $.extend({
			scalable: false,
			bounce: "" //vertical
		}, options);
	};
	/**
	 * plusReady
	 * @param {type} callback
	 * @returns {_L6.$}
	 */
	$.plusReady = function(callback) {
		if (window.plus) {
			callback();
		} else {
			document.addEventListener("plusready", function() {
				callback();
			}, false);
		}
		return this;
	};
	/**
	 * 5+ event(5+没提供之前我自己实现)
	 */
	$.fire = function(webview, eventType, data) {
		if (webview) {
			webview.evalJS("mui&&mui.receive('" + eventType + "','" + JSON.stringify(data || {}) + "')");
		}
	};
	/**
	 * 5+ event(5+没提供之前我自己实现)
	 */
	$.receive = function(eventType, data) {
		if (eventType) {
			data = JSON.parse(data);
			$.trigger(document, eventType, data);
		}
	};
	/**
	 * 打开新窗口
	 * @param {string} url 要打开的页面地址
	 * @param {string} id 指定页面ID
	 * @param {object} options 可选:参数,等待,窗口,显示配置{params:{},waiting:{},styles:{},show:{}}
	 */
	$.openWindow = function(url, id, options) {
		if (!window.plus) {
			return;
		}
		if (typeof url === 'object') {
			options = url;
			url = options.url;
			id = options.id || url;
		} else {
			if (typeof id === 'object') {
				options = id;
				id = url;
			} else {
				id = id || url;
			}
		}
		options = options || {};
		var params = options.params || {};
		var webview;
		if ($.webviews[id]) { //已缓存
			var webviewCache = $.webviews[id];
			if (webviewCache.preload) { //预加载
				webview = webviewCache.webview;
				//每次show都需要传递动画参数；
				webview.show(webviewCache.show.aniShow, webviewCache.show.duration);
				//TODO 预加载模式，暂不隐藏父窗口，bug太多
				//TODO 最好不要让MUI处理这种东西，统一处理窗口隐藏
				//				setTimeout(function() {
				//					console.log('webview.isVisible()1::::' + webview.isVisible());
				//					if (webview.isVisible() === 'true') {//只有当前窗口显示的状态，才隐藏父窗口(解决在show动画过程中，执行后退导致的父窗口被关闭没有显示问题)
				//						console.log('webview.isVisible()2::::' + webview.isVisible());
				//						var wobj = plus.webview.currentWebview();
				//						var parent = wobj.parent();
				//						if (parent) {
				//							parent.hide();
				//						} else {
				//							wobj.hide();
				//						}
				//					}//哎。多增加点时间。否则会发现提前hide主窗口后，动画还没结束，导致看到了主屏幕
				//				}, webviewCache.show.duration + 1000);

				webviewCache.afterShowMethodName && webview.evalJS(webviewCache.afterShowMethodName + '(\'' + JSON.stringify(params) + '\')');
				return this;
			} else { //非预加载
				//将当前传入的options覆盖之前缓存的
				options = $.extend(webviewCache, $.extend(options, {
					id: id,
					url: url,
					showAfterLoad: options.showAfterLoad === false ? false : true
				}));
				webview = $.createWindow(options);
			}
		} else { //新窗口
			options = $.extend(options, {
				id: id,
				url: url,
				showAfterLoad: options.showAfterLoad === false ? false : true
			});
			webview = $.createWindow(options);
		}
		if (options.showAfterLoad) {
			var nWaitingOptions = $.waitingOptions(options.waiting);
			var nWaiting = plus.nativeUI.showWaiting(nWaitingOptions.title || '', nWaitingOptions);
			var nShow = $.showOptions(options.show);
			webview.addEventListener("loaded", function() {
				nWaiting.close();
				webview.show(nShow.aniShow, nShow.duration);
				webview.showed = true;
				options.afterShowMethodName && webview.evalJS(options.afterShowMethodName + '(\'' + JSON.stringify(params) + '\')');
				//TODO 最好不要让MUI处理这种东西，统一处理窗口隐藏
				//				setTimeout(function() {
				//					var wobj = plus.webview.currentWebview();
				//					var parent = wobj.parent();
				//					if (parent) {
				//						parent.hide();
				//					} else {
				//						wobj.hide();
				//					}
				//				}, nShow.duration);

			}, false);
		}
		return this;
	};
	/**
	 * 根据配置信息创建一个webview
	 */
	$.createWindow = function(options, isCreate) {
		if (!window.plus) {
			return;
		}
		var id = options.id || options.url
		var webview;
		if (options.preload) {
			if ($.webviews[id]) { //已经cache
				webview = $.webviews[id].webview;
			} else { //新增预加载窗口
				//preload
				webview = plus.webview.create(options.url, id, $.windowOptions(options.styles), {
					preload: true
				});
				if (options.subpages) {
					$.each(options.subpages, function(index, subpage) {
						//TODO 子窗口也可能已经创建，比如公用模板的情况；
						var subWebview = plus.webview.create(subpage.url, subpage.id || subpage.url, $.windowOptions(subpage.styles), {
							preload: true
						});
						webview.append(subWebview);
					});
				}
			}

			//TODO 理论上，子webview也应该计算到预加载队列中，但这样就麻烦了，要退必须退整体，否则可能出现问题；
			$.webviews[id] = {
				webview: webview, //目前仅preload的缓存webview
				preload: true,
				show: $.showOptions(options.show),
				afterShowMethodName: options.afterShowMethodName //就不应该用evalJS。应该是通过事件消息通讯
			};
			//索引该预加载窗口
			var preloads = $.data.preloads;
			var index = preloads.indexOf(id);
			if (~index) { //删除已存在的(变相调整插入位置)
				preloads.splice(index, 1);
			}
			preloads.push(id);
			if (preloads.length > $.options.preloadLimit) {
				//先进先出
				var first = $.data.preloads.shift();
				var webviewCache = $.webviews[first];
				if (webviewCache && webviewCache.webview) {
					//IOS下 close的时候会导致卡顿。
					webviewCache.webview.close() //关闭该预加载webview	
				}
				//删除缓存
				delete $.webviews[first];
			}
		} else {
			//非预加载的webview存储窗口配置
			$.webviews[id] = options;
			if (isCreate !== false) { //直接创建非预加载窗口
				webview = plus.webview.create(options.url, id, $.windowOptions(options.styles));
				if (options.subpages) {
					$.each(options.subpages, function(index, subpage) {
						var subWebview = plus.webview.create(subpage.url, subpage.id || subpage.url, $.windowOptions(subpage.styles));
						webview.append(subWebview);
					});
				}
			}
		}
		return webview;
	};
	/**
	 * 批量创建webview
	 */
	$.createWindows = function(options) {
		$.each(options, function(index, option) {
			//初始化预加载窗口(创建)和非预加载窗口(仅配置，不创建)
			$.createWindow(option, false);
		});
	};
	/**
	 *创建当前页面的子webview
	 */
	$.appendWebview = function(options) {
		if (!window.plus) {
			return;
		}
		var id = options.id || options.url
		var webview;
		if (!$.webviews[id]) { //保证执行一遍
			//TODO 这里也有隐患，比如某个webview不是作为subpage创建的，而是作为target webview的话；
			webview = plus.webview.create(options.url, id, options.styles);
			//TODO 理论上，子webview也应该计算到预加载队列中，但这样就麻烦了，要退必须退整体，否则可能出现问题；
			webview.addEventListener('loaded', function() {
				plus.webview.currentWebview().append(webview);
			});
			$.webviews[id] = options;
		}
		return webview;
	};

	//全局webviews
	$.webviews = {};
	//预加载窗口索引
	$.data.preloads = [];

	$.init.add(function() {
		var options = $.options;
		var subpages = options.subpages || [];
		$.plusReady(function() {
			//TODO  这里需要判断一下，最好等子窗口加载完毕后，再调用主窗口的show方法；
			//或者：在openwindow方法中，监听实现；
			$.each(subpages, function(index, subpage) {
				$.appendWebview(subpage);
			});
		});
		//处理预加载部分
		var webviews = options.preloadPages || [];
		setTimeout(function() {
			$.plusReady(function() {
				$.createWindows(webviews);
			});
		}, 500);
	});
})(mui);
/**
 * mui.init titleBar
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    $.init.add(function() {
        var options = $.options;
        if (options.titleBar) {
            $.titleBar(options.titleBar);
        }
        //设置ios顶部状态栏颜色；
        if($.os.ios){
        	$.plusReady(function(){
        		var statusBarBackground = $.options.statusBarBackground?$.options.statusBarBackground:'#f7f7f7';
        		plus.navigator.setStatusBarBackground(statusBarBackground);
        	});
        }
    });
})(mui);
/**
 * mui.init pulldownRefresh
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    $.init.add(function() {
        var options = $.options;
        var pullRefreshOptions = options.pullRefresh || {};
        var container = pullRefreshOptions.container;
        if (container) {
            var $container = $(container);
            if ($container.length === 1) {
                if ($.options.optimize && $.os.plus && $.os.android) {//android and optimize
                    $container.plus_pulldownRefresh(pullRefreshOptions.down);
                } else {
                    $container.pullRefresh(pullRefreshOptions);
                }
            }
        }
    });
})(mui);
/**
 * mui.init plugins
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
	$.init.add(function() {
		//slider
		$('.mui-slider-group').each(function() {
			var controlContent = this.querySelector('.mui-control-content');
			if (controlContent) {//Segmented control
				$(this).slider({
					slideshowDelay : 0
				});
			} else {
				$(this).slider();
			}

		});
		//input
		$('.mui-input-row input').input();
	});
})(mui);

/**
 * mui titlebar
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, undefined) {

	$.titleBar = function(options) {
		//因为.mui-bar默认有1px阴影，6px的模糊(51px?太多了)，titleBar默认高度设置为48px；
		options = $.extend({
			template : 'top.html',
			height : "48px"
		}, options);
		//在5+app中，为了避免titleBar区域出现滚动条，只要是5+，就使用webview，不区分android和ios；
		if ($.options.optimize && $.os.plus) {//android and optimize
			$.plusReady(function() {
				//titleBar一般都是被append到主窗口的，因此ID不需要，默认为null问题不大；
				var header = plus.webview.create(options.template, null, {
					scalable : false,
					position : "dock",
					dock : "top",
					height : options.height
				});
				//TODO
				//1.优化。看看有没有更好的方案，这样的代码略显丑陋
				//2.需要转义options.title
				//3.如果不是.title，而是自定义的，该参数无意义；
				header.addEventListener('loaded', function() {
					header.evalJS('document.querySelector(".mui-title").innerHTML="' + options.title + '"');
				});
				//TODO 建议5+统一处理。不要来回相反的append
				var pulldownRefreshOptions = options.pulldownRefresh || {};
				var container = pulldownRefreshOptions.container;
				if (container) {
					header.append(plus.webview.currentWebview());
				} else {
					plus.webview.currentWebview().append(header);
				}

			});
		} else {
			//TODO 后续需要优化
			$.get(options.template, function(response) {
				var body = response.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0];
				var wrap = document.createElement('div');
				wrap.innerHTML = body;
				while (wrap.firstChild) {
					document.body.insertBefore(wrap.firstChild, document.body.firstChild);
				}
				if (options.title) {
					var title = document.body.querySelector('.mui-bar .mui-title');
					if (title) {
						title.innerHTML = options.title;
					}
				}
			});
		}
		return this;
	};
})(mui, window, document); 
/**
 * mui ajax
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    /**
     * mui.get
     * @param {type} url
     * @param {type} successCallback
     * @param {type} errorCallback
     * @returns {undefined}
     */
    $.get = function(url, successCallback, errorCallback) {
        ajax('GET', url, successCallback, errorCallback);
    };
    /**
     * mui.post
     * @param {type} url
     * @param {type} successCallback
     * @param {type} errorCallback
     * @returns {undefined}
     */
    $.post = function(url, successCallback, errorCallback) {
        ajax('POST', url, successCallback, errorCallback);
    };
    
    var ajax = function(method, url, successCallback, errorCallback) {
        var xhr = new XMLHttpRequest();
        var protocol = /^([\w-]+:)\/\//.test(url) ? RegExp.$1 : window.location.protocol;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === 'file:'))
                {
                    successCallback && successCallback(xhr.responseText);
                }
                else
                {
                    errorCallback && errorCallback();
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send();
    };

})(mui);
/**
 * mui layout(offset[,position,width,height...])
 * @param {type} $
 * @param {type} window
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, undefined) {
	$.offset = function(element) {
		var box = {
			top : 0,
			left : 0
		};
		if ( typeof element.getBoundingClientRect !== undefined) {
			box = element.getBoundingClientRect();
		}
		return {
			top : box.top + window.pageYOffset - element.clientTop,
			left : box.left + window.pageXOffset - element.clientLeft
		};
	}
})(mui, window); 
/**
 * mui animation
 */
(function($, window) {
	/**
	 * scrollTo
	 */
	$.scrollTo = function(scrollTop, duration, callback) {
		duration = duration || 1000;
		var scroll = function(duration) {
			if (duration <= 0) {
				callback && callback();
				return;
			}
			var distaince = scrollTop - window.scrollY;
			setTimeout(function() {
				window.scrollTo(0, window.scrollY + distaince / duration * 10);
				scroll(duration - 10);
			}, 16.7);
		};
		scroll(duration);
	};

})(mui, window);

/**
 * pullRefresh plugin
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, undefined) {

	var CLASS_PULL_TOP_POCKET = 'mui-pull-top-pocket';
	var CLASS_PULL_BOTTOM_POCKET = 'mui-pull-bottom-pocket';
	var CLASS_PULL = 'mui-pull';
	var CLASS_PULL_ARROW = 'mui-pull-arrow';
	var CLASS_PULL_LOADING = 'mui-pull-loading';
	var CLASS_PULL_CAPTION = 'mui-pull-caption';
	var CLASS_PULL_CAPTION_DOWN = CLASS_PULL_CAPTION + '-down';
	var CLASS_PULL_CAPTION_OVER = CLASS_PULL_CAPTION + '-over';
	var CLASS_PULL_CAPTION_REFRESH = CLASS_PULL_CAPTION + '-refresh';

	var CLASS_ICON = 'mui-icon';
	var CLASS_ICON_SPINNER = 'mui-icon-spinner';
	var CLASS_SPIN = 'mui-spin';

	var CLASS_IN = 'mui-in';
	var CLASS_REVERSE = 'mui-reverse';

	var CLASS_HIDDEN = 'mui-hidden';
	var defaultOptions = {
		down : {
			height : 50,
			contentdown : '下拉可以刷新',
			contentover : '释放立即刷新',
			contentrefresh : '正在刷新...'
		},
		up : {
			height : 50,
			contentdown : '上拉显示更多',
			contentover : '释放立即刷新',
			contentrefresh : '正在刷新...',
			duration : 300
		}
	};
	var html = ['<div class="' + CLASS_PULL + '">', '<div class="' + CLASS_PULL_ARROW + '"></div>', '<div class="' + CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_SPINNER + ' ' + CLASS_SPIN + '"></div>', '<div class="' + CLASS_PULL_CAPTION + '">', '<span class="' + CLASS_PULL_CAPTION_DOWN + ' ' + CLASS_IN + '">{downCaption}</span>', '<span class="' + CLASS_PULL_CAPTION_OVER + '">{overCaption}</span>', '<span class="' + CLASS_PULL_CAPTION_REFRESH + '">{refreshCaption}</span>', '</div>', '</div>'];

	var PullRefresh = function(element, options) {
		this.element = element;
		this.options = $.extend(defaultOptions, options, true);
		this.options.up.height = -this.options.up.height;
		this.pullOptions = null;

		this.init();

	};
	PullRefresh.prototype.init = function() {
		this.element.style.webkitTransform = 'translate3d(0,0,0)';
		this.element.style.position = 'relative';
		this.element.style['-webkit-backface-visibility'] = 'hidden';
		this.translateY = 0;
		this.lastTranslateY = 0;

		this.initPocket();
		this.initEvent();
	};
	PullRefresh.prototype.initPocket = function() {
		var options = this.options;
		if (options.down && options.down.hasOwnProperty('callback')) {
			this.topPocket = this.element.querySelector('.' + CLASS_PULL_TOP_POCKET);
			if (!this.topPocket) {
				this.topPocket = this.createPocket(CLASS_PULL_TOP_POCKET, options.down);
				this.element.insertBefore(this.topPocket, this.element.firstChild);
			}
			this.topArrow = this.topPocket.querySelector('.' + CLASS_PULL_ARROW);
		}
		if (options.up && options.up.hasOwnProperty('callback')) {
			this.bottomPocket = this.element.querySelector('.' + CLASS_PULL_BOTTOM_POCKET);
			if (!this.bottomPocket) {
				this.bottomPocket = this.createPocket(CLASS_PULL_BOTTOM_POCKET, options.up);
				this.element.appendChild(this.bottomPocket);
			}
		}
	};
	PullRefresh.prototype.createPocket = function(clazz, options) {
		var pocket = document.createElement('div');
		pocket.className = clazz;
		pocket.innerHTML = html.join('').replace('{downCaption}', options.contentdown).replace('{overCaption}', options.contentover).replace('{refreshCaption}', options.contentrefresh);
		return pocket;
	};
	PullRefresh.prototype.initEvent = function() {
		var self = this;
		if (self.bottomPocket) {
			self.element.addEventListener('dragup', function(e) {
				self.dragUp(e);
			});
		}
		if (self.topPocket) {
			self.element.addEventListener('dragdown', function(e) {
				self.dragDown(e);
			});
		}
		if (self.bottomPocket || self.topPocket) {
			self.element.addEventListener('dragstart', function(e) {
				self.dragStart(e);
			});
			self.element.addEventListener('drag', function(e) {
				var direction = e.detail.direction;
				if (self.dragDirection && direction !== 'up' && direction !== 'down') {
					if (self.pullOptions) {
						if (self.pullOptions.height > 0) {
							self.dragDown(e);
						} else {
							self.dragUp(e);
						}
					}
				}
			});
			self.element.addEventListener('dragend', function(e) {
				self.dragEnd(e);
			});
		}
	};
	PullRefresh.prototype.dragStart = function(e) {
		var detail = e.detail;
		if (detail.direction === 'up' || detail.direction === 'down') {
			this.isLoading = this.dragDirection = false;
		}
	};
	PullRefresh.prototype.dragUp = function(e) {
		var self = this;
		if (self.isLoading || self.dragDirection === 'down') {
			return;
		}
		var scrollHeight = document.body.scrollHeight;
		if (!self.dragDirection && window.innerHeight + window.scrollY + 40 < scrollHeight) {
			return;
		}
		window.scrollTo(0, scrollHeight);
		self.pullOptions = self.options.up;
		self.drag(e);
	};
	PullRefresh.prototype.dragDown = function(e) {
		var self = this;
		if (self.isLoading || self.dragDirection === 'up') {
			return;
		}
		var scrollY = window.scrollY;
		if (!self.dragDirection && scrollY > 5) {
			return;
		} else if (scrollY !== 0) {
			window.scrollTo(0, 0);
		}
		self.pullOptions = self.options.down;
		self.drag(e);
	};
	PullRefresh.prototype.drag = function(e) {
		if (!this.pullOptions) {
			return;
		}
		if (this.pullOptions.height > 0) {
			if (e.detail.deltaY < 0) {
				return;
			}
		}

		this.dragDirection = this.pullOptions.height > 0 ? 'down' : 'up';
		if (!this.requestAnimationFrame) {
			this.updateTranslate();
		}
		e.detail.gesture.preventDefault();
		this.translateY = e.detail.deltaY * 0.4;
	};
	PullRefresh.prototype.dragEnd = function(e) {
		var self = this;
		if (self.pullOptions) {
			cancelAnimationFrame(self.requestAnimationFrame);
			if (Math.abs(e.detail.deltaY * 0.4) >= Math.abs(self.pullOptions.height)) {
				self.loading();
			} else {
				this.hide();
			}
			$.gestures.stoped = true;
		}

	};
	PullRefresh.prototype.hide = function() {
		this.translateY = 0;
		this.setTranslate(0);
		cancelAnimationFrame(this.requestAnimationFrame);
		this.requestAnimationFrame = null;
		this.setCaption(CLASS_PULL_CAPTION_DOWN);
		if (this.pullOptions.height > 0) {
			this.topArrow.classList.remove(CLASS_REVERSE);
		}
		this.pullOptions = null;
	};
	PullRefresh.prototype.updateTranslate = function() {
		var self = this;
		if (self.translateY !== self.lastTranslateY) {
			self.translateY = Math.abs(self.translateY) < 2 ? 0 : self.translateY;
			self.setTranslate(self.translateY);
			if (Math.abs(self.translateY) >= Math.abs(self.pullOptions.height)) {
				self.showLoading(CLASS_PULL_CAPTION_OVER);
			} else {
				self.hideLoading(CLASS_PULL_CAPTION_DOWN);
			}
			self.lastTranslateY = self.translateY;
		}
		self.requestAnimationFrame = requestAnimationFrame(function() {
			self.updateTranslate();
		});
	};
	PullRefresh.prototype.setTranslate = function(height) {
		this.element.style.webkitTransform = 'translate3d(0,' + height + 'px,0)';
		if (this.bottomPocket) {
			if (height < 0) {//up
				this.bottomPocket.style.bottom = (height > this.pullOptions.height ? height : this.pullOptions.height) + 'px';
			} else if (height === 0) {
				//this.bottomPocket.removeAttribute('style');//靠，为啥5+里边remove不掉呢
				this.bottomPocket.setAttribute('style', '');
			}
		}
	};

	PullRefresh.prototype.loading = function() {
		var self = this;
		self.isLoading = true;
		self.showLoading(CLASS_PULL_CAPTION_REFRESH);
		self.setTranslate(self.pullOptions.height);
		var callback = self.pullOptions.callback;
		callback && callback(function() {
			if (self.pullOptions && self.pullOptions.height < 0) {
				//self.bottomPocket.classList.add(CLASS_HIDDEN);
				var duration = Math.min(1000, self.pullOptions.duration);
				setTimeout(function() {
					$.scrollTo(document.body.scrollHeight - window.innerHeight, duration, function() {
						self.isLoading = false;
						//self.bottomPocket.classList.remove(CLASS_HIDDEN);
					});
				}, 100);
			} else {
				self.isLoading = false;
			}
			self.hide();
		});
	};

	PullRefresh.prototype.showLoading = function(className) {
		this.setCaption(className);
		if (this.pullOptions && this.pullOptions.height > 0)
			this.topArrow.classList.add(CLASS_REVERSE);
	};
	PullRefresh.prototype.hideLoading = function(className) {
		this.setCaption(className);
		if (this.pullOptions && this.pullOptions.height > 0)
			this.topArrow.classList.remove(CLASS_REVERSE);
	};

	PullRefresh.prototype.setCaption = function(className) {
		var pocket = this.pullOptions && this.pullOptions.height > 0 ? this.topPocket : this.bottomPocket;
		if (pocket) {
			var caption = pocket.querySelector('.' + CLASS_PULL_CAPTION);
			var last = caption.querySelector('.' + CLASS_IN);
			if (last) {
				last.classList.remove(CLASS_IN);
			}
			var active = caption.querySelector('.' + className);
			if (active) {
				active.classList.add(CLASS_IN);
			}
			var loading = pocket.querySelector('.' + CLASS_PULL_LOADING);
			if (loading) {
				if (className === CLASS_PULL_CAPTION_REFRESH) {
					loading.classList.add(CLASS_IN);
				} else {
					loading.classList.remove(CLASS_IN);
				}
			}

		}
	};

	$.fn.pullRefresh = function(options) {
		this.each(function() {
			var pullrefresh = this.getAttribute('data-pullrefresh');
			if (!pullrefresh) {
				var id = ++$.uuid;
				$.data[id] = new PullRefresh(this, options);
				this.setAttribute('data-pullrefresh', id);
			}
		});
	};
})(mui, window, document);

/**
 * pulldownRefresh 5+
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
	var pulldownOptions = {
		height : 50,
		contentdown : '下拉可以刷新',
		contentover : '释放立即刷新',
		contentrefresh : '正在刷新...'
	}

	$.fn.plus_pulldownRefresh = function(options) {
		options = $.extend(pulldownOptions, options, true);
		this.each(function() {
			var self = this;
			$.plusReady(function() {
				var id = self.getAttribute('data-pullrefresh-plus');
				if (!id) {//避免重复初始化5+ pullrefresh
					id = ++$.uuid;
					self.setAttribute('data-pullrefresh-plus', id);
					var sw = plus.webview.currentWebview();
					sw.setPullToRefresh({
						support : true,
						height : options.height + 'px',
						range : "200px",
						contentdown : {
							caption : options.contentdown
						},
						contentover : {
							caption : options.contentover
						},
						contentrefresh : {
							caption : options.contentrefresh
						}
					}, function() {
						options.callback && options.callback(function() {
							sw.endPullToRefresh();
						});
					});

				}
			});

		});
	};
})(mui);


/**
 * off-canvas
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} action
 * @returns {undefined}
 */
(function($, window, document, name, undefined) {
	var CLASS_OFF_CANVAS_LEFT = 'mui-off-canvas-left';
	var CLASS_OFF_CANVAS_RIGHT = 'mui-off-canvas-right';
	var CLASS_ACTION_BACKDEOP = 'mui-off-canvas-backdrop';
	var CLASS_OFF_CANVAS_WRAP = 'mui-off-canvas-wrap';
	var CLASS_OFF_CANVAS_HEIGHT_FIXED = 'mui-off-canvas-height-fixed';

	var CLASS_LEFT = 'mui-left';
	var CLASS_RIGHT = 'mui-right';
	var CLASS_SLIDING = 'mui-sliding';

	var SELECTOR_INNER_WRAP = '.mui-inner-wrap';

	var findOffCanvasContainer = function(target) {
		parentNode = target.parentNode;
		if (parentNode) {
			if (parentNode.classList.contains(CLASS_OFF_CANVAS_WRAP)) {
				return parentNode;
			} else {
				parentNode = parentNode.parentNode;
				if (parentNode.classList.contains(CLASS_OFF_CANVAS_WRAP)) {
					return parentNode;
				}
			}
		}
	}
	var handle = function(event, target) {
		if (target.classList && target.classList.contains(CLASS_ACTION_BACKDEOP)) {//backdrop
			var container = findOffCanvasContainer(target);
			if (container) {
				$.targets._container = container;
				return target;
			}
		} else if (target.tagName === 'A' && target.hash) {
			var offcanvas = document.getElementById(target.hash.replace('#', ''));
			if (offcanvas) {
				var container = findOffCanvasContainer(offcanvas);
				if (container) {
					$.targets._container = container;
					return offcanvas;
				}
			}
		}
		return false;
	};

	$.registerTarget({
		name : name,
		index : 60,
		handle : handle,
		target : false,
		isReset : false,
		isContinue : true
	});

	var fixedHeight = function(container, isShown) {
		var content = container.querySelector('.mui-content');
		var html = document.getElementsByTagName('html')[0];
		var body = document.body;
		if (isShown) {
			html.classList.add(CLASS_OFF_CANVAS_HEIGHT_FIXED);
			body.classList.add(CLASS_OFF_CANVAS_HEIGHT_FIXED);
			content && (content.classList.add(CLASS_OFF_CANVAS_HEIGHT_FIXED));
		} else {
			html.classList.remove(CLASS_OFF_CANVAS_HEIGHT_FIXED);
			body.classList.remove(CLASS_OFF_CANVAS_HEIGHT_FIXED);
			content && (content.classList.remove(CLASS_OFF_CANVAS_HEIGHT_FIXED));
		}
	}
	var offCanvasTransitionEnd = function() {
		var container = this.parentNode;
		container.classList.remove(CLASS_SLIDING);
		this.removeEventListener('webkitTransitionEnd', offCanvasTransitionEnd);
		if (!container.classList.contains(CLASS_RIGHT) && !container.classList.contains(CLASS_LEFT)) {
			fixedHeight(container, false);
		}
	};
	var toggleOffCanvas = function(container, anchor) {
		if (container && anchor) {
			var type;
			var classList = anchor.classList;
			container.classList.add(CLASS_SLIDING);
			container.querySelector(SELECTOR_INNER_WRAP).addEventListener('webkitTransitionEnd', offCanvasTransitionEnd);

			if (!container.classList.contains(CLASS_RIGHT) && !container.classList.contains(CLASS_LEFT)) {
				fixedHeight(container, true);
			}
			if (classList.contains(CLASS_OFF_CANVAS_LEFT)) {
				container.classList.toggle(CLASS_RIGHT);
			} else if (classList.contains(CLASS_OFF_CANVAS_RIGHT)) {
				container.classList.toggle(CLASS_LEFT);
			} else if (classList.contains(CLASS_ACTION_BACKDEOP)) {
				container.classList.remove(CLASS_RIGHT);
				container.classList.remove(CLASS_LEFT);
			}

		}
	}
	window.addEventListener('tap', function(event) {
		if (!$.targets.offcanvas) {
			return;
		}
		toggleOffCanvas($.targets._container, $.targets.offcanvas);
	});

	$.fn.offCanvas = function() {
		var args = arguments;
		this.each(function() {
			if (args[0] === 'show' || args[0] === 'hide' || args[0] === 'toggle') {
				var classList = this.classList;
				if (classList.contains(CLASS_OFF_CANVAS_LEFT) || classList.contains(CLASS_OFF_CANVAS_RIGHT)) {
					var container = findOffCanvasContainer(this);
					if (container) {
						toggleOffCanvas(container, this);
					}
				}
			}
		});
	};
})(mui, window, document, 'offcanvas');

/**
 * off-canvas drag
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} action
 * @returns {undefined}
 */
(function($, window, document, name, undefined) {
	var CLASS_OFF_CANVAS_LEFT = 'mui-off-canvas-left';
	var CLASS_OFF_CANVAS_RIGHT = 'mui-off-canvas-right';
	var CLASS_OFF_CANVAS_WRAP = 'mui-off-canvas-wrap';
	var CLASS_OFF_CANVAS_HEIGHT_FIXED = 'mui-off-canvas-height-fixed';

	var CLASS_LEFT = 'mui-left';
	var CLASS_RIGHT = 'mui-right';
	var CLASS_SLIDING = 'mui-sliding';
	var CLASS_DRAGING = 'mui-draging';

	var SELECTOR_INNER_WRAP = '.mui-inner-wrap';
	var SELECTOR_OFF_CANVAS_LEFT = '.' + CLASS_OFF_CANVAS_LEFT;
	var SELECTOR_OFF_CANVAS_RIGHT = '.' + CLASS_OFF_CANVAS_RIGHT;
	var isDragable = false;
	var container;
	var innerContainer;
	var factor = 1.5;
	var translateX = 0;
	var lastTranslateX = 0;
	var offCanvasRequestAnimationFrame;
	var offCanvasTranslateX = maxOffCanvasWidth = 0;
	var direction;

	var updateTranslate = function() {
		if (translateX !== lastTranslateX) {
			innerContainer.style['-webkit-transition-duration'] = '0s';
			if (direction === 'right' && translateX > 0) {//dragRight
				translateX = Math.min(translateX, maxOffCanvasWidth);
				if (offCanvasTranslateX < 0) {
					setTranslate(innerContainer, offCanvasTranslateX + translateX);
				} else {
					setTranslate(innerContainer, translateX);
				}
			} else if (direction === 'left' && translateX < 0) {//dragLeft
				translateX = Math.max(translateX, -maxOffCanvasWidth)
				if (offCanvasTranslateX > 0) {
					setTranslate(innerContainer, offCanvasTranslateX + translateX);
				} else {
					setTranslate(innerContainer, translateX);
				}
			}
			lastTranslateX = translateX;
		}
		offCanvasRequestAnimationFrame = requestAnimationFrame(function() {
			updateTranslate();
		});
	};
	var setTranslate = function(element, x) {
		if (element) {
			element.style.webkitTransform = 'translate3d(' + x + 'px,0,0)';
		}
	};
	/**
	 * TODO repeat with mui.offcanvas.js
	 */
	var fixedHeight = function(container, isShown) {
		var content = container.querySelector('.mui-content');
		var html = document.getElementsByTagName('html')[0];
		var body = document.body;
		if (isShown) {
			html.classList.add(CLASS_OFF_CANVAS_HEIGHT_FIXED);
			body.classList.add(CLASS_OFF_CANVAS_HEIGHT_FIXED);
			content && (content.classList.add(CLASS_OFF_CANVAS_HEIGHT_FIXED));
		} else {
			html.classList.remove(CLASS_OFF_CANVAS_HEIGHT_FIXED);
			body.classList.remove(CLASS_OFF_CANVAS_HEIGHT_FIXED);
			content && (content.classList.remove(CLASS_OFF_CANVAS_HEIGHT_FIXED));
		}
	}
	/**
	 * TODO repeat with mui.offcanvas.js
	 */
	var offCanvasTransitionEnd = function() {
		var container = this.parentNode;
		var classList = container.classList;
		classList.remove(CLASS_SLIDING);
		this.removeEventListener('webkitTransitionEnd', offCanvasTransitionEnd);
		if (!classList.contains(CLASS_RIGHT) && !classList.contains(CLASS_LEFT)) {
			fixedHeight(container, false);
		}
	};
	window.addEventListener('touchstart', function(event) {
		var target = event.target;
		for (; target && target !== document; target = target.parentNode) {
			if (target.classList && target.classList.contains(CLASS_OFF_CANVAS_WRAP)) {
				container = target;
				innerContainer = container.querySelector(SELECTOR_INNER_WRAP);
				if (!innerContainer) {
					return;
				}
				break;
			}
		}
	});
	window.addEventListener('dragstart', function(event) {
		if (container) {
			var detail = event.detail;
			if (detail.direction === 'left') {
				//off-canvas-left is showed OR off-canvas-right is hidden
				if (container.classList.contains(CLASS_RIGHT)) {
					isDragable = true;
				} else if (container.querySelector(SELECTOR_OFF_CANVAS_RIGHT) && !container.classList.contains(CLASS_LEFT)) {
					isDragable = true;
				}
			} else if (detail.direction === 'right') {
				//off-canvas-left is hidden OR off-canvas-right is showed
				if (container.classList.contains(CLASS_LEFT)) {
					isDragable = true;
				} else if (container.querySelector(SELECTOR_OFF_CANVAS_LEFT) && !container.classList.contains(CLASS_RIGHT)) {
					isDragable = true;
				}
			}
			if (isDragable) {
				direction = detail.direction;
				maxOffCanvasWidth = container.offsetWidth * 0.8;

				var matrix = $.getStyles(innerContainer, 'webkitTransform');
				var result = $.parseTranslateMatrix(matrix);
				offCanvasTranslateX = translateX = result ? result.x : 0;

				var classList = container.classList;
				classList.add(CLASS_SLIDING);

				if (!classList.contains(CLASS_RIGHT) && !classList.contains(CLASS_LEFT)) {
					fixedHeight(container, true);
				}

				detail.gesture.preventDefault();
			}
		}
	});
	//	window.addEventListener('swipeleft', function(event) {
	//		//TODO
	//	});
	//	window.addEventListener('swiperight', function(event) {
	//		//TODO
	//	});
	window.addEventListener('drag', function(event) {
		if (isDragable) {
			var detail = event.detail;
			if (!offCanvasRequestAnimationFrame) {
				updateTranslate();
			}
			translateX = detail.deltaX * factor;
		}
	});
	window.addEventListener('dragend', function(event) {
		if (isDragable) {
			if (offCanvasRequestAnimationFrame) {
				cancelAnimationFrame(offCanvasRequestAnimationFrame);
				offCanvasRequestAnimationFrame = null;
			}
			innerContainer.setAttribute('style', '');
			innerContainer.addEventListener('webkitTransitionEnd', offCanvasTransitionEnd);
			var classList = container.classList;
			var action = ['add', 'remove'];
			var clazz;
			if (direction === 'right' && translateX > 0) {//dragRight
				clazz = CLASS_RIGHT;
				if (offCanvasTranslateX < 0) {//showed
					action.reverse();
					clazz = CLASS_LEFT;
				}
				if (translateX > (maxOffCanvasWidth / 2)) {
					classList[action[0]](clazz);
				} else {
					classList[action[1]](clazz);
				}
			} else if (direction === 'left' && translateX < 0) {//dragLeft
				clazz = CLASS_LEFT;
				if (offCanvasTranslateX > 0) {//showed
					action.reverse();
					clazz = CLASS_RIGHT;
				}
				if ((-translateX) > (maxOffCanvasWidth / 2)) {
					classList[action[0]](clazz);
				} else {
					classList[action[1]](clazz);
				}
			}
			isDragable = false;
			container = innerContainer = null;
		}

	});
})(mui, window, document, 'offcanvas');

/**
 * actions
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} action
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, name, undefined) {
	var CLASS_ACTION = 'mui-action';

	var handle = function(event, target) {
		if (target.className && ~target.className.indexOf(CLASS_ACTION)) {
			return target;
		}
		return false;
	};

	$.registerTarget({
		name : name,
		index : 50,
		handle : handle,
		target : false
	});

})(mui, window, document, 'action');

/**
 * Modals
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} name
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, name, undefined) {
	var CLASS_MODAL = 'mui-modal';

	var handle = function(event, target) {
		if (target.tagName === 'A' && target.hash) {
			var modal = document.getElementById(target.hash.replace('#', ''));
			if (modal && modal.classList.contains(CLASS_MODAL)) {
				return modal;
			}
		}
		return false;
	};

	$.registerTarget({
		name : name,
		index : 50,
		handle : handle,
		target : false,
		isReset : false,
		isContinue : true
	});

	window.addEventListener('tap', function(event) {
		if ($.targets.modal) {
			$.targets.modal.classList.toggle('mui-active');
		}
	});
})(mui, window, document, 'modal');

/**
 * Popovers
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} name
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, name, undefined) {

	var CLASS_POPOVER = 'mui-popover';
	var CLASS_BAR_POPOVER = 'mui-bar-popover';
	var CLASS_ACTION_POPOVER = 'mui-popover-action';
	var CLASS_BACKDROP = 'mui-backdrop';
	var CLASS_BAR_BACKDROP = 'mui-bar-backdrop';
	var CLASS_ACTION_BACKDROP = 'mui-backdrop-action';
	var CLASS_ACTIVE = 'mui-active';

	var handle = function(event, target) {
		if (target.tagName === 'A' && target.hash) {
			$.targets._popover = document.getElementById(target.hash.replace('#', ''));
			if ($.targets._popover && $.targets._popover.classList.contains(CLASS_POPOVER)) {
				return target;
			}
		}
		return false;
	};

	$.registerTarget({
		name: name,
		index: 60,
		handle: handle,
		target: false,
		isReset: false,
		isContinue: true
	});

	var fixedPopoverScroll = function(isPopoverScroll) {
		if (isPopoverScroll) {
			document.body.setAttribute('style', 'position:fixed;width:100%;height:100%;overflow:hidden;');
		} else {
			document.body.setAttribute('style', '');
		}
	};
	var onPopoverHidden = function() {
		this.style.display = 'none';
		this.removeEventListener('webkitTransitionEnd', onPopoverHidden);
		fixedPopoverScroll(false);
	};

	var backdrop = (function() {
		var element = document.createElement('div');
		element.classList.add(CLASS_BACKDROP);
		element.addEventListener('tap', function(e) {
			var popover = $.targets._popover;
			if (popover) {
				popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
				popover.classList.remove(CLASS_ACTIVE);
				popover.parentNode.removeChild(backdrop);
			}
		});

		return element;
	}());

	window.addEventListener('tap', function(e) {
		if (!$.targets.popover) {
			return;
		}
		togglePopover($.targets._popover, $.targets.popover);
	});

	var togglePopover = function(popover, anchor) {
		backdrop.classList.remove(CLASS_BAR_BACKDROP);
		backdrop.classList.remove(CLASS_ACTION_BACKDROP);
		var _popover = document.querySelector('.mui-popover.mui-active');
		if (_popover) {
			_popover.style.display = 'none';
			_popover.classList.remove(CLASS_ACTIVE);
			_popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
			fixedPopoverScroll(false);

			_popover.parentNode.removeChild(backdrop);
			//同一个弹出则直接返回，解决同一个popover的toggle
			if (popover === _popover) {
				return;
			}
		}
		if (popover.classList.contains(CLASS_BAR_POPOVER) || popover.classList.contains(CLASS_ACTION_POPOVER)) { //navBar
			if (popover.classList.contains(CLASS_ACTION_POPOVER)) { //action sheet popover
				backdrop.classList.add(CLASS_ACTION_BACKDROP);
			} else { //bar popover
				backdrop.classList.add(CLASS_BAR_BACKDROP);
				if (anchor) {
					if (anchor.parentNode) {
						var offsetWidth = anchor.offsetWidth;
						var offsetLeft = anchor.offsetLeft;
						var innerWidth = window.innerWidth;
						popover.style.left = (Math.min(Math.max(offsetLeft, 5), innerWidth - offsetWidth - 5)) + "px";
					} else {
						//TODO anchor is position:{left,top,bottom,right}
					}
				}
			}
		}
		popover.style.display = 'block';
		popover.offsetHeight
		popover.classList.add(CLASS_ACTIVE);
		popover.parentNode.appendChild(backdrop);
		fixedPopoverScroll(true);

		backdrop.classList.add(CLASS_ACTIVE);
	};

	$.fn.popover = function() {
		var args = arguments;
		this.each(function() {
			$.targets._popover = this;
			if (args[0] === 'show' || args[0] === 'hide' || args[0] === 'toggle') {
				togglePopover(this, args[1]);
			}
		});
	};

})(mui, window, document, 'popover');
/**
 * segmented-controllers
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, name, undefined) {

	var CLASS_CONTROL_ITEM = 'mui-control-item';
	var CLASS_CONTROL_CONTENT = 'mui-control-content';
	var CLASS_TAB_ITEM = 'mui-tab-item';
	var CLASS_SLIDER_ITEM = 'mui-slider-item';

	var handle = function(event, target) {
		if (target.classList && (target.classList.contains(CLASS_CONTROL_ITEM) || target.classList.contains(CLASS_TAB_ITEM))) {
			return target;
		}
		return false;
	};

	$.registerTarget({
		name : name,
		index : 80,
		handle : handle,
		target : false
	});

	window.addEventListener('tap', function(e) {

		var targetTab = $.targets.tab;
		if (!targetTab) {
			return;
		}
		var activeTab;
		var activeBodies;
		var targetBody;
		var className = 'mui-active';
		var classSelector = '.' + className;

		activeTab = targetTab.parentNode.querySelector(classSelector);

		if (activeTab) {
			activeTab.classList.remove(className);
		}

		var isLastActive = targetTab === activeTab;
		if (targetTab) {
			targetTab.classList.add(className);
		}

		if (!targetTab.hash) {
			return;
		}

		targetBody = document.getElementById(targetTab.hash.replace('#', ''));

		if (!targetBody) {
			return;
		}
		if (!targetBody.classList.contains(CLASS_CONTROL_CONTENT)) {//tab bar popover
			targetTab.classList[isLastActive ? 'remove' : 'add'](className);
			return;
		}
		if (isLastActive) {//same
			return;
		}
		activeBodies = targetBody.parentNode.getElementsByClassName(className);

		for (var i = 0; i < activeBodies.length; i++) {
			activeBodies[i].classList.remove(className);
		}

		targetBody.classList.add(className);

		var contents = targetBody.parentNode.querySelectorAll('.' + CLASS_CONTROL_CONTENT);
		
		$.trigger(targetBody, $.eventName('shown', name), {
			tabNumber : Array.prototype.indexOf.call(contents, targetBody)
		})
	});

})(mui, window, document, 'tab');

/**
 * Gallery (TODO resize)
 * @param {type} $
 * @param {type} window
 * @returns {undefined}
 */
(function($, window) {
	var CLASS_SLIDER_LOOP = 'mui-slider-loop';
	var CLASS_SLIDER_INDICATOR = 'mui-slider-indicator';
	var CLASS_ACTION_PREVIOUS = 'mui-action-previous';
	var CLASS_ACTION_NEXT = 'mui-action-next';
	var CLASS_SLIDER_ITEM = 'mui-slider-item';
	var CLASS_SLIDER_ITEM_DUPLICATE = CLASS_SLIDER_ITEM + '-duplicate';

	var SELECTOR_SLIDER_ITEM = '.' + CLASS_SLIDER_ITEM;
	var SELECTOR_SLIDER_ITEM_DUPLICATE = '.' + CLASS_SLIDER_ITEM_DUPLICATE;
	var SELECTOR_SLIDER_INDICATOR = '.' + CLASS_SLIDER_INDICATOR;
	var SELECTOR_SLIDER_PROGRESS_BAR = '.mui-slider-progress-bar';

	var Gallery = function(element, options) {
		this.element = element;
		this.options = $.extend({
			slideshowDelay : 5000, //设置为0，则不定时轮播
			factor : 1.1
		}, options);

		this.init();
	};
	Gallery.prototype.init = function() {
		//		this.initDuplicate();
		this.initEvent();
		this.initTimer();
	};
	//TODO 暂时不做自动clone
	//	Gallery.prototype.initDuplicate = function() {
	//		var self = this;
	//		var element = self.element;
	//		if (element.classList.contains(CLASS_SLIDER_LOOP)) {
	//			var duplicates = element.getElementsByClassName(CLASS_SLIDER_ITEM_DUPLICATE);
	//		}
	//	};
	Gallery.prototype.initEvent = function() {
		var self = this;
		var element = self.element;
		var slider = element.parentNode;
		self.translateX = 0;
		self.sliderWidth = element.offsetWidth;
		self.isLoop = element.classList.contains(CLASS_SLIDER_LOOP);
		self.sliderLength = element.querySelectorAll(SELECTOR_SLIDER_ITEM).length;
		self.progressBarWidth = 0;
		self.progressBar = slider.querySelector(SELECTOR_SLIDER_PROGRESS_BAR);
		if (self.progressBar) {
			self.progressBarWidth = self.progressBar.offsetWidth;
		}
		//slider
		var isDragable = false;
		self.isSwipeable = false;
		slider.addEventListener('dragstart', function(event) {
			var detail = event.detail;
			var direction = detail.direction;
			if (direction == 'left' || direction == 'right') {//reset
				isDragable = true;
				self.translateX = 0;
				self.scrollX = self.getScroll();
				self.sliderWidth = element.offsetWidth;
				self.isLoop = element.classList.contains(CLASS_SLIDER_LOOP);
				self.sliderLength = element.querySelectorAll(SELECTOR_SLIDER_ITEM).length;
				if (self.progressBar) {
					self.progressBarWidth = self.progressBar.offsetWidth;
				}
				self.maxTranslateX = ((self.sliderLength - 1) * self.sliderWidth);
				event.detail.gesture.preventDefault();
			}
		});
		slider.addEventListener('drag', function(event) {
			if (isDragable) {
				self.dragItem(event);
			}

		});
		slider.addEventListener('dragend', function(event) {
			if (isDragable) {
				self.gotoItem(self.getSlideNumber());
				isDragable = self.isSwipeable = false;
			}
		});
		slider.addEventListener('swipeleft', function(event) {
			if (self.isSwipeable) {
				//stop dragend
				$.gestures.stoped = true;
				self.nextItem();
				isDragable = self.isSwipeable = false;
				event.stopImmediatePropagation();
			}
		});
		slider.addEventListener('swiperight', function(event) {
			if (self.isSwipeable) {
				//stop dragend
				$.gestures.stoped = true;
				self.prevItem();
				isDragable = self.isSwipeable = false;
				event.stopImmediatePropagation();
			}
		});
		slider.addEventListener('slide', function(e) {
			var detail = e.detail;
			detail.slideNumber = detail.slideNumber || 0;
			var number = slider.querySelector('.mui-slider-indicator .mui-number span');
			if (number) {
				number.innerText = (detail.slideNumber + 1);
			}

			var indicators = slider.querySelectorAll('.mui-slider-indicator .mui-indicator');
			for (var i = 0, len = indicators.length; i < len; i++) {
				indicators[i].classList[i === detail.slideNumber ? 'add' : 'remove']('mui-active');
			}

			var controlItems = slider.querySelectorAll('.mui-control-item');
			for (var i = 0, len = controlItems.length; i < len; i++) {
				controlItems[i].classList[i === detail.slideNumber ? 'add' : 'remove']('mui-active');
			}
		});
		slider.addEventListener($.eventName('shown', 'tab'), function(e) {//tab
			self.gotoItem(-(e.detail.tabNumber || 0));
		});
		//indicator
		var indicator = element.parentNode.querySelector(SELECTOR_SLIDER_INDICATOR);
		if (indicator) {
			indicator.addEventListener('tap', function(event) {
				var target = event.target;
				if (target.classList.contains(CLASS_ACTION_PREVIOUS) || target.classList.contains(CLASS_ACTION_NEXT)) {
					self[target.classList.contains(CLASS_ACTION_PREVIOUS) ? 'prevItem' : 'nextItem']();
					event.stopPropagation();
				}
			});
		}
	};
	Gallery.prototype.dragItem = function(event) {
		var self = this;
		var detail = event.detail;

		if (detail.deltaX !== detail.lastDeltaX) {
			var translate = (detail.deltaX * self.options.factor + self.scrollX);
			self.element.style['-webkit-transition-duration'] = '0';
			var min = 0;
			var max = -self.maxTranslateX;
			if (self.isLoop) {
				min = self.sliderWidth;
				max = max + min;
			}
			if (translate > min || translate < max) {
				self.isSwipeable = false;
				return;
			}
			if (!self.requestAnimationFrame) {
				self.updateTranslate();
			}
			self.isSwipeable = true;
			self.translateX = translate;
		}
		if (self.timer) {
			clearTimeout(self.timer);
		}
		self.timer = setTimeout(function() {
			self.initTimer();
		}, 100);

	};
	Gallery.prototype.updateTranslate = function() {
		var self = this;
		if (self.lastTranslateX !== self.translateX) {
			self.setTranslate(self.translateX);
			self.lastTranslateX = self.translateX;
		}
		self.requestAnimationFrame = requestAnimationFrame(function() {
			self.updateTranslate();
		});
	};
	Gallery.prototype.setTranslate = function(x) {
		this.element.style.webkitTransform = 'translate3d(' + x + 'px,0,0)';
		this.updateProcess(x);
	}
	Gallery.prototype.updateProcess = function(translate) {
		var progressBarWidth = this.progressBarWidth;
		if (progressBarWidth) {
			translate = Math.abs(translate);
			this.setProcess(translate * (progressBarWidth / this.sliderWidth));
		}
	};
	Gallery.prototype.setProcess = function(translate) {
		var progressBar = this.progressBar;
		if (progressBar) {
			progressBar.style.webkitTransform = 'translate3d(' + translate + 'px,0,0)';
		}
	};
	/**
	 * 下一个轮播
	 * @returns {Number}
	 */
	Gallery.prototype.nextItem = function() {
		this.gotoItem(this.getCurrentSlideNumber('next') - 1);
	};
	/**
	 * 上一个轮播
	 * @returns {Number}
	 */
	Gallery.prototype.prevItem = function() {
		this.gotoItem(this.getCurrentSlideNumber('prev') + 1);
	};
	/**
	 * 滑动到指定轮播
	 * @param {type} slideNumber
	 * @returns {undefined}
	 */
	Gallery.prototype.gotoItem = function(slideNumber) {
		var self = this;
		var slider = self.element;
		var slideLength = self.sliderLength;
		if (self.isLoop) {//循环轮播需减去2个过渡元素
			slideLength = slideLength - 2;
		} else {
			slideLength = slideLength - 1;
			slideNumber = Math.min(0, slideNumber);
			slideNumber = Math.max(slideNumber, -slideLength);
		}
		if (self.requestAnimationFrame) {
			cancelAnimationFrame(self.requestAnimationFrame);
			self.requestAnimationFrame = null;
		}
		var offsetX = Math.max(slideNumber, -slideLength) * slider.offsetWidth;
		slider.style['-webkit-transition-duration'] = '.2s';
		self.setTranslate(offsetX);
		//		slider.style.webkitTransform = 'translate3d(' + offsetX + 'px,0,0)';
		//		self.updateProcess(offsetX);
		var fixedLoop = function() {
			slider.style['-webkit-transition-duration'] = '0';
			slider.style.webkitTransform = 'translate3d(' + (slideNumber * slider.offsetWidth) + 'px,0,0)';
			slider.removeEventListener('webkitTransitionEnd', fixedLoop);
		};
		slider.removeEventListener('webkitTransitionEnd', fixedLoop);
		if (self.isLoop) {//循环轮播自动重新定位
			if (slideNumber === 1 || slideNumber === -slideLength) {
				slideNumber = slideNumber === 1 ? (-slideLength + 1) : 0;
				slider.addEventListener('webkitTransitionEnd', fixedLoop);
			}
		}
		$.trigger(slider.parentNode, 'slide', {
			slideNumber : Math.abs(slideNumber)
		});
		this.initTimer();
	};

	/**
	 * 计算轮播应该处于的位置(四舍五入)
	 * @returns {Number}
	 */
	Gallery.prototype.getSlideNumber = function() {
		return (Math.round(this.getScroll() / this.sliderWidth));
	};
	/**
	 * 当前所处位置
	 * @param {type} type
	 * @returns {unresolved}
	 */
	Gallery.prototype.getCurrentSlideNumber = function(type) {
		return (Math[type === 'next' ? 'ceil' : 'floor'](this.getScroll() / this.sliderWidth));
	};
	/**
	 * 获取当前滚动位置
	 * @returns {Number}
	 */
	Gallery.prototype.getScroll = function() {
		var slider = this.element;
		var scroll = 0;
		if ('webkitTransform' in slider.style) {
			var result = $.parseTranslate(slider.style.webkitTransform);
			scroll = result ? result.x : 0;
		}
		return scroll;
	};
	/**
	 * 自动轮播
	 * @returns {undefined}
	 */
	Gallery.prototype.initTimer = function() {
		var self = this;
		var slideshowDelay = self.options.slideshowDelay;
		if (slideshowDelay) {
			var slider = self.element;
			var slidershowTimer = slider.getAttribute('data-slidershowTimer');
			slidershowTimer && window.clearTimeout(slidershowTimer);
			slidershowTimer = window.setTimeout(function() {
				if (!slider) {
					return;
				}
				//仅slider显示状态进行自动轮播
				if (!!(slider.offsetWidth || slider.offsetHeight)) {
					self.nextItem();
					//下一个
				}
				self.initTimer();
			}, slideshowDelay);
			slider.setAttribute('data-slidershowTimer', slidershowTimer);
		}

	};

	$.fn.slider = function(options) {
		//新增定时轮播 重要：remove该轮播时，请获取data-slidershowTimer然后手动clearTimeout
		this.each(function() {
			var slider = this.getAttribute('data-slider', id);
			if (!slider) {
				var id = ++$.uuid;
				$.data[id] = new Gallery(this, options);
				this.setAttribute('data-slider', id);
			}
		});
	};
})(mui, window);

/**
 * Toggles switch
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} name
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, name, undefined) {

	var CLASS_TOGGLE = 'mui-switch';
	var CLASS_TOGGLE_HANDLE = 'mui-switch-handle';
	var CLASS_ACTIVE = 'mui-active';

	var SELECTOR_TOGGLE_HANDLE = '.' + CLASS_TOGGLE_HANDLE;

	var handle = function(event, target) {
		if (target.classList && target.classList.contains(CLASS_TOGGLE)) {
			return target;
		}
		return false;
	};

	$.registerTarget({
		name : name,
		index : 100,
		handle : handle,
		target : false
	});
	var toggle, handle, toggleWidth, handleWidth, offset;

	var switchToggle = function(event) {
		if (!toggle) {
			return;
		}
		var detail = event.detail;
		$.gestures.stoped = true;
		//stop the dragEnd

		var slideOn = (!detail.drag && !toggle.classList.contains(CLASS_ACTIVE)) || (detail.drag && (detail.deltaX > (toggleWidth / 2 - handleWidth / 2)));
		//拖拽过程中，动画时间已经设置为0s了，这里需要恢复回来；
		handle.style['-webkit-transition-duration'] = '.2s';
		if (slideOn) {
			handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)';
			toggle.classList['add'](CLASS_ACTIVE);
		} else {
			handle.style.webkitTransform = 'translate3d(0,0,0)';
			toggle.classList['remove'](CLASS_ACTIVE);
		}

		$.trigger(toggle, 'toggle', {
			isActive : slideOn
		});

	};
	var dragToggle = function(event) {
		if (!toggle) {
			return;
		}
		var deltaX = event.detail.deltaX;
		if (deltaX < 0) {
			return (handle.style.webkitTransform = 'translate3d(0,0,0)');
		}
		if (deltaX > offset) {
			return (handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)');
		}
		handle.style['-webkit-transition-duration'] = '0s';
		handle.style.webkitTransform = 'translate3d(' + deltaX + 'px,0,0)';
		toggle.classList[(deltaX > (toggleWidth / 2 - handleWidth / 2)) ? 'add' : 'remove'](CLASS_ACTIVE);
	};

	window.addEventListener($.EVENT_START, function(e) {
		toggle = $.targets.toggle;
		if (toggle) {
			handle = toggle.querySelector(SELECTOR_TOGGLE_HANDLE);
			toggleWidth = toggle.clientWidth;
			handleWidth = handle.clientWidth;
			offset = (toggleWidth - handleWidth);
			e.preventDefault();
		}
	});
	window.addEventListener('tap', switchToggle);

	window.addEventListener('drag', dragToggle);
	window.addEventListener('dragend', switchToggle);

})(mui, window, document, 'toggle');

/**
 * Tableviews
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, undefined) {

	var CLASS_ACTIVE = 'mui-active';
	var CLASS_SELECTED = 'mui-selected';
	var CLASS_TABLE_VIEW_CELL = 'mui-table-view-cell';
	var CLASS_DISABLED = 'mui-disabled';
	var CLASS_TOGGLE = 'mui-switch';
	var CLASS_BTN = 'mui-btn';

	var CLASS_SLIDER_CELL = 'mui-slider-cell';
	var CLASS_SLIDER_HANDLE = 'mui-slider-handle';
	var CLASS_SLIDER_LEFT = 'mui-slider-left';
	var CLASS_SLIDER_RIGHT = 'mui-slider-right';
	var CLASS_BOUNCE = 'mui-bounce';

	var SELECTOR_SLIDER_CELL = '.' + CLASS_SLIDER_CELL;
	var SELECTOR_SLIDER_HANDLE = '.' + CLASS_SLIDER_HANDLE;
	var SELECTOR_SLIDER_LEFT = '.' + CLASS_SLIDER_LEFT;
	var SELECTOR_SLIDER_RIGHT = '.' + CLASS_SLIDER_RIGHT;
	var bounceFactor = 0.4;
	var drawerFactor = 1.2;
	var factor = 1;
	var cell, a;
	var sliderCell, sliderHandle, sliderTranslateX, sliderHandleWidth, sliderHandleLeft, sliderLeft, sliderLeftBg, sliderLeftWidth, sliderRight, sliderRightBg, sliderRightWidth, isDraging, sliderRequestAnimationFrame, translateX, lastTranslateX;

	var toggleActive = function(isActive) {
		if (isActive) {
			if (a) {
				a.classList.add(CLASS_ACTIVE);
			} else if (cell) {
				cell.classList.add(CLASS_ACTIVE);
			}
		} else {
			if (a) {
				a.classList.remove(CLASS_ACTIVE);
			} else if (cell) {
				cell.classList.remove(CLASS_ACTIVE);
			}
		}
	};

	var updateTranslate = function() {
		if (translateX !== lastTranslateX) {
			if (sliderLeft || sliderRight) {
				if (sliderLeft && sliderRight) {//both
					if (sliderTranslateX === 0) {
						setTranslate(sliderHandle, translateX);
					} else {
						setTranslate(sliderHandle, sliderTranslateX + translateX);
					}
				} else if (sliderLeft) {//only left
					if (sliderTranslateX === 0) {
						setTranslate(sliderHandle, Math.max(translateX, 0));
					} else {
						setTranslate(sliderHandle, Math.max(sliderTranslateX + translateX, 0));
					}
				} else if (sliderRight) {//only right
					if (sliderTranslateX === 0) {
						setTranslate(sliderHandle, Math.min(translateX, 0));
					} else {
						setTranslate(sliderHandle, Math.min(sliderTranslateX + translateX, 0));
					}
				}
				if (sliderLeft) {//left
					if (sliderTranslateX === 0) {
						if (translateX > sliderLeftWidth) {
							sliderCell.style.backgroundColor = sliderLeftBg;
							setTranslate(sliderLeft, Math.max((translateX - sliderLeftWidth), 0));
						}
					} else {
						if (translateX > 0) {
							sliderCell.style.backgroundColor = sliderLeftBg;
						} else {
							sliderCell.style.backgroundColor = '';
						}
						setTranslate(sliderLeft, Math.max(translateX, 0));
					}
				}
				if (sliderRight) {//right
					if (sliderTranslateX === 0) {
						if (-translateX > sliderRightWidth) {
							sliderCell.style.backgroundColor = sliderRightBg;
							setTranslate(sliderRight, Math.min(-((-translateX) - sliderRightWidth), 0));
						}
					} else {
						if (translateX > 0 && !sliderLeft) {
							sliderCell.style.backgroundColor = '';
						} else {
							sliderCell.style.backgroundColor = sliderRightBg;
						}
						setTranslate(sliderRight, Math.min(translateX, 0));
					}

				}
			} else if (sliderHandle) {//抽屉式功能菜单
				//打开状态不允许translateX小于0，关闭状态不允许translateX大于0
				if ((sliderTranslateX === 0 && translateX > 0) || (sliderTranslateX === sliderHandleWidth && translateX < 0)) {
					if (Math.abs(translateX) <= sliderHandleWidth) {
						setTranslate(sliderHandle, sliderTranslateX + translateX);
					}
				}
			}
			lastTranslateX = translateX;
		}
		sliderRequestAnimationFrame = requestAnimationFrame(function() {
			updateTranslate();
		});
	};
	var setTranslate = function(element, x) {
		if (element) {
			element.style.webkitTransform = 'translate3d(' + x + 'px,0,0)';
		}
	};

	var toggleSliderLeftAction = function(show, trigger) {
		if (sliderLeft) {//显示
			sliderLeft.setAttribute('style', '');
			sliderRight && sliderRight.setAttribute('style', '');
			if (show) {
				setTranslate(sliderHandle, sliderLeftWidth);
				if (trigger) {
					$.trigger(sliderHandle, 'slideright');
				}
			} else {
				setTranslate(sliderHandle, 0);
			}
		}
	}
	var toggleSliderRightAction = function(show, trigger) {
		if (sliderRight) {//显示
			sliderRight.setAttribute('style', '');
			sliderLeft && sliderLeft.setAttribute('style', '');
			if (show) {
				setTranslate(sliderHandle, -sliderRightWidth);
				if (trigger) {
					$.trigger(sliderHandle, 'slideleft');
				}
			} else {
				setTranslate(sliderHandle, 0);
			}
		}
	}
	var toggleSliderHandle = function(show) {
		if (sliderHandle) {
			if (show) {
				setTranslate(sliderHandle, 0);
			} else {
				setTranslate(sliderHandle, sliderHandleWidth);
			}
		}
	}
	var endDraging = function(isSwipe, detail) {
		isDraging = false;
		if (sliderRequestAnimationFrame) {
			cancelAnimationFrame(sliderRequestAnimationFrame);
			sliderRequestAnimationFrame = null;
		}
		sliderCell.setAttribute('style', '');
		var absTranslateX = Math.abs(translateX);
		if (!isSwipe && (sliderLeft || sliderRight)) {//bounce
			if (translateX > 0) {//dragright
				var distance = sliderLeftWidth / 2;
				if (sliderTranslateX !== 0) {
					if (sliderRight) {//关闭
						//trigger is false
						toggleSliderRightAction(!(absTranslateX >= sliderRightWidth / 2), false);
						distance = sliderLeftWidth / 2 + sliderRightWidth;
					}
				}
				if (sliderLeft) {
					var isShow = (absTranslateX >= distance);
					if (sliderLeft.classList.contains(CLASS_BOUNCE)) {//bounce
						sliderLeft.setAttribute('style', '');
						setTranslate(sliderHandle, 0);
						if (isShow && !detail.swipe) {
							$.trigger(sliderHandle, 'slideright');
						}
					} else {
						toggleSliderLeftAction(isShow, true);
					}
				}
			} else {
				var distance = sliderLeftWidth / 2;
				if (sliderTranslateX !== 0) {
					if (sliderLeft) {//关闭
						//trigger is false
						toggleSliderLeftAction(!(absTranslateX >= sliderLeftWidth / 2), false);
						distance = sliderRightWidth / 2 + sliderLeftWidth;
					}
				}
				if (sliderRight) {//显示
					var isShow = (absTranslateX >= distance);
					if (sliderRight.classList.contains(CLASS_BOUNCE)) {//bounce
						sliderRight.setAttribute('style', '');
						setTranslate(sliderHandle, 0);
						if (isShow && !detail.swipe) {
							$.trigger(sliderHandle, 'slideleft');
						}
					} else {
						toggleSliderRightAction(isShow, true);
					}
				}
			}
		} else if (!(sliderLeft || sliderRight)) {
			if (sliderTranslateX === 0) {//关闭
				toggleSliderHandle(!(absTranslateX > (sliderHandleWidth / 2)));
			} else {//拉开
				toggleSliderHandle((absTranslateX > (sliderHandleWidth / 2)));
			}
		}
	};
	window.addEventListener('touchstart', function(event) {
		cell = a = sliderHandle = sliderLeft = sliderRight = isDraging = sliderRequestAnimationFrame = false;
		translateX = lastTranslateX = sliderTranslateX = sliderHandleWidth = sliderLeftWidth = sliderRightWidth = 0;
		sliderLeftBg = sliderRightBg = '';
		var target = event.target;
		var isDisabled = false;
		for (; target && target !== document; target = target.parentNode) {
			if (target.classList) {
				var classList = target.classList;
				if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || classList.contains(CLASS_TOGGLE) || classList.contains(CLASS_BTN) || classList.contains(CLASS_DISABLED)) {
					isDisabled = true;
				}
				if (classList.contains(CLASS_TABLE_VIEW_CELL)) {
					cell = target;
					var link = cell.querySelector('a');
					if (link && link.parentNode === cell) {//li>a
						a = link;
					}
					sliderCell = cell.querySelector(SELECTOR_SLIDER_CELL);
					if (sliderCell && sliderCell.parentNode === cell) {
						var handle = sliderCell.querySelector(SELECTOR_SLIDER_HANDLE);
						if (handle) {//slider
							sliderHandle = handle;
							sliderHandleWidth = sliderHandle.offsetWidth;
							sliderHandleLeft = $.getStyles(sliderHandle, 'margin-left');
							factor = drawerFactor;
							var left = sliderCell.querySelector(SELECTOR_SLIDER_LEFT);
							if (left) {//li>.left
								sliderLeft = left;
								sliderLeftBg = $.getStyles(left, 'background-color');
								sliderLeftWidth = left.offsetWidth;
							}
							var right = sliderCell.querySelector(SELECTOR_SLIDER_RIGHT);
							if (right) {//li>.right
								sliderRight = right;
								sliderRightBg = $.getStyles(right, 'background-color');
								sliderRightWidth = right.offsetWidth;
							}
							if (sliderLeft || sliderRight) {
								factor = bounceFactor;
							}
							var matrix = $.getStyles(sliderHandle, 'webkitTransform');
							var result = $.parseTranslateMatrix(matrix);
							sliderTranslateX = result ? result.x : 0;
						}
					}

					if (!isDisabled) {
						toggleActive(true);
					}
					break;
				}
			}
		}
	});
	window.addEventListener('touchmove', function(event) {
		toggleActive(false);
	});
	window.addEventListener('dragstart', function(event) {
		if (!sliderHandle) {
			return;
		}
		var detail = event.detail;
		var direction = detail.direction;
		var angle = detail.angle;
		if (direction === 'left') {
			if ((sliderRight || sliderHandle) && (angle > 150 || angle < -150)) {
				if (!sliderRight && sliderLeft && sliderTranslateX === 0) {//仅有左侧按钮时不允许左拖
					return;
				}
				if (sliderHandle && !sliderRight && !sliderLeft && sliderTranslateX === 0) {//抽屉式已展开，不允许左拖
					return;
				}
				isDraging = true;
			}
		} else if (direction === 'right') {
			if ((sliderLeft || sliderHandle) && angle > -30 && angle < 30) {
				if (!sliderLeft && sliderRight && sliderTranslateX === 0) {//仅有右侧按钮时不允许右拖
					return;
				}
				if (sliderHandle && !sliderRight && !sliderLeft && sliderTranslateX === sliderHandleWidth) {//抽屉式已关闭，不允许右拖
					return;
				}
				isDraging = true;
			}
		}
	});
	window.addEventListener('drag', function(event) {
		if (isDraging) {
			if (!sliderRequestAnimationFrame) {
				updateTranslate();
			}
			translateX = event.detail.deltaX * factor;
			event.detail.gesture.preventDefault();
		}
	});

	window.addEventListener('dragend', function(event) {
		if (isDraging) {
			endDraging(false, event.detail);
		}
	});
	window.addEventListener('swiperight', function(event) {
		if (sliderHandle) {
			var isSwipeable = false;
			if (sliderLeft && !sliderLeft.classList.contains(CLASS_BOUNCE) && sliderTranslateX === 0) {
				//left show
				toggleSliderLeftAction(true, true);
				isSwipeable = true;
			} else if (sliderRight && sliderTranslateX < 0) {
				//right hide
				toggleSliderRightAction(false, false);
				isSwipeable = true;
			} else if (!sliderLeft && !sliderRight) {
				isSwipeable = true;
			}
			if (isSwipeable) {
				$.gestures.stoped = true;
				event.stopImmediatePropagation();
				endDraging(true, event.detail);
			}
		}
	});
	window.addEventListener('swipeleft', function(event) {
		if (sliderHandle) {
			var isSwipeable = false;
			if (sliderRight && !sliderRight.classList.contains(CLASS_BOUNCE) && sliderTranslateX === 0) {
				//right show
				toggleSliderRightAction(true, true);
				isSwipeable = true;
			} else if (sliderLeft && sliderTranslateX > 0) {
				//left hide
				toggleSliderLeftAction(false, false);
				isSwipeable = true;
			} else if (!sliderLeft && !sliderRight) {
				isSwipeable = true;
			}
			if (isSwipeable) {
				$.gestures.stoped = true;
				event.stopImmediatePropagation();
				endDraging(true, event.detail);
			}
		}
	});
	window.addEventListener('touchend', function(event) {//使用touchend来取消高亮，避免一次点击既不触发tap，doubletap，longtap的事件
		if (!cell) {
			return;
		}
		toggleActive(false);
	});
	window.addEventListener('touchcancel', function(event) {//使用touchcancel来取消高亮，避免一次点击既不触发tap，doubletap，longtap的事件
		if (!cell) {
			return;
		}
		toggleActive(false);
	});
	window.addEventListener('tap', function(event) {
		if (!cell) {
			return;
		}
		var isExpand = false;
		if (cell.classList.contains('mui-collapse')) {
			if (!cell.classList.contains(CLASS_ACTIVE)) {//展开时,需要收缩其他同类
				var collapse = cell.parentNode.querySelector('.mui-collapse.mui-active');
				if (collapse) {
					collapse.classList.remove(CLASS_ACTIVE);
				}
				isExpand = true;
			}
			cell.classList.toggle(CLASS_ACTIVE);
			if (isExpand) {
				//触发展开事件
				$.trigger(cell, 'expand');
				//scroll
				//暂不滚动
				// var offsetTop = $.offset(cell).top;
				// var scrollTop = document.body.scrollTop;
				// var height = window.innerHeight;
				// var offsetHeight = cell.offsetHeight;
				// var cellHeight = (offsetTop - scrollTop + offsetHeight);
				// if (offsetHeight > height) {
				// 	$.scrollTo(offsetTop, 300);
				// } else if (cellHeight > height) {
				// 	$.scrollTo(cellHeight - height + scrollTop, 300);
				// }
			}
		}
	});
})(mui, window, document);

/**
 * Input(TODO resize)
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, document, undefined) {
	var CLASS_ICON = 'mui-icon';
	var CLASS_ICON_CLEAR = 'mui-icon-clear';
	var CLASS_ICON_SPEECH = 'mui-icon-speech';
	var CLASS_ICON_SEARCH = 'mui-icon-search';
	var CLASS_INPUT_ROW = 'mui-input-row';
	var CLASS_PLACEHOLDER = 'mui-placeholder';
	var CLASS_TOOLTIP = 'mui-tooltip';
	var CLASS_HIDDEN = 'mui-hidden';
	var SELECTOR_ICON_CLOSE = '.' + CLASS_ICON_CLEAR;
	var SELECTOR_ICON_SPEECH = '.' + CLASS_ICON_SPEECH;
	var SELECTOR_PLACEHOLDER = '.' + CLASS_PLACEHOLDER;
	var SELECTOR_TOOLTIP = '.' + CLASS_TOOLTIP;

	var findRow = function(target) {
		for (; target && target !== document; target = target.parentNode) {
			if (target.classList && target.classList.contains(CLASS_INPUT_ROW)) {
				return target;
			}
		}
		return null;
	}
	var Input = function(element, options) {
		this.element = element;
		this.options = options || {
			actions : 'clear'
		};
		if (~this.options.actions.indexOf('slider')) {//slider
			this.sliderActionClass = CLASS_TOOLTIP + ' ' + CLASS_HIDDEN;
			this.sliderActionSelector = SELECTOR_TOOLTIP;
		} else {//clear,speech,search
			if (~this.options.actions.indexOf('clear')) {
				this.clearActionClass = CLASS_ICON + ' ' + CLASS_ICON_CLEAR + (element.value ? '' : (' ' + CLASS_HIDDEN));
				this.clearActionSelector = SELECTOR_ICON_CLOSE;
			}
			if (~this.options.actions.indexOf('speech')) {//only for 5+
				this.speechActionClass = CLASS_ICON + ' ' + CLASS_ICON_SPEECH;
				this.speechActionSelector = SELECTOR_ICON_SPEECH;
			}
			if (~this.options.actions.indexOf('search')) {
				this.searchActionClass = CLASS_PLACEHOLDER;
				this.searchActionSelector = SELECTOR_PLACEHOLDER;
			}
		}
		this.init();
	};
	Input.prototype.init = function() {
		this.initAction();
		this.initElementEvent();
	};
	Input.prototype.initAction = function() {
		var self = this;

		var row = self.element.parentNode;
		if (row) {
			if (self.sliderActionClass) {
				self.sliderAction = self.createAction(row, self.sliderActionClass, self.sliderActionSelector);
			} else {
				if (self.searchActionClass) {
					self.searchAction = self.createAction(row, self.searchActionClass, self.searchActionSelector);
					self.searchAction.addEventListener('tap', function() {
						setTimeout(function() {
							self.element.focus();
						}, 0);
					});
				}
				if (self.speechActionClass) {
					self.speechAction = self.createAction(row, self.speechActionClass, self.speechActionSelector);
					self.speechAction.addEventListener('click', function(event) {
						event.stopPropagation();
					});
					self.speechAction.addEventListener('tap', function(event) {
						self.speechActionClick(event);
					});
				}
				if (self.clearActionClass) {
					self.clearAction = self.createAction(row, self.clearActionClass, self.clearActionSelector);
					self.clearAction.addEventListener('tap', function(event) {
						self.clearActionClick(event);
					});

				}
			}
		}
	};
	Input.prototype.createAction = function(row, actionClass, actionSelector) {
		var action = row.querySelector(actionSelector);
		if (!action) {
			var action = document.createElement('span');
			action.className = actionClass;
			if (actionClass === this.searchActionClass) {
				action.innerHTML = '<span class="' + CLASS_ICON + ' ' + CLASS_ICON_SEARCH + '"></span>' + this.element.getAttribute('placeholder');
				this.element.setAttribute('placeholder', '');
			}
			row.insertBefore(action, this.element.nextSibling);
		}
		return action;
	};
	Input.prototype.initElementEvent = function() {
		var element = this.element;

		if (this.sliderActionClass) {
			var tooltip = this.sliderAction;
			//TODO resize
			var offsetLeft = element.offsetLeft;
			var width = element.offsetWidth - 28;
			var tooltipWidth = tooltip.offsetWidth;
			var distince = Math.abs(element.max - element.min);

			var timer = null;
			var showTip = function() {
				tooltip.classList.remove(CLASS_HIDDEN);
				tooltipWidth = tooltipWidth || tooltip.offsetWidth;
				var scaleWidth = Math.abs(element.value) / distince * width;
				tooltip.style.left = (14 + offsetLeft + scaleWidth - tooltipWidth / 2) + 'px';
				tooltip.innerText = element.value;
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout(function() {
					tooltip.classList.add(CLASS_HIDDEN);
				}, 1000);
			};
			element.addEventListener('input', showTip);
			element.addEventListener('tap', showTip);
		} else {
			if (this.clearActionClass) {
				var action = this.clearAction;
				if (!action) {
					return;
				}
				$.each(['keyup', 'change', 'input', 'focus', 'blur', 'cut', 'paste'], function(index, type) {
					(function(type) {
						element.addEventListener(type, function() {
							action.classList[element.value.trim() ? 'remove' : 'add'](CLASS_HIDDEN);
						});
					})(type);
				});
			}
			if (this.searchActionClass) {
				element.addEventListener('focus', function() {
					element.parentNode.classList.add('mui-active');
				});
				element.addEventListener('blur', function() {
					if (!element.value.trim()) {
						element.parentNode.classList.remove('mui-active');
					}
				});
			}
		}
	};
	Input.prototype.clearActionClick = function(event) {
		this.element.value = '';
		this.element.focus();
		this.clearAction.classList.add(CLASS_HIDDEN);
		event.preventDefault();
	};
	Input.prototype.speechActionClick = function(event) {
		if (window.plus) {
			var self = this;
			self.element.value = '';
			plus.speech.startRecognize({
				engine : 'iFly'
			}, function(s) {
				self.element.value += s;
				setTimeout(function() {
					self.element.focus();
				}, 0);
				plus.speech.stopRecognize();
			}, function(e) {
			});
		} else {
			alert('only for 5+');
		}
		event.preventDefault();
	};
	$.fn.input = function(options) {
		this.each(function() {
			var actions = [];
			var row = findRow(this.parentNode);
			if (this.type === 'range' && row.classList.contains('mui-input-range')) {
				actions.push('slider');
			} else {
				var classList = this.classList;
				if (classList.contains('mui-input-clear')) {
					actions.push('clear');
				}
				if (classList.contains('mui-input-speech')) {
					actions.push('speech');
				}
				if (this.type === 'search' && row.classList.contains('mui-search')) {
					actions.push('search');
				}
			}
			var id = this.getAttribute('data-input-' + actions[0]);
			if (!id) {
				id = ++$.uuid;
				$.data[id] = new Input(this, {
					actions : actions.join(',')
				});
				for (var i = 0, len = actions.length; i < len; i++) {
					this.setAttribute('data-input-' + actions[i], id);
				}
			}

		});
	};
})(mui, window, document);

/**
 * mui back
 * @param {type} $
 * @param {type} window
 * @returns {undefined}
 */
(function($, window) {
	/**
	 * 后退
	 */
	$.back = function() {
		if (window.history.length > 1) {
			if ( typeof $.options.back === 'function') {
				if ($.options.back() !== false) {
					window.history.back();
				}
			} else {
				window.history.back();
			}
		}
	};
	window.addEventListener('tap', function(e) {
		var action = $.targets.action;
		if (action && action.classList.contains('mui-action-back')) {
			$.back();
		}
	});
	window.addEventListener('swiperight', function(e) {
		var detail = e.detail;
		if (detail.angle > -15 && detail.angle < 15 && $.options.swipeBack === true) {
			$.back();
		}
	});

})(mui, window);

/**
 * mui back 5+
 * @param {type} $
 * @param {type} window
 * @returns {undefined}
 */
(function($, window) {
	/**
	 * 后退(5+关闭当前窗口)
	 */
	$.back = function() {
		var isBack = true;
		var callback = false;
		if ( typeof $.options.back === 'function') {
			callback = $.options.back();
			if (callback === false) {
				isBack = false;
			}
		}
		if (!isBack) {
			return;
		}
		if (window.plus) {
			var wobj = plus.webview.currentWebview();
			var parent = wobj.parent();
			wobj.canBack(function(e) {
				if (e.canBack) {//webview history back
					window.history.back();
				} else {//webview close or hide
					//TODO 会不会存在多层嵌套?如果存在需要递归找到最顶层
					if (parent) {
						wobj = parent;
					}
					var opener = wobj.opener();
					if (opener) {
						var openerParent = opener.parent();
						if (openerParent) {
							opener = openerParent;
						}
						if (wobj.preload) {
							wobj.hide("auto");
						} else {
							wobj.close();
						}
						//TODO 暂时屏蔽父窗口的隐藏与显示，与预加载一起使用时太多bug
						//opener.show();
					} else {
						//首页不存在opener的情况下，后退实际上应该是退出应用；
						plus.runtime.quit();
					}
				}
			});

		} else if (window.history.length > 1) {
			window.history.back();
		} else {
			window.close();
		}
	};

	$.menu = function() {
		var menu = document.querySelector('.mui-action-menu');
		if (menu) {
			$.trigger(menu, 'tap');
		} else {//执行父窗口的menu
			if (window.plus) {
				var wobj = plus.webview.currentWebview();
				var parent = wobj.parent();
				if (parent) {//又得evalJS
					parent.evalJS('mui&&mui.menu();');
				}
			}
		}
	}

	$.plusReady(function() {
		plus.key.addEventListener('backbutton', function() {
			$.back();
		}, false);

		plus.key.addEventListener('menubutton', function() {
			$.menu();
		}, false);

	});

})(mui, window);
