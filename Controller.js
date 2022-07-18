import {HtmlTemplates} from './HtmlTemplates.js'
import {Model} from "./Model.js";
import {Fetch} from "./Fetch.js";


class Controller {
    _view   = null;
    _model  = null;
    _fetch  = null;

    constructor() {
        this._view =  new HtmlTemplates();
        this._model = new Model(this);
        this._fetch = new Fetch(this);
        setTimeout(() => {
            this.initEvents();
        },1000)
    }

    get fetch() {
        return this._fetch;
    }
    get model() {
        return this._model;
    }
    get view() {
        return this._view;
    }

    initEvents() {
        this.initDefineCurrentTable();                      /*Задает текущую таблицу ( по умолчанию ) для model*/
        this.initDefineCurrentRow();                        /*Задает текущую строку ( по умолчанию ) для Таблицы*/
        this.initEditingCell();                             /*Редактируем ячейку метрики*/
        this.initDeleteTableElementOnBtn();             /*удаление ячейки или всей строки*/
        this.initBtnAddNewMetric();                            /*Создание новой метрики*/
        this.initShowCommentEvent();                        /* отобразить комментарий к ячейке.*/
        this.initEditingCellContextMenu();                  /*События связанные с ПКМ*/
        this.initBtnEdit();                             /*Включить режим отображения формул и алиасов*/
        this.initBtnShowCheckboxForStat();              /*Инициализация функции для отображения и скрытия галочек для выбора метрик в окно статистики*/
        this.initBtnShowStat();                         /*Кнопка отображения окна статистики*/
        this.initBtnShowTableRows();                    /*Отображать / скрывать скрытые строки*/
        this.initDragAndDropRows();                     /*Инициализация функционала перетаскивания строк*/
        this.initHandlerForShowBtnShowStat();           /*Обработка кликов по галочкам для отображения кнопки вызова окна статистики*/
        this.initHandlerResetCheckboxesForStatBtn();    /*сбросить все чекбоксы для статистики*/
        this.initBtnToggleDragEndDropMode();            /*Включение режима перетаскивания строк*/
        this.initBtnsShowSingleStat();                  /**/
        this.initLocalHideGroupEvent();                 /*Рлизация локального скрытия групп*/
        this.initBtnTogglePrompt();                     /* Отображение окна при наведении на ячейку*/
        this.initFormulaMode();                         /*Новый функционал по работе с формулами*/
        this.getPositionCursorInInput();
        this.initEscapeKey();
        this.initShowTrueValuePrompt();

        this.model.tableBox.style.display = 'block';

        if (this.model.table(true).length) {
            this.model.tableBox.scrollLeft = this.model.table(true)[0].table.scrollWidth;
        }
        this.model.preloaderOff();


    }

    initDefineCurrentTable() {
        this.model.tableBox.addEventListener('mousemove', (e) => {

            let target = e.target;
            if (target.closest('.lightTable')) {
                //
                // if (parseInt(this.model.currentTable) === parseInt(target.closest('.lightTable').getAttribute('data-number-table'))) {
                //     return false
                // }
                this.model.currentTable = target.closest('.lightTable').getAttribute('data-number-table');
            }
        })
    }

    initDefineCurrentRow() {
        this.model.tableBox.addEventListener('mousemove', (e) => {
            let target = e.target;
            if (target.closest('.tr-body')) {
                this.model.table().currentRow = target.closest('.tr-body');
            }
        })
    }

    initEditingCell() {
        document.addEventListener('dblclick', (e) => {
            let target = e.target;
            if (!target.closest('#formula_input') && this.model._formulaMode) {
                this.model.formulaModeOff();
                this.model.formulaBlockRemove();
            }

            if(target.closest('.metric-cell.working-cell') && target.tagName !== 'INPUT') {
                this.editCellValueMetric(e);
            }
            if(target.closest('.metric-type.working-cell')) {
                this.editCellType(e);
            }
        })
    }

    initEditingCellContextMenu() {
        this.model.tableBox.addEventListener('contextmenu', (e) => {
            if(e.target.closest('.metric-cell')) {
                e.preventDefault();
                this.fetch.sendFormCellValueContextMenu(e.target.closest('.metric-cell'));
            }

            if(e.target.closest('.metric-week.working-cell')) {
                this.editWeekCellComment(e)
            }

            if(e.target.closest('.metric-type.working-cell')) {
                this.editCellTypeContextMenu(e);
            }
        })
    }

