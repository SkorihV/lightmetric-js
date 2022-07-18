import {Cell} from './Cell.js';
import {Comment} from './Comment.js';


class Row extends Comment {
    _row            = null;
    _parentTable    = null;
    _rowName        = null;
    _rowId          = null;
    _url            = null;
    _minimal        = null;
    _normal         = null;
    _position       = null;
    _formula        = null;
    _unit           = '';
    _cells          = {};
    _isGroup        = false;
    _typeCategoryId = false;
    _lastCell       = null;

    constructor (row, table) {
        super();
        this._row = row;
        this._parentTable = table;
        this.mainCell;
        this.initComment();
        this.initCells();
        this.updateUnitAndColorInCells();
        this.initEventEditingCellsValue();
        this.isStatistic();
        this.initGroupParam();
    }

    get row() {
        return this._row;
    }

    get rowId() {
        if (this._rowId) {
            return this._rowId;
        }
        this._rowId =  this.row.dataset.metricId;
        return this._rowId;
    }

    get parentTable() {
        return this._parentTable;
    }

    get mainCell() {
        if (this._mainCell) {
            return this._mainCell;
        }
        return this._mainCell = this.row.querySelector('.metric-type');
    }

    get name() {
        if (this._rowName) {
            return this._rowName;
        }
        this._rowName = this._row.querySelector('.metric-type .content-cell');
        return this._rowName;
    }

    set name(name) {
        this.name;
        this._rowName.innerHTML = name;
        return this;
    }

    get url() {
        if (this._url) {
            return this._url;
        }
        return this._url = this._mainCell.dataset.href;
    }

    get normal() {
        this._normal = this.row.querySelector('.normal-cell .value');
        return this._normal;
    }

    set normal(norm) {
        this.normal;
        if (!norm) {
            this._normal.innerHTML = '';
            this.row.querySelector('.normal-cell .unit').innerHTML = '';
            return false;
        }
        this._normal.innerHTML = norm;
        this.row.querySelector('.normal-cell .unit').innerHTML = this.unit;
        return true;
    }


    get minimal() {
        if (this._minimal) {
            return this._minimal;
        }
        this._minimal = this.row.querySelector('.minimal-cell .value');
        return this._minimal;
    }

    get cells() {
        return this._cells;
    }

    getCellsOnArray() {
        let cellsArr = [];
        for (let cellKey in this.cells) {
            cellsArr[cellKey] = this.cells[cellKey];
        }
        return cellsArr;
    }

    set minimal(min) {
       this.minimal;
        if (!min) {
            this._minimal.innerHTML = '';
            this.row.querySelector('.minimal-cell .unit').innerHTML = '';
            return false;
        }
        this._minimal.innerHTML = min;
        this.row.querySelector('.minimal-cell .unit').innerHTML = this.unit;

        return true;
    }


    get position() {
        // this._position = this.row.querySelector('.metric-position-cell');
        return this.row.getAttribute('data-metric-position');
    }

    set position(param) {
        this.positionCell.innerHTML = `${this.typeCategoryId}-${param}`;
        this.row.setAttribute('data-metric-position', param)
    }

    get positionCell(){
        return this.row.querySelector('.metric-position-cell');
    }

    get formula() {
        return this._formula = this.row.dataset.formula;
    }

    set formula(formula) {
        if (!formula) {
            this.row.dataset.formula = '';
        }
        this.row.dataset.formula = formula;
        this._formula = formula;
        this.row.querySelector('.formula').innerHTML = formula;

    }

    get unit() {
        this._unit = this.row.dataset.unit;

        if (this._unit && this._unit !== 'null') {
            return this._unit;
        }
        return  '';
    }

    set unit(unit) {
        if (!unit) {
            this._unit = '';
            this.row.dataset.unit = '';
        }
        this._unit = unit;
        this.row.dataset.unit = unit;
    }

