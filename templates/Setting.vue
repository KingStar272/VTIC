<template>
    <div>
        <md-whiteframe md-tag="section">
            <md-tabs>
                <md-tab id="lab" md-label="Lab">
                    <md-checkbox v-model="$root.settings.delete">Eliminar preguntas</md-checkbox>
                </md-tab>
            </md-tabs>
        </md-whiteframe>
    </div>
</template>