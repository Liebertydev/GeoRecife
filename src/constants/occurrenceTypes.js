const OCCURRENCE_TYPES = [
    { value: 'crime',      label: 'Crimes',                       severity: 'critical' },
    { value: 'transito',   label: 'Trânsito',                     severity: 'warning'  },
    { value: 'buraco',     label: 'Buraco na via',                severity: 'warning'  },
    { value: 'alagamento', label: 'Alagamento',                   severity: 'critical' },
    { value: 'iluminacao', label: 'Problema de iluminação',       severity: 'info'     },
    { value: 'entulho',    label: 'Entulho / descarte irregular', severity: 'info'     },
    { value: 'outro',      label: 'Outro',                        severity: 'info'     },
];

const OCCURRENCE_TYPE_VALUES = OCCURRENCE_TYPES.map(t => t.value);

const OCCURRENCE_SEVERITIES = [
    { value: 'critical', label: 'Crítica' },
    { value: 'warning',  label: 'Aviso'   },
    { value: 'info',     label: 'Info'    },
];

const SEVERITY_BY_TYPE = OCCURRENCE_TYPES.reduce((acc, t) => {
    acc[t.value] = t.severity;
    return acc;
}, {});

const LABEL_BY_TYPE = OCCURRENCE_TYPES.reduce((acc, t) => {
    acc[t.value] = t.label;
    return acc;
}, {});

function severityOf(type) {
    return SEVERITY_BY_TYPE[type] || 'info';
}

function labelOfType(type) {
    return LABEL_BY_TYPE[type] || type;
}

module.exports = {
    OCCURRENCE_TYPES,
    OCCURRENCE_TYPE_VALUES,
    OCCURRENCE_SEVERITIES,
    SEVERITY_BY_TYPE,
    severityOf,
    labelOfType,
};