    set colorRow(color) {
        if (color === '#000000'){
            this.row.querySelector('.minimal-cell').style.removeProperty('background-color');
            this.row.querySelector('.normal-cell').style.removeProperty('background-color');
            this.mainCell.style.removeProperty('background-color');
        } else {
            this.row.querySelector('.minimal-cell').style.backgroundColor = color;
            this.row.querySelector('.normal-cell').style.backgroundColor = color;
            this.mainCell.style.backgroundColor = color;
        }
    }

    set isGroup(value) {
        this._isGroup = value;
        return this;
    }

    get isGroup() {
        return this._isGroup;
    }

    get typeCategoryId() {

        if (this._typeCategoryId) {
            return this._typeCategoryId;
        }
        this._typeCategoryId = this.row.dataset.typeCategoryId
        return this._typeCategoryId;
    }

    set typeCategoryId(id) {
        this.row.dataset.typeCategoryId = id;
        this._typeCategoryId = id;
    }

    initGroupParam() {
        if (this.row.querySelector('.is-group') ) {
            this._isGroup = true;
        }

    }

    get toggleSlideForGroupControlPanel() {
       let panel = this.mainCell.querySelector('.toggle-slide-for-group');

        if (panel) {
            return panel;
        } else {
            return false;
        }
    }

    getAllCells() {
        return this.row.querySelectorAll('.metric-cell');
    }

    initCells(){
        Array.from(this.getAllCells()).forEach((cell, index) => {
                this.cells[cell.dataset.planed] = new Cell(cell, this, index);
            }
        )
    }

    getCell(planed) {
        if (this.cells[planed]) {
            return this.cells[planed];
        }
        return false;
    }

    addCurrentRow() {
        this.parentTable.currentRow(this);
        return this;
    }

    updateData(data) {
        let lastCategoryId = this.typeCategoryId;

        this.unit = data.data.unit;
        this.formula = data.data.formula;
        this.normal = data.data.normal;
        this.minimal = data.data.minimal;
        this.name = data.data.name;
        this.colorRow = data.data.colorRow;
        this.typeCategoryId = data.data.typeCategory.id;

        this.checkedAround(data.data.isAround);
        this.checkedGroup(data.data.isGroup);
        this.checkedHide(data.data.isHide);

        this.updateComment(data);
        let lastPosition = this.position;
        this.position = data.data.position;

        let receivingTable = false;
        if(parseInt(lastCategoryId) === parseInt(this.typeCategoryId)) {
            this.parentTable.addNewRowOrMove(this.row, this.position, lastPosition, false);

            this.parentTable.model.currentTable = this.typeCategoryId;
            this.parentTable.model.controller.fetch.updateRowsPosition();
        } else {
            receivingTable = this.parentTable.model.getTableForNumber(this.typeCategoryId);
         }

        if (parseInt(lastCategoryId) !== parseInt(this.typeCategoryId) && receivingTable) {

            receivingTable.addNewRowOrMove(this.row.cloneNode(true), this.position);
            this.row.remove();
            this.parentTable.model.currentTable = lastCategoryId;
            this.parentTable.model.controller.fetch.updateRowsPosition();

            this.parentTable.model.currentTable = this.typeCategoryId - 1;
            this.parentTable.model.controller.fetch.updateRowsPosition();
        } else if(parseInt(lastCategoryId) !== parseInt(this.typeCategoryId) && !receivingTable) {
            this.parentTable.removeRowInTable(lastPosition);
            this.row.remove();
            this.parentTable.model.currentTable = lastCategoryId;
            this.parentTable.model.controller.fetch.updateRowsPosition();
        }

        setTimeout(()=>{
            this.parentTable.model.initProcessingForFormulaRowsInTables();
        },100)
    }

    isStatistic() {
        return this.row.querySelector('.checkbox-for-stat input').checked;
    }

    get checkboxForStat() {
        return this.row.querySelector('.checkbox-for-stat input');
    }

