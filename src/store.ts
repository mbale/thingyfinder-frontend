import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import differenceInMinutes from 'date-fns/difference_in_minutes';

Vue.use(Vuex);

export const MUTATIONS = {
  UPDATE_DEVICE_LIST: 'UPDATE_DEVICE_LIST',
  UPDATE_DEVICE_STATUS: 'UPDATE_DEVICE_STATUS',
  UPDATE_FILTER_TYPE: 'UPDATE_FILTER_TYPE',
  UPDATE_FILTER_VALUE: 'UPDATE_FILTER_VALUE',
  UPDATE_ACTIVE_DEVICE: 'UPDATE_ACTIVE_DEVICE',
  UPDATE_HUBS: 'UPDATE_HUBS',
  UPDATE_EVENTS: 'UPDATE_EVENTS',
  UPDATE_TAG_STATUS_FILTER: 'UPDATE_TAG_STATUS_FILTER',
};

enum DeviceFilterTypes {
  Null = 'null',
  SerialNumber = 'SerialNumber',
  AssetType = 'AssetType',
  AssetDescription = 'AssetDescription',
  Owner = 'Owner',
}

export enum TagStatusFilter {
  Active = 'Active',
  ActiveFound = 'ActiveFound',
  ActiveOnRoute = 'ActiveOnRoute',
  ActiveMissing= 'ActiveMissing',
  ArrivedAtDestination = 'ArrivedAtDestination',
  Deactivated = 'Deactivated',
}

interface DeviceTriangulation {
  Circle1: {
    Centre: {
      x: number;
      y: number;
    },
    Radius: number;
  };
  Circle2: {
    Centre: {
      x: number;
      y: number;
    },
    Radius: number;
  };
  Circle3: {
    Centre: {
      x: number;
      y: number;
    },
    Radius: number;
  };
  IntersectionPoint: {
    x: number;
    y: number;
  };
  FinalPoint: {
    x: number;
    y: number;
  }
}

export interface Device {
  SerialNumber: string;
  AssetType: string;
  AssetDescription: string;
  Owner: string;
  DeviceState: DeviceTriangulation[] | null;
  CustomerSpecificId: string | null;
}

interface RootState {
  deviceList: Device[];
  filterType: DeviceFilterTypes;
  filterValue: string | null;
  activeDevice: Device | null;
  hubs: Hub[];
  events: Event[];
  tagStatusFilter: TagStatusFilter | null;
}

export interface Event {
  id: number;
  Time: string;
  Sequence: number;
  Beacon_SerialNumber: string;
  Beacon: any;
  Hub_SerialNumber: string;
  Hub: any;
  Type: any;
  Decibels: number;
  // extend
  status?: string;
}

export interface Location {
  x: number;
  y: number;
}

export interface Hub {
  SerialNumber: string;
  Type: string;
  Name: string;
  X: number;
  Y: number;
  Location: Location;
}

