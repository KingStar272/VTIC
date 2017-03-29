<template>

    <form v-on:submit.prevent>
        <md-card>
            <md-card-header>
                <md-avatar>
                    <img :src="$root.user.avatar" alt="People">
                </md-avatar>

                <div class="md-title">{{ $root.user.name }}</div>
                <div class="md-subhead">{{ $root.currentLevelName }} / {{ $root.currentTopicName }}</div>
            </md-card-header>

            <md-card-content>
                <md-input-container :class="{ 'md-input-invalid': errors.has('title') }">
                    <label>Pregunta</label>
                    <md-input v-model="question.title" data-vv-name="title" v-validate data-vv-rules="required"></md-input>
                    <span class="md-error">{{errors.first('title')}}</span>
                </md-input-container>
                <md-layout md-row>
                    <md-layout>
                        <md-input-container :class="{ 'md-input-invalid': errors.has('answerA') }">
                            <label>Repuesta A</label>
                            <md-input v-model="question.answers.a" data-vv-name="answerA" v-validate data-vv-rules="required"></md-input>
                            <span class="md-error">{{errors.first('answerA')}}</span>
                        </md-input-container>
                    </md-layout>
                    <md-radio v-model="question.correctAnswer" md-value="a"></md-radio>
                </md-layout>
                <md-layout md-row>
                    <md-layout>
                        <md-input-container :class="{ 'md-input-invalid': errors.has('answerB') }">
                            <label>Respuesta B</label>
                            <md-input v-model="question.answers.b" data-vv-name="answerB" v-validate data-vv-rules="required"></md-input>
                            <span class="md-error">{{errors.first('answerB')}}</span>
                        </md-input-container>
                    </md-layout>
                    <md-radio v-model="question.correctAnswer" md-value="b"></md-radio>

                </md-layout>

                <md-layout md-row>
                    <md-layout>
                        <md-input-container :class="{ 'md-input-invalid': errors.has('answerC') }">
                            <label>Respuesta C</label>
                            <md-input v-model="question.answers.c" data-vv-name="answerC" v-validate data-vv-rules="required"></md-input>
                            <span class="md-error">{{errors.first('answerC')}}</span>
                        </md-input-container>
                    </md-layout>
                    <md-radio v-model="question.correctAnswer" md-value="c"></md-radio>

                </md-layout>
                <md-layout md-row>
                    <md-layout>
                        <md-input-container :class="{ 'md-input-invalid': errors.has('answerD') }">
                            <label>Respuesta D</label>
                            <md-input v-model="question.answers.d" data-vv-name="answerD" v-validate data-vv-rules="required"></md-input>
                            <span class="md-error">{{errors.first('answerD')}}</span>
                        </md-input-container>
                    </md-layout>
                    <md-radio v-model="question.correctAnswer" md-value="d"></md-radio>

                </md-layout>
            </md-card-content>

            <md-card-actions>
                <md-button class="md-primary" @click.native="addQuestion()">Enviar</md-button>
            </md-card-actions>
        </md-card>
    </form>
</template>

<script>
    module.exports = {
        data() {
            return {
                question: {
                    title: null,
                    date: null,
                    correctAnswer: 'a',
                    answers: {
                        a: null,
                        b: null,
                        c: null,
                        d: null
                    }
                }
            }
        },
        methods: {
            addQuestion() {
                var t = this;

                if ((t.$root.currentLevel == null) || (t.$root.currentTopic == null)) {
                    t.$root.snackBar.message = 'Por favor escoja un tema.';
                    t.$root.openSnackBar();
                    return;
                };


                t.$validator.validateAll().then(() => {

                    t.question.date = Date.now();
                    t.question.author = t.$root.user.uid;
                    t.$root.$firebaseRefs.questionList.push(t.question).then(successCallback);

                    function successCallback() {
                        t.question = {
                            title: null,
                            date: null,
                            author: t.$root.user.uid,
                            correctAnswer: 'a',
                            answers: {}
                        };
                    };
                }).catch(() => {
                    t.$root.snackBar.message = 'Corrige los errores por favor.';
                    t.$root.openSnackBar();
                });

            }
        }
    }
</script>