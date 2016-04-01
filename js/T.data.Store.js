/**
 * 数据加载存取对象<br/>
 *
 * 
 *<pre>
 //使用示例
 var store = new T.data.Store({
    url:"http://www.0.test1.com:8080/assistant_new/findImageByCategoryAndFigure.action",
    fields:["categoryId", "categoryIsLeaf", "imageCreateTime", "materialFilePathTmp", 
		{name:"materialFileType"}, {name:"abc", mapping:"materialProperty"}, {name:"qqq"}, 
		{name:"tipx", 
			convert:function(r){
				return r.materialDescript+"---"+r.materialFilePathTmp;
			}
		}],
    paramNames:{
		//提交参数
    	page: "currentPage",  //目的页码
    	
		//读取参数
        currentPage:"response.currentPage",   //分页参数名称(支持使用"."进行多级查询)
		totalPage: "response.totalPages",     //总页数(支持使用"."进行多级查询)
		totalRecord: "response.totalRows", //总记录数(支持使用"."进行多级查询)
		pageSize:"response.pageRecorders",    //(支持使用"."进行多级查询)

		root : "response.imageResourceArr.0",  //列表数据所在位置(支持使用"."进行多级查询)
		successProperty : "isSuccess" //成功/失败状态所在位置
    },
    baseParams:{
        "imageType": "0",
        "password": "hyvPYPXAUGT7eDJYtQRI2js2F+T3/crhBo7UbQAPmTi1TouLljr6mGG8AovbVf3w",
        "serviceId": "Mg==",
        "timestamp": "20130809100702",
        "eid": "5911577060",
        "adcToken": "B6662ED9-AA54-40BB-A5A3-28198E001BBD"
    }
});</pre>
 *
 *
 *
 */
