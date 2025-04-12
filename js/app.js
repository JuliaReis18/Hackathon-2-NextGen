(function() {
    'use strict';
    
    angular
        .module('literalCafeApp', ['ngRoute'])
        .config(config);
    
    config.$inject = ['$routeProvider', '$locationProvider'];
    
    function config($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'templates/login.html',
                controller: 'AuthController',
                controllerAs: 'auth'
            })
            .when('/dashboard', {
                templateUrl: 'templates/dashboard.html',
                controller: 'UserController',
                controllerAs: 'user'
            })
            .when('/challenges', {
                templateUrl: 'templates/challenges.html',
                controller: 'UserController',
                controllerAs: 'user'
            })
            .when('/rewards', {
                templateUrl: 'templates/rewards.html',
                controller: 'UserController',
                controllerAs: 'user'
            })
            .when('/profile', {
                templateUrl: 'templates/profile.html',
                controller: 'UserController',
                controllerAs: 'user'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
})();
