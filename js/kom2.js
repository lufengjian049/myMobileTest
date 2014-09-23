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
				// mui(".mui-content-padded").pullRefresh({
				// 	down: {
		  //               callback: function(callback) {
		  //                   $.get("http://kom3.eisoo.com/kommobiletest/init2.json?callback=?",{},function(data){
		  //                   	callback();
		  //                   	options.callback(data);
		  //                   },"jsonp");
		  //               }
		  //           }
				// });
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
						var token=getUrlParams(location.href,"token"),
						url="http://192.168.4.202:8280/komrestservice/quote/comanage?token="+token;
						$("#huserid").val(token);
						//alert(token);
						$.ajax({url:url,async:false,success:function(data){
							options.callback(data['data']);
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
			if(true){
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
			//mui.os.ios=true;
			if(true){
				window.location="objc://goback";
			}else{
				
			}
		}else{
			$.back();
		}
		return false;
	});
	$("#extenddivmenu").on("tap",function(){
		var transf=$("#offcanvaswrap").css("webkitTransform") || "translate3d(0,0,0)",tanre=/translate(?:3d)?\((.+?)\)/;
		var result=transf.match(tanre);
		result=result[1].split(',');
		var newobj=$("header").add("#container"); 
		if(parseInt(result[0]) == 0){
			newobj.wrapAll("<div id='offcanvaswrap'></div>");//maincontain
			$("#offcanvaswrap").css("position","absolute").before($("#offCanvas"));
			$("#offCanvas").show();
			$("#offcanvaswrap").css({
                        "-webkit-transform":"translate3d(-80%,0,0)",
                        "-webkit-transition":"-webkit-transform .4s ease-in-out"
        	})
        	// setTimeout(function(){
        	// 	$("#offcanvaswrap").css("z-index","0");
        	// },400)
        }
		else{
			$("#offCanvas").appendTo($("#container"));
			$("#offCanvas").hide();
			$("#offcanvaswrap").css({
                        "-webkit-transform":"translate3d(0,0,0)",
                        "-webkit-transition":"-webkit-transform .4s ease-in-out"
        	})
        	newobj.unwrap();
		}
        return false;
	})

});
function ontouchmove(e){
	e.preventDefault();
}
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
	$("li",ulobj).on("tap",function(){
  		var _this=$(this),inputs=_this.parent().prev().find("input");
  		inputs.eq(0).val(_this.attr("alt"));
  		inputs.eq(1).val(_this.html());
  		_this.parent().hide();
  	})
}
//加载列表数据 ---状态详细页面
function loaddatalist(loadObj){
	var loadurl=loadObj.attr("loadurl"),formid=loadObj.attr("formid"),itemTemp=$("#itemtemp").html(),
	page=parseInt(loadObj.data("page")),token=$("#huserid").val(),typesh=$("#typehidden").val(),
	secstatus=typesh.substring(1),status=secstatus,type="";
	if(secstatus.indexOf('-')>0){
		status=secstatus.split('-')[0];
		type=secstatus.split('-')[1];
	}
	params={
		kind:typesh.substr(0,1),
		status:status,type:type,token:token,page:page
	};
	$("#"+formid).data("params",params);
	$.mypost(loadurl,false,params,function(result){
		if(result){
			var ulhtml="<ul class='mui-table-view'>";
			ulhtml+=setitemlist(result.data);
			ulhtml +="</ul>";
			loadObj.data("page",page+1);
			loadObj.after(ulhtml);
			loadObj.hide();
		}
	})
}
//初始化块数据
function initentrydata(ajaxdata,nopjax){
	$("div.kom-entry").each(function(){
		var _this=$(this),entrystr=_this.data("entry"),param=_this.attr("param");
		if(entrystr){
			var data=ajaxdata[entrystr];
			if(!data && _this.data("settotal")){
				var emptyd={num:0,pasum:0},d1=ajaxdata[entrystr+"_0"] || emptyd,d2=ajaxdata[entrystr+"_1"] || emptyd;
				data={
					num:parseInt(d1.num)+parseInt(d2.num),
					pasum:parseFloat(d1.pasum)+parseFloat(d2.pasum)
				};
			}
			if(data){
				if(parseInt(data.num) <=0) return;
				var otherobj=_this.find(".otherinfo"),amout=(parseFloat(data.pasum)/10000).toFixed(2);
				if(otherobj.length){
					otherobj.html(data.num+"|"+amout);
				}else{
					_this.append("<div class='otherinfo'>"+data.num+"|"+amout+"</div>");
				}
			}
			if(param){
				(parseInt(ajaxdata[param])> 0) && _this.find("span").html(ajaxdata[param]);
			}
			db.transaction(function(tx){
				tx.executeSql("create table if not exists costatustable (costatus,statusobj)");
				// console.log("delete  from costatustable where costatus= "+ entrystr)
				tx.executeSql("delete from costatustable where costatus=?",[entrystr],function(){
					// console.log("delete ok");
				});
		  		//tx.executeSql("insert into costatustable(costatus,statusobj) values ('"+entrystr+"','"+JSON.stringify(data)+"')");
		  		tx.executeSql("insert into costatustable(costatus,statusobj) values (?,?)",[entrystr,JSON.stringify(data)],function(){
		  			//console.log("insert ok");
		  		});
		  	});
		}
	})
	
	$(".i-loading").hide();
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
	$("#typehidden").val(getUrlParams(decodeURIComponent(location.href),"type"));
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
			loaddatalist(_this);
		}
	});
	// 初始化 右侧菜单
	$("#offCanvas").initAjax({
		callback:function(data,nopjax){
			initentrydata(data,nopjax);
		}
	});
	// $("#container").on("swipeLeft",function(){
	// 	$("#extenddivmenu").trigger("tap");
	// });
	// $("#container").on("swipeRight",function(){
	// 	$("#extenddivmenu").trigger("tap");
	// });
  	//点击 列表项---为列表项绑定 Pjax
  	$.pjax({
  		selector:".pjaxitem",
		titleSuffix: '',
		sethref:function(curobj){
			var costatus=$("#typehidden").val(),type='',pstaus=costatus.substr(0,1),
	  		status=costatus.substr(1),ordertype='',title='订单详情';
	  		if($(status).indexOf('-')){
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
	backfn();
}
function backfn(){
	if(!$("#ajaxform").length) return;
	//data-dropdownlist
	$("#clickdownwrap").on("tap",function(){
  		var _this=$(this);
  		$("#othersearch").show();
  		_this.prev().find("button").hide().siblings("input").css({"width":"100%","text-align":"left"}).next().hide();
  		_this.hide();
  		$("#clickdownwrapup").show();
  		$(".searchdiv input").each(function(){
  			if(!$(this).val()){
  				$(this).focus();
  				return false;
  			}
  		});
  	})
  	// -----viewdetail.html
	$("#ultalble").on("longTap","li",function(){
  		var sheight=window.screen.height;
  		$("#popbtns").css("margin-top",(sheight/2-25 )+"px");
  		$(".mask").show().one("tap",function(){
  			$(this).hide();
  		});
  	})
  	$("#clickdownwrapup").on("tap",function(){
  		$("#othersearch").hide();
  		$(this).hide();
		$("#clickdownwrap").show().prev().find("input").css({"width":"100%","text-align":"center"}).next().show();
  	})
  	$(".isearch>span").on("tap",function(){
  		var _this=$(this);
  		_this.hide();
  		_this.prev().focus().css({"width":"85%","text-align":"left"});
  		_this.next().show();
  	})
  	//时间查询按钮事件
	$(".btnsrow").on("tap","span",function(){
		var _this=$(this),index=_this.index(),otherdates=_this.parent().next().find("input"),
		type=_this.attr("type"),inputdates=_this.parent().find("input");
		if(_this.hasClass("active")){
			return
		}else{
			_this.addClass("active").siblings().removeClass("active");
			if(index == 3){ // other
				otherdates.removeAttr("disabled");
				inputdates.eq(0).val("");
				inputdates.eq(1).val("");
			}else{
				var dateobj=gettimebytype(type);
				inputdates.eq(0).val(dateobj.startdate);
				inputdates.eq(1).val(dateobj.enddate);
				otherdates.attr("disabled","disabled");
			}
		}
	})
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
	pulldownupex();
	$(".searchdiv input").inputinit();
}
// viewdetail 页面添加 下拉 上啦事件处理
function pulldownupex(){
	var loadobj=$(".mui-loading"),loadurl=loadobj.attr("loadurl"),table=$('.mui-table-view');
	$("#maincontain").pullRefresh({
		down: {
                callback: function(callback) {
                	//下拉 刷新
                	table=$('.mui-table-view');
                    setTimeout(function() {
                        var itemhtml=$("#itemtemp").html().replace("$proname$","神华乌海能源有限责任公司").replace("$num$","LYSYW-046B-P8TO").replace("$date$","张大杰 2014-9-2");
                        table.prepend(itemhtml);
                        callback(); //refresh completed
                    }, 1000);
                }
            },
            up:{
                callback:function(callback){
                	//上拉 加载下一页
                	var page=loadobj.data("page"),table=$('.mui-table-view');
                	setTimeout(function() {
                        var itemhtml=$("#itemtemp").html().replace("$proname$","跨地区项目").replace("$num$","LYSYW-046B-P8TO").replace("$date$","张大杰 2014-9-2"),htmls="";
                        for(var i=0;i<10;i++){
                        	htmls+=itemhtml;
                        }
                        table.append(htmls);
                        callback(); //refresh completed
                    }, 1000);
                }
            }
	});
}
function setitemlist(rows){
	var itemtemp=$("#itemtemp").html(),returnstr="",itemhtml="";
	if(rows.length>0){
		for(var i=0;i<rows.length;i++){
			var currow=rows[i];
			itemhtml=itemtemp.replace("$proname$","跨地区项目").replace("$num$","LYSYW-046B-P8TO").replace("$date$","张大杰 2014-9-2");
			returnstr+=itemhtml;
		}
	}
	return returnstr;
}
//获取搜索参数 返回 参数对象
function getformparams(){
	var obj={};
	$("#ajaxform input").each(function(){
		var _this=$(this);
		if(!_this.attr("disabled")){
			obj[$(this).attr("name")]=$(this).val();
		}
	})
	return obj;
}
// viewdetail 搜索方法
function searchlistdata(){
	var loadobj=$(".mui-loading"),loadurl=loadobj.attr("loadurl"),params={};
	params=$.extend($("#ajaxform").data("params"),getformparams());
	$(".i-loading").show();
	$.mypost(loadurl,false,params,function(result){
		if(result){
			var ulhtml="<ul class='mui-table-view'>";
			ulhtml+=setitemlist(result.data);
			ulhtml +="</ul>";
			loadObj.data("page","1");
			loadObj.next().remove();
			loadObj.after(ulhtml);
			$("#clickdownwrapup").trigger("tap");
			$(".i-loading").hide();
		}
	})
}
//根据不同的类型获取时间 对象 {开始时间，结束时间}
function gettimebytype(type){
	var reobj={},nowdate=new Date(),nowyear=nowdate.getFullYear(),nowmonth=nowdate.getMonth(),
	nowday=nowdate.getDate(),mstart,mend,qsm;
	switch (type){
		case 'month':
			mstart=new Date(nowyear,nowmonth,1);
			mend=new Date(nowyear,nowmonth,getMonthDays(nowyear,nowmonth));
		break;
		case 'week':
			mstart=new Date(nowyear,nowmonth,nowday-nowdate.getDay()+1);
			mend=new Date(nowyear,nowmonth,nowday+(6-nowdate.getDay())+1);
		break;
		case 'thisyear':
			mstart=new Date(nowyear,"1","1");
			mend=new Date(nowyear,"12","31");
		break;
		case 'thisquarter':
			qsm=getQuarterStartMonth(nowmonth);
			mstart=new Date(nowyear,qsm,1);
			mend=new Date(nowyear,qsm+2,getMonthDays(nowyear,qsm+2));
		break;
		case 'lastquarter':
			qsm=getQuarterStartMonth(nowmonth);
			var lqsm=qsm-3;
			if(lqsm<0){
				lqsm=9;
				nowyear-=1;
			}
			mstart=new Date(nowyear,lqsm,1);
			mend=new Date(nowyear,lqsm+2,getMonthDays(nowyear,lqsm+2));
		break;
	}
	if(mstart && mend){
		reobj.startdate=formatDate(mstart);
		reobj.enddate=formatDate(mend);
	}
	return reobj;
}
//获取某月的天数
function getMonthDays(year,month){
	var monthstartdate=new Date(year,month,1),
	monthenddate=new Date(year,month+1,1);
	return (monthenddate-monthstartdate)/(1000*60*60*24);
}
//获取本季度的开始月份
function getQuarterStartMonth(month){
	var qstartmonth=0;
	if(month <3)
		qstartmonth=0;
	if(2<month && month <6)
		qstartmonth=3;
	if(5<month && month < 9)
		qstartmonth =6;
	if(month >8)
		qstartmonth =9;
	return qstartmonth;
}
function formatDate(date){
	var year=date.getFullYear(),
	month=date.getMonth()+1,
	day=date.getDate();
	if(month <10)
		month="0"+month;
	if(day<10)
		day="0"+day;
	return (year+"-"+month+"-"+day);
}
function showbackinfo(info){
	alert(info);
}

