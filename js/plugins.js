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
	var CLASS_ICON_PULLDOWN = 'mui-icon-pulldown';
	var CLASS_SPIN = 'mui-spin';

	var CLASS_IN = 'mui-in';
	var CLASS_REVERSE = 'mui-reverse';

	var CLASS_HIDDEN = 'mui-hidden';

	var CLASS_LOADING_UP = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_PULLDOWN + ' ' + CLASS_REVERSE;
	var CLASS_LOADING_DOWN = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_PULLDOWN;
	var CLASS_LOADING = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_SPINNER + ' ' + CLASS_SPIN;
	var defaultOptions = {
		down: {
			height: 50,
			contentdown: '下拉可以刷新',
			contentover: '释放立即刷新',
			contentrefresh: '正在刷新...'
		},
		up: {
			height: 50,
			contentdown: '上拉显示更多',
			contentover: '释放立即刷新',
			contentrefresh: '正在刷新...',
			duration: 300
		}
	};
	var html = ['<div class="' + CLASS_PULL + '">', '<div class="' + CLASS_LOADING_DOWN + '"></div>', '<div class="' + CLASS_PULL_CAPTION + '">', '<span class="' + CLASS_PULL_CAPTION_DOWN + ' ' + CLASS_IN + '">{downCaption}</span>', '<span class="' + CLASS_PULL_CAPTION_OVER + '">{overCaption}</span>', '<span class="' + CLASS_PULL_CAPTION_REFRESH + '">{refreshCaption}</span>', '</div>', '</div>'];

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
			this.element.style.webkitTransitionDuration = '0s';
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
		self.loading = self.bottomPocket.querySelector('.' + CLASS_PULL_LOADING);
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
		self.loading = self.topPocket.querySelector('.' + CLASS_PULL_LOADING);
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
				self.load();
			} else {
				this.hide();
			}
			$.gestures.stoped = true;
		}

	};
	PullRefresh.prototype.hide = function() {
		this.translateY = 0;
		if (this.requestAnimationFrame) {
			cancelAnimationFrame(this.requestAnimationFrame);
			this.requestAnimationFrame = null;
		}
		this.element.style.webkitTransitionDuration = '0.5s';
		this.setTranslate(0);
		this.setCaption(CLASS_PULL_CAPTION_DOWN);
		if (this.pullOptions.height > 0) {
			this.loading.classList.remove(CLASS_REVERSE);
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
			if (height < 0) { //up
				this.bottomPocket.style.bottom = (height > this.pullOptions.height ? height : this.pullOptions.height) + 'px';
			} else if (height === 0) {
				//this.bottomPocket.removeAttribute('style');//靠，为啥5+里边remove不掉呢
				this.bottomPocket.setAttribute('style', '');
			}
		}
	};

	PullRefresh.prototype.load = function() {
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

	};
	PullRefresh.prototype.hideLoading = function(className) {
		this.setCaption(className);
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
			if (this.pullOptions && this.pullOptions.height > 0) {
				if (className === CLASS_PULL_CAPTION_REFRESH) {
					this.loading.className = CLASS_LOADING;
				} else if (className === CLASS_PULL_CAPTION_OVER) {
					this.loading.className = CLASS_LOADING_UP;
				} else {
					this.loading.className = CLASS_LOADING_DOWN;
				}
			} else {
				this.loading.className = CLASS_LOADING;
			}
		}
	};

	$.fn.pullRefresh = function(options) {
		this.each(function() {
			var pullrefresh = this.getAttribute('data-pullrefresh');
			if (!pullrefresh) {
				var id = ++$.uuid;alert(id);
				$.data[id] = new PullRefresh(this, options);
				this.setAttribute('data-pullrefresh', id);
			}
		});
	};
})(mui, window, document);