    editCellValueMetric(e) {
        e.preventDefault();
        let target          = e.target.closest('.metric-cell.working-cell');
        let id              = target.dataset.planed;
        let targetCell = this.model.table().currentRow.getCell(id);
        this.fetch.handlerFormMetricCell(targetCell);
    }

    initDeleteTableElementOnBtn() {
        this.model.tableBox.addEventListener('click', (e) => {
            if (e.target.closest('.delete a')) {
                e.preventDefault();
                this.fetch.deleteContentCell(e.target);
            }
        })
    }

    initBtnAddNewMetric() {
        let addMetricBtns = document.querySelectorAll('.add-metric-btn');
        Array.from(addMetricBtns).forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.add-metric-btn')) {
                    e.preventDefault();
                    this.fetch.addNewMetric(e.target.closest('a'));
                }
            })
        })
    }

    /* редактируем тип метрики ЛКМ */
    editCellType(e) {
        e.preventDefault();
        this.fetch.handlerFormTypeRow(this.model.table().currentRow);
    }

    /* редактируем тип метрики ПКМ */
    editCellTypeContextMenu(e){
        e.preventDefault();
        this.fetch.handlerFormTypeRow(this.model.table().currentRow, true);
    }

    editWeekCellComment(e) {
        e.preventDefault();
        let target      = e.target.closest('.metric-week');
        let id          = target.dataset.planed;
        let targetCell  = this.model.table().getWeekCellOnId(id) ;

        this.fetch.sendFormWeekCellCommentContextMenu(targetCell);
    }

    initShowCommentEvent() {
        this.model.tableBox.addEventListener('click', (e) => {
            if (e.target.closest('.comment-trigger')) {
                let copyElement = e.target.closest('.working-cell').querySelector('.comment-box').cloneNode(true);
                this.fetch.popup.commentModeOn();
                this.fetch.popup.getContent().append(copyElement);
                this.fetch.popup.show();
            }
        })
    }

    initBtnEdit() {
        this.model.editBtn.addEventListener('click', (e) => {
            this.model.editModeBtnToggle();
        })
    }

    initShowTrueValuePrompt() {
        this.model.tableBox.addEventListener('mouseover', (e) => {
            let t = e.target;
            if(t.closest('.metric-cell')) {
                this.model.showTrueValuePrompt(t.closest('.metric-cell'));
            }
        })

        this.model.tableBox.addEventListener('mouseout', (e) => {
            let t = e.target;
            if(t.closest('.metric-cell')) {
                this.model.hideTrueValuePrompt(t.closest('.metric-cell'));
            }
        })
    }


    initBtnShowCheckboxForStat() {
        this.model.toggleShowStatCheckboxBtn.addEventListener('click', (e) => {
            if (e.target.closest('#stat-mode-toggle')) {
                if (this.model.toggleShowStatCheckboxBtn.classList.contains('btn-success')) {
                    this.model.toggleShowStatCheckboxBtn.classList.add('btn-primary');
                    this.model.toggleShowStatCheckboxBtn.classList.remove('btn-success');
                } else {
                    this.model.toggleShowStatCheckboxBtn.classList.add('btn-success');
                    this.model.toggleShowStatCheckboxBtn.classList.remove('btn-primary');
                }

                this.model.table(true).forEach(item => {
                    item.toggleCheckboxForStat()}
                )

            }
        })
    }

    initHandlerForShowBtnShowStat(){
        if (!this.model.checkboxes) { return false;}
        this.model.checkboxes.forEach(item => {
           item.addEventListener('click', (e) => {
               let isChecked = this.model.checkboxes.some(element => {
                   return element.checked;
                })

                if (isChecked) {
                    this.model.showStatBtn.style.display = 'block';
                    this.model.deleteStatBtn.style.display = 'block';
                } else {
                    this.model.showStatBtn.style.display = 'none';
                    this.model.deleteStatBtn.style.display = 'none';
                }
            })
        })
    }

    initHandlerResetCheckboxesForStatBtn() {
        if (!this.model.checkboxes) { return false;}
        this.model.deleteStatBtn.addEventListener('click', (e) => {
            this.model.checkboxes.forEach(item => {
                item.checked = false;
            })

            this.model.showStatBtn.style.display = 'none';
            this.model.deleteStatBtn.style.display = 'none';
            this.fetch.popup.hide();
            this.model.toggleShowStatCheckboxBtn.click();
        })
    }

    initBtnShowStat() {
        this.model.showStatBtn.addEventListener('click', (e) => {
            if (e.target.closest('#show-stat-toggle')) {
                let collectedData = {
                    'dataCells' : [],
                    'planded' : []
                }
                this.model.table(true).forEach(table => {
                    let data = table.getDataForStat();
                    collectedData.dataCells = collectedData.dataCells.concat(data.dataCells);
                    collectedData.planded = collectedData.planded.concat(data.planded);
                })
                if (!collectedData.dataCells.length) {return false;}
                this.fetch.popup.createStat(collectedData);
            }
        })
    }

    initBtnsShowSingleStat() {
        this.model.tableBox.addEventListener('click', (e) => {
            let target = e.target;
            if (target.closest('.show-single-stat-toggle')) {
                let data = this.model.table().getDataForStatCurrentRow();
                this.fetch.popup.createStat(data);
            }
        })
    }

    initBtnShowTableRows() {
        this.model.toggleShowHideRowsBtn.addEventListener('click', () => {
            if (this.model.toggleShowHideRowsBtn.classList.contains('btn-success')) {
                 this.model.toggleShowHideRowsBtn.classList.add('btn-light');
                 this.model.toggleShowHideRowsBtn.classList.remove('btn-success');
            } else {
                this.model.toggleShowHideRowsBtn.classList.add('btn-success');
                this.model.toggleShowHideRowsBtn.classList.remove('btn-light');
            }

            this.model.table(true).forEach(table => {
                table.toggleShowHideRows();
            })

        })
    }

    initBtnToggleDragEndDropMode(){
        this.model.toggleDragAndDropBtn.addEventListener('click', () => {
            if (this.model.toggleDragAndDropBtn.classList.contains('btn-success')) {
                this.model.toggleDragAndDropBtn.classList.add('btn-primary');
                this.model.toggleDragAndDropBtn.classList.remove('btn-success');
            } else {
                this.model.toggleDragAndDropBtn.classList.add('btn-success');
                this.model.toggleDragAndDropBtn.classList.remove('btn-primary');
            }
            this.model.table(true).forEach(table => table.toggleDragAndDropMode());
        })
    }

    initDragAndDropRows() {

        this.model.table(true).forEach(table => {
            let currentRow = null;
            let currentOver = null;
            let imaginaryRow = null;
            Array.from(table.allRowsNode).forEach(item => {
                item.addEventListener('dragstart', function dragstart(e)  {
                    setTimeout(()=>{
                        currentRow = e.target;
                        currentRow.style.opacity = 0.5;
                        imaginaryRow = document.createElement('tr');
                        imaginaryRow.style.height = '25px';

                    }, 0)
                }.bind(this))

                item.addEventListener('dragend', function dragend (e) {
                    setTimeout(()=>{
                        currentRow.style.opacity = 1;
                        imaginaryRow.remove();
                        imaginaryRow = null;
                        currentOver.before(currentRow);
                        currentRow = null;
                        this.fetch.updateRowsPosition();
                        this.initLocalHideGroupEvent();

                    }, 0)
                }.bind(this))
            })

            table.table.addEventListener('dragover', function dragover(e) {
                let t = e.target;
                let insertAfterDrag = function (){
                    if (imaginaryRow) {
                        currentOver.before(imaginaryRow);
                    }
                };
                if (t.closest('.tr-body'))  {
                    if (t.closest('.tr-body') === currentRow || currentRow === null) {return false;}
                    currentOver = t.closest('.tr-body');
                    clearTimeout(insertAfterDrag);
                    setTimeout(insertAfterDrag, 250);
                }
            }.bind(this))

            table.table.addEventListener('dragout', function dragout (e)  {
                let t = e.target;
                if (t.closest('.tr-body'))  {
                    if (t.closest('.tr-body') === currentRow) {
                        currentRow.style.opacity = 1;
                        currentRow = null;
                        imaginaryRow = null;
                    }
                }
            }.bind(this))
        })

    }

    /*Рлизация локального скрытия групп*/
    initLocalHideGroupEvent(){
        let storage = JSON.parse(localStorage.getItem('group'));

        if (!storage) {
            localStorage.setItem('group', JSON.stringify({ group: [] }));
            storage = JSON.parse(localStorage.getItem('group'));
        }

        this.model.table(true).forEach(table => table.processingHideShowRowsForLocal(storage.group));

        this.model.tableBox.addEventListener('click', (e) => {
            let storage = JSON.parse(localStorage.getItem('group'));
            let target = e.target;
            if (target.closest('.close-group')) {
                let rowId = this.model.table().currentRow.rowId;
                this.addLocalRowOnId(rowId);
            }

            if (target.closest('.open-group')) {
                let rowId = this.model.table().currentRow.rowId;
                if (!storage.group.includes(rowId)) { return false;}
                this.removeLocalRowOnId(rowId);
            }
        })
    }

    removeLocalRowOnId(rowId) {
        let storage = JSON.parse(localStorage.getItem('group'));

        if (storage) {
            let index = storage.group.indexOf(rowId);
            if (index > -1) {
                storage.group.splice(index, 1);
            }

            this.model.table(true).forEach(table => table.processingHideShowRowsForLocal(storage.group));

            this.model.getRowOnIdInTables(rowId).hideModeRowLocal();
            localStorage.setItem('group', JSON.stringify(storage));
        }
    }

    addLocalRowOnId(rowId) {
        let storage = JSON.parse(localStorage.getItem('group'));

        if (storage.group.includes(rowId)) { return false;}
        storage.group.push(rowId);
        this.model.table(true).forEach(table => table.processingHideShowRowsForLocal(storage.group));


        this.model.getRowOnIdInTables(rowId).showModeRowLocal();
        localStorage.setItem('group', JSON.stringify(storage));
    }

    initBtnTogglePrompt() {
        this.model.promptBtn.addEventListener('click', (e) => {
            /*Пучаем средние значения метрик по годам*/
            let url = document.location.search;
            let urlClass = new URLSearchParams(url);
            let categoryIds = urlClass.getAll('typeCategory[]');
            let queryString = '/lightmetric/getAllAverageValuesForTypes?';
            categoryIds.forEach((id) => {
                queryString += `typeCategory[]=${id}&`;
            })

            fetch(queryString)
                .then(response => response.json())
                .then((response) => {
                    this.model.setAverageDataForYears(response);
                })
                .catch((err) => console.error(err));

            this.model.table(true).forEach(table => table.table.classList.toggle('showPrompt'));
            this.model.promptBtn.classList.toggle('btn-primary');
            this.model.promptBtn.classList.toggle('btn-success');
            this.fetch.popup.removeComment();
        })
        this.formulaModeHandlerOn();
    }

    initEscapeKey(){
        document.addEventListener("keydown", (e) => {
            if (e.code === 'Escape') {
                this.fetch.popup.removeForm();
            }
        })
    }

    /*Новый функционал по работе с формулами*/
    initFormulaMode() {
        this.model.formulaModeBtn.addEventListener('click', () => {
            this.model.toggleFormulaMode();
        })

        /*Событие нажатия на кнопку отправки новой формулы*/
        this.model.tableBox.addEventListener('click', (e) => {
            let t = e.target;
            if (!t.closest('#formula_success')) {return false}
            e.preventDefault();
            let metricId = t.closest('#formula_success').dataset.metricId;
            this.fetch.setFormula(metricId);

            let modifiedRow = this.model.getRowOnIdInTables(metricId)

            if (!modifiedRow) {return false;}

            modifiedRow.formula = this.model.formulaInput.value;
            this.model.initProcessingForFormulaRowsInTables();
            this.model.formulaBlockRemove();
        })
    }

    formulaModeHandlerOn() {
        this.model.tableBox.addEventListener('click', function formulaMode(e) {
            if (!this.model._formulaMode) {return false }
            if (e.target.closest('.tr-body') && !e.ctrlKey) {
                let metricId = this.model.table().currentRow.rowId;
                if (this.model.currentMetricIdForFormulaBlock !== metricId) {
                        this.model.formulaBlockRemove();
                        this.fetch.createFormulaBlock(metricId);
                        this.model.currentMetricIdForFormulaBlock = metricId;
                        this.model.getRowOnIdInTables(metricId).lightingMainRowOn();
                }
            }

            if (e.target.closest('.tr-body') && e.ctrlKey) {
                if (!this.model.formulaBlock ) { return false}

                let alias =`$${this.model.table().currentRow.rowId}$`;

                this.model.formulaInput.value += alias;
                this.model.formulaInput.focus();
            }
        }.bind(this));
    }

    getPositionCursorInInput() {
        this.model.tableBox.addEventListener('click', (e) => {
            let t = e.target;
            if (!t.closest("#formula_input")) {
                return false;
            }
            this.model.getCurrentPosition(t.closest("#formula_input"))
        })

    }
}

export {Controller};