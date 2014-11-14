$(function(){
	$(".linear-gradient-div").each(function(){
		var _this=$(this),headheight=_this.find(".statusHeader").height();
		_this.find("canvas").attr("width",_this.width()-10).attr("height",_this.height()-headheight-10);
	});
	var canvas=$("#mycanvas"),context=canvas[0].getContext("2d");
	context.beginPath();
	context.arc(canvas.width()/2, canvas.height(), 100, 0, Math.PI, true);
	var g=context.createLinearGradient((canvas.width()/2-50),canvas.height(),(canvas.width()/2+50),canvas.height());
	g.addColorStop(0,"#fd08a8");
	g.addColorStop(1,"#ff1415");
	context.fillStyle=g;
	context.fill();
	context.closePath();
	context.globalCompositeOperation="destination-out";
	context.beginPath();
	context.arc(canvas.width()/2, canvas.height(), 90, 0, Math.PI, true);
	context.fillStyle="#0062CC";
	context.fill();
	context.closePath();
//	context.globalCompositeOperation="destination-out";
//	context.beginPath();
	//second
	var seccanvas=$("#seccanvas"),ctx2=seccanvas[0].getContext("2d");
	Util.drawarc(seccanvas,ctx2,{radius:70,shadow:true});
	Util.drawpartarc(seccanvas,ctx2,{radius:66,startAngle:0,endAngle:Math.PI/1.5,color:"#047bc1",text:"Commit",amount:"21.1万元"});
//	Util.drawpartarc(seccanvas,ctx2,{radius:60,startAngle:Math.PI/1.5,endAngle:Math.PI*1.4,color:"#fcbc13",text:"待Sell out",amount:"3.1万元"});
//	Util.drawpartarc(seccanvas,ctx2,{radius:54,startAngle:Math.PI*1.4,endAngle:Math.PI*2,color:"#f35040",text:"已Sell out",amount:"0.1万元"});
	ctx2.globalCompositeOperation="destination-out";
	Util.drawarc(seccanvas,ctx2,{radius:40,shadow:false});//遮罩
	
	var thirdcanvas=$("#thirdcanvas"),ctx3=thirdcanvas[0].getContext("2d");
	Util.drawRect(thirdcanvas,ctx3,{color:"#f14b40",drawinfo:[{text:"审核中",amount:"322323.2"},{text:"已审未sell out",amount:"54323.45"}]});
	
	var forthcanvas=$("#forthcanvas"),ctx4=forthcanvas[0].getContext("2d");
	Util.drawarc(forthcanvas,ctx4,{radius:70,shadow:true});
//	Util.drawpartarc(forthcanvas,ctx4,{radius:66,startAngle:0,endAngle:Math.PI/1.7,color:"#2796d9",text:"审核中",amount:"4.12万元"});
//	Util.drawpartarc(forthcanvas,ctx4,{radius:60,startAngle:Math.PI/1.7,endAngle:Math.PI/1.3,color:"#ead038",text:"已签未付款",amount:"2.24万元"});
//	Util.drawpartarc(forthcanvas,ctx4,{radius:62,startAngle:Math.PI/1.3,endAngle:Math.PI*1.1,color:"#ee9840",text:"已签未未发货",amount:"2.01万元"});
//	Util.drawpartarc(forthcanvas,ctx4,{radius:66,startAngle:Math.PI*1.1,endAngle:Math.PI*1.4,color:"#59a8b3",text:"签约中",amount:"1.23万元"});
//	Util.drawpartarc(forthcanvas,ctx4,{radius:58,startAngle:Math.PI*1.4,endAngle:Math.PI*2,color:"#73964e",text:"已审未签",amount:"1.98万元"});
	ctx4.globalCompositeOperation="destination-out";
	Util.drawarc(forthcanvas,ctx4,{radius:40,shadow:false});//遮罩
	
	var fivecanvas=$("#fivecanvas"),ctx5=fivecanvas[0].getContext("2d");
	Util.drawRect(fivecanvas,ctx5,{color:"#fcc125",drawinfo:[{text:"付款中",amount:"3456.87"},{text:"完成收款",amount:"4001.67"}]});
	
	var sexcanvas1=$("#sexcanvas1"),ctx6=sexcanvas1[0].getContext("2d");
	Util.drawOrderTips(sexcanvas1,ctx6,{});
	sexcanvas1.css("left","58%");
	sexcanvas1.next().css("left","48%");
	var sexcanvas2=$("#sexcanvas2"),ctx7=sexcanvas2[0].getContext("2d");
	Util.drawOrderTips(sexcanvas2,ctx7,{graSColor:"#2499d0",graEColor:"#2489c3"});
	sexcanvas2.css("left","28%");
	sexcanvas2.next().css("left","18%");
})