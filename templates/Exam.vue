<template>
    <div>
        <div v-if="!$root.examStatus.inProgress && !questionListShuffled.length">
            <transition name="slide-fade">
                <div v-if="!oficialExam">
                    <md-card class="md-accent" v-if="!$root.questionList.length && $root.currentTopic !== null">
                        <md-card-header>
                            <div class="md-title">No hay preguntas bajo el tema de {{ $root.currentTopicName }}</div>
                        </md-card-header>
                        <md-card-content>
                            Elige otro tema con preguntas para poder comenzar el examen.
                        </md-card-content>
                        <md-card-actions>
                            <md-button @click.native="$root.openDialog('settings')">Cambiar el tema</md-button>
                        </md-card-actions>
                    </md-card>

                    <md-card v-else>
                        <md-card-header>
                            <div class="md-title">Examinar</div>
                            <div class="md-subhead">{{ $root.currentTopicName }} - {{ $root.currentLevelName }}</div>
                        </md-card-header>

                        <md-card-actions>
                            <md-button @click.native="$root.openDialog('settings')">Cambiar el tema</md-button>
                            <md-button @click.native="shuffleQuestion()">Comenzar</md-button>
                        </md-card-actions>
                    </md-card>
                </div>
            </transition>

            <md-switch v-model="oficialExam">Examen oficial</md-switch>

            <md-layout md-gutter md-theme="default" v-if="oficialExam">
                <md-input-container>
                    <label>Código de acceso</label>
                    <md-input type="number" v-model="roomCode" v-on:input.native="joinRoom"></md-input>
                </md-input-container>
            </md-layout>
        </div>

        <div v-if="$root.examStatus.inProgress">
            <md-card style="margin-bottom: 1em;" v-for="(item, i) in questionListShuffled" :key="item['.key']">
                <md-card-header>
                    <h2 class="md-title">{{ item.title }}</h2>
                    <div class="md-subhead">
                        <span>{{ i + 1 }} de {{questionListShuffled.length}}</span>
                    </div>
                </md-card-header>
                <md-card-content>

                    <md-list>

                        <md-list-item>
                            <md-layout md-column md-theme="default">
                                <md-layout v-for="(value, letter, index) in item.answers" :key="index">
                                    <md-radio v-bind:md-value="letter" v-model="item.choosen">{{ letter.toUpperCase() }}. {{value}}</md-radio>
                                </md-layout>
                            </md-layout>
                        </md-list-item>

                    </md-list>
                </md-card-content>
            </md-card>
            <md-button @click.native="checkAnswers()" class="md-raised md-primary fullWidth">Comprobar</md-button>
        </div>
        <div v-if="$root.examStatus.result">
            <md-card v-bind:class="examCardClass">
                <md-card-header>
                    <div class="md-title">Nota: {{exam.grade.toPrecision(2)}}</div>
                    <div class="md-subhead" v-if="exam.wrong.length">Has tenido mal las siguientes preguntas:</div>
                    <div class="md-subhead" v-else>Enhorabuena!</div>
                </md-card-header>
            </md-card>
            <md-card v-for="(value,index) in exam.wrong" :key="index">
                <div v-for="item in getQuestionByKey(value.id,questionListShuffled)">
                    <md-card-header>
                        <div class="md-title">{{ item.title }}</div>
                    </md-card-header>

                    <md-card-content>
                        <p>Elegiste la opcion <strong>{{ item.choosen.toUpperCase() }}. {{item.answers[item.choosen]}}</strong></p>
                        <p>La correcta era <strong>{{ item.correctAnswer.toUpperCase() }}. {{item.answers[item.correctAnswer]}}</strong></p>
                    </md-card-content>
                </div>
            </md-card>
        </div>
        <md-button @click.native="exitTest()" class="md-raised md-primary fullWidth" v-if="$root.examStatus.result">Terminar</md-button>
    </div>
</template>

<script>
    module.exports = {
        data() {
            return {
                oficialExam: false,
                exam: {
                    grade: 0,
                    correct: [],
                    wrong: []
                },
                roomCode: null,
                questionListShuffled: [],
            }

        },
        computed: {
            examCardClass: function () {
                return {
                    'md-primary': this.exam.grade >= 8,
                    'md-accent': this.exam.grade > 5 && this.exam.grade < 8,
                    'md-warn': this.exam.grade < 5
                }
            }
        },
        methods: {
            joinRoom: function () {
                var ref = db.ref('/room/'),
                    t = this,
                    code = this.roomCode;
                ref.child(code).once('value', function (snapshot) {
                    var exists = (snapshot.val() !== null);
                    console.log(snapshot.val())
                    ExistCallback(code, exists);
                });

                function ExistCallback(code, exists) {
                    if (exists) {
                        t.snackBar.message = 'Entrando...';
                        t.openSnackBar();

                    } else {
                        t.snackBar.message = 'El código no es válido';
                        t.openSnackBar();
                    }
                }
            },
            exitTest: function () {
                this.$root.examStatus = {
                    inProgress: false,
                    result: false
                }
                this.questionListShuffled = [];
            },
            checkAnswers: function () {
                var t = this;
                this.exam = {
                    grade: 0,
                    correct: [],
                    wrong: []
                };
                this.$root.examStatus = {
                    inProgress: false,
                    result: true
                }
                t.questionListShuffled.forEach(function (entry) {
                    if (entry.choosen == entry.correctAnswer) {
                        t.exam.correct.push({
                            'id': entry['.key'],
                            'title': entry.title,
                            'choosen': entry.choosen
                        });
                    } else {
                        t.exam.wrong.push({
                            'id': entry['.key'],
                            'choosen': entry.choosen,
                            'correctAnswer': entry.correctAnswer,
                            'answers': entry.answers
                        });
                    }
                });

                t.exam.grade = (t.exam.correct.length / t.questionListShuffled.length) * 10;

                window.scrollTo(0, 0);

                var data = this.exam;

                data['date'] = Date.now();
                data['topic'] = this.$root.currentTopicName;
                data['level'] = this.$root.currentLevelName;
                this.$root.$firebaseRefs.user.child('exams').push(data);
            },
            shuffleQuestion: function () {
                var questionListShuffled = this.$root.questionList;
                this.exam = {
                    grade: 0,
                    correct: [],
                    wrong: []
                };

                this.$root.examStatus = {
                    inProgress: true,
                    result: false
                }
                questionListShuffled.sort(function () {
                    return 0.5 - Math.random()
                });

                this.questionListShuffled = questionListShuffled.map(function (el) {
                    var o = Object.assign({}, el);
                    o.choosen = 'a';
                    return o;
                }).slice(0, 10);

                console.log(this.questionListShuffled)
            },
            getQuestionByKey: function (k, array) {
                return array.filter(function (obj) {
                    return obj['.key'] == k;
                });
            },
        }
    }
</script>