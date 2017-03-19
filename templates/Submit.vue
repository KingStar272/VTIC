<template>
    <form v-on:submit.prevent>
        <md-input-container>
            <label>Pregunta</label>
            <md-input v-model="question.title" :required="true"></md-input>
        </md-input-container>
        <md-layout md-row :md-gutter="40">
            <md-layout md-flex-xsmall="100" md-flex-medium="50">
                <md-input-container>
                    <label>Repuesta A</label>
                    <md-input v-model="question.answers.a" :required="true"></md-input>
                </md-input-container>
            </md-layout>
            <md-layout md-flex-xsmall="100" md-flex-medium="50">
                <md-input-container>
                    <label>Respuesta B</label>
                    <md-input v-model="question.answers.b" :required="true"></md-input>
                </md-input-container>
            </md-layout>
        </md-layout>
        <md-layout md-row :md-gutter="40">
            <md-layout md-flex-xsmall="100" md-flex-medium="50">
                <md-input-container>
                    <label>Respuesta C</label>
                    <md-input v-model="question.answers.c" :required="true"></md-input>
                </md-input-container>
            </md-layout>
            <md-layout md-flex-xsmall="100" md-flex-medium="50">
                <md-input-container>
                    <label>Respuesta D</label>
                    <md-input v-model="question.answers.d" :required="true"></md-input>
                </md-input-container>
            </md-layout>
        </md-layout>
        <md-layout md-gutter md-theme="default">
            <md-layout md-flex-xsmall="25%">
                <md-radio v-model="question.correctAnswer" md-value="a">A</md-radio>
            </md-layout>
            <md-layout md-flex-xsmall="25%">
                <md-radio v-model="question.correctAnswer" md-value="b">B</md-radio>
            </md-layout>
            <md-layout md-flex-xsmall="25%">
                <md-radio v-model="question.correctAnswer" md-value="c">C</md-radio>
            </md-layout>
            <md-layout md-flex-xsmall="25%">
                <md-radio v-model="question.correctAnswer" md-value="d">D</md-radio>
            </md-layout>
        </md-layout>
        <md-button class="md-raised md-primary fullWidth" @click.native="addQuestion()" type="submit">
            Enviar
        </md-button>
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

                if ((this.$root.currentLevel == null) || (this.$root.currentTopic == null)) {
                    this.$root.snackBar.message = 'Por favor escoja un tema.';
                    this.$root.openSnackBar();
                    return;
                };

                if (this.question.title == null) {
                    this.$root.snackBar.message = 'Por favor añade un título.';
                    this.$root.openSnackBar();
                    return;
                };

                var t = this;
                var j = ['a', 'b', 'c', 'd'];

                for (var i = 0, len = j.length; i < len; i++) {
                    if (t.question.answers[j[i]] == "" || t.question.answers[j[i]] == null) {
                        alert('Por favor rellena todos los campos.');
                        return;
                    };
                }

                this.question.date = Date.now();
                this.question.author = t.$root.user.uid;
                this.$root.$firebaseRefs.questionList.push(this.question).then(successCallback);

                function successCallback() {
                    t.question = {
                        title: null,
                        date: null,
                        author: t.$root.user.uid,
                        correctAnswer: 'a',
                        answers: {}
                    };
                };

            }
        }
    }
</script>