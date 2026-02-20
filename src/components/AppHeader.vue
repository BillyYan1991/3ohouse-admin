<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/services/auth'
import { getToken, parseJwt } from '@/utils/auth'

  // signal to legacy script that Vue will manage the sidepanel
  ; (window as Window & { __vueHandlesSidepanel?: boolean }).__vueHandlesSidepanel = true

const router = useRouter()

// read stored user (from login response) or fall back to token payload
function readStoredUser(): string | null {
  try {
    const raw = localStorage.getItem('auth_user')
    if (!raw) return null
    // try parse JSON, otherwise return raw string
    try {
      const parsed = JSON.parse(raw)
      // if object has common fields, return them
      return (parsed && (parsed.name || parsed.email || parsed.user)) ? String(parsed.name || parsed.email || parsed.user) : String(parsed)
    } catch {
      return raw
    }
  } catch {
    return null
  }
}

const displayUser = computed(() => {
  const stored = readStoredUser()
  if (stored) return stored
  const t = getToken()
  if (!t) return ''
  const payload = parseJwt(t)
  if (!payload) return ''
  const name = payload['name'] || payload['email'] || payload['sub'] || payload['user']
  return name ? String(name) : ''
})

const handleLogout = () => {
  try {
    logout()
  } catch (e) {
    console.error('logout error', e)
  }
  router.push({ name: 'Login' })
}

// sidepanel refs and controls
const sidepanelRef = ref<HTMLElement | null>(null)
const sidepanelVisibleClass = 'sidepanel-visible'
const sidepanelHiddenClass = 'sidepanel-hidden'

function openSidepanel() {
  console.debug('openSidepanel')
  const el = sidepanelRef.value ?? (document.getElementById('app-sidepanel') as HTMLElement | null)
  if (!el) return
  el.classList.remove(sidepanelHiddenClass)
  el.classList.add(sidepanelVisibleClass)
}

function closeSidepanel() {
  console.debug('closeSidepanel')
  const el = sidepanelRef.value ?? (document.getElementById('app-sidepanel') as HTMLElement | null)
  if (!el) return
  el.classList.remove(sidepanelVisibleClass)
  el.classList.add(sidepanelHiddenClass)
}

function toggleSidepanel() {
  const el = sidepanelRef.value ?? (document.getElementById('app-sidepanel') as HTMLElement | null)
  if (!el) return
  console.debug('toggleSidepanel')
  if (el.classList.contains(sidepanelVisibleClass)) {
    el.classList.remove(sidepanelVisibleClass)
    el.classList.add(sidepanelHiddenClass)
  } else {
    el.classList.remove(sidepanelHiddenClass)
    el.classList.add(sidepanelVisibleClass)
  }
}

// expose handlers on window so TS doesn't mark them as unused (and for debugging from console)
; (window as Window & {
  __openSidepanel?: () => void
  __closeSidepanel?: () => void
  __toggleSidepanel?: () => void
}).__openSidepanel = openSidepanel
  ; (window as Window & {
    __openSidepanel?: () => void
    __closeSidepanel?: () => void
    __toggleSidepanel?: () => void
  }).__closeSidepanel = closeSidepanel
  ; (window as Window & {
    __openSidepanel?: () => void
    __closeSidepanel?: () => void
    __toggleSidepanel?: () => void
  }).__toggleSidepanel = toggleSidepanel
</script>

