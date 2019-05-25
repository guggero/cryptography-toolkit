angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app.html',
    "<nav class=\"navbar navbar-inverse navbar-fixed-top\">\n" +
    "  <div class=\"container\">\n" +
    "    <div class=\"navbar-header\">\n" +
    "      <a href=\"#!/\" class=\"navbar-brand\">Cryptography Toolkit</a>\n" +
    "    </div>\n" +
    "\n" +
    "    <div id=\"navbar\" class=\"collapse navbar-collapse\">\n" +
    "      <ul class=\"nav navbar-nav navbar-right\">\n" +
    "        <li ng-class=\"{active: $root.isActive('/ecc')}\">\n" +
    "          <a href=\"#!/ecc\">ECC/ECDSA</a>\n" +
    "        </li>\n" +
    "\n" +
    "        <li class=\"dropdown\">\n" +
    "          <a class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\">\n" +
    "            Bitcoin <span class=\"caret\"></span>\n" +
    "          </a>\n" +
    "          <ul class=\"dropdown-menu\">\n" +
    "            <li ng-class=\"{active: $root.isActive('/hd-wallet')}\">\n" +
    "              <a href=\"#!/hd-wallet\">Hierarchical Deterministic Wallet</a>\n" +
    "            </li>\n" +
    "            <li ng-class=\"{active: $root.isActive('/bitcoin-block')}\">\n" +
    "              <a href=\"#!/bitcoin-block\">Bitcoin Block Parser</a>\n" +
    "            </li>\n" +
    "            <li ng-class=\"{active: $root.isActive('/schnorr')}\">\n" +
    "              <a href=\"#!/schnorr\">BIP Schnorr Signatures</a>\n" +
    "            </li>\n" +
    "            <li ng-class=\"{active: $root.isActive('/mu-sig')}\">\n" +
    "              <a href=\"#!/mu-sig\">MuSig: Key Aggregation for Schnorr\n" +
    "                Signatures</a>\n" +
    "            </li>\n" +
    "            <li ng-class=\"{active: $root.isActive('/transaction-creator')}\">\n" +
    "              <a href=\"#!/transaction-creator\">Transaction Creator</a>\n" +
    "            </li>\n" +
    "            <li ng-class=\"{active: $root.isActive('/wallet-import')}\">\n" +
    "              <a href=\"#!/wallet-import\">Wallet Import helper</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </li>\n" +
    "        <li class=\"dropdown\">\n" +
    "          <a class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\">\n" +
    "            LND <span class=\"caret\"></span>\n" +
    "          </a>\n" +
    "          <ul class=\"dropdown-menu\">\n" +
    "            <li ng-class=\"{active: $root.isActive('/aezeed')}\">\n" +
    "              <a href=\"#!/aezeed\">aezeed Cipher Seed Scheme</a>\n" +
    "            </li>\n" +
    "            <li ng-class=\"{active: $root.isActive('/macaroon')}\">\n" +
    "              <a href=\"#!/macaroon\">Macaroons</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </li>\n" +
    "        <li class=\"dropdown\">\n" +
    "          <a class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\">\n" +
    "            Other <span class=\"caret\"></span>\n" +
    "          </a>\n" +
    "          <ul class=\"dropdown-menu\">\n" +
    "            <li ng-class=\"{active: $root.isActive('/shamir-secret-sharing')}\">\n" +
    "              <a href=\"#!/shamir-secret-sharing\">Shamir's Secret Sharing\n" +
    "                Scheme</a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</nav>\n" +
    "<a ng-if=\"$root.isActive('/')\"\n" +
    "   href=\"https://github.com/guggero/cryptography-toolkit/\">\n" +
    "  <img src=\"images/fork-me-on-github-ribbon.png\" alt=\"Fork me on GitHub\"\n" +
    "       class=\"github-ribbon\">\n" +
    "</a>\n" +
    "<div ng-class=\"$root.$route.current.containerClass\" ng-view>\n" +
    "\n" +
    "</div>\n"
  );


  $templateCache.put('index.html',
    "<html>\n" +
    "<head>\n" +
    "  <meta charset=\"UTF-8\">\n" +
    "  <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n" +
    "\n" +
    "  <link rel=\"icon\" href=\"favicon.ico\">\n" +
    "\n" +
    "  <!-- fonts -->\n" +
    "  <link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=Raleway:300,400,700\">\n" +
    "  <link rel=\"stylesheet\" href=\"https://use.fontawesome.com/releases/v5.8.1/css/all.css\" integrity=\"sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf\" crossorigin=\"anonymous\">\n" +
    "\n" +
    "  <!-- bootstrap and theme -->\n" +
    "  <link rel=\"stylesheet\" href=\"libs/css/bootstrap.min.css\">\n" +
    "  <link rel=\"stylesheet\" href=\"libs/css/bootstrap-theme.min.css\">\n" +
    "  <link rel=\"stylesheet\" href=\"libs/css/bootstrap-horizon.css\">\n" +
    "  <link rel=\"stylesheet\" href=\"libs/css/ladda-themeless.min.css\">\n" +
    "  <link rel=\"stylesheet\" href=\"libs/css/ie10-viewport-bug-workaround.css\">\n" +
    "  <link rel=\"stylesheet\" href=\"app.css\">\n" +
    "\n" +
    "  <!-- Latest jQuery, Angular and Bootstrap -->\n" +
    "  <script src=\"libs/js/jquery.min.js\"></script>\n" +
    "  <script src=\"libs/js/angular.min.js\"></script>\n" +
    "  <script src=\"libs/js/angular-route.js\"></script>\n" +
    "\n" +
    "  <!-- other libraries -->\n" +
    "  <script src=\"libs/js/bootstrap.min.js\"></script>\n" +
    "  <script src=\"libs/js/spin.min.js\"></script>\n" +
    "  <script src=\"libs/js/ladda.min.js\"></script>\n" +
    "  <script src=\"libs/js/ie10-viewport-bug-workaround.js\"></script>\n" +
    "  <script src=\"libs/js/ie10-viewport-bug-workaround.js\"></script>\n" +
    "  <script src=\"libs/js/sha256.js\"></script>\n" +
    "\n" +
    "  <!-- Moment.js -->\n" +
    "  <script src=\"libs/js/moment.min.js\"></script>\n" +
    "\n" +
    "  <!-- lodash.js -->\n" +
    "  <script src=\"libs/js/lodash.js\"></script>\n" +
    "\n" +
    "  <!-- bitcoinjs-lib -->\n" +
    "  <script src=\"libs/js/bitcoin.js\"></script>\n" +
    "\n" +
    "  <!-- qrcode -->\n" +
    "  <script src=\"libs/js/qrcode.min.js\"></script>\n" +
    "\n" +
    "  <!-- d3 -->\n" +
    "  <script src=\"libs/js/d3.v3.min.js\"></script>\n" +
    "\n" +
    "  <!-- App -->\n" +
    "  <script src=\"bitcoin-networks.js\"></script>\n" +
    "  <script src=\"app.js\"></script>\n" +
    "\n" +
    "  <!-- HTML templates -->\n" +
    "  <script>\n" +
    "    // don't load HTML templates from pre-compiled file in development mode\n" +
    "    if (location.hostname !== \"localhost\" && location.hostname !== \"127.0.0.1\") {\n" +
    "      document.write('<scr' + 'ipt src=\"libs/templates.js\"></sc' + 'ript>');\n" +
    "    }\n" +
    "  </script>\n" +
    "\n" +
    "  <!-- Pages -->\n" +
    "  <script src=\"pages/intro/intro.js\"></script>\n" +
    "  <script src=\"pages/ecc/ecc.js\"></script>\n" +
    "  <script src=\"pages/hd-wallet/hd-wallet.js\"></script>\n" +
    "  <script src=\"pages/bitcoin-block/bitcoin-block.js\"></script>\n" +
    "  <script src=\"pages/shamir-secret-sharing/shamir-secret-sharing.js\"></script>\n" +
    "  <script src=\"pages/mu-sig/mu-sig.js\"></script>\n" +
    "  <script src=\"pages/schnorr/schnorr.js\"></script>\n" +
    "  <script src=\"pages/transaction-creator/transaction-creator.js\"></script>\n" +
    "  <script src=\"pages/aezeed/aezeed.js\"></script>\n" +
    "  <script src=\"pages/wallet-import/wallet-import.js\"></script>\n" +
    "\n" +
    "  <title>Cryptography Toolkit</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "<app></app>\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/argparse/node_modules/sprintf-js/demo/angular.html',
    "<!doctype html>\n" +
    "<html ng-app=\"app\">\n" +
    "<head>\n" +
    "    <script src=\"https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-rc.3/angular.min.js\"></script>\n" +
    "    <script src=\"../src/sprintf.js\"></script>\n" +
    "    <script src=\"../src/angular-sprintf.js\"></script>\n" +
    "</head>\n" +
    "<body>\n" +
    "    <pre>{{ \"%+010d\"|sprintf:-123 }}</pre>\n" +
    "    <pre>{{ \"%+010d\"|vsprintf:[-123] }}</pre>\n" +
    "    <pre>{{ \"%+010d\"|fmt:-123 }}</pre>\n" +
    "    <pre>{{ \"%+010d\"|vfmt:[-123] }}</pre>\n" +
    "    <pre>{{ \"I've got %2$d apples and %1$d oranges.\"|fmt:4:2 }}</pre>\n" +
    "    <pre>{{ \"I've got %(apples)d apples and %(oranges)d oranges.\"|fmt:{apples: 2, oranges: 4} }}</pre>\n" +
    "\n" +
    "    <script>\n" +
    "        angular.module(\"app\", [\"sprintf\"])\n" +
    "    </script>\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/browserify/example/multiple_bundles/static/beep.html',
    "<script src=\"common.js\"></script>\n" +
    "<script src=\"beep.js\"></script>\n"
  );


  $templateCache.put('node_modules/browserify/example/multiple_bundles/static/boop.html',
    "<script src=\"common.js\"></script>\n" +
    "<script src=\"boop.js\"></script>\n"
  );


  $templateCache.put('node_modules/browserify/example/source_maps/index.html',
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "<head>\n" +
    "  <meta charset=utf-8 />\n" +
    "  <title></title>\n" +
    "  <script type=\"text/javascript\" src=\"./js/build/bundle.js\"></script>\n" +
    "</head>\n" +
    "<body>\n" +
    "  <p>Open your dev tools ;)</p>  \n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/console-browserify/test/static/index.html',
    "<!doctype html>\n" +
    "<html>\n" +
    "<head>\n" +
    "    <meta http-equiv=\"x-ua-compatible\" content=\"IE=8\" >\n" +
    "    <title>TAPE Example</title>\n" +
    "    <script src=\"/testem.js\"></script>\n" +
    "    <script src=\"test-adapter.js\"></script>\n" +
    "    <script src=\"bundle.js\"></script>\n" +
    "</head>\n" +
    "<body>\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/crypto-browserify/example/index.html',
    "<!doctype html>\n" +
    "<html>\n" +
    "<script src=bundle.js></script>\n" +
    "<body>\n" +
    "  <pre>\n" +
    "  require('crypto').createHash('sha1').update('abc').digest('hex') == '<span id=ans></span>'\n" +
    "  </pre>\n" +
    "</body>\n" +
    "<script>\n" +
    "  document.getElementById('ans').innerHTML = require('crypto').createHash('sha1').update('abc').digest('hex')\n" +
    "</script>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/date-now/test/static/index.html',
    "<!doctype html>\n" +
    "<html>\n" +
    "<head>\n" +
    "    <title>TAPE Example</title>\n" +
    "    <script src=\"/testem.js\"></script>\n" +
    "    <script src=\"bundle.js\"></script>\n" +
    "</head>\n" +
    "<body>\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/fast-crc32c/coverage.html',
    "<!DOCTYPE html><html><head><title>Coverage</title><script>\n" +
    "\n" +
    "headings = [];\n" +
    "\n" +
    "onload = function(){\n" +
    "  headings = document.querySelectorAll('h2');\n" +
    "};\n" +
    "\n" +
    "onscroll = function(e){\n" +
    "  var heading = find(window.scrollY);\n" +
    "  if (!heading) return;\n" +
    "  var links = document.querySelectorAll('#menu a')\n" +
    "    , link;\n" +
    "\n" +
    "  for (var i = 0, len = links.length; i < len; ++i) {\n" +
    "    link = links[i];\n" +
    "    link.className = link.getAttribute('href') == '#' + heading.id\n" +
    "      ? 'active'\n" +
    "      : '';\n" +
    "  }\n" +
    "};\n" +
    "\n" +
    "function find(y) {\n" +
    "  var i = headings.length\n" +
    "    , heading;\n" +
    "\n" +
    "  while (i--) {\n" +
    "    heading = headings[i];\n" +
    "    if (y >= heading.offsetTop) {\n" +
    "      return heading;\n" +
    "    }\n" +
    "  }\n" +
    "}\n" +
    "</script>\n" +
    "<style>\n" +
    "\n" +
    "body {\n" +
    "  font: 14px/1.6 \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n" +
    "  margin: 0;\n" +
    "  color: #2C2C2C;\n" +
    "  border-top: 2px solid #ddd;\n" +
    "}\n" +
    "\n" +
    "#coverage {\n" +
    "  padding: 60px;\n" +
    "}\n" +
    "\n" +
    "h1 a {\n" +
    "  color: inherit;\n" +
    "  font-weight: inherit;\n" +
    "}\n" +
    "\n" +
    "h1 a:hover {\n" +
    "  text-decoration: none;\n" +
    "}\n" +
    "\n" +
    ".onload h1 {\n" +
    "  opacity: 1;\n" +
    "}\n" +
    "\n" +
    "h2 {\n" +
    "  width: 80%;\n" +
    "  margin-top: 80px;\n" +
    "  margin-bottom: 0;\n" +
    "  font-weight: 100;\n" +
    "  letter-spacing: 1px;\n" +
    "  border-bottom: 1px solid #eee;\n" +
    "}\n" +
    "\n" +
    "a {\n" +
    "  color: #8A6343;\n" +
    "  font-weight: bold;\n" +
    "  text-decoration: none;\n" +
    "}\n" +
    "\n" +
    "a:hover {\n" +
    "  text-decoration: underline;\n" +
    "}\n" +
    "\n" +
    "ul {\n" +
    "  margin-top: 20px;\n" +
    "  padding: 0 15px;\n" +
    "  width: 100%;\n" +
    "}\n" +
    "\n" +
    "ul li {\n" +
    "  float: left;\n" +
    "  width: 40%;\n" +
    "  margin-top: 5px;\n" +
    "  margin-right: 60px;\n" +
    "  list-style: none;\n" +
    "  border-bottom: 1px solid #eee;\n" +
    "  padding: 5px 0;\n" +
    "  font-size: 12px;\n" +
    "}\n" +
    "\n" +
    "ul::after {\n" +
    "  content: '.';\n" +
    "  height: 0;\n" +
    "  display: block;\n" +
    "  visibility: hidden;\n" +
    "  clear: both;\n" +
    "}\n" +
    "\n" +
    "code {\n" +
    "  font: 12px monaco, monospace;\n" +
    "}\n" +
    "\n" +
    "pre {\n" +
    "  margin: 30px;\n" +
    "  padding: 30px;\n" +
    "  border: 1px solid #eee;\n" +
    "  border-bottom-color: #ddd;\n" +
    "  -webkit-border-radius: 2px;\n" +
    "  -moz-border-radius: 2px;\n" +
    "  border-radius: 2px;\n" +
    "  -webkit-box-shadow: inset 0 0 10px #eee;\n" +
    "  -moz-box-shadow: inset 0 0 10px #eee;\n" +
    "  box-shadow: inset 0 0 10px #eee;\n" +
    "  overflow-x: auto;\n" +
    "}\n" +
    "\n" +
    "img {\n" +
    "  margin: 30px;\n" +
    "  padding: 1px;\n" +
    "  -webkit-border-radius: 3px;\n" +
    "  -moz-border-radius: 3px;\n" +
    "  border-radius: 3px;\n" +
    "  -webkit-box-shadow: 0 3px 10px #dedede, 0 1px 5px #888;\n" +
    "  -moz-box-shadow: 0 3px 10px #dedede, 0 1px 5px #888;\n" +
    "  box-shadow: 0 3px 10px #dedede, 0 1px 5px #888;\n" +
    "  max-width: 100%;\n" +
    "}\n" +
    "\n" +
    "footer {\n" +
    "  background: #eee;\n" +
    "  width: 100%;\n" +
    "  padding: 50px 0;\n" +
    "  text-align: right;\n" +
    "  border-top: 1px solid #ddd;\n" +
    "}\n" +
    "\n" +
    "footer span {\n" +
    "  display: block;\n" +
    "  margin-right: 30px;\n" +
    "  color: #888;\n" +
    "  font-size: 12px;\n" +
    "}\n" +
    "\n" +
    "#menu {\n" +
    "  position: fixed;\n" +
    "  font-size: 12px;\n" +
    "  overflow-y: auto;\n" +
    "  top: 0;\n" +
    "  right: 0;\n" +
    "  margin: 0;\n" +
    "  height: 100%;\n" +
    "  padding: 15px 0;\n" +
    "  text-align: right;\n" +
    "  border-left: 1px solid #eee;\n" +
    "  -moz-box-shadow: 0 0 2px #888\n" +
    "     , inset 5px 0 20px rgba(0,0,0,.5)\n" +
    "     , inset 5px 0 3px rgba(0,0,0,.3);\n" +
    "  -webkit-box-shadow: 0 0 2px #888\n" +
    "     , inset 5px 0 20px rgba(0,0,0,.5)\n" +
    "     , inset 5px 0 3px rgba(0,0,0,.3);\n" +
    "  box-shadow: 0 0 2px #888\n" +
    "     , inset 5px 0 20px rgba(0,0,0,.5)\n" +
    "     , inset 5px 0 3px rgba(0,0,0,.3);\n" +
    "  -webkit-font-smoothing: antialiased;\n" +
    "  background: url(\"data:image/png;base64,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\");\n" +
    "}\n" +
    "\n" +
    "#menu::after {\n" +
    "  display: block;\n" +
    "  content: '';\n" +
    "  padding-top: 80px;\n" +
    "}\n" +
    "\n" +
    "#logo {\n" +
    "  position: fixed;\n" +
    "  bottom: 10px;\n" +
    "  right: 10px;\n" +
    "  background: rgba(255,255,255,.1);\n" +
    "  font-size: 11px;\n" +
    "  display: block;\n" +
    "  width: 20px;\n" +
    "  height: 20px;\n" +
    "  line-height: 20px;\n" +
    "  text-align: center;\n" +
    "  -webkit-border-radius: 20px;\n" +
    "  -moz-border-radius: 20px;\n" +
    "  border-radius: 20px;\n" +
    "  -webkit-box-shadow: 0 0 3px rgba(0,0,0,.2);\n" +
    "  -moz-box-shadow: 0 0 3px rgba(0,0,0,.2);\n" +
    "  box-shadow: 0 0 3px rgba(0,0,0,.2);\n" +
    "  color: inherit;\n" +
    "}\n" +
    "\n" +
    "#menu li a {\n" +
    "  display: block;\n" +
    "  color: white;\n" +
    "  padding: 0 35px 0 25px;\n" +
    "  -webkit-transition: background 300ms;\n" +
    "  -moz-transition: background 300ms;\n" +
    "}\n" +
    "\n" +
    "#menu li {\n" +
    "  position: relative;\n" +
    "  list-style: none;\n" +
    "}\n" +
    "\n" +
    "#menu a:hover,\n" +
    "#menu a.active {\n" +
    "  text-decoration: none;\n" +
    "  background: rgba(255,255,255,.1);\n" +
    "}\n" +
    "\n" +
    "#menu li:hover .cov {\n" +
    "  opacity: 1;\n" +
    "}\n" +
    "\n" +
    "#menu li .dirname {\n" +
    "  opacity: .60;\n" +
    "  padding-right: 2px;\n" +
    "}\n" +
    "\n" +
    "#menu li .basename {\n" +
    "  opacity: 1;\n" +
    "}\n" +
    "\n" +
    "#menu .cov {\n" +
    "  background: rgba(0,0,0,.4);\n" +
    "  position: absolute;\n" +
    "  top: 0;\n" +
    "  right: 8px;\n" +
    "  font-size: 9px;\n" +
    "  opacity: .6;\n" +
    "  text-align: left;\n" +
    "  width: 17px;\n" +
    "  -webkit-border-radius: 10px;\n" +
    "  -moz-border-radius: 10px;\n" +
    "  border-radius: 10px;\n" +
    "  padding: 2px 3px;\n" +
    "  text-align: center;\n" +
    "}\n" +
    "\n" +
    "#stats:nth-child(2n) {\n" +
    "  display: inline-block;\n" +
    "  margin-top: 15px;\n" +
    "  border: 1px solid #eee;\n" +
    "  padding: 10px;\n" +
    "  -webkit-box-shadow: inset 0 0 2px #eee;\n" +
    "  -moz-box-shadow: inset 0 0 2px #eee;\n" +
    "  box-shadow: inset 0 0 2px #eee;\n" +
    "  -webkit-border-radius: 5px;\n" +
    "  -moz-border-radius: 5px;\n" +
    "  border-radius: 5px;\n" +
    "}\n" +
    "\n" +
    "#stats div {\n" +
    "  float: left;\n" +
    "  padding: 0 5px;\n" +
    "}\n" +
    "\n" +
    "#stats::after {\n" +
    "  display: block;\n" +
    "  content: '';\n" +
    "  clear: both;\n" +
    "}\n" +
    "\n" +
    "#stats .sloc::after {\n" +
    "  content: ' SLOC';\n" +
    "  color: #b6b6b6;\n" +
    "}\n" +
    "\n" +
    "#stats .percentage::after {\n" +
    "  content: ' coverage';\n" +
    "  color: #b6b6b6;\n" +
    "}\n" +
    "\n" +
    "#stats .hits,\n" +
    "#stats .misses {\n" +
    "  display: none;\n" +
    "}\n" +
    "\n" +
    ".high {\n" +
    "  color: #00d4b4;\n" +
    "}\n" +
    ".medium {\n" +
    "  color: #e87d0d;\n" +
    "}\n" +
    ".low {\n" +
    "  color: #d4081a;\n" +
    "}\n" +
    ".terrible {\n" +
    "  color: #d4081a;\n" +
    "  font-weight: bold;\n" +
    "}\n" +
    "\n" +
    "table {\n" +
    "  width: 80%;\n" +
    "  margin-top: 10px;\n" +
    "  border-collapse: collapse;\n" +
    "  border: 1px solid #cbcbcb;\n" +
    "  color: #363636;\n" +
    "  -webkit-border-radius: 3px;\n" +
    "  -moz-border-radius: 3px;\n" +
    "  border-radius: 3px;\n" +
    "}\n" +
    "\n" +
    "table thead {\n" +
    "  display: none;\n" +
    "}\n" +
    "\n" +
    "table td.line,\n" +
    "table td.hits {\n" +
    "  width: 20px;\n" +
    "  background: #eaeaea;\n" +
    "  text-align: center;\n" +
    "  font-size: 11px;\n" +
    "  padding: 0 10px;\n" +
    "  color: #949494;\n" +
    "}\n" +
    "\n" +
    "table td.hits {\n" +
    "  width: 10px;\n" +
    "  padding: 2px 5px;\n" +
    "  color: rgba(0,0,0,.2);\n" +
    "  background: #f0f0f0;\n" +
    "}\n" +
    "\n" +
    "tr.miss td.line,\n" +
    "tr.miss td.hits {\n" +
    "  background: #e6c3c7;\n" +
    "}\n" +
    "\n" +
    "tr.miss td {\n" +
    "  background: #f8d5d8;\n" +
    "}\n" +
    "\n" +
    "td.source {\n" +
    "  padding-left: 15px;\n" +
    "  line-height: 15px;\n" +
    "  white-space: pre;\n" +
    "  font: 12px monaco, monospace;\n" +
    "}\n" +
    "\n" +
    "code .comment { color: #ddd }\n" +
    "code .init { color: #2F6FAD }\n" +
    "code .string { color: #5890AD }\n" +
    "code .keyword { color: #8A6343 }\n" +
    "code .number { color: #2F6FAD }\n" +
    "</style></head><body><div id=\"coverage\"><h1 id=\"overview\">Coverage</h1><div id=\"menu\"><li><a href=\"#overview\">overview</a></li><li><span class=\"cov high\">100</span><a href=\"#/Users/xiaoyi/Projects/node-fast-crc32c/impls/js_crc32c.js\"><span class=\"dirname\">/Users/xiaoyi/Projects/node-fast-crc32c/impls/</span><span class=\"basename\">js_crc32c.js</span></a></li><li><span class=\"cov high\">100</span><a href=\"#/Users/xiaoyi/Projects/node-fast-crc32c/impls/sse4_crc32c.js\"><span class=\"dirname\">/Users/xiaoyi/Projects/node-fast-crc32c/impls/</span><span class=\"basename\">sse4_crc32c.js</span></a></li><li><span class=\"cov high\">88</span><a href=\"#/Users/xiaoyi/Projects/node-fast-crc32c/loader.js\"><span class=\"dirname\">/Users/xiaoyi/Projects/node-fast-crc32c/</span><span class=\"basename\">loader.js</span></a></li><a id=\"logo\" href=\"http://visionmedia.github.io/mocha/\">m</a></div><div id=\"stats\" class=\"high\"><div class=\"percentage\">95%</div><div class=\"sloc\">21</div><div class=\"hits\">20</div><div class=\"misses\">1</div></div><div id=\"files\"><div class=\"file\"><h2 id=\"/Users/xiaoyi/Projects/node-fast-crc32c/impls/js_crc32c.js\">/Users/xiaoyi/Projects/node-fast-crc32c/impls/js_crc32c.js</h2><div id=\"stats\" class=\"high\"><div class=\"percentage\">100%</div><div class=\"sloc\">9</div><div class=\"hits\">9</div><div class=\"misses\">0</div></div><table id=\"source\"><thead><tr><th>Line</th><th>Hits</th><th>Source</th></tr></thead><tbody><tr><td class=\"line\">1</td><td class=\"hits\"></td><td class=\"source\">/**</td></tr><tr><td class=\"line\">2</td><td class=\"hits\"></td><td class=\"source\"> * This code is a manual javascript translation of c code generated by</td></tr><tr><td class=\"line\">3</td><td class=\"hits\"></td><td class=\"source\"> * pycrc 0.7.1 (http://www.tty1.net/pycrc/). Command line used:</td></tr><tr><td class=\"line\">4</td><td class=\"hits\"></td><td class=\"source\"> * './pycrc.py --model=crc-32c --generate c --algorithm=table-driven'</td></tr><tr><td class=\"line\">5</td><td class=\"hits\"></td><td class=\"source\"> */</td></tr><tr><td class=\"line\">6</td><td class=\"hits\"></td><td class=\"source\"> </td></tr><tr class=\"hit\"><td class=\"line\">7</td><td class=\"hits\">1</td><td class=\"source\">var kCRCTable = new Int32Array([</td></tr><tr><td class=\"line\">8</td><td class=\"hits\"></td><td class=\"source\">  0x00000000, 0xf26b8303, 0xe13b70f7, 0x1350f3f4,</td></tr><tr><td class=\"line\">9</td><td class=\"hits\"></td><td class=\"source\">  0xc79a971f, 0x35f1141c, 0x26a1e7e8, 0xd4ca64eb,</td></tr><tr><td class=\"line\">10</td><td class=\"hits\"></td><td class=\"source\">  0x8ad958cf, 0x78b2dbcc, 0x6be22838, 0x9989ab3b,</td></tr><tr><td class=\"line\">11</td><td class=\"hits\"></td><td class=\"source\">  0x4d43cfd0, 0xbf284cd3, 0xac78bf27, 0x5e133c24,</td></tr><tr><td class=\"line\">12</td><td class=\"hits\"></td><td class=\"source\">  0x105ec76f, 0xe235446c, 0xf165b798, 0x030e349b,</td></tr><tr><td class=\"line\">13</td><td class=\"hits\"></td><td class=\"source\">  0xd7c45070, 0x25afd373, 0x36ff2087, 0xc494a384,</td></tr><tr><td class=\"line\">14</td><td class=\"hits\"></td><td class=\"source\">  0x9a879fa0, 0x68ec1ca3, 0x7bbcef57, 0x89d76c54,</td></tr><tr><td class=\"line\">15</td><td class=\"hits\"></td><td class=\"source\">  0x5d1d08bf, 0xaf768bbc, 0xbc267848, 0x4e4dfb4b,</td></tr><tr><td class=\"line\">16</td><td class=\"hits\"></td><td class=\"source\">  0x20bd8ede, 0xd2d60ddd, 0xc186fe29, 0x33ed7d2a,</td></tr><tr><td class=\"line\">17</td><td class=\"hits\"></td><td class=\"source\">  0xe72719c1, 0x154c9ac2, 0x061c6936, 0xf477ea35,</td></tr><tr><td class=\"line\">18</td><td class=\"hits\"></td><td class=\"source\">  0xaa64d611, 0x580f5512, 0x4b5fa6e6, 0xb93425e5,</td></tr><tr><td class=\"line\">19</td><td class=\"hits\"></td><td class=\"source\">  0x6dfe410e, 0x9f95c20d, 0x8cc531f9, 0x7eaeb2fa,</td></tr><tr><td class=\"line\">20</td><td class=\"hits\"></td><td class=\"source\">  0x30e349b1, 0xc288cab2, 0xd1d83946, 0x23b3ba45,</td></tr><tr><td class=\"line\">21</td><td class=\"hits\"></td><td class=\"source\">  0xf779deae, 0x05125dad, 0x1642ae59, 0xe4292d5a,</td></tr><tr><td class=\"line\">22</td><td class=\"hits\"></td><td class=\"source\">  0xba3a117e, 0x4851927d, 0x5b016189, 0xa96ae28a,</td></tr><tr><td class=\"line\">23</td><td class=\"hits\"></td><td class=\"source\">  0x7da08661, 0x8fcb0562, 0x9c9bf696, 0x6ef07595,</td></tr><tr><td class=\"line\">24</td><td class=\"hits\"></td><td class=\"source\">  0x417b1dbc, 0xb3109ebf, 0xa0406d4b, 0x522bee48,</td></tr><tr><td class=\"line\">25</td><td class=\"hits\"></td><td class=\"source\">  0x86e18aa3, 0x748a09a0, 0x67dafa54, 0x95b17957,</td></tr><tr><td class=\"line\">26</td><td class=\"hits\"></td><td class=\"source\">  0xcba24573, 0x39c9c670, 0x2a993584, 0xd8f2b687,</td></tr><tr><td class=\"line\">27</td><td class=\"hits\"></td><td class=\"source\">  0x0c38d26c, 0xfe53516f, 0xed03a29b, 0x1f682198,</td></tr><tr><td class=\"line\">28</td><td class=\"hits\"></td><td class=\"source\">  0x5125dad3, 0xa34e59d0, 0xb01eaa24, 0x42752927,</td></tr><tr><td class=\"line\">29</td><td class=\"hits\"></td><td class=\"source\">  0x96bf4dcc, 0x64d4cecf, 0x77843d3b, 0x85efbe38,</td></tr><tr><td class=\"line\">30</td><td class=\"hits\"></td><td class=\"source\">  0xdbfc821c, 0x2997011f, 0x3ac7f2eb, 0xc8ac71e8,</td></tr><tr><td class=\"line\">31</td><td class=\"hits\"></td><td class=\"source\">  0x1c661503, 0xee0d9600, 0xfd5d65f4, 0x0f36e6f7,</td></tr><tr><td class=\"line\">32</td><td class=\"hits\"></td><td class=\"source\">  0x61c69362, 0x93ad1061, 0x80fde395, 0x72966096,</td></tr><tr><td class=\"line\">33</td><td class=\"hits\"></td><td class=\"source\">  0xa65c047d, 0x5437877e, 0x4767748a, 0xb50cf789,</td></tr><tr><td class=\"line\">34</td><td class=\"hits\"></td><td class=\"source\">  0xeb1fcbad, 0x197448ae, 0x0a24bb5a, 0xf84f3859,</td></tr><tr><td class=\"line\">35</td><td class=\"hits\"></td><td class=\"source\">  0x2c855cb2, 0xdeeedfb1, 0xcdbe2c45, 0x3fd5af46,</td></tr><tr><td class=\"line\">36</td><td class=\"hits\"></td><td class=\"source\">  0x7198540d, 0x83f3d70e, 0x90a324fa, 0x62c8a7f9,</td></tr><tr><td class=\"line\">37</td><td class=\"hits\"></td><td class=\"source\">  0xb602c312, 0x44694011, 0x5739b3e5, 0xa55230e6,</td></tr><tr><td class=\"line\">38</td><td class=\"hits\"></td><td class=\"source\">  0xfb410cc2, 0x092a8fc1, 0x1a7a7c35, 0xe811ff36,</td></tr><tr><td class=\"line\">39</td><td class=\"hits\"></td><td class=\"source\">  0x3cdb9bdd, 0xceb018de, 0xdde0eb2a, 0x2f8b6829,</td></tr><tr><td class=\"line\">40</td><td class=\"hits\"></td><td class=\"source\">  0x82f63b78, 0x709db87b, 0x63cd4b8f, 0x91a6c88c,</td></tr><tr><td class=\"line\">41</td><td class=\"hits\"></td><td class=\"source\">  0x456cac67, 0xb7072f64, 0xa457dc90, 0x563c5f93,</td></tr><tr><td class=\"line\">42</td><td class=\"hits\"></td><td class=\"source\">  0x082f63b7, 0xfa44e0b4, 0xe9141340, 0x1b7f9043,</td></tr><tr><td class=\"line\">43</td><td class=\"hits\"></td><td class=\"source\">  0xcfb5f4a8, 0x3dde77ab, 0x2e8e845f, 0xdce5075c,</td></tr><tr><td class=\"line\">44</td><td class=\"hits\"></td><td class=\"source\">  0x92a8fc17, 0x60c37f14, 0x73938ce0, 0x81f80fe3,</td></tr><tr><td class=\"line\">45</td><td class=\"hits\"></td><td class=\"source\">  0x55326b08, 0xa759e80b, 0xb4091bff, 0x466298fc,</td></tr><tr><td class=\"line\">46</td><td class=\"hits\"></td><td class=\"source\">  0x1871a4d8, 0xea1a27db, 0xf94ad42f, 0x0b21572c,</td></tr><tr><td class=\"line\">47</td><td class=\"hits\"></td><td class=\"source\">  0xdfeb33c7, 0x2d80b0c4, 0x3ed04330, 0xccbbc033,</td></tr><tr><td class=\"line\">48</td><td class=\"hits\"></td><td class=\"source\">  0xa24bb5a6, 0x502036a5, 0x4370c551, 0xb11b4652,</td></tr><tr><td class=\"line\">49</td><td class=\"hits\"></td><td class=\"source\">  0x65d122b9, 0x97baa1ba, 0x84ea524e, 0x7681d14d,</td></tr><tr><td class=\"line\">50</td><td class=\"hits\"></td><td class=\"source\">  0x2892ed69, 0xdaf96e6a, 0xc9a99d9e, 0x3bc21e9d,</td></tr><tr><td class=\"line\">51</td><td class=\"hits\"></td><td class=\"source\">  0xef087a76, 0x1d63f975, 0x0e330a81, 0xfc588982,</td></tr><tr><td class=\"line\">52</td><td class=\"hits\"></td><td class=\"source\">  0xb21572c9, 0x407ef1ca, 0x532e023e, 0xa145813d,</td></tr><tr><td class=\"line\">53</td><td class=\"hits\"></td><td class=\"source\">  0x758fe5d6, 0x87e466d5, 0x94b49521, 0x66df1622,</td></tr><tr><td class=\"line\">54</td><td class=\"hits\"></td><td class=\"source\">  0x38cc2a06, 0xcaa7a905, 0xd9f75af1, 0x2b9cd9f2,</td></tr><tr><td class=\"line\">55</td><td class=\"hits\"></td><td class=\"source\">  0xff56bd19, 0x0d3d3e1a, 0x1e6dcdee, 0xec064eed,</td></tr><tr><td class=\"line\">56</td><td class=\"hits\"></td><td class=\"source\">  0xc38d26c4, 0x31e6a5c7, 0x22b65633, 0xd0ddd530,</td></tr><tr><td class=\"line\">57</td><td class=\"hits\"></td><td class=\"source\">  0x0417b1db, 0xf67c32d8, 0xe52cc12c, 0x1747422f,</td></tr><tr><td class=\"line\">58</td><td class=\"hits\"></td><td class=\"source\">  0x49547e0b, 0xbb3ffd08, 0xa86f0efc, 0x5a048dff,</td></tr><tr><td class=\"line\">59</td><td class=\"hits\"></td><td class=\"source\">  0x8ecee914, 0x7ca56a17, 0x6ff599e3, 0x9d9e1ae0,</td></tr><tr><td class=\"line\">60</td><td class=\"hits\"></td><td class=\"source\">  0xd3d3e1ab, 0x21b862a8, 0x32e8915c, 0xc083125f,</td></tr><tr><td class=\"line\">61</td><td class=\"hits\"></td><td class=\"source\">  0x144976b4, 0xe622f5b7, 0xf5720643, 0x07198540,</td></tr><tr><td class=\"line\">62</td><td class=\"hits\"></td><td class=\"source\">  0x590ab964, 0xab613a67, 0xb831c993, 0x4a5a4a90,</td></tr><tr><td class=\"line\">63</td><td class=\"hits\"></td><td class=\"source\">  0x9e902e7b, 0x6cfbad78, 0x7fab5e8c, 0x8dc0dd8f,</td></tr><tr><td class=\"line\">64</td><td class=\"hits\"></td><td class=\"source\">  0xe330a81a, 0x115b2b19, 0x020bd8ed, 0xf0605bee,</td></tr><tr><td class=\"line\">65</td><td class=\"hits\"></td><td class=\"source\">  0x24aa3f05, 0xd6c1bc06, 0xc5914ff2, 0x37faccf1,</td></tr><tr><td class=\"line\">66</td><td class=\"hits\"></td><td class=\"source\">  0x69e9f0d5, 0x9b8273d6, 0x88d28022, 0x7ab90321,</td></tr><tr><td class=\"line\">67</td><td class=\"hits\"></td><td class=\"source\">  0xae7367ca, 0x5c18e4c9, 0x4f48173d, 0xbd23943e,</td></tr><tr><td class=\"line\">68</td><td class=\"hits\"></td><td class=\"source\">  0xf36e6f75, 0x0105ec76, 0x12551f82, 0xe03e9c81,</td></tr><tr><td class=\"line\">69</td><td class=\"hits\"></td><td class=\"source\">  0x34f4f86a, 0xc69f7b69, 0xd5cf889d, 0x27a40b9e,</td></tr><tr><td class=\"line\">70</td><td class=\"hits\"></td><td class=\"source\">  0x79b737ba, 0x8bdcb4b9, 0x988c474d, 0x6ae7c44e,</td></tr><tr><td class=\"line\">71</td><td class=\"hits\"></td><td class=\"source\">  0xbe2da0a5, 0x4c4623a6, 0x5f16d052, 0xad7d5351</td></tr><tr><td class=\"line\">72</td><td class=\"hits\"></td><td class=\"source\">]);</td></tr><tr><td class=\"line\">73</td><td class=\"hits\"></td><td class=\"source\"> </td></tr><tr class=\"hit\"><td class=\"line\">74</td><td class=\"hits\">1</td><td class=\"source\">function calculate(buf, initial) {</td></tr><tr class=\"hit\"><td class=\"line\">75</td><td class=\"hits\">48</td><td class=\"source\">  if (!Buffer.isBuffer(buf))</td></tr><tr class=\"hit\"><td class=\"line\">76</td><td class=\"hits\">12</td><td class=\"source\">    buf = new Buffer(buf);</td></tr><tr class=\"hit\"><td class=\"line\">77</td><td class=\"hits\">48</td><td class=\"source\">  var crc = (initial | 0) ^ -1;</td></tr><tr class=\"hit\"><td class=\"line\">78</td><td class=\"hits\">48</td><td class=\"source\">  for (var i = 0; i &lt; buf.length; i++)</td></tr><tr class=\"hit\"><td class=\"line\">79</td><td class=\"hits\">40964</td><td class=\"source\">    crc = kCRCTable[(crc ^ buf[i]) &amp; 0xff] ^ (crc &gt;&gt;&gt; 8);</td></tr><tr class=\"hit\"><td class=\"line\">80</td><td class=\"hits\">48</td><td class=\"source\">  return (crc ^ -1) &gt;&gt;&gt; 0;</td></tr><tr><td class=\"line\">81</td><td class=\"hits\"></td><td class=\"source\">}</td></tr><tr><td class=\"line\">82</td><td class=\"hits\"></td><td class=\"source\"> </td></tr><tr class=\"hit\"><td class=\"line\">83</td><td class=\"hits\">1</td><td class=\"source\">module.exports = {</td></tr><tr><td class=\"line\">84</td><td class=\"hits\"></td><td class=\"source\">  calculate: calculate</td></tr><tr><td class=\"line\">85</td><td class=\"hits\"></td><td class=\"source\">};</td></tr><tr><td class=\"line\">86</td><td class=\"hits\"></td><td class=\"source\"> </td></tr></tbody></table></div><div class=\"file\"><h2 id=\"/Users/xiaoyi/Projects/node-fast-crc32c/impls/sse4_crc32c.js\">/Users/xiaoyi/Projects/node-fast-crc32c/impls/sse4_crc32c.js</h2><div id=\"stats\" class=\"high\"><div class=\"percentage\">100%</div><div class=\"sloc\">3</div><div class=\"hits\">3</div><div class=\"misses\">0</div></div><table id=\"source\"><thead><tr><th>Line</th><th>Hits</th><th>Source</th></tr></thead><tbody><tr class=\"hit\"><td class=\"line\">1</td><td class=\"hits\">1</td><td class=\"source\">var CRC32 = require('sse4_crc32').CRC32;</td></tr><tr><td class=\"line\">2</td><td class=\"hits\"></td><td class=\"source\"> </td></tr><tr class=\"hit\"><td class=\"line\">3</td><td class=\"hits\">1</td><td class=\"source\">module.exports = {</td></tr><tr><td class=\"line\">4</td><td class=\"hits\"></td><td class=\"source\">  calculate: function(data, initial) {</td></tr><tr class=\"hit\"><td class=\"line\">5</td><td class=\"hits\">49</td><td class=\"source\">    return new CRC32(data, initial).crc();</td></tr><tr><td class=\"line\">6</td><td class=\"hits\"></td><td class=\"source\">  }</td></tr><tr><td class=\"line\">7</td><td class=\"hits\"></td><td class=\"source\">};</td></tr><tr><td class=\"line\">8</td><td class=\"hits\"></td><td class=\"source\"> </td></tr></tbody></table></div><div class=\"file\"><h2 id=\"/Users/xiaoyi/Projects/node-fast-crc32c/loader.js\">/Users/xiaoyi/Projects/node-fast-crc32c/loader.js</h2><div id=\"stats\" class=\"high\"><div class=\"percentage\">88%</div><div class=\"sloc\">9</div><div class=\"hits\">8</div><div class=\"misses\">1</div></div><table id=\"source\"><thead><tr><th>Line</th><th>Hits</th><th>Source</th></tr></thead><tbody><tr class=\"hit\"><td class=\"line\">1</td><td class=\"hits\">1</td><td class=\"source\">var fs = require('fs');</td></tr><tr><td class=\"line\">2</td><td class=\"hits\"></td><td class=\"source\"> </td></tr><tr class=\"hit\"><td class=\"line\">3</td><td class=\"hits\">1</td><td class=\"source\">module.exports = (function(loaders) {</td></tr><tr><td class=\"line\">4</td><td class=\"hits\"></td><td class=\"source\"> </td></tr><tr class=\"hit\"><td class=\"line\">5</td><td class=\"hits\">1</td><td class=\"source\">var impls = [</td></tr><tr><td class=\"line\">6</td><td class=\"hits\"></td><td class=\"source\">  './impls/sse4_crc32c',</td></tr><tr><td class=\"line\">7</td><td class=\"hits\"></td><td class=\"source\">  './impls/js_crc32c'</td></tr><tr><td class=\"line\">8</td><td class=\"hits\"></td><td class=\"source\">];</td></tr><tr><td class=\"line\">9</td><td class=\"hits\"></td><td class=\"source\"> </td></tr><tr class=\"hit\"><td class=\"line\">10</td><td class=\"hits\">1</td><td class=\"source\">for (var i = 0; i &lt; impls.length; i++) {</td></tr><tr class=\"hit\"><td class=\"line\">11</td><td class=\"hits\">1</td><td class=\"source\">  try {</td></tr><tr class=\"hit\"><td class=\"line\">12</td><td class=\"hits\">1</td><td class=\"source\">    var crc32 = require(impls[i]);</td></tr><tr class=\"hit\"><td class=\"line\">13</td><td class=\"hits\">1</td><td class=\"source\">    if (crc32.calculate(&quot;The quick brown fox jumps over the lazy dog&quot;) == 0x22620404)</td></tr><tr class=\"hit\"><td class=\"line\">14</td><td class=\"hits\">1</td><td class=\"source\">      return crc32;</td></tr><tr><td class=\"line\">15</td><td class=\"hits\"></td><td class=\"source\">  } catch(e) {</td></tr><tr><td class=\"line\">16</td><td class=\"hits\"></td><td class=\"source\">  }</td></tr><tr><td class=\"line\">17</td><td class=\"hits\"></td><td class=\"source\">}</td></tr><tr><td class=\"line\">18</td><td class=\"hits\"></td><td class=\"source\"> </td></tr><tr class=\"miss\"><td class=\"line\">19</td><td class=\"hits\">0</td><td class=\"source\">throw new Error('Failed to find available CRC-32C implementation.');</td></tr><tr><td class=\"line\">20</td><td class=\"hits\"></td><td class=\"source\"> </td></tr><tr><td class=\"line\">21</td><td class=\"hits\"></td><td class=\"source\">})();</td></tr><tr><td class=\"line\">22</td><td class=\"hits\"></td><td class=\"source\"> </td></tr></tbody></table></div></div></div></body></html>"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/expected/usemin.html',
    "<!DOCTYPE html>\n" +
    "    <head>\n" +
    "        <link rel=\"stylesheet\" href=\"styles/main.css\">\n" +
    "        <script src=\"scripts/vendor/modernizr.min.js\"></script>\n" +
    "    </head>\n" +
    "    <body>\n" +
    "\n" +
    "    <script src=\"usemin/foo.js\"></script>\n" +
    "\n" +
    "    <script src=\"usemin/bar.js\"></script>\n" +
    "\n" +
    "    <script src=\"usemin/all.js\"></script>\n" +
    "\n" +
    "    <script src=\"duplicate/usemin/all.js\"></script>\n" +
    "\n" +
    "    <link rel=\"stylesheet\" href=\"usemin/bar.css\">\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/expected/useminUgly.html',
    "<!DOCTYPE html>\n" +
    "    <head>\n" +
    "        <link rel=\"stylesheet\" href=\"styles/main.css\">\n" +
    "        <script src=\"scripts/vendor/modernizr.min.js\"></script>\n" +
    "    </head>\n" +
    "    <body>\n" +
    "\n" +
    "    <script src=\"useminUgly/foo.js\"></script>\n" +
    "\n" +
    "    <script src=\"useminUgly/bar.js\"></script>\n" +
    "\n" +
    "    <script src=\"useminUgly/all.js\"></script>\n" +
    "\n" +
    "    <script src=\"duplicate/useminUgly/all.js\"></script>\n" +
    "\n" +
    "    <link rel=\"stylesheet\" href=\"useminUgly/bar.css\">\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/empty.html',
    ""
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/html5.html',
    "<div>\n" +
    "    <span>\n" +
    "        Self-closing, sucka!\n" +
    "        <br>\n" +
    "        <img src='path/to/img'> Howdy\n" +
    "</div>\n" +
    "\n" +
    "<hr>\n" +
    "\n" +
    "<table>\n" +
    "    <tr>\n" +
    "        <td>\n" +
    "            Howdy\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/linebreak.html',
    "<textarea placeholder=\"This is a carriage return.\r" +
    "\n" +
    "Also also a newline.\"></textarea>"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/one.html',
    "<h1>One</h1>\n" +
    "\n" +
    "<p class=\"\">I am one.</p>\n" +
    "\n" +
    "<script type=\"text/javascript\">\n" +
    "  // Test\n" +
    "  /* comments */\n" +
    "  var foo = 'bar';\n" +
    "</script>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/regexp.html',
    "<h1>Regexp</h1>\n" +
    "\n" +
    "<script type=\"text/javascript\">\n" +
    "  var reg = new RegExp(/^(((\\+[1-9][0-9])|(00[1-9][0-9]))[0-9]{7,11})|((((01|02|03|04|05|07|08)[0-9])|(06[1-9]))[0-9]{7})$/)\n" +
    "  var reg2 = new RegExp(/^\\+-\\\\--\\|)$/)\n" +
    "</script>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/three/three_two.html',
    "<h2>Three Two</h2>\n" +
    "\n" +
    "<!-- Comment for three two -->\n" +
    "\n" +
    "<textarea readonly=\"readonly\">We are three two.</textarea>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/three/three.html',
    "<h2>Three</h2>\n" +
    "\n" +
    "<!-- Comment for three -->\n" +
    "\n" +
    "<textarea readonly=\"readonly\">We are three.</textarea>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/two/two.html',
    "<h2>Two</h2>\n" +
    "\n" +
    "<!-- Comment for two -->\n" +
    "\n" +
    "<textarea readonly=\"readonly\">We are two.</textarea>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/undefined.html',
    "<h1>Undefined</h1>\n" +
    "\n" +
    "<p class=\"\">I am undefined.</p>\n" +
    "\n" +
    "<script type=\"text/javascript\">\n" +
    "  // Test\n" +
    "  /* comments */\n" +
    "  var foo = 'bar';\n" +
    "</script>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/unmerged/level2/empty.html',
    ""
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/unmerged/level2/html5.html',
    "<div>\n" +
    "    <span>\n" +
    "        Self-closing, sucka!\n" +
    "        <br>\n" +
    "        <img src='path/to/img'> Howdy\n" +
    "</div>\n" +
    "\n" +
    "<hr>\n" +
    "\n" +
    "<table>\n" +
    "    <tr>\n" +
    "        <td>\n" +
    "            Howdy\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/unmerged/level2/level3/one.html',
    "<h1>One</h1>\n" +
    "\n" +
    "<p class=\"\">I am one.</p>\n" +
    "\n" +
    "<script type=\"text/javascript\">\n" +
    "  // Test\n" +
    "  /* comments */\n" +
    "  var foo = 'bar';\n" +
    "</script>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/unmerged/undefined.html',
    "<h1>Undefined</h1>\n" +
    "\n" +
    "<p class=\"\">I am undefined.</p>\n" +
    "\n" +
    "<script type=\"text/javascript\">\n" +
    "  // Test\n" +
    "  /* comments */\n" +
    "  var foo = 'bar';\n" +
    "</script>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/unmerged/usemin.html',
    "<!DOCTYPE html>\n" +
    "    <head>\n" +
    "        <link rel=\"stylesheet\" href=\"styles/main.css\">\n" +
    "        <script src=\"scripts/vendor/modernizr.min.js\"></script>\n" +
    "    </head>\n" +
    "    <body>\n" +
    "\n" +
    "    <!-- build:js usemin/foo.js -->\n" +
    "    <script src=\"usemin/foo.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:js usemin/bar.js -->\n" +
    "    <script src=\"usemin/bar.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:js usemin/all.js -->\n" +
    "    <script src=\"usemin/foo.js\"></script>\n" +
    "    <script src=\"usemin/bar.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:js duplicate/usemin/all.js -->\n" +
    "    <script src=\"usemin/foo.js\"></script>\n" +
    "    <script src=\"usemin/bar.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:css usemin/bar.css -->\n" +
    "    <script src=\"usemin/bar.css\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/usemin.html',
    "<!DOCTYPE html>\n" +
    "    <head>\n" +
    "        <link rel=\"stylesheet\" href=\"styles/main.css\">\n" +
    "        <script src=\"scripts/vendor/modernizr.min.js\"></script>\n" +
    "    </head>\n" +
    "    <body>\n" +
    "\n" +
    "    <!-- build:js usemin/foo.js -->\n" +
    "    <script src=\"usemin/foo.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:js usemin/bar.js -->\n" +
    "    <script src=\"usemin/bar.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:js usemin/all.js -->\n" +
    "    <script src=\"usemin/foo.js\"></script>\n" +
    "    <script src=\"usemin/bar.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:js duplicate/usemin/all.js -->\n" +
    "    <script src=\"usemin/foo.js\"></script>\n" +
    "    <script src=\"usemin/bar.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:css usemin/bar.css -->\n" +
    "    <script src=\"usemin/bar.css\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/grunt-angular-templates/test/fixtures/useminUgly.html',
    "<!DOCTYPE html>\n" +
    "    <head>\n" +
    "        <link rel=\"stylesheet\" href=\"styles/main.css\">\n" +
    "        <script src=\"scripts/vendor/modernizr.min.js\"></script>\n" +
    "    </head>\n" +
    "    <body>\n" +
    "\n" +
    "    <!-- build:js useminUgly/foo.js -->\n" +
    "    <script src=\"useminUgly/foo.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:js useminUgly/bar.js -->\n" +
    "    <script src=\"useminUgly/bar.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:js useminUgly/all.js -->\n" +
    "    <script src=\"useminUgly/foo.js\"></script>\n" +
    "    <script src=\"useminUgly/bar.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:js duplicate/useminUgly/all.js -->\n" +
    "    <script src=\"useminUgly/foo.js\"></script>\n" +
    "    <script src=\"useminUgly/bar.js\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "\n" +
    "    <!-- build:css useminUgly/bar.css -->\n" +
    "    <script src=\"useminUgly/bar.css\"></script>\n" +
    "    <!-- endbuild -->\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/js-sha3/tests/index.html',
    "<!doctype html>\n" +
    "<html lang=\"en\">\n" +
    "<head>\n" +
    "  <meta charset=\"UTF-8\">\n" +
    "  <title>SHA3</title>\n" +
    "  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/mocha/2.1.0/mocha.min.css\">\n" +
    "  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/mocha/2.1.0/mocha.min.js\"></script>\n" +
    "  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/expect.js/0.2.0/expect.min.js\"></script>\n" +
    "  <script src=\"../src/sha3.js\"></script>\n" +
    "</head>\n" +
    "<body>\n" +
    "  <div id=\"mocha\"></div>\n" +
    "  <script>\n" +
    "    mocha.setup('bdd');\n" +
    "  </script>\n" +
    "  <script src=\"test.js\"></script>\n" +
    "  <script src=\"test-shake.js\"></script>\n" +
    "  <script src=\"test-cshake.js\"></script>\n" +
    "  <script src=\"test-kmac.js\"></script>\n" +
    "  <script>\n" +
    "    mocha.checkLeaks();\n" +
    "    mocha.run();\n" +
    "  </script>\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/scrypt-js/index.html',
    "<html>\n" +
    "    <head>\n" +
    "        <title>scrypt-js</title>\n" +
    "        <style type=\"text/css\">\n" +
    "            body {\n" +
    "               background: #f8f8f8;\n" +
    "                color: #333;\n" +
    "                margin: 40px 0;\n" +
    "            }\n" +
    "\n" +
    "            body > div {\n" +
    "                font-family: sans-serif;\n" +
    "                margin-left: 50%;\n" +
    "            }\n" +
    "\n" +
    "            body > div > div {\n" +
    "                background: #fff;\n" +
    "                border: 2px solid #888;\n" +
    "                margin-left: -400px;\n" +
    "                padding: 30px 20px 0;\n" +
    "                width: 800px;\n" +
    "            }\n" +
    "\n" +
    "            h1 {\n" +
    "                margin: 0 0 30px 0;\n" +
    "                text-align: center;\n" +
    "            }\n" +
    "\n" +
    "            .forms {\n" +
    "                float: right;\n" +
    "                font-size: 14px;\n" +
    "                padding-right: 10px;\n" +
    "            }\n" +
    "\n" +
    "            .forms a {\n" +
    "                color: #aaa;\n" +
    "                cursor: pointer;\n" +
    "            }\n" +
    "\n" +
    "            .forms b {\n" +
    "                padding: 0 15px;\n" +
    "            }\n" +
    "\n" +
    "            .forms .selected {\n" +
    "                color: #333;\n" +
    "            }\n" +
    "\n" +
    "            input {\n" +
    "                border: 1px solid #aaa;\n" +
    "                border-radius: 5px;\n" +
    "                font-size: 20px;\n" +
    "                padding: 8px 10px;\n" +
    "                width: 100%;\n" +
    "            }\n" +
    "\n" +
    "            input[type=submit] {\n" +
    "                background-color: #dfd;\n" +
    "                cursor: pointer;\n" +
    "                margin-top: 40px;\n" +
    "            }\n" +
    "\n" +
    "            input[type=submit]:active {\n" +
    "                background-color: #cfc;\n" +
    "                color: #040;\n" +
    "            }\n" +
    "\n" +
    "            input[type=submit].cancel {\n" +
    "                background-color: #fdd;\n" +
    "            }\n" +
    "\n" +
    "            input[type=submit]:active.cancel {\n" +
    "                background-color: #fcc;\n" +
    "                color: #400;\n" +
    "            }\n" +
    "\n" +
    "            input {\n" +
    "                margin-bottom: 30px;\n" +
    "            }\n" +
    "\n" +
    "            .param:first-child {\n" +
    "                 margin-left: 0;\n" +
    "            }\n" +
    "\n" +
    "            .param {\n" +
    "                float: left;\n" +
    "                margin-left: 66px;\n" +
    "                width: 150px;\n" +
    "            }\n" +
    "\n" +
    "            .param input {\n" +
    "            }\n" +
    "\n" +
    "            .clearfix {\n" +
    "                clear: both;\n" +
    "            }\n" +
    "\n" +
    "            #result {\n" +
    "                margin: 40px 0;\n" +
    "            }\n" +
    "\n" +
    "            .progress {\n" +
    "                border: 2px solid #666;\n" +
    "                border-radius: 15px;\n" +
    "                height: 30px;\n" +
    "                position: relative;\n" +
    "                width: 100%;\n" +
    "            }\n" +
    "\n" +
    "            #progressBar {\n" +
    "                background: #ccf;\n" +
    "                border-radius: 15px;\n" +
    "                position: absolute;\n" +
    "                left: 0;\n" +
    "                top: 0;\n" +
    "                width: 0;\n" +
    "                height: 30px;\n" +
    "            }\n" +
    "\n" +
    "            #progressAmount {\n" +
    "                position: absolute;\n" +
    "                left: 0;\n" +
    "                top: 0;\n" +
    "                text-align: center;\n" +
    "                line-height: 30px;\n" +
    "                width: 100%;\n" +
    "                height: 30px;\n" +
    "            }\n" +
    "        </style>\n" +
    "    </head>\n" +
    "    <body>\n" +
    "        <div>\n" +
    "            <div>\n" +
    "                <h1>scrypt-js</h1>\n" +
    "                <div>\n" +
    "                    <div><b>Password</b> <span id=\"form-password\" class=\"forms\"><a class=\"form selected\">UTF-8 (NFKC)</a><b>&bull;</b><a class=\"form\">UTF-8 (NFKD)</a><b>&bull;</b><a class=\"form\">hex</a></span></div>\n" +
    "                    <input id=\"pbkdf-password\" type=\"text\" value=\"password\" />\n" +
    "\n" +
    "                    <div><b>Salt</b> <span id=\"form-salt\" class=\"forms\"><a class=\"form selected\">UTF-8 (NFKC)</a><b>&bull;</b><a class=\"form\">UTF-8 (NFKD)</a><b>&bull;</b><a class=\"form\">hex</a></span></div>\n" +
    "                    <input id=\"pbkdf-salt\" type=\"text\" value=\"salt\" />\n" +
    "\n" +
    "                    <div class=\"clearfix\"></div>\n" +
    "                    <div>\n" +
    "                        <div class=\"param\">\n" +
    "                            <div><b>Nlog2</b> [1, 63]</div>\n" +
    "                            <input id=\"pbkdf-Nlog2\" type=\"text\" value=\"10\" />\n" +
    "                        </div>\n" +
    "                        <div class=\"param\">\n" +
    "                            <div><b>r</b></div>\n" +
    "                            <input id=\"pbkdf-r\" type=\"text\" value=\"8\" />\n" +
    "                        </div>\n" +
    "                        <div class=\"param\">\n" +
    "                            <div><b>p</b></div>\n" +
    "                            <input id=\"pbkdf-p\" type=\"text\" value=\"1\" />\n" +
    "                        </div>\n" +
    "                        <div class=\"param\">\n" +
    "                            <div><b>dkLen</b></div>\n" +
    "                            <input id=\"pbkdf-dkLen\" type=\"text\" value=\"32\" />\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"clearfix\"></div>\n" +
    "                    <input id=\"pbkdf-submit\" type=\"submit\" value=\"Compute scrypt\" />\n" +
    "                    <div class=\"progress\"><div id=\"progressBar\"></div><div id=\"progressAmount\">0%</div></div>\n" +
    "                    <div id=\"result\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <script src=\"thirdparty/setImmediate.js\" type=\"text/javascript\"></script>\n" +
    "        <script src=\"thirdparty/unorm.js\" type=\"text/javascript\"></script>\n" +
    "        <script src=\"thirdparty/buffer.js\" type=\"text/javascript\"></script>\n" +
    "\n" +
    "        <script src=\"scrypt.js\" type=\"text/javascript\"></script>\n" +
    "\n" +
    "        <script type=\"text/javascript\">\n" +
    "\n" +
    "            function get(id) { return document.getElementById(id); }\n" +
    "            function normalized(field) {\n" +
    "                var value = get('pbkdf-' + field).value;\n" +
    "                var forms = document.getElementById('form-' + field).getElementsByClassName('selected');\n" +
    "                if (forms.length !== 1) { throw new Error('missing form'); }\n" +
    "                var form = forms[0].innerHTML;\n" +
    "\n" +
    "                if (form.indexOf('NFKC') >= 0) {\n" +
    "                    return new buffer.SlowBuffer(value.normalize('NFKC'), 'utf8');\n" +
    "                } else if (form.indexOf('NFKD') >= 0) {\n" +
    "                    return new buffer.SlowBuffer(value.normalize('NFKD'), 'utf8');\n" +
    "                } else if (form.indexOf('hex') >= 0) {\n" +
    "                    if (!value.match(/^[0-9A-F][0-9A-F]$/i)) {\n" +
    "                        throw new Error(field + ': invalid hex string');\n" +
    "                    }\n" +
    "                    return new buffer.SlowBuffer(value, 'hex');\n" +
    "                }\n" +
    "\n" +
    "                throw new Error('Unknown ');\n" +
    "            }\n" +
    "\n" +
    "            var firstLine = true;\n" +
    "            function clearConsole() {\n" +
    "                firstLine = true;\n" +
    "                get('result').innerHTML = '';\n" +
    "            }\n" +
    "\n" +
    "            function printConsole(message) {\n" +
    "                if (!firstLine) { message = '<br /><br />' + message; }\n" +
    "                firstLine = false;\n" +
    "                get('result').innerHTML += message;\n" +
    "            }\n" +
    "\n" +
    "            (function() {\n" +
    "                var forms = document.getElementsByClassName('form');\n" +
    "                for (var i = 0; i < forms.length; i++) {\n" +
    "                    forms[i].onclick = (function(form) {\n" +
    "                        return function() {\n" +
    "                            console.log(form);\n" +
    "                            var selected = form.parentNode.getElementsByClassName('selected')[0];\n" +
    "                            selected.classList.remove('selected');\n" +
    "                            form.classList.add('selected');\n" +
    "                        };\n" +
    "                    })(forms[i]);\n" +
    "                }\n" +
    "            })();\n" +
    "\n" +
    "            var submit = get('pbkdf-submit');\n" +
    "\n" +
    "            var done = null;\n" +
    "            submit.onclick = function() {\n" +
    "                if (done === null) {\n" +
    "                    clearConsole();\n" +
    "\n" +
    "                    done = false;\n" +
    "\n" +
    "                    try {\n" +
    "                        var password = normalized('password'); //get('pbkdf-password').value;\n" +
    "                        var salt = normalized('salt');// get('pbkdf-salt').value;\n" +
    "                        var N = 1 << parseInt(get('pbkdf-Nlog2').value);\n" +
    "                        var r = get('pbkdf-r').value;\n" +
    "                        var p = get('pbkdf-p').value;\n" +
    "                        var dkLen = get('pbkdf-dkLen').value;\n" +
    "                        console.log(password, salt, N, r, p)\n" +
    "\n" +
    "                    } catch (error) {\n" +
    "                        printConsole(error.message);\n" +
    "\n" +
    "                        done = null;\n" +
    "                        return;\n" +
    "                    }\n" +
    "\n" +
    "                    submit.classList.add('cancel');\n" +
    "                    submit.value = \"Cancel scrypt\";\n" +
    "\n" +
    "                    printConsole('Started: N=' + N + ', r=' + r + ' p=' + p +\n" +
    "                        ', password=0x' + password.toString('hex') + ', salt=0x' + salt.toString('hex'));\n" +
    "\n" +
    "                    var t0 = (new Date()).getTime();\n" +
    "                    scrypt(password, salt, N, r, p, dkLen, function(error, progress, key) {\n" +
    "\n" +
    "                        if (error) {\n" +
    "                            printConsole(\"Cancelled: \" + parseInt(100 * progress) + \"% done\");\n" +
    "\n" +
    "                        } else if (key) {\n" +
    "                            key = new buffer.SlowBuffer(key);\n" +
    "                            printConsole(\"Generated: \" + key.toString('hex'));\n" +
    "                            printConsole(\"Complete: \" + (((new Date()).getTime() - t0) / 1000) + 's');\n" +
    "                        }\n" +
    "\n" +
    "                        if (error || key) {\n" +
    "                            submit.classList.remove('cancel');\n" +
    "                            submit.value = \"Compute scrypt\";\n" +
    "\n" +
    "                            done = null;\n" +
    "                            progress = 0;\n" +
    "\n" +
    "                        } else if (done) {\n" +
    "                            return true;\n" +
    "                        }\n" +
    "\n" +
    "                        get('progressBar').style.width = parseInt(100 * progress) + '%';\n" +
    "                        get('progressAmount').innerHTML = parseInt(100 * progress) + '%';\n" +
    "                    });\n" +
    "\n" +
    "                } else if (done === false) {\n" +
    "                    done = true;\n" +
    "                }\n" +
    "            };\n" +
    "        </script>\n" +
    "    </body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/secrets.js-grempe/benchmark/benchmark.html',
    "<html>\n" +
    "  <head>\n" +
    "    <title>benchmark</title>\n" +
    "  </head>\n" +
    "  <body>\n" +
    "\n" +
    "    <script src=\"../node_modules/benchmark/benchmark.js\"></script>\n" +
    "    <script src=\"../secrets.js\"></script>\n" +
    "\n" +
    "    <script charset=\"utf-8\">\n" +
    "      var suite = new Benchmark.Suite;\n" +
    "\n" +
    "      suite.add('share and combine', function() {\n" +
    "        var key, shares, comb, newShare;\n" +
    "        key = secrets.random(512);\n" +
    "        shares = secrets.share(key, 10, 5);\n" +
    "        comb = secrets.combine( shares );\n" +
    "        newShare = secrets.newShare(8, shares);\n" +
    "        comb = secrets.combine( shares.slice(1,5).concat(newShare) );\n" +
    "      })\n" +
    "      // .add('newPadLeft()', function() {\n" +
    "      //   secrets._newPadLeft(padding, 256);\n" +
    "      // })\n" +
    "      // add listeners\n" +
    "      .on('cycle', function(event) {\n" +
    "        console.log(String(event.target));\n" +
    "      })\n" +
    "      .on('complete', function() {\n" +
    "        console.log('Fastest is ' + this.filter('fastest').pluck('name'));\n" +
    "      })\n" +
    "      // run async\n" +
    "      .run({ 'async': false });\n" +
    "    </script>\n" +
    "  </body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/secrets.js-grempe/examples/AMD/www/index.html',
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "    <head>\n" +
    "        <script data-main=\"app\" src=\"lib/require.js\"></script>\n" +
    "    </head>\n" +
    "    <body>\n" +
    "        <h1>Hello Secrets!</h1>\n" +
    "\n" +
    "        <script>\n" +
    "          require(['../../../secrets'], function() {\n" +
    "              var key, comb, shares, newShare;\n" +
    "              key = secrets.random(512);\n" +
    "              shares = secrets.share(key, 10, 5);\n" +
    "              comb = secrets.combine( shares );\n" +
    "              newShare = secrets.newShare(8, shares);\n" +
    "              comb = secrets.combine( shares.slice(1,5).concat(newShare) );\n" +
    "              document.write('You should see two identical keys below, with a key both before and after a share and combine operation.\\n\\n' + key + '\\n' + comb);\n" +
    "          });\n" +
    "        </script>\n" +
    "\n" +
    "    </body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/secrets.js-grempe/examples/example_js_global.html',
    "<!-- USAGE : Just open this file in your web browser of choice -->\n" +
    "\n" +
    "<html>\n" +
    "  <head>\n" +
    "    <title>secrets.js - HTML w/ JS Global Test</title>\n" +
    "  </head>\n" +
    "\n" +
    "  <body>\n" +
    "\n" +
    "    <h1>secrets.js</h1>\n" +
    "    <p>You can also open a javascript console to interact directly with the 'secrets' global.</p>\n" +
    "\n" +
    "    <h2>The following code is being run:</h2>\n" +
    "    <pre>\n" +
    "        var key, comb, shares, newShare;\n" +
    "        key = secrets.random(512);\n" +
    "        shares = secrets.share(key, 10, 5);\n" +
    "        comb = secrets.combine( shares );\n" +
    "        newShare = secrets.newShare(8, shares);\n" +
    "        comb = secrets.combine( shares.slice(1,5).concat(newShare) );\n" +
    "        document.write('You should see two identical keys below, with a key both before and after a share and combine operation.\\n\\n' + key + '\\n' + comb);\n" +
    "    </pre>\n" +
    "\n" +
    "    <br />\n" +
    "\n" +
    "    <h2>Code Output:</h2>\n" +
    "    <script src=\"../secrets.js\"></script>\n" +
    "    <script charset=\"utf-8\">\n" +
    "      var key, comb, shares, newShare;\n" +
    "      key = secrets.random(512);\n" +
    "      shares = secrets.share(key, 10, 5);\n" +
    "      comb = secrets.combine( shares );\n" +
    "      newShare = secrets.newShare(8, shares);\n" +
    "      comb = secrets.combine( shares.slice(1,5).concat(newShare) );\n" +
    "      document.write('You should see two identical keys below, with a key both before and after a share and combine operation.\\n\\n' + key + '\\n' + comb);\n" +
    "    </script>\n" +
    "\n" +
    "  </body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/secrets.js-grempe/SpecRunner.html',
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "  <head>\n" +
    "    <meta charset=\"utf-8\">\n" +
    "    <title>Jasmine Spec Runner v2.2.0</title>\n" +
    "\n" +
    "    <link rel=\"shortcut icon\" type=\"image/png\" href=\"node_modules/jasmine-core/images/jasmine_favicon.png\">\n" +
    "    <link rel=\"stylesheet\" href=\"node_modules/jasmine-core/lib/jasmine-core/jasmine.css\">\n" +
    "\n" +
    "    <script src=\"node_modules/jasmine-core/lib/jasmine-core/jasmine.js\"></script>\n" +
    "    <script src=\"node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js\"></script>\n" +
    "    <script src=\"node_modules/jasmine-core/lib/jasmine-core/boot.js\"></script>\n" +
    "\n" +
    "    <!-- include source files here... -->\n" +
    "    <script src=\"secrets.js\"></script>\n" +
    "\n" +
    "    <!-- include spec files here... -->\n" +
    "    <script src=\"spec/SpecHelper.js\"></script>\n" +
    "    <script src=\"spec/SecretsSpec.js\"></script>\n" +
    "    <script src=\"spec/SecretsPrivateSpec.js\"></script>\n" +
    "  </head>\n" +
    "\n" +
    "  <body>\n" +
    "  </body>\n" +
    "\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/secrets.js-grempe/SpecRunnerMinified.html',
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "  <head>\n" +
    "    <meta charset=\"utf-8\">\n" +
    "    <title>Jasmine Spec Runner v2.2.0</title>\n" +
    "\n" +
    "    <link rel=\"shortcut icon\" type=\"image/png\" href=\"node_modules/jasmine-core/images/jasmine_favicon.png\">\n" +
    "    <link rel=\"stylesheet\" href=\"node_modules/jasmine-core/lib/jasmine-core/jasmine.css\">\n" +
    "\n" +
    "    <script src=\"node_modules/jasmine-core/lib/jasmine-core/jasmine.js\"></script>\n" +
    "    <script src=\"node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js\"></script>\n" +
    "    <script src=\"node_modules/jasmine-core/lib/jasmine-core/boot.js\"></script>\n" +
    "\n" +
    "    <!-- include source files here... -->\n" +
    "    <script src=\"secrets.min.js\"></script>\n" +
    "\n" +
    "    <!-- include spec files here... -->\n" +
    "    <script src=\"spec/SpecHelper.js\"></script>\n" +
    "    <script src=\"spec/SecretsSpec.js\"></script>\n" +
    "    <script src=\"spec/SecretsPrivateSpec.js\"></script>\n" +
    "  </head>\n" +
    "\n" +
    "  <body>\n" +
    "  </body>\n" +
    "\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/sjcl/browserTest/browserTest.html',
    "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\"\n" +
    "        \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n" +
    "        \n" +
    "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n" +
    "<head>\n" +
    "  <title>SJCL browser test</title>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"test.css\"/>\n" +
    "  <script type=\"text/javascript\" src=\"browserUtil.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"../test/run_tests_browser.js\"></script>\n" +
    "</head>\n" +
    "<body onload=\"testCores(['sjcl.js'])\">\n" +
    "  <h1>SJCL browser test</h1>\n" +
    "  <div id=\"status\">Waiting for tests to begin...</div>\n" +
    "  <div id=\"print\"></div>\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/sjcl/browserTest/entropy.html',
    "<html>\n" +
    "<head>\n" +
    "\n" +
    "<title>Entropy Generator Progress</title>\n" +
    "<!-- ProgressBar source: http://stackoverflow.com/questions/7190898/progress-bar-with-html-and-css -->\n" +
    "\n" +
    "<style>\n" +
    "#progressbar {\n" +
    "  background-color: black;\n" +
    "  border-radius: 13px; /* (height of inner div) / 2 + padding */\n" +
    "  padding: 3px;\n" +
    "}\n" +
    "#progressbar > div {\n" +
    "   background-color: orange;\n" +
    "   width: 0%; /* Adjust with JavaScript */\n" +
    "   height: 20px;\n" +
    "   border-radius: 10px;\n" +
    "}\n" +
    "</style>\n" +
    "\n" +
    "<script type=\"text/javascript\" src=\"../sjcl.js\">\n" +
    "</script>\n" +
    "\n" +
    "<script type=\"text/javascript\">\n" +
    "\n" +
    "var busy = 0;\n" +
    "var collecting = 0;\n" +
    "\n" +
    "function showprogress () {\n" +
    "	var barwidth = document.getElementById (\"progresswidth\");\n" +
    "	var paranoia = parseInt (document.getElementById (\"paranoialevel\").value);\n" +
    "	var progress = 100 * sjcl.random.getProgress (paranoia);\n" +
    "	barwidth.style.width = progress+\"%\";\n" +
    "	if (!sjcl.random.isReady (paranoia)) {\n" +
    "		setTimeout (\"showprogress()\", 10, \"JavaScript\");\n" +
    "	} else {\n" +
    "		busy = 0;\n" +
    "		document.getElementById (\"startbutton\").style.disabled = 1;\n" +
    "	}\n" +
    "}\n" +
    "\n" +
    "function startup () {\n" +
    "	if (collecting == 0) {\n" +
    "		sjcl.random.startCollectors ();\n" +
    "		collecting = 1;\n" +
    "	}\n" +
    "	if (busy == 0) {\n" +
    "		busy = 1;\n" +
    "		document.getElementById (\"startbutton\").style.disabled = 1;\n" +
    "		showprogress ();\n" +
    "	}\n" +
    "}\n" +
    "\n" +
    "function consume (numbits) {\n" +
    "	var collector = document.getElementById (\"collector\");\n" +
    "	collector.value = \"retrieving random data\";\n" +
    "	var paranoia = document.getElementById (\"paranoialevel\").value;\n" +
    "	var numwords = Math.ceil (numbits / 32);\n" +
    "	var bits = sjcl.random.randomWords (numwords, paranoia);\n" +
    "	collector.value = '';\n" +
    "	for (var i=0; i<numwords; i++) {\n" +
    "		var hi = (bits [i] >> 16) & 0x0000ffff;\n" +
    "		var lo =  bits [i]        & 0x0000ffff;\n" +
    "		collector.value = collector.value + hi.toString (16) + lo.toString (16);\n" +
    "	}\n" +
    "	startup ();\n" +
    "}\n" +
    "\n" +
    "</script>\n" +
    "\n" +
    "</head>\n" +
    "<body>\n" +
    "<h1>Entropy Generator Progress</h1>\n" +
    "\n" +
    "<p>Target: 192 bits, available at paranoia level 5.</p>\n" +
    "\n" +
    "<p>Corresponding paranoia level from [0,1..10]: <input type=\"text\" value=\"5\" id=\"paranoialevel\"/> <input type=button onclick=\"startup ()\" id=\"startbutton\" value=\" Start &gt;&gt; \"> (the idea being that you can see the progress bar advance gently from empty/black to full/yellow after you press this)</p>\n" +
    "\n" +
    "<p><input type=button onclick=\"consume (192)\" value=\" Consume 192 bits &gt;&gt; \"><input type=text id=collector size=50 value=\"\" onkeypress=\"consume (192)\"> (also consumes 192 bits with every keypress in the text field; use key repeat to consume swiftly)</p>\n" +
    "\n" +
    "<div id=\"progressbar\">\n" +
    "  <div id=\"progresswidth\"></div>\n" +
    "</div>\n" +
    "\n" +
    "<p>Please move your mouse, play around and generally introduce entropy into your environment.</p>\n" +
    "\n" +
    "</body>\n" +
    "</html>"
  );


  $templateCache.put('node_modules/sjcl/browserTest/performance.html',
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "<head>\n" +
    "  <title>SJCL browser performance</title>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"test.css\"/>\n" +
    "</head>\n" +
    "<body>\n" +
    "  <h1>SJCL browser performance</h1>\n" +
    "  <div id=\"status\">Waiting for tests to begin...</div>\n" +
    "  <div id=\"print\"></div>\n" +
    "  <script type=\"text/javascript\" src=\"../sjcl.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"browserUtil.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"performance.js\"></script>\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/sjcl/demo/index.html',
    "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\"\n" +
    "        \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n" +
    "        \n" +
    "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n" +
    "<head>\n" +
    "  <title>SJCL demo</title>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"example.css\"/>\n" +
    "  <script type=\"text/javascript\" src=\"../sjcl.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"form.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"example.js\"></script>\n" +
    "</head>\n" +
    "<body onload=\"loaded()\">\n" +
    "  <h1>SJCL demo</h1>\n" +
    "\n" +
    "  <div class=\"header\">\n" +
    "  <p>This page is a demo of the Stanford Javascript Crypto Library. To get started, just type in a password in the left pane and a secret message in the middle pane, then click \"encrypt\". Encryption takes place in your browser and we never see the plaintext.</p>\n" +
    "  \n" +
    "  <p>SJCL has lots of other options, many of which are shown in the grey boxes.</p>\n" +
    "  </div>\n" +
    "\n" +
    "  <form id=\"theForm\" onsubmit=\"return false;\">\n" +
    "  <div class=\"column\" id=\"ckey\">\n" +
    "    <!-- Password and pbkdf2 parameters -->\n" +
    "    <div class=\"box\" id=\"ppassword\">\n" +
    "      <h2>Password</h2>\n" +
    "      <div class=\"section\">\n" +
    "        <label for=\"password\">Password:</label>\n" +
    "        <input type=\"password\" class=\"wide\" name=\"password\" id=\"password\" autocomplete=\"off\" tabindex=\"1\"/>\n" +
    "        <p class=\"explanation\">\n" +
    "          Choose a strong, random password.\n" +
    "        </p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div class=\"box\" id=\"pkey\">\n" +
    "      <h2>Key Derivation</h2>\n" +
    "      <div class=\"section\">\n" +
    "        <div>\n" +
    "          <label for=\"salt\">Salt:</label>\n" +
    "          <a class=\"random floatright\" href=\"javascript:randomize('salt',2,0)\">random</a>\n" +
    "        </div>\n" +
    "        <input type=\"text\" id=\"salt\" class=\"wide hex\" autocomplete=\"off\" size=\"17\" maxlength=\"35\"/>\n" +
    "        <input type=\"checkbox\" name=\"freshsalt\" id=\"freshsalt\" autocomplete=\"off\" checked=\"checked\"/>\n" +
    "        <label for=\"freshsalt\">Use fresh random salt for each new password</label>\n" +
    "        <p class=\"explanation\">\n" +
    "          Salt adds more variability to your key, and prevents attackers\n" +
    "          from using <a href=\"http://en.wikipedia.org/wiki/Rainbow_table\">rainbow tables</a> to attack it.\n" +
    "        </p>     \n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"section\">\n" +
    "        <label for=\"iter\">Strengthen by a factor of:</label>\n" +
    "        <input type=\"text\" name=\"iter\" id=\"iter\" value=\"1000\" class=\"numeric\" size=\"5\" maxlength=\"5\" autocomplete=\"off\"/>\n" +
    "        <p class=\"explanation\">\n" +
    "          Strengthening makes it slower to compute the key corresponding to your\n" +
    "          password.  This makes it take much longer for an attacker to guess it.\n" +
    "        </p>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"section\">\n" +
    "        Key size:\n" +
    "        <input type=\"radio\" name=\"keysize\" value=\"128\" id=\"key128\" checked=\"checked\" autocomplete=\"off\" onclick=\"extendKey(4)\"/>\n" +
    "        <label for=\"key128\">128</label>\n" +
    "        <input type=\"radio\" name=\"keysize\" value=\"192\" id=\"key192\" autocomplete=\"off\" onclick=\"extendKey(6)\"/>\n" +
    "        <label for=\"key192\">192</label>\n" +
    "        <input type=\"radio\" name=\"keysize\" value=\"256\" id=\"key256\" autocomplete=\"off\" onclick=\"extendKey(8)\"/>\n" +
    "        <label for=\"key256\">256</label>\n" +
    "        <p class=\"explanation\">\n" +
    "          128 bits should be secure enough, but you can generate a longer\n" +
    "          key if you wish.\n" +
    "        </p>\n" +
    "      </div>\n" +
    "\n" +
    "      <!-- cipher key -->\n" +
    "      <div class=\"section\">\n" +
    "        <div>\n" +
    "          <label for=\"key\">Key:</label>\n" +
    "          <!--\n" +
    "          <a class=\"random floatright\" href=\"javascript:randomizeKey()\">random</a>\n" +
    "          -->\n" +
    "        </div>\n" +
    "        <textarea id=\"key\" name=\"key\" class=\"hex\" rows=\"2\" autocomplete=\"off\"></textarea>\n" +
    "        <p class=\"explanation\">\n" +
    "          This key is computed from your password, salt and strengthening factor.  It\n" +
    "          will be used internally by the cipher.  Instead of using a password, you can\n" +
    "          enter a key here directly.  If you do, it should be 32, 48 or 64 hexadecimal\n" +
    "          digits (128, 192 or 256 bits).\n" +
    "        </p>\n" +
    "      </div>\n" +
    "     \n" +
    "    </div>\n" +
    "  </div>\n" +
    "    \n" +
    "    <!-- mode controls -->\n" +
    "  <div class=\"column\" id=\"cmode\">\n" +
    "    <div class=\"box\">\n" +
    "      <h2>Cipher Parameters</h2>\n" +
    "      <p class=\"explanation\">\n" +
    "        SJCL encrypts your data with the <a href=\"http://en.wikipedia.org/wiki/Advanced_Encryption_Standard\"><acronym title=\"Advanced Encryption Standard\">AES</acronym></a> block cipher.\n" +
    "      </p>\n" +
    "      <div class=\"section\">\n" +
    "        Cipher mode:\n" +
    "        <input type=\"radio\" name=\"mode\" value=\"ccm\" id=\"ccm\" checked=\"checked\" autocomplete=\"off\"/>\n" +
    "        <label for=\"ccm\"><acronym title=\"Counter mode with Cipher block chaining Message authentication code\">CCM</acronym></label>\n" +
    "        <input type=\"radio\" name=\"mode\" value=\"ocb2\" id=\"ocb2\" autocomplete=\"off\"/>\n" +
    "        <label for=\"ocb2\"><acronym title=\"Offset CodeBook mode, version 2.0\">OCB2</acronym></label>\n" +
    "        <input type=\"radio\" name=\"mode\" value=\"gcm\" id=\"gcm\" autocomplete=\"off\"/>\n" +
    "        <label for=\"gcm\"><acronym title=\"Galois Counter Mode\">GCM</acronym></label>\n" +
    "        <p class=\"explanation\">\n" +
    "          The cipher mode is a standard for how to use AES and other\n" +
    "          algorithms to encrypt and authenticate your message.\n" +
    "          <a href=\"http://en.wikipedia.org/wiki/OCB_mode\">OCB2 mode</a> (patented) and\n" +
    "          <a href=\"http://en.wikipedia.org/wiki/GCM_mode\">GCM mode</a> (unencumbered)\n" +
    "          are slightly faster and have more features than\n" +
    "          <a href=\"http://en.wikipedia.org/wiki/CCM_mode\">CCM mode</a>.\n" +
    "        </p>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=\"section\">\n" +
    "        <div>\n" +
    "          <label for=\"iv\">Initialization vector:</label>\n" +
    "          <a class=\"random floatright\" href=\"javascript:randomize('iv',4,0)\">random</a>\n" +
    "        </div>\n" +
    "        <input type=\"text\" name=\"iv\" id=\"iv\" class=\"wide hex\" size=\"32\" maxlength=\"35\" autocomplete=\"off\"/>\n" +
    "        <input type=\"checkbox\" id=\"freshiv\" autocomplete=\"off\" checked=\"checked\"/>\n" +
    "        <label for=\"freshiv\">Choose a new random IV for every message.</label>\n" +
    "        <p class=\"explanation\">\n" +
    "          The IV needs to be different for every message you send.  It adds\n" +
    "          randomness to your message, so that the same message will look\n" +
    "          different each time you send it.\n" +
    "        </p>\n" +
    "        <p class=\"explanation\">\n" +
    "          Be careful: CCM mode and GCM mode don't use\n" +
    "          the whole IV, so changing just part of it isn't enough.\n" +
    "        </p>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=\"section\">\n" +
    "        Authentication strength:\n" +
    "        <input type=\"radio\" name=\"tag\" value=\"64\" id=\"tag64\" autocomplete=\"off\" checked=\"checked\"/>\n" +
    "        <label for=\"tag64\">64</label>\n" +
    "        <input type=\"radio\" name=\"tag\" value=\"96\" id=\"tag96\" autocomplete=\"off\"/>\n" +
    "        <label for=\"tag96\">96</label>\n" +
    "        <input type=\"radio\" name=\"tag\" value=\"128\" id=\"tag128\" autocomplete=\"off\"/>\n" +
    "        <label for=\"tag128\">128</label>\n" +
    "        <p class=\"explanation\">\n" +
    "          SJCL adds a an authentication tag to your message to make sure\n" +
    "          nobody changes it.  The longer the authentication tag, the harder it is\n" +
    "          for somebody to change your encrypted message without you noticing.  64\n" +
    "          bits is probably enough.\n" +
    "        </p>\n" +
    "      </div>\n" +
    "      \n" +
    "      <div class=\"section\">\n" +
    "        <input type=\"checkbox\" name=\"json\" id=\"json\" autocomplete=\"off\" checked=\"checked\"/>\n" +
    "        <label for=\"json\">Send the parameters and authenticated data along\n" +
    "          with the message.</label>\n" +
    "         <p class=\"explanation\">\n" +
    "           These parameters are required to decrypt your message later.  If the\n" +
    "           person you're sending the message to knows them, you don't need to send\n" +
    "           them so your message will be shorter.\n" +
    "         </p>\n" +
    "         <p class=\"explanation\">\n" +
    "           Default parameters won't be sent.  Your password won't be sent, either.\n" +
    "           The salt and iv will be encoded in base64 instead of hex, so they'll\n" +
    "           look different from what's in the box.\n" +
    "         </p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  \n" +
    "  <div class=\"column\" id=\"ctexts\">\n" +
    "    <div id=\"pplaintext\" class=\"box\">\n" +
    "      <h2>Plaintext</h2>\n" +
    "      <div class=\"section\">\n" +
    "        <label for=\"plaintext\">Secret message:</label>\n" +
    "        <textarea id=\"plaintext\" autocomplete=\"off\" rows=\"5\" tabindex=\"2\"></textarea>\n" +
    "        <div class=\"explanation\">\n" +
    "          This message will be encrypted, so that nobody can read it or change it\n" +
    "          without your password.\n" +
    "        </div>\n" +
    "      </div>  \n" +
    "   \n" +
    "      <div class=\"section\">\n" +
    "        <label for=\"adata\">Authenticated data:</label>\n" +
    "        <textarea id=\"adata\" autocomplete=\"off\" tabindex=\"3\"></textarea>\n" +
    "        <div class=\"explanation\">\n" +
    "          This auxilliary message isn't secret, but its integrity will be checked\n" +
    "          along with the integrity of the message.\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div id=\"buttons\">\n" +
    "      <a href=\"javascript:doEncrypt()\" id=\"encrypt\" tabindex=\"4\"><span class=\"turnDown\">encrypt</span></a>\n" +
    "      <a href=\"javascript:doDecrypt()\" id=\"decrypt\" tabindex=\"6\"><span class=\"turnUp\">decrypt</span></a>\n" +
    "    </div>\n" +
    "    \n" +
    "    <div id=\"pciphertext\" class=\"box\">\n" +
    "      <h2>Ciphertext</h2>\n" +
    "      <label for=\"ciphertext\">Ciphertext:</label>\n" +
    "      <textarea id=\"ciphertext\" autocomplete=\"off\" rows=\"7\" tabindex=\"5\"></textarea>\n" +
    "      <div class=\"explanation\">\n" +
    "        Your message, encrypted and authenticated so that nobody can read it\n" +
    "        or change it without your password.\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/through2/LICENSE.html',
    "<!doctype html>\n" +
    "<!-- Created with GFM2HTML: https://github.com/rvagg/gfm2html -->\n" +
    "<html lang=\"en\">\n" +
    "  <head>\n" +
    "    <meta charset=\"utf-8\">\n" +
    "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n" +
    "    <title></title>\n" +
    "    <meta name=\"description\" content=\"\">\n" +
    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
    "    <meta name=\"created-with\" content=\"https://github.com/rvagg/gfm2html\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "/* most of normalize.css */\n" +
    "article,aside,details,figcaption,figure,footer,header,hgroup,main,nav,section,summary{display:block;}[hidden],template{display:none;}html{font-family:sans-serif;/*1*/-ms-text-size-adjust:100%;/*2*/-webkit-text-size-adjust:100%;/*2*/}body{margin:0;}a{background:transparent;}a:focus{outline:thindotted;}a:active,a:hover{outline:0;}h1{font-size:2em;margin:0.67em0;}abbr[title]{border-bottom:1pxdotted;}b,strong{font-weight:bold;}dfn{font-style:italic;}hr{-moz-box-sizing:content-box;box-sizing:content-box;height:0;}mark{background:#ff0;color:#000;}code,kbd,pre,samp{font-family:monospace,serif;font-size:1em;}pre{white-space:pre-wrap;}q{quotes:\"\\201C\"\"\\201D\"\"\\2018\"\"\\2019\";}small{font-size:80%;}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline;}sup{top:-0.5em;}sub{bottom:-0.25em;}img{border:0;}svg:not(:root){overflow:hidden;}table{border-collapse:collapse;border-spacing:0;}\n" +
    "\n" +
    "html {\n" +
    "  font: 14px 'Helvetica Neue', Helvetica, arial, freesans, clean, sans-serif;\n" +
    "}\n" +
    "\n" +
    ".container {\n" +
    "  line-height: 1.6;\n" +
    "  color: #333;\n" +
    "  background: #eee;\n" +
    "  border-radius: 3px;\n" +
    "  padding: 3px;\n" +
    "  width: 790px;\n" +
    "  margin: 10px auto;\n" +
    "}\n" +
    "\n" +
    ".body-content {\n" +
    "  background-color: #fff;\n" +
    "  border: 1px solid #CACACA;\n" +
    "  padding: 30px;\n" +
    "}\n" +
    "\n" +
    ".body-content > *:first-child {\n" +
    "  margin-top: 0 !important;\n" +
    "}\n" +
    "\n" +
    "a, a:visited {\n" +
    "  color: #4183c4;\n" +
    "  text-decoration: none;\n" +
    "}\n" +
    "\n" +
    "a:hover {\n" +
    "  text-decoration: underline;\n" +
    "}\n" +
    "\n" +
    "p, blockquote, ul, ol, dl, table, pre {\n" +
    "  margin: 15px 0;\n" +
    "}\n" +
    "\n" +
    "  .markdown-body h1\n" +
    ", .markdown-body h2\n" +
    ", .markdown-body h3\n" +
    ", .markdown-body h4\n" +
    ", .markdown-body h5\n" +
    ", .markdown-body h6 {\n" +
    "  margin: 20px 0 10px;\n" +
    "  padding: 0;\n" +
    "  font-weight: bold;\n" +
    "}\n" +
    "\n" +
    "h1 {\n" +
    "  font-size: 2.5em;\n" +
    "  color: #000;\n" +
    "  border-bottom: 1px solid #ddd;\n" +
    "}\n" +
    "\n" +
    "h2 {\n" +
    "  font-size: 2em;\n" +
    "  border-bottom: 1px solid #eee;\n" +
    "  color: #000;\n" +
    "}\n" +
    "\n" +
    "img {\n" +
    "  max-width: 100%;\n" +
    "}\n" +
    "\n" +
    "hr {\n" +
    "  background: transparent url(\"/img/hr.png\") repeat-x 0 0;\n" +
    "  border: 0 none;\n" +
    "  color: #ccc;\n" +
    "  height: 4px;\n" +
    "  padding: 0;\n" +
    "}\n" +
    "\n" +
    "table {\n" +
    "  border-collapse: collapse;\n" +
    "  border-spacing: 0;\n" +
    "}\n" +
    "\n" +
    "tr:nth-child(2n) {\n" +
    "  background-color: #f8f8f8;\n" +
    "}\n" +
    "\n" +
    ".markdown-body tr {\n" +
    "  border-top: 1px solid #ccc;\n" +
    "  background-color: #fff;\n" +
    "}\n" +
    "\n" +
    "td, th {\n" +
    "  border: 1px solid #ccc;\n" +
    "  padding: 6px 13px;\n" +
    "}\n" +
    "\n" +
    "th {\n" +
    "  font-weight: bold;\n" +
    "}\n" +
    "\n" +
    "blockquote {\n" +
    "  border-left: 4px solid #ddd;\n" +
    "  padding: 0 15px;\n" +
    "  color: #777;\n" +
    "}\n" +
    "\n" +
    "blockquote > :last-child, blockquote > :first-child {\n" +
    "  margin-bottom: 0px;\n" +
    "}\n" +
    "\n" +
    "pre, code {\n" +
    "  font-size: 13px;\n" +
    "  font-family: 'UbuntuMono', monospace;\n" +
    "  white-space: nowrap;\n" +
    "  margin: 0 2px;\n" +
    "  padding: 0px 5px;\n" +
    "  border: 1px solid #eaeaea;\n" +
    "  background-color: #f8f8f8;\n" +
    "  border-radius: 3px;\n" +
    "}\n" +
    "\n" +
    "pre > code {\n" +
    "  white-space: pre;\n" +
    "}\n" +
    "\n" +
    "pre {\n" +
    "  overflow-x: auto;\n" +
    "  white-space: pre;\n" +
    "  padding: 10px;\n" +
    "  line-height: 150%;\n" +
    "  background-color: #f8f8f8;\n" +
    "  border-color: #ccc;\n" +
    "}\n" +
    "\n" +
    "pre code, pre tt {\n" +
    "  margin: 0;\n" +
    "  padding: 0;\n" +
    "  border: 0;\n" +
    "  background-color: transparent;\n" +
    "  border: none;\n" +
    "}\n" +
    "\n" +
    "  .highlight .c\n" +
    ", .highlight .cm\n" +
    ", .highlight .cp\n" +
    ", .highlight .c1 {\n" +
    "    color:#999988;\n" +
    "    font-style:italic;\n" +
    "}\n" +
    "\n" +
    ".highlight .err {\n" +
    "  color:#a61717;\n" +
    "  background-color:#e3d2d2\n" +
    "}\n" +
    "\n" +
    "  .highlight .o\n" +
    ", .highlight .gs\n" +
    ", .highlight .kc\n" +
    ", .highlight .kd\n" +
    ", .highlight .kn\n" +
    ", .highlight .kp\n" +
    ", .highlight .kr {\n" +
    "    font-weight:bold\n" +
    "}\n" +
    "\n" +
    ".highlight .cs {\n" +
    "  color:#999999;\n" +
    "  font-weight:bold;\n" +
    "  font-style:italic\n" +
    "}\n" +
    "\n" +
    ".highlight .gd {\n" +
    "  color:#000000;\n" +
    "  background-color:#ffdddd\n" +
    "}\n" +
    "\n" +
    ".highlight .gd .x {\n" +
    "  color:#000000;\n" +
    "  background-color:#ffaaaa\n" +
    "}\n" +
    "\n" +
    ".highlight .ge {\n" +
    "  font-style:italic\n" +
    "}\n" +
    "\n" +
    "  .highlight .gr\n" +
    ", .highlight .gt {\n" +
    "    color:#aa0000\n" +
    "}\n" +
    "\n" +
    "  .highlight .gh\n" +
    ", .highlight .bp {\n" +
    "    color:#999999\n" +
    "}\n" +
    "\n" +
    ".highlight .gi {\n" +
    "  color:#000000;\n" +
    "  background-color:#ddffdd\n" +
    "}\n" +
    "\n" +
    ".highlight .gi .x {\n" +
    "  color:#000000;\n" +
    "  background-color:#aaffaa\n" +
    "}\n" +
    "\n" +
    ".highlight .go {\n" +
    "  color:#888888\n" +
    "}\n" +
    "\n" +
    "  .highlight .gp\n" +
    ", .highlight .nn {\n" +
    "    color:#555555\n" +
    "}\n" +
    "\n" +
    "\n" +
    ".highlight .gu {\n" +
    "  color:#800080;\n" +
    "  font-weight:bold\n" +
    "}\n" +
    "\n" +
    "\n" +
    ".highlight .kt {\n" +
    "  color:#445588;\n" +
    "  font-weight:bold\n" +
    "}\n" +
    "\n" +
    "  .highlight .m\n" +
    ", .highlight .mf\n" +
    ", .highlight .mh\n" +
    ", .highlight .mi\n" +
    ", .highlight .mo\n" +
    ", .highlight .il {\n" +
    "    color:#009999\n" +
    "}\n" +
    "\n" +
    "  .highlight .s\n" +
    ", .highlight .sb\n" +
    ", .highlight .sc\n" +
    ", .highlight .sd\n" +
    ", .highlight .s2\n" +
    ", .highlight .se\n" +
    ", .highlight .sh\n" +
    ", .highlight .si\n" +
    ", .highlight .sx\n" +
    ", .highlight .s1 {\n" +
    "    color:#d14\n" +
    "}\n" +
    "\n" +
    ".highlight .n {\n" +
    "  color:#333333\n" +
    "}\n" +
    "\n" +
    "  .highlight .na\n" +
    ", .highlight .no\n" +
    ", .highlight .nv\n" +
    ", .highlight .vc\n" +
    ", .highlight .vg\n" +
    ", .highlight .vi\n" +
    ", .highlight .nb {\n" +
    "    color:#0086B3\n" +
    "}\n" +
    "\n" +
    ".highlight .nc {\n" +
    "  color:#445588;\n" +
    "  font-weight:bold\n" +
    "}\n" +
    "\n" +
    ".highlight .ni {\n" +
    "  color:#800080\n" +
    "}\n" +
    "\n" +
    "  .highlight .ne\n" +
    ", .highlight .nf {\n" +
    "    color:#990000;\n" +
    "    font-weight:bold\n" +
    "}\n" +
    "\n" +
    ".highlight .nt {\n" +
    "  color:#000080\n" +
    "}\n" +
    "\n" +
    ".highlight .ow {\n" +
    "  font-weight:bold\n" +
    "}\n" +
    "\n" +
    ".highlight .w {\n" +
    "  color:#bbbbbb\n" +
    "}\n" +
    "\n" +
    ".highlight .sr {\n" +
    "  color:#009926\n" +
    "}\n" +
    "\n" +
    ".highlight .ss {\n" +
    "  color:#990073\n" +
    "}\n" +
    "\n" +
    ".highlight .gc {\n" +
    "  color:#999;\n" +
    "  background-color:#EAF2F5\n" +
    "}\n" +
    "\n" +
    "@media print {\n" +
    "  .container {\n" +
    "    background: transparent;\n" +
    "    border-radius: 0;\n" +
    "    padding: 0;\n" +
    "  }\n" +
    "\n" +
    "  .body-content {\n" +
    "    border: none;\n" +
    "  }\n" +
    "}\n" +
    "</style>\n" +
    "  </head>\n" +
    "  <body>\n" +
    "    <div class=\"container\">\n" +
    "      <div class=\"body-content\"><h1 id=\"the-mit-license-mit-\">The MIT License (MIT)</h1>\n" +
    "<p><strong>Copyright (c) 2016 Rod Vagg (the &quot;Original Author&quot;) and additional contributors</strong></p>\n" +
    "<p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>\n" +
    "<p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>\n" +
    "<p>THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>\n" +
    "</div>\n" +
    "    </div>\n" +
    "  </body>\n" +
    "</html>"
  );


  $templateCache.put('node_modules/timers-browserify/example/enroll/index.html',
    "<!doctype html>\n" +
    "<html>\n" +
    "  <head>\n" +
    "    <script type=\"text/javascript\" src=\"/js/browserify.js\"></script>\n" +
    "  </head>\n" +
    "  <body>\n" +
    "  </body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/uglify-js/tools/props.html',
    "<html>\n" +
    "  <head>\n" +
    "  </head>\n" +
    "  <body>\n" +
    "    <script>(function(){\n" +
    "      var props = {};\n" +
    "\n" +
    "      function addObject(obj) {\n" +
    "        if (obj == null) return;\n" +
    "        try {\n" +
    "          Object.getOwnPropertyNames(obj).forEach(add);\n" +
    "        } catch(ex) {}\n" +
    "        if (obj.prototype) {\n" +
    "          Object.getOwnPropertyNames(obj.prototype).forEach(add);\n" +
    "        }\n" +
    "        if (typeof obj == \"function\") {\n" +
    "          try {\n" +
    "            Object.getOwnPropertyNames(new obj).forEach(add);\n" +
    "          } catch(ex) {}\n" +
    "        }\n" +
    "      }\n" +
    "\n" +
    "      function add(name) {\n" +
    "        props[name] = true;\n" +
    "      }\n" +
    "\n" +
    "      Object.getOwnPropertyNames(window).forEach(function(thing){\n" +
    "        addObject(window[thing]);\n" +
    "      });\n" +
    "\n" +
    "      try {\n" +
    "        addObject(new Event(\"click\"));\n" +
    "        addObject(new Event(\"contextmenu\"));\n" +
    "        addObject(new Event(\"mouseup\"));\n" +
    "        addObject(new Event(\"mousedown\"));\n" +
    "        addObject(new Event(\"keydown\"));\n" +
    "        addObject(new Event(\"keypress\"));\n" +
    "        addObject(new Event(\"keyup\"));\n" +
    "      } catch(ex) {}\n" +
    "\n" +
    "      var ta = document.createElement(\"textarea\");\n" +
    "      ta.style.width = \"100%\";\n" +
    "      ta.style.height = \"20em\";\n" +
    "      ta.style.boxSizing = \"border-box\";\n" +
    "      <!-- ta.value = Object.keys(props).sort(cmp).map(function(name){ -->\n" +
    "      <!--   return JSON.stringify(name); -->\n" +
    "      <!-- }).join(\",\\n\"); -->\n" +
    "      ta.value = JSON.stringify({\n" +
    "        vars: [],\n" +
    "        props: Object.keys(props).sort(cmp)\n" +
    "      }, null, 2);\n" +
    "      document.body.appendChild(ta);\n" +
    "\n" +
    "      function cmp(a, b) {\n" +
    "        a = a.toLowerCase();\n" +
    "        b = b.toLowerCase();\n" +
    "        return a < b ? -1 : a > b ? 1 : 0;\n" +
    "      }\n" +
    "    })();</script>\n" +
    "  </body>\n" +
    "</html>\n"
  );


  $templateCache.put('node_modules/vm-browserify/example/run/index.html',
    "<html>\n" +
    "  <head>\n" +
    "    <script src=\"http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js\"></script>\n" +
    "    <script src=\"/bundle.js\"></script>\n" +
    "  </head>\n" +
    "  <body>\n" +
    "    result = <span id=\"res\"></span>\n" +
    "  </body>\n" +
    "</html>\n"
  );


  $templateCache.put('pages/aezeed/aezeed.html',
    "<h1>aezeed Cipher Seed Scheme</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      The aezeed Cipher Seed Scheme is a scheme to create versioned seeds for crypto currency wallets, based on\n" +
    "      <a href=\"http://web.cs.ucdavis.edu/~rogaway/aez/\">aez</a>.<br/><br/>\n" +
    "      This new scheme was first introduced with <a href=\"https://github.com/lightningnetwork/lnd\">lnd</a>, one of the\n" +
    "      implementations of Lightning Network wallet software.\n" +
    "\n" +
    "      <h3>Links:</h3>\n" +
    "      <ul>\n" +
    "        <li><a href=\"http://web.cs.ucdavis.edu/~rogaway/aez/\">AEZ: Robust Authenticated Encryption</a></li>\n" +
    "        <li><a href=\"https://github.com/lightningnetwork/lnd\">Lightning Network Daemon</a></li>\n" +
    "        <li>\n" +
    "          <a href=\"https://github.com/lightningnetwork/lnd/pull/773\">\n" +
    "            Pull request that introduced aezeed into lnd (with documentation)\n" +
    "          </a>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"alert alert-warning\">\n" +
    "  <strong>Warning</strong>: Any generated keys are for demonstration only.\n" +
    "  Your browser's random number generator might be too predictable to trust!\n" +
    "</div>\n" +
    "\n" +
    "<h4>Generate mnemonic</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- aezeed parameter -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">aezeed parameter:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-addon\">Internal version</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.version\"\n" +
    "               ng-model-options=\"{debounce: 1000}\"\n" +
    "               ng-change=\"vm.generateSeed()\"\n" +
    "               type=\"number\">\n" +
    "        <div class=\"input-group-addon\">Birthday (days since Bitcoin genesis block)</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.birthday\"\n" +
    "               ng-model-options=\"{debounce: 1000}\"\n" +
    "               ng-change=\"vm.generateSeed()\"\n" +
    "               type=\"number\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- passphrase -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Passphrase:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.passphrase\"\n" +
    "               ng-model-options=\"{debounce: 1000}\"\n" +
    "               ng-change=\"vm.generateSeed()\"\n" +
    "               type=\"{{vm.asPassword ? 'password' : 'text'}}\">\n" +
    "        <span class=\"input-group-btn\">\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"vm.asPassword = !vm.asPassword\">\n" +
    "                {{vm.asPassword ? 'Show' : 'Hide'}} passphrase\n" +
    "            </button>\n" +
    "        </span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- entropy hex -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Entropy and salt (hex):</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.entropy\"\n" +
    "               ng-model-options=\"{debounce: 1000}\"\n" +
    "               ng-change=\"vm.generateSeed()\">\n" +
    "        <span class=\"input-group-btn\">\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"vm.generateEntropy(); vm.generateSeed();\">\n" +
    "                Randomize entropy\n" +
    "            </button>\n" +
    "        </span>\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.salt\"\n" +
    "               ng-model-options=\"{debounce: 1000}\"\n" +
    "               ng-change=\"vm.generateSeed()\">\n" +
    "        <span class=\"input-group-btn\">\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"vm.generateSalt(); vm.generateSeed();\">\n" +
    "                Randomize salt\n" +
    "            </button>\n" +
    "        </span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- mnemonic -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Mnemonic:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-class=\"{'well-error': vm.error}\"\n" +
    "               value=\"{{vm.mnemonic}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "        <span class=\"input-group-addon\" ng-if=\"vm.error\" class=\"well-error\"> {{vm.error}}</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- root key base58 -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">HD node root key base58:</label>\n" +
    "      <div class=\"col-sm-9 input-group as-block\">\n" +
    "        <input class=\"form-control\"\n" +
    "               style=\"width: 60%\"\n" +
    "               value=\"{{vm.nodeBase58}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "        <span class=\"input-group-addon\" style=\"width: 20%\">&lt;-- paste here to import.</span>\n" +
    "        <select ng-model=\"vm.network\"\n" +
    "                style=\"width: 20%\"\n" +
    "                ng-options=\"network.label for network in vm.networks\"\n" +
    "                ng-change=\"vm.formatBase58()\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Decode mnemonic</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- mnemonic -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Mnemonic:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.mnemonic2\"\n" +
    "               ng-model-options=\"{debounce: 1000}\"\n" +
    "               ng-class=\"{'well-error': vm.error2}\"\n" +
    "               ng-change=\"vm.fromMnemonic()\">\n" +
    "        <span class=\"input-group-addon\" ng-if=\"!vm.error2\">&lt;-- paste mnemonic words here to decode</span>\n" +
    "        <span class=\"input-group-addon well-error\" ng-if=\"vm.error2\"> {{vm.error2}}</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- passphrase -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Passphrase:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.passphrase2\"\n" +
    "               ng-model-options=\"{debounce: 1000}\"\n" +
    "               ng-change=\"vm.fromMnemonic()\"\n" +
    "               type=\"{{vm.asPassword ? 'password' : 'text'}}\">\n" +
    "        <span class=\"input-group-btn\">\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"vm.asPassword = !vm.asPassword\">\n" +
    "                {{vm.asPassword ? 'Show' : 'Hide'}} passphrase\n" +
    "            </button>\n" +
    "        </span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- aezeed parameter -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">aezeed parameter:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-addon\">Internal version</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.decoded.version}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "        <div class=\"input-group-addon\">Birthday (days since Bitcoin genesis block)</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.decoded.birthday}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <!-- entropy hex -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\"></label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-addon\">Entropy</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.decoded.entropy}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "        <div class=\"input-group-addon\">Salt</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.decoded.salt}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- root key base58 -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">HD node root key base58:</label>\n" +
    "      <div class=\"col-sm-9 input-group as-block\">\n" +
    "        <input class=\"form-control\"\n" +
    "               style=\"width: 60%\"\n" +
    "               value=\"{{vm.decoded.nodeBase58}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "        <span class=\"input-group-addon\" style=\"width: 20%\">&lt;-- paste here to import.</span>\n" +
    "        <select ng-model=\"vm.network\"\n" +
    "                style=\"width: 20%\"\n" +
    "                ng-options=\"network.label for network in vm.networks\"\n" +
    "                ng-change=\"vm.fromMnemonic()\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('pages/bitcoin-block/bitcoin-block.html',
    "<h1>Bitcoin Block Parser</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "    <div class=\"panel-heading\">\n" +
    "        <h4 class=\"panel-title\">\n" +
    "            <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "        </h4>\n" +
    "    </div>\n" +
    "    <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "        <div class=\"panel-body\">\n" +
    "            Parse and examine a block from Bitcoin's network or by pasting the binary content\n" +
    "            as a hex string.\n" +
    "\n" +
    "            <h3>Sources, tools and other useful information:</h3>\n" +
    "            <ul>\n" +
    "                <li><a href=\"https://blockexplorer.com/api-ref\">Blockchain Explorer API reference</a></li>\n" +
    "                <li><a href=\"https://bitcoinjs.org/\">BitcoinJS</a></li>\n" +
    "                <li><a href=\"https://github.com/bitcoinjs/bitcoinjs-lib\">BitcoinJS GitHub repo</a></li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Block data</h4>\n" +
    "<div class=\"well\">\n" +
    "    <form class=\"form-horizontal\">\n" +
    "        <div class=\"form-group\">\n" +
    "            <label class=\"col-sm-4 control-label\">Block source API URL:</label>\n" +
    "            <div class=\"col-sm-8 input-group\">\n" +
    "                <select ng-model=\"vm.selectedBlockSource\"\n" +
    "                        ng-change=\"vm.downloadBlock()\"\n" +
    "                        ng-options=\"source.label for source in vm.sources\"\n" +
    "                        class=\"form-control\">\n" +
    "                </select>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label class=\"col-sm-4 control-label\" for=\"hash\">Hash of block to examine:</label>\n" +
    "            <div class=\"col-sm-8 input-group\">\n" +
    "                <input id=\"hash\"\n" +
    "                       class=\"form-control\"\n" +
    "                       ng-model=\"vm.hash\"\n" +
    "                       ng-change=\"vm.downloadBlock()\"\n" +
    "                       ng-class=\"{'well-error': vm.error}\">\n" +
    "                <span class=\"input-group-addon\" ng-if=\"!vm.error\">&lt;-- paste here to examine</span>\n" +
    "                <span class=\"input-group-addon well-error\" ng-if=\"vm.error\"> {{vm.error}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <div class=\"col-sm-8 col-sm-offset-4\">\n" +
    "                Load other examples (might take a while to load/render!):\n" +
    "                <ul>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"vm.hash = '000000000000000003d79e6973863cdb24ac6f3ddd526f61a8ff4fb684db1e9f'; vm.downloadBlock();\">\n" +
    "                            Block #371667, 51 transactions\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"vm.hash = '000000000000000006a62f827dd0a2caba98c178bebb175ec1fcd250e1a0159c'; vm.downloadBlock();\">\n" +
    "                            Block #371610, 168 transactions\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"vm.hash = '0000000000000000009a2160814712117b1f07db54887dbbb5de02173d398db3'; vm.downloadBlock();\">\n" +
    "                            Block #496321, 300 transactions, SegWit\n" +
    "                        </a>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"form-group\">\n" +
    "            <label class=\"col-sm-4 control-label\" for=\"raw\">Raw hex value:</label>\n" +
    "            <div class=\"col-sm-8 input-group\">\n" +
    "        <textarea id=\"raw\"\n" +
    "                  rows=\"10\"\n" +
    "                  ng-model=\"vm.raw\"\n" +
    "                  ng-trim=\"false\"\n" +
    "                  ng-change=\"vm.parseBlock()\"\n" +
    "                  class=\"form-control\"\n" +
    "                  ng-class=\"{'well-error': vm.error}\">\n" +
    "          </textarea>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"form-group\">\n" +
    "            <label class=\"col-sm-4 control-label\" for=\"json\">\n" +
    "                <a ng-click=\"vm.showDecoded = !vm.showDecoded\">Decoded as JSON:</a>\n" +
    "            </label>\n" +
    "            <div class=\"col-sm-8 input-group\" ng-if=\"vm.showDecoded\">\n" +
    "                <textarea id=\"json\" rows=\"20\" ng-readonly=\"true\" class=\"form-control\">{{vm.decodedBlock | json}}</textarea>\n" +
    "            </div>\n" +
    "            <div class=\"col-sm-8 input-group\" ng-if=\"!vm.showDecoded\">\n" +
    "                <textarea id=\"json\" rows=\"1\" ng-readonly=\"true\"\n" +
    "                          class=\"form-control\">(hidden for performance reasons, click the link to show)</textarea>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"form-group\">\n" +
    "            <label class=\"col-sm-4 control-label\" for=\"json\">Block size as seen by pre-SegWit nodes:</label>\n" +
    "            <div class=\"col-sm-8 input-group\">\n" +
    "                <input ng-readonly=\"true\" value=\"{{vm.block.legacySize}}\" class=\"form-control\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label class=\"col-sm-4 control-label\" for=\"json\">Real block size with SegWit:</label>\n" +
    "            <div class=\"col-sm-8 input-group\">\n" +
    "                <input ng-readonly=\"true\" value=\"{{vm.block.byteLength()}}\" class=\"form-control\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <label class=\"col-sm-4 control-label\" for=\"json\">Block weight:</label>\n" +
    "            <div class=\"col-sm-8 input-group\">\n" +
    "                <input ng-readonly=\"true\" value=\"{{vm.block.weight}}\" class=\"form-control\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-show=\"!vm.error && vm.decodedBlock && vm.decodedBlock.transactions.length > 0\">\n" +
    "    <h4>Merkle Tree</h4>\n" +
    "    <div id=\"merkleTree\" class=\"row row-horizon\" ng-show=\"vm.decodedBlock.transactions.length <= 200\"></div>\n" +
    "    <div class=\"tooltip\" id=\"tooltip\"></div>\n" +
    "    <span ng-if=\"vm.decodedBlock.transactions.length > 200\">\n" +
    "    Only shown up to 200 transactions due to performance reasons\n" +
    "  </span>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"!vm.error && vm.decodedBlock && vm.decodedBlock.transactions.length > 0\">\n" +
    "    <div ng-repeat=\"tx in vm.decodedBlock.transactions\">\n" +
    "        <h4 ng-init=\"origTx = vm.block.transactions[$index]\">TX {{$index}}</h4>\n" +
    "        <div class=\"well\">\n" +
    "            <form class=\"form-horizontal\">\n" +
    "                <!-- hash -->\n" +
    "                <div class=\"form-group\">\n" +
    "                    <label class=\"col-sm-3 control-label\" for=\"raw\">Calculated Hash:</label>\n" +
    "                    <div class=\"col-sm-9 input-group\">\n" +
    "                        <input ng-readonly=\"true\" value=\"{{::origTx.getHash().toString('hex')}}\" class=\"form-control\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- ID -->\n" +
    "                <div class=\"form-group\">\n" +
    "                    <label class=\"col-sm-3 control-label\" for=\"raw\">TX ID (reversed hash):</label>\n" +
    "                    <div class=\"col-sm-9 input-group\">\n" +
    "                        <input ng-readonly=\"true\" value=\"{{::origTx.getId().toString('hex')}}\" class=\"form-control\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- misc -->\n" +
    "                <div class=\"form-group\">\n" +
    "                    <label class=\"col-sm-3 control-label\" for=\"raw\">Misc:</label>\n" +
    "                    <div class=\"col-sm-9 input-group\">\n" +
    "            <span class=\"form-control\" ng-readonly=\"true\">\n" +
    "                Version: {{::tx.version}}, Locktime: {{::tx.locktime}}, is coinbase TX: {{::origTx.isCoinbase()}}, weight: {{::origTx.weight()}}\n" +
    "            </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- inputs -->\n" +
    "                <div class=\"form-group\">\n" +
    "                    <label class=\"col-sm-3 control-label\" for=\"raw\">Inputs:</label>\n" +
    "                    <div class=\"col-sm-9 input-group\">\n" +
    "                        <div class=\"well\" ng-repeat=\"input in ::tx.ins\">\n" +
    "                            <div class=\"form-group\">\n" +
    "                                <div class=\"input-group\">\n" +
    "                                    <span class=\"input-group-addon\">Referencing TX ID:</span>\n" +
    "                                    <input ng-readonly=\"true\" value=\"{{::vm.getTxId(input.hash)}}\" class=\"form-control\">\n" +
    "                                </div>\n" +
    "                                <div class=\"input-group\">\n" +
    "                                    <span class=\"input-group-addon\">Referencing TX Output Index:</span>\n" +
    "                                    <input ng-readonly=\"true\" value=\"{{::input.index}}\" class=\"form-control\">\n" +
    "                                    <span class=\"input-group-addon\">Sequence Number:</span>\n" +
    "                                    <input ng-readonly=\"true\" value=\"{{::input.sequence.toString(16)}}\" class=\"form-control\">\n" +
    "                                </div>\n" +
    "                                <div class=\"input-group\" ng-if=\"!origTx.isCoinbase()\">\n" +
    "                                    <span class=\"input-group-addon\">Script:</span>\n" +
    "                                    <input ng-readonly=\"true\" value=\"{{::input.script}}\" class=\"form-control\">\n" +
    "                                </div>\n" +
    "                                <div class=\"input-group\" ng-if=\"origTx.isCoinbase()\">\n" +
    "                                    <span class=\"input-group-addon\">Data:</span>\n" +
    "                                    <input ng-readonly=\"true\" value=\"{{::vm.getRawString(input.script)}}\" class=\"form-control\">\n" +
    "                                </div>\n" +
    "                                <div class=\"input-group\" ng-if=\"origTx.hasWitnesses()\">\n" +
    "                                    <span class=\"input-group-addon\">Witness:</span>\n" +
    "                                    <input ng-readonly=\"true\" value=\"{{::input.witness}}\" class=\"form-control\">\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <!-- outputs -->\n" +
    "                <div class=\"form-group\">\n" +
    "                    <label class=\"col-sm-3 control-label\" for=\"raw\">Outputs:</label>\n" +
    "                    <div class=\"col-sm-9 input-group\">\n" +
    "                        <div class=\"well\" ng-repeat=\"output in ::tx.outs\">\n" +
    "                            <div class=\"form-group\">\n" +
    "                                <div class=\"input-group\">\n" +
    "                                    <span class=\"input-group-addon\">Value (Raw/Satoshis):</span>\n" +
    "                                    <input ng-readonly=\"true\" value=\"{{::output.value}}\" class=\"form-control\">\n" +
    "                                    <span class=\"input-group-addon\">Value (BTCs):</span>\n" +
    "                                    <input ng-readonly=\"true\" value=\"{{::output.value / 100000000}}\" class=\"form-control\">\n" +
    "                                </div>\n" +
    "                                <div class=\"input-group\">\n" +
    "                                    <span class=\"input-group-addon\">Script:</span>\n" +
    "                                    <input ng-readonly=\"true\" value=\"{{::output.script}}\" class=\"form-control\">\n" +
    "                                </div>\n" +
    "                                <div class=\"input-group\" ng-if=\"::vm.isP2PKH(origTx.outs[$index].script)\">\n" +
    "                                    <span class=\"input-group-addon\">Address:</span>\n" +
    "                                    <input ng-readonly=\"true\"\n" +
    "                                           value=\"{{::$root.hexPubKeyToBitcoinAddr(vm.getP2PKH(origTx.outs[$index].script))}}\"\n" +
    "                                           class=\"form-control\">\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </form>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('pages/ecc/ecc.html',
    "<h1>Elliptic Curve Cryptography / Key Pair</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      This page shows the relationship between private keys, public keys, addresses and transactions.<br/><br/>\n" +
    "      The first part shows how the elliptic curve private and public keys are formatted for the different\n" +
    "      digital coin networks. The parameters for these networks can be found in the GitHub repos of the coin\n" +
    "      wallet software.<br/>\n" +
    "      A private key can either be generated (using your browser's\n" +
    "      <strong>window.crypto.getRandomValues()</strong> function) or\n" +
    "      imported (by pasting into the text field \"Private key (WIF format, uncompressed)\"). It doesn't matter if\n" +
    "      the pasted key is compressed or uncompressed since that is auto detected by the underlying algorithm.\n" +
    "\n" +
    "      <h3>Sources, tools and other useful information:</h3>\n" +
    "      <ul>\n" +
    "        <li>\n" +
    "          <a href=\"http://procbits.com/2013/08/27/generating-a-bitcoin-address-with-javascript\">\n" +
    "            Generating a Bitcoin Address with JavaScript\n" +
    "          </a>\n" +
    "        </li>\n" +
    "        <li><a href=\"https://bitcoinjs.org/\">BitcoinJS</a></li>\n" +
    "        <li><a href=\"https://github.com/bitcoinjs/bitcoinjs-lib\">BitcoinJS GitHub repo</a></li>\n" +
    "        <li><a href=\"https://en.bitcoin.it/wiki/List_of_address_prefixes\">List of address prefixes</a></li>\n" +
    "        <li><a href=\"https://en.bitcoin.it/wiki/Wallet_import_format\">Wallet Import Format (WIF)</a></li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"alert alert-warning\">\n" +
    "  <strong>Warning</strong>: Any generated keys are for demonstration only.\n" +
    "  Your browser's random number generator might be too predictable to trust!\n" +
    "</div>\n" +
    "\n" +
    "<h4>Elliptic Curve key pair</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">Private key (decimal):</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.decimalKey}}\">\n" +
    "        <span class=\"input-group-btn\">\n" +
    "          <button class=\"btn btn-primary\" ng-click=\"vm.newPrivateKey()\">Generate new</button>\n" +
    "        </span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">Private key (hex):</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.decimalKey.toString(16)}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">Public key (decimal):</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.pubKeyDecimal}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">Public key (hex):</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.pubKey.toString('hex')}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">Format key for network:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <select ng-model=\"vm.network\"\n" +
    "                ng-change=\"vm.formatKeyForNetwork()\"\n" +
    "                ng-options=\"network.label for network in vm.networks\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">\n" +
    "        <a ng-click=\"vm.showWifCompressed = !vm.showWifCompressed\">Private key (WIF format, compressed):</a>\n" +
    "      </label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.keyPair.wif}}\">\n" +
    "      </div>\n" +
    "      <div ng-show=\"vm.showWifCompressed\" class=\"col-sm-offset-4 col-sm-8 qr-code\" id=\"qrPrivCompressed\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"wifUncompressed\" class=\"col-sm-4 control-label\">\n" +
    "        <a ng-click=\"vm.showWifUncompressed = !vm.showWifUncompressed\">Private key (WIF format, uncompressed):</a>\n" +
    "      </label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input id=\"wifUncompressed\"\n" +
    "               ng-model=\"vm.keyPairUncompressed.wif\"\n" +
    "               ng-change=\"vm.importFromWif()\"\n" +
    "               ng-class=\"{'well-error': vm.error}\"\n" +
    "               class=\"form-control\"><br/>\n" +
    "        <span class=\"input-group-addon\" ng-if=\"!vm.error\">&lt;-- paste here to import from WIF</span>\n" +
    "        <span class=\"input-group-addon well-error\" ng-if=\"vm.error\"> {{vm.error}}</span>\n" +
    "      </div>\n" +
    "      <div ng-show=\"vm.showWifUncompressed\" class=\"col-sm-offset-4 col-sm-8 qr-code\" id=\"qrPrivUncompressed\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">\n" +
    "        <a ng-click=\"vm.showPubkey = !vm.showPubkey\">Pay to Pubkey Hash (P2PKH) address:</a>\n" +
    "      </label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.keyPair.address}}\">\n" +
    "      </div>\n" +
    "      <div ng-show=\"vm.showPubkey\" class=\"col-sm-offset-4 col-sm-8 qr-code\" id=\"qrPubkey\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">Pay to Script Hash (P2SH) address:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.keyPair.scriptAddress}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\" ng-if=\"vm.network.config.bech32\">\n" +
    "      <label class=\"col-sm-4 control-label\">SegWit P2SH-P2WPKH address:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.keyPair.nestedP2WPKHAddress}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\" ng-if=\"vm.network.config.bech32\">\n" +
    "      <label class=\"col-sm-4 control-label\">SegWit bech32 P2WPKH address:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.keyPair.P2WPKHAddress}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Elliptic Curve Digital Signature Algorithm (ECDSA): Sign message</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"message\" class=\"col-sm-4 control-label\">Message to sign:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input id=\"message\" ng-model=\"vm.message\" ng-change=\"vm.signMessage()\" class=\"form-control\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">SHA256 hash of message:</label>\n" +
    "      <div class=\"col-sm-8 no-left-padding\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.messageHash.toString('hex')}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">Signature:</label>\n" +
    "      <div class=\"col-sm-8 no-left-padding\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.signature}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Elliptic Curve Digital Signature Algorithm (ECDSA): Verify signature</h4>\n" +
    "<div class=\"well\" ng-class=\"{'well-success': vm.signatureValid, 'well-error': !vm.signatureValid}\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"messageHash\" class=\"col-sm-4 control-label\">Message hash:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input id=\"messageHash\"\n" +
    "               ng-model=\"vm.messageHashToVerify\"\n" +
    "               ng-change=\"vm.verifySignature()\"\n" +
    "               class=\"form-control\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"signature\" class=\"col-sm-4 control-label\">Signature:</label>\n" +
    "      <div class=\"col-sm-8 no-left-padding\">\n" +
    "        <input id=\"signature\"\n" +
    "               ng-model=\"vm.signatureToVerify\"\n" +
    "               ng-change=\"vm.verifySignature()\"\n" +
    "               class=\"form-control\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>ECC Multiply</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"multiplicand\" class=\"col-sm-4 control-label\">Multiplicand:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input id=\"multiplicand\"\n" +
    "               ng-model=\"vm.eccMultiplicand\"\n" +
    "               ng-change=\"vm.eccMultiply()\"\n" +
    "               class=\"form-control\">\n" +
    "      </div>\n" +
    "      <div class=\"col-sm-offset-4 input-group\">\n" +
    "        <div class=\"input-group-addon\">Multiplicand is private key:</div>\n" +
    "        <div class=\"input-group-addon\">\n" +
    "          <input type=\"checkbox\"\n" +
    "                 ng-model=\"vm.multiplicandPrivKey\"\n" +
    "                 ng-change=\"vm.eccMultiply()\">\n" +
    "        </div>\n" +
    "        <input class=\"form-control no-border\"\n" +
    "               ng-readonly=\"true\"\n" +
    "               type=\"text\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"multiplier\" class=\"col-sm-4 control-label\">Multiplier:</label>\n" +
    "      <div class=\"col-sm-8 no-left-padding\">\n" +
    "        <input id=\"multiplier\"\n" +
    "               ng-model=\"vm.eccMultiplier\"\n" +
    "               ng-change=\"vm.eccMultiply()\"\n" +
    "               class=\"form-control\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\">Result:</label>\n" +
    "      <div class=\"col-sm-8 no-left-padding\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.eccResult}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('pages/hd-wallet/hd-wallet.html',
    "<h1>Hierarchical Deterministic Wallet (BIP32, BIP38, BIP39, BIP44)</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      Here we show how deterministic wallets are created and used.\n" +
    "\n" +
    "      <h3>Links:</h3>\n" +
    "      <ul>\n" +
    "        <li><a href=\"https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki\">BIP32: Hierarchical Deterministic\n" +
    "          Wallets</a></li>\n" +
    "        <li><a href=\"https://github.com/bitcoin/bips/blob/master/bip-0038.mediawiki\">BIP38: Passphrase-protected private\n" +
    "          key</a></li>\n" +
    "        <li>\n" +
    "          <a href=\"https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki\">\n" +
    "            BIP39: Mnemonic code for generating deterministic keys\n" +
    "          </a>\n" +
    "        </li>\n" +
    "        <li>\n" +
    "          <a href=\"https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki\">\n" +
    "            BIP44: Multi-Account Hierarchy for Deterministic Wallets</a>\n" +
    "        </li>\n" +
    "        <li><a href=\"https://github.com/bitcoinjs/bip38\">bitcoinjs/bip38</a></li>\n" +
    "        <li><a href=\"https://github.com/bitcoinjs/bip39\">bitcoinjs/bip39</a></li>\n" +
    "        <li><a href=\"https://github.com/bitcoinjs/bip44-constants\">bitcoinjs/bip44-constants</a></li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"alert alert-warning\">\n" +
    "  <strong>Warning</strong>: Any generated keys are for demonstration only.\n" +
    "  Your browser's random number generator might be too predictable to trust!\n" +
    "</div>\n" +
    "\n" +
    "<h4>BIP39 mnemonic to BIP32 root key</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- mnemonic parameter -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Seed length:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <select class=\"form-control\"\n" +
    "                ng-model=\"vm.mnemonicLength\"\n" +
    "                ng-options=\"l.label for l in vm.seedLengths\"\n" +
    "                ng-change=\"vm.newSeed()\">\n" +
    "        </select>\n" +
    "        <span class=\"input-group-btn\">\n" +
    "          <button class=\"btn btn-primary\" ng-click=\"vm.newSeed()\">Generate new</button>\n" +
    "        </span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- mnemonic -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Seed Mnemonic (BIP39):</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.mnemonic\"\n" +
    "               ng-change=\"vm.fromMnemonic()\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- passphrase -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Passphrase:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.passphrase\"\n" +
    "               ng-change=\"vm.fromMnemonic()\"\n" +
    "               type=\"{{vm.asPassword ? 'password' : 'text'}}\">\n" +
    "        <span class=\"input-group-btn\">\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"vm.asPassword = !vm.asPassword\">\n" +
    "                {{vm.asPassword ? 'Show' : 'Hide'}} passphrase\n" +
    "            </button>\n" +
    "        </span>\n" +
    "        <div class=\"input-group-addon\">Method</div>\n" +
    "        <select ng-model=\"vm.strenghtening\"\n" +
    "                ng-change=\"vm.fromMnemonic()\"\n" +
    "                ng-options=\"s.label for s in vm.strenghteningMethods\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- seed hex -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Seed hex:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.seedHex\"\n" +
    "               ng-change=\"vm.fromHexSeed()\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- root key base58 -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">HD node root key (base58):</label>\n" +
    "      <div class=\"col-sm-9 input-group as-block\">\n" +
    "        <input class=\"form-control\"\n" +
    "               style=\"width: 60%\"\n" +
    "               ng-model=\"vm.nodeBase58\"\n" +
    "               ng-class=\"{'well-error': vm.error}\"\n" +
    "               ng-change=\"vm.fromBase58Seed()\">\n" +
    "        <span class=\"input-group-addon\" ng-if=\"!vm.error\" style=\"width: 20%\">&lt;-- paste here to import.</span>\n" +
    "        <span class=\"input-group-addon well-error\" ng-if=\"vm.error\" style=\"width: 20%\"> {{vm.error}}</span>\n" +
    "        <select ng-model=\"vm.network\"\n" +
    "                style=\"width: 20%\"\n" +
    "                ng-options=\"network.label for network in vm.networks\"\n" +
    "                ng-change=\"vm.fromMnemonic()\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- priv key WIF -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Private key (WIF, compressed):</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.privKeyWif}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- extended pubkey -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Extended public key (base58):</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.publicKeyWif}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <!-- address -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">P2PKH address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.address}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>BIP44 key derivation</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- derive -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">BIP44 parameters to derive keys:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-addon\">Coin type</div>\n" +
    "        <select ng-model=\"vm.coinType\"\n" +
    "                ng-options=\"coin.label for coin in vm.coinTypes\"\n" +
    "                ng-change=\"vm.fromNode()\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "        <div class=\"input-group-addon\">Account</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.account\"\n" +
    "               ng-change=\"vm.calculatePath()\"\n" +
    "               type=\"number\">\n" +
    "        <div class=\"input-group-addon\">Change</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.change\"\n" +
    "               ng-change=\"vm.calculatePath()\"\n" +
    "               type=\"number\">\n" +
    "        <div class=\"input-group-addon\">Index</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.index\"\n" +
    "               ng-change=\"vm.calculatePath()\"\n" +
    "               type=\"number\">\n" +
    "      </div>\n" +
    "      <div class=\"col-sm-offset-3 col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-addon\">Path</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.path\"\n" +
    "               ng-change=\"vm.fromPath()\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- derived key base58 -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Derived key base58:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.derivedKey.toBase58()}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- priv key WIF -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Private key (WIF, compressed):</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.derivedKey.keyPair.wif}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- p2pkh address -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">P2PKH address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.derivedKey.keyPair.address}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- p2sh address -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Pay to Script Hash (P2SH) address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.derivedKey.keyPair.scriptAddress}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- SegWit p2wpkh -->\n" +
    "    <div class=\"form-group\" ng-if=\"vm.network.config.bech32\">\n" +
    "      <label class=\"col-sm-3 control-label\">SegWit P2SH-P2WPKH address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.derivedKey.keyPair.nestedP2WPKHAddress}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- SegWit native p2wpkh -->\n" +
    "    <div class=\"form-group\" ng-if=\"vm.network.config.bech32\">\n" +
    "      <label class=\"col-sm-3 control-label\">SegWit bech32 P2WPKH address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.derivedKey.keyPair.P2WPKHAddress}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Custom BIP32 key derivation</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- parent key -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Parent key base58:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.customParentBase58\"\n" +
    "               ng-class=\"{'well-error': vm.customParentError}\"\n" +
    "               ng-change=\"vm.fromCustomParent()\">\n" +
    "        <span class=\"input-group-addon\" ng-if=\"!vm.customParentError\">&lt;-- paste here to import</span>\n" +
    "        <span class=\"input-group-addon well-error\" ng-if=\"vm.customParentError\"> {{vm.customParentError}}</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- derive -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Custom derivation path:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.customPath\"\n" +
    "               ng-change=\"vm.fromCustomPath()\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- derived key base58 -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Derived key base58:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.customDerivedKey.toBase58()}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- priv key WIF -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Private key (WIF, compressed):</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.customDerivedKey.keyPair.wif}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- p2pkh address -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">P2PKH address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               value=\"{{vm.customDerivedKey.keyPair.address}}\"\n" +
    "               ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- p2sh address -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Pay to Script Hash (P2SH) address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.customDerivedKey.keyPair.scriptAddress}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- SegWit p2wpkh -->\n" +
    "    <div class=\"form-group\" ng-if=\"vm.network.config.bech32\">\n" +
    "      <label class=\"col-sm-3 control-label\">SegWit P2SH-P2WPKH address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.customDerivedKey.keyPair.nestedP2WPKHAddress}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- SegWit native p2wpkh -->\n" +
    "    <div class=\"form-group\" ng-if=\"vm.network.config.bech32\">\n" +
    "      <label class=\"col-sm-3 control-label\">SegWit bech32 P2WPKH address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.customDerivedKey.keyPair.P2WPKHAddress}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('pages/intro/intro.html',
    "<h1>Cryptography Toolkit</h1>\n" +
    "\n" +
    "A web-based collection of cryptography tools for schemes/algorithms used in\n" +
    "<a href=\"https://github.com/bitcoin/bitcoin\">Bitcoin</a> and <a href=\"https://github.com/lightningnetwork/lnd\">LND</a>.<br/><br/>\n" +
    "\n" +
    "<strong>This toolkit has been built with educational purposes in mind!</strong><br/>\n" +
    "It is meant to play around with different schemes and algorithms to understand how they work.<br/>\n" +
    "However, you must be <strong>extremely careful</strong> when using real/live/mainnet data/keys/credentials!<br/>\n" +
    "A web browser usually is not a safe environment to either create strong cryptographic keys and/or\n" +
    "paste sensitive information into. So consider yourself warned.\n" +
    "\n" +
    "<h2>Tools</h2>\n" +
    "<ul>\n" +
    "  <li><a href=\"#!/ecc\">Elliptic Curve Cryptography / Key Pair page</a></li>\n" +
    "  <li><a href=\"#!/hd-wallet\">Hierarchical Deterministic Wallet page</a></li>\n" +
    "  <li><a href=\"#!/bitcoin-block\">Bitcoin Block Parser page</a></li>\n" +
    "  <li><a href=\"#!/shamir-secret-sharing\">Shamir's Secret Sharing Scheme page</a></li>\n" +
    "  <li><a href=\"#!/schnorr\">BIP Schnorr Signatures page</a></li>\n" +
    "  <li><a href=\"#!/mu-sig\">MuSig: Key Aggregation for Schnorr Signatures page</a></li>\n" +
    "  <li><a href=\"#!/transaction-creator\">Transaction Creator page</a></li>\n" +
    "  <li><a href=\"#!/aezeed\">aezeed Cipher Seed Scheme page</a></li>\n" +
    "  <li><a href=\"#!/macaroon\">Macaroons page</a></li>\n" +
    "  <li><a href=\"#!/wallet-import\">Wallet Import helper page</a></li>\n" +
    "</ul>\n" +
    "\n" +
    "<p class=\"pull-right\">\n" +
    "  by <a href=\"https://github.com/guggero\">Oliver Gugger</a><br>\n" +
    "  BTC tip address: bc1qrepygjyxq34d08dqpwhryej5aclpqgzc28seqt<br/>\n" +
    "</p>\n"
  );


  $templateCache.put('pages/macaroon/macaroon.html',
    "<h1>Macaroons</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      Macaroons are Cookies with Contextual Caveats for Decentralized Authorization in the Cloud.<br/><br/>\n" +
    "      They are used, for example, in the <em>lnd</em> implementation of the Lightning Network.<br/>\n" +
    "      A <strong>Caveat</strong> (or First Party Caveat) is a condition that is either added by the issuer of the\n" +
    "      macaroon or the user of the caveat. Because of the used cryptographic one-way function (HMAC), conditions can be added\n" +
    "      by anyone holding the macaroon, but nobody can remove any condition.<br/>\n" +
    "      That way, a user can further restrict the access rights of a macaroon that she obtained (for example, add a condition that\n" +
    "      the macaroon is only valid for the next 3 seconds while transmitting it over the internet and therefore restricting\n" +
    "      a potential eavesdropper's chance of using a stolen macaroon).<br/>\n" +
    "      The issuer of the macaroon (who is the holder of the private root key) can verify a signature even if further caveats have\n" +
    "      been added.<br/><br/>\n" +
    "      <strong>Third Party Caveats</strong> are conditions that have to be met by a third party. For example, a node operator wants\n" +
    "      to give all users of her website limited access to her LND node. She would then set up the LND node and the website with a\n" +
    "      <em>Shared Key</em>. The LND node would only issue macaroons that have a Third Party Caveat added for the website.<br/>\n" +
    "      This basically tells the macaroon validator that &quot;this macaroon is only valid if the user can also present a discharge macaroon\n" +
    "      from the service <code>website</code>&quot;.<br/>\n" +
    "      A user that is logged in to the website would then get a discharge macaroon that basically states &quot;I have been authorized by the\n" +
    "      service <code>website</code>&quot; and can prove that cryptographically.<br/>\n" +
    "      When the user wants to connect to the LND node and use its functionality, she would present both macaroons to the node that can\n" +
    "      then verify they both are valid, bound to each other and meet all conditions.\n" +
    "\n" +
    "\n" +
    "      <h3>Sources, tools and other useful information:</h3>\n" +
    "      <ul>\n" +
    "        <li><a href=\"https://research.google.com/pubs/pub41892.html\">Original research publication</a></li>\n" +
    "        <li><a href=\"https://github.com/go-macaroon/js-macaroon\">Used JavaScript library</a></li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Create macaroon</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- root key -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\" for=\"rootKey\">Root key (hex):</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input id=\"rootKey\"\n" +
    "               class=\"form-control\"\n" +
    "               ng-model=\"vm.rootKey\"\n" +
    "               ng-change=\"vm.newMacaroon()\"\n" +
    "               ng-class=\"{'well-error': vm.error2}\">\n" +
    "        <span class=\"input-group-addon\" ng-if=\"!vm.error2\">&lt;-- paste hex</span>\n" +
    "        <span class=\"input-group-addon well-error\" ng-if=\"vm.error2\"> {{vm.error2}}</span>\n" +
    "        <span class=\"input-group-btn\">\n" +
    "          <button class=\"btn btn-primary\" ng-click=\"vm.randomRootKey()\">Randomize</button>\n" +
    "        </span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- identifier -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\" for=\"identifier\">Identifier:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input id=\"identifier\" class=\"form-control\" ng-model=\"vm.identifier\" ng-change=\"vm.newMacaroon()\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- location -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\" for=\"location\">Location:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input id=\"location\" class=\"form-control\" ng-model=\"vm.location\" ng-change=\"vm.newMacaroon()\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- caveats -->\n" +
    "    <div class=\"form-group\" ng-repeat=\"caveat in vm.caveats track by $index\">\n" +
    "      <label class=\"col-sm-3 control-label\">Caveat {{$index + 1}}:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-model=\"vm.caveats[$index]\" ng-change=\"vm.newMacaroon()\">\n" +
    "        <span class=\"input-group-btn\">\n" +
    "          <button class=\"btn btn-primary\" ng-click=\"vm.removeCaveat($index)\"><i class=\"fas fa-trash-alt\"></i></button>\n" +
    "        </span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <div class=\"col-lg-offset-3 col-sm-9 input-group\">\n" +
    "        <div class=\"input-group\" style=\"width: 100%;\">\n" +
    "          <button class=\"btn btn-primary\" ng-click=\"vm.addCaveat()\">Add caveat</button>\n" +
    "          <button class=\"btn btn-secondary pull-right\" ng-if=\"!vm.thirdPartyMac\" ng-click=\"vm.addThirdPartyCaveat()\">\n" +
    "            Add third party caveat\n" +
    "          </button>\n" +
    "          <button class=\"btn btn-secondary pull-right\" ng-if=\"vm.thirdPartyMac\" ng-click=\"vm.removeThirdPartyCaveat()\">\n" +
    "            Remove third party caveat\n" +
    "          </button>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- third party caveat -->\n" +
    "    <div class=\"form-group\" ng-if=\"vm.thirdPartyMac\">\n" +
    "      <label class=\"col-sm-3 control-label\">Third Party Caveat</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Shared Root key (hex):</div>\n" +
    "          <input class=\"form-control\"\n" +
    "                 ng-model=\"vm.thirdPartyMac.rootKey\"\n" +
    "                 ng-change=\"vm.newMacaroon()\"\n" +
    "                 ng-class=\"{'well-error': vm.error4}\">\n" +
    "          <span class=\"input-group-addon\" ng-if=\"!vm.error4\">&lt;-- paste hex</span>\n" +
    "          <span class=\"input-group-addon well-error\" ng-if=\"vm.error4\"> {{vm.error4}}</span>\n" +
    "          <span class=\"input-group-btn\">\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"vm.randomTpmRootKey()\">Randomize</button>\n" +
    "          </span>\n" +
    "        </div>\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Identifier:</div>\n" +
    "          <input class=\"form-control\" ng-model=\"vm.thirdPartyMac.identifier\" ng-change=\"vm.newMacaroon()\">\n" +
    "        </div>\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Location:</div>\n" +
    "          <input class=\"form-control\" ng-model=\"vm.thirdPartyMac.location\" ng-change=\"vm.newMacaroon()\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- discharge macaroon -->\n" +
    "    <div class=\"form-group\" ng-if=\"vm.thirdPartyMac\">\n" +
    "      <label class=\"col-sm-3 control-label\">Discharge macaroon from <br/>Third Party:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" value=\"{{ vm.serializeMacaroon(vm.thirdPartyMac.macaroon, false) }}\" ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\" for=\"json\">JSON:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <textarea id=\"json2\" rows=\"10\" ng-readonly=\"true\" class=\"form-control\">{{\n" +
    "          vm.serializeMacaroon(vm.macaroon2, vm.showJson)\n" +
    "          }}</textarea>\n" +
    "        <br/>\n" +
    "        <input type=\"checkbox\" ng-model=\"vm.showJson\"> Show as JSON\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Decode macaroon</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\" for=\"hash\">Hex serialized macaroon:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input id=\"hash\"\n" +
    "               class=\"form-control\"\n" +
    "               ng-model=\"vm.encodedMacaroon\"\n" +
    "               ng-change=\"vm.decodeMacaroon()\"\n" +
    "               ng-class=\"{'well-error': vm.error}\">\n" +
    "        <span class=\"input-group-addon\" ng-if=\"!vm.error\">&lt;-- paste here to decode</span>\n" +
    "        <span class=\"input-group-addon well-error\" ng-if=\"vm.error\"> {{vm.error}}</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\" for=\"json\">Decoded as JSON:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <textarea id=\"json\" rows=\"30\" ng-readonly=\"true\" class=\"form-control\">{{ vm.serializeMacaroon(vm.macaroon, true) }}</textarea>\n" +
    "        <input type=\"checkbox\" ng-model=\"vm.tryDecodingId\"> Try to decode identifier\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- verify against root key -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\" for=\"verificationRootKey\">Verify signature with root key:</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input id=\"verificationRootKey\"\n" +
    "               class=\"form-control\"\n" +
    "               ng-model=\"vm.verificationRootKey\"\n" +
    "               ng-change=\"vm.verifyMacaroon()\"\n" +
    "               ng-class=\"{'well-error': vm.error3, 'well-success': vm.valid}\">\n" +
    "        <span class=\"input-group-addon\" ng-if=\"!vm.error3\">&lt;-- paste hex</span>\n" +
    "        <span class=\"input-group-addon well-error\" ng-if=\"vm.error3\"> {{vm.error3}}</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- verify against root key -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-4 control-label\" for=\"discharge\">Discharge macaroon<br/>(for Third Party Caveat verification):</label>\n" +
    "      <div class=\"col-sm-8 input-group\">\n" +
    "        <input id=\"discharge\"\n" +
    "               class=\"form-control\"\n" +
    "               ng-model=\"vm.verificationDischarge\"\n" +
    "               ng-change=\"vm.verifyMacaroon()\">\n" +
    "        <span class=\"input-group-addon\">&lt;-- paste hex</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('pages/mu-sig/mu-sig.html',
    "<h1>MuSig: Key Aggregation for Schnorr Signatures</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      MuSig is a key aggregation scheme for Schnorr signatures that is secured agains rogue-key-attacks.\n" +
    "\n" +
    "      <h3>Sources, tools and other useful information:</h3>\n" +
    "      <ul>\n" +
    "        <li><a href=\"https://eprint.iacr.org/2018/068\">MuSig paper from Blockstream</a></li>\n" +
    "        <li><a href=\"https://blockstream.com/2018/01/23/musig-key-aggregation-schnorr-signatures/\">MuSig article</a></li>\n" +
    "        <li><a href=\"https://github.com/guggero/bip-schnorr\">Used JavaScript library</a></li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<h3>Interactive demo</h3>\n" +
    "\n" +
    "<h4>Message and participant's key pairs</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- message -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Message to be signed:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-model=\"vm.message\" ng-change=\"vm.hashMessage()\">\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Hash</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.publicData.message.toString('hex')}}\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- key pairs -->\n" +
    "    <div class=\"form-group\" ng-repeat=\"pair in vm.keyPairs\">\n" +
    "      <label class=\"col-sm-3 control-label\">\n" +
    "        Key pair {{$index + 1}}:<br/><br/>\n" +
    "        <small ng-if=\"vm.keyPairs.length > 1\">\n" +
    "          <a ng-click=\"vm.removeKeyPair($index)\" ng-if=\"vm.step == 0\"><i class=\"fas fa-trash-alt\"></i></a>\n" +
    "        </small>\n" +
    "      </label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Private key</div>\n" +
    "          <input class=\"form-control\" ng-model=\"pair.privateKey\" ng-change=\"vm.updateKeyPair($index)\" ng-readonly=\"vm.step > 0\">\n" +
    "          <span class=\"input-group-addon\">&lt;-- paste hex</span>\n" +
    "          <span class=\"input-group-btn\">\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"vm.randomKeyPair($index)\" ng-disabled=\"vm.step > 0\">Randomize</button>\n" +
    "          </span>\n" +
    "        </div>\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Public key</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{pair.publicKey}}\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"form-group\">\n" +
    "      <div class=\"col-lg-offset-3 col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-btn\">\n" +
    "          <button class=\"btn btn-primary\" ng-click=\"vm.newPrivateKey()\" ng-disabled=\"vm.step > 0\">Add key pair</button></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<p>\n" +
    "  After you have set up the key pairs, click the following button to step through the signing process.<br/>\n" +
    "  Observe how the public and private data changes after each step.<br/>\n" +
    "  To reset the demo, please reload the page.\n" +
    "</p>\n" +
    "\n" +
    "<button class=\"btn btn-primary\" ng-click=\"vm.nextStep()\" ng-disabled=\"vm.step > 7\">{{vm.steps[vm.step].label}}</button>\n" +
    "\n" +
    "<h4>Public data</h4>\n" +
    "<small>This represents data that is known to all participants. In fact, every participant will calculate/store these values during the signing session.</small>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <div class=\"col-sm-12 input-group\">\n" +
    "        <textarea rows=\"15\" ng-readonly=\"true\" class=\"form-control\">{{vm.hexEncoded(vm.publicData) | json}}</textarea>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Signer private data</h4>\n" +
    "<small>\n" +
    "  This represents data that is only known by the individual party and is never shared between the signers!\n" +
    "  So for example, the owner of the key pair 2 only knows the data shown here at index 1.\n" +
    "</small>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <div class=\"col-sm-12 input-group\">\n" +
    "        <textarea rows=\"15\" ng-readonly=\"true\" class=\"form-control\">{{vm.hexEncoded(vm.signerPrivateData) | json}}</textarea>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('pages/schnorr/schnorr.html',
    "<h1>BIP Schnorr Signatures</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      Schnorr Signatures are a form of Digital Signature Algorithms (DSA) that produces short signatures even when combining multiple\n" +
    "      public keys (when using for multisig).<br/><br/>\n" +
    "      Currently there is a BIP that has no number assigned yet that introduces a specific signature scheme for Schnorr that produces\n" +
    "      64-byte signatures over the elliptic curve <em>secp256k1</em>.<br/>\n" +
    "      This demo page shows how this BIP could look like when implemented in Bitcoin.\n" +
    "\n" +
    "      <h3>Sources, tools and other useful information:</h3>\n" +
    "      <ul>\n" +
    "        <li><a href=\"https://github.com/sipa/bips/blob/bip-schnorr/bip-schnorr.mediawiki\">BIP</a></li>\n" +
    "        <li><a href=\"https://en.wikipedia.org/wiki/Schnorr_signature\">Wikipedia article</a></li>\n" +
    "        <li><a href=\"https://github.com/guggero/bip-schnorr\">Used JavaScript library</a></li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Sign message</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- key pairs -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Key pairs:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Private key</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.privateKey}}\">\n" +
    "        </div>\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Public key</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.publicKey}}\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- message -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Message:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-model=\"vm.message\" ng-change=\"vm.signMessage()\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- message sha256 -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">SHA256 hash of message:</label>\n" +
    "      <div class=\"col-sm-9 no-left-padding\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.messageHash.toString('hex')}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- ECDSA signature -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">ECDSA Signature:</label>\n" +
    "      <div class=\"col-sm-9 no-left-padding\">\n" +
    "        <textarea class=\"form-control\" rows=\"2\" ng-readonly=\"true\">{{vm.ecdsaSignature}}</textarea>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- schnorr signature -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Schnorr Signature:</label>\n" +
    "      <div class=\"col-sm-9 no-left-padding\">\n" +
    "        <textarea class=\"form-control\" rows=\"2\" ng-readonly=\"true\">{{vm.signature}}</textarea>\n" +
    "        Signature size improvement: <b>{{$root.round(vm.sizeImprovement, 1)}}%</b>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Verify Schnorr signature</h4>\n" +
    "<div class=\"well\" ng-class=\"{'well-success': vm.signatureValid, 'well-error': !vm.signatureValid}\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"publicKey\" class=\"col-sm-3 control-label\">Public key:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input id=\"publicKey\"\n" +
    "               ng-model=\"vm.publicKeyToVerify\"\n" +
    "               ng-change=\"vm.verifySignature()\"\n" +
    "               class=\"form-control\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"messageHash\" class=\"col-sm-3 control-label\">Message hash:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input id=\"messageHash\"\n" +
    "               ng-model=\"vm.messageHashToVerify\"\n" +
    "               ng-change=\"vm.verifySignature()\"\n" +
    "               class=\"form-control\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"signature\" class=\"col-sm-3 control-label\">Signature:</label>\n" +
    "      <div class=\"col-sm-9 no-left-padding\">\n" +
    "        <input id=\"signature\"\n" +
    "               ng-model=\"vm.signatureToVerify\"\n" +
    "               ng-change=\"vm.verifySignature()\"\n" +
    "               class=\"form-control\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Naïve signature aggregation of multiple private keys over same message</h4>\n" +
    "<small>\n" +
    "  <b>Note:</b> this is just a demo of how the most simple aggregation works. This is not secure and is not part of any BIP!\n" +
    "  See <a href=\"https://github.com/guggero/bip-schnorr\">bip-schnorr</a> for more information.\n" +
    "</small>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "    <!-- private keys -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Private keys:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Private key 1</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.privateKey}}\">\n" +
    "        </div>\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">Private key 2</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.privateKey2}}\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"messageHash\" class=\"col-sm-3 control-label\">Sum of public keys:</label>\n" +
    "      <div class=\"col-sm-9 no-left-padding\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.sumOfPublicKeys}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Signature:</label>\n" +
    "      <div class=\"col-sm-9 no-left-padding\">\n" +
    "        <textarea rows=\"2\" class=\"form-control\" ng-readonly=\"true\">{{vm.aggregatedSignature}}</textarea>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('pages/shamir-secret-sharing/shamir-secret-sharing.html',
    "<h1>Shamir's Secret Sharing Scheme</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      Shamir's Secret Sharing Scheme is a way to split a secret (a password, or private key for example)\n" +
    "      into multiple parts, but only some parts (for example 5 out of 10) are needed to re-create the secret.\n" +
    "\n" +
    "      <h3>Sources, tools and other useful information:</h3>\n" +
    "      <ul>\n" +
    "        <li><a href=\"https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing\">Wikipedia article</a></li>\n" +
    "        <li><a href=\"https://github.com/grempe/secrets.js\">Used JavaScript library</a></li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Split secret into shares</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- secret -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Secret:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-model=\"vm.secret\" ng-change=\"vm.generateShares()\">\n" +
    "        <span class=\"input-group-btn\">\n" +
    "          <button class=\"btn btn-primary\" ng-click=\"vm.newSecret()\">Generate new</button>\n" +
    "        </span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- secrets sharing settings -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Secrets sharing settings:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-addon\">Number of shares</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.numShares\"\n" +
    "               ng-change=\"vm.generateShares()\"\n" +
    "               ng-class=\"{'well-error': vm.error}\"\n" +
    "               type=\"number\">\n" +
    "        <div class=\"input-group-addon\">Shares required to reconstruct</div>\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.sharesNeeded\"\n" +
    "               ng-change=\"vm.generateShares()\"\n" +
    "               ng-class=\"{'well-error': vm.error}\"\n" +
    "               type=\"number\">\n" +
    "        <div class=\"input-group-addon\">Padding length</div>\n" +
    "        <select ng-model=\"vm.minPad\"\n" +
    "                ng-options=\"padding.label for padding in vm.paddingLengths\"\n" +
    "                ng-change=\"vm.generateShares()\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "      <div class=\"col-sm-9 col-sm-offset-3 input-group\" ng-if=\"vm.error\">\n" +
    "        <div class=\"input-group-addon well-error\">{{vm.error}}</div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- shares -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Shares:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group\" ng-repeat=\"share in vm.shares\">\n" +
    "          <div class=\"input-group-addon\">Share {{$index + 1}}</div>\n" +
    "          <input class=\"form-control\"\n" +
    "                 ng-readonly=\"true\"\n" +
    "                 value=\"{{share}}\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<h4>Combine shares into secret</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- input shares -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\" for=\"raw\">Combine shares (one per line):</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <textarea id=\"raw\"\n" +
    "                  rows=\"10\"\n" +
    "                  ng-model=\"vm.shareLines\"\n" +
    "                  ng-change=\"vm.parseShares()\"\n" +
    "                  class=\"form-control\"\n" +
    "                  ng-class=\"{'well-error': vm.error2}\">\n" +
    "          </textarea>\n" +
    "      </div>\n" +
    "      <div class=\"input-group\" ng-if=\"vm.error2\">\n" +
    "        <div class=\"input-group-addon well-error\">{{vm.error2}}</div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- combined secret -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Combined secret:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.combinedSecret}}\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('pages/transaction-creator/transaction-creator.html',
    "<h1>Transaction Creator</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      On this page you can create a transaction for any network/blockchain that is configured.<br/>\n" +
    "      The idea is that you can use this tool to create any valid transaction offline and then just\n" +
    "      submit it to an online wallet. This way your private key can stay offline (only if you download this tool\n" +
    "      and use if offline of course!).\n" +
    "\n" +
    "      <h3>Sources, tools and other useful information:</h3>\n" +
    "      <ul>\n" +
    "        <li><a href=\"https://bitcoinjs.org/\">BitcoinJS</a></li>\n" +
    "        <li><a href=\"https://github.com/bitcoinjs/bitcoinjs-lib\">BitcoinJS GitHub repo</a></li>\n" +
    "        <li>\n" +
    "          <a href=\"https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/transactions.js#L46\">\n" +
    "            Create a typical transaction\n" +
    "          </a>\n" +
    "        </li>\n" +
    "        <li>\n" +
    "          <a href=\"https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/transactions.js#L151\">\n" +
    "            Create a SegWit P2SH (P2WPKH) transaction\n" +
    "          </a>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"alert alert-warning\">\n" +
    "  <strong>Warning</strong>: This is meant as a playground only! You should only use testnet keys and never paste real private keys\n" +
    "  into any web page!\n" +
    "</div>\n" +
    "\n" +
    "<h4>Set target network and private key</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- target network -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Target network:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <select ng-model=\"vm.network\"\n" +
    "                ng-options=\"network.label for network in vm.networks\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- private key -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"wifUncompressed\" class=\"col-sm-3 control-label\">Paste your private key here:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input id=\"wifUncompressed\"\n" +
    "               ng-model=\"vm.keyPair.wif\"\n" +
    "               ng-change=\"vm.importFromWif()\"\n" +
    "               ng-class=\"{'well-error': vm.error}\"\n" +
    "               class=\"form-control\"><br/>\n" +
    "        <span class=\"input-group-addon\" ng-if=\"!vm.error\">&lt;-- paste compressed/uncompressed key here</span>\n" +
    "        <span class=\"input-group-addon well-error\" ng-if=\"vm.error\"> {{vm.error}}</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Source address -->\n" +
    "    <div class=\"form-group\" ng-if=\"vm.keyValid\">\n" +
    "      <label class=\"col-sm-3 control-label\">Source address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">P2PKH</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.keyPair.address}}\">\n" +
    "          <div class=\"input-group-addon\">P2SH</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.keyPair.scriptAddress}}\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- SegWit source address -->\n" +
    "    <div class=\"form-group\" ng-if=\"vm.keyValid && vm.network.config.bech32\">\n" +
    "      <label class=\"col-sm-3 control-label\">SegWit source address:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group\">\n" +
    "          <div class=\"input-group-addon\">P2SH-P2WPKH</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.keyPair.nestedP2WPKHAddress}}\">\n" +
    "          <div class=\"input-group-addon\">bech32 P2WPKH</div>\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.keyPair.P2WPKHAddress}}\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"vm.keyValid\">\n" +
    "  <h4>Input</h4>\n" +
    "  <div class=\"well\">\n" +
    "    <form class=\"form-horizontal\">\n" +
    "\n" +
    "      <!-- input -->\n" +
    "      <div class=\"form-group\">\n" +
    "        <label class=\"col-sm-3 control-label\">Input transaction (UTXO):</label>\n" +
    "        <div class=\"col-sm-9\">\n" +
    "          <div class=\"input-group\">\n" +
    "            <div class=\"input-group-addon\">Transaction ID (txId)</div>\n" +
    "            <input class=\"form-control\"\n" +
    "                   ng-model=\"vm.inputTxId\"\n" +
    "                   ng-change=\"vm.createTransaction()\"\n" +
    "                   type=\"text\">\n" +
    "          </div>\n" +
    "          <div class=\"input-group\">\n" +
    "            <div class=\"input-group-addon\">Index (vout)</div>\n" +
    "            <input class=\"form-control\"\n" +
    "                   ng-model=\"vm.inputTxVout\"\n" +
    "                   ng-change=\"vm.createTransaction()\"\n" +
    "                   type=\"number\">\n" +
    "          </div>\n" +
    "          <div class=\"input-group\">\n" +
    "            <div class=\"input-group-addon\">Input is SegWit transaction:</div>\n" +
    "            <div class=\"input-group-addon\">\n" +
    "              <input type=\"checkbox\" ng-model=\"vm.inputSegwit\">\n" +
    "            </div>\n" +
    "            <input class=\"form-control no-border\"\n" +
    "                   ng-readonly=\"true\"\n" +
    "                   type=\"text\">\n" +
    "          </div>\n" +
    "          <div class=\"input-group\">\n" +
    "            <div class=\"input-group-addon\">Expected unspent amount in Satoshi (used for fee calculation)</div>\n" +
    "            <input class=\"form-control\"\n" +
    "                   ng-model=\"vm.inputAmount\"\n" +
    "                   ng-change=\"vm.calculateFee()\"\n" +
    "                   type=\"number\">\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </form>\n" +
    "  </div>\n" +
    "\n" +
    "  <h4>Outputs</h4>\n" +
    "  <div class=\"well\">\n" +
    "    <form class=\"form-horizontal\">\n" +
    "\n" +
    "      <!-- target address -->\n" +
    "      <div class=\"form-group\">\n" +
    "        <label class=\"col-sm-3 control-label\">Target address:</label>\n" +
    "        <div class=\"col-sm-9\">\n" +
    "          <div class=\"input-group\">\n" +
    "            <div class=\"input-group-addon\">Any address</div>\n" +
    "            <input class=\"form-control\"\n" +
    "                   ng-model=\"vm.outputAddress\"\n" +
    "                   ng-change=\"vm.createTransaction()\"\n" +
    "                   type=\"text\">\n" +
    "            <div class=\"input-group-addon\">Amount (satoshi!)</div>\n" +
    "            <input class=\"form-control\"\n" +
    "                   ng-model=\"vm.outputAmount\"\n" +
    "                   ng-change=\"vm.calculateFee()\"\n" +
    "                   type=\"number\">\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <!-- change address -->\n" +
    "      <div class=\"form-group\">\n" +
    "        <label class=\"col-sm-3 control-label\">Change address:</label>\n" +
    "        <div class=\"col-sm-9\">\n" +
    "          <div class=\"input-group\">\n" +
    "            <div class=\"input-group-addon\">Send change to address:</div>\n" +
    "            <div class=\"input-group-addon\">\n" +
    "              <input type=\"checkbox\" ng-model=\"vm.useChange\">\n" +
    "            </div>\n" +
    "            <input class=\"form-control no-border\"\n" +
    "                   ng-readonly=\"true\"\n" +
    "                   type=\"text\">\n" +
    "          </div>\n" +
    "          <div class=\"input-group\" ng-if=\"vm.useChange\" >\n" +
    "            <div class=\"input-group-addon\">Change address</div>\n" +
    "            <input class=\"form-control\"\n" +
    "                   ng-model=\"vm.changeAddress\"\n" +
    "                   ng-change=\"vm.createTransaction()\"\n" +
    "                   type=\"text\">\n" +
    "            <div class=\"input-group-addon\">Amount (satoshi!)</div>\n" +
    "            <input class=\"form-control\"\n" +
    "                   ng-model=\"vm.changeAmount\"\n" +
    "                   ng-change=\"vm.calculateFee()\"\n" +
    "                   type=\"number\">\n" +
    "          </div>\n" +
    "          <div class=\"input-group\">\n" +
    "            <div class=\"input-group\">\n" +
    "              <div class=\"input-group-addon\" ng-if=\"!vm.feeError\">Calculated fee (satoshi)</div>\n" +
    "              <input class=\"form-control\"\n" +
    "                     ng-class=\"{'well-error': vm.feeError}\"\n" +
    "                     ng-readonly=\"true\"\n" +
    "                     value=\"{{vm.feeError || vm.calculatedFee}}\">\n" +
    "              <div class=\"input-group-addon\" ng-if=\"!vm.feeError\">Calculated fee (satoshi/byte)</div>\n" +
    "              <input class=\"form-control\"\n" +
    "                     ng-class=\"{'well-error': vm.feeError}\"\n" +
    "                     ng-readonly=\"true\"\n" +
    "                     value=\"{{vm.feeError || vm.calculatedFee / (vm.raw.length * 4)}}\">\n" +
    "            </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </form>\n" +
    "  </div>\n" +
    "\n" +
    "  <h4>Outputs</h4>\n" +
    "  <div class=\"well\">\n" +
    "    <form class=\"form-horizontal\">\n" +
    "\n" +
    "      <!-- transaction raw hex value -->\n" +
    "      <div class=\"form-group\">\n" +
    "        <label class=\"col-sm-3 control-label\" for=\"raw\">Transaction raw hex value:</label>\n" +
    "        <div class=\"col-sm-9 input-group\">\n" +
    "          <textarea id=\"raw\"\n" +
    "                    rows=\"10\"\n" +
    "                    ng-readonly=\"true\"\n" +
    "                    class=\"form-control\"\n" +
    "                    ng-class=\"{'well-error': vm.txError}\"\n" +
    "          >{{vm.txError || vm.raw}}</textarea>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <!-- transaction hex -->\n" +
    "      <div class=\"form-group\">\n" +
    "        <label class=\"col-sm-3 control-label\">TX ID:</label>\n" +
    "        <div class=\"col-sm-9 no-left-padding\">\n" +
    "          <input class=\"form-control\" ng-readonly=\"true\" value=\"{{vm.txId}}\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </form>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('pages/wallet-import/wallet-import.html',
    "<h1>Import HD wallet into Bitcoin Core</h1>\n" +
    "\n" +
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a ng-click=\"vm.showExplanation = !vm.showExplanation\">Explanation</a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse collapse\" ng-class=\"{in: vm.showExplanation}\">\n" +
    "    <div class=\"panel-body\">\n" +
    "      Currently, there is no easy way to import addresses from a HD seed that has been created by another software into Bitcoin Core.<br/>\n" +
    "      This tool helps you do that.\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"alert alert-warning\">\n" +
    "  <strong>Warning</strong>: This is meant as a playground only! You should only use testnet keys and never paste real private keys\n" +
    "  into any web page!\n" +
    "</div>\n" +
    "\n" +
    "<h4>Import HD wallet</h4>\n" +
    "<div class=\"well\">\n" +
    "  <form class=\"form-horizontal\">\n" +
    "\n" +
    "    <!-- mnemonic -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Seed Mnemonic (BIP39):</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\" ng-model=\"vm.mnemonic\" ng-change=\"vm.fromMnemonic()\">\n" +
    "        <span class=\"input-group-addon\">&lt;-- paste here to import.</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- passphrase -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Passphrase:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <input class=\"form-control\"\n" +
    "               ng-model=\"vm.passphrase\"\n" +
    "               ng-change=\"vm.fromMnemonic()\"\n" +
    "               type=\"{{vm.asPassword ? 'password' : 'text'}}\">\n" +
    "        <span class=\"input-group-btn\">\n" +
    "            <button class=\"btn btn-primary\" ng-click=\"vm.asPassword = !vm.asPassword\">\n" +
    "                {{vm.asPassword ? 'Show' : 'Hide'}} passphrase\n" +
    "            </button>\n" +
    "        </span>\n" +
    "        <div class=\"input-group-addon\">Method</div>\n" +
    "        <select ng-model=\"vm.strenghtening\"\n" +
    "                ng-change=\"vm.fromMnemonic()\"\n" +
    "                ng-options=\"s.label for s in vm.strenghteningMethods\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- derive -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Parameters to derive keys:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <select ng-model=\"vm.scheme\"\n" +
    "                ng-options=\"scheme.label for scheme in vm.schemes\"\n" +
    "                ng-change=\"vm.fromSeed()\"\n" +
    "                class=\"form-control\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- root key base58 -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">HD master root key:</label>\n" +
    "      <div class=\"col-sm-9 input-group as-block\">\n" +
    "        <input class=\"form-control\" value=\"{{vm.nodeBase58}}\" ng-readonly=\"true\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- import type -->\n" +
    "    <div class=\"form-group\">\n" +
    "      <label class=\"col-sm-3 control-label\">Import parameters:</label>\n" +
    "      <div class=\"col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-addon\">Import type</div>\n" +
    "        <select ng-model=\"vm.importType\" ng-options=\"type.label for type in vm.importTypes\" class=\"form-control\">\n" +
    "        </select>\n" +
    "        <div class=\"input-group-addon\">Start Path</div>\n" +
    "        <input class=\"form-control\" ng-model=\"vm.path\">\n" +
    "      </div>\n" +
    "      <div class=\"col-sm-offset-3 col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-addon\">Change (_chg_): Start value</div>\n" +
    "        <input class=\"form-control\" ng-model=\"vm.changeStart\">\n" +
    "        <div class=\"input-group-addon\">End value</div>\n" +
    "        <input class=\"form-control\" ng-model=\"vm.changeEnd\">\n" +
    "      </div>\n" +
    "      <div class=\"col-sm-offset-3 col-sm-9 input-group\">\n" +
    "        <div class=\"input-group-addon\">Index (_idx_): Start value</div>\n" +
    "        <input class=\"form-control\" ng-model=\"vm.indexStart\">\n" +
    "        <div class=\"input-group-addon\">End value</div>\n" +
    "        <input class=\"form-control\" ng-model=\"vm.indexEnd\">\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <div class=\"col-sm-offset-3 col-sm-9 input-group\">\n" +
    "        <button class=\"btn btn-primary\" ng-click=\"vm.createExport()\">Create export</button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- result -->\n" +
    "    <div class=\"form-group\" ng-if=\"vm.result\">\n" +
    "      <div class=\"col-sm-12 input-group\">\n" +
    "        <textarea rows=\"50\" ng-readonly=\"true\" class=\"form-control\" style=\"white-space: pre\">{{vm.result}}</textarea>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n" +
    "\n"
  );

}]);
