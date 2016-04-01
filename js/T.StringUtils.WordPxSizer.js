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