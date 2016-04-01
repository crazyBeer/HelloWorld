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