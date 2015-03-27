import React from 'react';
import SuitCSS from 'react-suitcss';
import { pascal } from 'case';

const View = React.createClass({
  render() {
    const {
      component,
      flexDirection,
      alignItems,
      justifyContent,
      ...props} = this.props;

    if (flexDirection) {
      props[`flexDirection${pascal(flexDirection)}`] = true;
    }

    if (alignItems) {
      props[`alignItems${pascal(alignItems)}`] = true;
    }

    if (justifyContent) {
      props[`justifyContent${pascal(justifyContent)}`] = true;
    }

      return (
        <SuitCSS
          {...props}
          componentName="View"
          element={component}
          modifiers={[
            'flexDirectionColumn',
            'alignItemsFlexEnd',
            'justifyContentFlexEnd',
            'flexGrow',
          ]}
        />
      );
    }
});

View.defaultProps = {
  component: 'div',
};

export default View;
