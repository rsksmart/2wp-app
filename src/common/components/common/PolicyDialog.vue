<template>
  <v-dialog v-model="show" width="650" :persistent="!setClosedDialog">
    <v-card class="container dialog pa-3">
      <v-row class="d-flex justify-end mr-3 mt-3">
        <v-btn variant="plain" :icon="mdiCloseCircleOutline"
               size="regular" @click="close" >
        </v-btn>
      </v-row>
      <v-row class="mx-0 mb-3 d-flex justify-center">
        <div class="d-flex text-h3 ga-1 flex-wrap">
            <span class='pa-2 bg-purple'>Privacy Policy</span>
        </div>
      </v-row>
      <v-row class="mx-15 my-6">
        <v-container class="terms-txt" @scroll="onScroll" ref="scrollableArea">
          <v-row class="pa-4 ma-0">
            <h2>PRIVACY POLICY</h2>
            <p>This is the privacy policy (&ldquo;Privacy Policy&rdquo;) for the 2 Way Peg App
              (the &ldquo;<strong>Services</strong>&rdquo;) provided by&nbsp;
              <strong>RootstockLabs Uruguay S.A.</strong>, (&ldquo;
              <strong>our</strong>&rdquo;, &ldquo;<strong>we</strong>&rdquo;, or &ldquo;
              <strong>RootstockLabs</strong>&rdquo;). If any data is collected, we are the
              controller of your personal data collected through the Services and we are
              committed to protecting and respecting your privacy.</p>
            <p>By using the Services, you accept the terms of this Privacy Policy and our Terms,
              and consent to our collection, use, disclosure, and retention of your information
              as described in this Privacy Policy. If you have not done so already, please
              also review our Terms. The Terms contain provisions that limit our liability to
              you and require you to resolve any dispute with us on an individual basis and not
              as part of any class or representative action. <strong>IF YOU DO NOT AGREE
                WITH ANY PART OF THIS PRIVACY POLICY OR OUR TERMS,THEN PLEASE DO NOT USE ANY OF
                THE SERVICES.</strong></p>
            <p>We have written and organized this Privacy Policy in a simple and accessible way
              precisely so that you can understand how we use your personal data. Below we share
              some of the most important terms that we use here and you should know:</p>
            <ul class="ml-4"><li><p><strong><u>PERSONAL DATA:</u></strong>
              Any information related to an identified or identifiable natural person
              (for example, name and surname, address, email, identity, location data,
              IP address, cookie data, telephone, etc.).</p></li>
              <li><p><strong><u>CONSENT:</u></strong> The free, informed and unequivocal
                statement with which you accept the treatment of your personal data for a
                specific purpose.</p></li>
              <li><p><strong><u>TREATMENT:</u></strong> Any operation carried out with personal
                data. For example collection, production, reception, classification, use, access,
                reproduction, transmission, distribution, processing, archiving, storage,
                elimination, evaluation, modification, communication, transfer, dissemination
                or extraction.</p></li>
            </ul>
            <p><strong><u>WHAT INFORMATION WE COLLECT:</u></strong></p>
            <p>When you use the Services, connect your wallet, fill in forms provided on the
              webpage, provide feedback or report a problem with the Services, we may collect,
              store and use certain information that you disclose to us.</p>
            <p>We do not collect and store personal data, such as first name, last name, street
              address, date of birth, email address, or IP address, in connection with your use
              of the Services.</p>
            <p>We collect only non-identifiable data, such as public on-chain data, and limited
              off-chain data like device type, browser version, etc. This is to help drive
              production vision, not track users.</p>
            <p>We collect information when you visit and interact with the Services through the
              use of technologies such as cookies. The following are examples of information we
              could be able to collect:</p>
            <ul class="ml-4"><li><p>Information about your device, browser or operating
              system;</p></li>
              <li><p>Country where you access the Services;</p></li>
              <li><p>Time zone setting;</p></li>
              <li><p>Information about interactions you have with the web app (such as scrolling
                and clicks);</p></li>
              <li><p>Information about the way you use and the actions you take within the
                web app;</p></li>
              <li><p>Length of time on the web app and time spent within certain
                sections;</p></li>
              <li><p>Wallet types used for peg in or peg out;</p></li>
              <li><p>Numbers of peg in or peg out made per wallet through the Services;</p></li>
              <li><p>Values of the peg in or peg out made through the Services; and</p></li>
              <li><p>Response times.</p></li>
            </ul>
            <p>Please refer to your device&rsquo;s help material to learn what controls you
              can use to remove cookies, block cookies, or disable IDFA tracking. If you do
              this, it may affect your use of the Services.</p>
            <p>We may also partner with third parties who may collect anonymous usage or
              statistical data through your use of the Services (including, for example,
              sub-contractors in technical, payment and/or delivery services, business partners,
              advertising networks, analytics providers).</p>
            <p><strong>Updating your information</strong></p>
            <p>If you want to update the information you have previously given to us, you can
              contact us at <a href="mailto:legal@rootstocklabs.com">
                <u>legal@rootstocklabs.com</u></a>.</p>
            <p><strong><u>HOW AND WHY WE USE/SHARE THE COLLECTED DATA</u></strong></p>
            <p><strong>Provision of Services</strong></p>
            <p>We may use the collected data in the following ways:</p>
            <ul class="ml-4"><li><p>To enable you to access and use the Services</p></li>
              <li><p>To improve the Services and features of the web app.</p></li>
              <li><p>To comply with the law.</p></li>
            </ul>
            <p>In the event we use the collected data, we will proceed as we believe necessary or
              appropriate to comply with applicable laws, lawful requests and legal process, such
              as to respond to subpoenas or requests from government authorities.</p>
            <p><strong>Communication with users</strong></p>
            <p>In the event that we use the collected data, we might use it to communicate about
              promotions, upcoming events, and other news about products and services offered by
              us and our selected partners.</p>
            <p><strong>For compliance, fraud prevention, and safety</strong></p>
            <p>We may use the collected data to protect, investigate, and deter against
              fraudulent, unauthorized, or illegal activity.</p>
            <p><strong>Sharing your information</strong></p>
            <p>Depending on how and why you provide us with the collected data, we may share it in
              the following ways:</p>
            <ul class="ml-4"><li><p>we may share the collected data with any member of our group
              where there is a valid and lawful reason to do so, which means our subsidiaries,
              our ultimate holding company and its subsidiaries;</p></li>
              <li><p>with selected third parties including business partners, suppliers and
                subcontractors for the performance of any contract we enter into with them
                or you (see &ldquo;Service Providers&rdquo; below); or</p></li>
              <li><p>with analytics that assist us in the improvement and optimisation of
                the App.</p></li>
            </ul>
            <p>We may also disclose the collected data to third parties in the following
              events:</p>
            <ul class="ml-4"><li><p>if we were to sell or buy any business or assets, in which
              case we might disclose the collected data to the prospective seller or buyer of such
              business or assets;</p></li>
              <li><p>if we or substantially all of our assets are acquired by a third party, in
                which case the collected data held by us will be one of the transferred assets;
                or</p></li>
              <li><p>if we are under a duty to disclose or share the collected data in order to
                comply with any legal obligation, or in order to enforce or apply the Terms ;
                or to protect the rights, property, or safety of our company, or others. This
                includes exchanging information with other companies and organizations for the
                purposes of fraud protection and credit risk reduction.</p></li>
            </ul>
            <p><strong>Service Providers</strong></p>
            <p>Our Service Providers provide us with a variety of administrative, statistical, and
              technical services. In the event we collect any personal data needed to access such
              services, we will only provide Service Providers with the minimum amount of
              personal data they need to fulfill the services we request, and we stipulate that
              they protect this information and do not use it for any other purpose. We take these
              relationships seriously and oblige all of our data processors to sign contracts with
              us that clearly set out their commitment to respecting individual rights, and their
              commitments to assisting us to help you exercise your rights as a data subject.</p>
            <p><strong>Other Disclosures</strong></p>
            <p>During your use of the Services, your browser, mobile network operator or others
              may collect personal information about you regarding your use of the Services such
              as your identity, your usage and location.</p>
            <p>These third parties shall act as separate and independent controllers of that
              personal data and shall process it in accordance with their own privacy policy.</p>
            <p><strong>Links to third-party sites</strong></p>
            <p>The Services may, from time to time, contain links to and from the websites of our
              partner networks, advertisers, and affiliates. We may also provide links to
              third-party websites that are not affiliated with the Platform. Third-party websites
              are out of our control and are not covered by this Privacy Policy. If you access
              third-party sites using the links provided, the operators of these sites may collect
              information from you that could be used by them, in accordance with their own
              privacy policies. Please check these policies before you submit any personal data
              to those websites.</p>
            <p><strong><u>HOW LONG WE KEEP YOUR INFORMATION</u></strong></p>
            <p>We will keep the collected data as long as it&rsquo;s necessary to achieve the
              purposes for which they were collected, to comply with regulatory or legal
              requirements, or during the statute of limitation period regarding legal or
              contractual responsibilities.</p>
            <p>To determine the appropriate retention period for each category of personal data,
              we consider the amount, nature, and sensitivity of the data, as well as the
              potential risk (arising from unauthorized use and/or unlawful disclosure), the
              purposes of the treatment and if it is possible to fulfill said purposes by other
              means in accordance with the current law.</p>
            <p><strong><u>SECURITY</u></strong></p>
            <p>We take the protection of your information very seriously. In the event we collect
              any data considered personal, we will put in place appropriate physical, electronic
              and managerial security measures to prevent your personal data from being
              accidentally lost, used or accessed in an unauthorized way, altered or disclosed,
              including use of secure servers, passwords and industry standard encryption for
              data both in transit and at rest.</p>
            <p>Where we have given you a password that enables you to access certain parts of our
              Platform, you are responsible for keeping this password confidential. We ask you
              not to share a password with anyone.</p>
            <p>In addition, in case personal data is collected, we will limit the access to your
              personal data to those employees, agents, contractors and other third parties who
              have a business need to know. They will only process your personal data on our
              instructions and they are subject to a duty of confidentiality.</p>
            <p>We have put in place procedures to deal with any suspected personal data breach and
              will notify you and any applicable regulator of a breach where we are legally
              required to do so.</p>
            <p><strong><u>INTERNATIONAL DATA TRANSFERS</u></strong></p>
            <p>Please note that some of our Service Providers may be based outside Uruguay or the
              European Economic Area (the &ldquo;<u>EEA</u>&rdquo;). These Service Providers may
              work for us or for one of our suppliers and may be engaged in, among other things,
              the fulfillment of your request for information, products and services, the
              processing of your payment details and the provision of support services.</p>
            <p>If applicable, when we transfer the data to a Service Provider that is outside of
              Uruguay or the EEA we seek to ensure that appropriate safeguards are in place to
              make sure that your personal data is held securely and that your rights as a data
              subject are upheld. Transfers of personal data are either made:</p>
            <ul class="ml-4"><li><p>to a country recognised by Uruguay or the European Commission
              as providing an adequate level of protection; or</p></li>
              <li><p>to a country that does not offer adequate protection but whose transfer has
                been governed by the standard contractual clauses of the applicable law or by
                implementing other appropriate cross-border transfer solutions to provide
                adequate protection.</p></li>
            </ul>
            <p>In the event that personal information is submitted, you agree to this transfer,
              storing or processing. If you would like more information about the
              mechanism via which your personal data is transferred please contact&nbsp;
              <a href="mailto:legal@rootstocklabs.com"><u>legal@rootstocklabs.com</u></a></p>
            <p><strong>Your Rights</strong></p>
            <p>As a data subject, you have a number of rights in relation to your personal data.
              Below, you will be able to find a non-taxative list of the various rights that you
              have, as well as how you can exercise them.</p>
            <ul class="ml-4"><li><p><strong><u>Access:</u></strong> You will have the right to
              request access to your personal data, as well as to know any information related to
              the conditions of your treatment.</p></li>
              <li><p><strong><u>Rectification:</u></strong> You will have the right to request
                the rectification of your personal data when it&rsquo;s inaccurate, incomplete
                or not updated.</p></li>
              <li><p><strong><u>Erasure:</u></strong>You will have the right to request the
                erasure of your personal data, so that it is not processed by us, although your
                request may not always be possible, since we might have the obligation to keep
                certain personal data due to the technical impossibility to delete it or in order
                to fulfill with legal requirements.</p></li>
              <li><p><strong><u>Object Processing:</u></strong> You may object to processing of
                your personal data where we rely on legitimate interest for processing that
                personal data. We will comply with your request unless we have a compelling
                overriding legitimate interest for processing or we need to continue processing
                your personal data to establish, exercise or defend a legal claim.</p></li>
            </ul>
            <p>To exercise any of the rights listed above and/or any other right stated by the
              applicable law, you can contact us to <a href="mailto:legal@rootstocklabs.com"><u>
                legal@rootstocklabs.com</u></a>. We will immediately process your request and inform
              you the results within the term established by the applicable law.</p>
            <p><strong>Withdrawal of consent</strong></p>
            <p>You may withdraw consent previously given by you to us at any time. However, this
              will not affect the lawfulness of any processing carried out before you withdraw
              your consent. If you withdraw your consent, we may not be able to provide certain
              products or services to you. We will advise you if this is the case at the time you
              withdraw your consent.</p>
            <p><strong><u>CONTACT DETAILS</u></strong></p>
            <p>If you have any queries regarding this Privacy Policy, if you wish to exercise any
              of your rights set out above or if you think that the Privacy Policy has
              not been followed, please contact us by emailing
              at <a href="mailto:legal@rootstocklabs.com"><u>legal@rootstocklabs.com</u></a>.</p>
          </v-row>
        </v-container>
      </v-row>
      <v-row class="d-flex justify-end mx-11 my-5">
        <v-btn-rsk rounded variant="flat" width="110"
                   @click="close"
                   :disabled="requiresScroll && !scrolledText && !setClosedDialog">
          <span>Close</span>
        </v-btn-rsk>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  ref, defineComponent, computed, watchEffect,
} from 'vue';
import { mdiCloseCircleOutline } from '@mdi/js';

export default defineComponent({
  name: 'PolicyDialog',
  props: {
    showDialogPolicy: Boolean,
  },
  setup(props, context) {
    const show = computed({
      get() {
        return props.showDialogPolicy;
      },
      set(value) {
        context.emit('update:showDialogPolicy', value);
      },
    });
    const scrolledText = ref(false);
    const scrollableArea = ref();
    const requiresScroll = ref();
    const setClosedDialog = ref(false);

    function onScroll(
      event: { target: { scrollTop: number; clientHeight: number; scrollHeight: number; }},
    ) {
      const { target: { scrollTop, clientHeight, scrollHeight } } = event;
      scrolledText.value = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
    }

    watchEffect(() => {
      if (scrollableArea.value) {
        const el = scrollableArea.value.$el;
        requiresScroll.value = el.scrollHeight > el.clientHeight;
        scrolledText.value = false;
      }
    });

    function close() {
      setClosedDialog.value = false;
      context.emit('update:showDialogPolicy', false);
    }

    return {
      show,
      scrolledText,
      onScroll,
      scrollableArea,
      requiresScroll,
      mdiCloseCircleOutline,
      close,
      setClosedDialog,
    };
  },
});
</script>

<style scoped>
p {
  font-size: 12px;
}
</style>
