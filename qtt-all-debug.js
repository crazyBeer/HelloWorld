/*
 * Compressed by JSA(www.xidea.org)
 */
/**
 * @class T
 *
 * js工具类, 需要jQuery库支持
 *
 * @singleton
 * @author    tipx
 * @homepage  http://tipx.iteye.com
 * @copyright (c) 2009-2013, tipx
 * @version   1.2
 * @revision  $Id: t.js 37 2013-08-07 17:49:37 tipx $
 *
 */
;(function(window, $, undefined){
	var T = {
		//常用分割字符，一般用户不会录入该字符
		spliter: "\x0f",
		//常用正则
		
		ENABLED: "enabled",
		DISABLED: "disabled",
		
		//-------工具方法------
		/**
		 * 设置命名空间 - 摘自extjs<br/>
		 * 允许接收n个参数, 同时声明n个命名空间<br/>
		 * 调用: $.ns("qtt.web.system"); 声明后, 即可直接使用qtt.web.system.属性名 = 属性值.
		 * @param {String} namespace1
		 * @param {String} namespace2 
		 * @param {String} etc
		 * @return {Object} 声明的最后一个命名空间对象
		 */
		ns: function(){
			var o, d;
			$.each(arguments, function(i, v) {
				d = v.split(".");
				o = window[d[0]] = window[d[0]] || {};
				$.each(d.slice(1), function(j, child){
					o = o[child] = o[child] || {};
				});
			});
			return o;
		},
		/**
		 * 获取浏览器可视高度<br/>
		 * 注意：本方法需要在页面加载完成后调用
		 * @return {Number} 页面可视区域高度
		 */
		getClientHeight : function() {
			var clientHeight = 0;
			if (document.body.clientHeight && document.documentElement.clientHeight) {

				clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;

			} else {

				clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
			}
			//height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight); //页面高度
			return clientHeight;
		},
		/**
		 * 判断滚动条是否到达页面底部
		 * 
		 * @param {Number} range 限定距离，即滚动条距离底部高度<=range时，判定为到达页面底部
		 * @return {Boolean} true:滚动条到达底部
		 */
		scrollOnBottom : function(range) {
			var $doc = $(document),
				scrollTop = $doc.scrollTop(), //滚动条位置
				height = $doc.height(), //页面高度
				clientHeight = this.getClientHeight();  //页面可视高度
			
			//限定该值为正
			range = Math.max((range || 0), 0);
			return (scrollTop > 0) && (scrollTop + clientHeight + range >= height);
		},
		/**
		 * 根据deepProp获取json中对应的值
		 * @param {Object} json 源对象 
		 * @param {String} deepProp 属性，支持使用"."进行深层取值<br/>
		 *      例如: T.getJSONValue(json, "list.data.0") =>取出 json.list.data[0]
		 *       
		 * @return {Object} 值
		 */
		getJSONValue: function(json, deepProp){
			var result = json;
			$.each(deepProp.split("."), function(i, name){
				result = result[name];
			});
			return result;
		},
		/**
		 * 获取无脏数据的json
		 * @param {Object} json 待过滤的json对象
		 * @param {Array} props 属性名
		 * @return {Object} 纯净的json对象
		 */
		cleanJSON: function(json, props){
			var result = {};
			for(var i = 0, len = props.length; i < len; i++){
				var prop = props[i];
				if(json[prop]){
					result[prop] = json[prop];
				}
			}
			
			return result;
		},
		/**
		 * 寄生混合式继承(<js高级程序设计>第三版 P172)
		 *
		 * <pre>
		 var SuperType = function(name){
			 this.name = name
		 }
		 var SubType = function(name, age){
			 this.age = age;
			 SubType.superclass.constructor.call(this, name);
		 }
		 T.extend(SubType, SuperType, {
			 showAge: function(){
				 alert(this.age);
			 }
		 });
		 var sub = new SubType("Mr.Tipx", 37);
		 console.log(sub.name);
		 sub.showAge();
		 * </pre>
		 * @param {Function} subType 子类
		 * @param {Function} superType 父类
		 * @param {Object} overrides 子类的新成员
		 * @return {Function} subType 子类
		 */
		extend: function(subType, superType, overrides){

			var topConstructor =  Object.prototype.constructor;

			function innerExtend(subType, superType, overrides){
				//创建临时对象，继承superType
				var Fn = function(){};
				Fn.prototype = superType.prototype;
				
				//构造subType继承的原型
				var prototype = new Fn();
				//重置构造方法
				prototype.constructor = subType;

				//子类继承原型
				//subType.prototype = prototype;
				$.extend(subType.prototype, prototype, overrides);

				//若父级构造方法为缺省构造方法，则将其设置为当前构造函数
				if(superType.prototype.constructor == topConstructor){
					superType.prototype.constructor = superType;
				}
				//为子类添加指向父类的原型链接，满足“借用构造函数继承”
				//构造函数中调用父类构造函数时，使用subType.superclass.constructor.call()
				subType.superclass = superType.prototype;

				return subType;
			}

			return function(subType, superType, overrides){
				//若只有两个参数，即未传入subType时，自动生成subType
				//即：T.extend(superType, {})
				if($.type(superType) == "object"){
					overrides = superType;
					superType = subType;

					//自动生成subType
					if(topConstructor != overrides.constructor){
						subType = overrides.constructor;
					}else{
						subType = function(){
							superType.apply(this, arguments);
						}
					}
				}
				return innerExtend(subType, superType, overrides || {});
			}
		}(),
		
		/**
		 * 多级的urlEncode
		 *         支持数组与json的嵌套，即：{po:{a:[{嵌套:'', ..}, {...}], b:{}}}
		 *         但不支持数组直接嵌套数组，即：{po:[[...],[...]]}
		 * <pre><code>
		 //可测试的json数据
		var p = {
			po:{
				priceSurveyVendors:[{
					organizationCode:"xx供应商",
					organizationName:"1233",
					email:"xxx@xxx.com",
					linkMan:"ffff"
				},{
					organizationCode:"供应商2222",
					organizationName:"xxxx",
					email:"aax@bb.com",
					linkMan:"cccc"
				}],
				PriceSurveyMaterial:{
					name:"我是name",
					age:"18"
				}
			}
		}</code>
		 * </pre>
		 * @param {object} json 要解析成 abc=1&d=2&... 的json对象
		 * @return {string} 返回查询字符串，如：a=1&b=2&c=3...
		 */
		urlEncode : function(json) {
			var self = this;
			//参数parentKey (Optional) 父级key数组，可以为空，若需要加前缀时，可以传入该值
			//如:urlEncode(json, ['po']) => 所有的参数都将加上po.xxxx.xxx.xxx=...
			function deep(json, parentKey) {
				var pKey = parentKey || [];
				var deepFn = arguments.callee;
				var buf=[];
				$.each(json, function(key, o) {
					switch($.type(o)){
						case "object": //值为json对象时，储存当前key为父级key，并继续深入解析
							var _pkey = pKey.slice(0);
							_pkey.push(key);
							buf.push(deepFn(o, _pkey)); //父级键值数组，按顺序，索引0最大
							break;
						case "array":
							var keyName = key, hasChild=true;
							//遍历数组
							$.each(o, function(i, obj) {
								var _pkey = pKey.slice(0);
								_pkey.push(keyName+'['+i+']');
								//非json对象时，进入default步骤处理，直接生成参数
								if('object' != $.type(obj)){
									hasChild = false;
									return true;
								}
								//若数组中还有对象，则继续
								buf.push(deepFn(obj, _pkey)); //父级键值数组，按顺序，索引0最大
							});
							if(hasChild)break;
						default:
							var _pkey = pKey.slice(0);
							_pkey.push(key); //加入当前key
							buf.push('&', _pkey.join('.')+'='+encodeURIComponent(o));
					}
				});
				return buf.join('');
			}
			return deep(json).substring(1);
		},
		/*! //private
		 * 与深度urlEncode相对，但不是还原，而是将key变成json的key，
		 *            即po.xxx.abc=123&... =>decode后的结果：{'po.xxx.abc':123}，而并非还原成{po:{xxx:{abc:123}}}
		 * @param {string} str 参数字符串
		 * @return {object} json
		 */
		urlDecode : function(str) {
			var json={}, arr = str.split('&');
			$.each(arr, function(i, o) {
				var tmp = o.split('=');
				json[tmp[0]]=decodeURIComponent(tmp[1]);
			});
			return json;
		},
		/**
		 * 将json对象，通过深度encode，再decode后，生成ext或jquery的params可使用的json对象<br/>
		 * 如：将{po:{xxx:{abc:123}}} 转换成=> {'po.xxx.abc':123}
		 * @param {object} json 将参数对象解析成参数字符串
		 */
		parseParams: function(json){
			return this.urlDecode(this.urlEncode(json));
		}
	}
	
	window.Qtt = window.T = T;
})(window, jQuery);

