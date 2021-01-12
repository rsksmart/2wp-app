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
import { State, Action, Getter } from 'vuex-class';
import { ProfileState, User } from '@/store/profile/types';

@Component
export default class Help extends Vue {
  @State('profile') profile!: ProfileState;

  @Action('fetchData', { namespace: 'profile' }) fetchData!: any;

  @Getter('fullName', { namespace: 'profile' }) fullName!: string;

  mounted() {
    // fetching data as soon as the component's been mounted
    this.fetchData();
  }

  // computed variable based on user's email
  get email() {
    const user: User | undefined = this.profile && this.profile.user;
    return (user && user.email) || '';
  }
}
</script>
