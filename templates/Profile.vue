<template>
    <div>
        <md-card class="md-accent" v-if="$root.user.exams == undefined || $root.user.exams.length == 0">
            <md-card-header>
                <div class="md-title">No has hecho todavía ningún examen</div>
            </md-card-header>
            <md-card-actions>
                <md-button @click.native="switchTab(2)">Hacer uno ahora</md-button>
            </md-card-actions>
        </md-card>
        <md-table v-else>
            <md-table-header>
                <md-table-row>
                    <md-table-head>Fecha</md-table-head>
                    <md-table-head>Tema</md-table-head>
                    <md-table-head md-numeric>Nota</md-table-head>
                    <md-table-head md-numeric>Acertados</md-table-head>
                    <md-table-head md-numeric>Equivocados</md-table-head>
                </md-table-row>
            </md-table-header>

            <md-table-body>
                <md-table-row v-for="item in examList" :key="item.date">

                    <md-table-cell>{{ item.date | toDate }}</md-table-cell>
                    <md-table-cell>{{ item.topic }}</md-table-cell>
                    <md-table-cell>{{ item.grade }}</md-table-cell>
                    <md-table-cell v-if="item.grade">{{ item.correct.length }}</md-table-cell>
                    <md-table-cell v-else>0</md-table-cell>
                    <md-table-cell v-if="item.grade !== 10">{{ item.wrong.length }}</md-table-cell>
                    <md-table-cell v-else>0</md-table-cell>
                </md-table-row>
            </md-table-body>
        </md-table>
    </div>
</template>
<script>
    module.exports = {
        computed: {
            examList: function () {
                return this.objectToArray(this.$root.user.exams)
            }
        },
        methods: {
            objectToArray: function (obj) {
                if (obj) {
                    return Object.keys(obj).map(key => obj[key]);
                }
            },
        }
    }
</script>