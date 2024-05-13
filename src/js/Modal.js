
export default class Modal {
    constructor() {
        this.form = document.createElement('div');
        this.form.classList.add('cont-author');
        this.promise = null;

        this.form.innerHTML = `
            <div class="form-author">
                <span class="form-head">Выберите псевдоним</span>
                <input type="text" class="inp-nick" name="nickname">
                <button class="btn-cont" type="button">Продолжить</button>
            </div>
        `;

        this.form.querySelector('.btn-cont').addEventListener('click', this.onClickCont.bind(this));
        this.form.classList.add('open');
        document.body.append(this.form);
    }

    async show() {
        return new Promise((resolve) => {
            this.form.addEventListener('close', (event) => {
                resolve({ name: event.detail });
            });
        });
    }

    close(name) {
        const event = new CustomEvent('close', { 'bubbles': true, 'detail': name });
        this.form.dispatchEvent(event);
        this.form.remove();
    }

    onClickCancel(event) {
        event.preventDefault();
        this.close();
    }

    onClickCont(event) {
        event.preventDefault();
        const name = this.form.querySelector('[name="nickname"]').value;
        if (!name) return;
        this.close(name);
    }

}