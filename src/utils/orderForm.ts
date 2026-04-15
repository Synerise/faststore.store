export const orderFormId = (): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const orderFormRaw = localStorage.getItem("orderform");

    if (!orderFormRaw) {
      return undefined;
    }

    const orderForm = JSON.parse(orderFormRaw);

    return orderForm?.id;
  } catch (error) {
    console.error("[orderFormId] Error parsing orderForm:", error);
    return undefined;
  }
};

