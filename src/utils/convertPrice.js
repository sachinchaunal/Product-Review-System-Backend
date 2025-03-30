const convertPrice = (priceString) => {
  // Remove the currency symbol and commas
  const cleanedString = priceString.replace(/[₹,]/g, "");
  // Convert the cleaned string to a number
  const priceNumber = parseFloat(cleanedString);
  return priceNumber;
};

export default convertPrice;
