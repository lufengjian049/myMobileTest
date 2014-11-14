var Util={
	os:{
		ios:null,
		android:null,
		height:window.screen.height
	},
	getOs:function(){
		var ua=navigator.userAgent,android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
		if(android){
			this.os.android = true;
            this.os.version = android[2];
            (window.devicePixelRatio) && (this.os.height=window.screen.height/window.devicePixelRatio);
		}
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
	},
	drawarc:function(canvas,ctx2,options){//画圆
		options=$.extend({},{x:canvas.width()/2,y:canvas.height()/2,shadow:false,startAngle:0,endAngle:Math.PI*2,linewidth:2,strokeColor:'',color:'',radius:2},options);
		ctx2.beginPath();
		ctx2.arc(options.x,options.y,options.radius,options.startAngle,options.endAngle,false);
		if(options.shadow){
			ctx2.shadowOffsetX=0;
			ctx2.shadowOffsetY=0;
			ctx2.shadowBlur=4;
			ctx2.shadowColor="#687278";
			ctx2.strokeStyle="rgba(111,120,125,.5)";
			ctx2.fillStyle="transparent";
			ctx2.stroke();
		}else{
			ctx2.fillStyle=options.color;
		}
		if(options.strokeColor){
			ctx2.strokeStyle=options.strokeColor;
			ctx2.lineWidth=options.linewidth;
			ctx2.stroke();
		}
		ctx2.fill();
		ctx2.closePath();
	},
	drawpartarc:function(canvas,ctx,options){ //画部分圆--附带 添加折线 提示功能
		options=$.extend({},{startAngle:0,endAngle:Math.PI*2},options);
		ctx.beginPath();
		var x=canvas.width()/2,y=canvas.height()/2;
		ctx.moveTo(x,y);
		this.canvasMove({start:options.startAngle,end:options.endAngle},function(start,end){
			ctx.arc(x,y,options.radius,start,end,false);
			ctx.fillStyle=options.color;
			ctx.fill();
		})
//		ctx.arc(x,y,options.radius,options.startAngle,options.endAngle,false);
//		ctx.fillStyle=options.color;
//		ctx.fill();
		ctx.closePath();
		options.x=x;options.y=y;
		this.drawFoldLine(canvas,ctx,options);
	},
	drawFoldLine:function(canvas,ctx,options){//画折线
		var lineStartAngle=(options.endAngle-options.startAngle)/2 + options.startAngle,
		lineRadius=options.radius - (options.radius-40)/2,startpos={x:'',y:''},foldPos={x:'',y:''},  //foldPos 折点坐标
		endPos={x:'',y:''},foldx=20,foldy=20,linewidth=70,arcPos={x:'',y:''},arcradius=2,
		textpos={x:'',y:''},textHeight=10;
		ctx.beginPath();
		switch (true){
			case lineStartAngle<=Math.PI/2 :
				startpos.x=lineRadius*Math.cos(lineStartAngle)+options.x;
				startpos.y=lineRadius*Math.sin(lineStartAngle)+options.y;
				foldPos.x=startpos.x+foldx;foldPos.y=startpos.y+foldy;
				endPos.x=linewidth+foldPos.x;endPos.y=foldPos.y;
				arcPos.x=endPos.x+arcradius;arcPos.y=endPos.y;
				textpos.x=endPos.x-linewidth/2;textpos.y=endPos.y-textHeight;
			break;
			case (lineStartAngle<=Math.PI &&  lineStartAngle > Math.PI/2):
				lineStartAngle=Math.PI-lineStartAngle;
				startpos.x=options.x-lineRadius*Math.cos(lineStartAngle);
				startpos.y=lineRadius*Math.sin(lineStartAngle)+options.y;
				foldPos.x=startpos.x-foldx;foldPos.y=startpos.y+foldy;
				endPos.x=foldPos.x-linewidth;endPos.y=foldPos.y;
				arcPos.x=endPos.x-arcradius;arcPos.y=endPos.y;
				textpos.x=endPos.x+linewidth/2;textpos.y=endPos.y-textHeight;
			break;
			case (lineStartAngle<=Math.PI*1.5 && lineStartAngle > Math.PI):
				lineStartAngle= lineStartAngle -Math.PI;
				startpos.x=options.x-lineRadius*Math.cos(lineStartAngle);
				startpos.y=options.y-lineRadius*Math.sin(lineStartAngle);
				foldPos.x=startpos.x-foldx;foldPos.y=startpos.y-foldy;
				endPos.x=foldPos.x-linewidth;endPos.y=foldPos.y;
				arcPos.x=endPos.x-arcradius;arcPos.y=endPos.y;
				textpos.x=endPos.x+linewidth/2;textpos.y=endPos.y-textHeight;
			break;
			case (lineStartAngle<=Math.PI*2 && lineStartAngle>Math.PI * 1.5 ):
				lineStartAngle= Math.PI*2 - lineStartAngle;
				startpos.x=options.x+lineRadius*Math.cos(lineStartAngle);
				startpos.y=options.y-lineRadius*Math.sin(lineStartAngle);
				foldPos.x=startpos.x+foldx;foldPos.y=startpos.y-foldy;
				endPos.x=linewidth+foldPos.x;endPos.y=foldPos.y;
				arcPos.x=endPos.x+arcradius;arcPos.y=endPos.y;
				textpos.x=endPos.x-linewidth/2;textpos.y=endPos.y-textHeight;
			break;
		}
		//画折线
		ctx.moveTo(startpos.x,startpos.y);
		ctx.lineTo(foldPos.x,foldPos.y);
		ctx.lineTo(endPos.x,endPos.y);
		ctx.strokeStyle="#fff";
		ctx.stroke();
		ctx.closePath();
		//结束路径 开始 画折线圆
		ctx.beginPath();
		ctx.arc(arcPos.x,arcPos.y,arcradius,0,Math.PI*2,false);
		ctx.strokeStyle="#fff";
		ctx.stroke();
		ctx.fillStyle=options.color;
		ctx.fill();
		ctx.closePath();
		//绘制文本
		this.drawText(canvas,ctx,{text:[options.text,options.amount],baseX:textpos.x,baseY:textpos.y});
	},
	drawRect:function(canvas,ctx,options){ //绘制矩形
		var cWidth=canvas.width(),cHeight=canvas.height(),rectX=30,rectY=cHeight/2,rectWidth=cWidth-rectX*2-10,rectHeight=10,
		totalamount=parseFloat(options.drawinfo[0].amount)+parseFloat(options.drawinfo[1].amount),
		secRectWidth=rectWidth*(options.drawinfo[1].amount/totalamount),//蒙版矩形的宽度
		secRectX=(rectWidth-secRectWidth)+rectX+1,secRectY=rectY-35,secRectHeight=80;//蒙版矩形的开始 x 坐标 , +1 是因为 矩形有边框
		ctx.fillStyle=options.color;
		ctx.strokeStyle="#000";
		ctx.rect(rectX,rectY,rectWidth,rectHeight);
		ctx.stroke();
		ctx.fill();
		//绘制第二个蒙版矩形
		this.drawarc(canvas,ctx,{x:secRectX-1,y:secRectY,color:options.color,radius:2,strokeColor:"#fff",linewidth:3});
		ctx.beginPath();
		ctx.moveTo(secRectX-1,secRectY+3);
		ctx.lineTo(secRectX-1,secRectY+80);
		ctx.strokeStyle="#fff";
		ctx.lineWidth=1;
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle="rgba(188,200,207,.5)";
		ctx.fillRect(secRectX,secRectY,secRectWidth,secRectHeight);
		//绘制文本
		this.drawText(canvas,ctx,{text:[options.drawinfo[0].text,options.drawinfo[0].amount],baseX:secRectX,baseY: secRectY+10,basealign:'left'});
		this.drawText(canvas,ctx,{text:[options.drawinfo[1].text,options.drawinfo[1].amount],baseX:secRectX,baseY:secRectY+60,basealign:'right'});
	},
	drawText:function(canvas,ctx,options){//绘制文本
		var options=$.extend({},{textalign:"center",font:"6px arial",color:"#000",text:[],baseX:'',baseY:'',basealign:'top'},options);
		//基线 为 fillText 的 坐标   
		//基准点的坐标 ， 显示的位置(tap,left,right,bottom),通过context.measureText(text).width; 计算坐标
		ctx.textAlign=options.textalign;
		ctx.font=options.font;
		ctx.fillStyle=options.color;
		var textX=options.baseX,textY=options.baseY,textWidthArr=[];
		for(var i=0;i<options.text.length;i++){
			textWidthArr.push(ctx.measureText(options.text[i]).width);
		}
		var theWidthest=Math.max.apply(null,textWidthArr); //获取最大的宽度
		if(options.baseX && options.baseY){
			switch(options.basealign){
				case 'left':
					textX=options.baseX-theWidthest/2-2;
				break;
				case 'right':
					textX=options.baseX+theWidthest/2+2;
				break;
			}
		}
		for(var i=0;i<options.text.length;i++){
			ctx.fillText(options.text[i],textX,textY);
			textY+=12;
		}
	},
	drawOrderTips:function(canvas,ctx,options){ //绘制-排名的小椭圆
		var options=$.extend({}, {graSColor:"#f83741",graEColor:"#f530a2"}, options),cwidth=28,cheight=28;
		ctx.beginPath();
		ctx.moveTo(cwidth/2,0);
		ctx.quadraticCurveTo(0,0,cwidth/2,cheight);
		ctx.moveTo(cwidth/2,0);
		ctx.quadraticCurveTo(cwidth,0,cwidth/2,cheight);
		var lig=ctx.createLinearGradient(cwidth/2,0,cwidth/2,cheight);
		lig.addColorStop(0,options.graSColor);
		lig.addColorStop(1,options.graEColor);
		ctx.fillStyle=lig;   //"#f53540";
		ctx.fill();
		this.drawarc(canvas,ctx,{x:cwidth/2,y:10,radius:3,color:"#fff"});
	},
	canvasMove:function(pro,action){
		//pro--start end
		var options=$.extend({},{dur:400},pro);
		var count=10,itemtime=options.dur/count,item=(options.end-options.start)/count;
		var t=setInterval(function(){
			var startpro=options.start,endpro=startpro+item;
			action(startpro,endpro);
			if(endpro == options.end){
				clearInterval(t);
			}
			options.start=endpro;options.end=endpro+item;
		},itemtime);
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