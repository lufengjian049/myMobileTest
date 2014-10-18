var hrefobj={
	//domain:"http://192.168.4.202:8280/komrestservice",
	// domain:"http://192.168.150.2:8280/komrestservice",
	// domian:"http://42.121.116.149:8280/komrestservice",
	domain:"http://42.120.17.217:8280/komrestservice",
	comanageurl:"/quote/comanage",//commit-order管理 统计 页面(首页)
	listurl:"/quote/coquery", //commit-order 列表地址
	areaurl:"/other/arealist", //管辖地区地址
	detailurl:"/order/orderdetail", //commit-order 状态详情地址
	loseorderurl:"/order/missorder" //已丢单 链接
},
opobj={
	curli:null,
	curbtnobj:null,
	btnop:false,
	formparams:null,
	lasttotal:null,
	ajaxerrorinfo:"请求出错,请联系管理员",
	datesobj:{
		"c60":"丢单时间","c0":"报价终审时间","c1":"Commit申请时间","o1":"预计签约时间","o2":"实际签约时间"
	},
	curdateobj:null,
	res:null
},starttime=null,endtime=null;
$(function(){
	
	//--------------------页面初始化----------------
	$("div.mui-content").initEntryDataZ({
		callback:function(data,nopjax){
			initentrydata(data,nopjax);
		}
	});
	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
	//----------------注册的事件---------------
	$(document).on("tap",".mui-action-backup",function(e){
		if($(this).data("backtop") =="1"){
			if(true){
				window.location="objc://goback";
			}
		}else{
			$.back();
		}
		return false;
	});
	//右侧菜单按钮事件
	$(document).on("tap","#extenddivmenu",function(){
		var slidemenu=$(".slidemenu");
		if(slidemenu.hasClass("show")){
			slidemenu.removeClass("show").addClass("hide");
			$(this).removeData("swipe");
			setTimeout(function(){
				slidemenu.removeClass("hide").hide();
			},400);
		}else{
			slidemenu.removeClass("hide").addClass("show").show();
			$(this).data("swipe",true);
		}
	})
	$("#popbtns").on("tap","span",function(){
		btntapevent(this);
	})
	$(document).on("tap","div.haslink",function(){
		var id=$(this).data("channelid"),
		sendparams={
			tab:$(this).attr("type"),
			id:id
		};
		window.location.href="objc://loaddetailwin/"+JSON.stringify(sendparams);
	});
	$(document).on("tap","#detailsearch",function(){
		searchlistdata();
	});
	$(window).on("swipeLeft",function(e){
		var extendbtn=$("#extenddivmenu"),cview=extendbtn.closest(".view");
		if($(".view").index(cview) == 2 && cview.hasClass("current")){
			(extendbtn.css("display")!="none") && extendbtn.trigger("tap");
		}
		e.stopImmediatePropagation();
		return false;
	});
	$(window).on("swipeRight",function(e){
		var extendbtn=$("#extenddivmenu");
		if(extendbtn.data("swipe")){
			(extendbtn.css("display")!="none") && extendbtn.trigger("tap");
		}else{
			$.back();
		}
		e.stopImmediatePropagation();
		return false;
	});

	$(document).on("tap",".kom-entry",function(){
		starttime=new Date();
		showloadbox(true);
		var _this=$(this),url="";
		if(_this.hasClass("entry-dis")){
			hideloadbox();
		}else{
			var curstatusn=_this.text(),remark=_this.find("div.otherinfo").html(),badge=_this.find(".mui-badge").html(),url="";
			curstatusn=curstatusn.replace(remark,"").replace(badge,"");
			if(_this.hasClass("kom-entry-harf")){
				if(_this.hasClass("harf-left")) curstatusn="产品"+curstatusn;
				else curstatusn="服务"+curstatusn;
			}
			url="viewdetail2.html?ran="+Math.random()+"&title="+encodeURIComponent(curstatusn)+"&type="+_this.data("entry");
			_this.closest(".view").loadNextPage(url,function(url){
				viewdataload(url);
				//iscroll
			});
		}
	})
	$(document).on("tap",".pjaxitem",function(){
		var costatus=$("#typehidden").val(),type='',pstaus=costatus.substr(0,1),
  		status=costatus.substr(1),ordertype='-1',title='订单详情',_this=$(this),url="";
  		if($(status).indexOf('-')){
  			var statusarr=status.split('-');
  			ordertype=statusarr[1];status=statusarr[0];
  		}
  		if(pstaus =="c"){
  			if(status =="0")
  				type="pricedetail";
  			else
  				type="commitdetail";
  		}else{
  			if(status == "0")
  				type="commitdetail";
  		}
  		var sendparams={
  			id:_this.attr("priceid"),applystatus:2,tab:type,stauts:status,type:ordertype
  		};
  		if(type){
  			window.location.href="objc://getkinddetail/"+JSON.stringify(sendparams);
  		}
  		else{
  			url="orderinfo2.html?ran="+Math.random()+"&title="+title+"&myreview="+_this.hasClass("reviewitem")+"&orderid="+_this.attr("orderid")+"&p_manage="+_this.attr("btnmanager")+"&status="+$("#typehidden").val()+"&priceid="+_this.attr("priceid")+"&p_busimeb="+_this.attr("busimeb");
  			_this.closest(".view").loadNextPage(url,function(url){
				orderdetailload(url);
				//iscroll
			});
  		}
	})
	//--------------------------------注册的事件 over
	// history.pushState({url:location.href},"Commit & Sell out管理",location.href);
});
//共用方法 && 自定义
$.back=function(){
	var curview=$(".view").filter(".current"),prevoview=curview.prev();
	if(!prevoview.hasClass("slidemenu")){
		curview.addClass("backout");
		prevoview.addClass("backin");
		setTimeout(function(){
			curview.removeClass().addClass("view").addClass("next");
			prevoview.removeClass().addClass("view").addClass("current");
		},800);
	}
}
//kom-entry 块数据的加载与显示
$.fn.initEntryDataZ=function(options){
	var _this=$(this),token=Util.getUrlParams(location.href,"token"),
	url=hrefobj["domain"]+hrefobj.comanageurl+"?token="+token;
	if(_this.data("initajax")){
		$("#huserid").val(token);
		$("#hcommitpre").val(Util.getUrlParams(location.href,"commitshow"));
		$("#horderpre").val(Util.getUrlParams(location.href,"ordershow"));
		$.mypost(url,false,{},function(data){
			options.callback(data['data']);
		},'GET');
	}
	return _this;
}
//新框架  加载下一页 数据
$.fn.loadNextPage=function(url,callback){
	var viewobj=$(this);
	if(!viewobj.next().hasClass("next")){
		viewobj.after("<div class='view next'></div>");
	}
	var newviewovj=viewobj.next();
	newviewovj.myLoad(url,{},function(curobj){
		var title=decodeURIComponent(Util.getUrlParams(url,"title")),replaceobj={
			title:title.trim()
		};
		curobj.find(".replaceitem").each(function(){
			$(this).html(replaceobj[$(this).attr("replaceitem")])
		})
		viewobj.addClass("out");
		newviewovj.addClass("in");
		setTimeout(function(){
			viewobj.removeClass().addClass("view");
			newviewovj.removeClass().addClass("view").addClass("current");
		},800);
		callback(url);
	});
}
//操作按钮的处理
function btntapevent(obj){
	var curstatus=$("#typehidden").val(),curitemparams=$("#itemparams").val(),
	sendparams={
		applystatus:2,
		tab:$(obj).attr("type"),
		type:$(obj).attr("typep") || ""
	};
	opobj.curbtnobj=$(obj);
	if(!curitemparams){
		var idp=Util.getUrlParams(location.href,"priceid"),ido=Util.getUrlParams(location.href,"orderid"),
		curid=ido || idp;
		curitemparams={
			id:curid,
			pid:idp
		};
	}else{
		curitemparams=JSON.parse(curitemparams);
	}
	sendparams=$.extend(sendparams,curitemparams);
	if(sendparams.tab== "loseorder"){
		window.location.href="objc://gotomissorder/"+JSON.stringify(sendparams);
	}else{
		if($(obj).attr("confirminfo")){
			sendparams.commitstatus=1;
			window.location.href="objc://openwin/"+JSON.stringify(sendparams);
		}else{
			window.location.href="objc://openwin/"+JSON.stringify(sendparams);
		}
	}
}
//创建下拉数据
function createddllist(curObj){
	var ulhtml="<ul class='ddllist' style='display:none'>",loadurl=hrefobj.domain+hrefobj[curObj.attr("loadurl")];
	//请求获取数据
	loadurl+="?token="+$("#huserid").val();
	if(sessionStorage.arealisthtml){
		curObj.after(sessionStorage.arealisthtml);
		initDdlEvent(curObj.next());
	}else{
		$.mypost(loadurl,true,{},function(result){
			if(result.data.total > 0){
				var dlist=result.data.arealist;
				for(var i=0;i<dlist.length;i++){
					ulhtml+="<li alt='"+dlist[i]["areaid"]+"'>"+dlist[i]["areaname"]+"</li>"
				}
				ulhtml+="</ul>";
				curObj.after(ulhtml);
				sessionStorage.arealisthtml=ulhtml;
				initDdlEvent(curObj.next());
			}
		},"GET");
	}
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
	var loadurl=hrefobj.domain+hrefobj[loadObj.attr("loadurl")],formid=loadObj.attr("formid"),itemTemp=$("#itemtemp").html(),
	page=parseInt(loadObj.data("page")),token=$("#huserid").val(),typesh=$("#typehidden").val(),
	secstatus=typesh.substring(1),status=secstatus,type="0",total="",
	minheight=(window.screen.height-110+8)+"px";
	if(secstatus.indexOf('-')>0){
		status=secstatus.split('-')[0];
		type=secstatus.split('-')[1];
	}
	params={
		kind:typesh.substr(0,1),
		status:status,type:type,token:token,size:10
	};
	var getparams=parseUrlStr(params);
	loadurl +="?"+getparams+"&page="+page;
	opobj.formparams=getparams;
	$.mypost(loadurl,true,{},function(result){
		total=result.data.total;
		if(total>0){
			var ulhtml="<ul class='mui-table-view' style='min-height:"+minheight+"'>";
			ulhtml+=setitemlist(result.data.list);
			ulhtml +="</ul>";
			loadObj.data("page",page+1);
			loadObj.after(ulhtml);
			loadObj.hide();
			//---------------------------iscroll-----------------------------
			new IScroll(loadObj.closest(".mui-content-padded"), { mouseWheel: true});
			hideloadbox();
			//window.location.href="objc://loadmask/"+JSON.stringify({show:0});
		}else{//没有数据
			loadObj.after("<div class='emptydatadiv' style='text-align: center;height:"+window.screen.height+"px'>没有任何数据</div>");
			loadObj.hide();
		}
	})
	return total;
}
//初始化  块数据
function initentrydata(ajaxdata,nopjax){
	$("div.kom-entry").each(function(){
		var _this=$(this),entrystr=_this.data("entry"),param=_this.attr("param"),
		commitshow=$("#hcommitpre").val(),ordershow=$("#horderpre").val();
		if(entrystr){
			var entryfirst=entrystr.substr(0,1),
			entryother=entrystr.substr(1),endis=false;
			if(entryfirst == "c" && commitshow != "1"){
				endis=true;
			}
			if(entryfirst == "o" && ordershow !="1"){
				endis=true;
			}
			if(endis){
				_this.addClass("entry-dis");
				_this.find("span").hide();
				return true; //continue
			}
			var data=ajaxdata[entrystr];
			if(!data && _this.data("settotal")){
				var emptyd={num:0,pasum:0},d1=ajaxdata[entrystr+"-0"] || emptyd,d2=ajaxdata[entrystr+"-1"] || emptyd;
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
			}else{
				var otherobj=_this.find(".otherinfo");
				otherobj.length && otherobj.html("0|0.00");
			}
			if(param){
				var paramnum=ajaxdata[param];
				if(parseInt(paramnum)> 0){
					_this.find("span").show().html(paramnum);
				}else{
					_this.find("span").hide();
				}
			}
		}
	})
	hideloadbox();
	$("#slidemenu").append($(".mui-content-padded").clone());
	$(".scrollviewcontent").each(function(){
		new IScroll($(this), { mouseWheel: true});
	})
}
//加载 viewdetail
function viewdataload(url){
	//data-loading
	//window.location.href="objc://loadmask/"+JSON.stringify({show:1});
	$("#typehidden").val(Util.getUrlParams(decodeURIComponent(url),"type"));
	var total=0;
	total=loaddatalist($("div.mui-loading"));
	backfn(total);
}
function backfn(total){
	if(!$("#ajaxform").length) return;
	//data-dropdownlist
	opobj.lasttotal=total;
	$("#clickdownwrap").on("tap",function(){
  		var _this=$(this);
  		showloadbox();
  		$("#othersearch").show();
  		_this.prev().find("button").hide().eq(1).next().css("right","10px").siblings("input").css({"width":"100%","text-align":"left"}).next().hide();
  		_this.hide();
  		$("#clickdownwrapup").show();
  		$(".searchdiv input").each(function(){
  			if(!$(this).val()){
  				$(this).focus();
  				return false;
  			}
  		});
  		var ddlobj;
  		$("div.mui-input-row").each(function(){
			var _this=$(this);
			if(_this.data("dropdownlist")){
				ddlobj=_this;
				_this.find("input[type='text']").on("input",function(){
					if(_this.next().is("ul")){
						_this.next().show();
						vaguesearch($(this));
					}
				})
				return false;//break
			}
		});
  		createddllist(ddlobj);
  	})
  	$(".isearch .mui-icon-search").on("tap",function(){
  		var _this=$(this),
  		 inputobj=_this.siblings("input");
  		 if(inputobj.val()){
  		 	searchlistdata();
  		 	_this.next().trigger("tap");
  		 }else{
  		 	inputobj.css("border-color","red");
  		 }
  	})
  	$(".isearch .mui-icon-close").on("tap",function(){
  		var _this=$(this);
  		_this.hide().prev().hide().siblings("input").val("").css({"width":"100%","text-align":"center","border-color":"#ccc"}).next().show();
  		_this.next().hide().css("right","10px");
  	})
  	// -----viewdetail.html
	$("#ultalble").on("longTap","li",function(){
  		var sheight=window.screen.height,curstatus=$("#typehidden").val(),hastwo=[],
  		itemparams={
  			id:$(this).attr("priceid"),
  			pid:$(this).attr("priceid")
  		},reviewstatus=['c1','o1-0','o1-1'],orderid=$(this).attr("orderid"),showitems=$(""),_thisp=$(this);
  		(orderid !="undefined") && (itemparams.id=orderid);
  		// if(reviewstatus.indexOf(curstatus) >=0 && !$(this).hasClass("reviewitem")){
  		// 	return;
  		// }
  		$("#popbtns span").each(function(){
  			var _this=$(this);
  			if(_this.attr("nosee")){
  				if(_this.attr("nosee").indexOf(curstatus) >=0)
  					_this.hide();
  				else{
  					if(_thisp.attr("btnmanager") == 1 || _thisp.attr("busimeb") == 1){
  						_this.show();showitems=showitems.add(_this);
  					}else{
  						_this.hide();
  					}
  				}
  			}else{
	  			if(_this.attr("showstatus").indexOf(curstatus) == -1){
	  				_this.hide();
	  			}else{//xian shi
	  				if(_thisp.attr("btnmanager") == 1 || _thisp.hasClass("reviewitem")){
	  					var sessionright=_this.attr("sessionright");
	  					if(sessionright){
	  						var rights=JSON.parse(sessionStorage[_this.attr("showstatus")+'-'+itemparams.id]);
  							if(rights[sessionright] == 0){
	  							_this.show();
				  				showitems=showitems.add(_this);
				  				hastwo.push(_this.hasClass("tworow") ? "1":"0");
	  						}else{
	  							_this.hide();
	  						}
	  					}else{
	  						if(!_thisp.hasClass("reviewitem") && reviewstatus.indexOf(curstatus) >=0)
	  							_this.hide();
	  						else{
				  				_this.show();
				  				showitems=showitems.add(_this);
				  				hastwo.push(_this.hasClass("tworow") ? "1":"0");
				  			}
			  			}
		  			}else{
	  					_this.hide();
		  			}
	  			}
	  		}
  		})
  		if(hastwo.indexOf("1") >= 0)
  			showitems.css("line-height","16px");
  		else
  			showitems.css("line-height","32px");
  		if(showitems.length >=0){
  			if(showitems.length == 3){
  				showitems.eq(0).addClass("btnspanbr");
  				showitems.eq(1).addClass("btnspanbr");
  			}
  			if(showitems.length == 2){
  				showitems.eq(0).addClass("btnspanbr").css("width","49%");
  				showitems.eq(1).css("width","49%");
  			}
  			if(showitems.length == 1){
  				showitems.eq(0).css("width","97%");
  			}
  			if(showitems.length == 0){
  				return;
  			}
  		}
  		opobj.curli=_thisp.index();
  		$("#popbtns").css("margin-top",(sheight/2-25 )+"px");
  		$(".mask").show().one("tap",function(){
  			$(this).hide();
  		});
  		$("#itemparams").val(JSON.stringify(itemparams));
  	})
  	$("#clickdownwrapup").on("tap",function(){
  		$("#othersearch").hide();
  		$(this).hide();
  		var projectinputobj=$("#clickdownwrap").show().prev().find("input");
  		if(projectinputobj.val()){
  			projectinputobj.focus().css({"width":"70%","text-align":"left"});
  			projectinputobj.siblings("button").show().eq(1).next().css({"right":"94px"});
  		}else
			projectinputobj.css({"width":"100%","text-align":"center"}).next().show();
		hideloadbox();
  	})
  	$(".isearch>span").on("tap",function(){
  		var _this=$(this);
  		_this.hide();
  		_this.prev().focus().css({"width":"70%","text-align":"left"});
  		_this.next().show().next().show().next().css({"right":"94px"});
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
				inputdates.remove();
			}else{
				var dateobj=gettimebytype(type);
				inputdates.remove();
				_this.parent().append('<input type="hidden" name="startdate" value="'+dateobj.startdate+'"><input type="hidden" name="enddate" value="'+dateobj.enddate+'">');
				otherdates.attr("disabled","disabled");
			}
		}
	})
	//pulldownupex(total);
	$(".searchdiv input").inputinit();
}
//订单详情页面 加载数据
function orderdetailload(url){
	var viewdetailgroup=$("#viewdetailgroup"),loadurl=hrefobj.domain+hrefobj[viewdetailgroup.attr("loadurl")];
	loadurl+="?token="+$("#huserid").val()+"&orderid="+Util.getUrlParams(url,"orderid");
	var comm={
		ordertype:{"0":"产品","1":"服务"},
		orderstatus:{'0':'待sell out','1':'审核中','10':'已审未签','20':'审核拒绝','30':'已sell out','35':'发货中','36':'实施中','40':'已提货','50':'已完成','60':'已丢单'}
	};
	showloadbox(true);
	$.mypost(loadurl,false,{},function(result){
		var data=result.data;
		viewdetailgroup.find(".mui-item").each(function(){
			var _this=$(this),params=_this.attr("param"),paramarr=[],pvalue="",curvtype="";
			if(params.indexOf(".") >=0){
				paramarr=params.split(".");
				if(data[paramarr[0]]){
					pvalue=data[paramarr[0]][paramarr[1]];
					(pvalue== null)  && (pvalue="");
				}
			}else{
				pvalue=data[params];
				(pvalue== null)  && (pvalue="");
			}
			curvtype=typeof pvalue;
			pvalue+="";
			if(pvalue){
				if(_this.hasClass("haslink")){
					_this.find("span").eq(0).html(pvalue);
					var paramex=_this.attr("paramex"),paramexarr=[];
					if(paramex.indexOf(".") >=0){
						paramexarr=paramex.split(".");
						_this.data("channelid",data[paramexarr[0]][paramexarr[1]])+"";
					}else{
						_this.data("channelid",data[paramex]+"");
					}
				}else{
					var changetype=_this.attr("changetype");
					if(changetype){
						pvalue=comm[changetype][pvalue];
					}
					if(curvtype =="number" && _this.attr("valuetype")== "date"){
						var changed=new Date(parseInt(pvalue));
						pvalue=formatDate(changed,true);
					}
					_this.find("span").html(pvalue);
				}
			}else{
				_this.hide();
			}
		})
		hideloadbox();
	},"GET");
	var p_manage=Util.getUrlParams(url,"p_manage"),status=Util.getUrlParams(url,"status"),
	myreview=Util.getUrlParams(url,"myreview"),p_busimeb=Util.getUrlParams(url,"p_busimeb");
	if(p_manage =="1" || myreview == 'true' || p_busimeb == "1"){
		$("#viewdetailbtngroup button").each(function(){
			var btnobj=$(this),btnstatus=btnobj.attr("showstatus");
			if(!btnstatus){
				if(btnobj.attr("nosee").indexOf(status) < 0)
					(p_manage =="1" || p_busimeb == "1") && btnobj.show();
			}else{
				if(btnstatus.indexOf(status) >=0){
					if(myreview == 'false' && btnobj.html() == "审核")
						btnobj.hide();
					else
						btnobj.show();
				}else{
					btnobj.hide();
				}
			}
		})
	}
	new IScroll($("#viewdetailgroup").closest(".scrollviewcontent"), { mouseWheel: true});
	$("#viewdetailbtngroup").on("tap","button",function(){
		btntapevent(this);
	})
}
// viewdetail 页面添加 下拉 上啦事件处理
function pulldownupex(total){
	var loadobj=$(".mui-loading");
	// loadurl=loadobj.attr("loadurl"),table=$('.mui-table-view'),
	pullobj={
		down: {
				height: 50,
			    contentdown: '下拉可以刷新',
			    contentover: '释放立即刷新',
			    contentrefresh: '正在刷新...',
                callback: function(callback) {
                	//下拉 刷新
                	searchlistdata();
                	callback();
                }
            }
	};
	if(parseInt(total) >10 ){
		pullobj.up={
				height: 50,
		        contentdown: '上拉显示更多',
		        contentover: '释放立即刷新',
		        contentrefresh: '正在刷新...',
		        duration: 300,
                callback:function(callback){
                	//上拉 加载下一页
                	var page=loadobj.data("page");
                	searchlistdata(page,"nextpage");
                	callback();
                }
            }
	}
	//$("#maincontain").pullRefresh(pullobj);
}
function setitemlist(rows){
	var itemtemp=$("#itemtemp").html(),returnstr="",itemhtml="";
	if(rows && rows.length>0){
		for(var i=0;i<rows.length;i++){
			var currow=rows[i],glclass=(currow.myapprove == 1) ? "reviewitem" : "",
			costatus=currow.kind+currow.status,statusobj={
				statusorder:currow.statusorder,
				statusservice:currow.statusservice
			};
			if(currow.myapprove == 1){
				glclass="reviewitem";
			}else{
				if((currow.p_busimeb == 1 || currow.p_manage == 1) && currow.status !=50 && currow.statusorder !=60)
					glclass="opitem";
			}
			if(costatus == "c0")
				sessionStorage[(costatus+'-'+currow.priceid)]=JSON.stringify(statusobj);
			var $data=currow.applyer ? currow.applyer+" "+currow.applytime : "无",
			amount=currow.price ? (parseFloat(currow.price)/10000).toFixed(2) : "0.00";
			// (parseFloat(data.pasum)/10000).toFixed(2)
			itemhtml=itemtemp.replace("$glitem$",glclass).replace("$amount$",amount).replace("$p_busimeb$",currow.p_busimeb).replace("$btnmanager$",currow.p_manage).replace("$orderid$",currow.orderid).replace("$priceid$",currow.priceid).replace("$proname$",currow.projectname).replace("$num$",currow.pricenum).replace("$date$",$data);
			returnstr+=itemhtml;
			$(".mui-pull-bottom-pocket").find("span").eq(0).html("上拉显示更多");
		}
	}else{
		$(".mui-pull-bottom-pocket").find("span").eq(0).html("已是最后一条数据");
	}
	return returnstr;
}
//获取搜索参数 返回 参数对象
function getformparams(){
	var obj="";
	$("#ajaxform input").each(function(){
		var _this=$(this);
		if(!_this.attr("disabled")){
			//obj[$(this).attr("name")]=$(this).val();
			var thisvalue=$(this).val();
			thisvalue=thisvalue.indexOf("时间")>=0 ? "":thisvalue;
			obj+=$(this).attr("name")+"="+thisvalue+"&";
		}
	})
	return obj.slice(0,-1);
}
function parseUrlStr(obj){
	var str="";
	if(obj){
		for(var item in obj){
			str+=item+"="+obj[item]+"&";
		}
		str=str.slice(0,-1);
	}
	return str;
}
function fixedWatch(el) {
  if(document.activeElement.nodeName == 'INPUT'){
    el.css('position', 'static');
  } else {
    el.css('position', 'fixed');
    if(opobj.res ) { clearInterval(opobj.res ); opobj.res  = null; }
  }
}
// viewdetail 搜索方法
function searchlistdata(page,type){
	var loadobj=$(".mui-loading"),loadurl=hrefobj.domain+hrefobj[loadobj.attr("loadurl")],params={},pagei=page || "1",
	minheight=(window.screen.height-110)+"px";
	//params=$.extend($("#ajaxform").data("params"),getformparams());
	loadurl+="?"+opobj.formparams+"&page="+pagei+"&"+getformparams();
	showloadbox(true);
	$.mypost(loadurl,false,{},function(result){
		var loadObj=$(".mui-loading");
		if(result.data.total>0){
			$(".emptydatadiv").remove();
			var ulhtml="<ul class='mui-table-view' style='min-height:"+minheight+"'>";
			if(type =="nextpage"){
				ulhtml="";
				ulhtml+=setitemlist(result.data.list);
				loadObj.next().append(ulhtml);
			}else{
				ulhtml+=setitemlist(result.data.list);
				ulhtml +="</ul>";
				loadObj.next().remove();
				loadObj.after(ulhtml);
			}
			loadObj.data("page",parseInt(pagei)+1);
			$("#clickdownwrapup").trigger("tap");
		}else{//没有数据
			loadObj.next().remove();
			loadObj.after("<div class='emptydatadiv' style='text-align: center;height:"+window.screen.height+"px'>没有任何数据</div>");
			loadObj.hide();
		}
		$("#clickdownwrapup").trigger("tap");
		hideloadbox();
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
	return parseInt(month/3)*3;
}
//格式化 时间
function formatDate(date,type){
	var year=date.getFullYear(),
	month=date.getMonth()+1,
	day=date.getDate(),rdatestr="";
	if(month <10)
		month="0"+month;
	if(day<10)
		day="0"+day;
	rdatestr=year+"-"+month+"-"+day;
	if(type){
		var hour=date.getHours(), 
		minute=date.getMinutes(),     
		second=date.getSeconds();
		rdatestr+=" "+(hour<10 ? "0"+hour:hour)+":"+(minute<10 ? "0"+minute : minute)+":"+(second<10 ? "0"+second :second);
	}
	return rdatestr;
}
function showloadbox(type){ //默认不显示 load
	$(".i-loading").show();
	if(type){
		$(".iloadwrap").show();
	}else{
		$(".iloadwrap").hide();
	}
}
function hideloadbox(){
	$(".i-loading").hide();
}
//管辖地区模糊查询
function vaguesearch(obj){
	var ulist=$(obj).parent().next(),lilist=ulist.find("li"),index=0,value=$(obj).val(),
	sitems=lilist.length;
	if(value){
		lilist.each(function(i){
			var _this=$(this);
			if(_this.text().indexOf(value) >=0){
				index=i;
				_this.show();
				$("#nodataliobj").remove();
			}else{
				sitems--;
				_this.hide();
			}
		})
		if(sitems == 0){
			ulist.append("<li id='nodataliobj'>没有任何数据</li>");
		}
	}else{
		lilist.show();
	}
}
//返回更新 主页面信息
function reloadmaindata(){
	var token=$("#huserid").val(),
	url=hrefobj["domain"]+hrefobj.comanageurl+"?token="+token;
	$.mypost(url,false,{},function(data){
		initentrydata(data['data'],true);
		opobj.btnop=false;
	},'GET');
}
//---------------交互--method
//丢单方法
function missorderfn(sendparams){
	$(".i-loading").show();
	var url=hrefobj.domain+hrefobj.loseorderurl+"?token="+$("#huserid").val()+"&priceid="+sendparams.pid;
	$.mypost(url,false,{},function(result){
		if(result.data){
			$(".i-loading").hide();
			if($("#viewdetailgroup").length)
				$.back();
			deleteliop();
			opobj.btnop2=true;opobj.btnop=true;
		}
	},"GET");
}
function deleteliop(){
	$(".mui-table-view li").eq(opobj.curli).remove();
	if($(".mui-table-view li").length == 0){
		$(".mui-table-view").parent().append("<div class='emptydatadiv' style='text-align: center;height:"+window.screen.height+"px'>没有任何数据</div>");
	}
}
function osmethod(methodname,paramsobj){
	// window.location.href="objc://"+methodname+"/"+JSON.stringify(paramsobj);
}
function popbox(title,content){
	var sendparams={
		title:title,
		info:encodeURIComponent(opobj.ajaxerrorinfo)
	};
	window.location.href=encodeURI("objc://openpopbox/"+JSON.stringify(sendparams));
	// JSON.stringify(sendparams)
}
function showbackinfo(info){
	//alert(info);
}
function hideload(){
	$(".i-loading").hide();
}
function applycallback(status){
	opobj.btnop2=true;opobj.btnop=true;
	deleteliop();
	opobj.curbtnobj.hide();
}
function reviewcallback(status){
	opobj.btnop2=true;opobj.btnop=true;
	deleteliop();
	opobj.curbtnobj.hide();
}
function pickdatecallback(backobj){
	opobj.curdateobj.val(formatDate(new Date(backobj.date)));
}

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
      var classList=this.classList,_this=$(this),parentnode=_this.parent(),dtype=_this.attr("dtype");
      if(classList.contains("mui-input-clear")){
        var cspanel=$("<span class='mui-icon mui-icon-clear mui-hidden'></span>");
        parentnode.append(cspanel);
        _this.on("keyup",function(){
          if(_this.val()){
            cspanel.removeClass("mui-hidden").show();
          }else{
            cspanel.addClass("mui-hidden");
          }
        });
        cspanel.on("tap",function(){
          // _this.val("");
          _this.parent().find("input").val("").filter("input[name='areaid']").val("-1");
          $(this).addClass("mui-hidden");
        })
        _this.on("focus",function(){
            // if(!opobj.res) {
            //   fixedWatch($('header.mui-bar-nav'));
            //   opobj.res = setInterval(function() {
            //     fixedWatch($('header.mui-bar-nav'));
            //   }, 500);
            // }
        })
      }
      if(dtype){//处理日期
        var curstatus=$("#typehidden").val(),statusf=curstatus.substr(0,1),placeh="";
        (curstatus.indexOf("-") >=0) && (curstatus=curstatus.split('-')[0]);
        if(statusf == "c"){
          placeh=opobj.datesobj[curstatus];
        }else{
          if(curstatus.substr(1) < 30)
            placeh=opobj.datesobj["o1"];
          else
            placeh=opobj.datesobj["o2"];
        }
        (dtype=="start") && _this.attr("value",placeh+"(起)");
        (dtype=="end") && _this.attr("value",placeh+"(止)");
        _this.on("tap",function(){
          if(!$(this).attr("disabled")){
            var _thisb=$(this),ddtype=_thisb.attr("dtype"),sendparams={max:'',min:''};
            opobj.curdateobj=$(this),thisvalue=_thisb.val(),prevvalue=_thisb.prev().val(),
            nextvalue=_thisb.next().val();
            if(ddtype=="start") {
              sendparams.min=thisvalue.indexOf("时间")>=0 ? "" : Date.parse(thisvalue);
              sendparams.max=nextvalue.indexOf("时间")>=0 ? "" : Date.parse(nextvalue);
            }else{
              sendparams.min=prevvalue.indexOf("时间")>=0 ? "" : Date.parse(prevvalue);
              sendparams.max=thisvalue.indexOf("时间")>=0 ? "" : Date.parse(thisvalue);
            }
            // window.location.href="objc://pickdate/"+JSON.stringify(sendparams);
          }
        });
      }
    })
    return this;
  }
  $.mypost=function(url,async,data,callback,type,errorback){
   		 // 同步为 false
	    type= type || "POST";
	    errorback=errorback|| function(){popbox("",opobj.ajaxerrorinfo);};
	    $.ajax({
	      type:type,
	      url:url,
	      async:async,
	      dataType:"json",
	      data:data,
	      success:callback,
	      error:errorback 
	    });
  }
  $.fn.myLoad=function(url,data,callback,async){
		var _this=$(this);
		async=async||false,cachedata=Util.getCache(url,Util.getStamp());
		if(cachedata){
			_this.html(cachedata.data);
			if(callback)
				callback(_this);
		}else{
			$.ajax({url:url,data:data,async:async,dataType:"text",error:function(){
			// box.alert(kmsg.ajaxerrorMsg);
			},success:function(rehtml){
				if (rehtml) {
					_this.html(rehtml);
					Util.setCache(url,rehtml);
					if(callback)
						callback(_this);
				}
			}});
		}
		return this;
	} 
})(Zepto, window)
/**
 * fixed CustomEvent
 */
;(function() {
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
})()
/**
 * mui fixed requestAnimationFrame
 * @param {type} window
 * @returns {undefined}
 */
;(function(window) {
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
}(window))
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