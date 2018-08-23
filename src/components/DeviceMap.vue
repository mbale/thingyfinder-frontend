<template>
  <section class="section DeviceMap"></section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Stage, Layer, Circle, Vector2d } from 'konva';
import { Device } from '@/store';

export default Vue.extend({
  name: 'DeviceMap',
  mounted() {
    const container = document.querySelector('.DeviceMap');
    const activeDevice: Device = this.$store.state.activeDevice;

    if (activeDevice && container) {
      if (!activeDevice.DeviceState || !activeDevice.DeviceState.length) {
        return 'Unknown states';
      }

      const stage = new Stage({
        container,
        width: container.clientWidth,
        height: container.clientHeight,
      });

      const layer = new Layer();

      for (const { Circle1, Circle2, Circle3 } of activeDevice.DeviceState) {
        if (Circle1.Centre.x < 0) {
          Circle1.Centre.x = Circle1.Centre.x * -1;
        }

        if (Circle1.Centre.y < 0) {
          Circle1.Centre.y = Circle1.Centre.y * -1;
        }

        const circle1 = new Circle({
          x: Circle1.Centre.x,
          y: Circle1.Centre.y,
          radius: Circle1.Radius / 50,
          fill: 'red',
          stroke: 'black',
          strokeWidth: 1,
          scale: {
            x: -5,
            y: -5
          },
          strokeScaleEnabled: true,
        });

        console.log(Circle1.Centre.x / 500,
          Circle1.Centre.y / 500,)

        // const circle2 = new Circle({
        //   x: Circle2.Centre.x / 500,
        //   y: Circle2.Centre.y / 500,
        //   radius: Circle2.Radius,
        //   fill: 'red',
        //   stroke: 'black',
        //   strokeWidth: 1,
        // });

        // const circle3 = new Circle({
        //   x: Circle3.Centre.x / 500,
        //   y: Circle3.Centre.y / 500,
        //   radius: Circle3.Radius,
        //   fill: 'red',
        //   stroke: 'black',
        //   strokeWidth: 1,
        // });

        layer.add(circle1);
      }

      stage.add(layer);

      return 'no select';
    }
  },
});
</script>

<style lang="scss" scoped>

.DeviceMap {
  min-height: 1000px;
  height: 100%;
  margin: 0px;
  padding: 0px;
}

</style>

