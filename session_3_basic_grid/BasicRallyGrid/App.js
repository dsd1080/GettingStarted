// Custom Rally App that displays Stories in a grid.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css

    // Entry Point to App
    launch: function() {
	 
		console.log('our second app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
      
		this.pulldownContainer = Ext.create('Ext.container.Container', {
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
		});
		
		this.add(this.pulldownContainer);
		
		this._loadIterations();
    },

	_loadIterations: function() {
		
		// Seems to make the combobox work
		var myIterations = Ext.create('Rally.data.wsapi.Store', {
		  model: 'Iteration',
          context: { 
					workspace: 'workspace/1625435694',
					project: 'project/13193012677',
					projectScopeDown: false,
					projectScopeUp: false,
			},		  
          autoLoad: true
		});
				
		this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {				
			store: myIterations,
			context: this.getContext().getDataContext(),
			listeners: {
				ready: function(combobox) {
					//this._loadData();  
					this._loadSeverities();
					// console.log("Context", this.getContext().getDataContext());
				},
				select: function(combobox, records) {
					this._loadData();
				},
				scope: this
			}
		});
		
		this.pulldownContainer.add(this.iterComboBox);
	},
	
	_loadSeverities: function() {
		this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
			model: 'Defect',
			field: 'Severity',
			listeners: {
				ready: function(combobox) {
					//this._loadData();  
					this._loadData();
					// console.log("Context", this.getContext().getDataContext());
					// console.log('chosen one', combobox.getRecord().get('_ref'));
				},
				select: function(combobox, records) {
					this._loadData();
				},
				scope: this
			}			
		});
		
		this.pulldownContainer.add(this.severityComboBox);
	},
	
    // Get data from Rally
    _loadData: function() {
	  
		var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
		var selectedSeverityValue = this.severityComboBox.getRecord().get('value');
	  
		var myStore = Ext.create('Rally.data.wsapi.Store', {
			model: 'Defect',		  
			autoLoad: true,                         // <----- Don't forget to set this to true! heh
			filters: [
				{
					property: 'Iteration',
					operation: '=',
					value: selectedIterRef
				}
				,{
					property: 'Severity',
					opeation: '=',
					value: selectedSeverityValue
				}
			],
			listeners: {
              load: function(myStore, myData, success) {
                  console.log('got data!', myStore, myData);
                  this._loadGrid(myStore);      // if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which does not exist.
              },
              scope: this                         // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
          },
          fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']   // Look in the WSAPI docs online to see all fields available!
        });

    },

    // Create and Show a Grid of given stories
    _loadGrid: function(myStoryStore) {

      var myGrid = Ext.create('Rally.ui.grid.Grid', {
        store: myStoryStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID', 'Name', 'Severity', 'Iteration'
        ]
      });

      this.add(myGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)

      // console.log('what is this?', this);

    }

});
