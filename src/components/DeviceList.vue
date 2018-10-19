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
          <div ref="filterDropdown" class="dropdown is-active" @click="toggleFilter">
            <div class="dropdown-trigger">
              <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                <span>Filter by TAG status</span>
                <span class="icon is-small">
                  <font-awesome-icon icon="angle-down" size="sm" />
                </span>
              </button>
            </div>
            <div class="dropdown-menu" id="dropdown-menu" role="menu">
              <div class="dropdown-content">
                <a href="#" class="dropdown-item" @click="selectTagStateFilter('Active')">
                  Active
                </a>
                <a href="#" class="dropdown-item" @click="selectTagStateFilter('ActiveFound')">
                  Active & found
                </a>
                <a class="dropdown-item" @click="selectTagStateFilter('ActiveOnRoute')">
                  Active on route
                </a>
                <a href="#" class="dropdown-item" @click="selectTagStateFilter('ActiveMissing')">
                  Active but missing
                </a>
                <a href="#" class="dropdown-item" @click="selectTagStateFilter('ArrivedAtDestination')">
                  Arrived at destination
                </a>
                <a href="#" class="dropdown-item" @click="selectTagStateFilter('Deactivated')">
                  Deactivated
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="level-item">
          <div ref="sortDropdown" class="dropdown" @click="toggleSort">
            <div class="dropdown-trigger">
              <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                <span>Sort by</span>
                <span class="icon is-small">
                  <font-awesome-icon icon="angle-down" size="sm" />
                </span>
              </button>
            </div>
            <div class="dropdown-menu" id="dropdown-menu" role="menu">
              <div class="dropdown-content">
                <a href="#" class="dropdown-item" @click="selectTagStateFilter('Active')">
                  Location
                </a>
                <a href="#" class="dropdown-item" @click="selectTagStateFilter('ActiveFound')">
                  GRS Code
                </a>
                <a class="dropdown-item" @click="selectTagStateFilter('ActiveOnRoute')">
                  Tag Code
                </a>
              </div>
            </div>
          </div>
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
                  <option>Serial Number</option>
                  <option>Asset Description</option>
                </select>
              </div>
            </p>
          </div>
        </div>
      </div>

      <!-- Right side -->
      <div class="level-right">
        <p class="level-item"><strong>All</strong></p>
        <p class="level-item" @click="csvExport"><a class="button is-success">CSV Export</a></p>
      </div>
    </nav>
    <table class="table table is-striped is-hoverable is-fullwidth is-bordered">
      <thead>
        <tr>
          <th><abbr title="SerialNumber">Serial Number</abbr></th>
          <th><abbr title="AssetDescription">Asset Description</abbr></th>
          <th><abbr title="State">State</abbr></th>
          <th><abbr title="LastActiveTime">Last active time</abbr></th>
          <th><abbr title="Location">Location</abbr></th>
          <th><abbr title="History">History</abbr></th>
        </tr>
      </thead>
      <tbody>
        <tr :class="['Row-' + device.SerialNumber]" v-for="device in devices" v-bind:key="device.SerialNumber">
          <td>{{ device.SerialNumber.length ? device.SerialNumber : 'Unknown' }}</td>
          <td>{{ device.AssetDescription || 'Unknown' }}</td>
          <td>
            <font-awesome-icon v-if="!device.DeviceState" icon="spinner" size="lg" spin />
            <font-awesome-icon v-else icon="check" size="lg" />
          </td>
          <td>
            {{ getLastTimeOfDevice(device.SerialNumber) }}
          </td>
          <td>{{ getDeviceLocation(device.SerialNumber) }}</td>
          <td>
            <a class="button" @click="showEvents(device.SerialNumber)">
              <span class="icon">
                <font-awesome-icon icon="calendar" size="sm" />
              </span>
              <span>History</span>
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

    <!-- Modal -->
    <div class="modal" ref="modal">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="timeline">
          <header class="timeline-header">
            <span class="tag is-medium is-primary">Start</span>
          </header>
          <div class="timeline-item" v-for="event of events" v-bind:key="event.id">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <p class="heading">{{ new Date(event.Time).toLocaleString() }}</p>
              <p>{{ event.Type }} </p>
            </div>
          </div>
          <div class="timeline-header">
            <span class="tag is-medium is-primary">End</span>
          </div>
        </div>
      </div>
      <button @click="showEvents" class="modal-close is-large" aria-label="close"></button>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { MUTATIONS, Device, Event, Hub } from '@/store';
import { ExportToCsv } from 'export-to-csv';

export default Vue.extend({
  name: 'DeviceList',
  data() {
    return {
      searchType: '',
      searchValue: '',
      events: [],
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
    csvExport() {
      const deviceList: any[] = this.$store.getters['getDeviceListByFilter'];

      const ex = new ExportToCsv({
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalseparator: '.',
        showLabels: true,
        showTitle: true,
        title: '',
        useBom: true,
        useKeysAsHeaders: true
      });

      ex.generateCsv(deviceList);
    },
    toggleSort() {
      (this.$refs.sortDropdown as HTMLElement).classList.toggle('is-active');
    },
    getDeviceLocation(serialNumber: string) {
      const events: Event[] = this.$store.getters['getEventsByBeacon'](serialNumber);
      const event: Event = this.$store.getters['getEventsByBeacon'](serialNumber)[events.length - 1];

      if (event) {
        const hub: Hub = this.$store.getters['getHubBySerial'](event.Hub_SerialNumber);

        if (hub) {
          return hub.Name;
        }
      }

      return 'No event';
    },
    getLastTimeOfDevice(serialNumber: string) {
      const events: Event[] = this.$store.getters['getEventsByBeacon'](serialNumber);
      const event: Event = this.$store.getters['getEventsByBeacon'](serialNumber)[events.length - 1];

      if (event) {
        if (event.Time) {
          return new Date(event.Time).toLocaleString();
        }
      }

      return 'Unknown';
    },
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
    selectTagStateFilter(tagState: string) {
      this.$store.commit(MUTATIONS.UPDATE_TAG_STATUS_FILTER, { filter: tagState });
    },
    showEvents(serialNumber: string) {
      this.events = this.$store.getters['getEventsByBeacon'](serialNumber);
      (this.$refs.modal as HTMLElement).classList.toggle('is-active');
    },
    toggleFilter() {
      (this.$refs.filterDropdown as HTMLElement).classList.toggle('is-active');
    },
  },
});

</script>

<style lang="scss" scoped>

.modal-content {
  background: white;
  padding: 50px;
}

.table {
  min-width: 100%;
}

.table tr.is-selected a, .table tr.is-selected strong {
  color: inherit;
}
</style>
