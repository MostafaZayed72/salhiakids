<template>
  <div>
    <UsersRoles />
  </div>
</template>

<script setup>
import UsersRoles from '~/components/usersRoles.vue';

definePageMeta({
  middleware: ['admin-auth']
});
</script>
