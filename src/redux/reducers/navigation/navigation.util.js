/**
 * Function to parse navigation path string to array, where each
 * element is a member of the path originally separated by '/'
 * @param {String} path
 */
export const readNavigationPath = (path = null) => {
  return path ? path.split('/') : [];
};

/**
 * Returns the parent path of the navigationArray path
 * @param {String[]} navigationArray
 */
export const getPathParent = navigationArray => {
  return navigationArray.slice(0, -1).join('/');
};
