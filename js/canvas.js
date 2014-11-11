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
	context.globalCompositeOperation="destination-out";
	context.beginPath();
	var seccanvas=$("#seccanvas"),ctx2=seccanvas[0].getContext("2d");
	drawarc(canvas,ctx2,{radius:70,shadow:true});
	drawpartarc(canvas,ctx2,{radius:60,startAngle:0,endAngle:Math.PI/6,color:"#047bc1"});
//				ctx2.globalCompositeOperation="destination-out";
	//drawarc(canvas,ctx2,{radius:40,shadow:true});//遮罩
	
	var seccanvas=$("#thirdcanvas"),ctx3=seccanvas[0].getContext("2d");
	ctx3.beginPath();
	ctx3.arcTo(10,10,100,100,20);
	ctx3.fillStyle="#ccc";
	ctx3.fill();
})
function drawarc(canvas,ctx2,options){
	options=$.extend({},{shadow:false,startAngle:0,endAngle:Math.PI*2},options);
	ctx2.beginPath();
	ctx2.arc(canvas.width()/2,canvas.height()/2,options.radius,options.startAngle,options.endAngle,false);
	console.log("x="+canvas.width()/2+"y="+canvas.height()/2);
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
	ctx2.fill();
	ctx2.closePath();
}
function drawpartarc(canvas,ctx,options){
	options=$.extend({},{startAngle:0,endAngle:Math.PI*2},options);
	ctx.beginPath();
	var x=canvas.width()/2,y=canvas.height()/2;
	ctx.moveTo(x,y);
	ctx.lineTo(x-options.radius,(options.radius*Math.sin(options.startAngle)+y));
	ctx.arcTo(x-options.radius,(options.radius*Math.sin(options.startAngle)+y),(x-options.radius*Math.cos(options.endAngle)),(options.radius*Math.sin(options.endAngle)+y),options.radius);
	ctx.lineTo(x,y);
	ctx.stroke();
	ctx.fillStyle=options.color;
	ctx.fill();
	ctx.closePath();
}
