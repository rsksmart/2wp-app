<template>
  <v-row class="mx-0 d-flex justify-center">
    <v-col sm="8"
            md="7"
           lg="6"
           xl="4">
      <v-row justify="center" class="mx-0 pb-4">
        <h3 class="text-center tx-text">Advanced Data:</h3>
      </v-row>
      <v-row class="d-flex justify-center mb-n3">
        <a v-show="expand && !expandOver" @click="switchExpand" @mouseover="switchExpandOver"
           @mouseleave="switchExpandOver">
          <v-img src="@/assets/status/collapse-2.png" contain max-width="30"></v-img>
        </a>
        <a v-show="!expand && !expandOver" @click="switchExpand" @mouseover="switchExpandOver"
           @mouseleave="switchExpandOver">
          <v-img src="@/assets/status/collapse.png" contain max-width="30"></v-img>
        </a>
        <a v-show="expand && expandOver" @click="switchExpand">
          <v-img src="@/assets/status/collapse-2-green.png" contain max-width="30"></v-img>
        </a>
        <a v-show="!expand && expandOver" @click="switchExpand">
          <v-img src="@/assets/status/collapse-green.png" contain max-width="30"></v-img>
        </a>
      </v-row>
      <v-expand-transition>
        <div class="box" v-show="expand">
          <v-row class="mx-0 py-2 px-2">
            <v-col class="py-6 px-5">
              <v-row class="mx-0">
                <h3>Unsigned Raw Tx</h3>
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

  expand = false;

  expandOver = false;

  @Emit()
  switchExpand() {
    this.expand = !this.expand;
  }

  @Emit()
  switchExpandOver() {
    this.expandOver = !this.expandOver;
  }

  created() {
    this.expand = this.initialExpand;
  }
}
</script>
