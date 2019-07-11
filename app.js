angular.element(document.body).ready(function () {
  angular.bootstrap(document.body, ['app'])
});

angular
  .module('app', [
    'ngRoute'
  ])
  .constant('moment', window.moment)
  .constant('lodash', window._)
  .constant('allNetworks', window.allNetworks)
  .constant('bitcoinNetworks', window.bitcoinNetworks)
  .constant('bitcoin', window.bitcoin)
  .constant('Buffer', window.bitcoin.Buffer)
  .filter('ago', function (moment) {
    return function (input) {
      var duration = moment.duration(moment().diff(moment(input)));
      return duration.humanize()
    }
  })
  .component('app', {
    templateUrl: 'app.html'
  })
  .config(routeConfig)
  .run(run);

function routeConfig($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $locationProvider.html5Mode({enabled: false, requireBase: false});

  $routeProvider
    .when('/', {template: '<intro-page></intro-page>', containerClass: 'container'})
    .when('/ecc', {template: '<ecc-page></ecc-page>', containerClass: 'container'})
    .when('/hd-wallet', {template: '<hd-wallet-page></hd-wallet-page>', containerClass: 'container'})
    .when('/bitcoin-block', {template: '<bitcoin-block-page></bitcoin-block-page>', containerClass: 'container'})
    .when('/shamir-secret-sharing', {template: '<shamir-secret-sharing-page></shamir-secret-sharing-page>', containerClass: 'container'})
    .when('/mu-sig', {template: '<mu-sig-page></mu-sig-page>', containerClass: 'container'})
    .when('/schnorr', {template: '<schnorr-page></schnorr-page>', containerClass: 'container'})
    .when('/transaction-creator', {template: '<transaction-creator-page></transaction-creator-page>', containerClass: 'container'})
    .when('/aezeed', {template: '<aezeed-page></aezeed-page>', containerClass: 'container'})
    .when('/macaroon', {template: '<macaroon-page></macaroon-page>', containerClass: 'container'})
    .when('/wallet-import', {template: '<wallet-import-page></wallet-import-page>', containerClass: 'container'})
    .otherwise({redirectTo: '/'})
}

function run($location, $rootScope, $route, lodash) {
  var id = 0;
  $rootScope.$route = $route;

  $rootScope.sha256 = function (input) {
    return CryptoJS.SHA256(input).toString();
  };

  $rootScope.isActive = function (route) {
    return route === $location.path();
  };

  $rootScope.newId = function () {
    return (id++);
  };

  $rootScope.difficultyPrefix = function (difficulty) {
    var diff = difficulty || $rootScope.difficulty;
    var result = '';
    for (var i = 1; i <= diff; i++) {
      result += '0';
    }
    return result;
  };

  $rootScope.formatString = function (str) {
    var args = [].slice.call(arguments, 1),
      i = 0;

    return str.replace(/%s/g, function () {
      return args[i++];
    });
  };

  $rootScope.hexPubKeyToBitcoinAddr = function (hex) {
    var buffer = bitcoin.Buffer.from(hex, 'hex');
    return bitcoin.address.toBase58Check(buffer, bitcoin.networks.bitcoin.pubKeyHash);
  };

  $rootScope.round =   function (number, digits) {
    var exp = Math.pow(10, digits);
    return (Math.round(number * exp) / exp).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\'');
  };

  lodash.mixin({
    deeply: function (map) {
      return function (obj, fn) {
        return map(lodash.mapValues(obj, function (v) {
          return lodash.isPlainObject(v) ? lodash.deeply(map)(v, fn) : v;
        }), fn);
      }
    }
  });
}
