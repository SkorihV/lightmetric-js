import {Comment} from './Comment.js'


class WeekCell extends Comment {
    _mainCell = null;
    _url      = null;

    constructor(weekCell) {
        super();
        this._mainCell = weekCell;
        this.initComment();
    }

    get url() {
        if (this._url) {
            return this._url;
        }
        return this._url = this._mainCell.dataset.href;
    }

    updateData(data) {
        if (!data) {
            return false;
        }
        this.updateComment(data);
    }

    remove(data) {
        this.updateComment(data);
    }
}

export {WeekCell};