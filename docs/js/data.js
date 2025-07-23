const witnessFiles = {
  P: 'data/witness-P.xml',
  Y: 'data/witness-Y.xml',
  S: 'data/witness-S.xml',
  LL: 'data/witness-LL.xml'
};

const companionData = {
  '3.1': { commentary: '' },
  '3.2': { commentary: '' },
  '3.3': { commentary: '' },
  '3.4': { commentary: '' },
  '3.5': { commentary: '' },
  '3.6': { commentary: '' },
  '3.7': { commentary: '' },
  '3.8': { commentary: '' },
  '3.9': { commentary: '' },
  '3.10': { commentary: '' },
  '3.11': { commentary: '' },
  '3.12': { commentary: '' },
  '3.13': { commentary: '' },
  '3.14': { commentary: '' },
  '3.15': { commentary: '' },
};

const witnessPageData = {
  //note for these they navigate to n+1 page number
  'P': [
    83, // 3.1
    84, // 3.2
    85, // 3.3
    86, // 3.4
    87, // 3.5
    88, // 3.6
    90, // 3.7
    91, // 3.8
    93, // 3.9
    94, // 3.10
    95, // 3.11 missing 2 lines from the end of 11
    96, // 3.12
    null, // 3.13 this is all we have from this witness
    97, // 3.14
    98  // 3.15
  ],
  'Y': [
    118, // 3.1
    120, // 3.2
    122, // 3.3
    123, // 3.4
    124, // 3.5
    125, // 3.6
    128, // 3.7
    130, // 3.8
    132, // 3.9
    133, // 3.10
    135, // 3.11
    136, // 3.12
    137, // 3.13
    138, // 3.14
    139  // 3.15
  ],
  'S': [
    384, // 3.1
    386, // 3.2
    388, // 3.3
    389, // 3.4
    390, // 3.5
    391, // 3.6
    394, // 3.7 this is the last poem in this witness for our purposes
    null, // 3.8
    null, // 3.9
    null, // 3.10
    null, // 3.11
    null, // 3.12
    null, // 3.13
    null, // 3.14
    null  // 3.15
  ],
  'LL': [
    null, null, null, null, null,
    null, null, null, null, null,
    null, null, null, null, null
  ]
};
