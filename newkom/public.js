window.onscroll=function(e){
				var scrollheight=document.documentElement.scrollTop + document.body.scrollTop,imgobjs=$("img"),lis=$("ul>li"),
				index=(scrollheight)/1000;
				if(!lis.eq(index).hasClass("active")){
					lis.removeClass("active");
					lis.eq(index).addClass("active");
				}
			}