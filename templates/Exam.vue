<template>
    <div>
        <div v-if="!$root.examStatus.inProgress && !questionListShuffled.length">
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

            <div v-else>
                <md-card>
                    <md-card-header>
                        <div class="md-title">Examinar</div>
                        <div class="md-subhead">{{ $root.currentTopicName }} - {{ $root.currentLevelName }}</div>
                    </md-card-header>

                    <md-card-content>
                        <md-layout :md-gutter="8">
                            <md-layout>
                                <md-input-container :class="{ 'md-input-invalid': errors.has('numberOfQuestions') }">
                                    <label>Número de preguntas</label>
                                    <md-input type="number" data-vv-as="number of questions" v-model="numberOfQuestions" data-vv-name="numberOfQuestions" v-validate="rule"></md-input>
                                    <span class="md-error">{{errors.first('numberOfQuestions')}}</span>
                                </md-input-container>
                            </md-layout>
                            <md-layout>
                                <md-input-container :class="{ 'md-input-invalid': errors.has('examTime') }">
                                    <label>Tiempo</label>
                                    <md-input type="number" data-vv-as="exam time" v-model="examTimeInput" data-vv-name="examTime" v-validate="'required|numeric|min_value:1|max_value:20'"></md-input>
                                    <span class="md-error">{{errors.first('examTime')}}</span>
                                </md-input-container>
                            </md-layout>
                        </md-layout>
                    </md-card-content>

                    <md-card-actions>
                        <md-button @click.native="$root.openDialog('settings')">Cambiar el tema</md-button>
                        <md-button @click.native="shuffleQuestion()">Comenzar</md-button>
                    </md-card-actions>
                </md-card>
                <md-checkbox v-model="officialExam" class="md-primary">Examen Oficial</md-checkbox>

                <md-dialog ref="officialExamAlert">
                    <md-dialog-title>Confirmación</md-dialog-title>

                    <md-dialog-content>
                        <p>El modo del examen oficial es más estricto, y quedará guardado el resultado del examen en el perfil
                            del usuario.
                        </p>
                        El tiempo del examen es 20 minutos, cuando llega el tiempo, se entregará el examen automáticamente.
                        <p>
                            <strong>Por favor, no cierres la ventana actual del navegador hasta que el examen se haya finalizado.</strong>
                        </p>
                        <md-checkbox v-model="officialExamConfirm">Leído</md-checkbox>
                    </md-dialog-content>


                    <md-dialog-actions>
                        <md-button class="md-primary" @click.native="closeDialog('officialExamAlert'); oficialExam = false">Salir</md-button>
                        <md-button class="md-primary md-raised" @click.native="closeDialog('officialExamAlert');shuffleQuestion();" :disabled="!officialExamConfirm">Comenzar el examen</md-button>
                    </md-dialog-actions>
                </md-dialog>

            </div>
        </div>

        <div v-if="$root.examStatus.inProgress">
            <md-toolbar id="examStatusBar">
                <div class="container">
                    <h2 class="md-title" style="flex: 1">
                        <countdown v-on:countdownprogress="onCountdownProgress" v-on:countdownend="onCountdownEnd" :time="examTime" ref="examCountdown">
                            <template scope="props">Quedan {{ props.minutes }} minutos, {{ props.seconds }} segundos.</template>
                        </countdown>
                    </h2>
                </div>
                <md-progress class="md-accent" :md-progress="examCountdownProgress" id="examCountdownProgress"></md-progress>
            </md-toolbar>

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
            <md-button @click.native="exitTest()" class="md-raised md-primary fullWidth">Terminar</md-button>
        </div>

</template>

<script>
    module.exports = {
        data() {
            return {
                officialExam: false,
                officialExamConfirm: false,

                exam: {
                    grade: 0,
                    correct: [],
                    wrong: [],
                    date: {
                        start: null,
                        end: null
                    }
                },

                questionListShuffled: [],

                rule: {
                    required: true,
                    numeric: true,
                    min_value: 1,
                    max_value: 0
                },

                numberOfQuestions: 10,

                examCountdownProgress: 0,

                examTimeInput: 20
            }

        },
        created() {
            this.rule.max_value = this.questionListLength;
        },
        watch: {
            questionListLength: function () {
                this.rule.max_value = this.questionListLength
                if (this.questionListLength > 10) {
                    this.numberOfQuestions = 10
                } else {
                    this.numberOfQuestions = this.questionListLength
                }
            },
            officialExam: function () {
                if (this.officialExam) {
                    this.openDialog('officialExamAlert')
                }
            }
        },
        computed: {
            questionListLength: function () {
                return this.$root.questionList.length;
            },
            examCardClass: function () {
                return {
                    'md-primary': this.exam.grade >= 8,
                    'md-accent': this.exam.grade > 5 && this.exam.grade < 8,
                    'md-warn': this.exam.grade < 5
                }
            },
            examTime() {
                return this.examTimeInput * 60 * 1000
            }
        },
        methods: {
            onCountdownProgress(data) {
                var total = this.examTime / 1000,
                    current = data.minutes * 60 + data.seconds;

                this.examCountdownProgress = current / total * 100;

                if (data.minutes == 1 && !data.seconds) {
                    this.$root.snackBar.message = 'Queda un minuto de examen.';
                    this.$root.openSnackBar();
                }
            },
            onCountdownEnd() {
                this.checkAnswers();
            },
            exitTest: function () {
                this.$root.examStatus = {
                    inProgress: false,
                    result: false
                }
                this.questionListShuffled = [];
                this.exam = {
                    grade: 0,
                    correct: [],
                    wrong: [],
                    date: {
                        start: null,
                        end: null
                    }
                };
            },
            checkAnswers: function () {
                var t = this;

                t.$root.examStatus = {
                    inProgress: false,
                    result: true
                };

                t.exam.date.end = Date.now();
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

                if (t.officialExam) {
                    var data = t.exam;

                    data['topic'] = t.$root.currentTopicName;
                    data['level'] = t.$root.currentLevelName;
                    t.$root.$firebaseRefs.user.child('exams').push(data);
                    t.$root.$firebaseRefs.user.child('onExam').set(false);

                };
            },
            shuffleQuestion: function () {
                var t = this;
                t.$validator.validateAll().then(() => {
                    var questionListShuffled = this.$root.questionList;

                    if (t.officialExam) {
                        t.$root.$firebaseRefs.user.child('onExam').set(true);
                        t.examTimeInput = 20;
                        t.numberOfQuestions = 10;
                    };

                    t.$root.examStatus = {
                        inProgress: true,
                        result: false
                    };
                    questionListShuffled.sort(function () {
                        return 0.5 - Math.random()
                    });

                    t.questionListShuffled = questionListShuffled.map(function (el) {
                        var o = Object.assign({}, el);
                        o.choosen = 'a';
                        return o;
                    }).slice(0, t.numberOfQuestions);

                    t.exam.date.start = Date.now();

                }).catch(() => {
                    t.$root.snackBar.message = 'Corrige los errores por favor.';
                    t.$root.openSnackBar();
                });
            },
            getQuestionByKey: function (k, array) {
                return array.filter(function (obj) {
                    return obj['.key'] == k;
                });
            },

            openDialog: function (ref) {
                this.$refs[ref].open();
            },
            closeDialog(ref) {
                this.$refs[ref].close();
            }
        }
    }
</script>

<style>
    #examCountdownProgress {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
    }
    
    #examStatusBar {
        position: fixed;
        top: 0;
        width: 100%;
        z-index: 2;
        left: 0;
    }
</style>