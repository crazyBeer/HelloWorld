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