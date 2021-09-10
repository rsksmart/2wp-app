<template>
  <v-container class="mobile mb-12" fill-height fluid>
    <v-row class="mx-0">
      <v-col cols="12" class="d-flex flex-column align-center py-0">
        <v-img position="center center" src="@/assets/mobile/logo_mobile.png"
               v-bind:width="$vuetify.breakpoint.smOnly ? 310 : 182" contain/>
      </v-col>
      <v-col cols="12" class="text-center d-flex flex-column align-center py-0">
        <div v-bind:class="[$vuetify.breakpoint.smOnly ? 'title-warning-sm' : 'title-warning-xs']">
          <h1>Mobile is not available</h1>
        </div>
        <div v-bind:class="[$vuetify.breakpoint.smOnly ? 'text-warning-sm' : 'text-warning-xs']">
          <p>The mobile functionality is not currently implemented.
            Redirect to your computer to use the service.</p>
          <p>Thank you</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Mobile',
};
</script>
