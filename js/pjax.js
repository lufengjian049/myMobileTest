/*!
 * pjax(ajax + history.pushState) for zepto
 * 
 * by lu
 */
(function($) {
	var Util = {
		support : {
//			&& !navigator.userAgent.match(/(iPod|iPhone|iPad|WebApps\/.+CFNetwork)/)
			pjax : window.history && window.history.pushState && window.history.replaceState,
			storage : !!window.localStorage
		},
		toInt : function(obj) {
			return parseInt(obj);
		},
		stack : {},
		getTime : function() {
			return new Date * 1;
		},
		// 获取URL不带hash的部分,切去掉pjax=true部分
		getRealUrl : function(url) {
			url = (url || '').replace(/\#.*?$/, '');
			url = url.replace('?pjax=true&', '?').replace('?pjax=true', '').replace('&pjax=true', '');
			return url;
		},
		geturlname:function(url){
			url=url.substr(url.lastIndexOf("/")+1);
			return Util.getRealUrl(url);
		},
		// 获取url的hash部分
		getUrlHash : function(url) {
			return url.replace(/^[^\#]*(?:\#(.*?))?$/, '$1');
		},
		// 获取本地存储的key
		getLocalKey : function(src) {
			var s = 'pjax_' + encodeURIComponent(src);
			return {
				data : s + '_data',
				time : s + '_time',
				title : s + '_title'
			};
		},
		// 清除所有的cache
		removeAllCache : function() {
			if (!Util.support.storage)
				return;
			for ( var name in localStorage) {
				if ((name.split('_') || [ '' ])[0] === 'pjax') {
					delete localStorage[name];
				}
			}
		},
		// 获取cache
		getCache : function(src, time, flag) {
			var item, vkey, tkey, tval;
			time = Util.toInt(time);
			if (src in Util.stack) {
				item = Util.stack[src], ctime = Util.getTime();
				if ((item.time + time * 1000) > ctime) {
					return item;
				} else {
					delete Util.stack[src];
				}
			} else if (flag && Util.support.storage) { // 从localStorage里查询
				var l = Util.getLocalKey(src);
				vkey = l.data;
				tkey = l.time;
				item = localStorage.getItem(vkey);
				if (item) {
					tval = Util.toInt(localStorage.getItem(tkey));
					if ((tval + time * 1000) > Util.getTime()) {
						return {
							data : item,
							title : localStorage.getItem(l.title)
						};
					} else {
						localStorage.removeItem(vkey);
						localStorage.removeItem(tkey);
						localStorage.removeItem(l.title);
					}
				}
			}
			return null;
		},
		// 设置cache
		setCache : function(src, data, title, flag) {
			var time = Util.getTime(), key;
			Util.stack[src] = {
				data : data,
				title : title,
				time : time
			};
			if (flag && Util.support.storage) {
				Util.removeCache(src);
				key = Util.getLocalKey(src);
				localStorage.setItem(key.data, data);
				localStorage.setItem(key.time, time);
				localStorage.setItem(key.title, title);
			}
		},
		// 清除cache
		removeCache : function(src) {
			src = Util.getRealUrl(src || location.href);
			delete Util.stack[src];
			if (Util.support.storage) {
				var key = Util.getLocalKey(src);
				localStorage.removeItem(key.data);
				localStorage.removeItem(key.time);
				localStorage.removeItem(key.title);
			}
		}
	};
	// pjax
	var pjax = function(options) {
		// options = $.extend({
		// 	selector : '',
		// 	container : '#container',
		// 	callback : function() {},
		// 	filter : function() {}
		// }, options);
		options = $.extend(true,{}, pjax.defaultOptions, options);
		if (!options.container || !options.selector) {
			throw new Error('selector & container options must be set');
		}
		$('body').off('tap',options.selector);	
		$('body').on('tap',options.selector, function(event) {
			if (event.which > 1 || event.metaKey) {
				return true;
			}
			$(".i-loading").show();
			if(typeof options.sethref === 'function'){
				if(options.sethref(this)){  //返回 true 表示 不执行下面逻辑
					return true;
				}
			}
			var $this = $(this), href = $this.attr('href');
			if (!href) return ; 
			// 过滤
			if (typeof options.filter === 'function') {
				if (options.filter.call(this, href, this) === true){
					return true;
				}
			}
			if (href === location.href) {
				return true;
			}
			if($this.closest("#offCanvas").length > 0){
				$("#extenddivmenu").trigger("tap");
			}
			// 只是hash不同
			if (Util.getRealUrl(href) == Util.getRealUrl(location.href)) {
				var hash = Util.getUrlHash(href);
				if (hash) {
					location.hash = hash;
					options.callback && options.callback.call(this, {
						type : 'hash'
					});
				}
				return true;
			}
			event.preventDefault();
			options = $.extend(true, options, {
				url : href,
				element : this,
				push: true
			});
			// 发起请求
			pjax.request(options);
		});
		//alert("init");
		if(!options.init) return;
		var curhref=Util.geturlname(location.href),maintitle=$(options.title).html();
		var initstate = {
			container : options.container,  
			timeout : options.timeout,
			cache : options.cache,
			storage : options.storage,
			show : options.show,
			title : maintitle,
			url : curhref
		};
		history.pushState(initstate,maintitle,curhref);
		// Util.setCache(curhref,$(options.container).html(), maintitle,options.storage);
	};
	pjax.xhr = null;
	pjax.options = {};
	pjax.state = {};
	
	// 默认选项
	pjax.defaultOptions = {
		timeout : 2000,
		element : null,
		offCanvas:false, //
		container:"#container",
		cache : 24 * 3600, // 缓存时间, 0为不缓存, 单位为秒
		storage : true, // 是否使用localstorage将数据保存到本地
		url : '', // 链接地址
		push : true, // true is push, false is replace, null for do nothing
		show : 'fade', // 展示的动画
		title : '#maintitle', // 标题
		titleSuffix : '',// 标题后缀
		type : 'GET',
		data : {
			pjax : true
		},
		dataType : 'html',
		callback : null, // 回调函数
		// for jquery
		beforeSend : function(xhr) {
			$(pjax.options.container).trigger('pjax.start', [ xhr, pjax.options ]);
			xhr && xhr.setRequestHeader('X-PJAX', true);
		},
		error : function() {
			pjax.options.callback && pjax.options.callback.call(pjax.options.element, {
				type : 'error'
			});
			location.href = pjax.options.url;
		},
		complete : function(xhr) {
			$(pjax.options.container).trigger('pjax.end', [ xhr, pjax.options ]);
		}
	};
	// 展现动画
	pjax.showFx = {
		"_default" : function(data, callback, isCached) {
			this.html(data);
			callback && callback.call(this, data, isCached);
		},
		fade: function(data, callback, isCached,offcanvas){
			var $this = this;
			// if(isCached){
			// 	$this.html(data);
			// 	callback && callback.call($this, data, isCached);
			// }else{
			$this.html(data);
			callback && callback.call($this, data, isCached);
			// this.fadeOut(200, function(){
			// 	$this.html(data).fadeIn(200, function(){
			// 		callback && callback.call($this, data, isCached);
			// 	});
			// });
			// }
		}
	}
	// 展现函数
	pjax.showFn = function(offcanvas,showType, container, data, fn, isCached) {
		var fx = null;
		if (typeof showType === 'function') {
			fx = showType;
		} else {
			if (!(showType in pjax.showFx)) {
				showType = "_default";
			}
			fx = pjax.showFx[showType];
		}
		fx && fx.call(container, data, function() {
			var hash = location.hash;
			if (hash != '') {
				location.href = hash;
				//for FF
				if(/Firefox/.test(navigator.userAgent)){
					history.replaceState($.extend({}, pjax.state, {
						url : null
					}), document.title);
				}
			} else {
				window.scrollTo(0, 0);
			}
			fn && fn.call(this, data, isCached);
		}, isCached,offcanvas);
	}
	// success callback
	pjax.success = function(data, isCached) {
		// isCached default is success
		if (isCached !== true) {
			isCached = false;
		}else{
			if(pjax.options.titlehtml =="Commit &amp; Sell out管理"){
				$(pjax.options.title).prev().data("backtop","1");
				var flag3={flag:true};
				window.location="objc://setmainflag/"+JSON.stringify(flag3);
			}else{
				$(pjax.options.title).prev().data("backtop","0");
			}
			if(location.href.indexOf("viewdetail") > 0){
				$("#extenddivmenu").show();
			}else
				$("#extenddivmenu").hide();
			$(pjax.options.title).html(pjax.options.titlehtml);
			pjax.options.showFn && pjax.options.showFn(data, function() {
				pjax.options.callback && pjax.options.callback.call(pjax.options.element,{
					type : isCached? 'cache' : 'success'
				});
				if(flag3 && opobj.btnop){
					reloadmaindata();
				}
			}, isCached);
			$(".i-loading").hide();
			return;
		}
		//accept Whole html
		//pjax.html="#detaildiv";
		if (pjax.html) {
			data = $(data).filter(pjax.html).html();
		}
		if (data && $(data).indexOf('<html') != -1) {
			pjax.options.callback && pjax.options.callback.call(pjax.options.element, {
				type : 'error'
			});
			location.href = pjax.options.url;
			return false;
		}
		// var title = pjax.options.title || "", el;
		// if (pjax.options.element) {
		// 	el = $(pjax.options.element);
		// 	title = el.attr('title') || el.text();
		// }
		// var matches = data.match(/<title>(.*?)<\/title>/);
		// if (matches) {
		// 	title = matches[1];
		// }
		//pushstate yuan weizhi
		
		pjax.state = {
			container : pjax.options.container,
			timeout : pjax.options.timeout,
			cache : pjax.options.cache,
			storage : pjax.options.storage,
			show : pjax.options.show,
			title : title,
			url : pjax.options.url
		};
		if (pjax.options.push) {
			// if (!pjax.active) {
			// 	history.replaceState($.extend({}, pjax.state, {
			// 		url : null
			// 	}), document.title);
			// 	pjax.active = true;
			// }
			if($(pjax.options.element).hasClass("kom-entry") && !$(pjax.options.element).closest(".slidemenu").length)
				history.pushState(pjax.state, document.title, pjax.options.url);
			else{
				if($(pjax.options.element).closest(".slidemenu").length)
					history.replaceState(pjax.state, document.title, pjax.options.url);
			}
			if(!$(pjax.options.element).hasClass("kom-entry"))
				history.pushState(pjax.state, document.title, pjax.options.url);
		} else if (pjax.options.push === false) {
			history.replaceState(pjax.state, document.title, pjax.options.url);
		}
		var title=getUrlParams(decodeURIComponent(pjax.options.url),"title");
		if(title && pjax.options.titleSuffix){
			if($(title).indexOf(pjax.options.titleSuffix) == -1){
				title = pjax.options.titleSuffix + title;
			}
		}
		var curheadtitleobj=$(pjax.options.title);
		if(title =="Commit & Sell out管理"){
			curheadtitleobj.prev().data("backtop","1");
		}else{
			curheadtitleobj.prev().data("backtop","0");
			var flag2={flag:false};
			window.location="objc://setmainflag/"+JSON.stringify(flag2);
		}
		if(location.href.indexOf("viewdetail") > 0){
				$("#extenddivmenu").show();
			}else
				$("#extenddivmenu").hide();
		curheadtitleobj.html(title);
		// var query = $.param(pjax.options.data);
		// if (query != "") {
		// 	pjax.state.url = pjax.options.url + (/\?/.test(pjax.options.url) ? "&" : "?") + query;
		// }
		
		// 设置cache  && !isCached
		// if (pjax.options.cache) {
		// 	Util.setCache(pjax.options.url, data, title, pjax.options.storage);
		// }
		pjax.options.showFn && pjax.options.showFn(data, function() {
			pjax.options.callback && pjax.options.callback.call(pjax.options.element,{
				type : isCached? 'cache' : 'success'
			});
		}, isCached);
	};
	
	// 发送请求
	pjax.request = function(options,op) {
		options = $.extend(true,{}, pjax.defaultOptions, options);
		var cache, container = $(options.container);
		options.oldUrl = Util.geturlname(location.href);
		options.url = Util.getRealUrl(options.url);
		if($(options.element).length){
			cache = Util.toInt($(options.element).attr('data-pjax-cache'));
			if (cache) {
				options.cache = cache;
			}
		}
		if (options.cache === true) {
			options.cache = 24 * 3600;
		}
		options.cache = Util.toInt(options.cache);
		// 如果将缓存时间设为0，则将之前的缓存也清除
		if (options.cache === 0) {
			Util.removeAllCache();
		}
		// 展现函数
		if (!options.showFn) {
			options.showFn = function(data, fn, isCached) {
				pjax.showFn(options.offCanvas,options.show, $(options.container), data, fn, isCached);
			};
		}
		pjax.options = options;
		pjax.options.success = pjax.success;
		if (op && options.cache && (cache = Util.getCache(options.url, options.cache, options.storage))) {
			options.beforeSend();
			options.titlehtml = cache.title;
			pjax.success(cache.data, true);
			options.complete();
			return true;
		}
		if (pjax.xhr && pjax.xhr.readyState < 4) {
			pjax.xhr.onreadystatechange = $.noop;
			pjax.xhr.abort();
		}
		// if(op =="init"){
		// 	pjax.state = {
		// 		container : "#container",    ////////////////////////////////////////////////////////
		// 		timeout : pjax.options.timeout,
		// 		cache : pjax.options.cache,
		// 		storage : pjax.options.storage,
		// 		show : pjax.options.show,
		// 		title : document.title,
		// 		url : pjax.options.oldUrl
		// 	};
		// 	history.pushState(pjax.state, document.title, pjax.options.oldUrl);
		// 	// Util.setCache(pjax.options.oldUrl, $(pjax.options.container).html(), title, pjax.options.storage);
		// }else{
		if (pjax.options.cache) {
			//Util.setCache(pjax.options.url, data, title, pjax.options.storage);
			var curhref=Util.geturlname(location.href),maintitle=$(options.title).html();
			Util.setCache(curhref,$(options.container).html(), maintitle,options.storage);
		}
		//pjax.options.url=pjax.options.url+"&ran="+Math.random();
		pjax.xhr = $.ajax(pjax.options);
		// }
	};

	// popstate event
	var popped = ('state' in window.history), initialURL = location.href;
	$(window).bind('popstate', function(event) {
		var initialPop = !popped && location.href == initialURL;
		popped = true;
		if (initialPop) return;
		var state = event.state;
		if (state && state.container) {
			if ($(state.container).length) {
				var data = {
					// 
					url : state.url,
					container : state.container,
					push : null,
					timeout : state.timeout,
					cache : state.cache,
					storage : state.storage,
					titlehtml: state.title,
					element: null,
					callback:function(){
						backfn();
					}
				};
				pjax.request(data,"back");
			} else {
				window.location = location.href;
			}
		}else{
			// pjax.request({},"init");
		}
	});

	// not support
	if (!Util.support.pjax) {
		pjax = function() {
			return true;
		};
		pjax.request = function(options) {
			if (options && options.url) {
				location.href = options.url;
			}
		};
	}
	// pjax bind to $
	$.pjax = pjax;
	$.pjax.util = Util;

	// extras
	// if ($.inArray('state', $.event.props) < 0) {
	// 	$.event.props.push('state')
	// }
	// if($($.event.props).indexOf("state")<0){
	// 	$.event.props.push('state');
	// }

})(Zepto);
