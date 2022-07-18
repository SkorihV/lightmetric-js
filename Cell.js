import {Comment} from './Comment.js'


class Cell extends Comment{
    _mainCell   = null;
    _parentRow  = null;
    _value      = null;
    _url        = null;
    _unitCell   = null;
    _position   = null;


    constructor(cell, row, index) {
        super();
        this._mainCell  = cell;
        this._parentRow = row;
        this._position  = index;
        this.updateColor();
        this.initComment();
    }
    get mainCell() {
        return this._mainCell;
    }

    get planed() {
        return this._mainCell.dataset.planed;
    }
    get value() {
        this._value = this._mainCell.querySelector('.value');

        this._value.innerHTML = this.recognizeData(this._value.innerHTML);
        return this._value;
    }

    get position() {
        return this._position;
    }

    set value(value) {
        this.value.innerHTML = value;
    }

    get url() {
        if (this._url) {
            return this._url;
        }
        return this._url = this._mainCell.dataset.href;
    }

    get row() {
        return this._parentRow;
    }

    get trueValue() {
        return this.mainCell.dataset.trueValue;
    }

    get computedValue () {
        return this.mainCell.dataset.computedValue;
    }

    set computedValue(value) {
        this.mainCell.dataset.computedValue = value;
    }

    set trueValue(value) {
        this.mainCell.dataset.trueValue = value;
        return this;
    }

    updateData(data) {
        if (!data) {
            this.value = '';
            this.trueValue = '';
        }
        if (data.data.value ) {
            let trueValue = data.data.value;
            let newValue = this.recognizeData(data.data.value);
            if (this.recognizeData(this.value.innerHTML) !== newValue ) {
                this.trueValue = trueValue;
                this.value = newValue;
            }
        } else if (data.data.value === null) {
            this.trueValue = '';
            this.value = '';
        }
        this.updateComment(data);


        this.row.parentTable.model.initProcessingForFormulaRowsInTables();

        if (this.value.innerHTML && this.value.innerHTML.replace(/ /g, "") !== '' && this.value.innerHTML.replace(/ /g, "") !== this.computedValue) {
            this.row.parentTable.model.controller.fetch.updateComputedValue(this.computedValueForDB);
        }
    }

    get unit() {
        return this.row.unit;
    }

    isNumber(n) {
        return Number(n) === +n;
    }

    updateUnit() {
        if (this.unit) {
            if (!this._mainCell.querySelector('.unit')) {
                this._unitCell = this._mainCell.querySelector('.content-cell').appendChild(this.view.unit())
            } else {
                this._unitCell = this._mainCell.querySelector('.unit');
            }

            if (this.value.innerHTML.trim()) {
                this._unitCell.innerHTML = this.unit;
            } else {
                this._unitCell.innerHTML = '';
            }

        } else if (this._mainCell.querySelector('.unit')) {
            this._mainCell.querySelector('.unit').remove();
        }
        return this;
    }

    around(value) {
        value = this.evalValue(value);
        if(this.row.around === '1'  && value.toString() !== '') {
            value =   parseFloat(value).toFixed(2);
        } else if (this.row.around === '0') {
            value =   parseInt(value).toFixed(0);
        }
        // return value
        return this._parentRow.separatorThousands(value)
    }

    recognizeData(data){
        data = data.replace(/ /g, "");
        if (this.isDateTime(data)) {
             return data;
        }
        if (this.evalValue(data)) {
            let value = this.evalValue(data);
            if (value.match('^[0-9]+(\.?[0-9])*$')) {
                return this.around(value);
            }
        }
        return '';
    }

    isDateTime(value){
        if (value === false || value === '') {return false}

        if (value.toString().match('[0-9]+:[0-5][0-9](:[0-5][0-9])?') !== null) {
            return true;
        }
        return false;
    }

    getDateTime(time) {
        const year = new Date().getFullYear()
        time = time.split(":");
        time = new Date(year,0,0,time[0],time[1],time[2]||0);
        return time;
    }