;(function($, T, undefined){

	//声明命名空间
	T.ns("T.data");

	//其它对象
	T.data.Store = function(opts){
		$.extend(this, {
			/**
			 * 请求地址
			 */
			url: undefined,
			/**
			 * 数据的字段配置信息
			 * 
			 * //fields:[{name:"", mapping:"", convert: fn}]
			 * 包含参数：
			 *     name(必须)
			 *     mapping
			 *     convert
			 */
			fields:[], //fields:[{name:"", mapping:"", convert: fn}]
			/**
			 * 基础参数 - 每次load请求都会被提交，可以在load(params)时，用params覆盖值
			 * key - value
			 * 一般用于保存每次请求都要用的查询条件
			 */
			baseParams: {}
		}, opts);
		
		//解析字段参数
		this.parseFieldConf(this.fields);

		//参数名称
		this.paramNames = $.extend({}, this.defaultParamNames, opts.paramNames || {});


		//定义属性
		$.extend(this, {
			/**
			 * @property {Number} totalPage 总页数
			 */
			totalPage: 1,
			/**
			 * @property {Number} currentPage 当前页
			 */
			currentPage: 1,
			/**
			 * @property {Number} totalRecord 总记录数
			 */
			totalRecord: 0,
			/**
			 * @property {Number} pageSize 页大小
			 */
			pageSize: 20,

			/**
			 * @property {Boolean} onloading 加载状态, onloading值为true时, 代表grid正在加载数据
			 */
			onloading: false
		});


		//继承观察者类，添加事件功能
		T.data.Store.superclass.constructor.call(this);
		
		//初始化事件
		this.initEvents();
	};

	T.extend(T.data.Store, T.Observable, {
		//上一次请求参数，若未请求过为undefined
		lastParmas: undefined,
		/**
		 * 缺省参数名称
		 */
		defaultParamNames:{
			page: "currentPage", //加载的页码
			
			//加载的分页参数名称，支持使用"."深度获取json值
			currentPage: "currentPage", //页码
			totalPage: "totalPages",     //总页数
			totalRecord: "totalRecords", //总记录数
			pageSize: "pageSize",       //页大小
			
			//列表数据所在位置{total:20, success:true, records:[]}
			//支持使用".", 比如: "list.data.0" => {total:20, success:true, list:{data: [[...这里存数据] ]  } }
			root : "records", 
			successProperty : "success" //成功/失败状态所在位置
		},

		/**
		 * 加载数据 <br/>
		 * 使用请求参数的同时，还会使用baseParams，其中baseParams每次请求都会自动使用，常用于分页时保存查询条件<br/>
		 * 若未传入任何参数，则自动使用baseParams与lastParams的集合请求数据。若上一次有查询过，则相当于reload
		 * 
		 * @param {Number} page 请求页码，允许为空
		 * @param {Object} params 请求参数，允许为空
		 */
		load: function(page, params){
			var self = this;

			var destParams = {};
			switch($.type(page)){
				case "number":
					//若page为number，则存在page参数
					destParams[self.paramNames.page] = page;
					break;
				case "object": //只传了params参数
					params = page;
					break;
				case "undefined": //未传任何参数，使用上一次的请求参数，即相当于reload
					params = self.lastParams;
					break;
			}
			
			self.lastParams = $.extend(destParams, self.baseParams, params);

			//获取参数中的页码，若不存在则为undefined
			page = destParams[self.paramNames.page];

			//beforeload事件返回false时，不执行load操作
			if(false === self.fireEvent("beforeload", self, page, destParams)){
				return;
			}
			//清空当前数据
			self.removeAll();
			
			//设置标识
			self.onloading = true;

			CAjax(self.url,
				{
					cache: false,
					async: true,
					data : destParams
				},
				function(json){
					//若json中未定义successProperty对应的属性，则返回true
					var success = (false !== json[self.paramNames.successProperty]),
						data;
					
					if(success){
						//将数据按格式解析为对象属性
						data = self.loadData(json);
					}
					//触发load事件
					self.fireEvent("load", self, success, data, json);

					//重置标识
					self.onloading = false;
					self.fireEvent("loadcomplete", self, json);
				},
				function(json){
					//重置标识
					self.onloading = false;
					self.fireEvent("loaderror", self, json);
					self.fireEvent("loadcomplete", self, json);
				},
				function(json){ //由于CAjax不一定有completeFn，所以在各请求回调中都加onloading，和事件触发
					//重置标识
					self.onloading = false;
					self.fireEvent("loadcomplete", self, json);
				}
			);
			
			//原始标准请求
//			$.ajax({
//				url: self.url,
//				type: "POST",
//				cache: false,
//				dataType : "json",
//				data: destParams,
//				success: function(json){
//					//若json中未定义successProperty对应的属性，则返回true
//					var success = (false !== json[self.paramNames.successProperty]),
//						data;
//					
//					if(success){
//						//将数据按格式解析为对象属性
//						data = self.loadData(json);
//					}
//					//触发load事件
//					self.fireEvent("load", self, success, data, json);
//				},
//				error: function(request){
//					self.fireEvent("loaderror", self, request);
//				},
//				complete: function(request, textStatus){
//					//重置标识
//					self.onloading = false;
//					self.fireEvent("loadcomplete", self, request, textStatus);
//				}
//			});
		},
		/**
		 * 解析加载数据
		 *
		 * @param {Object} json 数据集
		 * @return {Array} 列表数据
		 */
		loadData: function(json){
			var self = this,
				rs = T.getJSONValue(json, self.paramNames.root);

			//解析页码数据
			$.each(["currentPage","totalPage","totalRecord","pageSize"], function(i, name){
				self[name] = T.getJSONValue(json, self.paramNames[name]);
			});

			return self.data = self.parseData(rs || []);
		},
		/**
		 * //private
		 * 解析数据
		 * @param {Array} sourceData 源数据对象
		 * @param {Array} data 转换后的数据对象
		 */
		parseData: function(sourceData){
			var self = this,
				fields = self.fields,
				data = [];
			$.each(sourceData, function(i, record){
				var r = {};
				$.each(fields, function(i, conf){
					//name: 字段名称, mapping: 映射数据中的名称
					r[conf.name] = conf.convert(record);
				});
				data.push(r);
			});
			return data;
		},
		/**
		 * 解析字段参数<br/>
		 * 将用户设置的字段参数转换为标准的字段参数
		 * @param {Array} fields 用户设置的字段参数
		 */
		parseFieldConf: function(fields){
			var self = this,
				fs = self.fields = [],
				f;
			$.each(fields, function(i, field){
				//初始化配置信息，field为string类型时适用，如: fields:["userCode", {...} ...]中的"userCode"
				f = {
					"name": field, //字段名称
					"mapping": field, //映射数据对应的名称
					"convert": self.defaultConvert //设定缺省的字段值转换器
				};
				if("object" == $.type(field)){
					//field为{}时，所以初始化时，会将mapping置为整个{}
					//由于name是必须提供的属性，所以此处只重置mapping
					f.mapping = field.name;
					
					$.extend(f, field);
				}
				fs.push(f);
			});
		},
		/**
		 * //private
		 * 默认转换器 - call(fieldConf, record)
		 * @param name 字段名称
		 * @param record 行记录信息
		 * @returns 记录中该字段的值
		 */
		defaultConvert: function(record){
			var fieldConf = this;
			return record[fieldConf.mapping];
		},
		/**
		 * 获取列表数据
		 *
		 * @return {Array} 列表数据
		 */
		getData: function(){
			return this.data;
		},
		/**
		 * 获取当前页码
		 *
		 * @return {Number} 数量
		 */
		getCurrentPage: function(){
			return this.currentPage;
		},
		/**
		 * 获取总页数
		 *
		 * @return {Number} 数量
		 */
		getTotalPage: function(){
			return this.totalPage;
		},
		/**
		 * 获取总记录数
		 *
		 * @return {Number} 数量
		 */
		getTotalRecord: function(){
			return this.totalRecord;
		},
		/**
		 * 获取页大小
		 *
		 * @return {Number} 数量
		 */
		getPageSize: function(){
			return this.pageSize;
		},
		/**
		 * 清空数据
		 */
		removeAll: function(){
			self.data = [];
		},
		/**
		 * 初始化事件
		 */
		initEvents: function(){
			this.addEvents(
				/**
				 * @event 数据加载前事件
				 * @param {T.data.Store} store 当前store
				 * @param {Number} page 请求页码, 若未传该参数, 则值为undefined
				 * @param {Object} destParams 请求参数
				 * 
				 * @return {Boolean} 事件返回false时，将取消数据加载操作
				 */
				"beforeload",
				/**
				 * @event 数据加载成功事件
				 * @param {T.data.Store} store 当前store
				 * @param {Boolean} success 返回的successProperty属性对应的值
				 * @param {Array} data 根据root属性及field配置解析后的数据
				 * @param {Object} json 加载的原始数据
				 */
				"load",
				/**
				 * @event 数据加载失败事件
				 * @param {T.data.Store} store 当前store
				 * @param {XMLHTTPRequest} request XHR对象
				 */
				"loaderror", 
				/**
				 * @event 数据加载完成事件
				 * @param {T.data.Store} store 当前store
				 * @param {XMLHTTPRequest} request XHR对象
				 * @param {String} textStatus 请求状态
				 */
				"loadcomplete"
			);
		}
	});

})(jQuery, T);