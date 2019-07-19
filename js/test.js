;(function(w){
	w.fzb = {}
	w.fzb.css=function (node,type,val){
		if(typeof node ==="object" && typeof node["transform"] ==="undefined"){
			node["transform"]={}
		}
		
		if(arguments.length>=3){
			// 设置
			var text =""
			node["transform"][type] = val
			
			for(item in node["transform"]){
				if(node["transform"].hasOwnProperty(item)){
					switch (item){
						case 'translateX':
						case 'translateY':
						case 'translateZ':
							text += item+"("+node["transform"][item]+"px)";
							break
						case "scale":
							text +=  item+"("+node["transform"][item]+")";
							break				
						case 'rotate':
							text +=  item+"("+node["transform"][item]+"deg)";
							break
					}
				}
			}
			node.style.transform = node.style.webkitTransform = text
		}else if(arguments.length==2){
			// 读取
			val = node["transform"][type]
			if(typeof val === "undefined"){
				switch (type){
					case "translateX":
					case "translateY":
					case "rotate":
						val = 0
						break
					case "scale":
						val = 1
						break
				}
			}
			return val
		}
	}
	w.fzb.carousel=function(arr){
		//布局
		var carouselWrap = document.querySelector(".carousel-wrap")
		if(carouselWrap){
			var ulNode = document.createElement("ul")
			fzb.css(ulNode,"translateZ",0)
			var pointslength =arr.length
			
			// 无缝
			var needCarousel = carouselWrap.getAttribute("needCarousel")
			needCarousel = needCarousel == null?false:true
			if(needCarousel){
				arr=arr.concat(arr)				
			}
			
			var styleNode = document.createElement("style")
			ulNode.classList.add("list")
			for(var i=0 ; i<arr.length ; i++){
				ulNode.innerHTML+='<li><a href="javascript:;"><img src="'+arr[i]+'"/></a></li>'
			}
			
			styleNode.innerHTML = ".carousel-wrap > .list{width: "+arr.length+"00%;}.carousel-wrap > .list > li{width: "+(1/arr.length*100)+"%;}"
			carouselWrap.appendChild(ulNode)
			document.head.appendChild(styleNode)
			
			var imgNodes = document.querySelector(".carousel-wrap > .list > li > a >img")
			setTimeout(function(){
				carouselWrap.style.height=imgNodes.offsetHeight+"px"
			},100)
			
			
			var pointsWrap = document.querySelector(".carousel-wrap > .points-wrap")
			if(pointsWrap){
				for(var i=0 ; i<pointslength; i++){
					if(i==0){
						pointsWrap.innerHTML+='<span class="active"></span>'
					}else{
						pointsWrap.innerHTML+='<span></span>'
					}
				}
				var pointsSpan = document.querySelectorAll(".carousel-wrap > .points-wrap > span")
			}
			/* 滑屏
			拿到元素一开始的位置
			拿到手指一开始点击的位置
			拿到手指实时move的距离
			将手指移动的距离加给元素
			 */
			var index =0
			//手指一开始的位置
			var startX = 0
			var startY = 0
			//元素一开始的位置
			var elementX = 0
			var elementY = 0
			//var translateX =0
			
			//首次滑屏的方向
			var isX = true
			var isFirst = true
			carouselWrap.addEventListener("touchstart",function(ev){
				ev = ev || event
				var TouchC = ev.changedTouches[0]
				ulNode.style.transition="none"
				
				//无缝
				if(needCarousel){
					var index = fzb.css(ulNode,"translateX")/document.documentElement.clientWidth
					if(-index ===0){
						index = -pointslength
					}else if(-index ==(arr.length-1)){
						index = -(pointslength-1)
					}
					fzb.css(ulNode,"translateX",index*document.documentElement.clientWidth)
				}
				
				
				startX=TouchC.clientX;
				startY=TouchC.clientY;
				elementX=fzb.css(ulNode,"translateX");
				elementY=fzb.css(ulNode,"translateY");

				
				//清除定时器
				clearInterval(timer)
				
				isX = true
				isFirst = true
			})
			carouselWrap.addEventListener("touchmove",function(ev){
				//看门狗  二次以后的防抖动
				if(!isX){
					//咬住
					return;
				}
				ev = ev || event
				var TouchC = ev.changedTouches[0]
				var nowX = TouchC.clientX
				var nowY = TouchC.clientY
				var disX = nowX - startX
				var disY = nowY - startY
				
				//首次判断用户的华东方向
				if(isFirst){
					isFirst = false
					//判断用户的滑动方向
					//x ---> 放行
					//y ---> 首次狠狠的咬住，并且告诉兄弟 下次也给我咬住
					if(Math.abs(disY)>Math.abs(disX)){
				    	//y轴上滑
				    	isX = false
				    	//首次防抖动
				    	return
				    }
				}
				
				fzb.css(ulNode,"translateX",elementX+disX)
			})
			carouselWrap.addEventListener("touchend",function(ev){
				ev = ev || event
				//index抽象了ul的实时位置
				// var index = translateX/document.documentElement.clientWidth
				index = fzb.css(ulNode,"translateX")/document.documentElement.clientWidth
				index = Math.round(index)
			/* 	if(disX>0){
					// 向右滑
					index--
				}else if(disX<0){
					index++
				} */
				// 超出控制
				if(index>0){
					index = 0
				}else if(index<1-arr.length){
					index = 1-arr.length
				}
				
				yuandian(index)
				
				ulNode.style.transition=".5s transform"
				// translateX = index*(document.documentElement.clientWidth)
				// ulNode.style.transform='translateX('+translateX+'px)'
				fzb.css(ulNode,"translateX",index*(document.documentElement.clientWidth))
				
				if(pointsWrap){
					auto()	
				}
			})
			
			// 自动轮播
			var timer =0
			var needAuto = carouselWrap.getAttribute("needAuto")
			needAuto = needAuto == null?false:true
			if(needAuto){
				auto()
			}
			function auto(){
				clearInterval(timer)
				timer = setInterval(function(){
					if(index == 1-arr.length){
						ulNode.style.transition ="none"
						index = 1-arr.length/2
						fzb.css(ulNode,"translateX",index*document.documentElement.clientWidth)								
					}
					setTimeout(function(){
						index--
						yuandian(index)
						ulNode.style.transition = "1s transform"
						fzb.css(ulNode,"translateX",index*document.documentElement.clientWidth)
					},50)
				},2000)
			}
			
			function yuandian(index){
				if(!pointsWrap){
					return
				}
				for(var i=0 ; i<pointsSpan.length ; i++){
					pointsSpan[i].classList.remove("active")
				}
				pointsSpan[-index%pointslength].classList.add("active")
			}
		}
	}
	w.fzb.dragNav=function (){
		//滑屏区域
		var wrap = document.querySelector(".fzb-nav-drag-wrapper")
		//滑屏元素y
		var item = document.querySelector(".fzb-nav-drag-wrapper .list")
		
		//元素一开始的位置  手指一开始的位置
		var startX = 0
		var elementX = 0
		var minX = wrap.clientWidth - item.offsetWidth
		//快速滑屏的必要参数
		var lastTime = 0
		var lastPoint = 0
		var timeDis = 1
		var pointDis = 0
	
		wrap.addEventListener("touchstart",function(ev){
			ev = ev || event
			var touchC = ev.changedTouches[0]
			
			startX = touchC.clientX
			elementX = fzb.css(item,"translateX")
			item.style.transition="none"
	
			lastTime = new Date().getTime()
			lastPoint = touchC.clientX
			//清除速度的残留
			pointDis = 0
			item.handMove = false
		})
		
		wrap.addEventListener("touchmove",function(ev){
			ev = ev || event
			var touchC = ev.changedTouches[0]
			var nowX = touchC.clientX
			var disX = nowX - startX
			var translateX = elementX + disX
			
			var nowTime = new Date().getTime()
			var nowPoint = nowX
			timeDis = nowTime - lastTime
			pointDis = nowPoint - lastPoint
			
			lastTime = nowTime;
			lastPoint = nowPoint;
			/*手动橡皮筋效果
			 * 
			 * 在move的过程中，每一次touchmove真正的有效距离慢慢变小，元素的滑动距离还是在变大
			 * 
			 * */
			 
			 if(translateX>0){
				 item.handMove = true
				var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth+translateX)*1.5)
				translateX = fzb.css(item,"translateX") + pointDis*scale
			 }else if(translateX<minX){
				 item.handMove = true
				var over = minX - translateX
				var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth+over)*1.5)
				translateX = fzb.css(item,"translateX") + pointDis*scale
			 }
			 
			fzb.css(item,"translateX",translateX)
			
			// console.log("timeDis:"+timeDis+",pointDis:"+pointDis)
		})
		
		wrap.addEventListener("touchend",function(ev){
			ev = ev || event
			// console.log("timeDis:"+timeDis+",pointDis:"+pointDis)
			var translateX = fzb.css(item,"translateX")
			if(!item.handMove){
				var speed = pointDis/timeDis
				speed = Math.abs(speed)<0.5?0:speed
				// console.log("speed："+speed)
				var targetX = translateX + speed*200
				var time = Math.abs(speed)*0.2
				time = time<0.8?0.8:time;
				time = time>2?2:time;
				// console.log(time)
				var bsr = ""
				if(targetX>0){
					targetX=0
					bsr = "cubic-bezier(.26,1.51,.68,1.54) "
				}else if(targetX<minX){
					targetX = minX
					bsr = "cubic-bezier(.26,1.51,.68,1.54) "
				}
				
				item.style.transition=time+"s "+bsr+" transform"
				fzb.css(item,"translateX",targetX)
			}else{
				//手动橡皮筋效果
				item.style.transition="1s transform";
				if(translateX>0){
					translateX=0;
					fzb.css(item,"translateX",translateX);
				}else if(translateX<minX){
					translateX = minX;
					fzb.css(item,"translateX",translateX);
				}
			}
			
		})
	}
	w.fzb.vMove = function(wrap,callback){
		//滑屏区域
		
		//滑屏元素
		var item = wrap.children[0]
		fzb.css(item,"translateZ",0.1)
		//元素一开始的位置  手指一开始的位置
		var start={}
		var element ={}
		var minY = wrap.clientHeight - item.offsetHeight
		//快速滑屏的必要参数
		var lastTime = 0
		var lastPoint = 0
		var timeDis = 1
		var pointDis = 0
		
		var isY =true
		var isFirst = true
			
		//即点即停
		var cleartime =0
		var Tween = {
			Linear: function(t,b,c,d){ return c*t/d + b; },
			back: function(t,b,c,d,s){
		        if (s == undefined) s = 1.70158;
		        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
			}
		}
		wrap.addEventListener("touchstart",function(ev){
			ev = ev || event
			var touchC = ev.changedTouches[0]
			//重置
			minY = wrap.clientHeight - item.offsetHeight
			
			start = {clientX:touchC.clientX,clientY:touchC.clientY}
			element.y = fzb.css(item,"translateY");
			element.x= fzb.css(item,"translateX");
			item.style.transition="none"
		
			lastTime = new Date().getTime()
			lastPoint = touchC.clientY
			//清除速度的残留
			pointDis = 0
			item.handMove = false
			
			isY =true
			isFirst = true
			
			//即点即停
			clearInterval(cleartime)
			
			if(callback && typeof callback["start"]==="function"){
				callback["start"].call(item)
			}
		})
		
		wrap.addEventListener("touchmove",function(ev){
				if(!isY){
				return
			}
			ev = ev || event
			var touchC = ev.changedTouches[0]
			var now = touchC
			var dis = {}
			dis.y = now.clientY - start.clientY
			dis.x = now.clientX - start.clientX
			var translateY = element.y+dis.y
			
			if(isFirst){
				isFirst = false;
				if(Math.abs(dis.x)>Math.abs(dis.y)){
					isY = false;
					if(callback && typeof callback["end"]==="function"){
						callback["end"].call(item)
					}
					return;
				}
			}
			
			var nowTime = new Date().getTime()
			var nowPoint = touchC.clientY
			timeDis = nowTime - lastTime
			pointDis = nowPoint - lastPoint
			
			lastTime = nowTime;
			lastPoint = nowPoint;
			/*手动橡皮筋效果
			 * 
			 * 在move的过程中，每一次touchmove真正的有效距离慢慢变小，元素的滑动距离还是在变大
			 * 
			 * */
			 
			 if(translateY>0){
				 item.handMove = true
				var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+translateY)*1.5)
				translateY = fzb.css(item,"translateY") + pointDis*scale
			 }else if(translateY<minY){
				 item.handMove = true
				var over = minY - translateY
				var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+over)*1.5)
				translateY = fzb.css(item,"translateY") + pointDis*scale
			 }
			 
			fzb.css(item,"translateY",translateY)
			
			if(callback && typeof callback["move"]==="function"){
				callback["move"].call(item)
			}
			// console.log("timeDis:"+timeDis+",pointDis:"+pointDis)
		})
		
		wrap.addEventListener("touchend",function(ev){
			ev = ev || event
			// console.log("timeDis:"+timeDis+",pointDis:"+pointDis)
			var translateY = fzb.css(item,"translateY")
			// console.log(translateY)
			if(!item.handMove){
				var speed = pointDis/timeDis
				speed = Math.abs(speed)<0.5?0:speed
				// console.log("speed："+speed)
				var targetY = translateY + speed*200
				var time = Math.abs(speed)*0.2
				time = time<0.8?0.8:time;
				time = time>2?2:time;
				// console.log(time)
				//快速滑屏的橡皮筋效果
				// var bsr = ""
				var type = "Linear"
				if(targetY>0){
					targetY=0
					type = "back"
					// bsr = "cubic-bezier(.26,1.51,.68,1.54) "
				}else if(targetY<minY){
					targetY = minY
					// bsr = "cubic-bezier(.26,1.51,.68,1.54) "
					type = "back"
				}
				
				bsr(type,targetY,time)
				// item.style.transition=time+"s "+bsr+" transform"
				// fzb.css(item,"translateY",targetY)
			}else{
				//手动橡皮筋效果
				item.style.transition="1s transform";
				if(translateY>0){
					translateY=0;
					fzb.css(item,"translateY",translateY);
				}else if(translateY<minY){
					translateY = minY;
					fzb.css(item,"translateY",translateY);
				}
				
				if(callback && typeof callback["end"]==="function"){
					callback["end"].call(item)
				}
			}
			
		})
		
		function bsr(type,targetY,time){
			//当前次数
			var t=0
			//初始位置
			var b = fzb.css(item,"translateY")
			//最终位置 - 初始位置
			var c = targetY -b
			//总次数
			var d = time*1000 / (1000/60)
			cleartime = setInterval(function(){
				t++
				
				if(callback && typeof callback["move"]==="function"){
					callback["move"].call(item)
				}	
				if(t>d){
					clearInterval(cleartime)
					
					if(callback && typeof callback["end"]==="function"){
						callback["end"].call(item)
					}
				}
				var point = Tween[type](t,b,c,d)
				fzb.css(item,"translateY",point)
				
			},1000/60)
		}
	}
})(window)