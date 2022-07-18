import {Table} from './Table.js';


class Model {
    _currentTable               = null;
    _table                      = [];
    _editModeBtn                = null;
    _toggleShowStatCheckboxBtn  = null;
    _isEditMode                 = false;
    _controlBtnPanel            = null;
    _showStatBtn                = null;
    _deleteStatBtn              = null;
    _toggleShowHideRowsBtn      = null;
    _toggleDragAndDropBtn       = null;
    _checkboxes                 = [];
    _controller                 = null;
    _tableBox                   = null;
    _toggleShowPromptBtn        = null;
    _preloader                  = null;
    _formulaModeBtn             = null;
    _formulaMode                = null;
    _currentMetricIdForFormulaBlock = null;
    _averageDataForYears        = null;
    _historyChangedCellsValues = [];


    constructor(controller) {

        this._controller = controller;
        let tables = document.querySelectorAll('#lightTableBox .lightTable');

        this._tableBox = document.querySelector('#lightTableBox');

        if (tables.length) {
            Array.from(tables).forEach(table => {
                this._table.push(new Table(table, this)) ;
            })
        }
        this._controlBtnPanel = document.querySelector(".controlBtnPanel");
        this._preloader = document.querySelector("#preloader");

        this.initBtnChoiceAllCategory();

    }

    set currentTable(currentNumTable) {
        this._currentTable = parseInt(currentNumTable);
    }

    get currentTable() {
        if (!this._currentTable) {
            this._currentTable = this.table(true)[0].getCurrenTableNum();
        }
        return this._currentTable;
    }

    get historyChangedCellsValues () {
        return this._historyChangedCellsValues;
    }

    set historyChangedCellsValues(cell) {
        this._historyChangedCellsValues.push(cell);
    }

    historyChangedCellsValuesReset() {
        return this._historyChangedCellsValues = [];
    }

    table(getAll = false){
        if (getAll) {
            return this._table;
        }
        let needleTable = false;
        for (let i = 0; i < this._table.length; i++ ) {
            if (this._table[i].getCurrenTableNum()  == this.currentTable) {
                needleTable = this._table[i];
                break;
            }
        }
        return needleTable;
    }

    getTableForNumber(num) {
        let needleTable = false;
        for (let i = 0; i < this.table(true).length; i++ ) {

            if (parseInt(this.table(true)[i].getCurrenTableNum())  === parseInt(num)) {
                needleTable = this.table(true)[i];
                break;
            }
        }
        return needleTable;
    }

    get allRowsInTables() {
        let allRows = [];
        this.table(true).forEach(table => {
            allRows.push(...table.rows);
        })
        return allRows;
    }

    getRowOnIdInTables(metricId) {
        let tables = this.table(true);
        let needleRow = false;
        for(let i = 0; i <= tables.length; i++) {
            if(tables[i].getRowOnId(metricId)) {
                needleRow = tables[i].getRowOnId(metricId);
                break;
            }
        }
        return needleRow;
    }

    initProcessingForFormulaRowsInTables() {
        this.table(true).forEach(table => table.initProcessingForFormulaRows())

        if (this.historyChangedCellsValues.length) {
            this.controller.fetch.updateComputedValue(this.historyChangedCellsValues);
            this.historyChangedCellsValuesReset();
        }
    }

    get tableBox() {
        return this._tableBox;
    }

    get controller() {
        return this._controller;
    }

    get controlBtnPanel() {
        if (this._controlBtnPanel) {
            return this._controlBtnPanel;
        }
        return false;
    }

    get editBtn() {
        if ( this._editModeBtn) {
            return this._editModeBtn;
        }
        this._editModeBtn = this.controlBtnPanel.querySelector('#edit-mode-toggle');
        return this._editModeBtn;
    }

    get toggleShowStatCheckboxBtn() {
        if ( this._toggleShowStatCheckboxBtn) {
            return this._toggleShowStatCheckboxBtn;
        }
        this._toggleShowStatCheckboxBtn = this.controlBtnPanel.querySelector('#stat-mode-toggle');
        return this._toggleShowStatCheckboxBtn;
    }

    get showStatBtn() {
        if ( this._showStatBtn) {
            return this._showStatBtn;
        }
        this._showStatBtn = this.controlBtnPanel.querySelector('#show-stat-toggle');
        return this._showStatBtn;
    }

    get deleteStatBtn() {
        if ( this._deleteStatBtn) {
            return this._deleteStatBtn;
        }
        this._deleteStatBtn = this.controlBtnPanel.querySelector('#delete-stat-btn');
        return this._deleteStatBtn;
    }

    get toggleShowHideRowsBtn() {
        if (this._toggleShowHideRowsBtn) {
            return this._toggleShowHideRowsBtn;
        }
        this._toggleShowHideRowsBtn = this.controlBtnPanel.querySelector('#show-metric-toggle');
        return this._toggleShowHideRowsBtn;
    }

    get toggleDragAndDropBtn() {
        if (this._toggleDragAndDropBtn) {
            return this._toggleDragAndDropBtn;
        }
        this._toggleDragAndDropBtn = this.controlBtnPanel.querySelector('#turn-on-metric-drag-and-drop');
        return this._toggleDragAndDropBtn;
    }
    get formulaModeBtn() {
        this._formulaModeBtn = this.controlBtnPanel.querySelector('#formula-mode-toggle');
        return this._formulaModeBtn;
    }

