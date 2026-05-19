// src/services/OccurrenceService.js

const prisma = require('../database/prisma');
const {
  OCCURRENCE_TYPE_VALUES,
  OCCURRENCE_TYPES,
} = require('../constants/occurrenceTypes');
// const validator = require('validator');

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
    } else if (!OCCURRENCE_TYPE_VALUES.includes(this.body.type)) {
      this.errors.push('Tipo da ocorrência inválido.');
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


  static async listarTodas(tipos) {
    if (!tipos) {
      return await prisma.occurrence.findMany();
    }

    const tiposArray = tipos.split(',');

    return await prisma.occurrence.findMany({
      where: {
        type: {
          in: tiposArray
        }
      }
    });

  }

  static async listarPaginado(page = 1, filters = {}, limit = 9) {
    const skip = (page - 1) * limit;
    const where = OccurrenceService.buildWhere(filters);
    const orderBy = OccurrenceService.buildOrderBy(filters.sort);

    // Busca um item a mais para detectar se há próxima página
    // sem precisar de uma query de count.
    const rows = await prisma.occurrence.findMany({
      where,
      orderBy,
      skip,
      take: limit + 1,
      include: { user: true },
    });

    const hasMore = rows.length > limit;
    return {
      occurrences: hasMore ? rows.slice(0, limit) : rows,
      hasMore,
    };
  }

  // Conta resumido para a faixa de KPIs do topo da listagem.
  // Respeita os mesmos filtros aplicados na lista, exceto sort (irrelevante).
  static async contarResumo(filters = {}) {
    const where = OccurrenceService.buildWhere(filters);

    const [total, rows, hoje] = await Promise.all([
      prisma.occurrence.count({ where }),
      prisma.occurrence.findMany({ where, select: { type: true } }),
      prisma.occurrence.count({
        where: {
          ...where,
          createdAt: { gte: startOfToday() },
        },
      }),
    ]);

    const severityCount = { critical: 0, warning: 0, info: 0 };
    const typeToSeverity = OCCURRENCE_TYPES.reduce((acc, t) => {
      acc[t.value] = t.severity;
      return acc;
    }, {});

    for (const r of rows) {
      const s = typeToSeverity[r.type] || 'info';
      severityCount[s] += 1;
    }

    return { total, hoje, severityCount };
  }

  static buildWhere(filters = {}) {
    const where = {};

    if (filters.type && OCCURRENCE_TYPE_VALUES.includes(filters.type)) {
      where.type = filters.type;
    }

    if (filters.severity) {
      const types = OCCURRENCE_TYPES
        .filter(t => t.severity === filters.severity)
        .map(t => t.value);
      if (types.length) {
        where.type = where.type
          ? (types.includes(where.type) ? where.type : { in: [] })
          : { in: types };
      }
    }

    const q = (filters.q || '').trim();
    if (q.length >= 2) {
      where.OR = [
        { street:    { contains: q, mode: 'insensitive' } },
        { district:  { contains: q, mode: 'insensitive' } },
        { title:     { contains: q, mode: 'insensitive' } },
        { placeName: { contains: q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  static buildOrderBy(sort) {
    switch (sort) {
      case 'oldest':   return { createdAt: 'asc'  };
      case 'district': return { district:  'asc'  };
      case 'recent':
      default:         return { createdAt: 'desc' };
    }
  }
}



function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = OccurrenceService;