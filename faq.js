class InitFaq {
    constructor() {
        this.init();
    }

    init() {
        let btn = document.querySelector('#spoiler-init');
        let content = document.querySelector('#spoiler-content-init');

        btn.addEventListener('click', (e) => {
            let t = e.target;
            if (content.innerHTML.trim() !== '') {return false;}

            fetch('/lightmetric/faq')
                .then(response => response.text())
                .then(html => {
                    content.innerHTML = html;
                })
                .catch((err) => console.error(err));
        })
    }
}

export {InitFaq};