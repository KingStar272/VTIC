var config = {
    apiKey: "AIzaSyAXFI5WUUZPdvRg0PCBNX-Iriibqha5afU",
    authDomain: "vtic-394e0.firebaseapp.com",
    databaseURL: "https://vtic-394e0.firebaseio.com"
};
firebase.initializeApp(config);

var db = firebase.database();
Vue.use(VueMaterial);
Vue.use(VeeValidate);

Vue.use(VueTimeago, {
    name: 'timeago',
    locale: 'es-ES',
    locales: {
        'es-ES': [
            "ahora", ["hace %s segundo", "hace %s segundos"],
            ["hace %s minuto", "hace %s minutos"],
            ["hace %s hora", "hace %s horas"],
            ["hace %s día", "hace %s días"],
            ["hace %s semana", "hace %s semanas"],
            ["hace %s mes", "hace %s meses"],
            ["hace %s año", "hace %s años"]
        ]
    }
})

Vue.material.registerTheme('default', {
    primary: 'teal',
    accent: 'amber',
    warn: 'red'
});
Vue.material.registerTheme('background', {
    primary: 'teal',
    accent: 'amber',
    warn: 'red',
    background: {
        color: 'grey',
        hue: 100
    }
});

const router = new VueRouter({
    routes: [{
            path: '/',
            name: 'Inicio',
            component: httpVueLoader('templates/Dashboard.vue'),
        }, {
            path: '/submit',
            component: httpVueLoader('templates/Submit.vue'),
            name: 'Enviar'
        },
        {
            path: '/exam',
            component: httpVueLoader('templates/Exam.vue'),
            name: 'Examinar'
        },
        {
            path: '/profile',
            component: httpVueLoader('templates/Profile.vue'),
            name: 'Perfil'
        },
        {
            path: '/settings',
            component: httpVueLoader('templates/Setting.vue'),
            name: 'Configuración'
        }
    ]
});



var App = new Vue({
    el: '#app',
    router,
    beforeCreate: function () {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {

                if (!((user.email.indexOf('@a.vedrunacarabanchel.es') > -1) || (user.email.indexOf('@vedruna.es') > -1))) {
                    this.snackBar.message = 'No es una cuenta de vedruna.es o a.vedrunacarabanchel.es';
                    this.openSnackBar();
                    firebase.auth().signOut();
                    return;
                };

                this.loggedIn = true;

                this.$bindAsArray('levels', db.ref('level/'));

                this.$bindAsObject('user', db.ref('users/' + user.uid));

                this.$bindAsObject('userList', db.ref('users/'));

                if (!this.user.hasOwnProperty()) {
                    var data = {
                        'name': user.displayName,
                        'email': user.email,
                        'avatar': user.photoURL,
                        'uid': user.uid
                    };
                    for (var key in data) {
                        this.$firebaseRefs.user.child(key).set(data[key]);
                    };
                }

                this.snackBar.message = 'Iniciada la sesión como ' + user.email;
                this.openSnackBar();

                console.log(user);

                this.initialDate = Date.now();
            } else {

                this.loggedIn = false;
                this.fullscreenLoading = false;

            }
        }.bind(this));

    },
    data: {
        initialDate: null,
        loggedIn: false,
        loading: false,
        fullscreenLoading: true,

        user: {},
        messages: [],

        level: {},
        levels: [],
        topics: [],

        settings: {
            currentLevel: null,
            currentTopic: null,
            delete: false
        },

        currentTopicName: null,
        currentLevelName: null,

        logOutconfirm: {
            title: 'Cerrar la sesión?',
            contentHtml: 'Ya quieres ir?',
            ok: 'Yep',
            cancel: 'Nope'
        },

        confirm: {},

        snackBar: {
            vertical: 'bottom',
            horizontal: 'right',
            duration: 4000,
            message: 'Nope'
        },

        questionList: [],
        questionAuthor: {},

        examStatus: {
            inProgress: false,
            result: false
        }

    },

    watch: {
        levels: function () {
            if (this.levels.length !== 0) {
                if (localStorage.settings) {
                    this.settings = JSON.parse(localStorage.getItem('settings'));
                } else {
                    this.settings.currentLevel = 0;
                    this.currentTopic = this.levels[0].topics[0].slug;
                    this.openDialog('settings');
                };

                this.fullscreenLoading = false;
            }

        },
        'settings': {
            handler: function (val, oldVal) {
                localStorage.setItem('settings', JSON.stringify(this.settings));
            },
            deep: true
        },
        'settings.currentLevel': function () {
            this.loading = true;
            this.$bindAsObject('level', db.ref('level/' + this.settings.currentLevel));
            this.topics = this.level.topics;
            this.loading = false;
            this.currentLevelName = this.level.name;
            if (!this.getTopicName(this.settings.currentTopic)) {
                this.settings.currentTopic = this.topics[0].slug;
            }
        },
        'settings.currentTopic': function () {
            this.currentTopicName = this.getTopicName(this.settings.currentTopic);
            this.$bindAsArray('questionList', db.ref('data/' + this.level.slug + '/' + this.settings.currentTopic + '/').orderByChild("date"));
        },

        questionList: function () {
            var latest = this.questionList[this.questionList.length - 1],
                t = this;
            if (latest == null) return;
            if (latest.date > this.initialDate) {
                t.snackBar.message = t.getUserInfo(latest.author).name + ' acaba de publicar una pregunta nueva en el tema de ' + t.currentTopicName;
                t.openSnackBar();
            };
        }
    },

    methods: {
        getUserInfo: function (uid) {
            return this.$root.userList[uid]
        },
        getTopicName: function (topic) {
            var t = this;
            var topic = this.topics.filter(function (obj) {
                return obj.slug == topic;
            })[0];

            if (topic) {
                return topic.name;
            } else {
                return false;
            }
        },

        login: function () {

            var t = this;
            t.loading = true;

            var provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/plus.login');

            firebase.auth().signInWithPopup(provider).then(function (result) {
                t.loading = false;
                console.log(result);

            }).catch(function (error) {
                t.loading = false;
                var errorCode = error.code;
                var errorMessage = error.message;
                var email = error.email;
                var credential = error.credential;
                if (errorCode === 'auth/account-exists-with-different-credential') {
                    alert('You have already signed up with a different auth provider for that email.');
                } else {
                    console.error(error);
                };


            });
        },

        logOut: function () {
            firebase.auth().signOut();
            this.snackBar.message = 'Cerrada la sesión.';
            this.openSnackBar();
        },

        openDialog: function (ref) {
            this.$refs[ref].open();
        },
        closeDialog(ref) {
            this.$refs[ref].close();
        },
        onConfirm: function () {
            this.logOut();
        },
        openSnackBar: function (msg) {
            this.$refs.snackbar.open();
        }
    }

}).$mount('#app')

router.beforeEach((to, from, next) => {
    if (App.examStatus.inProgress || App.examStatus.result) {
        App.snackBar.message = 'Por favor termina primero el examen.';
        App.openSnackBar();
        return;
    }
    App.closeDialog('sidenav');
    App.loading = true;
    next();
})

router.afterEach(route => {
    App.loading = false;
    document.title = route.name;
})