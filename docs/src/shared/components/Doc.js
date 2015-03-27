import React from 'react';

import Container from './Container';
import Markdown from './Markdown';
import { rhythm } from '../theme';


class Doc extends React.Component {
  render() {
    const { doc } = this.props;

    if (!doc) return null;

    return (
      <article className="Doc" style={{
        padding: `${rhythm(2)} 0`,
      }}>
        <Container>
          <Markdown src={doc.get('content')} className="Doc-content" />
        </Container>
      </article>
    );
  }
}

export default Doc;