<template>
  <header class="app-header fixed-top">
    <div class="app-header-inner">
      <div class="container-fluid py-2">
        <div class="app-header-content">
          <div class="row justify-content-between align-items-center">

            <div class="col-auto">
              <a id="sidepanel-toggler" class="sidepanel-toggler d-inline-block d-xl-none" href="#"
                @click.stop.prevent="toggleSidepanel">
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
                          {{ displayUser || 'name' }}
                        </div><!--//col-->
                      </div><!--//row-->
                    </div><!--//item-->
                  </div><!--//dropdown-menu-content-->
                </div><!--//dropdown-menu-->
              </div><!--//app-utility-item-->


              <div class="app-utility-item app-user-dropdown dropdown">
                <a class="dropdown-toggle" id="user-dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button"
                  aria-expanded="false">{{ displayUser || 'name' }}</a>
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
    <div id="app-sidepanel" ref="sidepanelRef" class="app-sidepanel sidepanel-visible">
      <div id="sidepanel-drop" class="sidepanel-drop" @click.stop.prevent="closeSidepanel"></div>
      <div class="sidepanel-inner d-flex flex-column">
        <a href="#" id="sidepanel-close" class="sidepanel-close d-xl-none" @click.stop.prevent="closeSidepanel">×</a>
        <div class="app-branding">


        </div><!--//app-branding-->

        <nav id="app-nav-main" class="app-nav app-nav-main flex-grow-1">
          <ul class="app-menu list-unstyled accordion" id="menu-accordion">
            <li class="nav-item">
              <router-link :to="{ name: 'Home' }" class="nav-link" active-class="active">
                <span class="nav-link-text" style="font-size: 25px;"><strong>首頁</strong></span>
              </router-link>
              <!--//nav-link-->
            </li><!--//nav-item-->
            <li class="nav-item">
              <router-link :to="{ name: 'BookingList' }" class="nav-link" active-class="active">
                <span class="nav-link-text" style="font-size: 25px;"><strong>訂單管理</strong></span>
              </router-link>
              <!--//nav-link-->
            </li><!--//nav-item-->
            <li class="nav-item has-submenu">
              <!--//Bootstrap Icons: https://icons.getbootstrap.com/ -->
              <a class="nav-link submenu-toggle" href="#" data-bs-toggle="collapse" data-bs-target="#submenu-1"
                aria-expanded="false" aria-controls="submenu-1">

                <span class="nav-link-text" style="font-size: 25px;"><strong>谷歌日曆</strong></span>
                <span class="submenu-arrow">
                  <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-down" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z">
                    </path>
                  </svg>
                </span><!--//submenu-arrow-->
              </a><!--//nav-link-->
              <div id="submenu-1" class="submenu submenu-1 collapse" data-bs-parent="#menu-accordion" style="">
                <ul class="submenu-list list-unstyled">
                  <li class="submenu-item"> <router-link
                      :to="{ name: 'CalendarForm', params: { id: '93a5bc7d0accd55a881ef99837103887c43d3495beac42f15291f56e21064890@group.calendar.google.com' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">無憂</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link
                      :to="{ name: 'CalendarForm', params: { id: 'a0df99674f24e4a9f10ed93c0d740243c25b9054a8af6b3538ff1f7cef8d38c0@group.calendar.google.com' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">寄寓</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link
                      :to="{ name: 'CalendarForm', params: { id: '1ebb04b069c0564f97ae35930ffd2fe84de8822c614a780ef3af250b376cf26f@group.calendar.google.com' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">上水</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link
                      :to="{ name: 'CalendarForm', params: { id: '598e8e02122a546f0927c7a712789630370e4b4a380deb1dc07a6506f7fb6a7b@group.calendar.google.com' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">花水木</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link
                      :to="{ name: 'CalendarForm', params: { id: '369d765eb1f58e6133724be27209115a07f0ba7df6e5a0b93626067a7a025881@group.calendar.google.com' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">避風港</span>
                    </router-link></li>
                </ul>
              </div>
            </li>
            <li class="nav-item has-submenu">
              <a class="nav-link submenu-toggle" href="#" data-bs-toggle="collapse" data-bs-target="#submenu-2"
                aria-expanded="false" aria-controls="submenu-2">
                <span class="nav-link-text" style="font-size: 25px;"><strong>房型設定</strong></span>
                <span class="submenu-arrow">
                  <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-down" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z">
                    </path>
                  </svg>
                </span><!--//submenu-arrow-->
              </a><!--//nav-link-->
              <div id="submenu-2" class="submenu submenu-2 collapse" data-bs-parent="#menu-accordion" style="">
                <ul class="submenu-list list-unstyled">
                  <li class="submenu-item"><router-link :to="{ name: 'RoomList', params: { id: '1' } }" class="nav-link"
                      active-class="active">
                      <span class="nav-link-text">無憂</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link :to="{ name: 'RoomList', params: { id: '2' } }" class="nav-link"
                      active-class="active">
                      <span class="nav-link-text">寄寓</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link :to="{ name: 'RoomList', params: { id: '3' } }" class="nav-link"
                      active-class="active">
                      <span class="nav-link-text">上水</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link :to="{ name: 'RoomList', params: { id: '4' } }" class="nav-link"
                      active-class="active">
                      <span class="nav-link-text">花水木</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link :to="{ name: 'RoomList', params: { id: '5' } }" class="nav-link"
                      active-class="active">
                      <span class="nav-link-text">避風港</span>
                    </router-link></li>
                </ul>
              </div>
            </li>
            <li class="nav-item has-submenu">
              <a class="nav-link submenu-toggle" href="#" data-bs-toggle="collapse" data-bs-target="#submenu-3"
                aria-expanded="false" aria-controls="submenu-3">
                <span class="nav-link-text" style="font-size: 25px;"><strong>特別區間設定</strong></span>
                <span class="submenu-arrow">
                  <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-down" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z">
                    </path>
                  </svg>
                </span><!--//submenu-arrow-->
              </a><!--//nav-link-->
              <div id="submenu-3" class="submenu submenu-3 collapse" data-bs-parent="#menu-accordion" style="">
                <ul class="submenu-list list-unstyled">
                  <li class="submenu-item"><router-link :to="{ name: 'SpecialDayList', params: { id: '1' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">無憂</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link :to="{ name: 'SpecialDayList', params: { id: '2' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">寄寓</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link :to="{ name: 'SpecialDayList', params: { id: '3' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">上水</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link :to="{ name: 'SpecialDayList', params: { id: '4' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">花水木</span>
                    </router-link></li>
                  <li class="submenu-item"><router-link :to="{ name: 'SpecialDayList', params: { id: '5' } }"
                      class="nav-link" active-class="active">
                      <span class="nav-link-text">避風港</span>
                    </router-link></li>
                </ul>
              </div>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'FinancialForm' }" class="nav-link" active-class="active">
                <span class="nav-link-text" style="font-size: 25px;"><strong>財務</strong></span>
              </router-link>
              <!--//nav-link-->
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'SysconfigSettings' }" class="nav-link" active-class="active">
                <span class="nav-link-text" style="font-size: 25px;"><strong>參數設定</strong></span>
              </router-link>
              <!--//nav-link-->
            </li><!--//nav-item-->
          </ul><!--//app-menu-->
        </nav><!--//app-nav-->


      </div><!--//sidepanel-inner-->
    </div><!--//app-sidepanel-->
  </header>
</template>

<style scoped></style>
