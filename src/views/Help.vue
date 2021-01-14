<template>
  <div class="container">
    <div v-if="profile.user">
      <p>
        Full name: {{ fullName }}
      </p>
      <p>
        Email: {{ email }}
      </p>
    </div>
    <div v-if="profile.error">
      Oops an error occured
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Help extends Vue {
  // @State('peginTx') profile!: PegInTxState;
  //
  // @Action('fetchData', { namespace: 'profile' }) fetchData!: any;
  //
  // @Getter('fullName', { namespace: 'profile' }) fullName!: string;
}
</script>
