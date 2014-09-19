(function ($, window, undefined) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function Drawer(config) {
        return this._init(config);
    }
    Drawer.prototype = {
        constructor: Drawer,
        _init: function (config) {
            var me = this;
            me._config = $.extend({
                dir: "right",
                transition: "-webkit-transform .4s ease-in-out"
            }, config);
            me._cacheParam()._bindEventListener();
            return me;
        },
        _cacheParam: function () {
            var me = this,
                config = me._config;
            for (var i in config) {
                if (hasOwnProperty.call(config, i)){
                    me["_" + i] = config[i];
                    config[i] = null;
                    config[i];
                    }
                }
                return me;
            },
            _bindEventListener: function () {
                var me = this,
                    $nav = me._nav,
                    $main = me._main,
                    $container = me._container,
                    direction = me._dir,
                    position = {
                        x: 0, y: 0
                    },
                    navWidth = $nav.width(),
                    transition = me._transition;
                $nav.attr("data-" + direction,"0");
                $container.on("touchstart", function (e) {
                    var target = e.touches.item(0);
                    $main.css("-webkit-transition","none");
                    position.x = target.clientX;
                    position.y = target.clientY;
                    return false;
                }).on("touchmove", function (e) {
                    var target = e.touches.item(0),
                        different = target.clientX - position.x,
                        distant = parseInt($main.attr("data-" + direction) || 0, 10);
                    //滑动间隔太短，则不处理惩罚
                    if (Math.abs(different) >= 50) {
                        distant += different;
                        if (direction === "right") {
                            //左侧菜单栏
                            if (distant <= 0) {
                                distant = 0;
                            }
                            if (distant >= navWidth) {
                                distant = navWidth;
                            }
                        } else {
                            //右侧菜单栏
                            if (distant >= 0) {
                                distant = 0;
                            }
                            if (distant <= -navWidth) {
                                distant = -navWidth;
                            }
                        }
                        $main.attr("data-" + direction,distant)
                        .css("-webkit-transform","translate("+distant+"px,0)");
                    }
                    return false;
                }).on("touchend", function (e) {
                    var distant = parseInt($main.attr("data-" + direction), 10);
                    if (direction === "right") {
                        distant = distant > navWidth / 2 ? navWidth : 0;
                    } else {
                        distant = distant > -navWidth / 2 ? 0 : -navWidth;
                    }
                    $main.css({
                        "-webkit-transform":"translate(" + distant + "px,0)",
                        "-webkit-transition":transition
                    }).attr("data-" + direction,distant);
                    return false;
                });
                return me;
                }
            };
            window.Drawer = Drawer;
        })(Zepto, this);