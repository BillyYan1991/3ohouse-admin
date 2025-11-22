<script setup lang="ts">
import { useRouter } from 'vue-router'
import { logout } from '@/services/auth'

const router = useRouter()

const handleLogout = () => {
  try {
    logout()
  } catch (e) {
    // best-effort, still navigate to login
    console.error('logout error', e)
  }
  router.push({ name: 'Login' })
}

</script>

<template>
  <header class="app-header fixed-top">
    <div class="app-header-inner">
      <div class="container-fluid py-2">
        <div class="app-header-content">
          <div class="row justify-content-between align-items-center">

            <div class="col-auto">
              <a id="sidepanel-toggler" class="sidepanel-toggler d-inline-block d-xl-none" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" role="img">
                  <title>Menu</title>
                  <path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2"
                    d="M4 7h22M4 15h22M4 23h22"></path>
                </svg>
              </a>
            </div><!--//col-->
            <div class="search-mobile-trigger d-sm-none col">

            </div><!--//col-->
            <div class="app-search-box col">

            </div><!--//app-search-box-->

            <div class="app-utilities col-auto">
              <div class="app-utility-item app-notifications-dropdown dropdown">

                <div class="dropdown-menu p-0" aria-labelledby="notifications-dropdown-toggle">
                  <div class="dropdown-menu-header p-3">
                    <h5 class="dropdown-menu-title mb-0">Notifications</h5>
                  </div><!--//dropdown-menu-title-->
                  <div class="dropdown-menu-content">
                    <div class="item p-3">
                      <div class="row gx-2 justify-content-between align-items-center">
                        <div class="col-auto">
                          name
                        </div><!--//col-->
                      </div><!--//row-->
                    </div><!--//item-->
                  </div><!--//dropdown-menu-content-->
                </div><!--//dropdown-menu-->
              </div><!--//app-utility-item-->


              <div class="app-utility-item app-user-dropdown dropdown">
                <a class="dropdown-toggle" id="user-dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button"
                  aria-expanded="false">name</a>
                <ul class="dropdown-menu" aria-labelledby="user-dropdown-toggle">
                  <li>
                    <a href="#" class="dropdown-item" @click.prevent="handleLogout">登出</a>
                  </li>
                </ul>
              </div><!--//app-user-dropdown-->
            </div><!--//app-utilities-->
          </div><!--//row-->
        </div><!--//app-header-content-->
      </div><!--//container-fluid-->
    </div><!--//app-header-inner-->
    <div id="app-sidepanel" class="app-sidepanel sidepanel-visible">
      <div id="sidepanel-drop" class="sidepanel-drop"></div>
      <div class="sidepanel-inner d-flex flex-column">
        <a href="#" id="sidepanel-close" class="sidepanel-close d-xl-none">×</a>
        <div class="app-branding">


        </div><!--//app-branding-->

        <nav id="app-nav-main" class="app-nav app-nav-main flex-grow-1">
          <ul class="app-menu list-unstyled accordion" id="menu-accordion">
            <li class="nav-item">
              <router-link :to="{ name: 'Home' }" class="nav-link" active-class="active">
                <span class="nav-link-text">首頁</span>
              </router-link>
              <!--//nav-link-->
            </li><!--//nav-item-->
            <li class="nav-item">
              <router-link
                :to="{ name: 'CalendarForm', params: { id: '93a5bc7d0accd55a881ef99837103887c43d3495beac42f15291f56e21064890@group.calendar.google.com' } }"
                class="nav-link" active-class="active">
                <span class="nav-link-text">日曆</span>
              </router-link>
              <!--//nav-link-->
            </li><!--//nav-item-->
            <li class="nav-item">
              <router-link :to="{ name: 'SpecialDayList', params: { id: '1' } }" class="nav-link" active-class="active">
                <span class="nav-link-text">特別價格</span>
              </router-link>
              <!--//nav-link-->
            </li>
          </ul><!--//app-menu-->
        </nav><!--//app-nav-->


      </div><!--//sidepanel-inner-->
    </div><!--//app-sidepanel-->
  </header>
</template>

<style scoped></style>
