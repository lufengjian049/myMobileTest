var db="";
$(function(){
	db=openDatabase("commitorderdb","1.0","commit&order data",1024*1024);
//	db.transaction(function(tx){
//		tx.executeSql("drop table costatustable");
//	});
  	$.back=function(){
  		alert(window.history.length);
  		if (window.history.length > 1) {
			window.history.back();
			window.location.reload();
		}
  	}
	$(".mui-action-back").click(function(){
		window.close();
	})
	$(".kom-entry").click(function(){
		var _this=$(this),curstatusn=_this.text(),remark=_this.find("div").html(),badge=_this.find(".mui-badge").html();
		curstatusn=curstatusn.replace(remark,"").replace(badge,"");
		if(_this.hasClass("kom-entry-harf")){
			if(_this.hasClass("harf-left")) curstatusn="产品"+curstatusn;
			else curstatusn="服务"+curstatusn;
		}
		location.href="viewdetail.html?curstatusn="+encodeURIComponent(curstatusn);
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
			//判断 本地数据库中是否存在数据
			db.transaction(function(tr){
				tr.executeSql("create table if not exists costatustable (costatus,statusobj)");
				tr.executeSql("select * from costatustable",[],function(tx,rs){
					var rows=rs.rows,len=rows.length;
					if(len){
						var data={};
						for(var i=0;i<len;i++){
							var item=rows.item(i);
							(item.statusobj!= "undefined") && (data[item.costatus]=JSON.parse(item.statusobj));
						}
					}else{
						//ajax请求---发送请求，获取数据 post
						var data={"o60":{projectnum:4,amout:2.34},"o0-0":{projectnum:14,amout:23.33}};
					}
					options.callback(data);
				});
			});
		}
		return _this;
	}
	$("div.mui-content,#offCanvas").initAjax({
		callback:function(data){
			initentrydata(data);
		}
	});
	
	//--
});
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
		ulhtml +=itemTemp.replace("$proname$","跨地区项目"+(i)).replace("$num$","LYSYW-046B-P8TO").replace("$date$","崔伟宾 2014-9-2");
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
			if(data)
				_this.append("<div>"+data.projectnum+"|"+data.amout+"</div>");
//			else
//				_this.append("<div>&nbsp;</div>");
			db.transaction(function(tx){
				tx.executeSql("create table if not exists costatustable (costatus,statusobj)");
		  		tx.executeSql("insert into costatustable(costatus,statusobj) values ('"+entrystr+"','"+JSON.stringify(data)+"')");
		  	});
		}
	})
}

