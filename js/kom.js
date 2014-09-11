var db="";
$(function(){
	db=openDatabase("commitorderdb","1.0","commit&order data",1024*1024);
//	db.transaction(function(tx){
//		tx.executeSql("drop table costatustable");
//	});
	//ios 监听事件
	
  	$.back=function(){
  		alert(window.history.length);
  		if (window.history.length > 1) {
			window.history.back();
			window.location.reload();
		}
  	}
//	$(".mui-action-back").click(function(){
//		window.close();
//	})
	$(".kom-entry").click(function(){
		if($(this).hasClass("entry-dis")) return;
		var _this=$(this),curstatusn=_this.text(),remark=_this.find("div.otherinfo").html(),badge=_this.find(".mui-badge").html();
		curstatusn=curstatusn.replace(remark,"").replace(badge,"");
		if(_this.hasClass("kom-entry-harf")){
			if(_this.hasClass("harf-left")) curstatusn="产品"+curstatusn;
			else curstatusn="服务"+curstatusn;
		}
		localStorage.cohref=window.location.href;
		//
		location.href="viewdetail.html?curstatusn="+encodeURIComponent(curstatusn)+"&type="+$(this).data("entry");
		//window.open("viewdetail.html");
	})
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
	//data-loading
	$("div.mui-loading").each(function(){
		var _this=$(this);
		_this.height(window.screen.height+"px");
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
	//kom-entry 块数据的加载与显示
	$.fn.initAjax=function(options){
		var _this=$(this);
		if(_this.data("initajax")){
			//添加 下拉刷新
			if(_this.data("pullload")){
				db.transaction(function(tx){
					tx.executeSql("drop table costatustable");
				});
				mui(".mui-content-padded").pullRefresh({
					down: {
		                callback: function(callback) {
//		                    setTimeout(function() {
//		                        var data={"o60":{projectnum:45,amout:42.34},"o0-0":{projectnum:74,amout:123.33}};
//		                        callback(); //refresh completed
//		                        options.callback(data);
//		                    }, 1000);
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
				tr.executeSql("select * from costatustable",[],function(tx,rs){
					var rows=rs.rows,len=rows.length,data={};
					if(len){
						alert("load data from local db!");
						for(var i=0;i<len;i++){
							var item=rows.item(i);
							(item.statusobj!= "undefined") && (data[item.costatus]=JSON.parse(item.statusobj));
						}
						options.callback(data);
					}else{
						//alert("load data from service");
						$.get("http://kom3.eisoo.com/kommobiletest/init.json?callback=?",{},function(data){
							options.callback(data);
						},"jsonp");
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
	$("div.mui-content,#offCanvas").initAjax({
		callback:function(data){
			initentrydata(data);
		}
	});
	$(".mui-action-back2").on("click",function(e){
		//$(this).initOsEvent({});
		e.preventDefault();
		if(mui.os.ios){
			window.location="objc://goback";
		}else{
			
		}
		return false;
	});
	$(".mui-action-backup").on("click",function(e){
		window.location=localStorage[$(this).data("type")];
		return false;
	});
	$("#ultalble").on("tap","li",function(){
  		var costatus=$("#typehidden").val(),type='',pstaus=costatus.substr(0,1),
  		status=costatus.substr(1),ordertype='';
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
  		if(type)
  			window.location="objc://getkinddetail/"+JSON.stringify(sendparams);
  		else{
  			localStorage.vhref=window.location.href;
  			location.href="orderinfo.html";
  		}
  		return false;
  	})
	
	//--
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
function initentrydata(ajaxdata){
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
			else
				_this.append("<div class='otherinfo'>&nbsp;</div>");
			db.transaction(function(tx){
				tx.executeSql("create table if not exists costatustable (costatus,statusobj)");
				tx.executeSql("delete from costatustable where costatus="+entrystr);
		  		tx.executeSql("insert into costatustable(costatus,statusobj) values ('"+entrystr+"','"+JSON.stringify(data)+"')");
		  	});
		}
	})
}
function showbackinfo(info){
	alert(info);
}

