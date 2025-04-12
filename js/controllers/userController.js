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
        vm.navigateTo = navigateTo;
        
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
            UserService.redeemReward(reward)
                .then(function(redeemedReward) {
                    // Update the user's coin balance
                    vm.userProfile.coins -= reward.cost;
                    vm.redeemedRewards.push(redeemedReward);
                    
                    // Show the redemption modal with QR code
                    vm.currentRedeemedReward = redeemedReward;
                    
                    // Generate QR code for the reward
                    var qrCodeElement = document.getElementById('rewardQRCode');
                    if (qrCodeElement) {
                        // Clear previous QR code
                        qrCodeElement.innerHTML = '';
                        
                        // Generate new QR code
                        new QRCode(qrCodeElement, {
                            text: redeemedReward.qrCode,
                            width: 180,
                            height: 180,
                            colorDark: '#1D140F',
                            colorLight: '#ffffff',
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    }
                    
                    // Show the modal
                    $('#rewardRedeemedModal').modal('show');
                    
                    // Refresh rewards list after a successful redemption
                    UserService.getRewards()
                        .then(function(rewards) {
                            vm.rewards = rewards;
                        });
                })
                .catch(function(error) {
                    console.error('Error redeeming reward:', error);
                    
                    // Show error message based on error type
                    var errorMessage = 'Erro ao resgatar prêmio. Tente novamente mais tarde.';
                    
                    if (error && error.error === 'insufficient_coins') {
                        errorMessage = 'Você não tem moedas suficientes para resgatar este prêmio.';
                    } else if (error && error.message) {
                        errorMessage = error.message;
                    }
                    
                    // Show error in a modal or alert
                    $('#errorMessage').text(errorMessage);
                    $('#errorModal').modal('show');
                });
        }
        
        function navigateTo(path) {
            // Navigate to the specified path
            console.log('Navigating to:', path);
            $location.path(path);
        }
    }
})();
