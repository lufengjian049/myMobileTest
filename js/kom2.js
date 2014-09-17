var db="";
$(function(){
	db=openDatabase("commitorderdb","1.0","commit&order data",1024*1024);
	db.transaction(function(tx){
		tx.executeSql("drop table costatustable");
	});
	//共用方法 && 自定义
  	$.back=function(){
  		//if (window.history.length > 1) {
		window.history.back();
		//}
  	}
	//data-dropdownlist
	$("div.mui-input-row").each(function(){
		var _this=$(this);
		if(_this.data("dropdownlist")){
			_this.find("input[type='text']").on("focus",function(){
				if(_this.next().is("ul")){
					_this.next().show();
				}else{
					createddllist(_this);
				}
			})
		}
	});
	// //添加jquery slideleft
	// $.fn.slideleftshow=function(speed,callback){
	// 	this.animate({
	// 		// paddingLeft : "show",marginLeft : "show",,paddingLeft : "show",marginLeft : "show"
	// 		paddingLeft:0
	// 	},speed,"linear",callback);
	// }
	// $.fn.slidelefthide=function(speed,callback){
	// 	this.animate({ 
	// 		// paddingRight : "hide",,marginRight : "hide",paddingLeft : "hide",marginLeft : "hide"
	// 		 width:"hide",opaticy:"hide"		
	// 		//left:parseInt(this.css('left'),10)==0 ? -this.outerWidth() : 0
	// 	},speed,callback);
	// }
	//kom-entry 块数据的加载与显示
	$.fn.initAjax=function(options){
		var _this=$(this);
		if(_this.data("initajax")){
			//添加 下拉刷新
			if(_this.data("pullload")){
				db.transaction(function(tx){
					tx.executeSql("drop table costatustable");
					console.log("delete table costatustable");
				});
				mui(".mui-content-padded").pullRefresh({
					down: {
		                callback: function(callback) {
		                    $.get("http://kom3.eisoo.com/kommobiletest/init2.json?callback=?",{},function(data){
		                    	callback();
		                    	options.callback(data);
		                    },"jsonp");
		                }
		            }
				});
			}
			//判断 本地数据库中是否存在数据
			db.transaction(function(tr){
				tr.executeSql("create table if not exists costatustable (costatus,statusobj)");
				console.log("create table costatustable");
				tr.executeSql("select * from costatustable",[],function(tx,rs){
					var rows=rs.rows,len=rows.length,data={};
					if(len){
						//alert("load data from local db!");
						for(var i=0;i<len;i++){
							var item=rows.item(i);
							(item.statusobj!= "undefined") && (data[item.costatus]=JSON.parse(item.statusobj));
						}
						options.callback(data,true);
					}else{
						$.ajax({url:"http://kom3.eisoo.com/kommobiletest/init.json?callback=?",async:false,dataType:"jsonp",jsonpCallback:"jsonp1",success:function(data){
							options.callback(data);
						}});
						
					}
				});
			});
			
		}
		return _this;
	}
	$.fn.initOsEvent=function(settings){
		if(!$(this).data("initosevent")) return;
		options={
			callback:function(subOptions){
				iosinitevent(subOptions)
			},
			method:$(this).data("methodname")
		};
		$.extend(options,settings);
		var subiops={cur:$(this),method:options.method,data:options.data};
		if (window.WebViewJavascriptBridge) {
			subiops.bridge=WebViewJavascriptBridge;
			options.callback(subiops);
		} else {
			document.addEventListener('WebViewJavascriptBridgeReady', function() {
				subiops.bridge=WebViewJavascriptBridge;
				options.callback(subiops);
			}, false)
		}
	}
	$("div.mui-content").initAjax({
		callback:function(data,nopjax){
			initentrydata(data,nopjax);
		}
	});
	$(".mui-action-backup").on("click",function(e){
		if($(this).data("backtop") =="1"){
			if(mui.os.ios){
				window.location="objc://goback";
			}else{
				
			}
		}else{
			$.back();
		}
		return false;
	});
	$(".mui-action-backup2").on("click",function(e){
		if($(this).data("backtop") == "1"){
			if(mui.os.ios){
				window.location="objc://goback";
			}else{
				
			}
		}else{
			$.back();
		}
		return false;
	});
});
function iosinitevent(options){
	alert(options.method);
	options.bridge.init(function(message, responseCallback) {
		//responseCallback(data);
	});
	options.cur.on("tap",function(e){
		e.preventDefault()
		options.bridge.callHandler(options.method,options.data, function(response) {
			
		})
	})
}
function getUrlParams(url,reparam){
	var params=url.substring(url.indexOf('?')+1),paramsarr=params.split('&');
	for(var ci=0;ci<paramsarr.length;ci++){
		if(paramsarr[ci].split('=')[0] == reparam){
			return paramsarr[ci].split('=')[1];
		}
	}
}
//创建下拉数据
function createddllist(curObj){
	var ulhtml="<ul class='ddllist'>";
	//请求获取数据
	for(var i=0;i<10;i++){
		ulhtml+="<li alt='"+i+"'>test"+(i+1)+"</li>"
	}
	ulhtml+="</ul>";
	curObj.after(ulhtml);
	initDdlEvent(curObj.next());
}
//注册ddl的选择数据事件
function initDdlEvent(ulobj){
	$("li",ulobj).on("click",function(){
  		var _this=$(this),inputs=_this.parent().prev().find("input");
  		inputs.eq(0).val(_this.attr("alt"));
  		inputs.eq(1).val(_this.html());
  		_this.parent().hide();
  	})
}
//加载列表数据
function loaddatalist(loadObj){
	var loadurl=loadObj.attr("loadurl"),formid=loadObj.attr("formid"),params="",itemTemp=$("#itemtemp").html();
	//发送请求 -获取数据
	var ulhtml="<ul class='mui-table-view'>";
	for(var i=0;i<10;i++){
		ulhtml +=itemTemp.replace("$proname$","跨地区项目"+(i)).replace("$num$","LYSYW-046B-P8TO").replace("$date$","崔伟宾 2014-9-2").replace("$curid$","10");
	}
	ulhtml +="</ul>";
	loadObj.after(ulhtml);
	loadObj.hide();
}
//初始化块数据
function initentrydata(ajaxdata,nopjax){
	$("div.kom-entry").each(function(){
		var _this=$(this),entrystr=_this.data("entry");
		if(entrystr){
			var data=ajaxdata[entrystr];
			if(data){
				var otherobj=_this.find(".otherinfo");
				if(otherobj.length){
					otherobj.html(data.projectnum+"|"+data.amout);
				}else{
					_this.append("<div class='otherinfo'>"+data.projectnum+"|"+data.amout+"</div>");
				}
			}
			db.transaction(function(tx){
				tx.executeSql("create table if not exists costatustable (costatus,statusobj)");
				//console.log("delete table "+ entrystr)
				//tx.executeSql("delete from costatustable where costatus="+entrystr);
		  		tx.executeSql("insert into costatustable(costatus,statusobj) values ('"+entrystr+"','"+JSON.stringify(data)+"')");
		  		//console.log("insert into costatustable"+entrystr);
		  	});
		}
	})
	if(nopjax) return;
	$.pjax({
		init:true,
		selector:"div.kom-entry",
		titleSuffix: 'Commit & Sell out ',
		sethref:function(curobj){
			var _this=$(curobj),returnvalue=false;;
			if(_this.hasClass("entry-dis")){
				returnvalue=true;
			}else{
				var curstatusn=_this.text(),remark=_this.find("div.otherinfo").html(),badge=_this.find(".mui-badge").html();
				curstatusn=curstatusn.replace(remark,"").replace(badge,"");
				if(_this.hasClass("kom-entry-harf")){
					if(_this.hasClass("harf-left")) curstatusn="产品"+curstatusn;
					else curstatusn="服务"+curstatusn;
				}
				_this.attr("href","viewdetail.html?title="+encodeURIComponent(curstatusn)+"&type="+_this.data("entry"));
			}
			return returnvalue;
		},
		callback:function(obj){
			//alert(obj.type);
			viewdataload();
		}
	});
}
function viewdataload(){
	//data-loading
	$("div.mui-loading").each(function(){
		var _this=$(this);
		// alert(window.screen.height);
		// _this.height(window.screen.height+"px");
		if(_this.data("loading")){
			var innerhtml='<div class="mui-spinner">';
			for(var i=0;i<12;i++){
				innerhtml+="<div class='mui-spinner-indicator mui-spinner-indicator"+(i+1)+"'></div>";
			}
			innerhtml +="</div>";
			_this.html(innerhtml);
			setTimeout(function(){
				loaddatalist(_this);
			},1000);
		}
	});
	$("#typehidden").val(getUrlParams(decodeURIComponent(location.href),"type"));
	pulldownupex();
	// 初始化 右侧菜单
	$("#offCanvas").initAjax({
		callback:function(data,nopjax){
			initentrydata(data,nopjax);
		}
	});
	// -----viewdetail.html
	$("#ultalble").on("longtap","li",function(){
  		var sheight=window.screen.height;
  		$("#popbtns").css("margin-top",(sheight/2-25 )+"px");
  		$(".mask").show().one("tap",function(){
  			$(this).hide();
  		});
  	})
  	//点击 列表项---为列表项绑定 Pjax
  	$.pjax({
  		selector:".pjaxitem",
		titleSuffix: '',
		sethref:function(curobj){
			var costatus=$("#typehidden").val(),type='',pstaus=costatus.substr(0,1),
	  		status=costatus.substr(1),ordertype='',title='订单详情';
	  		if(status.indexOf('-')){
	  			var statusarr=status.split('-');
	  			ordertype=statusarr[1];status=statusarr[0];
	  		}
	  		if(pstaus =="c"){
	  			if(status =="0")
	  				type="1";
	  			else
	  				type="2";
	  		}else{
	  			if(status == "0")
	  				type="2";
	  		}
	  		var sendparams={
	  			id:14099,applystatus:2,type:type,stauts:status
	  		};
	  		if(type){
	  			window.location.href="objc://getkinddetail/"+JSON.stringify(sendparams);
	  			return true;
	  		}
	  		else{
	  			$(curobj).attr("href","orderinfo.html?title="+title);
	  			return false;
	  		}
		},callback:function(){

		}
  	});
	$("#clickdownwrap").on("click",function(){
  		var _this=$(this);
  		$("#othersearch").show();
  		_this.prev().find("button").hide().siblings("input").css({"width":"100%"}).attr("type","text");
  		_this.hide();
  		$("#projectnames").attr("type","text").css("height","34px");
  		$("#clickdownwrapup").show();
  	})
  	$("#clickdownwrapup").on("click",function(){
  		$("#othersearch").hide();
  		$("#projectnames").attr("type","search");
  		$(this).hide();
		$("#clickdownwrap").show().prev().find("button").show().siblings("input").attr("type","search").css({"width":"85%"});
  	})
}
// viewdetail 页面添加 下拉 上啦事件处理
function pulldownupex(){
	mui.init({
  		swipeBack:false,
		optimize: false,
		pullRefresh:{
			container: '.mui-content-padded',
			down: {
                contentdown: '下拉可以刷新',
                contentover: '释放立即刷新',
                contentrefresh: '正在刷新...',
                callback: function(callback) {
                    setTimeout(function() {
                        var table = $('.mui-table-view'),
                        itemhtml=$("#itemtemp").html().replace("$proname$","神华乌海能源有限责任公司").replace("$num$","LYSYW-046B-P8TO").replace("$date$","张大杰 2014-9-2");
                        table.prepend(itemhtml);
                        callback(); //refresh completed
                    }, 1000);
                }
            },
            up:{
            	contentdown: '上拉显示更多',
                contentover: '释放立即刷新',
                contentrefresh: '正在刷新...',
                callback:function(callback){
                	setTimeout(function() {
                        var table = $('.mui-table-view'),
                        itemhtml=$("#itemtemp").html().replace("$proname$","跨地区项目").replace("$num$","LYSYW-046B-P8TO").replace("$date$","张大杰 2014-9-2"),htmls="";
                        for(var i=0;i<10;i++){
                        	htmls+=itemhtml;
                        }
                        table.append(htmls);
                        callback(); //refresh completed
                    }, 1000);
                }
            }
		}
  	});
}
function showbackinfo(info){
	alert(info);
}