    updateColor() {
            let min = this.recognizeData(this.row.minimal.innerHTML).replace(/ /g, "") || false;
            let norm = this.recognizeData(this.row.normal.innerHTML).replace(/ /g, "") || false;
            let content = this.recognizeData(this.value.innerHTML).replace(/ /g, "") || false;
            // if (isNaN(content) || content === '') {this.removeColor()}

             if (this.isDateTime(min) && this.isDateTime(norm) && this.isDateTime(content)) {
                min = this.getDateTime(min);
                norm = this.getDateTime(norm);
                content = this.getDateTime(content);
            }
            this.removeColor();

            if (!content) {return false;}

             if ( min && norm &&  this.value.innerHTML.replace(/ /g, "") !== '' && content instanceof Date) {
                 if (min < norm) {
                     if (content < min) {
                         this.mainCell.classList.add('bad-cell');
                     } else if (content >= min && content < norm) {
                         this.mainCell.classList.add('norm-cell');
                     } else {
                         this.mainCell.classList.add('good-cell');
                     }
                 } else if (min >= norm) {
                     if (content <= norm) {
                         this.mainCell.classList.add('good-cell');
                     } else if (content > norm && content <= min) {
                         this.mainCell.classList.add('norm-cell');
                     } else {
                         this.mainCell.classList.add('bad-cell');
                     }
                 }
             } else if ( min && norm &&  this.value.innerHTML.replace(/ /g, "") !== '' && !(content instanceof Date) ) {
                 min = Number(parseFloat(min).toFixed(2));
                 norm = Number(parseFloat(norm).toFixed(2));
                 content = Number(parseFloat(content).toFixed(2));

                 if (min < norm) {
                     if (content < min) {
                         this.mainCell.classList.add('bad-cell');
                     } else if (content >= min && content < norm) {
                         this.mainCell.classList.add('norm-cell');
                     } else {
                         this.mainCell.classList.add('good-cell');
                     }
                 } else if (min >= norm) {
                     if (content <= norm) {
                         this.mainCell.classList.add('good-cell');
                     } else if (content > norm && content <= min) {
                         this.mainCell.classList.add('norm-cell');
                     } else {
                         this.mainCell.classList.add('bad-cell');
                     }
                 }
             } else if(!min && !norm) {
                 this.removeColor();
             }
    }

    removeColor() {
        this.mainCell.classList.remove('bad-cell');
        this.mainCell.classList.remove('norm-cell');
        this.mainCell.classList.remove('good-cell');

        return this;
    }

    remove() {
        this.mainCell.innerHTML = '';
        this.trueValue = '';
        this.mainCell.appendChild(this.view.content()).appendChild(this.view.value());
        setTimeout(()=>{
            this.row.parentTable.model.initProcessingForFormulaRowsInTables();
        },200)
    }

    hideContent() {
        this.mainCell.classList.add('hideValue');
        return this;
    }

    showContent() {
        this.mainCell.classList.remove('hideValue');
        return this;
    }

    evalValue(value) {
        value = value.replace(/ /g, "")
         try {
             if (eval(value) !== undefined && !value.includes('false')  ) {
                 return  eval(value).toString();
             }
         } catch (e) {
             console.error(e.message, 'Название категории - ' +  this.row.name.innerHTML.trim(),'Дата - ' + this.planed );
             console.error('Название категории - ' +  this.row.name.innerHTML.trim());
             console.error('Дата в ячейке - ' + this.planed );
             console.log('*****************************')
         }
        return '';
    }

    showTrueValue() {
        if (!!this.trueValue.replace(/ /g, "")
            && this.value.innerHTML.replace(/ /g, "") != this.trueValue.replace(/ /g, "")
            && !this.mainCell.classList.contains('show-true')) {
                this.mainCell.classList.add('show-true');
                if (!this.mainCell.querySelector('.true-value-prompt')) {
                    this.mainCell.append(this.row.parentTable.model.controller.view.trueValuePrompt(this.trueValue))
                }
        }
    }
    hideTrueValue() {
        if (this.mainCell.classList.contains('show-true')) {
            this.mainCell.classList.remove('show-true');
            this.mainCell.querySelector('.true-value-prompt').remove();
        }
    }


    get computedValueForDB() {
        this.computedValue = this.value.innerHTML.replace(/ /g, "");
        return {
            computedValue   : this.computedValue,
            planed      : this.planed,
            typeId      : this.row.rowId

        }
    }

}

export {Cell};