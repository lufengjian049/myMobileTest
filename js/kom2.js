var db="",
hrefobj={
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
	popmsg:{
		sellout:"温馨提示:<br/>跳过Commit步骤直接sell out订单操作，仅适用于大区总监和商务中心部负责人授权的紧急情况"
	}
};
$(function(){
	db=openDatabase("commitorderdb","1.0","commit&order data",1024*1024);
	db.transaction(function(tx){
		tx.executeSql("drop table costatustable");
	});
	//共用方法 && 自定义
  	$.back=function(){
		window.history.back();
  	}
	//kom-entry 块数据的加载与显示
	$.fn.initAjax=function(options){
		var _this=$(this);
		if(_this.data("initajax")){
			//添加 下拉刷新
			// if(_this.data("pullload")){
			// 	db.transaction(function(tx){
			// 		tx.executeSql("drop table costatustable");
			// 		console.log("delete table costatustable");
			// 	});
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
			//}
			//判断 本地数据库中是否存在数据
			db.transaction(function(tr){
				tr.executeSql("create table if not exists costatustable (costatus,statusobj)");
				console.log("create table costatustable");
				tr.executeSql("select * from costatustable",[],function(tx,rs){
					var rows=rs.rows,len=rows.length,data={};
					if(len){
						for(var i=0;i<len;i++){
							var item=rows.item(i);
							(item.statusobj!= "undefined") && (data[item.costatus]=JSON.parse(item.statusobj));
						}
						options.callback(data,true);
					}else{
						var token=getUrlParams(location.href,"token"),
						url=hrefobj["domain"]+hrefobj.comanageurl+"?token="+token;
						$("#huserid").val(token);
						$("#hcommitpre").val(getUrlParams(location.href,"commitshow"));
						$("#horderpre").val(getUrlParams(location.href,"ordershow"));
						$.ajax({url:url,async:false,success:function(data){
							options.callback(data['data']);
						},error:function(){
							alert("请求出错！");
						}});
					}
				});
			});
		}
		return _this;
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
			}
		}else{
			$.back();
		}
		return false;
	});
	$("#extenddivmenu").on("tap",function(){
		var transf=$("#offcanvaswrap").css("webkitTransform") || "translate3d(0,0,0)",tanre=/translate(?:3d)?\((.+?)\)/;
		var result=transf.match(tanre),wheight=window.screen.availHeight;
		result=result[1].split(',');
		var newobj=$("header").add("#container"); 
		if(parseInt(result[0]) == 0){
			newobj.wrapAll("<div id='offcanvaswrap'></div>");//maincontain
			$("#offcanvaswrap").css({"position":"absolute","height":wheight+"px","overflow":"hidden"}).before($("#offCanvas"));
			$("#offCanvas").show();
			$("#offcanvaswrap").css({
                        "-webkit-transform":"translate3d(-80%,0,0)",
                        "-webkit-transition":"-webkit-transform .4s ease-in-out"
        	})
        	$(this).data("swipe","true");
        	$("#detailmask").show();
        	// $("#container")
        }
		else{
			$("#offCanvas").appendTo($("#container"));
			$("#offCanvas").hide();
			$("#offcanvaswrap").css({
                        "-webkit-transform":"translate3d(0,0,0)",
                        "-webkit-transition":"-webkit-transform .4s ease-in-out"
        	})
        	$(this).removeData("swipe");                                                                                                            
        	$("#detailmask").hide();
        	newobj.unwrap();
		}
        return false;
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
	})
	$(window).on("swipeLeft",function(e){
		var extendbtn=$("#extenddivmenu");
		(extendbtn.css("display")!="none") && extendbtn.trigger("tap");
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
});
//操作按钮的处理
function btntapevent(obj){
	var curstatus=$("#typehidden").val(),curitemparams=$("#itemparams").val(),
	sendparams={
		applystatus:2,
		tab:$(obj).attr("type"),
		type:$(obj).attr("typep") || ""
	};
	opobj.curbtnobj=obj;
	opobj.btnop=true;
	if(!curitemparams){
		var idp=getUrlParams(location.href,"priceid"),ido=getUrlParams(location.href,"orderid"),
		curid=ido || idp;
		curitemparams={
			id:curid
		};
	}else{
		curitemparams=JSON.parse(curitemparams);
	}

	sendparams=$.extend(sendparams,curitemparams);
	if(sendparams.tab== "loseorder"){
		var re=confirm("是否确认已丢单");
		if(re== true){
			$(".i-loading").show();
			var url=hrefobj.domain+hrefobj.loseorderurl+"?token="+$("#huserid").val()+"&priceid="+sendparams.id;
			$.mypost(url,true,{},function(result){
				if(result.data){
					$(".i-loading").hide();
					opobj.curli.remove();
				}
			},"GET");
		}
	}else{
		if($(obj).attr("confirminfo")){
			var recon=confirm(opobj.popmsg[$(obj).attr("confirminfo")]);
			if(recon){
				window.location.href="objc://openwin/"+JSON.stringify(sendparams);
			}
		}else{
			window.location.href="objc://openwin/"+JSON.stringify(sendparams);
		}
	}
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
	minheight=(window.screen.height-110)+"px";
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
	$("#"+formid).data("params",getparams);
	$.mypost(loadurl,false,{},function(result){
		total=result.data.total;
		if(total>0){
			var ulhtml="<ul class='mui-table-view' style='min-height:"+minheight+"'>";
			ulhtml+=setitemlist(result.data.list);
			ulhtml +="</ul>";
			loadObj.data("page",page+1);
			loadObj.after(ulhtml);
			loadObj.hide();
		}else{//没有数据
			loadObj.after("<div style='text-align: center;height:"+window.screen.height+"px'>没有任何数据</div>");
			loadObj.hide();
		}
	})
	return total;
}
//初始化块数据
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
				db.transaction(function(tx){
					tx.executeSql("create table if not exists costatustable (costatus,statusobj)");
					tx.executeSql("delete from costatustable where costatus=?",[param],function(){
					});
			  		tx.executeSql("insert into costatustable(costatus,statusobj) values (?,?)",[param,paramnum],function(){
			  		});
			  	});
			}
			db.transaction(function(tx){
				tx.executeSql("create table if not exists costatustable (costatus,statusobj)");
				tx.executeSql("delete from costatustable where costatus=?",[entrystr],function(){
				});
		  		data && tx.executeSql("insert into costatustable(costatus,statusobj) values (?,?)",[entrystr,JSON.stringify(data)],function(){
		  		});
		  	});
		}
	})
	
	$(".i-loading").hide();
	if(nopjax) return;
	$.pjax({
		init:true,
		selector:"div.kom-entry",
		titleSuffix: '',
		sethref:function(curobj){
			var _this=$(curobj),returnvalue=false;;
			if(_this.hasClass("entry-dis")){
				$(".i-loading").hide();
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
			viewdataload();
		}
	});
}
function viewdataload(){
	//data-loading
	$("#typehidden").val(getUrlParams(decodeURIComponent(location.href),"type"));
	var total=0;
	$("div.mui-loading").each(function(){
		var _this=$(this);
		// alert(window.screen.height);
		 _this.height(window.screen.height+"px");
		if(_this.data("loading")){
			var innerhtml='<div class="mui-spinner">';
			for(var i=0;i<12;i++){
				innerhtml+="<div class='mui-spinner-indicator mui-spinner-indicator"+(i+1)+"'></div>";
			}
			innerhtml +="</div>";
			_this.html(innerhtml);
			total=loaddatalist(_this);
		}
	});
	// 初始化 右侧菜单
	$("#offCanvas").initAjax({
		callback:function(data,nopjax){
			initentrydata(data,nopjax);
		}
	});
	
  	//点击 列表项---为列表项绑定 Pjax
  	$.pjax({
  		selector:".pjaxitem",
		titleSuffix: '',
		sethref:function(curobj){
			var costatus=$("#typehidden").val(),type='',pstaus=costatus.substr(0,1),
	  		status=costatus.substr(1),ordertype='-1',title='订单详情';
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
	  			id:$(curobj).attr("priceid"),applystatus:2,tab:type,stauts:status,type:ordertype
	  		};
	  		if(type){
	  			window.location.href="objc://getkinddetail/"+JSON.stringify(sendparams);
	  			return true;
	  		}
	  		else{
	  			$(curobj).attr("href","orderinfo.html?title="+title+"&myreview="+$(curobj).hasClass("reviewitem")+"&orderid="+$(curobj).attr("orderid")+"&p_manage="+$(curobj).attr("btnmanager")+"&status="+$("#typehidden").val()+"&priceid="+$(curobj).attr("priceid"));
	  			return false;
	  		}
		},callback:function(){
			orderdetailload();
		}
  	});
	backfn(total);
}
function backfn(total){
	if(!$("#ajaxform").length) return;
	//data-dropdownlist

	$("#clickdownwrap").on("tap",function(){
  		var _this=$(this);
  		$(".i-loading").show();
  		$("#othersearch").show();
  		_this.prev().find("button").hide().eq(1).next().css("right","10px").siblings("input").css({"width":"100%","text-align":"left","border-color":"red"}).next().hide();
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
				_this.find("input[type='text']").on("keyup",function(){
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
  			id:$(this).attr("priceid")
  		},reviewstatus=['c1','o1-0','o1-1'],orderid=$(this).attr("orderid"),showitems=$(""),_thisp=$(this);
  		(orderid !="undefined") && (itemparams.id=orderid);
  		if(reviewstatus.indexOf(curstatus) >=0 && !$(this).hasClass("reviewitem")){
  			return;
  		}
  		$("#popbtns span").each(function(){
  			var _this=$(this);
  			if(_this.attr("nosee")){
  				if(_this.attr("nosee").indexOf(curstatus) >=0)
  					_this.hide();
  				else{
  					if(_thisp.attr("btnmanager") == 1){
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
			  				_this.show();
			  				showitems=showitems.add(_this);
			  				hastwo.push(_this.hasClass("tworow") ? "1":"0");
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
  		opobj.curli=_thisp;
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
		$(".i-loading").hide();
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
	
	pulldownupex(total);
	$(".searchdiv input").inputinit();
}
//订单详情页面 加载数据
function orderdetailload(){
	var viewdetailgroup=$("#viewdetailgroup"),loadurl=hrefobj.domain+hrefobj[viewdetailgroup.attr("loadurl")];
	loadurl+="?token="+$("#huserid").val()+"&orderid="+getUrlParams(location.href,"orderid");
	var comm={
		ordertype:{"0":"产品","1":"服务"},
		orderstatus:{'0':'待sell out','1':'审核中','10':'已审未签','20':'审核拒绝','30':'已sell out','35':'发货中','36':'实施中','40':'已提货','50':'已完成','60':'已丢单'}
	};
	$(".i-loading").show();
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
						pvalue=formatDate(changed);
					}
					_this.find("span").html(pvalue);
				}
			}else{
				_this.hide();
			}
		})
		$(".i-loading").hide();
	},"GET");
	var p_manage=getUrlParams(location.href,"p_manage"),status=getUrlParams(location.href,"status"),
	myreview=getUrlParams(location.href,"myreview");
	if(p_manage =="1" || myreview == 'true'){
		$("#viewdetailbtngroup button").each(function(){
			var btnobj=$(this),btnstatus=btnobj.attr("showstatus");
			if(!btnstatus){
				(p_manage =="1") && btnobj.show();
			}else{
				if(btnstatus.indexOf(status) >=0){
					btnobj.show();
				}
			}
		})
	}
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
                callback: function(callback) {
                	//下拉 刷新
                	searchlistdata();
                	callback();
                }
            }
	};
	if(parseInt(total) >10 ){
		pullobj.up={
                callback:function(callback){
                	//上拉 加载下一页
                	var page=loadobj.data("page");
                	searchlistdata(page,"nextpage");
                	callback();
                }
            }
	}
	$("#maincontain").pullRefresh(pullobj);
}
function setitemlist(rows){
	var itemtemp=$("#itemtemp").html(),returnstr="",itemhtml="";
	if(rows && rows.length>0){
		for(var i=0;i<rows.length;i++){
			var currow=rows[i],glclass=currow.myapprove == 1 ? "reviewitem" : "",
			costatus=currow.kind+currow.status,statusobj={
				statusorder:currow.statusorder,
				statusservice:currow.statusservice
			};
			if(costatus == "c0")
				sessionStorage[(costatus+'-'+currow.priceid)]=JSON.stringify(statusobj);
			itemhtml=itemtemp.replace("$glitem$",glclass).replace("$btnmanager$",currow.p_manage).replace("$orderid$",currow.orderid).replace("$priceid$",currow.priceid).replace("$proname$",currow.projectname).replace("$num$",currow.pricenum).replace("$date$",currow.applyer+" "+currow.applytime);
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
			obj+=$(this).attr("name")+"="+$(this).val()+"&";
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
// viewdetail 搜索方法
function searchlistdata(page,type){
	var loadobj=$(".mui-loading"),loadurl=hrefobj.domain+hrefobj[loadobj.attr("loadurl")],params={},pagei=page || "1",
	minheight=(window.screen.height-110)+"px";
	//params=$.extend($("#ajaxform").data("params"),getformparams());
	loadurl+="?"+$("#ajaxform").data("params")+"&page="+pagei+"&"+getformparams();
	$(".i-loading").show();
	$.mypost(loadurl,false,{},function(result){
		var loadObj=$(".mui-loading");
		if(result.data.total>0){
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
			loadObj.after("<div style='text-align: center;height:"+window.screen.height+"px'>没有任何数据</div>");
			loadObj.hide();
		}
		$("#clickdownwrapup").trigger("tap");
		$(".i-loading").hide();
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
	day=date.getDate();
	// hour=date.getHours();     
	// minute=date.getMinutes();     
	// second=date.getSeconds(),
	// redate="";
	if(month <10)
		month="0"+month;
	if(day<10)
		day="0"+day;
	return (year+"-"+month+"-"+day);
}
//管辖地区模糊查询
function vaguesearch(obj){
	var ulist=$(obj).parent().next(),lilist=ulist.find("li"),index=0,value=$(obj).val();
	if(value){
		lilist.each(function(i){
			var _this=$(this);
			if(_this.text().indexOf(value) >=0){
				index=i;
				_this.show();
			}else{
				_this.hide();
			}
		})
	}else{
		lilist.show();
	}
}
//返回更新 主页面信息
function reloadmaindata(){
	var token=$("#huserid").val(),
	url=hrefobj["domain"]+hrefobj.comanageurl+"?token="+token;
	$.ajax({url:url,async:false,success:function(data){
		initentrydata(data['data'],true);
		opobj.btnop=false;
	},error:function(){
		alert("请求出错！");
	}});
}
//交互--method
function showbackinfo(info){
	alert(info);
}
function hideload(){
	$(".i-loading").hide();
}
function applycallback(status){
	if(status){
		//alert(JSON.stringify(status));
		opobj.curli.remove();
		opobj.curbtnobj.hide();
	}
}
function reviewcallback(status){
	if(status){
		//alert(JSON.stringify(status));
		opobj.curbtnobj.hide();
		opobj.curli.remove();
	}
}

