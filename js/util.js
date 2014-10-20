var Util={
	os:{
		ios:null,
		android:null
	},
	support : {
		storage : !!window.localStorage
	},
	toInt:function(str){
		return parseInt(str);
	},
	toFloat:function(str){
		return parseFloat(str);
	},
	writelog:function(title){
		console.log(title+":"+(new Date()).format("hh:mm:ss S"));
	},
	//--时间相关的方法

	//获取时间戳
	getStamp:function(){
		return new Date * 1;
		// return Date.parse(new Date());
	},
	getMonthDays:function(month){// 通过时间差 timespan
		var year=(new Date()).getFullYear(),
		monthstartdate=new Date(year,month,1),
		monthenddate=new Date(year,month+1,1);
		return (monthenddate-monthstartdate)/(1000*60*60*24);
	},
	//缓存相关方法
	// 设置cache
	getLocalKey:function(src){
		var s='SPA_'+src.substr(0,src.indexOf('?'));
		return {
			data:s+"_data",
			time:s+"_time"
		};
	},
	setCache : function(src, data) {
		var time = Util.getStamp(), key;
		if (Util.support.storage) {
			Util.removeCache(src);
			key = Util.getLocalKey(src);
			localStorage.setItem(key.data, data);
			localStorage.setItem(key.time, time);
		}
	},
	removeCache:function(src){
		if (Util.support.storage) {
			var key = Util.getLocalKey(src);
			localStorage.removeItem(key.data);
			localStorage.removeItem(key.time);
			localStorage.removeItem(key.title);
		}
	},
	getCache:function(src,time){ //附加过期时间 ，，time 时间戳
		var item, vkey, tkey, tval;
		time = Util.toInt(time);
		if (Util.support.storage) { // 从localStorage里查询
			var l = Util.getLocalKey(src);
			vkey = l.data;
			tkey = l.time;
			item = localStorage.getItem(vkey);
			if (item) {
				tval = Util.toInt(localStorage.getItem(tkey));
				if ((tval + time * 1000) > Util.getStamp()) {
					return {
						data : item
					};
				} else {
					localStorage.removeItem(vkey);
					localStorage.removeItem(tkey);
				}
			}
		}
		return null;
	},
	// 清除所有的cache
	removeAllCache : function() {
		if (!Util.support.storage)
			return;
		for ( var name in localStorage) {
			if ((name.split('_') || [ '' ])[0] === 'SPA') {
				delete localStorage[name];
			}
		}
	},
	getUrlParams:function(url,reparam){
		var params=url.substring(url.indexOf('?')+1),paramsarr=params.split('&');
		for(var ci=0;ci<paramsarr.length;ci++){
			if(paramsarr[ci].split('=')[0] == reparam){
				return paramsarr[ci].split('=')[1];
			}
		}
	}
}
Date.prototype.format = function(format){ 
	var o = { 
		"M+" : this.getMonth()+1, //month 
		"d+" : this.getDate(), //day 
		"h+" : this.getHours(), //hour 
		"m+" : this.getMinutes(), //minute 
		"s+" : this.getSeconds(), //second 
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter 
		"S" : this.getMilliseconds() //millisecond 
	} 
	if(/(y+)/.test(format)) { 
		format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
	} 
	for(var k in o) { 
		if(new RegExp("("+ k +")").test(format)) { 
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
		} 
	} 
	return format; 
} 