/** SpagoBI, the Open Source Business Intelligence suite

 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. **/

Ext.ns("Sbi.cockpit.widgets.linechart");

Ext.define('Sbi.cockpit.widgets.linechart.LineChartWidgetDesigner', {

	extend: 'Sbi.cockpit.core.WidgetDesigner'

	, config:{
		title: LN('sbi.cockpit.widgets.linechart.LineChartWidgetDesigner.title')
		, border: false
		, chartLib: 'highcharts'
		, ddGroup: null
		, showSeriesGroupingPanel: false
	}

	, form: null
	, items: null
	, typeRadioGroup: null
	, colorAreaCheck: null
	, showValuesCheck: null
	, imageTemplate: null
	, categoryContainerPanel: null
	, seriesGroupingPanel: null
	, seriesContainerPanel: null
	, axisDefinitionPanel: null
	, showLegendCheck: null
	, radioGroupIds: null
	, chartLib: null
	, initialConfig: null
	, categoryAxis: null
	, seriesAxis: null
	, sortOrder: null
	, legendPositionCombo: null

	, constructor : function(config) {
		Sbi.trace("[PieChartWidgetDesigner.constructor]: IN");

		this.initialConfig = config || null;
		this.initConfig(config);
		this.init(config);
		this.items = [this.form];

		this.callParent(arguments);

		this.initEvents();

		Sbi.trace("[PieChartWidgetDesigner.constructor]: OUT");
	}

	// =================================================================================================================
	// METHODS
	// =================================================================================================================

	//-----------------------------------------------------------------------------------------------------------------
	//public methods
	//-----------------------------------------------------------------------------------------------------------------

	, getDesignerState: function() {
		Sbi.trace("[LineChartWidgetDesigner.getDesignerState]: IN");
		Sbi.trace("[LineChartWidgetDesigner.getDesignerState]: " + Sbi.cockpit.widgets.piechart.PieChartWidgetDesigner.superclass.getDesignerState);
		var state = Sbi.cockpit.widgets.piechart.PieChartWidgetDesigner.superclass.getDesignerState(this);
		state.designer = 'Line Chart';
		state.wtype = 'linechart';

		state.type = this.typeRadioGroup.getValue().type;
		state.colorarea = this.colorAreaCheck.getValue();
		state.showvalues = this.showValuesCheck.getValue();
		state.showlegend = this.showLegendCheck.getValue();
		state.legendPosition = this.legendPositionCombo.getValue();
		state.categoryAxis = this.categoryAxisText.getValue();
		state.seriesAxis = this.seriesAxisText.getValue();
		state.sortOrder = this.sortOrderCombo.getValue();
		state.category = this.categoryContainerPanel.getCategory();
		if(this.showSeriesGroupingPanel === true) {
			state.groupingVariable = this.seriesGroupingPanel.getSeriesGroupingAttribute();
		}

		state.series = this.seriesContainerPanel.getContainedMeasures();
		Sbi.trace("[LineChartWidgetDesigner.getDesignerState]: OUT");

		return state;
	}

	, setDesignerState: function(state) {
		Sbi.trace("[LineChartWidgetDesigner.setDesignerState]: IN");

		if (state.type) this.typeRadioGroup.setValue({type: state.type});
		if (state.colorarea) this.colorAreaCheck.setValue(state.colorarea);
		if (state.showvalues) this.showValuesCheck.setValue(state.showvalues);
		if (state.showlegend) this.showLegendCheck.setValue(state.showlegend);
		if (state.legendPosition) this.legendPositionCombo.setValue(state.legendPosition);
		if (state.category) this.categoryContainerPanel.setCategory(state.category);
		if (state.groupingVariable && this.showSeriesGroupingPanel === true) this.seriesGroupingPanel.setSeriesGroupingAttribute(state.groupingVariable);
		if (state.series) this.seriesContainerPanel.setMeasures(state.series);
		if (state.categoryAxis) this.categoryAxisText.setValue(state.categoryAxis);
		if (state.seriesAxis) this.seriesAxisText.setValue(state.seriesAxis);
		if (state.sortOrder) this.sortOrderCombo.setValue(state.sortOrder);

		if (this.rendered) {
			//this.changeLineChartImage.defer(200, this);
			// It seems to work properly also without deferring
			this.changeLineChartImage();
		}

		Sbi.trace("[LineChartWidgetDesigner.setDesignerState]: OUT");
	}

	, validate: function(validFields){

		var valErr='';
		valErr+= ''+this.categoryContainerPanel.validate(validFields);
		valErr+= ''+this.seriesContainerPanel.validate(validFields);
		if(this.showSeriesGroupingPanel === true) {
			valErr+= ''+this.seriesGroupingPanel.validate(validFields);
		}

		if(valErr != ''){
			valErr = valErr.substring(0, valErr.length - 1)
			return LN("sbi.widget.designer.validation.invalidFields")+valErr;
		}

		if (this.categoryContainerPanel.category == null){
			return LN("sbi.widget.designer.chartValidation.noCategory");
		}
		var store = this.seriesContainerPanel.store;
		var seriesCount = store.getCount();
		if (seriesCount == 0){
			return LN("sbi.widget.designer.chartValidation.noSeries");
		}

		return;

	}

	, containsAttribute: function (attributeId) {
		var category = this.categoryContainerPanel.getCategory();
		if (category != null && category.id == attributeId) {
			return true;
		}
		if(this.showSeriesGroupingPanel === true) {
			var groupingVariable = this.seriesGroupingPanel.getSeriesGroupingAttribute();
			if (groupingVariable != null && groupingVariable.id == attributeId) {
				return true;
			}
		}
		return false;
	}

	, addToolTips: function(){
		this.removeListener('afterLayout', this.addToolTips, this);

		var sharedConf = {
			anchor : 'top'
			, width : 200
			, trackMouse : true
		};

		new Ext.ToolTip(Ext.apply({
			target: this.radioGroupIds[0] + '-bodyEl',
			html: LN('sbi.cockpit.widgets.linechart.LineChartWidgetDesigner.form.type.tooltip.side-by-side')
		}, sharedConf));
//		new Ext.ToolTip(Ext.apply({
//			target: this.radioGroupIds[1] + '-bodyEl',
//			html: LN('sbi.cockpit.widgets.linechart.LineChartWidgetDesigner.form.type.tooltip.stacked')
//		}, sharedConf));
		new Ext.ToolTip(Ext.apply({
			target: this.radioGroupIds[1] + '-bodyEl',
			html: LN('sbi.cockpit.widgets.linechart.LineChartWidgetDesigner.form.type.tooltip.percent-stacked')
		}, sharedConf));
	}



	, changeLineChartImage: function() {
		var type = this.typeRadioGroup.getValue().type;
		var lineOrArea = this.colorAreaCheck.getValue() ? 'area' : 'line';
		var newHtml = this.imageTemplate.apply([type, lineOrArea]);
		this.imageContainerPanel.update(newHtml);
	}


	, checkIfAttributeIsAlreadyPresent: function(aPanel, attribute) {
		var attributeId = attribute.id;
		var alreadyPresent = this.containsAttribute(attributeId);
		if (alreadyPresent) {
			Ext.Msg.show({
				   title: LN('sbi.widget.attributescontainerpanel.cannotdrophere.title'),
				   msg: LN('sbi.widget.attributescontainerpanel.cannotdrophere.attributealreadypresent'),
				   buttons: Ext.Msg.OK,
				   icon: Ext.MessageBox.WARNING
			});
			return false;
		}
		return true;
	}





	// -----------------------------------------------------------------------------------------------------------------
	// init methods
	// -----------------------------------------------------------------------------------------------------------------

	, init: function () {
		this.initOptionsPanel();
		this.initAxisDefinitionPanel();

		this.form = new Ext.form.FormPanel({
			border: false
			, items: [this.optionsPanel, this.axisDefinitionPanel]
		});
	}

	, initOptionsPanel: function() {
		this.initTemplate();
		this.initRadioGroup();
		this.initCheckFields();
		this.initAxisNamesFields();
		this.initSortOrderCombo();

		var checkFields = new Array();

		switch (this.chartLib) {
	        case 'ext3':
	        	break;
	        default:
	        	checkFields.push(this.colorAreaCheck);
	        	checkFields.push(this.showValuesCheck);
		}
		
		checkFields.push(this.showLegendCheck);
		checkFields.push(this.categoryAxisText);
		checkFields.push(this.seriesAxisText);
		checkFields.push(this.legendPositionCombo);
		checkFields.push(this.sortOrderCombo);


		this.optionsPanel = new Ext.Panel({
			layout: 'anchor'
			, padding: '5 10 0 10'
			, border: false
			, items: [
			{
				xtype: 'fieldset'
				, fieldDefaults: { margin: '0 7 5 0'}
				, layout: {type: 'table', columns: 3}
			    , collapsible: true
			    , collapsed: true
			    , title: LN('sbi.cockpit.widgets.linechart.LineChartWidgetDesigner.form.options.title')
				, margin: '0 0 20 0'
				, items: checkFields
			},
			{
				xtype: 'fieldset'
//				, columnWidth : .4
				, margin: '0 0 0 0'
				, border: false
				, items: [this.typeRadioGroup]
			} ]
		});
	}

	, initTemplate: function () {
        this.imageTemplate = new Ext.Template('<div class="{0}-{1}-preview" style="height: 100%;"></div>');
        this.imageTemplate.compile();
	}

	, initRadioGroup: function() {
		this.radioGroupIds = [Ext.id(), Ext.id(), Ext.id()]; // generate random id

		this.typeRadioGroup = new Ext.form.RadioGroup({
			hideLabel: true,
			columns: 3,
			items: [
		        {name: 'type', height: 80, width: 80, id: this.radioGroupIds[0], ctCls:'side-by-side-linechart-line', inputValue: 'side-by-side-linechart', checked: true},
//		        {name: 'type', height: 80, width: 80, id: this.radioGroupIds[1], ctCls:'stacked-linechart-line', inputValue: 'stacked-linechart'},
		        {name: 'type', height: 80, width: 80, id: this.radioGroupIds[2], ctCls:'percent-stacked-linechart-line', inputValue: 'percent-stacked-linechart'}
			]
		});
		this.typeRadioGroup.on('change', this.onTypeRadioGroupChange, this);
	}

	, initSortOrderCombo: function(){
		this.sortOrderComboStore = new Ext.data.ArrayStore({
			fields : ['name', 'description']
			, data : [['ASC', LN('sbi.worksheet.designer.barchartdesignerpanel.form.sortorder.ascending')]
					, ['DESC', LN('sbi.worksheet.designer.barchartdesignerpanel.form.sortorder.descending')]]
		});
		this.sortOrderCombo = new Ext.form.ComboBox({
			queryMode:      'local',
			triggerAction:  'all',
			forceSelection: true,
			editable:       false,
			allowBlank: 	false,
			fieldLabel:     LN('sbi.worksheet.designer.barchartdesignerpanel.form.sortorder.title'),
			name:           'sortOrder',
			displayField:   'description',
			valueField:     'name',
			value:			'ASC',
//			anchor:			'95%',
			store:          this.sortOrderComboStore,
			labelWidth: 120,
			width: 250
		});
	}

	, initCheckFields: function() {
		this.colorAreaCheck = new Ext.form.Checkbox({
			checked: false
			, fieldLabel: LN('sbi.cockpit.widgets.linechart.LineChartWidgetDesigner.form.colorarea.title')
			, labelWidth: 120
		});
		this.colorAreaCheck.on('check', this.onColorAreaCheck, this);

		this.showValuesCheck = new Ext.form.Checkbox({
			checked: false
			, fieldLabel: LN('sbi.cockpit.widgets.linechart.LineChartWidgetDesigner.form.showvalues.title')
		});

		this.showLegendCheck = new Ext.form.Checkbox({
			checked: false
			, fieldLabel: LN('sbi.cockpit.widgets.linechart.LineChartWidgetDesigner.form.showlegend.title')
		});

		this.legendPositionStore = new Ext.data.ArrayStore({
			fields : ['name', 'description']
			, data : [['bottom', LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.bottom')]
					, ['top', LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.top')]
					, ['left', LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.left')]
					, ['right', LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.right')]]
		});
		this.legendPositionCombo = new Ext.form.ComboBox({
//			width:			180,
			queryMode:      'local',
			triggerAction:  'all',
			forceSelection: true,
			editable:       false,
			allowBlank: 	false,
			fieldLabel:      LN('sbi.cockpit.widgets.piechartwidgetdesigner.form.legend.position.title'),
			name:           'position',
			displayField:   'description',
			valueField:     'name',
			value:			'bottom',
			store:          this.legendPositionStore,
			width: 180
		});
	}

	, initAxisNamesFields: function(){
		this.categoryAxisText = new Ext.form.Text({
			 name: 'categoryAxis',
			 fieldLabel: LN('sbi.worksheet.designer.barchartdesignerpanel.form.categoryaxis.title'),
			 allowBlank: true,
			 labelWidth: 120,
			 width: 250
		});

		this.seriesAxisText = new Ext.form.Text({
			 name: 'seriesAxis',
			 fieldLabel: LN('sbi.worksheet.designer.barchartdesignerpanel.form.seriesaxis.title'),
			 allowBlank: true,
			 width: 200
		});
	}

	, initAxisDefinitionPanel: function() {
		this.initCategoryContainerPanel();
		this.initSeriesGroupingPanel();
		this.initSeriesContainerPanel();
		this.initImageContainerPanel();

	    this.axisDefinitionPanel = new Ext.Panel({
	        layout: 'table'
	        , baseCls:'x-plain'
	        , cls: 'x-axis-definition-table'
	        , width: this.seriesContainerPanel.width+this.imageContainerPanel.width+20 //for center the panel
	        , padding: '0 10 10 10'
	        , layoutConfig: {columns : 2}
	        , items:[
	            this.seriesContainerPanel
	            , this.imageContainerPanel
	            , this.seriesGroupingPanel
		        , this.categoryContainerPanel
		    ]
	    });
	}

	, initCategoryContainerPanel: function() {
		this.categoryContainerPanel = new Sbi.cockpit.widgets.chart.ChartCategoryPanel({
            width: 200
            , height: 70
            , initialData: null
            , ddGroup: this.ddGroup
		});
		// propagate events
		this.categoryContainerPanel.on(
			'attributeDblClick' ,
			function (thePanel, attribute) {
				this.fireEvent("attributeDblClick", this, attribute);
			},
			this
		);
		this.categoryContainerPanel.on(
			'attributeRemoved' ,
			function (thePanel, attribute) {
				this.fireEvent("attributeRemoved", this, attribute);
			},
			this
		);
	}

	, initSeriesGroupingPanel: function() {
		if(this.showSeriesGroupingPanel === true) {
			this.seriesGroupingPanel = new Sbi.cockpit.widgets.chart.SeriesGroupingPanel({
	            width: 430
	            , height: 70
	            , initialData: null
	            , ddGroup: this.ddGroup
			});
			// propagate events
			this.seriesGroupingPanel.on(
				'attributeDblClick' ,
				function (thePanel, attribute) {
					this.fireEvent("attributeDblClick", this, attribute);
				},
				this
			);
			this.seriesGroupingPanel.on(
				'attributeRemoved' ,
				function (thePanel, attribute) {
					this.fireEvent("attributeRemoved", this, attribute);
				},
				this
			);
		} else {
			this.seriesGroupingPanel = new Ext.Panel({border:false, frame:false});
		}
	}

	, initSeriesContainerPanel: function() {
		this.seriesContainerPanel = new Sbi.cockpit.widgets.chart.ChartSeriesPanel({
            width: 430
            , height: 100
            , initialData: []
            , crosstabConfig: {}
            , ddGroup: this.ddGroup
            , parent: 'linechart'
		});
	}

	, initImageContainerPanel: function() {
		this.imageContainerPanel = new Ext.Panel({
            width: 200
            , height: 100
            , html: this.imageTemplate.apply(['side-by-side-linechart', 'line'])
		});
	}

	, initEvents: function(){
		if(Ext.isIE){
			this.on('resize', function(a,b,c,d){try{ this.form.setWidth(b-40);}catch(r){}}, this);
		}

		this.on('beforerender' , function (thePanel, attribute) {
			if(this.initialConfig != null) {
				this.setDesignerState(this.initialConfig);
				this.initialConfig = null;
			}

		}, this);

		this.on('afterLayout', this.addToolTips, this);
		this.categoryContainerPanel.on(	'beforeAddAttribute', this.checkIfAttributeIsAlreadyPresent, this);
		if(this.showSeriesGroupingPanel === true) {
			this.seriesGroupingPanel.on('beforeAddAttribute', this.checkIfAttributeIsAlreadyPresent, this);
		}
		this.addEvents("attributeDblClick", "attributeRemoved");
	}

	// -----------------------------------------------------------------------------------------------------------------
	// utility methods
	// -----------------------------------------------------------------------------------------------------------------
	, onTypeRadioGroupChange: function() {
		Sbi.trace("[LineChartWidgetDesigner.onTypeRadioGroupChange]: IN");
		this.changeLineChartImage();
		Sbi.trace("[LineChartWidgetDesigner.onTypeRadioGroupChange]: OUT");
	}

	, onColorAreaCheck: function() {
		Sbi.trace("[LineChartWidgetDesigner.onColorAreaCheck]: IN");
		this.changeLineChartImage();
		Sbi.trace("[LineChartWidgetDesigner.onColorAreaCheck]: OUT");
	}
});
