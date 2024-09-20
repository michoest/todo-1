<template>
  <q-page>
    <q-list class="q-pt-md">
      <q-item-label header>User</q-item-label>
      <q-item class="q-pb-lg">
          <q-item-section avatar>
              <q-avatar>
                  <img src="https://cdn.quasar.dev/img/avatar4.jpg">
              </q-avatar>
          </q-item-section>

          <q-item-section>
              <q-item-label>{{ $store.user?.name.first }} {{ $store.user?.name.last }}</q-item-label>
              <q-item-label caption lines="1">{{ $store.user?.email }}</q-item-label>
          </q-item-section>

          <q-item-section side>
              <q-btn flat round icon="more_horiz" color="grey" @click="onClickUserActions" />
          </q-item-section>
      </q-item>
      <q-item>
          <q-item-section>
              <q-btn color="negative" outline @click="onClickSignout">Sign out</q-btn>
          </q-item-section>
      </q-item>

      <q-separator inset spaced="xl" />

      <q-item-label header>Accounts</q-item-label>

      <q-item v-for="account in accounts" :key="account.id" class="q-pb-lg" :class="{ 'bg-grey-2': $store.account.id == account.id }">
          <q-item-section>
              <q-item-label>{{ account.description }} <q-icon v-if="$store.user?.defaultAccount == account.id" name="verified_user" color="positive" /></q-item-label>
              <q-item-label caption lines="1">{{ account.id }}</q-item-label>
          </q-item-section>

          <q-item-section side>
              <q-btn v-if="$store.account.id != account.id" flat round icon="login" color="primary" @click="onClickSwitchAccounts(account.id)" />
              <q-btn v-else flat round icon="more_horiz" color="grey" @click="onClickAccountActions(account.id)" />
          </q-item-section>
      </q-item>

      <q-separator inset spaced="xl" />

      <q-item-label header>Backend</q-item-label>
      <q-item>
        <q-item-section>
          <q-input v-model="api" placeholder="API URL">
            <template v-slot:append>
              <q-btn round dense flat icon="network_check" :color="apiStatus ? 'positive' : 'negative'" @click="checkAPI" />
              <q-btn round dense flat color="primary" icon="sync" @click="setAPI" />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-list>
    {{ $store.user }}
  </q-page>
</template>

<script setup>
defineOptions({ name: 'SettingsPage' });

import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'src/stores/store';

const $router = useRouter();
const $store = useStore();

const api = ref('');
const apiStatus = ref(false);

const accounts = computed(() => {
  return $store.user?.accounts || [];
})

const checkAPI = async () => {
  apiStatus.value = await $store.checkAPI(api.value);
};

const setAPI = () => {
  $store.setAPI(api.value);

  $notify(`API updated!`);
}

const onClickSwitchAccounts = async (accountId) => {
  if (await $store.loginToAccount(accountId)) {
    $router.push('/');
  }
};

const onClickUserActions = () => {

};

const onClickAccountActions = () => {

};

const onClickSignout = async () => {
  if (await $store.logout()) {
    $router.push('/');
  }
};

onMounted(async () => {
  api.value = $store.persistent.api;
  await checkAPI();
});
</script>