;
/**
 * @class T.Observable
 *
 * 工具对象基类，添加简单事件功能，参考Ext
 *
 * @author    tipx
 * @homepage  http://tipx.iteye.com
 * @copyright (c) 2009-2013, tipx
 * @version   1.0
 * @revision  $Id: t.Observable.js 1 2013-08-08 10:31:37 tipx $
 *
 */
;(function($, T, undefined){
	
	T.Observable = function(events){
		this.events = events || {};
	}

	T.Observable.prototype = {
		/**
		 * 添加事件
		 * 
		 * @param {String} eventName1
		 * @param {String} eventName2
		 * @param {String} etc
		 * @return {Observable} self
		 */
		addEvents : function(){
			var self = this;
			$.each(arguments, function(i, eventName){
				self.events[eventName] = true;
			});
			return self;
		},
		/**
		 * 添加事件监听
		 *
		 * @param {String} eventName 事件名称
		 * @param {Function} fn 事件名称
		 * @param {Object} scope 事件上下文/作用域
		 * @param {Object} options 事件附加参数，附在事件对象中
		 *
		 */
		on : function(eventName, fn, scope, options){
			var self = this,
				e = self.events[eventName];
			
			//未声明该事件类型，直接返回
			if(!e){return;}

			if($.type(e) == "boolean"){
				e = self.events[eventName] = new T.Event(eventName, self);
			}
			e.addListener(fn, scope, typeof options == 'object' ? o : {});
		},
		/**
		 * 移除事件监听
		 *
		 * @param {String} eventName 事件名称
		 * @param {Function} fn 事件名称
		 * @param {Object} scope 事件上下文/作用域
		 *
		 */
		un: function(eventName, fn, scope){
			var self = this,
				e = self.events[eventName];
			
			if($.type(e) == "object"){
				e.removeListener(fn, scope);
			}
		},
		/**
		 * 触发事件
		 *
		 * @param {String} eventName 事件名称
		 * @param {Object...} arg1 事件监听函数参数，可以是任意类型
		 * @param {Object...} arg2 事件监听函数参数，可以是任意类型
		 * @param {Object...} etc 事件监听函数参数，可以是任意类型
		 * @return {Boolean} 事件执行结果
		 */
		fireEvent: function(eventName){
			var self = this,
				ret = true;
				e = self.events[eventName];

			if($.type(e) == "object"){
				var args = Array.prototype.slice.call(arguments, 1);
				ret = e.fire.apply(e, args);
			}
			return ret;
		}
	};
	

	/**
	 * 事件对象
	 *
	 * @param {String} name 事件名称
	 * @param {Object} obj  事件对象，若事件未设置context/scope，则将使用obj做为监听的context/scope
	 */
	T.Event = function(name, obj){
		this.name = name;
		this.obj = obj;
		this.listeners = []; //监听器
	}

	T.Event.prototype = {
		//添加事件
		addListener : function(fn, scope, options){
			var self = this;
			self.listeners.push({
				fn: fn,
				scope: scope || self.obj,
				options: options
			});
		},
		//移除事件
		removeListener : function(fn, scope){
			var index = findListener(fn, scope);
			if(index > -1){
				this.listeners.splice(index, 1);
			}
		},
		findListener : function(fn, scope){
			var list = this.listeners,
				index = -1;
			$.each(list, function(i, l){
				if(l.fn == fn && l.scope == scope){
					index = i;
					return false;
				}
			});
			return index;
		},
		//触发事件
		fire : function(){
			var self = this,
				fireFlag = true, 
				args = Array.prototype.slice.call(arguments, 0);

			
			$.each(self.listeners, function(i, l){
                if(l && l.fn.apply(l.scope || self.obj || window, args) === false) {
                    return (fireFlag = false);
                }
			});
			return fireFlag;
		}
	};

})(jQuery, T);
;
/**
 * 日期工具
 */
;(function($, T, undefined){
	
	var DateUtils = T.ns("T.DateUtils");

	//日期工具
	$.extend(DateUtils, {
		defaultFormat:"yyyy-mm-dd",

		//获取当前日期
		getNow : function(){
			return new Date();
		},
		//获取当前日期的毫秒值
		getTime : function(){
			return +new Date;
		},
		compareDate : function(beforDate, afterDate){
			//
		},
		/**
		 * 日期加n天(n可为负数)
		 * @param {Date} date 要添加的日期
		 * @param {Number} num 要加的
		 * @return 新日期
		 */
		addDate: function(date, num){
			date.setDate(date.getDate() + num);
			return date;
		},
		/**
		 * 日期相减
		 * @param {string} start 开始时间，与format格式相同，比如Y-m-d
		 * @param {string} end 结束时间
		 * @param {string} format (Optional) 缺省为'Y-m-d' 传入的时间格式，参考Ext中的时间格式
		 * @return 时间相差的天数
		 */
		dateDiff: function(start, end, format){
			format = format || 'Y-m-d';
			start = Date.parseDate(start, format);
			end = Date.parseDate(end, format);
			return (end-start)/(60*60*1000*24);
		},
		//将字符串按format格式解析为日期
		parseDate : function(s, format){
			if(undefined == format){
				format = this.defaultFormat;
			}
			//
		},
		//将日期对象按format格式，格式化为字符串
		formatDate: function(date, format){
			if(undefined == format){
				format = this.defaultFormat;
			}
		},
		/**************
		根据年和月取当月的最后一天.（也就是当月有多少天）
		用法：
		var a =getLastDay(2008,5);
		alert(a); //  31
		**************/
		getLastDay : function(year,month){
			//取年
			var new_year = year;
			//取到下一个月的第一天,注意这里传入的month是从1～12 
			var new_month = month++;
			//如果当前是12月，则转至下一年
			if(month>12){
				new_month -=12;
				new_year++;
			}
			var new_date = new Date(new_year,new_month,1);
			return (new Date(new_date.getTime()-1000*60*60*24)).getDate();
		}
	});

})(jQuery, T);
;
/**
 * 
 * 使用定时器延时，防止连续操作DOM，比如一些元素的resize事件操作<br/>
 * 在interval时间间隔内，有且只执行一次<br/>
 * //改造自 <函数节流> - 详见js高级程序设计第三版 P614
 * 
 */
;(function($, T, undefined){
	
	/**
	 * 在interval时间间隔内，确保 fn 有且只执行一次<br/>
	 *
	 * 使用:
	 * var processor = new T.Processor(fn);
	 * processor.process(); //每次需要执行函数数，执行代理方法
	 *
	 * @param {Function} fn 待执行的函数
	 * @param {Object} context 函数中this的上下文，允许为null，即this指向window
	 * @param {Number} interval fn的最小执行间隔
	 */
	T.Processor = function(fn, context, interval){
		this.timerId = null;
		this.lastExecTime = -1; //最后一次执行时间
		
		if(!interval || isNaN(interval)){
			interval = 100;
		}
		this.interval = interval;

		//执行方法
		this.processing = function(){
			this.lastExecTime = +new Date;
			fn.call(context);
		}
	}
	T.Processor.prototype = {

		/**
		 * 函数的代理执行方法
		 */
		process : function(){
			var thiz = this;
			var lastExecTime = this.lastExecTime,
				interval = this.interval;

			//每次执行都清空上一次的timerId
			//若上一次已执行，该操作则可以忽略
			clearTimeout(this.timerId);

			var now = +new Date;
			//第一次不立即执行
			if(lastExecTime < 0){
				lastExecTime = this.lastExecTime = now;
			}

			//保证interval时间间隔内一定会执行一次
			if(now - lastExecTime > interval){
				thiz.processing();
				return;
			}

			//新建延时处理的定时器
			this.timerId = setTimeout(function(){
				thiz.processing(); //注意scope
			}, interval);
		}
	}

})(jQuery, T);
;
/**
 * 文本像素宽度工具类
 * 根据字体样式获取文本像素宽度
 * 根据设置的最大宽度自动换行
 */
