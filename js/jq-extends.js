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
