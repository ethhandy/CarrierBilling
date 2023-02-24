# Carrier Billing Script

## Business Context

I work with a group of e-commerce consultants who help e-commerce businesses (Shopify, etc.) ship their packages to customers cheaper, faster, etc. Our primary revenue model is to aggregate customers together, negotiate shipping rates with major carriers (think FedEx, UPS, DHL, etc.) and then resell those rates to our customers. They get a cheaper shipping rates by joining our aggregated group, and we make money by reselling these rates slightly higher than we buy them for.

## Project

Input:
Each week, one of our partner carriers sends us an aggregated billing file. The file is an `.xlsx` Excel file.

The output:

- A `transaction-report_all-accounts.csv` which will include all of the original data and lots of additional data.

We are going to focus on the transaction-report for now, but in the future we're going to create the following exports as well:

- `shipment-report_customer-name.csv` for each individual account. In the example file I'm giving you, there will be 4 accounts but there could be 100+.
- `YY-MM-DD-invoice.csv` which I will use to upload to Stripe to create invoices.

Explaining the input file:

- The input file has 29 columns. See [headers.js](https://github.com/larsonlaidlaw/carrier-billing/blob/main/headers.js) for more information.
- Weights on the input file are in pounds. Small Parcel and USPS First Class use ounces as the unit of measurement in the pricing objects. Everything else uses lbs.
- There are 16 ounces (oz) in a lb.
- "Cost Center" is where you find the customer
- "Billed Service" will be one of the following:
  - Parcel
  - Small Parcel
  - Priority
  - First Class Mail
  - Non Qualifying Over 1lb
  - Non Qualifying Under 1lb

## Step 1 - Calculate DIM Weights and Bill Weights

Calculate DIM weights and Bill Weights for each row. At the end of this step, you should have 9 additional columns for the transaction-report that were not provided in the input:

- roundedWtLbs
- roundedWtOz
- dimWt166
- dimWt196
- billWt166
- billWt196 (This should match column F, "Billed Weight" since our cost is at a 196 DIM divisor.)
- uspsBillWt
- cubicVolume
- cubicSize

```
function calcDimWeights(row) {
 const { height, length, width } = row

 const cubicVolume = length * height * width
 const dimWt166 = Math.ceil(cubicVolume / 166)
 const dimWt196 = Math.ceil(cubicVolume / 196)

 row.cubicVolume = cubicVolume
 row.dimWt166 = dimWt166
 row.dimWt196 = dimWt196
}
```

```
function calcBillWeights(row) {
 const { billedService, actualWeight, billedWeight, cubicVolume, dimWt166, dimWt196 } = row
 const cubicSize = Math.ceil((cubicVolume / 1728) * 10) / 10
 const roundedWtLbs = Math.ceil(actualWeight)
 let roundedWtOz = Math.ceil(actualWeight * 16)

 // We pass on the billedWeight to all services and then modify it only for certain Billed Services

 row.roundedWtLbs = roundedWtLbs
 row.roundedWtOz = roundedWtOz
 row.billWt166 = billedWeight
 row.billWt196 = billedWeight
 row.billWtUSPS = billedWeight
 row.cubicSize = cubicSize

 if (billedService === "Parcel") {

   const billWt166 = roundedWtLbs > dimWt166 ? roundedWtLbs : dimWt166
   const billWt196 = roundedWtLbs > dimWt196 ? roundedWtLbs : dimWt196
   const billWtUSPS = cubicSize > 1 ? billWt166 : roundedWtLbs

   row.billWt166 = billWt166
   row.billWt196 = billWt196
   row.billWtUSPS = billWtUSPS
 }

 if (billedService === "Small Parcel") {
   if (roundedWtOz === 16) {
     roundedWtOz = 15.99
   }

   row.billWt166 = roundedWtOz
   row.billWt196 = roundedWtOz
   row.billWtUSPS = roundedWtOz
 }
}
```

> ### Business Context
>
> You don't necessarily need to understand and can just use the helper functions above. However, I
> think its useful if you have some context.
>
> Shipping rates are determined by a combination of weights and zones. So for example, if you were
> to ship a 15 lb item from California to New York (Zone 8), you can look the rate up in the JSON
> file you created yesterday with `carrier[service][15][8]`.
>
> Some notes on shipping weights:
>
> - Anything over 1 lb is billed by either weight or dimensional weight
> - You always round up to the nearest integer. 3.2 lbs is 4 lbs.
> - Anything under a lb is measured in ounces (oz)
> - Anything between 15 and 15.99 oz gets rounded to 15.99, not 16
>
> However, shipping carriers also charge more for large items even if they are not heavy (If they
> are over 1 lb). For this reason, almost every carrier has the concept of a Dimensional Weight. The
> Dimensional Weight is calculated by taking the cubic size of an item `(length * height * width)` and dividing it by a DIM divisor. We are calculating for DIM Divisors of both 166 and 196.
>
> The `billWeight` is then whatever is greater between the `actualWeight` and the `dimWeight`.
>
> There are some exceptions:
>
> - We only care about the dimWeight when an item is above 1 lb, or 16 oz. In the file should always be identified as Billed Service === Parcels
> - When we calculate the USPS rate, the dimWeight only comes into effect when the cubicSize is greater than 1. cubicSize is calculated by dividing cubicVolume by 1728. (1728 is 1 cubic foot, or 12 in _ 12in _ 12in)

## Step 2: Calculate Customer Rates

Each customer is priced differently. There are 2 ways to calculate a customer rate.

1.  Use column J, Package Charge, and multiply it by a markup factor.

Example:

```
const customerPackageCharge = packageCharge * markupFactor
```

2.  Use `billWt` and `zone` to lookup the price in a json rate object. You built these objects yesterday.

Example:

```
customer-name.json[parcel][billwt][zone]
```

See Accounts.js for details and below for account examples. See below for Account Object explanations.

1.  pricingMethod - Are we going to markup from "Package Charge" or "lookup" in a rateObject
2.  billWtMethod - Which billWt are we going to use? 196 or 166?
3.  markups:
    - Mostly for markup customers-- what is the markupFactor. However, we only have rates up to 15 lbs in the rateObjects, so lookup customers can also have fallback markup factors.
    - fuelMarkups: A fuel surcharge is a factor of the customerPackageCharge. Note: the fuel should be calculated by the customerPackageCharge, not our cost. Some customers have an 8% fuel surcharge cap. Others go on the publicized market rate on the website. Create a marketFuelSurcharge object that includes a number (use .1025 for now) and an expiration date. If todays date is later than the the expiration date string, throw an error and tell the user to update the marketFuelSurcharge object.
4.  lookupObject: This is what you helped me with yesterday
5.  das: most rows will have 0 DAS fees. Leave those ones alone. Anything with a number in there, replace with the account das fee (for many its the same as our cost, but some we charge $1.70 instead of $1.25.

At the end of this step, we should have 8 more columns for the transaction report:

- customerBillWt
- customerPackageCharge
- customer Fuel
- customer Das
- packageMargin
- fuelMargin
- dasMargin
- totalMargin (add packageMargin + fuelMargin + dasMargin)

## Step 3: Calculate USPS Rates.

### I will use this to evaluate savings of the carrier to the baseline, which in the United States is the USPS (United States Postal Service.)

use the uspsBillWt to look these up.

- uspsFCPSrate (usps.json[fcps-cpp][uspsbillwt][zone])
- uspsPriorityRate (usps.json[priority-cpp][uspsbillwt][zone])
- uspsParcelSelectRate (usps.json[parcel-select][uspsbillwt][zone]) - I've attached a new CSV to this repo

At the end of this step, you should have 3 more columns, seen above.

# Notes

- I still have multiple people working on this. I will eventually settle on one person who can help me continue to automate different parts of my business. Most things will be very similar to this, but I will eventually need help on the marketing website and potentially on our shipping web app.
- Please don't spend more than 8 hours on this. If you reach 8 hours, stop and lets see how far you made it
- Please do not create a pull request. Create a public repo and email it to me.
- There is lots of complex business logic here. Feel free to ask any questions.
- Code is written to be helpful but don't feel the need to use anything. If the code was great, I wouldn't need help.
- the JSON rate objects, csv rate files, and .xlsx file should not be tracked in Git

Extra Credit:

- Create a loom and walk me through parts of the code
- Create a shipping report csv for each customer. Do not add include any of the newly calculated colums on their own. Replace Bill Wt, DIM Rules Applied, Package Charge, Fuel Charge, DAS, and MISC fees with the newly calculated numbers. The customer should never see our cost, markup factors, or margins.
