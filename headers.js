const carrierBOLHeader = 'Carrier BOL';
const packageIdHeader = 'Package Id';
const trackingIdHeader = 'Tracking ID';
const processedDateTimeHeader = 'Processed Date/Time';
const actualWeightHeader = 'Actual Weight';
const billedWeightHeader = 'Billed Weight';
const billedServiceHeader = 'Billed Service';
const zipHeader = 'Zip';
const zoneHeader = 'Zone';
const packageChargeHeader = 'Package Charge';
const deliveryConfirmationChargeHeader = 'Delivery Confirmation Charge';
const fuelChargeHeader = 'Fuel Charge';
const miscSurchargeHeader = 'MISC Surcharge';
// const carrierDimSurchargeHeader = 'Carrier DIM Surcharge';
const osmDimSurchargeHeader = 'OSM DIM Surcharge';
const totalChargeHeader = 'Total Charge';
const heightHeader = 'Height';
const lengthHeader = 'Length';
const widthHeader = 'Width';
const costCenterNameHeader = 'Cost Center Name';
const dimRulesAppliedHeader = 'DIM Rules Applied';
const relabelFeeHeader = 'Relabel Fee';
const dasHeader = 'Delivery Area Surcharge (DAS)';
const ocrHeader = 'OCR Fee';
const peakHeader = 'Peak Season Surcharge';
const nonstandardLengthFee22Header = 'Nonstandard Length Fee 22 in';
const nonstandardLengthFee30Header = 'Nonstandard Length Fee 30 in';
const nonstandardLengthFee2cuHeader = 'Nonstandard Length Fee 2 cu';
const dimensionNoncomplianceHeader = 'Dimension Noncompliance';
const irregularShapeChargeHeader = 'Irregular Shape Charge';
const cubicVolumeHeader = 'Cubic Volume';
const dimWt166Header = 'Dim Wt166';
const dimWt196Header = 'Dim Wt196';
const roundedWtLbsHeader = 'Rounded WtLbs';
const roundedWtOzHeader = 'Rounded WtOz';
const billWt166Header = 'Billed Weight166';
const billWt196Header = 'Billed Weight196';
const billWtUSPSHeader = 'Billed WeightUSPS';
const cubicSizeHeader = 'Cubic Size';
const customerBillWtHeader = 'Customer BillWt';
const customerPackageChargeHeader = 'Customer PackageCharge';
const customerFuelHeader = 'Customer Fuel';
const customerDASHeader = 'Customer DAS';
const packageMarginHeader = 'Package Margin';
const fuelMarginHeader = 'Fuel Margin';
const dasMarginHeader = 'DAS Margin';
const totalMarginHeader = 'Total Margin';
const uspsFCPSrateHeader = 'USPS FCPS Rate';
const uspsPriorityRateHeader = 'USPS Priority Rate';
const uspsParcelSelectRateHeader = 'USPS Parcel Select Rate';

module.exports = {
  carrierBOLHeader,
  packageIdHeader,
  trackingIdHeader,
  processedDateTimeHeader,
  actualWeightHeader,
  billedWeightHeader,
  billedServiceHeader,
  zipHeader,
  zoneHeader,
  packageChargeHeader,
  deliveryConfirmationChargeHeader,
  fuelChargeHeader,
  miscSurchargeHeader,
  osmDimSurchargeHeader,
  totalChargeHeader,
  heightHeader,
  lengthHeader,
  widthHeader,
  costCenterNameHeader,
  dimRulesAppliedHeader,
  relabelFeeHeader,
  dasHeader,
  ocrHeader,
  peakHeader,
  nonstandardLengthFee22Header,
  nonstandardLengthFee30Header,
  nonstandardLengthFee2cuHeader,
  dimensionNoncomplianceHeader,
  irregularShapeChargeHeader,
  cubicVolumeHeader,
  dimWt166Header,
  dimWt196Header,
  roundedWtLbsHeader,
  roundedWtOzHeader,
  billWt166Header,
  billWt196Header,
  billWtUSPSHeader,
  cubicSizeHeader,
  customerBillWtHeader,
  customerPackageChargeHeader,
  customerFuelHeader,
  customerDASHeader,
  packageMarginHeader,
  fuelMarginHeader,
  dasMarginHeader,
  totalMarginHeader,
  uspsFCPSrateHeader,
  uspsPriorityRateHeader,
  uspsParcelSelectRateHeader,
};

// (packageCharge + deliveryConfirmationCharge + fuelSurcharge + miscSurcharge + carrierDIMSurcharge) === totalCharge
// (relabelFee + dasSurcharge + ocrFee + peakSurcharge + nsl22fee + nsl30fee + nsl2cufee + dimNoncompliance + irregularShapeCharge) === totalCharge
