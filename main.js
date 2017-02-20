var config = {
    apiKey: "AIzaSyAXFI5WUUZPdvRg0PCBNX-Iriibqha5afU",
    authDomain: "vtic-394e0.firebaseapp.com",
    databaseURL: "https://vtic-394e0.firebaseio.com",
    storageBucket: "vtic-394e0.appspot.com",
    messagingSenderId: "141922412591"
};
firebase.initializeApp(config);

var db = firebase.database();
Vue.use(VueMaterial)

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


var App = new Vue({
    el: '#app',
    beforeCreate: function () {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {

                if (!((user.email.indexOf('@a.vedrunacarabanchel.es') > -1) || (user.email.indexOf('@vedruna.es') > -1))) {
                    this.snackBar.message = 'No es una cuenta de vedruna.es o a.vedrunacarabanchel.es';
                    this.openSnackBar();
                    firebase.auth().signOut();
                    return;
                };

                this.ifLogin = true;

                this.$bindAsArray('levels', db.ref('level/'));

                this.user = {
                    'name': user.displayName,
                    'email': user.email,
                    'avatar': user.photoURL,
                    'uid': user.uid
                };
                this.snackBar.message = 'Logged in as ' + this.user.email;
                this.openSnackBar();
                this.question.author = this.user;

                console.log(user);
            } else {

                this.ifLogin = false;
                this.fullscreenLoading = false;

            }
        }.bind(this));

    },
    data: {
        ifLogin: false,
        loading: false,
        fullscreenLoading: true,

        title: 'Enviar preguntas',
        titles: ['Enviar preguntas', 'Ver preguntas'],

        user: {},
        messages: [],
        levels: [],
        topics: [],

        currentLevel: null,

        currentTopic: null,
        currentTopicName: null,

        confirm: {
            title: 'Cerrar la sesión?',
            contentHtml: 'Ya quieres ir?',
            ok: 'Yep',
            cancel: 'Nope'
        },

        snackBar: {
            vertical: 'bottom',
            horizontal: 'center',
            duration: 4000,
            message: 'Nope'
        },


        question: {
            title: null,
            date: null,
            author: this.user,
            correctAnswer: 'a',
            answers: {
                a: null,
                b: null,
                c: null,
                d: null
            }
        },

        questionList: []

    },
    watch: {
        levels: function () {
            if (this.levels.length !== 0) {
                this.currentLevel = 0;
                this.currentTopic = this.levels[0].topics[0].slug;
                this.fullscreenLoading = false;
                document.title = this.titles[0];
            }

        },
        currentLevel: function (val) {
            this.loading = true;
            this.topics = this.levels[this.currentLevel].topics
            this.loading = false;
        },
        currentTopic: function () {
            this.currentTopicName = this;
            this.unbindDB();
            this.bindDatabase();
        },
        title: function () {
            document.title = this.title
        }
    },
    methods: {
        addQuestion: function () {

            if ((this.currentLevel == null) || (this.currentTopic == null)) {
                this.snackBar.message = 'Please pick a topic.';
                this.openSnackBar();
                return;
            };

            if (this.question.title == null) {
                this.snackBar.message = 'Please add a title.';
                this.openSnackBar();
                return;
            };

            var t = this;
            var j = ['a', 'b', 'c', 'd'];

            for (var i = 0, len = j.length; i < len; i++) {
                console.log(t.question.answers[j[i]], i);
                if (t.question.answers[j[i]] == "" || t.question.answers[j[i]] == null) {
                    t.snackBar.message = 'Please fill all inputs.';
                    t.openSnackBar();
                    return;
                };
            }

            this.loading = true;

            var ref = firebase.database().ref('data/' + this.levels[this.currentLevel].slug + '/' + this.currentTopic + '/');

            this.question.date = Date.now();
            ref.push(this.question).then(successCallback);;

            function successCallback() {
                t.question = {
                    title: null,
                    date: null,
                    author: t.user,
                    correctAnswer: 'a',
                    answers: {}
                };
                t.loading = false;
            };

        },
        removeMessage: function (message) {
            this.$firebaseRefs.messages.child(message['.key']).remove()
        },
        bindDatabase: function () {
            var t = this;
            var ref = firebase.database().ref('data/' + this.levels[this.currentLevel].slug + '/' + this.currentTopic + '/');
            ref.on("child_added", function (snapshot, prevChildKey) {
                t.questionList.unshift(snapshot.val())
            });

            ref.orderByChild('date').startAt(Date.now()).on('child_added', function (snapshot) {
                t.snackBar.message = snapshot.val().author.name + ' acaba de publicar una pregunta nueva en el tema de ' + t.topics[t.currentLevel].name
                t.openSnackBar();
                t.loading = false;
            });
        },
        unbindDB: function () {
            firebase.database().ref('data/' + this.levels[this.currentLevel].slug + '/' + this.currentTopic + '/').off();
            this.questionList = [];
        },

        changeRoute(tab) {
            this.title = this.titles[tab];
        },
        switchTab: function (tab) {
            document.getElementsByClassName('md-tab-header')[tab].click()
        },
        login: function () {

            var t = this;
            t.loading = true;

            var provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/plus.login');
            provider.setCustomParameters({
                'login_hint': 'name@a.vedrunacarabanchel.es'
            });


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
            this.snackBar.message = 'You are not longer logged in.';
            this.openSnackBar();
        },

        openDialog: function (ref) {
            this.$refs[ref].open();
        },
        closeDialog(ref) {
            this.$refs[ref].close();
        },
        openSnackBar: function (msg) {
            this.$refs.snackbar.open();
        },

        topicList: function (level) {
            this.$bindAsArray('topics', db.ref('level/' + currentLevel.slug));
            this.loading = false;
        }
    }

})
Vue.filter('toDate', function (value) {
    var d = new Date(value),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        s = d.getSeconds(),
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh == 0) {
        h = 12;
    }

    time = yyyy + '/' + mm + '/' + dd + ', ' + hh + ':' + min + ':' + s;

    return time;
});