;(function($, T, undefined){
	//声明命名空间
	var StringUtils = T.ns("T.StringUtils");


	//文本像素宽度对象
	var sizeLibs = {}, 
		$span = $("<span style='display:none;'/>"), 
		props = "font-family,font-size,line-height,font-weight,font-style,text-decoration".split(","); // 接受的字体样式参数

	// 缓存的样式键名
	function getKey(fontStyle) {
		var key = [];
		$.each(props, function(i, p) {
			key.push(fontStyle[p]);
		});
		return key.join("@");
	}

	// 初始化
	function init() {
		$span.appendTo(document.body);
	}

	/**
	 * 初始化并返回当前字体样式下的字体大小库<br/> 
	 * (ascii字符宽度[0-255]与非ascii码大小[256])
	 * 
	 * @param {Object} fontStyle 字体样式json
	 * @return {Array} sizeLib
	 */
	function createLib(fontStyle) {
		// 第一次调用初始化
		init();

		// 重写函数
		createLib = function(fontStyle) {
			fontStyle = T.cleanJSON(fontStyle, props);

			var sizeLib = [], key = getKey(fontStyle);

			$span.css(fontStyle);
			// text-decoration: underline; font-weight: bold; font-style:italic;
			$span.html("中中中中中中中中中中");

			sizeLib[256] = $span.outerWidth() / 10;
			sizeLib[257] = $span.outerHeight();

			for ( var i = 0; i < 256; i++) {
				$span.html("中" + String.fromCharCode(i) + "中");
				sizeLib[i] = $span.outerWidth() - 2 * sizeLib[256];
			}

			return sizeLib;
		}
		return createLib(fontStyle); // 第一次真正执行
	}

	/**
	 * 获取字体样式对应的字体宽度库
	 * @param {Object} fontStyle 文本字体样式
	 * @return {Array} 0~255为ASCII字符在fontStyle样式下的像素宽度，256为非ASCII字符在样式下的像素宽度
	 */
	function getSizeLib(fontStyle) {

		var key = getKey(fontStyle);
		if (!sizeLibs[key]) {
			sizeLibs[key] = createLib(fontStyle);
		}
		return sizeLibs[key];
	}


	/**
	 * 根据字体样式，获取字符串像素宽度
	 * @param {String} source 源字符串
	 * @param {Object} fontStyle 文本字体样式
	 * @return {Number} 长度像素值
	 */
	function getWidth(source, fontStyle) {

		var totalWidth = 0, 
			lib = getSizeLib(fontStyle);

		for ( var i = 0, len = source.length; i < len; i++) {
			var c = source.charCodeAt(i);
			// 非ascii字符宽度取256
			totalWidth += lib[Math.min(c, 256)];
		}
		return totalWidth;
	}

	/**
	 * 获取长度数组，按字符索引一一对应存储像素宽度
	 * @param {String} source 源字符串
	 * @param {Object} fontStyle 文本字体样式
	 * @return {Number} 长度像素值
	 * @param {RegExp} pattern 特殊内容的正则(注意加global参数)
	 * @param {Number} patternSize 特殊内容所代表的宽度
	 * @return {Array} 像素宽度数组，数组中的每一个值代表source中对应索引的字符的像素宽度
	 */
	function getLengthArray(source, fontStyle, pattern, patternSize) {
		var result = [], specials = {}, // 若有特殊内容，记录下索引信息，{"开始索引": "结束索引"}
		lib = getSizeLib(fontStyle); // {"fontFamily":"宋体", "fontSize":"21px"}

		// 记录特殊正则匹配的内容的索引
		if (pattern) {
			// 第一次匹配时，从0开始匹配
			pattern.lastIndex = 0
			var matcher = pattern.exec(source);
			while (matcher) {
				specials[matcher.index] = pattern.lastIndex;
				matcher = pattern.exec(source);
			}
		}

		for ( var i = 0, len = source.length; i < len; i++) {
			// 特殊内容使用特殊宽度
			if (specials[i]) {
				result[i] = patternSize;

				var end = specials[i++];
				// 直接跨过特殊字符串所占的位置
				for (; i < end; i++) {
					result[i] = 0;
				}
				i--; // 外层循环还有i++，故此处需要-1
				continue;
			}

			// 普通字符计算宽度
			var c = source.charCodeAt(i);
			result[i] = lib[Math.min(c, 256)]; // 非ascii字符宽度取256
		}
		return result;
	}


	

	/**
	 * 按最大宽度自动对  <b>单行字符串</b>  插入换行符 <br/>
	 * (只操作单行字符串，即源字符串str不应包含breaker)
	 * 
	 * @param {String} str 源字符串
	 * @param {Array} lengthArray 字符串宽度数组(与字符一一对应)
	 * @param {Number} maxWidth 行最大像素宽度
	 * @param {String} breaker 换行符，如："<br/>"
	 * @returns {String} 修改结果
	 */
	function breakText(str, lengthArray, maxWidth, breaker) {
		var width = 0, result = [];

		// 判断长度
		for ( var i = 0, len = str.length; i < len; i++) {

			width += lengthArray[i];
			// 超出宽度
			if (width > maxWidth) {
				// 取出上一段
				result.push(str.slice(0, i));
				// 截取字符串，继续处理
				result.push(arguments.callee(str.substring(i), lengthArray.slice(i), maxWidth, breaker));
				break;
			}
		}
		// 有需要换行时，插入换行符
		if (result.length > 0) {
			str = result.join(breaker);
		}
		return str;
	}

	//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>将方法添加到StringUtils中<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
	$.extend(StringUtils, {
		/**
		 * 根据字体样式，获取字符串像素宽度
		 * @param {String} source 源字符串
		 * @param {Object} fontStyle 文本字体样式
		 * @return {Number} 长度像素值
		 */
		getPxWidth : getWidth,

		/**
		 * 获取字体样式对应的字体宽度库
		 * @param {Object} fontStyle 文本字体样式
		 * @return {Array} 0~255为ASCII字符在fontStyle样式下的像素宽度，256为非ASCII字符在样式下的像素宽度
		 */
		getPxSizeLib : getSizeLib,

		/**
		 * 获取长度数组，按字符索引一一对应存储像素宽度
		 * @param {String} source 源字符串
		 * @param {Object} fontStyle 文本字体样式
		 * @return {Number} 长度像素值
		 * @param {RegExp} pattern 特殊内容的正则(注意加global参数)
		 * @param {Number} patternSize 特殊内容所代表的宽度
		 * @return {Array} 像素宽度数组，数组中的每一个值代表source中对应索引的字符的像素宽度
		 */
		getPxLengthArray : getLengthArray,

		/**
		 * 按最大宽度自动对字符串插入换行符
		 * 
		 * @param {String} str 源字符串
		 * @param {Object} fontStyle 字体样式，如：{"fontFamily" : "宋体","fontSize" : "21px"}
		 * @param {Number} maxWidth 行最大像素宽度
		 * @param {String} breaker 换行符
		 * @param {RegExp} pattern 特殊内容的正则（注意加global参数）
		 * @param {Number} patternSize 特殊内容所代表的宽度
		 * @returns {String} 带breaker的字符串
		 */
		autoBreak : function(str, fontStyle, maxWidth, breaker, pattern, patternSize) {
			var lines = str.split(breaker), // 将字符串按breaker分隔成数组，以行为单位操作字符串
				lengthArray = null,
				result = [];
			
			$.each(lines, function(i, line){
				lengthArray = getLengthArray(line, fontStyle, pattern, patternSize);
				result.push(breakText(line, lengthArray, maxWidth, breaker, pattern, patternSize));
			});
			return result.join(breaker);
		}
	});

})(jQuery, T);
;
/**
 * 字符串工具类
 */
