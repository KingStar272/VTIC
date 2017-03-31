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


                <md-layout md-row v-for="(value, letter, index) in question.answers">
                    <md-layout>
                        <md-input-container :class="{ 'md-input-invalid': errors.has(letter) }">
                            <label>Repuesta {{letter.toUpperCase()}}</label>
                            <md-input v-model="question.answers[letter]" :data-vv-name="letter" v-validate data-vv-rules="required"></md-input>
                            <span class="md-error">{{errors.first(letter)}}</span>
                        </md-input-container>
                    </md-layout>
                    <md-radio v-model="question.correctAnswer" :md-value="letter"></md-radio>
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
                            answers: {
                                a: null,
                                b: null,
                                c: null,
                                d: null
                            }
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