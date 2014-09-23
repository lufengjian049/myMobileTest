// extend
;(function($, window){
   $.trigger = function(element, eventType, eventData) {
      element.dispatchEvent(new CustomEvent(eventType, {
        detail : eventData,
        bubbles : true,
        cancelable : true
      }));
      return this;
    };
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
  $.fn.inputinit=function(){
    this.each(function(){
      var classList=this.classList,_this=$(this),parentnode=_this.parent();
      if(classList.contains("mui-input-clear")){
        var cspanel=$("<span class='mui-icon mui-icon-clear mui-hidden'></span>");
        parentnode.append(cspanel);
        _this.on("keyup",function(){
          if(_this.val()){
            cspanel.removeClass("mui-hidden");
          }else{
            cspanel.addClass("mui-hidden");
          }
        });
        cspanel.on("tap",function(){
          _this.val("");
          $(this).addClass("mui-hidden");
        })
      }
    })
    return this;
  }
  $.mypost=function(url,async,data,callback,errorback){
    // 同步为 false
    errorback=errorback|| function(){alert("请求出错！")};
    $.ajax({
      type:"POST",
      url:url,
      async:async,
      dataType:"json",
      data:data,
      success:callback,
      error:errorback 
    });
  } 
})(Zepto, window)
;(function($, window) {
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
      target: event.target,
      lastTarget: (touch.lastTarget ? touch.lastTarget : null),
      startTime: Date.now(),
      touchTime: 0,
      lastTapTime: (touch.lastTapTime ? touch.lastTapTime : 0),
      start: {
        x: event.touches[0].pageX,
        y: event.touches[0].pageY
      },
      move: {
        x: 0,
        y: 0
      },
      deltaX: 0,
      deltaY: 0,
      lastDeltaX: 0,
      lastDeltaY: 0,
      angle: '',
      direction: '',
      distance: 0,
      drag: false,
      swipe: false,
      gesture: event
    };

    detect(event, touch);
  };
  var detectTouchMove = function(event) {
    if ($.gestures.stoped) {
      return;
    }
    touch.touchTime = Date.now() - touch.startTime;
    touch.move = {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY
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
   * delegate events
   */
  // $.fn.on = function(event, selector, callback) {
  //   this.each(function() {
  //     var element = this;
  //     element.addEventListener(event, function(e) {
  //       var delegates = $.qsa(selector, element);
  //       var target = e.target;
  //       if (delegates && delegates.length > 0) {
  //         for (; target && target !== document; target = target.parentNode) {
  //           if (target === element) {
  //             break;
  //           }
  //           if (target && ~delegates.indexOf(target)) {
  //             if (!e.detail) {
  //               e.detail = {
  //                 currentTarget: target
  //               };
  //             } else {
  //               e.detail.currentTarget = target;
  //             }
  //             callback.call(target, e);
  //           }
  //         }
  //       }
  //     });
  //     ////避免多次on的时候重复绑定
  //     element.removeEventListener($.EVENT_CLICK, preventDefault);
  //     //click event preventDefault
  //     element.addEventListener($.EVENT_CLICK, preventDefault);
  //   });
  // };
  var preventDefault = function(e) {
    if (e.target && e.target.tagName !== 'INPUT') {
      e.preventDefault();
    }
  }
})(Zepto, window)
//drag event
;(function($, name) {
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
})(Zepto, 'drag')
;(function($){
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
  var html = ['<div class="' + CLASS_PULL + '">', '<div class="' + CLASS_LOADING_DOWN + '"></div>',
   '<div class="' + CLASS_PULL_CAPTION + '">', '<span class="' + CLASS_PULL_CAPTION_DOWN + ' ' + CLASS_IN + '">{downCaption}</span>', '<span class="' + CLASS_PULL_CAPTION_OVER + '">{overCaption}</span>', '<span class="' + CLASS_PULL_CAPTION_REFRESH + '">{refreshCaption}</span>', '</div>', '</div>'];

  var PullRefresh = function(element, options) {
    this.element = element;
    this.options = $.extend(true,defaultOptions, options);
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
        self.isLoading = false;
        // var duration = Math.min(1000, self.pullOptions.duration);
        // setTimeout(function() {
        //   $.scrollTo(document.body.scrollHeight - window.innerHeight, duration, function() {
        //     self.isLoading = false;
        //     //self.bottomPocket.classList.remove(CLASS_HIDDEN);
        //   });
        // }, 100);
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
        var id = ++$.uuid;
       // $.data[id] = new PullRefresh(this, options);
        new PullRefresh(this, options);
        this.setAttribute('data-pullrefresh', id);
      }
    });
  };
})(Zepto)