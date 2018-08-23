import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

Vue.use(Vuex);

export const MUTATIONS = {
  UPDATE_DEVICE_LIST: 'UPDATE_DEVICE_LIST',
  UPDATE_DEVICE_STATUS: 'UPDATE_DEVICE_STATUS',
  UPDATE_FILTER_TYPE: 'UPDATE_FILTER_TYPE',
  UPDATE_FILTER_VALUE: 'UPDATE_FILTER_VALUE',
  UPDATE_ACTIVE_DEVICE: 'UPDATE_ACTIVE_DEVICE',
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
}

const store: StoreOptions<RootState> = {
  state: {
    deviceList: [],
    filterType: DeviceFilterTypes.Null,
    filterValue: null,
    activeDevice: null,
  },
  getters: {
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

  },
  actions: {
    async getBeacons({ commit }) {
      const { data } = await Vue.axios.get('tag');
      commit(MUTATIONS.UPDATE_DEVICE_LIST, data.map((dat: Device) => {
        dat.DeviceState = null;
        return dat;
      }));
    },
    async getStates({ commit, state }) {
      const deviceList = state.deviceList;

      for (const { SerialNumber } of deviceList) {
        if (SerialNumber !== '' && SerialNumber) {
          const { data } = await Vue.axios.get(`tag/triangulationPoints/${SerialNumber}/10`);
          commit(MUTATIONS.UPDATE_DEVICE_STATUS, { serialNumber: SerialNumber, deviceState: data })
        }
      }
    },
  },
};

export default new Vuex.Store(store);
