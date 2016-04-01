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