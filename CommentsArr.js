import {HtmlTemplates} from "./HtmlTemplates.js";


class CommentsArr {
    _mainCell           = null;
    _view               = null;
    _commentsText        = [];

    constructor() {
        this._view = new HtmlTemplates();
    }

    get view() {
        return this._view;
    }

    get commentText() {
        this._commentsText = this._mainCell.querySelectorAll('.comment-data');
        return this._commentsText;

    }

    modifiedCommentText() {
        Array.from(this.commentText).forEach(item => {
            item.innerHTML = this.progressCommentUrl(item.innerHTML);
        })
    }

    initComment() {
        if (this.isComment()) {
            this.modifiedCommentText()
        }
    }



    updateComment(data) {

        if (Object.keys(data.data).length > 0) {
                this.removeComment();
                this.addComment(data);
        } else {
            this.removeComment();
        }
        this.initComment();
    }

    isComment() {
        return  Boolean(this._mainCell.querySelector('.comment-box'));
    }

    addComment(data) {
        if(!this.isComment()) {
            this._mainCell.append(this.view.commentTrigger());
            this._mainCell.append(this.view.addCommentItemInBox(data))
        }
        return this;
    }

    removeComment() {
        if (this._mainCell.querySelector('.comment-trigger')) {
            this._mainCell.querySelector('.comment-trigger').remove();
            this._mainCell.querySelector('.comment-box').remove();
        }
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

export {CommentsArr};