    remove() {
        this.row.remove();
    }

    updateUnitAndColorInCells() {
        for (let key in this.cells) {
            this.getCell(key).updateUnit();
            this.getCell(key).updateColor();
        }
    }

    checkedAround(data) {
        if (data) {
            this.aroundOn();
        } else {
            this.aroundOff();
        }
    }

    checkedGroup(data){
        if (data) {
            this.groupOn();
        } else {
            this.groupOff();
        }
    }

    checkedHide(data) {
        if (data) {
            this.hideOn();
        } else {
            this.hideOff();
        }
    }

    groupOn() {
        if (!this.row.classList.contains('is-group')) {
            this.row.classList.add('is-group');
            this.isGroup = true;
            this.addToggleSlideForGroupControlPanel();
            this.hideModeRowLocal();
        }
    }

    groupOff() {
        if (this.row.classList.contains('is-group')) {
            this.row.classList.remove('is-group');
            this.isGroup = false;
            this.removeToggleSlideForGroupControlPanel();
            this.parentTable.model.controller.removeLocalRowOnId(this.rowId);
        }
    }

    hideOn() {
        if (!this.row.classList.contains('is-hide')) {
            this.row.classList.add('is-hide');
        }
    }

    hideOff() {
        if (this.row.classList.contains('is-hide')) {
            this.row.classList.remove('is-hide');
        }
    }

    aroundOn() {
            this.row.dataset.around = '1';
        }

    aroundOff() {
        this.row.dataset.around = '0';
    }

    get around() {
        return  this.row.dataset.around;
    }

    /*Блок по работе с формулами начало*/

    processingFormula() {

        let params = this.getArrayParams();
        let resultValueString = '';
        let cells = this.cells;
        if (params) {
            for (let key in cells) {
                let cell = this.getCell(key);

                resultValueString =  this.generateResultOnFormulaInCell(cell, params);

                if (!resultValueString) {
                    return false;
                }

                try {
                    let resultData = cell.recognizeData(resultValueString.toString());
                    cell.value.innerHTML = resultData;

                    // if (resultData.replace(/ /g, "") !== '' && resultData.replace(/ /g, "") !== cell.computedValue) {
                    //     this.parentTable.model.controller.fetch.updateComputedValue(cell.computedValueForDB);
                    // }
                } catch (e) {
                    console.log(`Ошибка при расчете формуды ${e.name} в ячейке ${cell.planed} строки ${cell.row.name.innerHTML} с ID = ${cell.row.rowId}`);
                }
            }
        } else {
            for (let key in cells) {
                let cell = this.getCell(key);
                let resultData = cell.recognizeData(cell.trueValue);

                cell.value.innerHTML = resultData;

                // if (resultData.replace(/ /g, "") !== '' && resultData.replace(/ /g, "") !== cell.computedValue) {
                //     this.parentTable.model.controller.fetch.updateComputedValue(cell.computedValueForDB);
                // }
            }

        }
        this.updateUnitAndColorInCells();
    }

    getArrayParams() {
        if (this.formula === '' || this.formula === 'null' || this.formula === undefined) {
            return false;
        }

        let paramsObj = this.formula.match(/((\+|\*|\-|\/|\(|\)){1})|\$[0-9]+\$|[0-9]+(\.{1}[0-9]+)?/g);

        if (!paramsObj) {
            return false;
        }

        let params = [];

        for (let key in paramsObj) {
            params.push(paramsObj[key]);
        }
        return params;
    }

    generateResultOnFormulaInCell(cell, params) {
        if (cell.value.innerHTML.match('^[0-9]+:[0-5][0-9](:[0-5][0-9])?')) {
            return false;
        }

        if (!params) {
            return cell.trueValue;
        }
        let resultValueString = '';
        params.forEach ((param)=> {
            resultValueString += this.getFormulaCell(param, cell);

        })
        return resultValueString;
    }

