function setUpClarity(scriptTag:HTMLScriptElement): void {
  const vueAppClarityId = 'ibn9mzxbfg';
  // eslint-disable-next-line no-param-reassign
  scriptTag.type = 'text/javascript';
  // eslint-disable-next-line no-param-reassign
  scriptTag.text = '(function(c,l,a,r,i,t,y){'
          + 'c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};'
          + 't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;'
          + 'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);'
          + `})(window, document, 'clarity', 'script', '${vueAppClarityId}');`;
}

export function addTag(tagName: string, value: string): void {
  const scriptTag:HTMLScriptElement = document.createElement('script');
  setUpClarity(scriptTag);
  // eslint-disable-next-line no-param-reassign
  scriptTag.text = `clarity("set", "${tagName}", "${value}");`;
  document.body.appendChild(scriptTag);
}
