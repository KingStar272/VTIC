<template>
    <div>
        <md-card class="md-accent" v-if="$root.user.exams == undefined || $root.user.exams.length == 0">
            <md-card-header>
                <div class="md-title">No has hecho todavía ningún examen</div>
            </md-card-header>
            <md-card-actions>
                <md-button @click.native="$router.push('exam')">Hacer uno ahora</md-button>
            </md-card-actions>
        </md-card>
        <md-table v-else>
            <md-table-header>
                <md-table-row>
                    <md-table-head>Fecha</md-table-head>
                    <md-table-head>Tiempo (Minutos)</md-table-head>
                    <md-table-head>Tema</md-table-head>
                    <md-table-head md-numeric>Nota</md-table-head>
                    <md-table-head md-numeric>Correcto(s)</md-table-head>
                    <md-table-head md-numeric>Incorrecto(s)</md-table-head>
                </md-table-row>
            </md-table-header>

            <md-table-body>
                <md-table-row v-for="item in examList" :key="item.date">

                    <md-table-cell>{{ toDate(item.date.end) }}</md-table-cell>
                    <md-table-cell>{{ timeBetween(item.date.start, item.date.end) }}</md-table-cell>
                    <md-table-cell>{{ item.topic }}</md-table-cell>
                    <md-table-cell md-numeric>{{ item.grade }}</md-table-cell>
                    <md-table-cell md-numeric v-if="item.grade">{{ item.correct.length }}</md-table-cell>
                    <md-table-cell md-numeric v-else>0</md-table-cell>
                    <md-table-cell md-numeric v-if="item.grade !== 10">{{ item.wrong.length }}</md-table-cell>
                    <md-table-cell md-numeric v-else>0</md-table-cell>
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
            toDate: function (date) {
                return moment(date).format("MM/DD/YYYY HH:mm")
            },
            objectToArray: function (obj) {
                if (obj) {
                    return Object.keys(obj).map(key => obj[key]);
                }
            },
            timeBetween: function (start, end) {
                var from = moment(start),
                    to = moment(end);
                return to.diff(from, 'minutes');
            }
        }
    }
</script>