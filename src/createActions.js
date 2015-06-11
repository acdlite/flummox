import uniqueId from 'uniqueid';

export default function createActions(perform, actionCreators) {
  const baseId = uniqueId();

  return Object.keys(actionCreators).reduce((result, key) => {
    if (typeof actionCreators[key] !== 'function') {
      result[key] = actionCreators[key];
    } else {
      const id = `${baseId}-${key}`;
      const action = (...args) => {
        return perform(id, ::actionCreators[key], ...args);
      };
      action._id = id;
      result[key] = action;
    }

    return result;
  }, {});
}
