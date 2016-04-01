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