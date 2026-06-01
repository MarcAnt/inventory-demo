import { getCurrentCurrency } from "./queries";
import { useState } from "react";


export function useHandleCurrency() {
    const [shouldCalculate, setShouldCalculate] = useState(false);
  const { data: currentCurrency } = getCurrentCurrency();

  const oficialBs = currentCurrency ? currentCurrency[0].promedio : 0;
  const paraleloBs = currentCurrency ? currentCurrency[1].promedio : 0;

  const formatedOficialBs = oficialBs.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
  });
  const formatedParaleloBs = paraleloBs.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
  });

  const handleCurrency = (price: number) => {
    if (shouldCalculate && currentCurrency) {
        const priceInBs = price * oficialBs;
        return priceInBs.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        });
    }
    return price;
  };

  const handleToggleCalculate = () => {
    setShouldCalculate(!shouldCalculate);
  };

  const toggleCurrency = shouldCalculate ? "Bs" : "$";

 

  return {currentCurrency, handleCurrency , shouldCalculate , handleToggleCalculate, oficialBs , paraleloBs , formatedOficialBs , formatedParaleloBs , toggleCurrency};
}