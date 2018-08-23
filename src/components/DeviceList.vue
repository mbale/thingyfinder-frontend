<template>
  <section class="section DeviceList">
    <nav class="level">
      <!-- Left side -->
      <div class="level-left">
        <div class="level-item">
          <p class="subtitle is-5">
            <strong>{{ deviceCount }}</strong> devices
          </p>
        </div>
        <div class="level-item">
          <div class="field has-addons">
            <p class="control">
              <input class="input" type="text" placeholder="Find a device" v-model="searchValue">
            </p>
            <p class="control">
              <div class="select">
                <select v-model="searchType">
                  <option value="" selected="selected">Filter type</option>
                  <option>SerialNumber</option>
                  <option>Owner</option>
                  <option>AssetDescription</option>
                  <option>AssetType</option>
                </select>
              </div>
            </p>
          </div>
        </div>
      </div>

      <!-- Right side -->
      <div class="level-right">
        <p class="level-item"><strong>All</strong></p>
        <p class="level-item"><a class="button is-success">New</a></p>
      </div>
    </nav>
    <table class="table table is-striped is-hoverable is-fullwidth is-bordered">
      <thead>
        <tr>
          <th><abbr title="SerialNumber">SerialNumber</abbr></th>
          <th><abbr title="Owner">Owner</abbr></th>
          <th><abbr title="AssetDescription">AssetDescription</abbr></th>
          <th><abbr title="AssetType">AssetType</abbr></th>
          <th><abbr title="State">State</abbr></th>
          <th><abbr title="AssetAction">Action</abbr></th>
        </tr>
      </thead>
      <tbody>
        <tr :class="['Row-' + device.SerialNumber]" v-for="device in devices" v-bind:key="device.SerialNumber">
          <td>{{ device.SerialNumber.length ? device.SerialNumber : 'Unknown' }}</td>
          <td>{{ device.owner || 'Unknown' }}</td>
          <td>{{ device.AssetDescription || 'Unknown' }}</td>
          <td>{{ device.AssetType }}</td>
          <td>
            <font-awesome-icon v-if="!device.DeviceState" icon="spinner" size="lg" spin />
            <font-awesome-icon v-else icon="check" size="lg" />
          </td>
          <td>
            <a class="button" @click="showOnMap(device.SerialNumber)" :disabled="!device.DeviceState">
              <span class="icon">
                <font-awesome-icon icon="map" size="sm" />
              </span>
              <span>Map</span>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <nav class="pagination is-rounded" role="navigation" aria-label="pagination">
      <a class="pagination-previous">Previous</a>
      <a class="pagination-next">Next page</a>
      <ul class="pagination-list">
        <li><a class="pagination-link" aria-label="Goto page 1">1</a></li>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <li><a class="pagination-link" aria-label="Goto page 45">45</a></li>
        <li><a class="pagination-link is-current" aria-label="Page 46" aria-current="page">46</a></li>
        <li><a class="pagination-link" aria-label="Goto page 47">47</a></li>
        <li><span class="pagination-ellipsis">&hellip;</span></li>
        <li><a class="pagination-link" aria-label="Goto page 86">86</a></li>
      </ul>
    </nav>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { MUTATIONS } from '@/store';

export default Vue.extend({
  name: 'DeviceList',
  data() {
    return {
      searchType: '',
      searchValue: '',
    };
  },
  watch: {
    searchValue(newValue, oldValue) {
      if (oldValue !== newValue) {
        this.$store.commit(MUTATIONS.UPDATE_FILTER_VALUE, newValue);
      }
    },
    searchType(newValue, oldValue) {
      if (oldValue !== newValue) {
        this.$store.commit(MUTATIONS.UPDATE_FILTER_TYPE, newValue);
      }
    },
  },
  computed: {
    deviceCount(): number {
      return this.$store.getters.getDeviceListByFilter.length;
    },
    devices(): any[] {
      return this.$store.getters.getDeviceListByFilter;
    },
  },
  methods: {
    showOnMap(serialNumber: string) {
      const previousActiveRow = document.querySelector('tr.is-selected')

      if (previousActiveRow) {
        previousActiveRow.classList.toggle('is-selected')
      }

      const row = document.querySelector(`.Row-${serialNumber}`);

      if (row) {
        this.$store.commit(MUTATIONS.UPDATE_ACTIVE_DEVICE, serialNumber);
        row.classList.toggle('is-selected');
      }
    },
  },
});

</script>

<style lang="scss" scoped>

.table {
  min-width: 100%;
}

.table tr.is-selected a, .table tr.is-selected strong {
  color: inherit;
}
</style>
