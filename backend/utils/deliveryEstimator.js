const ORIGIN_PINCODE = "110075";
const ORIGIN_LABEL = "Dwarka Sector 7, New Delhi";

const PIN_PREFIX_STATE = {
  11: "Delhi",
  12: "Haryana",
  13: "Haryana",
  14: "Punjab",
  15: "Punjab",
  16: "Chandigarh",
  17: "Himachal Pradesh",
  18: "Jammu & Kashmir",
  19: "Jammu & Kashmir",
  20: "Uttar Pradesh",
  21: "Uttar Pradesh",
  22: "Uttar Pradesh",
  23: "Uttar Pradesh",
  24: "Uttar Pradesh",
  25: "Uttar Pradesh",
  26: "Uttar Pradesh",
  27: "Uttar Pradesh",
  28: "Uttar Pradesh",
  30: "Rajasthan",
  31: "Rajasthan",
  32: "Rajasthan",
  33: "Rajasthan",
  34: "Rajasthan",
  36: "Gujarat",
  37: "Gujarat",
  38: "Gujarat",
  39: "Gujarat",
  40: "Maharashtra",
  41: "Maharashtra",
  42: "Maharashtra",
  43: "Maharashtra",
  44: "Maharashtra",
  45: "Madhya Pradesh",
  46: "Madhya Pradesh",
  47: "Madhya Pradesh",
  48: "Madhya Pradesh",
  49: "Chhattisgarh",
  50: "Telangana",
  51: "Andhra Pradesh",
  52: "Andhra Pradesh",
  53: "Andhra Pradesh",
  56: "Karnataka",
  57: "Karnataka",
  58: "Karnataka",
  59: "Karnataka",
  60: "Tamil Nadu",
  61: "Tamil Nadu",
  62: "Tamil Nadu",
  63: "Tamil Nadu",
  64: "Tamil Nadu",
  67: "Kerala",
  68: "Kerala",
  69: "Kerala",
  70: "West Bengal",
  71: "West Bengal",
  72: "West Bengal",
  73: "West Bengal",
  74: "West Bengal",
  75: "Odisha",
  76: "Odisha",
  77: "Odisha",
  78: "Assam",
  79: "North East",
  80: "Bihar",
  81: "Bihar",
  82: "Jharkhand",
  83: "Jharkhand",
  84: "Bihar",
  85: "Bihar",
};

const addBusinessDays = (startDate, days) => {
  const result = new Date(startDate);
  let remaining = Math.max(Number(days) || 0, 0);

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0) {
      remaining -= 1;
    }
  }

  return result;
};

const getPincodePrefix = (pincode) => Number(String(pincode).slice(0, 2));

const estimateTransitDays = (pincode) => {
  const prefix = getPincodePrefix(pincode);

  if (String(pincode) === ORIGIN_PINCODE) return 1;
  if (prefix === 11) return 2;
  if ([12, 13, 14, 15, 16, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32, 33, 34].includes(prefix)) return 3;
  if ([36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 80, 81, 82, 83, 84, 85].includes(prefix)) return 4;
  if ([50, 51, 52, 53, 56, 57, 58, 59, 60, 61, 62, 63, 64, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77].includes(prefix)) return 5;
  if ([17, 18, 19, 78, 79].includes(prefix)) return 6;

  return 5;
};

const getProductLeadDays = (product) => {
  const category = String(product?.category || "").toLowerCase();
  if (category.includes("custom") || category.includes("made")) return 2;
  return 1;
};

const normalizeServiceablePincodes = (pincodes = []) =>
  pincodes
    .map((entry) => ({
      ...entry,
      pincode: String(entry?.pincode || "").trim(),
    }))
    .filter((entry) => /^[1-9][0-9]{5}$/.test(entry.pincode));

const getStateForPincode = (pincode) =>
  PIN_PREFIX_STATE[getPincodePrefix(pincode)] || "";

const getProductServiceability = (product, pincode, location = {}) => {
  const rules = normalizeServiceablePincodes(product?.serviceablePincodes || []);

  if (!rules.length) {
    return {
      available: true,
      codAvailable: true,
      productEstimatedDays: null,
      source: "all-india",
    };
  }

  const exactRule = rules.find((rule) => rule.pincode === pincode);
  if (exactRule) {
    return {
      available: true,
      codAvailable: exactRule.codAvailable !== false,
      productEstimatedDays: Number(exactRule.estimatedDays) || null,
      source: "product-pincode-rules",
    };
  }

  const requestState = String(location.state || getStateForPincode(pincode)).trim();
  if (requestState) {
    const stateRule = rules.find(
      (rule) => getStateForPincode(rule.pincode) === requestState
    );

    if (stateRule) {
      return {
        available: true,
        codAvailable: stateRule.codAvailable !== false,
        productEstimatedDays: Number(stateRule.estimatedDays) || null,
        source: "product-state-rule",
      };
    }
  }

  return {
    available: false,
    codAvailable: false,
    productEstimatedDays: null,
    source: "product-pincode-rules",
  };
};

const buildDeliveryEstimate = ({ product, pincode, location }) => {
  const productServiceability = getProductServiceability(product, pincode);
  const productDays = productServiceability.productEstimatedDays;
  const transitDays = productDays || estimateTransitDays(pincode);
  const handlingDays = getProductLeadDays(product);
  const totalDays = transitDays + handlingDays;
  const expectedDate = addBusinessDays(new Date(), totalDays);
  const stateFromPrefix = PIN_PREFIX_STATE[getPincodePrefix(pincode)];

  return {
    origin: {
      pincode: ORIGIN_PINCODE,
      label: ORIGIN_LABEL,
    },
    pincode,
    location: {
      city: location?.city || location?.district || "",
      district: location?.district || "",
      state: location?.state || stateFromPrefix || "",
      area: location?.area || "",
    },
    serviceable: productServiceability.available,
    codAvailable: productServiceability.available && productServiceability.codAvailable,
    estimatedDays: totalDays,
    expectedDeliveryDate: expectedDate.toISOString(),
    source: productServiceability.source,
  };
};

module.exports = {
  ORIGIN_PINCODE,
  ORIGIN_LABEL,
  buildDeliveryEstimate,
};
