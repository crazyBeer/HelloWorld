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