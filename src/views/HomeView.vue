<template>
<div class="home">
  <WebUrl/>
</div>
</template>

<script>
// @ is an alias to /src
import WebUrl from '@/views/web/url/index.vue'

export default {
  name: 'HomeView',
  components: {
    WebUrl
  }
}
</script>
