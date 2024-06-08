import Color from "color";

export const hexToNumber = (hex: string) => hex.substr(1, hex.length);

export const isValidHex = (color?: string) => {
  if (!color) {
    return false;
  }

  if (color[0] === "#") {
    color = color.substring(1);
  }

  switch (color.length) {
    case 3:
      return /^[0-9A-F]{3}$/i.test(color);
    case 6:
      return /^[0-9A-F]{6}$/i.test(color);
    case 8:
      return /^[0-9A-F]{8}$/i.test(color);
    default:
      return false;
  }
};

export const getColorsList = (
  baseColor: string,
  {
    numColors,
    shiftAmount,
    mixColor,
    rotate,
    saturation,
  }: {
    numColors: number;
    shiftAmount: number;
    mixColor: string;
    rotate: number;
    saturation: number;
  }
) => {
  const givenColor = isValidHex(baseColor) ? baseColor : "transparent";

  return [...new Array(numColors).keys()].map((step) => {
    if (isValidHex(baseColor)) {
      return Color(givenColor)
        .rotate(((step + 1) / numColors) * -rotate)
        .saturate(((step + 1) / numColors) * saturation)
        .mix(Color(mixColor), (shiftAmount * (step + 1)) / numColors)
        .string();
    }
    return "transparent";
  });
};

export const getChakraColorScale = (baseColor: string) => {
  const darkColors = getColorsList(baseColor, {
    numColors: 4,
    shiftAmount: 0.6,
    mixColor: "black",
    rotate: 0,
    saturation: -0.01,
  })
    .reverse()
    .map((color) => color);

  const lightColors = getColorsList(baseColor, {
    numColors: 5,
    shiftAmount: 0.8,
    mixColor: "white",
    rotate: 0,
    saturation: 0.2,
  });

  const colorScale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const colorList = [
    ...lightColors.reverse(),
    baseColor,
    ...darkColors.reverse(),
  ];
  return Object.fromEntries(
    colorList.map((color, i) => [colorScale[i], color])
  );
};

export const getValidTextColor = (
  backgroundColor: string,
  darkColor = "#000000",
  lightColor = "#FFFFFF"
) => {
  const givenColor = isValidHex(backgroundColor)
    ? backgroundColor
    : "transparent";
  const color = Color(givenColor);

  return color.isLight() ? darkColor : lightColor;
};
