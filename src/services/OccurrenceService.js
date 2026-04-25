// src/services/OccurrenceService.js

const prisma = require('../database/prisma');
const validator = require('validator');

class OccurrenceService {
  constructor(body, userId = null) {
    this.body = body;
    this.userId = userId;
    this.errors = [];
    this.occurrence = null;
  }

  // ====================
  // LIMPEZA
  // ====================
  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }

    // Converte lat/lng para float já na limpeza
    this.body.latitude = parseFloat(this.body.latitude);
    this.body.longitude = parseFloat(this.body.longitude);
  }

  // ====================
  // VALIDAÇÃO
  // ====================
  validate() {
    this.cleanUp();

    if (!this.body.type || this.body.type.trim().length < 2) {
      this.errors.push('Tipo da ocorrência é obrigatório.');
    }

    if (isNaN(this.body.latitude) || isNaN(this.body.longitude)) {
      this.errors.push('Coordenadas inválidas. Selecione um local no mapa.');
    }

    if (!this.body.street || this.body.street.trim().length < 2) {
      this.errors.push('Rua é obrigatória.');
    }

    if (!this.body.district || this.body.district.trim().length < 2) {
      this.errors.push('Bairro é obrigatório.');
    }

    if (!this.body.postcode || this.body.postcode.trim().length < 2) {
      this.errors.push('CEP é obrigatório.');
    }
  }

  // ====================
  // CRIAÇÃO
  // ====================
  async create() {
    this.validate();
    if (this.errors.length > 0) return;

    this.occurrence = await prisma.occurrence.create({
      data: {
        title: this.body.title || null,
        description: this.body.description || null,
        latitude: this.body.latitude,
        longitude: this.body.longitude,
        street: this.body.street,
        district: this.body.district,
        city: this.body.city || 'Recife',
        postcode: this.body.postcode,
        placeName: this.body.placeName || null,
        type: this.body.type,
        userId: this.userId || null,
      },
    });
  }

  // ====================
  // ATUALIZAÇÃO
  // ====================
  async update(id) {
    this.validate();
    if (this.errors.length > 0) return;

    this.occurrence = await prisma.occurrence.update({
      where: { id: parseInt(id) },
      data: {
        title: this.body.title || null,
        description: this.body.description || null,
        type: this.body.type,
        street: this.body.street,
        district: this.body.district,
        postcode: this.body.postcode,
        placeName: this.body.placeName || null,
      },
    });
  }


  static async listarTodas() {
    return await prisma.occurrence.findMany();
  }
}

module.exports = OccurrenceService;