import React from 'react';
import Remarkable from 'remarkable';

const md = new Remarkable({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (typeof Prism === 'undefined') return;

    if (lang === 'js') lang = 'javascript';

    if (!lang || !Prism.languages[lang]) return;

    return Prism.highlight(str, Prism.languages[lang]);
  }
});

class Markdown extends React.Component {

  render() {
    const { src, ...props } = this.props;
    const html = md.render(src);

    return (
      <div
        {...props}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}

Markdown.defaultProps = {
  src: '',
};

export default Markdown;
