import {Form} from "./Form.js"


class Fetch {
    _handlerObject  = null;
    _deleteBtn      = null;
    _popup          = null;
    _formBox        = null;
    _submitBtn      = null;
    _popupBlock     = null;
    _form_          = null;
    _controller     = null;

    constructor(controller) {
        this._popupBlock = document.querySelector('#popup-block');
        this._contentForm = document.querySelector('#contentForm');
        this._controller = controller;
        this.initForm();
    }

    initForm() {
        this._form_ = new Form(this);
    }

    get controller() {
        return this._controller;
    }

    get popupBlock() {
        return this._popupBlock;
    }

    get contentForm() {
        return this._contentForm;
    }

    set handlerObject(obj) {
        this._handlerObject = obj;
    }

    get handlerObject() {
        return this._handlerObject;
    }

    get popup() {
        return this._form_;
    }

    clearContentForm() {
        this._contentForm.innerHTML = '';
    }

    /*Обработка двойного клика по ячейке метрики с вызовом формы внутри*/
    handlerFormMetricCell(cell) {
        this.handlerObject = cell;
        if (cell) {
            this.controller.model.preloaderOn();
        }


        fetch(this.handlerObject.url)
            .then(response => response.text())
            .then(data => {
                let box       = this.controller.view.boxForInputCell();
                box.innerHTML = data;

                this.handlerObject.hideContent();
                if (this.handlerObject.mainCell.appendChild(box)) {
                    this.controller.model.preloaderOff();
                }
                let input =  box.querySelector('#week_cell_form_value');
                input.focus()
                input.selectionStart = input.value.length;
                this.controller.model.formulaBlockRemove();

                return input;
            })
            .then((input, box) => {
                this.controller.model.tableBox.addEventListener('click', this.sendFormCellValue.bind(this));
                /*Оброботка нажатия клавиши Ентер*/
                input.addEventListener('keypress', (e)=> {
                    if (e.keyCode === 13) {
                        this._formBox      = this.handlerObject.mainCell.querySelector('.box-for-input-cell');
                        this._popup        = this.handlerObject.mainCell.querySelector('form');
                        if (!this._popup) return  false;

                        this._submitBtn   = this.handlerObject.mainCell.querySelector('button');

                        this._popup.addEventListener('submit', (e) => {
                            e.preventDefault();
                            this.controller.model.preloaderOn();
                            let formData = new FormData(this._popup);

                            this.ajaxSendDataForm(formData, this.handlerObject.url)
                                .then(response => {
                                    this.handlerObject.updateData(response);
                                    this.controller.model.preloaderOff();
                                })
                                .catch((err) => console.error(err));
                        })

                        this.handlerObject.showContent();
                        this._submitBtn.click();

                        this._formBox.remove();
                        this._formBox = null;
                        this._popup = null;
                    }
                })
                // this.controller.model.tableBox.addEventListener('contextmenu', this.sendFormCellValue.bind(this));
            })
    }

