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
