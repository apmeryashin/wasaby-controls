gemini.suite('SBIS3.CONTROLS.Filter Carry', function () {

    gemini.suite('base', function (test) {

        test.setUrl('/regression_filter_carry.html').setCaptureElements('.capture')

            .before(function (actions) {
				
				actions.waitForElementToShow('[sbisname="filterButton"]', 40000);
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 5000);
                
				this.filter = '[sbisname="filterButton"]';
				this.input = '[sbisname="TextBox 1"] .controls-TextBox__field';
				this.filter_line = '[name="filterLine"] .controls__filterButton__filterLine-items span';
				this.filter_icon = '[sbisname="filterButton"] .controls__filterButton-button';
            })

            .capture('plain', function (actions) {
                actions.click(this.input);
            })

            .capture('hovered_link', function (actions) {
                actions.mouseMove(this.filter_line);
            })

            .capture('hovered_icon', function (actions) {
                actions.mouseMove(this.filter_icon);
            })
			
			.capture('opened_filter', function (actions) {
                actions.click(this.filter_icon);
				actions.waitForElementToShow('[data-component="SBIS3.FilterButtonFilterContent"] > div:nth-child(2) a.controls-ComboBox__arrowDown', 5000);
            })
			
			.capture('changed_filter', function (actions) {
				this.nds = '[data-component="SBIS3.FilterButtonFilterContent"] > div:nth-child(2) a.controls-ComboBox__arrowDown';
                actions.click(this.nds);
				actions.waitForElementToShow('.controls-ComboBox__itemRow[data-id="none"]', 5000);
				actions.waitForElementToShow('.controls-ComboBox__itemRow[data-id="1"]', 5000);
				actions.waitForElementToShow('.controls-ComboBox__itemRow[data-id="2"]', 5000);
				this.with_nds = '.controls-ComboBox__itemRow[data-id="2"]';
				actions.click(this.with_nds);
				actions.mouseMove(this.input);
            })

			.capture('hovered_reset_link', function (actions) {
                this.reset_link = '.controls__filter-button__clear-filter';
				actions.mouseMove(this.reset_link);
            })
			
			.capture('selected_filter', function (actions) {
                this.apply_button = '.controls__filter-button__apply-filter';
				actions.click(this.apply_button);
            })
			
			.capture('hovered_cross', function (actions) {
                this.cross = '.controls__filterButton__filterLine-cross';
				actions.mouseMove(this.cross);
            })
			
			.capture('hovered_text_line', function (actions) {
				actions.mouseMove(this.filter_line);
            })
			
			.capture('disabled', function (actions) {
				actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('filterButton').setEnabled(false);
                });
            })
    });

	gemini.suite('with_filter_history', function (test) {

        test.setUrl('/regression_filter_carry_3.html').setCaptureElements('.capture')

            .before(function (actions) {
				
				actions.waitForElementToShow('[sbisname="MyDataGrid"]', 40000);
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 5000);
				actions.waitForElementToShow('[sbisname="filterButton"]', 5000);
                
				this.data = '[sbisname="MyDataGrid"]';
                this.input = '[sbisname="TextBox 1"] .controls-TextBox__field';
                this.filter = '[sbisname="filterButton"]';
				this.filter_line = '[name="filterLine"] .controls__filterButton__filterLine-items span';
				this.filter_icon = '[sbisname="filterButton"] .controls__filterButton-button';
            })
			
			.capture('one_item_in_history', function (actions) {
                actions.click(this.filter_line);
				actions.waitForElementToShow('[data-component="SBIS3.FilterButtonFilterContent3"] > div:nth-child(2) a.controls-ComboBox__arrowDown', 5000);
				actions.waitForElementToShow('[data-component="SBIS3.FilterButtonFilterContent3"] > div:nth-child(3) a.controls-ComboBox__arrowDown', 5000);
				actions.waitForElementToShow('[data-component="SBIS3.FilterButtonFilterContent3"] > div:nth-child(4) a.controls-ComboBox__arrowDown', 5000);
				actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('ComboBox 1').setSelectedKey(2);
                });
				this.apply_button = '.controls__filter-button__apply-filter';
				actions.click(this.apply_button);
				actions.click(this.filter_icon);
				actions.waitForElementToShow('[name="historyView"]', 5000);
            })
			
			.capture('long_item_in_history', function (actions) {
				actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('ComboBox 2').setSelectedKey(1);
					window.$ws.single.ControlStorage.getByName('ComboBox 3').setSelectedKey(2);
                });
				actions.click(this.apply_button);
				actions.click(this.filter_icon);
				actions.waitForElementToShow('[name="historyView"]', 5000);
            })

			.capture('hovered_history_line', function (actions) {
				this.history_line = '[name="historyView"] .controls-filterButton__historyView-item-title';
				actions.mouseMove(this.history_line);
				actions.waitForElementToShow('[name="historyView"] .controls-ItemActions__itemsContainer i.icon-Pin', 5000);
            })
			
			.capture('hovered_history_icon', function (actions) {
				this.history_icon = '[name="historyView"] .controls-ItemActions__itemsContainer i.icon-Pin';
				actions.mouseMove(this.history_icon);
            })
			
			.capture('checked_history_icon', function (actions) {
				this.history_icon = '.controls-ItemActions__itemsContainer i.icon-Pin';
				actions.click(this.history_icon);
				actions.mouseMove(this.input);
            })
			
			.after(function (actions) {
				actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('filterHistory')._historyController.clearHistory()
                });
            })
    });

	gemini.suite('custom_templates', function (test) {

        test.setUrl('/regression_filter_carry_4.html').setCaptureElements('.capture')

            .before(function (actions) {
				
				actions.waitForElementToShow('[sbisname="MyDataGrid"]', 40000);
				actions.waitForElementToShow('[sbisname="TextBox 1"]', 5000);
				actions.waitForElementToShow('[sbisname="filterButton"]', 5000);
                
				this.data = '[sbisname="MyDataGrid"]';
                this.input = '[sbisname="TextBox 1"] .controls-TextBox__field';
                this.filter = '[sbisname="filterButton"]';
				this.filter_line = '[name="filterLine"] .controls__filterButton__filterLine-items span';
				this.filter_icon = '[sbisname="filterButton"] .controls__filterButton-button';
            })
			
			.capture('selected', function (actions) {
                actions.click(this.filter_line);
				actions.waitForElementToShow('[data-component="SBIS3.FilterButtonFilterContent4"] > div:nth-child(2) a.controls-ComboBox__arrowDown', 5000);
				actions.waitForElementToShow('[data-component="SBIS3.FilterButtonFilterContent4"] > div:nth-child(3) a.controls-ComboBox__arrowDown', 5000);
				actions.waitForElementToShow('[data-component="SBIS3.FilterButtonFilterContent4"] > div:nth-child(4) a.controls-ComboBox__arrowDown', 5000);
				actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('ComboBox 1').setSelectedKey(2);
                });
				this.apply_button = '.controls__filter-button__apply-filter';
				actions.click(this.apply_button);
            })
			
			.capture('one_item_in_history', function (actions) {
                actions.click(this.filter_icon);
				actions.waitForElementToShow('[name="historyView"]', 5000);
            })
			
			.capture('long_item_in_history', function (actions) {
				actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('ComboBox 2').setSelectedKey(1);
					window.$ws.single.ControlStorage.getByName('ComboBox 3').setSelectedKey(2);
                });
				actions.click(this.apply_button);
				actions.click(this.filter_icon);
				actions.waitForElementToShow('[name="historyView"]', 5000);
            })

			.capture('hovered_history_line', function (actions) {
				this.history_line = '[name="historyView"] .controls-filterButton__historyView-item-title';
				actions.mouseMove(this.history_line);
				actions.waitForElementToShow('[name="historyView"] .controls-ItemActions__itemsContainer i.icon-Pin', 5000);
            })
			
			.capture('hovered_history_icon', function (actions) {
				this.history_icon = '[name="historyView"] .controls-ItemActions__itemsContainer i.icon-Pin';
				actions.mouseMove(this.history_icon);
            })
			
			.capture('checked_history_icon', function (actions) {
				this.history_icon = '.controls-ItemActions__itemsContainer i.icon-Pin';
				actions.click(this.history_icon);
				actions.mouseMove(this.input);
            })
			
			.after(function (actions) {
				actions.executeJS(function (window) {
                    window.$ws.single.ControlStorage.getByName('filterHistory')._historyController.clearHistory()
                });
            })
    });
});