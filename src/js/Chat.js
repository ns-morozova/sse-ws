import Modal from "./Modal";

export default class Chat {
    constructor(container) {
        this.container = container;
        this.ws;
        this.user = {};
        //this.url = 'ws://127.0.0.1:3000';
        this.url = 'wss://sse-ws-backend-21jk.onrender.com';
        this.inpSend = document.querySelector('.field-send');
    }

    async initCont(resolve) {

        try {
            const userName = resolve.name;
            const options = { method: 'POST', body: JSON.stringify({ name: userName }), headers: { 'Content-Type': 'application/json' } };

            //"Content-Type", "application/json"
            const response = await fetch('https://sse-ws-backend-21jk.onrender.com/new-user', options);

            if (!response.ok) throw new Error('Статус: ' + response.status);

            const data = await response.json();
            this.user = data.user;

            this.ws = new WebSocket(this.url + `?login=${this.user.name}`);
            this.ws.addEventListener('open', (event) => {
                console.log('ws open');
                console.log(event);
            });

            this.ws.addEventListener('message', ((event) => {
                console.log(event);
                const data = JSON.parse(event.data);

                const contChat = document.querySelector('.messages');

                if(!('type' in data)) return;
                
                if (data.type === 'send') {
                    let elem = document.createElement('div');
                    elem.classList.add('message');

                    if (data.user.name == this.user.name) {
                        elem.classList.add('message-right');
                    }

                    elem.innerHTML = `
                        <div class="mess-cont${(data.user.name == this.user.name) ? ' message-right':''}">
                            <div class="info-mess">
                                <span class="author-mess">${(data.user.name == this.user.name ? 'you' : data.user.name)}</span>
                                <span class="time-mess">${data.date}</span>
                            </div>
                            <span class="text-mess">${data.message}</span>
                        </div>
                            `;
                    contChat.append(elem);
                }

                if (data.type === 'chat') {
                    for (let chat of data.chat) {
                        let elemChat = document.createElement('div');
                        elemChat.classList.add('message');

                        if (chat.user.name == this.user.name) {
                            elemChat.classList.add('message-right');
                        }
                        
                        let name = (chat.user.name == this.user.name ? 'you' : chat.user.name);
                        elemChat.innerHTML = `
                            <div class="mess-cont${(chat.user.name == this.user.name) ? ' message-right' : ''}">
                                <div class="info-mess">
                                    <span class="author-mess">${name}</span>
                                    <span class="time-mess">${chat.date}</span>
                                </div>
                                <span class="text-mess">${chat.message}</span>
                            </div>
                                `;
                        contChat.append(elemChat);

                    }

                }

                if (data.type === 'users') {
                    const users = document.querySelector('.users');
                    users.innerHTML = '';

                    for (let user of data.users) {
                        if (user.name === this.user.name) continue;

                        let elem = document.createElement('div');
                        elem.classList.add('user');
                        elem.textContent = user.name;
                        elem.id = user.id;
                        users.append(elem);
                    }

                    let elem = document.createElement('div');
                    elem.classList.add('user');
                    elem.textContent = 'you';
                    elem.id = this.user.id;
                    users.append(elem);

                }

            }).bind(this));

            this.ws.addEventListener('close', () => {
                console.log('ws close');
            });

            this.ws.addEventListener('error', () => {
                console.log('ws eroor');
            });


            document.querySelector('.btn-send').addEventListener('click', (event) => {
                event.preventDefault();
                const val = this.inpSend.value;
                if (!val) return;
                const date = new Date();

                const opt1 = {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                };

                let opt2 = {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                };

                const strData = date.toLocaleString("ru", opt2) + ' ' + date.toLocaleString("ru", opt1);

                this.ws.send(JSON.stringify({ type: 'send', user: this.user, message: val, date: strData }));
                this.inpSend.value = '';
            });


            window.addEventListener('beforeunload', () => {
                this.ws.send(JSON.stringify({ type: 'exit', user: this.user }));
            })

        } catch (err) {
            console.log(err);
        }

    }

    init() {
        const modal = new Modal();
        const promise = modal.show();

        promise.then((resolve) => {
            document.querySelector('.cont-chat').classList.remove('hidden');
            this.initCont(resolve);
        });

    }

}