    get checkboxes() {
        this._checkboxes = [];

        this.table(true).forEach(table => {
            table.rows.forEach(row => {
                this._checkboxes.push(row.checkboxForStat);
            })
        })
        return this._checkboxes;
    }
    get promptBtn() {
        if (this._toggleShowPromptBtn) {
            return this._toggleShowPromptBtn;
        }
        this._toggleShowPromptBtn =  this.controlBtnPanel.querySelector('#show-prompt-toggle');

        return this._toggleShowPromptBtn
    }

    get formulaBlock() {
        return this.tableBox.querySelector('.formula_block');
    }

    get formulaInput() {
        if (this.formulaBlock) {
            return this.formulaBlock.querySelector('.formula_input');
        }
        return false;
    }

    get currentMetricIdForFormulaBlock() {
        return this._currentMetricIdForFormulaBlock;
    }

    set currentMetricIdForFormulaBlock(id) {
        this._currentMetricIdForFormulaBlock = id;
    }

    initBtnChoiceAllCategory() {
        let choiceBtn = document.querySelector('.all-category');
        let categoryOptions = document.querySelectorAll('#typeCategory option');
        if (!choiceBtn || !categoryOptions) {
            return false;
        }

        choiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Array.from(categoryOptions).forEach((option) => {
                option.selected = true;
            })

            $(".js-select2").select2({
                closeOnSelect : false,
                placeholder : "Категория",
                // allowHtml: true,
                allowClear: true,
                tags: true // создает новые опции на лету
            });
        })


    }

    setAverageDataForYears(data) {
        this._averageDataForYears = data.averageDataForYears;
        return this;
    }

    getAverageDataForYearsInTableFullArray() {
        let result = [];
        let averageData = this.getAverageDataForYearsInTable()
        for(let key in averageData ) {
            for( let key_in in averageData[key]){
                result.push(averageData[key][key_in])
            }
        }
        return result;
    }

    getAverageDataForYearsInTable(numberCategoryTable = false){
        if (numberCategoryTable === false) {
            return this._averageDataForYears;
        }
        return this._averageDataForYears[numberCategoryTable];
    }

    formulaBlockRemove(){

        this.table(true).forEach(item => item.lightingAllRowOff());

        this.currentMetricIdForFormulaBlock = null;
        if (this.formulaBlock) {
            this.formulaBlock.remove();
        }
        this.table(true).forEach(item => item.lightingMainRowOff());
    }

    removePromptForAliasInput() {
        let prompt = this.formulaBlock.querySelector('#prompt-alias-name');
        if (prompt) {
            prompt.remove();
        }
    }

    preloaderOn() {
        this._preloader.style.display = 'flex';
    }

    preloaderOff() {
        this._preloader.style.display = 'none';
    }

    editModeBtnToggle() {
        if (this.editBtn.classList.contains('btn-success')) {
            this.editBtn.classList.remove('btn-success');
            this.editBtn.classList.add('btn-primary');
            this._isEditMode = false;
            this.table(true).forEach(item => item.editModeOff());



        } else if (this.editBtn.classList.contains('btn-primary')) {
            this.editBtn.classList.remove('btn-primary');
            this.editBtn.classList.add('btn-success');
            this._isEditMode = true;
            this.table(true).forEach(item => item.editModeOn());
        }
    }

    showTrueValuePrompt(target) {
        if (this._isEditMode) {
            try {
                let dataPlaned = target.dataset.planed;
                this.getTableForNumber(this.currentTable).currentRow.getCell(dataPlaned).showTrueValue();
            } catch (e) {
                console.error(e.message, 'Видимо не определилась текущая таблица')
            }
        }
    }

    hideTrueValuePrompt(target) {
        try {
            let dataPlaned = target.dataset.planed;
            this.getTableForNumber(this.currentTable).currentRow.getCell(dataPlaned).hideTrueValue();
        } catch (e) {
            console.error(e.message, 'Видимо не определилась текущая таблица')
        }
    }

    toggleFormulaMode() {
        if (this.formulaModeBtn.classList.contains('btn-success')) {
            this.formulaModeOff();
        } else if (this.formulaModeBtn.classList.contains('btn-primary')) {
            this.formulaModeOn();
        }
    }

    formulaModeOn() {
        this.formulaModeBtn.classList.remove('btn-primary');
        this.formulaModeBtn.classList.add('btn-success');
        this._formulaMode = true;
        if (this.table()) {
            this.currentMetricIdForFormulaBlock = this.table().currentRow.rowId;
        }

    }

    formulaModeOff() {
        this.formulaModeBtn.classList.remove('btn-success');
        this.formulaModeBtn.classList.add('btn-primary');
        this.formulaBlockRemove();
        this._formulaMode = false;
        this.currentMetricIdForFormulaBlock = null;
    }

    getCurrentPosition (input) {
        this.getAliasForInput(input.value, input.selectionStart)
    }

    getAliasForInput(str, pos) {
        str = String(str);
        pos = Number(pos) >>> 0;

        let left = str.slice(0, pos).lastIndexOf('$');
        let right = str.slice(pos).search(/\${1}/);
        let alias = str.slice(left, right + pos + 1);

        this.table(true).forEach(table => table.lightingAllRowOff());
        this.removePromptForAliasInput();

        let isAlias = (alias.search(/\$[0-9]+\$/) >= 0);
        if (!isAlias){return false;}
        alias = alias.match(/[0-9]+/)[0]

        let row = this.getRowOnIdInTables(alias);

        if (row) {
            row.lightingRowOn();
        }
    }
}

export {Model};