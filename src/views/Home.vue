<template>
  <section class="section">
    <DeviceMap v-if="activeDevice"></DeviceMap>
    <DeviceList></DeviceList>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import DeviceMap from '@/components/DeviceMap.vue';
import DeviceList from '@/components/DeviceList.vue';
import { Device } from '@/store';

export default Vue.extend({
  name: 'Home',
  metaInfo: {
    title: 'John Lewis: Branch Consignment Visibility Trial',
  },
  components: {
    DeviceMap,
    DeviceList,
  },
  computed: {
    activeDevice(): Device {
      return this.$store.state.activeDevice;
    },
  },
  async created() {
    await this.$store.dispatch('getHubs');
    await this.$store.dispatch('getBeacons');
    await this.$store.dispatch('getStates');
  },
});
</script>

<style lang="scss" scoped>
</style>