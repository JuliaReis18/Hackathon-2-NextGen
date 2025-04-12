(function() {
    'use strict';
    
    angular
        .module('literalCafeApp')
        .directive('mainMenu', mainMenu);
    
    function mainMenu() {
        return {
            restrict: 'E',
            templateUrl: 'templates/main-menu.html',
            controller: MainMenuController,
            controllerAs: 'menu',
            bindToController: true
        };
    }
    
    MainMenuController.$inject = ['$location', 'AuthService'];
    
    function MainMenuController($location, AuthService) {
        var vm = this;
        
        // Properties
        vm.isAuthenticated = AuthService.isAuthenticated;
        
        // Methods
        vm.isActive = isActive;
        vm.logout = logout;
        
        function isActive(viewLocation) {
            return viewLocation === $location.path();
        }
        
        function logout() {
            AuthService.logout();
            $location.path('/');
        }
    }
})();
