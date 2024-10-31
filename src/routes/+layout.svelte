<!-- src/routes/_layout.svelte -->

<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import '../app.css';
</script>


<Sidebar/>
<div class="flex ml-64 bg-slate-100 min-h-screen">
	<div class="flex-1 flex flex-col items-center">
	  <slot />
	</div>
</div>
