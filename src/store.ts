import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

Vue.use(Vuex);

export const MUTATIONS = {
  UPDATE_DEVICE_LIST: 'UPDATE_DEVICE_LIST',
  UPDATE_DEVICE_STATUS: 'UPDATE_DEVICE_STATUS',
  UPDATE_FILTER_TYPE: 'UPDATE_FILTER_TYPE',
  UPDATE_FILTER_VALUE: 'UPDATE_FILTER_VALUE',
  UPDATE_ACTIVE_DEVICE: 'UPDATE_ACTIVE_DEVICE',
  UPDATE_HUBS: 'UPDATE_HUBS',
  UPDATE_EVENTS: 'UPDATE_EVENTS',
};

enum DeviceFilterTypes {
  Null = 'null',
  SerialNumber = 'SerialNumber',
  AssetType = 'AssetType',
  AssetDescription = 'AssetDescription',
  Owner = 'Owner',
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
  SerialNumber?: string;
  AssetType?: string;
  AssetDescription?: string;
  Owner?: string;
  DeviceState?: DeviceTriangulation[] | null;
}

interface RootState {
  deviceList: Device[];
  filterType: DeviceFilterTypes;
  filterValue: string | null;
  activeDevice: Device | null;
  hubs: Hub[];
  events: Event[];
}

export interface Event {
  id: number;
  Time: string;
  Sequence: number;
  Beacon_SerialNumber: string;
  Beacon?: any;
  Hub_SerialNumber: string;
  Hub?: any;
  Type?: any;
  Decibels: number;
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
  },
  getters: {
    getEventsByBeacon: (state) => (serialNumber) =>
      state.events.filter((event) => event.Beacon_SerialNumber === serialNumber).sort((a, b) => {
        return new Date(a.Time).getTime() - new Date(b.Time).getTime();
    }),
    getHubBySerial: (state) => (serialNumber) => state.hubs.find((hub) => hub.SerialNumber === serialNumber),
    getDeviceListByFilter({ deviceList, filterType, filterValue }) {
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
    [MUTATIONS.UPDATE_EVENTS](state, { events }) {
      state.events = state.events.concat((events));
    },
  },
  actions: {
    async getBeacons({ commit }) {
      const { data } = await Vue.axios.get('api/tag');

      const filtered: Device[] = data.filter((device: Device) => {
        if (device.AssetDescription) {
          if (device.AssetDescription.includes('JL')) {
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
