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