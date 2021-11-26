<template>
  <v-row class="mx-0 d-flex justify-center">
    <v-col sm="10"
           md="9"
           lg="8"
           xl="7">
      <v-row justify="center" class="mx-0 pb-4">
        <h3 class="text-center tx-text">Advanced data:</h3>
      </v-row>
      <v-row class="d-flex justify-center mb-n3">
        <button v-show="expanded" @click="switchExpand"
                @mouseover="isMouseOver = true" @mouseleave="isMouseOver = false">
          <v-img v-show="!isMouseOver" src="@/assets/status/collapse-2.png"
                 contain eager max-width="30" />
          <v-img v-show="isMouseOver" src="@/assets/status/collapse-2-green.png"
                 contain eager max-width="30" />
        </button>
        <button v-show="!expanded" @click="switchExpand"
                @mouseover="isMouseOver = true" @mouseleave="isMouseOver = false">
          <v-img v-show="!isMouseOver" src="@/assets/status/collapse.png"
                 contain eager max-width="30" />
          <v-img v-show="isMouseOver" src="@/assets/status/collapse-green.png"
                 contain eager max-width="30" />
        </button>
      </v-row>
      <v-expand-transition>
        <div class="box" v-show="expanded">
          <v-row class="mx-0 py-2 px-2">
            <v-col class="py-6 px-5">
              <v-row class="mx-0">
                <h3>Unsigned raw tx</h3>
              </v-row>
              <v-row class="mx-0 text-break">
                <span>{{ rawTx }}</span>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  Component, Emit, Prop,
  Vue,
} from 'vue-property-decorator';

@Component
export default class AdvancedData extends Vue {
  @Prop() initialExpand!: boolean;

  @Prop() rawTx!: string;

  expanded = false;

  isMouseOver = false;

  @Emit()
  switchExpand() {
    this.expanded = !this.expanded;
  }

  created() {
    this.expanded = this.initialExpand;
  }
}
</script>