;(function($, T, undefined){

	var StringUtils = T.ns("T.StringUtils");

	//模板替换使用的正则表达式{0}.{1}...{n}
	var formatRe = /\{(\d+)\}/g;

	//字符串工具---
	$.extend(StringUtils, {
		/**
		 * 字符串替换<br>
		 * 
		 * Example usage: T.StringUtils.format("hello:{0}, your name is {1}", "xxx", "abc");
		 *
		 * @param {String} string The tokenized string to be formatted
		 * @param {String} value1 The value to replace token {0}
		 * @param {String} value2 Etc...
		 * @return {String} The formatted string
		 */
		format: function(format) {
			var args = [].slice.call(arguments, 1);
			return format.replace(formatRe, function(m, i) {
				return args[i] || "";
			});
		},

		/**
		 * Nano Templates (Tomasz Mazur, Jacek Becela)<br/>
		 * 模板替换引擎 nano<br>
		 * 
		 * 用法：T.StringUtils.nano("hello:{userCode}, your name is {userName}", {"userCode":"xxx", "userName":"abc"});
		 * @param {String} template The tokenized string to be formatted
		 * @param {Object} data The value to replace token {property}
		 * @return {String} The formatted string
		 */
		nano: function(template, data) {
		  return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
			var keys = key.split("."), v = data[keys.shift()];
			for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
			return (typeof v !== "undefined" && v !== null) ? v : "";
		  });
		},

		/**
		 * 左边补齐
		 *
		 * var s = T.StringUtils.leftPad('123', 5, '0');
	     * // s now contains the string: '00123'
		 *
		 * @param {String} string The original string
		 * @param {Number} size The total length of the output string
		 * @param {String} character (optional) The character with which to pad the original string (defaults to empty string " ")
		 * @return {String} The padded string
		 */
		leftPad: function(string, size, character) {
			var result = String(string);
			character = character || " ";
			while (result.length < size) {
				result = character + result;
			}
			return result;
		},

		/**
		 * 字符串首字母大写
		 * @param {String} s 源字符串
		 * @return {String} 处理后的字符串
		 */
		firstUpper : function(s){
			return s.slice(0, 1).toUpperCase() + s.slice(1);
		},

		/**
		 * 根据分隔符分割单词，并对首字母大写后重组<br/>
		 * 将font-family => fontFamily或FontFamily
		 * @param {String} source 源字符串
		 * @param {String} split 分隔字符串
		 * @param {Boolean} flag 第一个单词的首字母是否大写，缺省为false
		 * @return {String} 处理后的字符串
		 */
		firstUpperAll : function(source, split, flag){
			var self = this,
				r = [],
				letters = source.split(split),
				firstLetter = letters[0];

			//首单词的首字母是否大写，缺省小写
			if(flag){
				firstLetter = self.firstUpper(firstLetter);
			}
			r.push(firstLetter);

			$.each(letters.slice(1), function(i, s){
				r.push(self.firstUpper(s));
			});
			return r.join("");
		},

		/**
		 * 将字符串中的'\n'替换为'<br/>'
		 * @param {String} s 源字符串
		 * @return {String} 替换后的字符串
		 */
		nl2br : function(s){
			//若\n\r同时出现，则替换为一个\n，防止多换行
			return s.replace(/(\n\r|\r\n)/gi, '\n').replace(/(\n|\r)/gi, '<br/>');
		},

		/**
		 * 将字符串中的'<br/>'替换为'\n'
		 * @param {String} s 源字符串
		 * @return {String} 替换后的字符串
		 */
		br2nl :	function(s){
			return s.replace(/<br\/>/gi, '\n');
		},
		/**
		 * 编码字符串中的HTML实体
		 * @param {String} s 源字符串
		 * @return {String} 替换后的字符串
		 */
		encodeHTML : function (s){
			var result = [];
			//由于所有编码后的实体都包含“;”与“&”，若直接用正则替换，“;”与“&”会先后冲突
			//所以此处使用循环对字符串的每个字符按顺序进行编码
			for(var i = 0, len = s.length; i < len; i++){
				var c = s.charAt(i);
				switch(c){
					case "&":
						c = "&amp;";
						break;
					case ";":
						c = "&#59;";
						break;
					case "<":
						c = "&lt;";
						break;
					case ">":
						c = "&gt;";
						break;
					case "'":
						c = "&#39;";
						break;
					case "%":
						c = "&#37;";
						break;
					case "(":
						c = "&#40;";
						break;
					case ")":
						c = "&#41;";
						break;
					case "+":
						c = "&#43;";
						break;
				}
				result.push(c);
			}
			return result.join("");
		},
		/**
		 * 还原字符串中的HTML实体
		 * @param {String} s 源字符串
		 * @return {String} 替换后的字符串
		 */
		decodeHTML : function (s){

			//将提交时被过滤替换的内容还原
			//需要替换的内容参考filterXssStr
			return s.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/&#39;/g, "'")
					.replace(/&#37;/g, "%")
					.replace(/&#59;/g, ";")
					.replace(/&#40;/g, "(")
					.replace(/&#41;/g, ")")
					.replace(/&#43;/g, "+")
					.replace(/&amp;/g, "&"); //所有编码后的实体都有&，所以原始的&需要在最后还原
		}
	});

})(jQuery, T);
;
/**
 * 分页
 <pre>
 var tpls = [];
tpls.push('<li class="img_list_box"   materialId="{materialId}" imageType="{imageType}" objAttr="{materialProperty}" materialStoreId="{materialStoreId}" imageSize="{materialFileSize}" imageMojiKey = "{imageMojiImgId}">');
tpls.push('<img  src="http://wap.dm.10086.cn/images/caiman{materialFilePathTmp}"  width="115" style="cursor: pointer;"/>');
tpls.push('</li>');


	var grid = new T.data.Grid({
		tpl:tpls.join(""),
		context:"#image_list",
		store: {
			url:"http://www.0.test1.com:8080/assistant_new/findImageByCategoryAndFigure.action",
			fields:["categoryId", "categoryIsLeaf", "imageCreateTime", "materialFilePathTmp", 
				{name:"materialFileType"}, {name:"abc", mapping:"materialProperty"}, {name:"qqq"}, 
				{name:"tipx", 
					convert:function(r){
						return r.materialDescript+"---"+r.materialFilePathTmp;
					}
				}],
			paramNames:{
				currentPage:"response.currentPage",  //分页参数名称
				totalPage: "response.totalPages",     //总页数
				totalRecord: "response.totalRows", //总记录数
				pageSize:"response.pageRecorders",
				root : "response.imageResourceArr.0",  //列表数据所在位置(支持使用"."进行多级查询)
				successProperty : "isSuccess" //成功/失败状态所在位置
			},
			baseParams:{
				"imageType": "0",
				"password": "hyvPYPXAUGT7eDJYtQRI2js2F+T3/crhBo7UbQAPmTi1TouLljr6mGG8AovbVf3w",
				"serviceId": "Mg==",
				"timestamp": "20130809100702",
				"eid": "5911577060",
				"adcToken": "B6662ED9-AA54-40BB-A5A3-28198E001BBD",
				"pageRecorders":14
			}
		},
		pageBar: {
			context: ".js_pagebar",
			data:{
				currentPage:1,
				totalPage: 429,
				totalRecord: 5997,
				pageSize: 14
			}
		}
	});

 </pre>
 */
;(function($, T, undefined){

	//声明命名空间
	T.ns("T.data");

	T.data.Grid = function(opts){

		$.extend(this, {

			/**
			 * @config {String} tpl 列表模板 例如："<li class='xx'>{property}</li>"
			 */
			tpl: "",
			/**
			 * @config {String|jQuery} context 列表所在位置（jquery选择器）或jQuery对象
			 */
			context: "",
			/**
			 * @config {String|jQuery} filterSelector 列表中不需要清除的元素选择器
			 */
			filterSelector: ".t_grid_header",
			
			/**
			 * @config {T.data.Store} store 数据源
			 */
			store: undefined,
			/**
			 * @config {T.data.PageBar} pageBar 分页条，允许为空
			 */
			pageBar: undefined
			
		}, opts);
		
		//若context传入的是jQuery选择器，则查询对象
		if($.type(this.context) == "string"){
			this.context = $(this.context);
		}

		T.data.Grid.superclass.constructor.call(this);

		this.initEvents();
		this.initComponent();
		this.initListeners();
	}

	//继承观察类，添加事件功能
	T.extend(T.data.Grid, T.Observable, {
		/**
		 * 初始化操作
		 */
		initComponent: function(){
			var self = this,
				store = self.store,
				pageBar = self.pageBar;

			//传入json配置
			if($.type(store) == "object" && !(store instanceof T.data.Store)){
				store = self.store = new T.data.Store(store);
			}

			if($.type(pageBar) == "object" && !(pageBar instanceof T.data.PageBar)){
				pageBar = self.pageBar = new T.data.PageBar(pageBar);
			}
		},
		/**
		 * 初始化事件监听
		 */
		initListeners: function(){
			var self = this,
				store = self.store,
				pageBar = self.pageBar,
				
				tpl = self.tpl;

			//监听数据加载事件
			store.on("load", function(store, success, rs, json){
				if(false === success){
					return;
				}
				
				//触发grid的beforerender事件
				self.fireEvent("beforerender", self, store.getCurrentPage(json));

				// TODO grid临时清理列表数据，待优化调整，考虑放在beforerender事件中处理
				//使用load方法加载数据，先清空内容
				self.removeContent();

				//触发加载事件，刷新列表
				var html = [];
				$.each(rs, function(i, r){
					html.push(T.StringUtils.nano(tpl, r));
				});
				
				//触发grid的render事件
				self.fireEvent("render", self, html.join(""));
			});

			//有分页条时，添加事件关联(允许grid不存在分页条，即不分页)
			if(pageBar instanceof T.data.PageBar){
				pageBar.on("paging", function(pageBar, page, currentPage){
					//页码相等时不重新加载
					if(page != currentPage){
						//触发加载事件
						store.load(page); //store.load(page, otherParams);
					}
				});
				store.on("load", function(store, success, rs, json){
					//数据加载完成后，重新渲染分页条
					pageBar.render({
						currentPage: store.getCurrentPage(),
						totalPage: store.getTotalPage(),
						totalRecord: store.getTotalRecord(),
						pageSize: store.getPageSize()
					});
				});
			}
			
			self.on("render", self.doRender);
		},
		/**
		 * 加载数据<br/>
		 * 若未传入任何参数，自动使用上一次加载的参数重新加载，即reload
		 * 
		 * @param {Number} page 加载的页码, 允许为空
		 * @param {Object} params 加载的额外参数, 允许为空
		 */
		load: function(page, params){
			//使用load方法加载数据，先清空内容
			this.removeContent();
			this.store.load(page, params);
		},
		/**
		 * 渲染数据
		 * 
		 * @param {T.data.Grid} grid 当前分页组件
		 * @param {String} html 数据内容
		 */
		doRender: function(grid, html){
			//将数据加入容器中
			this.addContent(html);
		},
		/**
		 * 添加列表数据
		 * @param {String} html 数据
		 */
		addContent: function(html){
			this.context.append(html);
		},
		/**
		 * 清空grid内容
		 */
		removeContent: function(){
			var $content = this.context,
				filterSelector = this.filterSelector;

			$content.children().not(filterSelector).remove();
		},
		/**
		 * 获取数据源
		 * @returns {T.data.Store} 数据源
		 */
		getStore: function(){
			return this.store;
		},
		/**
		 * 获取分页条
		 * @returns {T.data.PageBar} 分页条
		 */
		getPageBar: function(){
			return this.pageBar;
		},
		/**
		 * 初始化事件
		 */
		initEvents: function(){
			
			this.addEvents(
				/**
				 * @event 列表渲染前事件
				 * @param {T.data.Grid} grid 当前分页组件
				 * @param {Number} 当前加载的页数
				 */
				"beforerender",
				/**
				 * @event 渲染事件
				 * @param {T.data.Grid} grid 当前分页组件
				 * @param {String} html 数据内容
				 */
				"render"
			);
		}
	});


})(jQuery, T);
;
/**
 * 分页条
 * 
 <pre>
	var pageBar = new T.data.PageBar({
		context: ".js_pagebar",
		data:{
		    currentPage: 3,
			totalPage: 5,
			totalRecord: 50
		}
	});

	//测试
	pageBar.on("paging", function(page){console.log(page);});
	pageBar.on("paging", function(page){pageBar.render({currentPage:page,totalPage:5});});
</pre>
 */
;(function($, T, undefined){
	//声明命名空间
	T.ns("T.data");
	
	//定义disabled名称常量
	var DISABLED = T.DISABLED,
		PAGEBAR_CLASS = "t_pagebar", //分页会自动包上该class，用于组件的class样式匹配，比如disabled_button
		dataProperty = "currentPage,totalPage,totalRecord,pageSize".split(","); //分页条的数据属性，用于cleanJSON
	
	T.data.PageBar = function(opts){
		opts = opts || {};
		
		/**
		 * @config {String} contextSelector 分页条容器的选择器
		 */
		var $context = this.context = $(opts.context);
		$context.addClass(PAGEBAR_CLASS); //添加当前对象的class
		
		/**
		 * @config {Object} infoSelectors 分页信息元素的选择器
		 */
		var infoSelectors = $.extend({}, this.defaultInfoSelectors, opts.infoSelectors);
		/**
		 * @config {Object} buttonSelectors 分页按钮的选择器
		 */
		var buttonSelectors = $.extend({}, this.defaultButtonSelectors, opts.buttonSelectors);
		
		this.initInfoElement(infoSelectors);
		this.initButtons(buttonSelectors);
		
		/**
		 * 分页初始数据
		 */
		var data = this.data = $.extend({}, this.defaultData, opts.data);
		//self.initData($context.data());
		
		T.data.PageBar.superclass.constructor.call(this);
		
		//设置事件
		this.initEvents();
		//初始渲染
		this.render(data);
	}
	
	T.extend(T.data.PageBar, T.Observable, {
		//缺省数据
		defaultData:{
			currentPage: 1,
			totalPage: 1,
			totalRecord: 0,
			pageSize:20
		},
		//信息元素的缺省selector
		defaultInfoSelectors:{
			currentPage: ".js_currentPage",  //当前页
			totalPage: ".js_totalPages",     //总页数
			totalRecord: ".js_totalRecords", //总记录数
			goPage: ".js_goPage"             //跳转页码
		},
		//分页跳转按钮的缺省selector
		defaultButtonSelectors:{
			firstPage: ".js_firstPage",
			lastPage: ".js_lastPage",
			prePage: ".js_prePage",
			nextPage: ".js_nextPage",
			goPage: ".js_goBtn"
		},
		/**
		 * //private
		 * 初始化分页按钮
		 * @param {Object} buttonSelectors 分页按钮的选择器
		 */
		initButtons: function(buttonSelectors){
			//选择容器
			var self = this,
				$context = self.context,
				btns = self.buttons = {},
				$btn;

			$.each(buttonSelectors, function(name, selector){
				$btn = btns[name] = $context.find(selector);
				//绑定事件
				$btn.click(function(){
					//若对象的disabled数据为true时，不进行分页操作
					if(true === $(this).data(DISABLED)){
						return;
					}
					self.paging(name);
				});
			});
		},
		/**
		 * //private
		 * 初始化信息元素
		 * @param {Object} infoSelectors 分页信息元素的选择器
		 */
		initInfoElement: function(infoSelectors){
			//选择容器
			var self = this,
				$context = self.context,
				els = self.infoElements = {};

			$.each(infoSelectors, function(name, selector){
				els[name] = $context.find(selector);
			});
		},
		/**
		 * //private
		 * 初始化分页数据<br/>
		 * 将原始分页数据转换为当前对象使用的数据格式
		 * @param {Object} json 初始分页数据
		 */
		initData: function(json){
			json = T.cleanJSON(json, dataProperty);
			//设置数据，每次都生成新对象，防止json与this.data是同一对象时出现意外
			return this.data = $.extend({}, this.defaultData, json);
		},
		/**
		 * 跳转分页
		 * @param {String} name 分页按钮类型
		 */
		paging: function(name){
			this.fireEvent("paging", this, this.computePage(name), this.getCurrentPage());
		},
		/**
		 * 计算分页
		 * @param {String} name 分页按钮类型
		 */
		computePage: function(name){

			var self = this,
				data = self.data,
				page = data.currentPage,
				totalPage = data.totalPage,
				toPage = 1;

			switch(name){
				case 'firstPage':
					toPage = 1;
					break;
				case 'prePage':
					toPage = page - 1;
					break;
				case 'nextPage':
					toPage = page + 1;
					break;
				case 'lastPage':
					toPage = totalPage;
					break;
				case 'goPage':
					var $goPage = self.infoElements.goPage;
					gotoPage = $goPage.val();

					//每次分页清空go框的值
					$goPage.val("");

					if(!gotoPage || !/^\d+$/.test(gotoPage)){
						toPage = page;
					}else{
						toPage = gotoPage;
					}
					break;
			}

			//将跳转页数的值修正到[1, totalpage]内
			toPage = Math.max(toPage, 1);
			toPage = Math.min(toPage, totalPage);
			return toPage;
		},
		/**
		 * 根据数据渲染分页条
		 * @param {Object} pageData 分页数据，例如：{currentPage: 1, totalPage: 5, totalRecords: 20}
		 */
		render: function(pageData){
			//每次分页清空go框的值
			this.infoElements.goPage.val("");

			//触发渲染事件, 可以在监听中调整pageData;
			this.fireEvent("render", this, pageData);

			var self = this,
				$context = self.context,
				btns = self.buttons,
				
				data = self.initData(pageData),
				
				currentPage = data.currentPage,
				totalPage = data.totalPage;
			
			//对按钮进行启用/禁用操作
			//启用所有按钮
			$.each(btns, function(i, $btn){
				self.enableButton($btn); 
			});
			if(currentPage <= 1){
				currentPage = 1;
				self.disableButton(btns.firstPage, btns.prePage);
			}
			if(currentPage >= totalPage){
				currentPage = totalPage;
				self.disableButton(btns.nextPage, btns.lastPage);
			}
			//修正当前页
			data.currentPage = currentPage;
			
			self.renderInfo(data);
		},
		/**
		 * //private
		 * 渲染显示信息
		 * @param {Object} data
		 */
		renderInfo: function(data){
			var self = this,
				els = self.infoElements;
			
			$.each(els, function(k, el){
				if("goPage" != k){
					el.text(data[k]);
				}
			});
		},
		/**
		 * 启用按钮
		 * @param {jQuery} $btn 按钮对象
		 */
		enableButton: function($btn){
			$btn.data(DISABLED, false);
			$btn.removeClass("disabled_button");
		},
		/**
		 * 禁用按钮
		 * @param {jQuery} $btn1 按钮对象
		 * @param {jQuery} $btn2 按钮对象
		 * @param {jQuery} $etc 按钮对象
		 */
		disableButton: function(){
			$.each(Array.prototype.slice.call(arguments, 0), function(i, $btn){
				$btn.data(DISABLED, true);
				$btn.addClass("disabled_button");
			});
		},
		/**
		 * 显示分页条
		 */
		show: function(){
			this.context.show();
		},
		/**
		 * 隐藏分页条
		 */
		hide: function(){
			this.context.hide();
		},
		/**
		 * 获取分页条中的当前页码
		 * @returns 当前页码
		 */
		getCurrentPage: function(){
			return this.data.currentPage;
		},
		/**
		 * 获取分页条中的总页数
		 * @returns 总页数
		 */
		getTotalPage: function(){
			return this.data.totalPage;
		},
		/**
		 * 获取分页条中的总记录数
		 * @returns 总记录数
		 */
		getTotalRecord: function(){
			return this.data.totalRecord;
		},
		//private, 设置事件
		initEvents: function(){
			/**
			 * @event 分页事件
			 * @param {T.data.PageBar} pageBar 当前分页条对象
			 * @param {Number} page 目的页码
			 * @param {Number} currentPage 分页条中的当前页码
			 */
			this.addEvents("paging");
			/**
			 * @event 分页条渲染事件
			 * @param {T.data.PageBar} pageBar 当前分页条对象
			 * @param {JSON} pageData  分页数据，可在监听中修改
			 */
			this.addEvents("render");
		}
	});
})(jQuery, T);
;
/**
 * 滚动分页
 <pre>
 var tpls = [];
tpls.push('<li class="img_list_box"   materialId="{materialId}" imageType="{imageType}" objAttr="{materialProperty}" materialStoreId="{materialStoreId}" imageSize="{materialFileSize}" imageMojiKey = "{imageMojiImgId}">');
tpls.push('<img  src="http://wap.dm.10086.cn/images/caiman{materialFilePathTmp}"  width="115" style="cursor: pointer;"/>');
tpls.push('</li>');


	var grid = new T.data.ScrollGrid({
		tpl:tpls.join(""),
		context:"#image_list",
		maxInnerPage: 3, //一页最大自动加载分页，缺省为6
		loadingContext:".loading_box",
		loading: Qtt.StringUtils.format("<img src=\"{0}images/concise/loading.gif\" />", sysUrlPrefix),
		store: {
			url:"http://www.0.test1.com:8080/assistant_new/findImageByCategoryAndFigure.action",
			fields:["categoryId", "categoryIsLeaf", "imageCreateTime", "materialFilePathTmp", 
				{name:"materialFileType"}, {name:"abc", mapping:"materialProperty"}, {name:"qqq"}, 
				{name:"tipx", 
					convert:function(r){
						return r.materialDescript+"---"+r.materialFilePathTmp;
					}
				}],
			paramNames:{
				currentPage:"response.currentPage",  //分页参数名称
				totalPage: "response.totalPages",     //总页数
				totalRecord: "response.totalRows", //总记录数
				pageSize:"response.pageRecorders",
				root : "response.imageResourceArr.0",  //列表数据所在位置(支持使用"."进行多级查询)
				successProperty : "isSuccess" //成功/失败状态所在位置
			},
			baseParams:{
				"imageType": "0",
				"password": "hyvPYPXAUGT7eDJYtQRI2js2F+T3/crhBo7UbQAPmTi1TouLljr6mGG8AovbVf3w",
				"serviceId": "Mg==",
				"timestamp": "20130809100702",
				"eid": "5911577060",
				"adcToken": "B6662ED9-AA54-40BB-A5A3-28198E001BBD",
				"pageRecorders":14
			}
		},
		pageBar: {
			context: ".js_pagebar",
			data:{
				currentPage:1,
				totalPage: 429,
				totalRecord: 5997,
				pageSize: 14
			}
		}
	});

 </pre>
 */
;(function($, T, undefined){

	//声明命名空间
	T.ns("T.data");

	T.data.ScrollGrid = function(opts){

		//定义可覆盖的配置参数
		opts = $.extend({

			/**
			 * @config {String} tpl 列表模板 例如："<li class='xx'>{property}</li>"
			 */
			//tpl: "",
			/**
			 * @config {String|jQuery} context 列表所在位置（jquery选择器）或jQuery对象
			 */
			//context: "",
			
			/**
			 * @config {String|jQuery} loadingContext loading所在位置（jquery选择器）或jQuery对象
			 */
			loadingContext: "",

			/**
			 * @config {T.data.Store} store 数据源
			 */
			//store: undefined,
			/**
			 * @config {T.data.PageBar} pageBar 分页条，允许为空
			 */
			//pageBar: undefined,
			
			//
			/**
			 * 滚动条离底部的像素距离
			 */
			leaveBottom: 10, //缺省距离底部10像素时，即可开始加载

			/**
			 * @config {Number} maxInnerPage 页面滚动加载最大页数
			 */
			maxInnerPage: 6
			
		}, opts);
		
		
		//定义属性
		$.extend(this, {
			/*
			 * @property {Number} outerPage 外页, 即显示的分页; <br/>
			 * 系统实际分页 = (outerPage - 1) * maxInnerPage + innerPage;<br/>
			 * 最小值 = 1
			 * 最大值 <= Math.ceil(totalPage / maxInnerPage)
			 */
			//outerPage: 1, //实际取分页条上的currentPage
			/**
			 * @property {Number} innerPage 内页, 即小分页, 最大值为maxInnerPage
			 */
			innerPage: 1
		});

		//若context传入的是jQuery选择器，则查询对象
		if($.type(opts.loadingContext) == "string"){
			opts.loadingContext = $(opts.loadingContext);
		}
		
		T.data.ScrollGrid.superclass.constructor.call(this, opts);
		
		this.initScrollListeners();
	}

	//继承观察类，添加事件功能
	T.extend(T.data.ScrollGrid, T.data.Grid, {
		/**
		 * 初始化事件监听
		 */
		initListeners: function(){
			var self = this,
				store = self.store,
				pageBar = self.pageBar,
				
				tpl = self.tpl;

			//开始加载数据时，隐藏分页条等
			store.on("beforeload", self.doBeforeLoad, self); //注意将作用域调整回grid
			store.on("load", self.doAfterLoad, self);

			//监听数据加载事件
			store.on("load", function(store, success, rs, json){
				if(false === success){
					return;
				}
				
				//触发grid的beforerender事件
				self.fireEvent("beforerender", self, store.getCurrentPage(json));
				
				//触发加载事件，刷新列表
				var html = [];
				$.each(rs, function(i, r){
					html.push(T.StringUtils.nano(tpl, r));
				});
				
				//触发grid的render事件
				self.fireEvent("render", self, html.join(""));
			});

			//分页条添加事件关联
			if(pageBar instanceof T.data.PageBar){
				pageBar.on("paging", function(pageBar, outPage, currentPage){
					//页码相等时不重新加载
					if(outPage != currentPage){

						//grid中设定的最大内页值
						var maxInnerPage = self.maxInnerPage;
						
						//计算要加载的实际页数
						outPage = (outPage - 1) * maxInnerPage + 1;
						
						//触发加载事件
						store.load(outPage);
					}
				});
				
				store.on("load", function(store, success, rs, json){

					//grid中设定的最大内页值
					var maxInnerPage = self.maxInnerPage,
					
						currentPage = store.getCurrentPage(),
						totalPage = store.getTotalPage(),
						
						pageRecord = store.getTotalRecord(),
						pageSize = store.getPageSize();
					
					//将系统实际页码，转换为外页
					currentPage = Math.ceil(currentPage / maxInnerPage);
					totalPage = Math.ceil(totalPage / maxInnerPage);
					
					//数据加载完成后，重新渲染分页条，以实际分页计算待显示的分页信息
					pageBar.render({
						currentPage: currentPage,
						totalPage: totalPage,
						totalRecord: pageRecord,
						pageSize: pageSize
					});
				});
			}
			
			self.on("render", self.doRender);
		},
		/**
		 * 初始化滚动加载处理
		 */
		initScrollListeners: function(){
			var self = this,
				$doc = $(document),
				lastScrollTop = 0;//记录上一次滚动位置

			//添加监听
			self.on("scrollonbottom", self.onScrollOnBottom);
			
			//分页操作前处理
			self.on("beforepaging", function(){
				//若当前正在进行分页操作, 则取消本次的分页操作
				//若当前内页已达最大值, 则取消本次操作（由分页条操作触发外页变更操作）
				if(this.getStore().onloading || this.innerPage == this.maxInnerPage){
					return false;
				}
			});
			
			//使用函数节流，缺省100ms内只执行一次
			var processor = new T.Processor(function(){
				var currentScrollTop = $doc.scrollTop();
				//当滚动条到达底部，或距离底部的距离已达到要求，则进行自动加载下一页处理
				if(T.scrollOnBottom(self.leaveBottom) && lastScrollTop < currentScrollTop){ //lastScrollTop < $doc.scrollTop() => 动作为往下拖动时，才需触发
					//触发事件
					self.fireEvent("scrollonbottom", self);
				}
				lastScrollTop = currentScrollTop;
			});

			//添加页面滚动事件监听
			$(window).scroll(function(){
				processor.process(); //每次需要执行函数数，执行代理方法
			});
		},
		/**
		 * 滚动加载分页
		 */
		onScrollOnBottom: function(grid){
			//事件监听返回false时, 终止执行
			if(false === this.fireEvent("beforepaging", this)){
				return;
			}
			
			var store = this.getStore();
			
			//加载下一页
			store.load(store.getCurrentPage() + 1);
		},
		//加载前处理
		doBeforeLoad: function(store, page){
			var self = this,
				pageBar = self.getPageBar(),
				maxInnerPage = self.maxInnerPage;
			
			//加载的页数所属外页
			var outerpage = pageBar.getCurrentPage(),
				loadOuterPage = Math.ceil(page / maxInnerPage);
			
			//待加载的实际页数不属于当前外页时，清空内容
			if(outerpage != loadOuterPage){
				self.removeContent();
			}
			
			//显示loading
			self.showLoading();
			
			//隐藏分页条
			pageBar.hide();
		},
		//加载后处理
		doAfterLoad: function(store, success){

			this.hideLoading();
			
			//数据加载失败时，终止执行
			if(false === success){
				return;
			}
			
			var self = this,
				pageBar = self.getPageBar(),
				
				maxInnerPage = self.maxInnerPage,
				innerPage;
				
			innerPage = self.innerPage = (store.getCurrentPage() - 1) % maxInnerPage + 1; //将内页范围设定为1-6
			
			self.outerPage = pageBar.getCurrentPage();
			
			//若到达maxInnerPage, 或当前已是最后一页        =>   显示分页条, 并显示"已到达最后一页"
			if(innerPage == maxInnerPage || self.getCurrentPage() >= store.getTotalPage()){
				pageBar.show();
				
				//若外页已经到达总页数, 则不再继续加载
//				if(currentPage >= store.getTotalPage()){
//					//显示已经到达最后一页, 在分页条上体现, 即没有"下一页"
//					return;
//				}
			}else{
				pageBar.hide();
			}
		},
		/**
		 * 返回当前实际页码
		 * @return {Number} 当前页的实际页码
		 */
		getCurrentPage: function(){
			var innerPage = this.innerPage,
				outerPage = this.getPageBar().getCurrentPage(), //外页为分页条上的当前页码
				maxInnerPage = this.maxInnerPage;
			
			return (outerPage - 1) * maxInnerPage + innerPage;
		},
		/**
		 * 显示loading
		 */
		showLoading: function(){
			this.loadingContext.show();
		},
		/**
		 * 隐藏loading, 错误信息
		 */
		hideLoading: function(){
			this.loadingContext.hide();
		},
		/**
		 * 初始化事件
		 */
		initEvents: function(){
			
			this.addEvents(
				/**
				 * @event 列表渲染前事件
				 * @param {T.data.Grid} grid 当前分页组件
				 * @param {Number} 当前加载的页数
				 */
				"beforerender",
				/**
				 * @event 渲染事件
				 * @param {T.data.Grid} grid 当前分页组件
				 * @param {String} html 数据内容
				 */
				"render",
				/**
				 * @event 滚动条到底部事件
				 * @param {T.data.Grid} grid 当前分页组件
				 */
				"scrollonbottom",
				/**
				 * @event 分页操作开始前事件
				 * @param {T.data.ScrollGrid} grid 当前分页组件
				 * @param {Number} 当前加载的页数
				 * @return {Boolean} 若事件监听返回false, 将取消分页操作
				 */
				"beforepaging",
				/**
				 * @event 开始分页事件
				 * @param {T.data.ScrollGrid} grid 当前分页组件
				 */
				"paging"
			);
		}
	});


})(jQuery, T);
;
/**
 * 数据加载存取对象<br/>
 *
 * 
 *<pre>
 //使用示例
 var store = new T.data.Store({
    url:"http://www.0.test1.com:8080/assistant_new/findImageByCategoryAndFigure.action",
    fields:["categoryId", "categoryIsLeaf", "imageCreateTime", "materialFilePathTmp", 
		{name:"materialFileType"}, {name:"abc", mapping:"materialProperty"}, {name:"qqq"}, 
		{name:"tipx", 
			convert:function(r){
				return r.materialDescript+"---"+r.materialFilePathTmp;
			}
		}],
    paramNames:{
		//提交参数
    	page: "currentPage",  //目的页码
    	
		//读取参数
        currentPage:"response.currentPage",   //分页参数名称(支持使用"."进行多级查询)
		totalPage: "response.totalPages",     //总页数(支持使用"."进行多级查询)
		totalRecord: "response.totalRows", //总记录数(支持使用"."进行多级查询)
		pageSize:"response.pageRecorders",    //(支持使用"."进行多级查询)

		root : "response.imageResourceArr.0",  //列表数据所在位置(支持使用"."进行多级查询)
		successProperty : "isSuccess" //成功/失败状态所在位置
    },
    baseParams:{
        "imageType": "0",
        "password": "hyvPYPXAUGT7eDJYtQRI2js2F+T3/crhBo7UbQAPmTi1TouLljr6mGG8AovbVf3w",
        "serviceId": "Mg==",
        "timestamp": "20130809100702",
        "eid": "5911577060",
        "adcToken": "B6662ED9-AA54-40BB-A5A3-28198E001BBD"
    }
});</pre>
 *
 *
 *
 */
;(function($, T, undefined){

	//声明命名空间
	T.ns("T.data");

	//其它对象
	T.data.Store = function(opts){
		$.extend(this, {
			/**
			 * 请求地址
			 */
			url: undefined,
			/**
			 * 数据的字段配置信息
			 * 
			 * //fields:[{name:"", mapping:"", convert: fn}]
			 * 包含参数：
			 *     name(必须)
			 *     mapping
			 *     convert
			 */
			fields:[], //fields:[{name:"", mapping:"", convert: fn}]
			/**
			 * 基础参数 - 每次load请求都会被提交，可以在load(params)时，用params覆盖值
			 * key - value
			 * 一般用于保存每次请求都要用的查询条件
			 */
			baseParams: {}
		}, opts);
		
		//解析字段参数
		this.parseFieldConf(this.fields);

		//参数名称
		this.paramNames = $.extend({}, this.defaultParamNames, opts.paramNames || {});


		//定义属性
		$.extend(this, {
			/**
			 * @property {Number} totalPage 总页数
			 */
			totalPage: 1,
			/**
			 * @property {Number} currentPage 当前页
			 */
			currentPage: 1,
			/**
			 * @property {Number} totalRecord 总记录数
			 */
			totalRecord: 0,
			/**
			 * @property {Number} pageSize 页大小
			 */
			pageSize: 20,

			/**
			 * @property {Boolean} onloading 加载状态, onloading值为true时, 代表grid正在加载数据
			 */
			onloading: false
		});


		//继承观察者类，添加事件功能
		T.data.Store.superclass.constructor.call(this);
		
		//初始化事件
		this.initEvents();
	};

	T.extend(T.data.Store, T.Observable, {
		//上一次请求参数，若未请求过为undefined
		lastParmas: undefined,
		/**
		 * 缺省参数名称
		 */
		defaultParamNames:{
			page: "currentPage", //加载的页码
			
			//加载的分页参数名称，支持使用"."深度获取json值
			currentPage: "currentPage", //页码
			totalPage: "totalPages",     //总页数
			totalRecord: "totalRecords", //总记录数
			pageSize: "pageSize",       //页大小
			
			//列表数据所在位置{total:20, success:true, records:[]}
			//支持使用".", 比如: "list.data.0" => {total:20, success:true, list:{data: [[...这里存数据] ]  } }
			root : "records", 
			successProperty : "success" //成功/失败状态所在位置
		},

		/**
		 * 加载数据 <br/>
		 * 使用请求参数的同时，还会使用baseParams，其中baseParams每次请求都会自动使用，常用于分页时保存查询条件<br/>
		 * 若未传入任何参数，则自动使用baseParams与lastParams的集合请求数据。若上一次有查询过，则相当于reload
		 * 
		 * @param {Number} page 请求页码，允许为空
		 * @param {Object} params 请求参数，允许为空
		 */
		load: function(page, params){
			var self = this;

			var destParams = {};
			switch($.type(page)){
				case "number":
					//若page为number，则存在page参数
					destParams[self.paramNames.page] = page;
					break;
				case "object": //只传了params参数
					params = page;
					break;
				case "undefined": //未传任何参数，使用上一次的请求参数，即相当于reload
					params = self.lastParams;
					break;
			}
			
			self.lastParams = $.extend(destParams, self.baseParams, params);

			//获取参数中的页码，若不存在则为undefined
			page = destParams[self.paramNames.page];

			//beforeload事件返回false时，不执行load操作
			if(false === self.fireEvent("beforeload", self, page, destParams)){
				return;
			}
			//清空当前数据
			self.removeAll();
			
			//设置标识
			self.onloading = true;

			CAjax(self.url,
				{
					cache: false,
					async: true,
					data : destParams
				},
				function(json){
					//若json中未定义successProperty对应的属性，则返回true
					var success = (false !== json[self.paramNames.successProperty]),
						data;
					
					if(success){
						//将数据按格式解析为对象属性
						data = self.loadData(json);
					}
					//触发load事件
					self.fireEvent("load", self, success, data, json);

					//重置标识
					self.onloading = false;
					self.fireEvent("loadcomplete", self, json);
				},
				function(json){
					//重置标识
					self.onloading = false;
					self.fireEvent("loaderror", self, json);
					self.fireEvent("loadcomplete", self, json);
				},
				function(json){ //由于CAjax不一定有completeFn，所以在各请求回调中都加onloading，和事件触发
					//重置标识
					self.onloading = false;
					self.fireEvent("loadcomplete", self, json);
				}
			);
			
			//原始标准请求
//			$.ajax({
//				url: self.url,
//				type: "POST",
//				cache: false,
//				dataType : "json",
//				data: destParams,
//				success: function(json){
//					//若json中未定义successProperty对应的属性，则返回true
//					var success = (false !== json[self.paramNames.successProperty]),
//						data;
//					
//					if(success){
//						//将数据按格式解析为对象属性
//						data = self.loadData(json);
//					}
//					//触发load事件
//					self.fireEvent("load", self, success, data, json);
//				},
//				error: function(request){
//					self.fireEvent("loaderror", self, request);
//				},
//				complete: function(request, textStatus){
//					//重置标识
//					self.onloading = false;
//					self.fireEvent("loadcomplete", self, request, textStatus);
//				}
//			});
		},
		/**
		 * 解析加载数据
		 *
		 * @param {Object} json 数据集
		 * @return {Array} 列表数据
		 */
		loadData: function(json){
			var self = this,
				rs = T.getJSONValue(json, self.paramNames.root);

			//解析页码数据
			$.each(["currentPage","totalPage","totalRecord","pageSize"], function(i, name){
				self[name] = T.getJSONValue(json, self.paramNames[name]);
			});

			return self.data = self.parseData(rs || []);
		},
		/**
		 * //private
		 * 解析数据
		 * @param {Array} sourceData 源数据对象
		 * @param {Array} data 转换后的数据对象
		 */
		parseData: function(sourceData){
			var self = this,
				fields = self.fields,
				data = [];
			$.each(sourceData, function(i, record){
				var r = {};
				$.each(fields, function(i, conf){
					//name: 字段名称, mapping: 映射数据中的名称
					r[conf.name] = conf.convert(record);
				});
				data.push(r);
			});
			return data;
		},
		/**
		 * 解析字段参数<br/>
		 * 将用户设置的字段参数转换为标准的字段参数
		 * @param {Array} fields 用户设置的字段参数
		 */
		parseFieldConf: function(fields){
			var self = this,
				fs = self.fields = [],
				f;
			$.each(fields, function(i, field){
				//初始化配置信息，field为string类型时适用，如: fields:["userCode", {...} ...]中的"userCode"
				f = {
					"name": field, //字段名称
					"mapping": field, //映射数据对应的名称
					"convert": self.defaultConvert //设定缺省的字段值转换器
				};
				if("object" == $.type(field)){
					//field为{}时，所以初始化时，会将mapping置为整个{}
					//由于name是必须提供的属性，所以此处只重置mapping
					f.mapping = field.name;
					
					$.extend(f, field);
				}
				fs.push(f);
			});
		},
		/**
		 * //private
		 * 默认转换器 - call(fieldConf, record)
		 * @param name 字段名称
		 * @param record 行记录信息
		 * @returns 记录中该字段的值
		 */
		defaultConvert: function(record){
			var fieldConf = this;
			return record[fieldConf.mapping];
		},
		/**
		 * 获取列表数据
		 *
		 * @return {Array} 列表数据
		 */
		getData: function(){
			return this.data;
		},
		/**
		 * 获取当前页码
		 *
		 * @return {Number} 数量
		 */
		getCurrentPage: function(){
			return this.currentPage;
		},
		/**
		 * 获取总页数
		 *
		 * @return {Number} 数量
		 */
		getTotalPage: function(){
			return this.totalPage;
		},
		/**
		 * 获取总记录数
		 *
		 * @return {Number} 数量
		 */
		getTotalRecord: function(){
			return this.totalRecord;
		},
		/**
		 * 获取页大小
		 *
		 * @return {Number} 数量
		 */
		getPageSize: function(){
			return this.pageSize;
		},
		/**
		 * 清空数据
		 */
		removeAll: function(){
			self.data = [];
		},
		/**
		 * 初始化事件
		 */
		initEvents: function(){
			this.addEvents(
				/**
				 * @event 数据加载前事件
				 * @param {T.data.Store} store 当前store
				 * @param {Number} page 请求页码, 若未传该参数, 则值为undefined
				 * @param {Object} destParams 请求参数
				 * 
				 * @return {Boolean} 事件返回false时，将取消数据加载操作
				 */
				"beforeload",
				/**
				 * @event 数据加载成功事件
				 * @param {T.data.Store} store 当前store
				 * @param {Boolean} success 返回的successProperty属性对应的值
				 * @param {Array} data 根据root属性及field配置解析后的数据
				 * @param {Object} json 加载的原始数据
				 */
				"load",
				/**
				 * @event 数据加载失败事件
				 * @param {T.data.Store} store 当前store
				 * @param {XMLHTTPRequest} request XHR对象
				 */
				"loaderror", 
				/**
				 * @event 数据加载完成事件
				 * @param {T.data.Store} store 当前store
				 * @param {XMLHTTPRequest} request XHR对象
				 * @param {String} textStatus 请求状态
				 */
				"loadcomplete"
			);
		}
	});

})(jQuery, T);
;
//jQuery扩展
;(function($, undefined){
	//添加id方法
	var idSeed = 0,
		defaultPrefix = "jq-gen-";
	
	//$下添加工具
	$.extend({
		/**
		 * 使用统一方式生成id，可最大程度上避免id重复
		 * @param prefix 前缀，缺省为"jq-gen-"
		 * @returns 生成的id
		 */
		id: function(prefix){
			return (prefix || defaultPrefix) + (++idSeed);
		},
		/**
		 * 设置命名空间 - 摘自extjs<br/>
		 * 允许接收n个参数, 同时声明n个命名空间<br/>
		 * 调用: $.ns("qtt.web.system"); 声明后, 即可直接使用qtt.web.system.属性名 = 属性值.
		 * @param {String} namespace1
		 * @param {String} namespace2 
		 * @param {String} etc
		 * @return {Object} 声明的最后一个命名空间对象
		 */
		ns: function(){
			var o, d;
            $.each(arguments, function(i, v) {
                d = v.split(".");
                o = window[d[0]] = window[d[0]] || {};
                $.each(d.slice(1), function(j, child){
                    o = o[child] = o[child] || {};
                });
            });
            return o;
		}
	});

	$.fn.extend({
		/**
		 * 获取/创建元素id
		 * @param newId 若传入id，则使用该id重新设置元素，若为空，则返回元素id（若当前元素没有id，则自动生成id）
		 * @returns 元素id
		 */
		id: function(newId){
			if(undefined != newId){
				this.attr("id", newId);
			}else if(undefined == this.attr("id")){
				this.attr("id", $.id());
			}
			return this.attr("id");
		}
	});
})(jQuery);
