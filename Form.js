class Form{
    _popup          = null;
    _content        = null;
    _form           = null;
    _deleteBtn      = null;
    _isComment      = false;
    _fetch          = null;
    _aliasPanel     = null;

    constructor(fetch) {
        this._fetch = fetch;
        this.initForm();
    }

    initForm() {
        this._popup = document.querySelector('#popup-block');
        if (!this._popup) {
            return false;
        }

        this.closeFormEvent();
        this.deleteEvent();
        this.submitEvent();
        this.addEventDropDownForPopup();
    }

    get fetch() {
        return this._fetch;
    }

    get popup(){
        return this._popup;
    }

    getContent() {
        if (this._content !== null) {
            this._content.innerHTML = '';
            return this._content;
        }
        this._content = this.popup.querySelector('#contentForm');
        this._content.innerHTML = '';
        return  this._content;
    }

    get aliasPanel() {
        if (this._aliasPanel) {
            return this._aliasPanel;
        }
        this._aliasPanel = this.popup.querySelector('.aliasPanel');
        return this._aliasPanel;
    }

    setContent(param, comment = false) {
        this._content.innerHTML = '';
        this._isComment         = comment;
        this._content           = param;
    }

    commentModeOn() {
        this._isComment = true;
    }

    get form() {
        this._form = this.popup.querySelector('#content form');
        return this._form;
    }

    get formData() {
        return new FormData(this.form);
    }

    get deleteBtn() {
        if (this._deleteBtn) {
            return this._deleteBtn;
        }
        this._deleteBtn = this._popup.querySelector('.delete');
    }

    removeForm() {
        if (this.form) {
            this.form.reset();
        }

        this.getContent();
        this.getContent().innerHTML = null;
        this._form          = null;
        this._deleteBtn     = null;
        this._isComment = false;
        this.hide();
    }

    removeComment() {
        this.getContent();
        this.getContent().innerHTML = null;
        this._form          = null;
        this._deleteBtn     = null;
        this.hide();
        this._isComment = false;
    }

    addPattern() {
        this.popup.querySelector('#type_form_minimal').pattern = '[0-9]+\.?[0-9]*|^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$';
        this.popup.querySelector('#type_form_normal').pattern = '[0-9]+\.?[0-9]*|^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$';
        this.popup.querySelector('#type_form_position').pattern = '((([0-9]*)-)?[0-9]+)';
        return this;
    }

    show () {
        if (!this.popup.classList.contains(('active'))) {
            this.popup.classList.add('active');
        }
        return this;
    }

    hide() {
        if (this.popup.classList.contains(('active'))) {
            this.popup.classList.remove('active');
        }
        return this;
    }

    closeFormEvent() {
        this.popup.addEventListener('click', (e) => {
            if (e.target.closest('#close')) {
                e.preventDefault();
                if (!this._isComment) {
                        this.removeForm();
                        this.removeEditMode();
                    } else {
                        this.removeComment();
                    }
            }
        })
    }

    editModeToggle() {
        if (!this.popup.classList.contains('editMode')) {
            this.addEditMode();
        } else if (this.popup.classList.contains('editMode')) {
            this.removeEditMode();
        }

    }

    addEditMode(){
        this.popup.classList.add('editMode');
    }

    removeEditMode(){
        this.popup.classList.remove('editMode');
    }


    deleteEvent() {
        this.popup.addEventListener('click', (e) => {
            if (e.target.closest('.delete')) {
                e.preventDefault();
                let isDeleted = confirm('Вы реально хотите удалить это ?')

               if (isDeleted) {
                   this._fetch.deleteContentCell(e.target);
               }
            }
        })
    }

    submitEvent(){
        this.popup.addEventListener('submit', (e) => {
                e.preventDefault();
        })
    }

    addEventDropDownForPopup() {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        this.popup.addEventListener('mousedown', dragMouseDown.bind(this))

        function dragMouseDown(e)  {
            if (e.target.id === "popup-block"){
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag.bind(this);
            }
        }

        function elementDrag(e) {
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            this.popup.style.top = (this.popup.offsetTop - pos2) + "px";
            this.popup.style.left = (this.popup.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup   = null;
            document.onmousemove = null;
        }
    }


    createStat(data){
        Highcharts.chart('contentForm', {
            chart: {
                height: 300,
                width: 1000,
                type: 'line'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            xAxis: {
                categories: data.planed
            },
            tooltip: {
                shared: true,
                crosshairs: true
            },
            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            },
            plotOptions: {
                series: {
                    allowPointSelect: true
                }
            },
            series: data.dataCells,
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            },
        });
        this.show();
    }
}

export {Form};