const MARKET = 0.05;
module.exports = {
  Basics: {
    pricingMethod: 'lookup',
    billWtMethod: 'billWt166',
    markups: {
      smallParcelMarkup: 1.1,
      parcelMarkup: 1.1,
      fuel: { fuelSurcharge: MARKET, fuelFactor: 'packageCharge' },
    },
    lookupObject: 'basics.json',
    das: 1.7,
  },
  'A shops': {
    pricingMethod: 'markup',
    billWtMethod: 'billWt196',
    markups: {
      smallParcelMarkup: 1.1,
      parcelMarkup: 1.4,
      fuel: { fuelSurcharge: 0.08, fuelFactor: 'packageCharge' },
    },
    lookupObject: undefined,
    das: 1.25,
  },
  Flannel: {
    pricingMethod: 'markup',
    billWtMethod: 'billWt196',
    markups: {
      smallParcelMarkup: 1.075,
      parcelMarkup: 1.525,
      fuel: { fuelSurcharge: 0.08, fuelFactor: 'packageCharge' },
    },
    lookupObject: undefined,
    das: 1.25,
  },
  Sparkles: {
    pricingMethod: 'markup',
    billWtMethod: 'billWt196',
    markups: {
      smallParcelMarkup: 1.075,
      parcelMarkup: 1.5,
      fuel: { fuelSurcharge: 0.08, fuelFactor: 'packageCharge' },
    },
    lookupObject: undefined,
    das: 1.25,
  },
};
