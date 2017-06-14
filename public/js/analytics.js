function main() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-25947294-3', 'auto');
  ga('send', 'pageview');

  if (typeof window.onerror === 'object') {
    window.onerror = function (err, url, line) {
      if (ga) {
        ga('send', 'exception', {
          'exDescription': line + ' ' + err
        });
      }
    };
  }
}

main();