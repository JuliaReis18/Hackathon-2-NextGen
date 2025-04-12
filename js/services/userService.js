(function() {
    'use strict';
    
    angular
        .module('literalCafeApp')
        .service('UserService', UserService);
    
    UserService.$inject = ['$http', '$q'];
    
    function UserService($http, $q) {
        var service = {
            getUserProfile: getUserProfile,
            updateProfile: updateProfile,
            changePassword: changePassword,
            getChallenges: getChallenges,
            getRewards: getRewards,
            getRedeemedRewards: getRedeemedRewards,
            redeemReward: redeemReward
        };
        
        return service;
        
        function getAuthHeaders() {
            return {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                'Content-Type': 'application/json'
            };
        }
        
        function getUserProfile() {
            var deferred = $q.defer();
            
            // Get the token and CPF from localStorage
            var token = localStorage.getItem('access_token');
            var userCpf = localStorage.getItem('user_cpf');
            
            if (!token || !userCpf) {
                deferred.reject('Authentication information missing');
                return deferred.promise;
            }
            
            var req = {
                method: 'GET',
                url: 'https://service2.funifier.com/v3/player/' + userCpf + '/status',
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            };
            
            $http(req).then(
                function(response) {
                    var data = response.data;
                    
                    // Process the photo URL to ensure it's valid
                    var photoUrl = 'img/default-avatar.png';
                    if (data.image && data.image.medium && data.image.medium.url) {
                        // If the URL is relative (doesn't start with http), prepend with base URL if needed
                        if (data.image.medium.url.startsWith('http') || data.image.medium.url.startsWith('/')) {
                            photoUrl = data.image.medium.url;
                        } else {
                            photoUrl = data.image.medium.url;
                        }
                    }
                    
                    // Map the API response to our profile structure
                    var profile = {
                        name: data.name || 'Cliente',
                        photo: photoUrl,
                        xp: data.point_categories && data.point_categories.xp ? data.point_categories.xp : 0,
                        coins: data.point_categories && data.point_categories.moedas ? data.point_categories.moedas : 0,
                        level: data.level ? data.level.level : 'Iniciante',
                        // Add level progress information
                        levelProgress: {
                            currentLevel: data.level_progress && data.level_progress.level ? data.level_progress.level.level : 'Iniciante',
                            currentLevelDescription: data.level_progress && data.level_progress.level ? data.level_progress.level.description : '',
                            nextLevel: data.level_progress && data.level_progress.next_level ? data.level_progress.next_level.level : '',
                            nextLevelDescription: data.level_progress && data.level_progress.next_level ? data.level_progress.next_level.description : '',
                            nextLevelPoints: data.level_progress && data.level_progress.next_points ? data.level_progress.next_points : 0,
                            percentCompleted: data.level_progress && data.level_progress.percent_completed ? data.level_progress.percent_completed : 0,
                            totalLevels: data.level_progress && data.level_progress.total_levels ? data.level_progress.total_levels : 1,
                            position: data.level_progress && data.level_progress.level ? data.level_progress.level.position : 0,
                            totalPercent: data.level_progress && data.level_progress.percent ? data.level_progress.percent : 0
                        }
                    };
                    
                    console.log('Player profile data:', data);
                    console.log('Mapped profile:', profile);
                    
                    deferred.resolve(profile);
                },
                function(error) {
                    console.error('Error fetching player status:', error);
                    deferred.reject(error);
                }
            );
            
            return deferred.promise;
        }
        
        function updateProfile(profile) {
            var deferred = $q.defer();
            
            // Get the token and user CPF from localStorage
            var token = localStorage.getItem('access_token');
            var userCpf = localStorage.getItem('user_cpf');
            
            if (!token || !userCpf) {
                deferred.reject('Authentication information missing');
                return deferred.promise;
            }
            
            // Create request to update player in Funifier using the same endpoint as registration
            var req = {
                method: 'POST',
                url: 'https://service2.funifier.com/v3/player',
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                data: {
                    _id: userCpf,  // This is the key - same ID means update
                    name: profile.name,
                    email: profile.email,
                    image: {
                        small: { url: profile.photo },
                        medium: { url: profile.photo },
                        original: { url: profile.photo }
                    },
                    extra: {
                        phone: profile.phone,
                        // Preserve the password if it exists in the profile
                        password: profile.password || undefined
                    }
                }
            };
            
            $http(req).then(
                function(response) {
                    console.log('Profile update response:', response.data);
                    
                    // Update local storage with new profile data
                    localStorage.setItem('user_name', profile.name);
                    if (profile.photo) {
                        localStorage.setItem('user_photo', profile.photo);
                    }
                    
                    deferred.resolve(profile);
                },
                function(error) {
                    console.error('Error updating profile:', error);
                    deferred.reject(error);
                }
            );
            
            return deferred.promise;
        }
        
        function changePassword(currentPassword, newPassword) {
            var deferred = $q.defer();
            
            // Get the token and user CPF from localStorage
            var token = localStorage.getItem('access_token');
            var userCpf = localStorage.getItem('user_cpf');
            var userName = localStorage.getItem('user_name') || '';
            var userPhoto = localStorage.getItem('user_photo') || 'img/default-avatar.png';
            
            if (!token || !userCpf) {
                deferred.reject('Authentication information missing');
                return deferred.promise;
            }
            
            // First verify the current password
            var authReq = {
                method: 'POST',
                url: 'https://service2.funifier.com/v3/auth/token',
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    apiKey: '67fa824b2327f74f3a34f106',
                    grant_type: 'password',
                    username: userCpf,
                    password: currentPassword
                }
            };
            
            $http(authReq).then(
                function(authResponse) {
                    // Current password is correct, now update the password using the same endpoint as registration
                    var updateReq = {
                        method: 'POST',
                        url: 'https://service2.funifier.com/v3/player',
                        headers: {
                            "Authorization": "Bearer " + token,
                            "Content-Type": "application/json"
                        },
                        data: {
                            _id: userCpf,  // This is the key - same ID means update
                            name: userName,
                            image: {
                                small: { url: userPhoto },
                                medium: { url: userPhoto },
                                original: { url: userPhoto }
                            },
                            extra: {
                                password: newPassword
                            }
                        }
                    };
                    
                    $http(updateReq).then(
                        function(response) {
                            console.log('Password update response:', response.data);
                            deferred.resolve();
                        },
                        function(error) {
                            console.error('Error updating password:', error);
                            deferred.reject({
                                message: 'Erro ao atualizar senha. Tente novamente.'
                            });
                        }
                    );
                },
                function(error) {
                    console.error('Current password verification failed:', error);
                    deferred.reject({
                        message: 'Senha atual incorreta. Por favor, verifique e tente novamente.'
                    });
                }
            );
            
            return deferred.promise;
        }
        
        function getChallenges() {
            var deferred = $q.defer();
            
            // Get the token and CPF from localStorage
            var token = localStorage.getItem('access_token');
            var userCpf = localStorage.getItem('user_cpf');
            
            if (!token || !userCpf) {
                deferred.reject('Authentication information missing');
                return deferred.promise;
            }
            
            var req = {
                method: 'GET',
                url: 'https://service2.funifier.com/v3/player/' + userCpf + '/status',
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            };
            
            $http(req).then(
                function(response) {
                    var data = response.data;
                    var challenges = [];
                    
                    // Check if challenge_progress exists in the response
                    if (data.challenge_progress && Array.isArray(data.challenge_progress)) {
                        challenges = data.challenge_progress;
                    }
                    
                    // If no challenges found, check if there are any active challenges
                    if (challenges.length === 0 && data.active_challenges && Array.isArray(data.active_challenges)) {
                        challenges = data.active_challenges.map(function(challenge) {
                            return {
                                challenge: challenge.challenge,
                                description: challenge.description,
                                points: challenge.points,
                                progress: 0,
                                target: null
                            };
                        });
                    }
                    
                    // Map the API challenge data to our challenge structure
                    var mappedChallenges = challenges.map(function(challenge) {
                        // Extract XP and Moedas points from the challenge
                        var xpPoints = 0;
                        var moedaPoints = 0;
                        var operation = '';
                        
                        if (challenge.points && Array.isArray(challenge.points)) {
                            challenge.points.forEach(function(point) {
                                if (point.category === 'xp') {
                                    xpPoints = point.total;
                                } else if (point.category === 'moedas') {
                                    moedaPoints = point.total;
                                    if (point.operation === 1 && point.value) {
                                        operation = 'valor';
                                    }
                                }
                            });
                        }
                        
                        return {
                            id: challenge._id || 'challenge-' + Math.random().toString(36).substring(2, 9),
                            title: challenge.challenge || 'Desafio',
                            description: challenge.description || 'Participe e ganhe pontos',
                            progress: challenge.progress || 0,
                            target: challenge.target || null,
                            icon: 'fa-trophy',
                            xpPoints: xpPoints,
                            moedaPoints: moedaPoints,
                            operation: operation
                        };
                    });
                    
                    // If no challenges were found, provide a default one
                    if (mappedChallenges.length === 0) {
                        mappedChallenges = [
                            {
                                id: 'default-challenge',
                                title: 'Compre e ganhe',
                                description: 'A cada 1 real gasto, ganhe 1 moeda. E a cada compra concluída ganhe 1 XP.',
                                progress: 0,
                                target: null,
                                icon: 'fa-shopping-cart',
                                xpPoints: 1,
                                moedaPoints: 1,
                                operation: 'valor'
                            }
                        ];
                    }
                    
                    console.log('Mapped challenges:', mappedChallenges);
                    deferred.resolve(mappedChallenges);
                },
                function(error) {
                    console.error('Error fetching challenges:', error);
                    
                    // Fallback to default challenge if API call fails
                    var defaultChallenges = [
                        {
                            id: 'default-challenge',
                            title: 'Compre e ganhe',
                            description: 'A cada 1 real gasto, ganhe 1 moeda. E a cada compra concluída ganhe 1 XP.',
                            progress: 0,
                            target: null,
                            icon: 'fa-shopping-cart',
                            xpPoints: 1,
                            moedaPoints: 1,
                            operation: 'valor'
                        }
                    ];
                    
                    deferred.resolve(defaultChallenges);
                }
            );
            
            return deferred.promise;
        }
        
        function getRewards() {
            var deferred = $q.defer();
            
            // Get the token from localStorage
            var token = localStorage.getItem('access_token');
            
            if (!token) {
                deferred.reject('Authentication information missing');
                return deferred.promise;
            }
            
            var req = {
                method: 'GET',
                url: 'https://service2.funifier.com/v3/virtualgoods/item',
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            };
            
            $http(req).then(
                function(response) {
                    var data = response.data;
                    console.log('Rewards API response:', data);
                    
                    // Map the API response to our rewards structure
                    var mappedRewards = [];
                    
                    if (Array.isArray(data)) {
                        mappedRewards = data.map(function(reward) {
                            // Get the cost from the requires array
                            var cost = 0;
                            if (reward.requires && Array.isArray(reward.requires)) {
                                reward.requires.forEach(function(requirement) {
                                    if (requirement.item === 'moedas') {
                                        cost = requirement.total;
                                    }
                                });
                            }
                            
                            return {
                                id: reward._id,
                                title: reward.name,
                                description: reward.description,
                                cost: cost,
                                image: reward.image && reward.image.medium ? reward.image.medium.url : 'img/rewards/default-reward.jpg'
                            };
                        });
                    }
                    
                    // If no rewards were found, provide default ones
                    if (mappedRewards.length === 0) {
                        mappedRewards = [
                            {
                                id: 'default-reward-1',
                                title: 'Café Espresso',
                                description: 'Um delicioso café espresso',
                                cost: 50,
                                image: 'img/rewards/espresso.jpg'
                            },
                            {
                                id: 'default-reward-2',
                                title: 'Cappuccino',
                                description: 'Cappuccino cremoso',
                                cost: 80,
                                image: 'img/rewards/cappuccino.jpg'
                            }
                        ];
                    }
                    
                    console.log('Mapped rewards:', mappedRewards);
                    deferred.resolve(mappedRewards);
                },
                function(error) {
                    console.error('Error fetching rewards:', error);
                    
                    // Fallback to default rewards if API call fails
                    var defaultRewards = [
                        {
                            id: 'default-reward-1',
                            title: 'Café Espresso',
                            description: 'Um delicioso café espresso',
                            cost: 50,
                            image: 'img/rewards/espresso.jpg'
                        },
                        {
                            id: 'default-reward-2',
                            title: 'Cappuccino',
                            description: 'Cappuccino cremoso',
                            cost: 80,
                            image: 'img/rewards/cappuccino.jpg'
                        }
                    ];
                    
                    deferred.resolve(defaultRewards);
                }
            );
            
            return deferred.promise;
        }
        
        function getRedeemedRewards() {
            var deferred = $q.defer();
            
            // For MVP, we'll use mock data
            // In a real scenario, we would make an API call to Funifier
            var mockRedeemedRewards = [
                {
                    id: 1,
                    title: 'Café Espresso',
                    description: 'Um delicioso café espresso',
                    redeemedDate: new Date('2025-04-10'),
                    qrCode: 'CAFE-ESP-123456',
                    image: 'img/rewards/espresso.jpg'
                }
            ];
            
            deferred.resolve(mockRedeemedRewards);
            
            return deferred.promise;
        }
        
        function redeemReward(reward) {
            var deferred = $q.defer();
            
            // Get the token and user CPF from localStorage
            var token = localStorage.getItem('access_token');
            var userCpf = localStorage.getItem('user_cpf');
            
            if (!token || !userCpf) {
                deferred.reject('Authentication information missing');
                return deferred.promise;
            }
            
            // First check if user has enough coins
            getUserProfile().then(
                function(profile) {
                    if (profile.coins < reward.cost) {
                        deferred.reject({
                            error: 'insufficient_coins',
                            message: 'Você não tem moedas suficientes para resgatar este prêmio.'
                        });
                        return;
                    }
                    
                    // If we have enough coins, make the API call to redeem the reward
                    var req = {
                        method: 'POST',
                        url: 'https://service2.funifier.com/v3/virtualgoods/redeem',
                        headers: {
                            "Authorization": "Bearer " + token,
                            "Content-Type": "application/json"
                        },
                        data: {
                            player_id: userCpf,
                            item_id: reward.id
                        }
                    };
                    
                    $http(req).then(
                        function(response) {
                            console.log('Reward redemption response:', response.data);
                            
                            // Create a redemption object with the response data
                            var redeemedReward = {
                                id: reward.id,
                                title: reward.title,
                                description: reward.description,
                                redeemedDate: new Date(),
                                qrCode: 'CAFE-' + Math.floor(100000 + Math.random() * 900000),
                                image: reward.image
                            };
                            
                            // Add the redeemed reward to localStorage history
                            var redeemedHistory = localStorage.getItem('redeemed_rewards');
                            var redeemedRewards = redeemedHistory ? JSON.parse(redeemedHistory) : [];
                            redeemedRewards.push(redeemedReward);
                            localStorage.setItem('redeemed_rewards', JSON.stringify(redeemedRewards));
                            
                            deferred.resolve(redeemedReward);
                        },
                        function(error) {
                            console.error('Error redeeming reward:', error);
                            deferred.reject({
                                error: 'api_error',
                                message: 'Ocorreu um erro ao resgatar o prêmio. Tente novamente mais tarde.'
                            });
                        }
                    );
                },
                function(error) {
                    console.error('Error getting user profile:', error);
                    deferred.reject({
                        error: 'profile_error',
                        message: 'Não foi possível verificar seu saldo. Tente novamente mais tarde.'
                    });
                }
            );
            
            return deferred.promise;
        }
    }
})();
