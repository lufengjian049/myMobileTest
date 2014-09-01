var db="";
$(function(){
	db=openDatabase("testdb","1.0","test",1024*1024);
	db.transaction(function(tx){
  		tx.executeSql("create table if not exists foo (id unique,text)");
  		tx.executeSql("insert into foo(id,text) values (1,'test1')");
  	});
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
//	$("#testdb").click(function(){
//		db.transaction(function(tr){
//			tr.executeSql("select * from foo",[],function(tx,rs){
//				var rows=rs.rows,len=rows.length,rhtml="";
//				for(var i=0;i<len;i++){
//					var item=rows.item(i);
//					rhtml+="id:"+item.id+";text:"+item.text;
//				}
//				$("#resultdb").html(rhtml);
//			})
//		})
//	})
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
});
function getUrlParams(url,reparam){
	var params=url.substring(url.indexOf('?')+1),paramsarr=params.split('&');
	for(var ci=0;ci<paramsarr.length;ci++){
		if(paramsarr[ci].split('=')[0] == reparam){
			return paramsarr[ci].split('=')[1];
		}
	}
}

