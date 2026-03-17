const prisma = require('../database/prisma');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

class Login {
    constructor(body) {
        this.body = body;
        this.user = null;
        this.errors = [];
    }

    async register() {
        this.valida();

        if (this.errors.length > 0) return;

        await this.userExist();

        if (this.errors.length > 0) return;

        const salt = bcryptjs.genSaltSync();
        this.body.password = bcryptjs.hashSync(this.body.password, salt);

        this.user = await prisma.user.create({
            data: {
                name: this.body.nome,
                email: this.body.email,
                password: this.body.password
            }
        });
    }

    async login() {
        this.valida();

        if (this.errors.length > 0) return;

        this.user = await prisma.user.findUnique({
            where: { email: this.body.email }
        });

        if (!this.user) {
            this.errors.push('Email ou senha inválidos!');
            return;
        }

        if (!bcryptjs.compareSync(this.body.password, this.user.password)) {
            this.errors.push('Email ou senha inválidos!');
            this.user = null;
            return;
        }


    }

    async userExist() {
        this.user = await prisma.user.findUnique({
            where: { email: this.body.email }
        });

        if (this.user) {
            this.errors.push('Usuário já Cadastrado');
        }
    }

    valida() {
        this.cleanUp();

        if (!this.body.email || !validator.isEmail(this.body.email)) {
            this.errors.push('E-mail inválido!');
        }

        if (this.body.nome && this.body.nome.trim().length < 3) {
            this.errors.push('Nome precisa ter pelo menos 3 caracteres.');
        }

        if (!this.body.password || this.body.password.trim().length < 3 || this.body.password.trim().length > 50) {
            this.errors.push('Senha deve ter entre 3 e 50 caracteres.');
        }
    }

    cleanUp() {
        for (const key in this.body) {
            if (typeof this.body[key] !== 'string') {
                this.body[key] = '';
            }
        }
    }
}

module.exports = Login;
