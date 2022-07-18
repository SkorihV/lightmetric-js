import {Row} from './Row.js';
import {WeekCell} from "./WeekCell.js";


class Table {
    _table              = null;
    _allRowsNode        = null;
    _allDateArr         = null;
    _rows               = [];
    _currentRow         = null;
    _weekCells          = {};
    _allWeekCellsNodes  = null;
    _model              = null;

    constructor(tableBox, model) {
        this._table = tableBox;
        this._model = model;

        this.initAllRow();
        this.initWeekCells();

        setTimeout(()=>{
            this.model.initProcessingForFormulaRowsInTables();
        }, 500)
    }

    get table() {
        return this._table;
    }

    get model() {
        return this._model;
    }

    set table(table) {
        if (!this._table) {
            this._table = table;
        }
        return this;
    }

    get allRowsNode() {
        this._allRowsNode = this._table.querySelectorAll('.tr-body');
        return Array.from(this._allRowsNode);
    }

    get rows() {
        return this._rows;
    }

    get allWeekCellsNodes() {
        if (this._allWeekCellsNodes) {
            return this._allWeekCellsNodes;
        }
        this._allWeekCellsNodes = this._table.querySelectorAll('.metric-week');
        return this._allWeekCellsNodes;
    }

    get allDate() {
        if (this._allDateArr) {
            return this._allDateArr;
        }
        let dateElementsTh = this.table.querySelectorAll('th.metric-week');
        this._allDateArr = Array.from(dateElementsTh).map((index => {
            return index.dataset.planed;
        }))
        return this._allDateArr;
    }

    get currentRow() {
        if (this._currentRow) {
            return this._currentRow;
        }
        return false;
    }

    set currentRow(row) {

        if (row === 'undefined')  {
            return false;
        }
        let id = this.getRowId(row);

        if (id && this._currentRow !== this.getRowOnId(id)) {
            this._currentRow = this.getRowOnId(id);
            return true;
        }
        return false;
    }

    removeRowInTable(positionInArray) {
        let result = this.rows.splice(positionInArray, 1);
        return result
    }

    getRowId(row) {
        return row.dataset.metricId;
    }

    getWeekCellId(weekCell) {
        return weekCell.dataset.planed;
    }

