<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <img class="NavBarLogo" src="../public/logo-latest.png" width="128" height="128">
        </router-link>
        <div class="navbar-burger burger" data-target="navbarExampleTransparentExample">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div id="navbarExampleTransparentExample" class="navbar-menu">
        <div class="navbar-start">
          <router-link to="/" class="navbar-item">Home</router-link>
        </div>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<style lang="scss">
@import 'bulma';
@import '~bulma-extensions/dist/css/bulma-extensions.min.css';


html, body, #app {
  height: 100%;
  margin: 0px;
  padding: 0px;
}

.navbar {
  box-shadow: 0 2px 0 0 #f5f5f5;
}

.navbar-item {
  padding: 15px;
  .NavBarLogo {
    // max-height: 2.8rem;
  }
}


</style>
