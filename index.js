const reader = require('xlsx');
const csvParser = require('@json2csv/node');
const headers = require('./headers');
const accounts = require('./accounts');
const usps = require('./usps.json');
const FILE_NAME = 'data.xlsx';

const { writeFile } = require('fs').promises;

const CarrierBillingService = (function () {
  let lines = [];
  let results = [];

  function calcDimWeights(row) {
    const height = row[headers.heightHeader];
    const width = row[headers.widthHeader];
    const length = row[headers.lengthHeader];

    const cubicVolume = length * height * width;
    const dimWt166 = Math.ceil(cubicVolume / 166);
    const dimWt196 = Math.ceil(cubicVolume / 196);

    row[headers.cubicVolumeHeader] = cubicVolume;
    row[headers.dimWt166Header] = dimWt166;
    row[headers.dimWt196Header] = dimWt196;
    return row;
  }

  function calcBillWeights(row) {
    const billedService = row[headers.billedServiceHeader];
    const actualWeight = row[headers.actualWeightHeader];
    const billedWeight = row[headers.billedWeightHeader];
    const cubicVolume = row[headers.cubicVolumeHeader];
    const dimWt166 = row[headers.dimWt166Header];
    const dimWt196 = row[headers.dimWt196Header];

    const cubicSize = Math.ceil((cubicVolume / 1728) * 10) / 10;
    const roundedWtLbs = Math.ceil(actualWeight);
    let roundedWtOz = Math.ceil(actualWeight * 16);

    row[headers.roundedWtLbsHeader] = roundedWtLbs;
    row[headers.roundedWtOzHeader] = roundedWtOz;
    row[headers.billWt166Header] = billedWeight;
    row[headers.billWt196Header] = billedWeight;
    row[headers.billWtUSPSHeader] = billedWeight;
    row[headers.cubicSizeHeader] = cubicSize;

    if (billedService === 'Parcel') {
      const billWt166 = roundedWtLbs > dimWt166 ? roundedWtLbs : dimWt166;
      const billWt196 = roundedWtLbs > dimWt196 ? roundedWtLbs : dimWt196;
      const billWtUSPS = cubicSize > 1 ? billWt166 : roundedWtLbs;

      row[headers.billWt166Header] = billWt166;
      row[headers.billWt196Header] = billWt196;
      row[headers.billWtUSPSHeader] = billWtUSPS;
    }

    if (billedService === 'Small Parcel') {
      if (roundedWtOz === 16) {
        roundedWtOz = 15.99;
      }

      row[headers.billWt166Header] = roundedWtOz;
      row[headers.billWt196Header] = roundedWtOz;
      row[headers.billWtUSPSHeader] = roundedWtOz;
    }
    return row;
  }

  function calcCustomerInfo(row) {
    const centerName = row[headers.costCenterNameHeader];
    const billMethod = accounts[centerName].billWtMethod;
    const customerBillWt = row[`${billMethod}Header`];

    const markups = accounts[centerName].markups;
    const billedService = row[headers.billedServiceHeader];
    const fuelCharge = row[headers.fuelChargeHeader];
    const fuelSurcharge = accounts[centerName].markups.fuel.fuelSurcharge;

    let markupFactor = 1;
    if (billedService === 'Parcel') {
      markupFactor = markups.parcelMarkup;
    }
    if (billedService === 'Small Parcel') {
      markupFactor = markups.smallParcelMarkup;
    }

    const customerPackageCharge =
      row[headers.packageChargeHeader] * markupFactor;
    const customerFuel = fuelCharge * fuelSurcharge;

    let customerDAS = row[headers.deliveryConfirmationChargeHeader];

    if (customerDAS > 0) {
      customerDAS = accounts[centerName].das;
    }

    row[headers.customerBillWtHeader] = customerBillWt;
    row[headers.customerPackageChargeHeader] = customerPackageCharge;
    row[headers.customerFuelHeader] = customerFuel;
    row[headers.customerDASHeader] = customerDAS;

    return row;
  }

  function calcMargin(row) {
    const packageMargin =
      row[headers.customerPackageChargeHeader] -
      row[headers.packageChargeHeader];

    const fuelMargin =
      row[headers.customerFuelHeader] - row[headers.fuelChargeHeader];

    const dasMargin = row[headers.customerDASHeader] - row[headers.dasHeader];
    const totalMargin = packageMargin + fuelMargin + dasMargin;

    row[headers.packageMarginHeader] = packageMargin;
    row[headers.fuelMarginHeader] = fuelMargin;
    row[headers.dasMarginHeader] = dasMargin;
    row[headers.totalMarginHeader] = totalMargin;

    return row;
  }

  function calcUSPS(row) {
    if (usps['fcps-cpp'][row[headers.billWtUSPSHeader]] === undefined) {
      console.log('header', row[headers.billWtUSPSHeader]);
      console.log({ row });
    }

    const billWt = row[headers.billWtUSPSHeader];
    const zone = row[headers.zoneHeader];

    const uspsFCPSrate = usps['fcps-cpp'][billWt][zone];
    const uspsPriorityRate = usps['priority-cpp'][billWt][zone];
    const uspsParcelSelectRate = usps['parcel-select'][billWt][zone];

    row[headers.uspsFCPSrateHeader] = uspsFCPSrate;
    row[headers.uspsPriorityRateHeader] = uspsPriorityRate;
    row[headers.uspsParcelSelectRateHeader] = uspsParcelSelectRate;
    return row;
  }

  function readXLSX() {
    const file = reader.readFile(FILE_NAME);
    lines = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
  }

  async function writeCSV(fileName, data) {
    await writeFile(fileName, data, 'utf8');
  }

  async function exportToCsv() {
    const parser = new csvParser.AsyncParser();
    const csv = await parser.parse(results).promise();
    await writeCSV('Result.csv', csv);
  }

  function run() {
    results = lines.map((row, index) => {
      row = calcDimWeights(row);
      row = calcBillWeights(row);
      row = calcCustomerInfo(row);
      row = calcMargin(row);
      row = calcUSPS(row);
      console.log({ index });
      return row;
    });
  }

  return {
    init: (fileName) => {
      readXLSX(fileName);
    },
    run: run,
    export: exportToCsv,
  };
})();

CarrierBillingService.init('data.xlsx');
CarrierBillingService.run();
CarrierBillingService.export();