    getRowOnId(id) {
        let rows = this.rows;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].rowId === id) {
                return rows[i];
            }
        }

        return false;
    }

    getCurrenTableNum() {
        return parseInt(this.table.dataset.numberTable);
    }

    getRowOnAlias(alias) {
        let rows = this.rows;
        for (let i = 0; i < rows.length; i++ ) {
            if ( rows[i].alias) {
                if ( rows[i].alias === alias) {
                    return rows[i];
                }
            }
        }
        return false;
    }
    initAllRow() {
        this.allRowsNode.forEach((row) => {
            this._rows.push(this.initRow(row));
        })
    }

    initRow(row) {
        return new Row(row, this);
    }

    initWeekCell(weekCell) {
        return new WeekCell(weekCell);
    }

    initWeekCells() {
        Array.from(this.allWeekCellsNodes).forEach((weekCell)=>{
            this._weekCells[this.getWeekCellId(weekCell)] = this.initWeekCell(weekCell);
        })
    }

    getWeekCellOnId(planed) {
        if (this._weekCells[planed]) {
            return this._weekCells[planed];
        }
        return false;
    }

    initProcessingForFormulaRows(){
        this.rows.forEach(row => {
            row.processingFormula();
        })

        this.rows.forEach(row => {
            row.getAllComputedValuesCells();
        })

    }

    addNewRowOrMove(rowTemplate, newPosition, lastPositionRowInArray = false, newInitRow = true) {
        if (rowTemplate.querySelector('.u-update')) {
            rowTemplate.querySelector('.u-update').innerHTML = this.currentTime();
        }

        let rows = this.rows;
        let positionInArray = rows.length;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].rowId === rowTemplate.dataset.metricId) { continue; }
            if (parseInt(rows[i].position) >= parseInt(newPosition)) {

               rows[i].row.before(rowTemplate)
                positionInArray = i;
                break;
            }

           if(!rows[i+1]) {
               rows[i].row.after(rowTemplate)
               positionInArray = i;
               break;
           }
        }
        if (newInitRow) {
            this.rows.splice(positionInArray, 0, this.initRow(rowTemplate) )
        } else {
            let currentRow = this.removeRowInTable(lastPositionRowInArray);
            this.rows.splice(positionInArray, 0, currentRow[0]);

        }
    }

    currentTime() {
        let date = new Date();
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    editModeOn() {
        if (!this.table.classList.contains('editMode')){
            this.table.classList.add('editMode');
        }
        return this;
    }

    editModeOff() {
        if (this.table.classList.contains('editMode')){
            this.table.classList.remove('editMode');
        }
        return this;
    }

    getAllAliasForRows(){
        let aliases = [];
        this.rows.forEach(row => {
            if ( row.alias) {
                aliases.push(row.alias)
            }
        })
        return aliases;
    }

    toggleCheckboxForStat() {
        if (!this.table.classList.contains('showCheckboxForStat')) {
            this.table.classList.add('showCheckboxForStat');
        } else {
            this.table.classList.remove('showCheckboxForStat');
        }
    }

    toggleShowHideRows() {
        if (!this.table.classList.contains('showHideRows')) {
            this.table.classList.add('showHideRows');
        } else {
            this.table.classList.remove('showHideRows');
        }
    }

    getDataForStat() {
        let dataStat        = {};
        dataStat.dataCells  = [];
        dataStat.planed     = this.allDate;

        this.rows.forEach(row => {
            if (row.isStatistic()) {
                dataStat.dataCells.push({
                    dataLabels: {
                        enabled: true
                    },
                    name: row.name.innerHTML.trim(),
                    data: row.getAllValuesAndPlanedArray()
                })
            }
        })

        return dataStat;
    }

    getAverageDataYearsForMetric(metricId){
        let dataForTable = this.model.getAverageDataForYearsInTableFullArray()

        let dataForMetric = null;
        if (dataForTable === null) {
            return false;
        }

        for(let i = 0; i < dataForTable.length; i++) {
            if (parseInt(dataForTable[i].id) === parseInt(metricId)) {
                dataForMetric = dataForTable[i];
                break;
            }
        }
        return  dataForMetric;
    }

    getDataForStatCurrentRow() {
        let dataStat        = {};
        dataStat.dataCells  = [];
        dataStat.planed     = this.allDate;

        dataStat.dataCells.push({
            dataLabels: {
                enabled: true
            },
            name: this.currentRow.name.innerHTML.trim(),
            data: this.currentRow.getAllValuesAndPlanedArray()
        })
        return dataStat;
    }

    toggleDragAndDropMode() {
        if (!this.table.classList.contains('dragEndDropMode')){
            this.table.classList.add('dragEndDropMode');
            this.enabledDragAndDropRows();
        } else {
            this.table.classList.remove('dragEndDropMode');
            this.disabledDragAndDropRows();
        }
    }

    disabledDragAndDropRows(){
        this.allRowsNode.forEach(item => {
            item.draggable = false;
        })
    }

    enabledDragAndDropRows(){
        this.allRowsNode.forEach(item => {
            item.draggable = true;
        })
    }

    normalizeRowsPositions(){
        let allRowsNode  = this.allRowsNode
        let request = '?';
        let id = 'type_id_str='

        for (let i = 0; i < allRowsNode.length; i++) {

            let rowNode = allRowsNode[i];

            this.getRowOnId(this.getRowId(rowNode)).position = i;
            if (i < allRowsNode.length - 1) {
                id += `${this.getRowId(rowNode)},`
            } else {
                id += `${this.getRowId(rowNode)}`
            }
        }
        request += `${id}`;
        return request;
    }

    processingHideShowRowsForLocal(dataIds){
        this.rows.forEach(row => {
            row.showRowLocal();
            row.hideModeRowLocal();
        })
        let rows = this.rows;

        dataIds.forEach((item) => {
            let isHide = false;
            for (let i = 0; i < rows.length; i++) {
                let currentLocalRow = rows[i];
                let isGroup = Boolean(currentLocalRow.row.closest('.is-group'));

                if (currentLocalRow.rowId === item && !isGroup) {
                    this.model.controller.removeLocalRowOnId(item)
                    return false;
                }

                if (isHide && !isGroup) {
                    currentLocalRow.hideRowLocal();
                }
                if (isGroup) {
                    if (rows[i].rowId === item) {
                        isHide = true;
                    } else {
                        isHide = false;
                    }
                }

                if (isHide && isGroup) {
                    currentLocalRow.showModeRowLocal();
                }
            }
        })
    }

    lightingAllRowOff() {
        this.rows.forEach((row) => {
            row.lightingRowOff();
        })
    }

    lightingMainRowOff(){
        if (this.table.querySelector('.lightingMain')) {
            this.table.querySelector('.lightingMain').classList.remove('lightingMain');
        }
    }
}

export {Table};