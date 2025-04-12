(function() {
    'use strict';
    
    angular
        .module('literalCafeApp')
        .controller('UserController', UserController);
    
    UserController.$inject = ['$location', 'UserService', 'AuthService'];
    
    function UserController($location, UserService, AuthService) {
        var vm = this;
        
        // Properties
        vm.userProfile = {
            name: '',
            photo: 'img/default-avatar.png',
            xp: 0,
            coins: 0,
            level: 1
        };
        vm.challenges = [];
        vm.rewards = [];
        vm.redeemedRewards = [];
        
        // Methods
        vm.logout = logout;
        vm.editProfile = editProfile;
        vm.changePassword = changePassword;
        vm.redeemReward = redeemReward;
        
        // Initialize controller
        activate();
        
        function activate() {
            // Check if user is authenticated
            if (!AuthService.isAuthenticated()) {
                $location.path('/');
                return;
            }
            
            // Load user profile
            UserService.getUserProfile()
                .then(function(profile) {
                    vm.userProfile = profile;
                })
                .catch(function(error) {
                    console.error('Error loading user profile:', error);
                });
            
            // Load challenges
            UserService.getChallenges()
                .then(function(challenges) {
                    vm.challenges = challenges;
                })
                .catch(function(error) {
                    console.error('Error loading challenges:', error);
                });
            
            // Load rewards
            UserService.getRewards()
                .then(function(rewards) {
                    vm.rewards = rewards;
                })
                .catch(function(error) {
                    console.error('Error loading rewards:', error);
                });
            
            // Load redeemed rewards
            UserService.getRedeemedRewards()
                .then(function(redeemedRewards) {
                    vm.redeemedRewards = redeemedRewards;
                })
                .catch(function(error) {
                    console.error('Error loading redeemed rewards:', error);
                });
        }
        
        function logout() {
            AuthService.logout();
            $location.path('/');
        }
        
        function editProfile(profile) {
            // Update user profile
            UserService.updateProfile(profile)
                .then(function(updatedProfile) {
                    vm.userProfile = updatedProfile;
                    alert('Perfil atualizado com sucesso!');
                })
                .catch(function(error) {
                    console.error('Error updating profile:', error);
                    alert('Erro ao atualizar perfil. Tente novamente.');
                });
        }
        
        function changePassword(currentPassword, newPassword) {
            // Change user password
            UserService.changePassword(currentPassword, newPassword)
                .then(function() {
                    alert('Senha alterada com sucesso!');
                })
                .catch(function(error) {
                    console.error('Error changing password:', error);
                    alert('Erro ao alterar senha. Tente novamente.');
                });
        }
        
        function redeemReward(reward) {
            // Redeem a reward
            UserService.redeemReward(reward.id)
                .then(function(redeemedReward) {
                    vm.userProfile.coins -= reward.cost;
                    vm.redeemedRewards.push(redeemedReward);
                    alert('Prêmio resgatado com sucesso!');
                })
                .catch(function(error) {
                    console.error('Error redeeming reward:', error);
                    alert('Erro ao resgatar prêmio. Tente novamente.');
                });
        }
    }
})();
