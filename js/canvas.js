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
	drawarc(canvas,ctx2,{radius:70,shadow:true});
	drawpartarc(canvas,ctx2,{radius:66,startAngle:0,endAngle:Math.PI/1.5,color:"#047bc1",text:"Commit",amount:"21.1万元"});
	drawpartarc(canvas,ctx2,{radius:60,startAngle:Math.PI/1.5,endAngle:Math.PI*1.4,color:"#fcbc13",text:"待Sell out",amount:"3.1万元"});
	drawpartarc(canvas,ctx2,{radius:54,startAngle:Math.PI*1.4,endAngle:Math.PI*2,color:"#f35040",text:"已Sell out",amount:"0.1万元"});
	ctx2.globalCompositeOperation="destination-out";
	drawarc(canvas,ctx2,{radius:40,shadow:false});//遮罩
	
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
//画部分圆--附带 添加折线 提示功能
function drawpartarc(canvas,ctx,options){
	options=$.extend({},{startAngle:0,endAngle:Math.PI*2},options);
	ctx.beginPath();
	var x=canvas.width()/2,y=canvas.height()/2;
	ctx.moveTo(x,y);
//	ctx.lineTo(x+options.radius*Math.cos(options.startAngle),(options.radius*Math.sin(options.startAngle)+y));
//	ctx.arcTo(x-options.radius,(options.radius*Math.sin(options.startAngle)+y),(x-options.radius*Math.cos(options.endAngle)),(options.radius*Math.sin(options.endAngle)+y),options.radius);
	ctx.arc(x,y,options.radius,options.startAngle,options.endAngle,false);
//	ctx.lineTo(x,y);
	//ctx.strokeStyle="transparent";
//	ctx.stroke();
	ctx.fillStyle=options.color;
	ctx.fill();
	ctx.closePath();
	options.x=x;options.y=y;
	drawFoldLine(ctx,options);
}
//画折线
function drawFoldLine(ctx,options){
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
	ctx.textAlign="center";
	ctx.font="6px arial";
	ctx.fillStyle="#000";
	ctx.fillText(options.text,textpos.x,textpos.y);
	ctx.fillText(options.amount,textpos.x,textpos.y+10);
}
