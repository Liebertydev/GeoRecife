const prisma = require('../database/prisma');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const DUMMY_HASH = bcryptjs.hashSync('not-a-real-password', 12);

class Login {
    constructor(body) {
        this.body = body;
        this.user = null;
        this.errors = [];
    }

    async register() {
        this.valida();

        const nome = (this.body.nome || '').trim();
        if (nome.length < 3) {
            this.errors.push('Nome precisa ter pelo menos 3 caracteres.');
        }

        if (this.errors.length > 0) return;

        await this.userExist();

        if (this.errors.length > 0) return;

        const hash = await bcryptjs.hash(this.body.password, 12);

        this.user = await prisma.user.create({
            data: {
                name: this.body.nome,
                email: this.body.email,
                password: hash
            }
        });
    }

    async login() {
        this.valida();

        if (this.errors.length > 0) return;

        const user = await prisma.user.findUnique({
            where: { email: this.body.email }
        });

        const hashToCheck = user ? user.password : DUMMY_HASH;
        const passwordOk = await bcryptjs.compare(this.body.password, hashToCheck);

        if (!user || !passwordOk) {
            this.errors.push('Email ou senha inválidos!');
            this.user = null;
            return;
        }

        this.user = user;
    }

    async userExist() {
        const existing = await prisma.user.findUnique({
            where: { email: this.body.email }
        });

        if (existing) {
            this.errors.push('Não foi possível concluir o cadastro. Verifique os dados informados.');
        }
    }

    valida() {
        this.cleanUp();

        if (!this.body.email || !validator.isEmail(this.body.email)) {
            this.errors.push('E-mail inválido!');
        }

        const password = this.body.password || '';
        if (password.length < 8 || password.length > 128) {
            this.errors.push('Senha deve ter entre 8 e 128 caracteres.');
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
