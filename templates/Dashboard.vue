<template>
    <div v-if="!$root.examStatus.inProgress">
        <md-card class="md-primary" v-if="!$root.questionList.length && $root.settings.currentTopic !== null">
            <md-card-header>
                <div class="md-title">No hay preguntas bajo el tema de {{ $root.currentTopicName }}.</div>
            </md-card-header>
            <md-card-actions>
                <md-button @click.native="$router.push('/submit')">Crear una ahora</md-button>
                <md-button @click.native="$root.openDialog('settings')">Cambiar el tema</md-button>
            </md-card-actions>
        </md-card>
        <md-card style="margin-bottom: 1em;" v-for="(item, index) in reverse($root.questionList)" :key="item['.key']">
            <md-card-header>

                <md-avatar>
                    <img :src="$root.getUserInfo(item.author).avatar" alt="People">
                </md-avatar>

                <div class="md-title">{{ $root.getUserInfo(item.author).name }}</div>
                <div class="md-subhead">
                    <span>
                        <timeago :auto-update="60" :since="item.date"></timeago>
                        <md-tooltip md-direction="bottom">{{ item.date | toDate }}</md-tooltip>
                    </span>
                </div>
            </md-card-header>
            <md-card-content>
                {{ item.title }} {{item.id}}
                <md-list>

                    <md-list-item v-for="(value, letter, index) in item.answers" :key="item.id">
                        <div class="md-list-text-container">
                            {{letter.toUpperCase()}}. {{value}}
                        </div>
                        <md-button v-if="item.correctAnswer == letter" class="md-icon-button md-list-action">
                            <md-icon class="md-primary">star</md-icon>
                            <md-tooltip md-direction="bottom">Respuesta Correcta</md-tooltip>
                        </md-button>
                        <md-divider v-if="letter !== 'd'"></md-divider>
                    </md-list-item>
                </md-list>
                <md-button @click.native="removeQuestion(item)" class="md-raised md-warn" v-if="$root.settings.delete && item.author == $root.user.uid">Eliminar</md-button>

            </md-card-content>
        </md-card>
    </div>
    <div v-else>
        <md-card class="md-primary">
            <md-card-header>
                <div class="md-title">Nope.</div>
            </md-card-header>
        </md-card>
    </div>
</template>
<script>
    module.exports = {

        methods: {
            reverse: function (array) {
                return array.slice().reverse();
            },
            removeQuestion: function (question) {
                this.$root.confirm = {
                    title: 'Confirmar',
                    contentHtml: 'Eliminar la pregunta <strong>' + question.title + '</strong> ?',
                    ok: 'Yep',
                    cancel: 'Nope'
                };

                this.$root.onConfirm = function () {
                    this.$root.$firebaseRefs.questionList.child(question['.key']).remove();
                    this.$root.snackBar.message = 'La pregunta ha sido eliminada.';
                    this.$root.openSnackBar();
                };

                this.$root.openDialog('confirm')

            }
        }
    }
</script>