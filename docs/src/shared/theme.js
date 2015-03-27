export const colors = {
  purple: '#724685',
  darkPurple: '#413247',
  pink: '#ED4F81',
  blue: '#2083E0',
  darkBlue: '#1C4467',
};

export const zIndices = {
  AppNav: 9999,
  RouteTransition: 999,
};

export function zIndex(name, offset = 0) {
  return zIndices[name] + offset;
}

colors.text = '#fff';
colors.background = colors.darkBlue;

export function color(name) {
  return colors[name];
}

export const fontFamilies = {
  sourceSans: 'Source Sans Pro',
  sourceCode: 'Source Code Pro',
};

fontFamilies.text = fontFamilies.sourceSans;
fontFamilies.display = fontFamilies.sourceSans;
fontFamilies.code = fontFamilies.sourceCode;

export const sassFontFamilies = mapObject(fontFamilies, wrapSassExpression);

export function rhythm(lines = 1) {
  return `${lines * 1.5}rem`;
}

export const breakpoints = {
  s: 500,
  m: 768,
  l: 950,
  xl: 1100,
  xxl: 1300,
};

export const mediaQueries = mapObject(breakpoints,
  breakpoint => `screen and (min-width:${breakpoint}px)`
);

export const sassMediaQueries = mapObject(mediaQueries, mq => `'${mq}'`);

/**
 * Wrap a Sass string in parentheses.
 * @param {String} sassString
 * @returns {String}
 */
function wrapSassExpression(sassString) {
  return '(' + sassString + ')';
}

/**
 * Takes an object and returns a new object by applying a transformation to
 * each value.
 * @param {object} object - Original object
 * @param {function} transform - Transformation function
 * @return {object} New object with transformed values
 */
function mapObject(object, transform) {
  return Object.keys(object).reduce((result, key) => {
    result[key] = transform(object[key]);
    return result;
  }, {});
}
