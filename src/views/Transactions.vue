<template>
  <div class="transactions">
    <v-row class="mx-0 my-10 d-flex justify-center">
      <h1 class="text-center">TRANSACTION STATUS</h1>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="3">
        <v-autocomplete rounded dense outlined color="#1732A4" label="Tracking ID"/>
      </v-col>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="3">
        <v-card height="125">
          <v-row class="mx-0">
            <v-col>
              <v-row class="mx-0">
                <h2>00/00/00</h2>
              </v-row>
              <v-row class="mx-0">
                Date
              </v-row>
            </v-col>
            <v-col cols="4" class="d-flex justify-center align-center">
              <v-img height="60" src="@/assets/transactions/calendar.png" contain/>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card height="125">
          <v-row class="mx-0">
            <v-col>
              <v-row class="mx-0">
                <h2>0.0 BTC</h2>
              </v-row>
              <v-row class="mx-0">
                Ammount
              </v-row>
            </v-col>
            <v-col cols="4" class="d-flex justify-center align-center">
              <v-img height="60" src="@/assets/transactions/cash.png" contain/>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card height="125">
          <v-row class="mx-0">
            <v-col>
              <v-row class="mx-0">
                <h2>abc...123</h2>
              </v-row>
              <v-row class="mx-0">
                Address
              </v-row>
            </v-col>
            <v-col cols="4" class="d-flex justify-center align-center">
              <v-img height="60" src="@/assets/transactions/address.png" contain/>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
        <v-col cols="3">
          <v-card height="125">
            <v-row class="mx-0">
              <v-col>
                <v-row class="mx-0">
                  <h2>In progress</h2>
                </v-row>
                <v-row class="mx-0">
                  Status
                </v-row>
              </v-col>
              <v-col cols="4" class="d-flex justify-center align-center">
                <v-img height="60" src="@/assets/transactions/empty.png" contain/>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="3">
          <v-card height="125">
            <v-row class="mx-0">
              <v-col>
                <v-row class="mx-0">
                  <h2>00/100</h2>
                </v-row>
                <v-row class="mx-0">
                  Confirmations
                </v-row>
              </v-col>
              <v-col cols="4" class="d-flex justify-center align-center">
                <v-img height="60" src="@/assets/transactions/empty.png" contain/>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="3">
          <v-card height="125">
            <v-row class="mx-0">
              <v-col>
                <v-row class="mx-0">
                  <h2>17 hs 00 min</h2>
                </v-row>
                <v-row class="mx-0 d-flex align-end">
                  Time remaining
                </v-row>
              </v-col>
              <v-col cols="4" class="d-flex justify-center align-center">
                <v-img height="60" src="@/assets/transactions/empty.png" contain/>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Transactions extends Vue {}
</script>
