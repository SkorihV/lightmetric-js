class HtmlTemplates {
    constructor() {}

    commentBox(data = null) {
        let comment = document.createElement('div');
        comment.classList.add('comment-box');
        comment.innerHTML = `
                            <div class="u-data">
                                <i class="far fa-user"></i>
                                <div class="u-name">${data.userName}  </div>
                                <i class="far fa-clock"></i>
                                <div class="u-update">${data.data.currentDate}  </div>
                            </div>
                            <div class="comment-data">${data.data.comment}  </div>
                        `;
        return comment;
    }

    addCommentItemInBox(data) {
        let commentBox = document.createElement('div');
        commentBox.classList.add('comment-box');
        for (let key in data.data) {
            let commentItem = document.createElement('div');
                commentItem.classList.add('comment-item');
                commentItem.innerHTML = `
                            <div class="u-data">
                                <i class="far fa-user"></i>
                                <div class="u-name">${data.data[key].userName}  </div>
                                <i class="far fa-clock"></i>
                                <div class="u-update">${data.data[key].planed}  </div>
                            </div>
                            <div class="comment-data">${data.data[key].comment}  </div>
                        `;
            commentBox.append(commentItem);
        }
        return commentBox;
    }

    commentTrigger() {
        let trigger = document.createElement('div');
        trigger.classList.add('comment-trigger');

        let i = document.createElement('i');
        i.className = "fas fa-comment";
        trigger.append(i);

        return trigger;
    }

    content() {
        let content = document.createElement('div');
        content.classList.add('content-cell');
        return content;
    }

    value(valueData = null) {
        let value = document.createElement('div');
        value.classList.add('value');

        if(valueData) {
            value.innerHTML = valueData;
        }
        return value;
    }

    singleStatTrigger() {
        let div = document.createElement('div');
        div.className = "show-single-stat-toggle";

        let i = document.createElement('i');
        i.className = "fas fa-signal";

        div.appendChild(i);

        return div;
    }

    toggleSlideForGroup(){

        let div = document.createElement('div');
        div.className = 'toggle-slide-for-group';
        div.innerHTML = `
                        <i class="fas fa-sign-out-alt open-group"></i>
                        <i class="fas fa-sign-in-alt close-group"></i>
                         `;
        return div;
    }

    cellType (data) {
        let td = document.createElement('td');
        td.className = `metric-${data.typeForm} working-cell gray-color`;
        td.setAttribute('data-type', data.typeForm);


        if (data.data.formula && data.data.formula !== null) {
            td.setAttribute('data-formula', data.data.formula);
        }
        td.setAttribute('data-href', `/lightmetric/type/form?type_id=${data.data.id}`);

        if (data.data.colorRow) {
            td.style.backgroundColor = data.data.colorRow;
        }

        let divCheckbox = document.createElement('div');
        divCheckbox.className = 'checkbox-for-stat';
        divCheckbox.innerHTML = '<input type="checkbox">';

        td.appendChild(divCheckbox);

        let divSystem = document.createElement('div');
        divSystem.classList.add('system-data');
        divSystem.innerHTML += `<div class="formula">${data.data.formula}</div>`;

        td.innerHTML += `
                            <div class="content-cell">
                                ${data.data.name}
                            </div>
                        `;

        td.appendChild(divSystem);

        if(data.data.comment) {
            td.append(this.commentTrigger());
            td.append(this.commentBox(data))
        }

        td.append(this.singleStatTrigger());

        return td;
    }

    cell (week = null, metricId = null, data = null ) {
        let td = document.createElement('td');

        if (data !== null && data.typeForm !== undefined) {
            td.classList.add(`metric-${data.typeForm}`);
            td.setAttribute('data-type', data.typeForm);
        }

        if (data.data.colorRow) {
            td.style.backgroundColor = data.data.colorRow;
        }

        td.classList.add(`working-cell`);
        td.setAttribute('data-planed', week);
        td.setAttribute('data-typeId', metricId);

        if (data !== null && data.data.formula !== undefined) {
            td.setAttribute('data-formula', data.data.formula);
        }
        td.setAttribute('data-href', `/lightmetric/weekcell/form?type_id=${metricId}&planed_at=${week}`);
        td.setAttribute('data-true-value', data.data.value)

        let div = document.createElement('div');
        div.classList.add('content-cell');
        let value = document.createElement('div');
        value.classList.add('value');


        div.appendChild(value);
        td.appendChild(div);

        return td;
    }

    cellVoid(week = null, metricId = null){
        if (!week && !metricId) {
            return null;
        }

        let td = document.createElement('td');

        td.classList.add(`working-cell`);
        td.classList.add(`metric-cell`);
        td.setAttribute('data-planed', week);
        td.setAttribute('data-typeId', metricId);
        td.setAttribute('data-href', `/lightmetric/weekcell/form?type_id=${metricId}&planed_at=${week}`);

        let div = document.createElement('div');
        let value = document.createElement('div');
        div.classList.add('content-cell');
        value.classList.add('value');

        div.append(value);
        td.append(div);

        return td;
    }

    row(data) {
        let tr = document.createElement('tr');
        let normal = this.normal(data);
        let minimal = this.minimal(data);

        tr.classList.add(`tr-body`);
        tr.setAttribute('data-around', '0');
        tr.setAttribute('data-type-category-id', data.data.typeCategory.id);
        tr.setAttribute('data-metric-position', data.data.position);


        if (data.data.is_hide) {
            tr.classList.add(`is-hide`);
        }

        if (data.data.is_group) {
            tr.classList.add(`is_group`);
        }

        tr.setAttribute('data-metric-id',data.data.id);

        if (data.data.unit) {
            tr.setAttribute('data-unit',data.data.unit);
        }

        let td = document.createElement('td');
        td.className = 'metric-position-cell';
        td.innerHTML =  `${data.data.typeCategory.id}-${data.data.position}`;

        tr.append(td);
        tr.append(this.cellType(data));

        tr.append(minimal);
        tr.append(normal);

        return  tr;
    }

    rowVoid() {
        let tr = document.createElement('tr');
        tr.classList.add(`tr-body`);
        tr.classList.add(`tr-void`);

        return  tr;
    }

    unit(data = '', isAddContent = false) {
        let unit =  document.createElement('div');
        unit.classList.add('unit');

        if (data && isAddContent) {
            unit.innerHTML = data.data.unit;
        }
        return unit;
    }

    minimal(data) {
        let td = document.createElement('td');
        td.className = 'gray-color minimal-cell';

        if (data.data.colorRow) {
            td.style.backgroundColor = data.data.colorRow;
        }

        let content = this.content();
        let value   = this.value(data.data.minimal);
        let unit = null;

        if (data.data.minimal) {
            unit    = this.unit(data, true);
        } else {
            unit    = this.unit(data);

        }

        content.append(value);
        content.append(unit);
        td.append(content);

        return td;
    }

    normal(data) {
        let td = document.createElement('td');
        td.className = 'gray-color normal-cell';

        if (data.data.colorRow) {
            td.style.backgroundColor = data.data.colorRow;
        }

        let content = this.content();
        let value   = this.value(data.data.normal);
        let unit = null;

        if (data.data.normal) {
            unit    = this.unit(data, true);
        } else {
            unit    = this.unit(data);
        }

        content.append(value);
        content.append(unit);
        td.append(content);

        return td;
    }

    /*импут для встроенной формы в ячейку метрики*/
    boxForInputCell() {
        let box = document.createElement('div');
        box.classList.add('box-for-input-cell');
        return box;
    }

    /*Блок для всплывающей подсказки*/
    boxForData (data) {
        let box = document.createElement('div');
        let average = document.createElement('div');
        let prev = document.createElement('div');
        let next = document.createElement('div');
        let years = document.createElement('div');
        let name = document.createElement('div');

        box.classList.add('box-for-data');

        name.classList.add('metricName');
        name.innerHTML = data.metricName;

        box.append(name);

        if (data.witchPrev !== '' && data.witchPrev !== null  && data.witchPrev !== undefined && !isNaN(data.witchPrev)) {
            prev.innerHTML = `Разница с предыдущей неделей: ${parseFloat(data.witchPrev).toFixed(2)}`;
            box.appendChild(prev)
        }
        if (data.average) {
            average.innerHTML = `Среднее значение: ${data.average}`;
            box.appendChild(average);
        }

        if (data.witchNext !== '' && data.witchNext !== null  && data.witchNext !== undefined && !isNaN(data.witchNext)) {
            next.innerHTML = `Разница со следующей неделей: ${parseFloat(data.witchNext).toFixed(2)}`;
            box.appendChild(next);
        }

        if (Object.keys(data.averageYearsData).length !== 0) {
            years.classList.add('averageYearsWrapper');
            years.innerHTML += `<div class="averageYearsTitle">Среднее значение метрики по годам:</div>`;
            for (let key in data.averageYearsData) {
                years.innerHTML += `<div class="averageYear">${key}г - ${data.averageYearsData[key]['averageValue']}</div>`;
            }
            box.appendChild(years);
        }

        if (data.average && !isNaN(data.average)) {
            return box
        }
        return false;
    }

    addNewRow(data, timeArr) {
        let row = this.row(data);
        timeArr.forEach((item) => {
            row.append(this.cellVoid(item, data.data.id));
        })

        return row;
    }

    getNotifyOptions() {
        return {
            placement: {
                from: 'top',
                align: 'center',
            },
            offset: {
                y: -4
            },
            delay: 2000,
            animate: {
                enter: 'animated fadeInUp',
                exit: 'animated fadeOutDown',
            },
            hideAnimation: 'slideUp'
        };
    }

    getFormulaBlock(metricId) {

        let div = document.createElement('div');
        div.className = 'formula_block';
        div.dataset.metricId = metricId;
        let form = document.createElement('form');
        form.action = '#';

        let input = document.createElement('input');
        input.className = 'formula_input';
        input.id = 'formula_input';
        input.name = 'formula_input';
        input.autocomplete = "off"

        let btnSuccess = `<button data-metric-id=${metricId} type="submit" id="formula_success" class="btn btn-success edit-mod-toggle"><i class="far fa-check-square"></i></button>`;
        form.append(input);
        form.innerHTML += btnSuccess;
        div.append(form);

        return div;
    }

    createPromptForAliasInput(typeName){
        let div = document.createElement('div');
        div.id = 'prompt-alias-name';
        div.innerHTML = typeName;

        return div;
    }

    trueValuePrompt(value) {
        let div = document.createElement('div');
        div.classList = 'true-value-prompt';
        div.innerHTML = value;
        return div;
    }
}

export {HtmlTemplates};