    /*Обработка клика по ячейке типа метрики с вызовом формы в окне*/
    handlerFormTypeRow(row, context = false) {
        this.handlerObject = row;
        fetch(this.handlerObject.url)
            .then(response => response.text())
            .then(data => {
                this.popup.getContent().innerHTML = data;
                if (context) {
                    this.popup.addEditMode();
                } else {
                    this.popup.removeEditMode();
                }

                this.popup.addPattern();
                this.popup.show();

                this.popup.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.ajaxSendDataForm(this.popup.formData, this.handlerObject.url)
                        .then(response => {

                            this.popup.hide();
                            if (context) {
                                this.popup.removeEditMode();
                            }


                            this.handlerObject.updateData(response)
                            this.popup.removeForm();
                        })
                        .catch((err) => console.error(err));
                })
            })
    }

    sendFormWeekCellCommentContextMenu(weekCell) {
        this.handlerObject = weekCell;
        fetch(this.handlerObject.url)
            .then(response => response.text())
            .then(data => {
                this.popup.getContent().innerHTML = data;
                this.popup.show();

                this.popup.form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    this.ajaxSendDataForm(this.popup.formData, this.handlerObject.url)
                        .then(response => {
                            this.popup.hide();
                            this.handlerObject.updateData(response)
                            this.popup.removeForm();

                        })
                        .catch((err) => {
                            console.error(err)

                        });
                })
            })
    }

    sendFormCellValue(e) {
        if (e.target.closest('td') === this.handlerObject.mainCell) { return false}



        this._formBox      = this.handlerObject.mainCell.querySelector('.box-for-input-cell');
        this._popup        = this.handlerObject.mainCell.querySelector('form');

        if (!this._popup) return  false;
        this._submitBtn   = this.handlerObject.mainCell.querySelector('button');
        this._deleteBtn   = this._formBox.querySelector('.delete a');

        let valueInput    = this._popup.querySelector('input#week_cell_form_value').value;
        let comment       = this._popup.querySelector('#week_cell_form_comment').value;




        this._popup.addEventListener('submit', (e) => {
            e.preventDefault();
            this.controller.model.preloaderOn();
            let formData = new FormData(this._popup);

            this.ajaxSendDataForm(formData, this.handlerObject.url)
                .then(response => {
                    this.handlerObject.updateData(response);
                    this.controller.model.preloaderOff();
                })
                .catch((err) => console.error(err));
        })

        this.handlerObject.showContent();
        if (valueInput.trim() || comment.trim()) {
            this._submitBtn.click();

        }

        if (!valueInput.trim() && !comment.trim() && this._deleteBtn){
            this.deleteContentCell(this._deleteBtn);
            this._deleteBtn = null;
        }

        this._formBox.remove();
        this._formBox = null;
        this._popup = null;
    }

    deleteContentCell(linkElement)  {
        if (linkElement.href) {
                fetch(linkElement.href, {
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        this.handlerObject.remove(data);
                        if ( this.handlerObject.rowId ){
                            this.controller.removeLocalRowOnId(this.handlerObject.rowId);
                        }
                        this.popup.hide();
                    })
                    .catch((err) => console.error(err));
        }
    }

    addNewMetric(btn) {
        let url = btn.href;
        if (!url) return false;
            fetch(url)
                .then(response => response.text())
                .then(data => {

                    this.popup.getContent().innerHTML = data;
                    this.popup.addPattern();
                    this.popup.removeEditMode();
                    this.popup.show();

                    return this.popup.form;
                })
                .then(form => {
                    this.popup.form.addEventListener('submit',  (e) => {
                        e.preventDefault();
                        this.ajaxSendDataForm(this.popup.formData, url)
                            .then(response => {
                                this.popup.hide().removeForm();
                                    let newRow = this.controller.view.addNewRow(response, this.controller.model.table().allDate);
                                    let position = response.data.position;

                                    this.controller.model.currentTable = response.data.typeCategory.id;
                                    if (this.controller.model.table()) {
                                        this.controller.model.table().addNewRowOrMove(newRow, position);
                                    }
                                    this.updateRowsPosition();
                                    this.controller.initHandlerForShowBtnShowStat();
                                    this.controller.initHandlerResetCheckboxesForStatBtn(); /*сбросить все чекбоксы для статистики*/
                                    this.controller.initDragAndDropRows();
                            })
                            .catch((err) => console.error(err));
                    })
                })
    }

    sendFormCellValueContextMenu(target) {
        let planed = target.dataset.planed;


        if ( this.handlerObject && this.handlerObject.constructor.name === 'Cell' && this.handlerObject.mainCell.querySelector('.box-for-input-cell')) {
            this.handlerObject.mainCell.querySelector('.box-for-input-cell').remove();
            this.handlerObject.showContent();
        }

        if (planed) {
            this.handlerObject =  this.controller.model.table().currentRow.getCell(planed);
        }

        fetch(this.handlerObject.url)
            .then(response => response.text())
            .then(data => {
                this.popup.getContent().innerHTML = data;
                this.popup.addEditMode();
                this.popup.show();

                return this.popup.form;
            })
            .then(form => {
                this.popup.form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    this.ajaxSendDataForm(this.popup.formData, this.handlerObject.url)
                        .then(response => {
                            this.popup.hide();
                            this.handlerObject.updateData(response)
                            this.popup.removeForm();

                        })
                        .catch((err) => console.error(err));
                })

                if (this.popup.popup.querySelector('.delete-comment')) {
                    this.popup.popup.querySelector('.delete-comment').addEventListener('click', (e) => {
                        e.preventDefault();
                        this.popup.form.querySelector('#week_cell_form_comment').value = '';
                        this.popup.form.querySelector('#week_cell_form_submit').click();
                    });
                }
            })
    }

    async ajaxSendDataForm (formData, url) {
        let fetchResponse = await fetch(url, {
            method: 'POST',
            body: formData
        })
        if (!fetchResponse.ok) {
            throw new Error(`Ошибка по адресу ${url}, статус ошибки ${fetchResponse.status}`);
        }
        return  fetchResponse.json();
    }

    updateRowsPosition() {
        let request = '/lightmetric/type/updaterows';

        request += this.controller.model.table().normalizeRowsPositions();
        this.controller.model.preloaderOn();
        fetch(request)
            .then(response => {
                if (response) {
                    console.log('Ok');
                }
            this.controller.model.preloaderOff();
            })
            .catch((err) => console.error(err));
    }

    createFormulaBlock(metricId) {
        let url = '/lightmetric/typeformula?id=' + metricId;
        fetch(url)
            .then(response => response.json())
            .then(response => {
                let formulaBlock = this.controller.view.getFormulaBlock(metricId);
                this.controller.model.tableBox.prepend(formulaBlock);
                if (response.data) {
                    formulaBlock.querySelector('.formula_input').value = response.data;
                }

            })
            .catch((err) => console.error(err));
    }

    setFormula(metricId) {
        let url = `/lightmetric/typeformulaAdd?id=${metricId}`;

        let form = this.controller.model.formulaBlock.querySelector('form');
        let formData = new FormData(form)
        this.controller.model.preloaderOn();

        this.ajaxSendDataForm(formData, url)
            .then((response) => {

                let row = this.controller.model.getRowOnIdInTables(metricId);

                if (response.formula === '') {
                    row.resetAllValuesOn();
                }
                row.formula = response.formula;
                return row;
            })
            .then((row)=>{
                row.parentTable.model.initProcessingForFormulaRowsInTables();
                this.controller.model.preloaderOff();
            })
            .catch((err) => {
                this.controller.model.preloaderOff();
                console.error(err);
            });
    }

    async updateComputedValue(data) {
        let dataComputedValuesArray = [];
        if (!Array.isArray(data)) {
            dataComputedValuesArray.push(data);
        } else {
            dataComputedValuesArray = data;
        }

        const url = `/lightmetric/cells/updateComputedValues`
        const fetchResponse = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(dataComputedValuesArray),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const json = await fetchResponse.json();

        if (!fetchResponse.ok) {
            throw new Error(`Ошибка по адресу ${url}, статус ошибки ${fetchResponse.status}`);
        }
    }
}

export {Fetch};