    getFormulaCell(param, cell) {

        try {
            let result = '';
            let isAlias = (param.search(/\$[0-9]+\$/) >= 0);

            if (!isAlias) {
                return  ` ${param} `;
            }

            let needleRow = null;
            let rows = this.parentTable.model.allRowsInTables;
            let idInAlias = param.match(/[0-9]+/);

            for ( let i = 0; i < rows.length; i++) {
                if (rows[i].rowId === idInAlias[0]) {
                    needleRow = rows[i];
                    break;
                }
            }

            if (needleRow === null || needleRow === undefined) {
                return false;
            }

            if (cell.row.rowId === needleRow.rowId) {

                if (cell.value.innerHTML.trim() !== '') {
                    return ` ${cell.evalValue(cell.trueValue)} `;
                }
                return false;
            }

            let params = [];
            try {
                params = needleRow.getArrayParams();
            } catch (e) {
                throw new Error(e.message);
            }

            if (!params) {
                if (needleRow.getCell(cell.planed).trueValue.replace(/ /g, '') !== '' && needleRow.getCell(cell.planed).trueValue.match('^[0-9]+:[0-5][0-9](:[0-5][0-9])?') === null) {
                    return ' ' +  needleRow.getCell(cell.planed).evalValue(needleRow.getCell(cell.planed).trueValue) + ' '
                }
                return false;
            }

            for(let i = 0; i < params.length; i++) {
                result += this.getFormulaCell(params[i], needleRow.getCell(cell.planed));
            }

            if (result) {
                return cell.evalValue(result);
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }

    }
    /*Блок по работе с формулами - конец */


    /*Всплывающие подсказки при наведении на ячейку - начало*/
    initEventEditingCellsValue() {
        Array.from(this.getAllCells()).forEach((item) => {
            item.addEventListener('mouseover', (e) => {
                if(!this.parentTable.table.classList.contains('showPrompt')) { return false; }

                if (!e.target.closest('.metric-cell') || this._lastCell === e.target.closest('.metric-cell')) { return false;}
                // if (e.target.closest('.metric-cell') && !e.target.closest('.metric-cell').querySelector('.value').innerHTML.trim()) { return false;  }

                let metricName = this.name.innerHTML;
                let cellHtml = e.target.closest('.metric-cell');
                this._lastCell = e.target.closest('.metric-cell');
                if (!cellHtml) return false;

                let planed = cellHtml.dataset.planed;

                let cell = this.getCell(planed);
                let average = this.getAverageValueInRow();
                if (!average) {return false;}
                let arrayCellsValue = this.getArrayValuesAllCellsAndPlaned();
                let witchNext = null;
                let witchPrev  = null;
                let currentPositionCell = cell.position;
                let averageYears = this.getAverageDataYears();

                arrayCellsValue.forEach((item) => {
                    if (item.position === currentPositionCell + 1) {
                        witchNext =  this.getDifferenceValueCells(cell.value.innerHTML, item.value);
                    }
                    if (item.position === currentPositionCell - 1) {
                        witchPrev =  this.getDifferenceValueCells(cell.value.innerHTML, item.value);
                    }
                })
                let averageYearsData = false;
                if(averageYears !== null) {
                    averageYearsData = averageYears.years;
                    if (averageYears.formula ) {
                        averageYearsData = this.getValuesForFormulaInAverage(averageYears);
                    }
                }
                let ordinal = {
                    average,
                    witchPrev,
                    witchNext,
                    averageYearsData,
                    metricName
                }

                if (!ordinal.average || !ordinal.averageYearsData) {
                    return false;
                }
                let box = this.view.boxForData(ordinal);
                if (box) {
                    this.parentTable.model.controller.fetch.popup.getContent().insertAdjacentElement('afterbegin', box);
                    this.parentTable.model.controller.fetch.popup.show();

                }
            })

            item.addEventListener('mouseout', (e) => {
                let box = this.parentTable.model.tableBox.querySelector('.box-for-data');
                if (box) {
                    box.remove();
                    this.parentTable.model.controller.fetch.popup.removeComment();

                }
            })
        })
    }

    getDifferenceValueCells(cellCurrent, cellDifference) {
        if (cellCurrent && cellDifference) {
            return `${cellCurrent - cellDifference}`;
        }
    }

    getAverageValueInRow() {
        let arrayValues = [];
        for (let key in  this.cells) {
            let value = this.getCell(key).value.innerHTML;
            if (this.getCell(key).isDateTime(value)) {return false;}
            value = parseFloat(value);
                if (!isNaN(value)) {
                    arrayValues.push(value);
                }
        }

        let result =  arrayValues.reduce( function(previousValue, item) {
            return previousValue + item;
        }, 0);

        return Number((result / arrayValues.length).toFixed(2));

    }

    getArrayValuesAllCellsAndPlaned() {
        let result = [];
        for (let key in this.cells) {
            let value = this.getCell(key).value.innerHTML;
            if (isNaN(value)) {
                value = '';
            }

            let planed = this.getCell(key).planed;
            let position = this.getCell(key).position;
            result.push({
                position,
                planed,
                value
            })
        }
        return result;
    }

    getAverageDataYears(){
       return this.parentTable.getAverageDataYearsForMetric(this.rowId);
    }

    separatorThousands(value) {
        let parts = value.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }


    /*блок для вычисления средних значений с учетом формулы - начало */

    getValuesForFormulaInAverage(data) {
        let params = this.getArrayParamsForAverage(data.formula);
        let resultObjYears = {};
        let years = data['years'];
        if (!years) {
            return null;
        }

        if (params) {
            for (let year in years) {
                resultObjYears[year] = {};
                resultObjYears[year]['averageValue'] =  this.generateResultOnFormulaInCellForAverage(data, params, year );
            }

        }
        return resultObjYears;
    }


    getArrayParamsForAverage(dataParams) {
        if (dataParams === '' || dataParams === 'null' || dataParams === undefined) {
            return false;
        }

        let paramsObj = this.formula.match(/((\+|\*|\-|\/|\(|\)){1})|\$[0-9]+\$|[0-9]+(\.{1}[0-9]+)?/g);

        if (!paramsObj) {
            return false;
        }

        let params = [];

        for (let key in paramsObj) {
            params.push(paramsObj[key]);
        }
        return params;
    }

    generateResultOnFormulaInCellForAverage(currentData, params, year ) {
        let value = currentData['years'][year]['averageValue'] || false;

        if (!params) {
            return value;
        }

        let resultValueString = '';

        params.forEach ((param)=> {
            resultValueString += this.getFormulaCellForAverage(currentData, param, year );
        })
        return eval(resultValueString);
    }

    getFormulaCellForAverage(currentData, params, year ) {
        let isAlias = (params.search(/\$[0-9]+\$/) >= 0);

        if (!isAlias) {
            return  ` ${params} `;
        }

        let result = '';
        let needleRow = null;
        let rowsMetricsData = this.parentTable.model.getAverageDataForYearsInTableFullArray();

        let idInAlias = params.match(/[0-9]+/);


        for ( let key in rowsMetricsData) {
            if (parseInt(rowsMetricsData[key].id) === parseInt(idInAlias[0])) {
                needleRow = rowsMetricsData[key];
                break;
            }
        }

        if (needleRow === null ) {
            return false;
        }

        let needleYearObj = needleRow.years[year];

        if (!needleYearObj) {
            return false;
        }
        if (parseInt(currentData.id) !== parseInt(needleRow.id)) {
            if (needleRow.formula === null) {
                if (parseFloat(needleYearObj['averageValue'])) {

                    return ' ' +  needleYearObj['averageValue'] + ' '
                }
                return false;
            }

           let paramsNeedleRow = this.getArrayParamsForAverage(needleRow.formula);

            try {
                for(let i = 0; i < paramsNeedleRow.length; i++) {
                    result += this.getFormulaCellForAverage(needleRow, paramsNeedleRow[i], year );
                }
            } catch(e) {
                throw new Error(e.message);
            }

            if (result) {
                return result;
            }
        }

        if (parseInt(currentData.id) === parseInt(needleRow.id)) {
            if (currentData['years'][year]) {
                return ` ${currentData['years'][year]['averageValue']} `;
            }
            return false;
        }


        return false;

    }
    /*блок для вычисления средних значений с учетом формулы - конце  */


    /*Всплывающие подсказки при наведении на ячейку - конец*/

    getAllAliasesArray() {
        if (!this.formula) {return false;}

        let paramsObj = this.formula.match(/((\+|\*|\-|\/|\(|\)){1})|([0-9]*\.[0-9]+)|([a-zA-Z0-9]*)/g);
        let aliases = [];
        for (let key in paramsObj) {
            aliases.push(paramsObj[key]);
        }
        aliases = aliases.filter(param => {
            if (param.search("^[^0-9]{1}[^а-яА-Я][a-zA-Z0-9]*") >= 0 && param !== '') {
                return true;
            }
        })
       return aliases;
    }

    getAllValuesAndPlanedArray() {
        let data = [];
        for (let key in this.cells ) {
            let cell = this.getCell(key);
            let value = cell.value.innerHTML.replace(/ /g, "")

            if (cell.isDateTime(value)) {
                value = value.replace(/:/g, '.')
                data.push(parseFloat(value));
            } else {
                data.push(parseFloat(value));
            }
        }
        return data;
    }

    lightingRowOn() {
        this.row.classList.add('lighting');
        this.parentTable.model.formulaBlock.prepend(this.parentTable.model.controller.view.createPromptForAliasInput(this.name.innerHTML));
    }

    lightingRowOff(){
        this.row.classList.remove('lighting');
    }

    lightingMainRowOn(){
        this.row.classList.add('lightingMain');
    }


    resetAllValuesOn(){
        for (let key in this.cells) {
            this.getCell(key).value.innerHTML = this.getCell(key).trueValue;
        }
    }

    /*реализация отображения и скрытия локальных групп --- начало*/
    addToggleSlideForGroupControlPanel() {
        this._mainCell.prepend(this.view.toggleSlideForGroup());
        return this;
    }

    removeToggleSlideForGroupControlPanel() {
        this._mainCell.querySelector('.toggle-slide-for-group').remove();
        return this;
    }

    get closeGroupBtn(){
        return this.row.querySelector('.close-group');
    }

    get openGroupBtn(){
        return this.row.querySelector('.open-group');
    }

    showRowLocal(){
        this.row.classList.remove('hideRowLocal');
        return this;
    }

    hideRowLocal(){
        this.row.classList.add('hideRowLocal');
        return this;
    }

    showModeRowLocal() {
        if (this.openGroupBtn) {
            this.closeGroupBtn.style.display = 'none';
            this.openGroupBtn.style.display = 'block';
        }
    }

    hideModeRowLocal() {
        if (this.closeGroupBtn) {
            this.closeGroupBtn.style.display = 'block';
            this.openGroupBtn.style.display = 'none';
        }
    }
    /*реализация отображения и скрытия локальных групп --- конец*/

    getAllComputedValuesCells() {
        for (let key in this.cells) {
           if(this.cells[key].value.innerHTML
               && this.cells[key].value.innerHTML.replace(/ /g, "") !== ''
               && this.cells[key].value.innerHTML.replace(/ /g, "") != this.cells[key].computedValue) {
               this.parentTable.model.historyChangedCellsValues = this.cells[key].computedValueForDB;
           }
        }
    }
}

export {Row};