const store: StoreOptions<RootState> = {
  state: {
    deviceList: [],
    filterType: DeviceFilterTypes.Null,
    filterValue: null,
    activeDevice: null,
    hubs: [],
    events: [],
    tagStatusFilter: null,
  },
  getters: {
    getEventsByBeacon: (state) => (serialNumber) =>
      state.events.filter((event) => event.Beacon_SerialNumber === serialNumber).sort((a, b) => {
        return new Date(a.Time).getTime() - new Date(b.Time).getTime();
    }),
    getHubBySerial: (state) => (serialNumber) => state.hubs.find((hub) => hub.SerialNumber === serialNumber),
    getDeviceListByFilter({ deviceList, hubs, filterType, filterValue, tagStatusFilter }, { getEventsByBeacon }) {
      if (tagStatusFilter) {
        const devices: Device[] = [];

        for (const device of deviceList) {
          const events: Event[] = getEventsByBeacon(device.SerialNumber);

          if (events) {
            events.forEach((event) => {
              const time = new Date(event.Time);
              const now = new Date();

              switch (tagStatusFilter) {
                case TagStatusFilter.ActiveFound:
                  if (differenceInMinutes(time, now) <= 30) {
                    devices.push(device);
                  }
                  break;
                case TagStatusFilter.ActiveOnRoute:
                  if (differenceInMinutes(time, now) > 30 && differenceInMinutes(time, now) < 1440) {
                    devices.push(device);
                  }
                  break;
                case TagStatusFilter.ActiveMissing:
                  if (differenceInMinutes(time, now) >= 1440) {
                    devices.push(device);
                  }
                  break;
                case TagStatusFilter.ArrivedAtDestination:
                  if (differenceInMinutes(time, now) >= 30 && event.Hub) {
                    devices.push(device);
                  }
                  break;
                case TagStatusFilter.Deactivated:
                  if (differenceInMinutes(time, now) > 30 && event.Hub) {
                    devices.push(device);
                  }
                  break;
                default:
                  break;
              }
            });
          }

          return deviceList.filter((d) => !devices.find((e) => d.AssetDescription === e.AssetDescription));
        }
      }

      if (filterType === DeviceFilterTypes.Null || !filterValue) {
        return deviceList;
      }

      return deviceList.filter((device) => {
        const value = device[filterType];

        if (value) {
          return value.includes(filterValue.toLowerCase());
        }
      });
    },
  },
  mutations: {
    [MUTATIONS.UPDATE_DEVICE_LIST](state, devicelist) {
      state.deviceList = state.deviceList.concat(devicelist);
    },
    [MUTATIONS.UPDATE_FILTER_TYPE](state, filterType) {
      state.filterType = filterType;
    },
    [MUTATIONS.UPDATE_FILTER_VALUE](state, filterValue) {
      state.filterValue = filterValue;
    },
    [MUTATIONS.UPDATE_DEVICE_STATUS](state, { serialNumber, deviceState }) {
      const device = state.deviceList
        .find((d) => d.SerialNumber === serialNumber);

      if (device) {
        device.DeviceState = deviceState;
      }
    },
    [MUTATIONS.UPDATE_ACTIVE_DEVICE](state, serialNumber) {
      const newActiveDevice = state.deviceList.find((device) => device.SerialNumber === serialNumber);

      if (newActiveDevice) {
        state.activeDevice = newActiveDevice;
      }
    },
    [MUTATIONS.UPDATE_HUBS](state, { hubs }) {
      state.hubs = hubs;
    },
    [MUTATIONS.UPDATE_EVENTS](state, { events }: { events: Event[] }) {
      let extendedEvents: Event[] = [];

      let activated = false;
      let deactivated = false;
      let arrived = false;

      for (const event of events) {
        let status = '';
        const hub: Hub | null = state.hubs.find((h) => h.SerialNumber === event.Hub_SerialNumber) || null;

        if (hub) {
          switch (hub.Name) {
            case 'NH':
              if (!activated) {
                activated = true;
                status = 'Activated';
              } else {
                status = 'Left';
              }
              break;
            case 'SH':
              if (!arrived) {
                arrived = true;
                status = 'Arrived';
              } else {
                status = 'Deactivated';
              }
              break;
            default:
              break;
          }
        }
        event.status = status;
        extendedEvents.push(event);
      }

      state.events = state.events.concat(extendedEvents);
    },
    [MUTATIONS.UPDATE_TAG_STATUS_FILTER](state, { filter }) {
      state.tagStatusFilter = filter;
    },
  },
  actions: {
    async getBeacons({ commit }) {
      const { data } = await Vue.axios.get('api/tag');

      const filtered: Device[] = data.filter((device: Device) => {
        if (device.Owner) {
          if (device.Owner === 'John Lewis') {
            return true;
          }
          return false;
        }
      });

      commit(MUTATIONS.UPDATE_DEVICE_LIST, filtered.map((dat: Device) => {
        dat.DeviceState = null;
        return dat;
      }));
    },
    async getHubs({ commit }) {
      const { data } = await Vue.axios.get('hub');

      commit(MUTATIONS.UPDATE_HUBS, { hubs: data });
    },
    async getEventsByBeaconSerial({ commit }, { beaconSerial }) {
      try {
        const { data } = await Vue.axios.get(`event/${beaconSerial}/20`);
        commit(MUTATIONS.UPDATE_EVENTS, { events: data });
      } catch (error) {
        console.log(error);
      }
    },
    async getStates({ commit, state, dispatch }) {
      const deviceList = state.deviceList;

      for (const { SerialNumber } of deviceList) {
        if (SerialNumber !== '') {
          try {
            const { data } = await Vue.axios.get(`api/tag/triangulationPoints/${SerialNumber}/10`);
            commit(MUTATIONS.UPDATE_DEVICE_STATUS, { serialNumber: SerialNumber, deviceState: data });

            try {
              await dispatch('getEventsByBeaconSerial', {beaconSerial: SerialNumber });
            } catch (error) {
              console.log('no information')
            }
          } catch (error) {
            // console.log(error);
          }
        }
      }
    },
  },
};

export default new Vuex.Store(store);
