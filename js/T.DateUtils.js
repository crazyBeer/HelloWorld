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