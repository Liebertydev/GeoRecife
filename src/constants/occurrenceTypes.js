const OCCURRENCE_TYPES = [
    { value: 'crime',      label: 'Crimes' },
    { value: 'transito',   label: 'Trânsito' },
    { value: 'buraco',     label: 'Buraco na via' },
    { value: 'alagamento', label: 'Alagamento' },
    { value: 'iluminacao', label: 'Problema de iluminação' },
    { value: 'entulho',    label: 'Entulho / descarte irregular' },
    { value: 'outro',      label: 'Outro' },
];

const OCCURRENCE_TYPE_VALUES = OCCURRENCE_TYPES.map(t => t.value);

module.exports = { OCCURRENCE_TYPES, OCCURRENCE_TYPE_VALUES };
