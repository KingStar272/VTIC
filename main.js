var config = {
    apiKey: "AIzaSyAXFI5WUUZPdvRg0PCBNX-Iriibqha5afU",
    authDomain: "vtic-394e0.firebaseapp.com",
    databaseURL: "https://vtic-394e0.firebaseio.com"
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
                this.snackBar.message = 'Iniciado la sesión como ' + this.user.email;
                this.openSnackBar();
                this.question.author = this.user;

                console.log(user);

                this.initialDate = Date.now();
            } else {

                this.ifLogin = false;
                this.fullscreenLoading = false;

            }
        }.bind(this));

    },
    data: {
        initialDate: null,
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
            vertical: 'top',
            horizontal: 'right',
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
            this.$bindAsArray('questionList', db.ref('data/' + this.levels[this.currentLevel].slug + '/' + this.currentTopic + '/').orderByChild("date"))
        },
        title: function () {
            document.title = this.title
        },
        questionList: function(){
            var latest = this.questionList[this.questionList.length - 1],
                t = this;
            if(latest == null) return;
            if(latest.date > this.initialDate){
                t.snackBar.message = latest.author.name + ' acaba de publicar una pregunta nueva en el tema de ' + t.topics[t.currentLevel].name;
                t.openSnackBar();
            };
        }
    },
    methods: {
        reverse: function(array){
            return array.slice().reverse();
        },
        addQuestion: function () {

            if ((this.currentLevel == null) || (this.currentTopic == null)) {
                this.snackBar.message = 'Por favor escoja un tema.';
                this.openSnackBar();
                return;
            };

            if (this.question.title == null) {
                this.snackBar.message = 'Por favor añade un título.';
                this.openSnackBar();
                return;
            };

            var t = this;
            var j = ['a', 'b', 'c', 'd'];

            for (var i = 0, len = j.length; i < len; i++) {
                if (t.question.answers[j[i]] == "" || t.question.answers[j[i]] == null) {
                    t.snackBar.message = 'Por favor rellena todos los campos.';
                    t.openSnackBar();
                    return;
                };
            }

            this.loading = true;
            this.question.date = Date.now();
            this.$firebaseRefs.questionList.push(this.question).then(successCallback);

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
        removeQuestion: function (question) {
            this.$firebaseRefs.questionList.child(question['.key']).remove();
            this.snackBar.message = 'La pregunta ha sido eliminada.';
            this.openSnackBar();
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
            this.snackBar.message = 'Cerrado la sesión.';
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

