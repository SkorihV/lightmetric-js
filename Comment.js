import {HtmlTemplates} from "./HtmlTemplates.js";


class Comment {
    _commentUserName    = null;
    _commentDate        = null;
    _commentContent     = null;
    _mainCell           = null;
    _view               = null;

    constructor() {
        this._view = new HtmlTemplates();
    }

    get view() {
        return this._view;
    }
    get commentUser() {
        if (this._commentUserName) {
            return this._commentUserName;
        }
        return this._commentUserName = this._mainCell.querySelector('.u-name');
    }

    set commentUser(name) {
        if (this._commentUserName === null) {
            this.commentUser;
        }
        this._commentUserName.innerHTML = name;
        return this;
    }

    get commentDate() {
        if (this._commentDate) {
            return this._commentDate;
        }
        return this._commentDate = this._mainCell.querySelector('.u-update');
    }

    set commentDate(date) {
        if (this._commentDate === null) {
            this.commentDate;
        }
        this._commentDate.innerHTML = date;
        return this;
    }

    get commentText() {
        if (this._commentContent) {
            return this._commentContent;
        }
        this._commentContent = this._mainCell.querySelector('.comment-data');

        return this._commentContent;

    }

    set commentText(text) {
        this.commentText.innerHTML = this.progressCommentUrl(text);
        return this;
    }

    updateComment(data) {
        if (data.data.comment) {
            if (!this.isComment()) {
                this.addComment(data);
            }
            this.commentText = data.data.comment;
            this.commentDate = this.currentTime();
            this.commentUser = data.userName;

        } else {
            if (this.isComment()) {
                this.removeComment();
            }
        }
    }

    initComment(){
        if (this.isComment()) {
            this.commentDate;
            this.commentUser
            this.commentText = this.commentText.innerHTML;
        }
        return this;
    }

    isComment() {
        return  Boolean(this._mainCell.querySelector('.comment-box'));
    }

    addComment(data) {
        if(!this.isComment()) {
            this._mainCell.append(this.view.commentTrigger());
            this._mainCell.append(this.view.commentBox(data))
            this.initComment();
        }
        return this;
    }

    removeComment() {
        this._mainCell.querySelector('.comment-trigger').remove();
        this._mainCell.querySelector('.comment-box').remove();
        this._commentContent    = null;
        this._commentUserName   = null;
        this._commentDate       = null;
        return this;
    }

    currentTime() {
        let date = new Date();
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }

    progressCommentUrl(text) {
        text = text.split(/\n| /);
        text = text.map(item => {
                if(item.includes("http")) {
                    item = `<a href="${item}" target="_blank">ССЫЛКА</a>`
                }

                return item;
            })
            .join(" ");
        return text;
    }
}

export {Comment};