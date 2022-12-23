<template>
  <v-dialog v-model="showAddressDialog" width="520" persistent>
    <v-card class="container dialog">
      <v-col cols="12" align-self="center" class="pt-0">
        <v-row class="mx-0 mt-3 mb-3 d-flex justify-center">
            <p class="pop-up-title">Sign this message</p>
        </v-row>
        <v-row class="mx-0 mb-10 justify-center">
            <p class="pop-up-subtitle mb-2">
              We will use the signature to derive your Bitcoin address.
            </p>
            <p class="m-0 p-0">
              This does not expose your data nor spend your funds.
            </p>
            <div class="pop-up-sign-field">
              Sign this message to derive your Bitcoin address
            </div>
        </v-row>
        <v-row class="mx-0 mb-10" justify="space-around">
            <v-btn width="145" height="50" dense outlined rounded
            color="#00B520" @click="closeDialog">
                <span class="greenish">Cancel</span>
            </v-btn>
            <v-btn width="200" height="50" dense rounded
            @click="toSign" color="#00B520">
                <span class="whiteish">Sign</span>
            </v-btn>
        </v-row>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component, Prop, Emit, Vue,
} from 'vue-property-decorator';

@Component
export default class AddressDialog extends Vue {
  @Prop() showAddressDialog!: boolean;

  @Emit('toSign')
  toSign() {
    return this.showAddressDialog;
  }

  @Emit('closeDialog')
  closeDialog() {
    return this.showAddressDialog;
  }
}
</script>
