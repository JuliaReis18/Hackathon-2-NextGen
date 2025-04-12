(function() {
    'use strict';
    
    angular
        .module('literalCafeApp')
        .controller('AuthController', AuthController);
    
    AuthController.$inject = ['$location', 'AuthService'];
    
    function AuthController($location, AuthService) {
        var vm = this;
        
        // Properties
        vm.user = {
            username: '',
            password: '',
            name: '',
            cpf: '',
            phone: '',
            email: ''
        };
        vm.isLogin = true;
        vm.errorMessage = '';
        
        // Initialize
        init();
        
        // Methods
        vm.login = login;
        vm.register = register;
        vm.toggleForm = toggleForm;
        
        function login() {
            vm.errorMessage = '';
            
            // Validate input fields
            if (!vm.user.username || !vm.user.password) {
                vm.errorMessage = 'Por favor, preencha todos os campos';
                return;
            }
            
            // For the demo, we need to check if the credentials match the expected values
            if (vm.user.username !== 'cliente' || vm.user.password !== '123456') {
                vm.errorMessage = 'Credenciais inválidas. Para o demo, use: cliente/123456';
                return;
            }
            
            // Call the login service with the validated credentials
            AuthService.login(vm.user.username, vm.user.password)
                .then(function(response) {
                    console.log('Login successful in controller');
                    // Store token in localStorage
                    localStorage.setItem('access_token', response.access_token);
                    localStorage.setItem('token_expires', response.expires_in);
                    
                    // Redirect to dashboard
                    $location.path('/dashboard');
                })
                .catch(function(error) {
                    vm.errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
                    console.error('Login error:', error);
                });
        }
        
        function register() {
            if (!vm.user.name || !vm.user.cpf || !vm.user.phone || !vm.user.email || !vm.user.password) {
                vm.errorMessage = 'Por favor, preencha todos os campos';
                return;
            }
            
            vm.errorMessage = '';
            
            // Call the registration API
            AuthService.register(vm.user)
                .then(function(response) {
                    // Switch to login view
                    vm.isLogin = true;
                    vm.user.username = vm.user.cpf; // Use CPF as username
                    
                    // Show success message
                    alert('Cadastro realizado com sucesso! Faça login para continuar.');
                })
                .catch(function(error) {
                    vm.errorMessage = 'Erro ao realizar cadastro. Tente novamente.';
                    console.error('Registration error:', error);
                });
        }
        
        function toggleForm() {
            console.log('toggleForm called, current isLogin:', vm.isLogin);
            vm.isLogin = !vm.isLogin;
            vm.errorMessage = '';
            console.log('isLogin after toggle:', vm.isLogin);
            
            // Reset form fields when toggling
            if (vm.isLogin) {
                vm.user.username = '';
                vm.user.password = '';
            } else {
                vm.user.name = '';
                vm.user.cpf = '';
                vm.user.phone = '';
                vm.user.email = '';
                vm.user.password = '';
            }
        }
        
        function init() {
            // Check if user is already authenticated
            if (AuthService.isAuthenticated()) {
                $location.path('/dashboard');
            }
        }
    }
})();
