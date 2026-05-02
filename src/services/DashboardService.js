const prisma = require('../database/prisma');

const dashboardService = {

    async getForType() {
        return await prisma.occurrence.groupBy({
            by: ['type'],
            _count: {
                type: true
            }
        });
    },

    async getForDistrict(tipo) {
        const where = (tipo && typeof tipo === 'string' && tipo !== 'todos')
            ? { type: tipo }
            : {};

        return prisma.occurrence.groupBy({
            by: ['district'],
            where: where,
            _count: {
                district: true
            },
            orderBy: {
                _count: {
                    district: 'desc'
                }
            }
        });
    },

    async getAllOccurrence() {
        return prisma.occurrence.count();
    },

    async getCommonType() {
        const result = await prisma.occurrence.groupBy({
            by: ['type'],
            _count: {
                type: true
            },
            orderBy: {
                _count: {
                    type: 'desc'
                }
            },
            take: 1
        });

        return result[0] || null;
    },

    async getDistrictTop() {
        const result = await prisma.occurrence.groupBy({
            by: ['district'],
            _count: {
                district: true
            },
            orderBy: {
                _count: {
                    district: 'desc'
                }
            },
            take: 1
        });

        return result[0] || null;
    }
}

module.exports = dashboardService;