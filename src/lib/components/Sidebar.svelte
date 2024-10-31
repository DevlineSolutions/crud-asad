<script>
	// Define the navigation items
	const navItems = [
		{
			name: 'Instructions',
			href: '/instructions',
			icon: `
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
					<g id="instruction_sidebar">
                    <path
						fill="currentColor"
						d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 2h7v5h5v11H6zm2 8v2h8v-2zm0 4v2h5v-2z"
					/>
		</g>
	</svg>
`
		},
		{
			name: 'Steps',
			href: '/steps',
			icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...$$props}>
    <g id="step_sidebar">
    <path fill="currentColor" d="M4.442 21q-.191 0-.317-.125Q4 20.75 4 20.559t.125-.318t.317-.126H6.5V18.75H5.442q-.191 0-.317-.125Q5 18.5 5 18.309t.125-.318t.317-.126H6.5V16.5H4.442q-.191 0-.317-.125Q4 16.25 4 16.059t.125-.318t.317-.126h2.25q.294 0 .493.2t.2.493v1.384q0 .294-.2.493t-.493.2q.294 0 .493.199q.2.199.2.493v1.23q0 .295-.2.494T6.692 21zm.174-6.308q-.249 0-.432-.183Q4 14.325 4 14.077V12.25q0-.294.199-.493t.493-.2H6.5v-1.365H4.442q-.191 0-.317-.125Q4 9.942 4 9.751t.125-.317t.317-.126h2.25q.294 0 .493.199t.2.493v1.75q0 .294-.2.493t-.493.2H4.884v1.365h2.058q.192 0 .317.125t.125.316t-.125.317t-.317.126zm1.327-6.308q-.191 0-.317-.125T5.5 7.942V3.885H4.442q-.191 0-.317-.125Q4 3.635 4 3.443t.125-.317T4.442 3h1.346q.248 0 .422.174t.174.422v4.346q0 .192-.125.317t-.316.125M10.116 18.5q-.213 0-.357-.144t-.143-.357t.143-.356t.357-.143H19.5q.213 0 .356.144t.144.357t-.144.356t-.356.143zm0-6q-.213 0-.357-.144t-.143-.357t.143-.356t.357-.143H19.5q.213 0 .356.144t.144.357t-.144.356t-.356.143zm0-6q-.213 0-.357-.144t-.143-.357t.143-.356t.357-.143H19.5q.213 0 .356.144t.144.357t-.144.356t-.356.143z" />
</g>
</svg>`
		},
		{
			name: 'Assets',
			href: '/assets',
			icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...$$props}>
    <path fill="currentColor" d="M3 19V5h6.596l2 2H21v12zm1-1h16V8h-8.81L9.195 6H4zm0 0V6zm10.192-2.192v-5.616h1.818l1.798 1.799v3.817zm-.884.884h5.384v-5.057l-2.326-2.327h-3.058z" />
</svg>`
		},
		{
			name: 'Instruction-Assets',
			href: '/instruction-assets',
			icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...$$props}>
    <g id="asset_instruction_sidebar" data-name="Layer 2">
        <path fill="currentColor" d="M15 20a1 1 0 0 0 1-1V4H8a1 1 0 0 0-1 1v11H5V5a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v1h-2V5a1 1 0 0 0-1-1a1 1 0 0 0-1 1v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-1h11a2 2 0 0 0 2 2M9 6h5v2H9zm0 4h5v2H9zm0 4h5v2H9z" />
    </g>
</svg>`
		},
		{
			name: 'Users',
			href: '/users',
			icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...$$props}>
     <g id="user_sidebar" >
    <path fill="currentColor" d="M13.998 11.462q1.04 0 1.771-.729t.731-1.77t-.728-1.77t-1.77-.731t-1.771.728t-.731 1.77t.729 1.77t1.769.732m-5.421 4.48q1.067-1.151 2.47-1.777q1.401-.626 2.953-.626t2.954.626t2.469 1.777q.25 0 .414-.182q.163-.183.163-.433V4.616q0-.27-.173-.443T19.385 4H8.615q-.269 0-.442.173T8 4.616v10.711q0 .25.164.433q.163.182.413.182M8.616 17q-.667 0-1.141-.475T7 15.386V4.615q0-.666.475-1.14T8.615 3h10.77q.666 0 1.14.475T21 4.615v10.77q0 .666-.475 1.14t-1.14.475zm-4 4q-.667 0-1.141-.475T3 19.386V7h1v12.385q0 .269.173.442t.443.173H17v1zM14 10.462q-.617 0-1.059-.442q-.441-.441-.441-1.059t.441-1.058q.442-.442 1.059-.442t1.059.442t.441 1.058t-.441 1.06q-.442.44-1.059.44M9.97 16h8.06q-.84-.73-1.872-1.096T14 14.538t-2.158.366T9.97 16M14 9.971" />
</g>
</svg>`
		}
	];

	// Add a selected state for active navigation
	import { page } from '$app/stores';
	let selected = $page.url.pathname;
</script>

<!-- Sidebar -->
<aside class="fixed left-0 top-0 h-screen w-64 space-y-8 bg-white px-4 py-6 shadow-lg">
	<div class="flex items-center justify-center mt-4">
		<h1 class="text-2xl font-bold text-blue-600">THE INSTRUCTOR</h1>
	</div>
	<nav>
		<ul class="space-y-4">
			{#each navItems as item}
				<li>
					<a
						href={item.href}
						class="flex items-center rounded-lg px-4 py-3 text-gray-600 transition-all duration-300 ease-in-out hover:bg-blue-100 hover:text-blue-600 {selected ===
						item.href
							? 'bg-blue-100 !text-blue-600'
							: ''}"
						on:click={() => (selected = item.href)}
					>
						<span class="mr-3 text-2xl">{@html item.icon}</span>
						<span class="text-md font-medium">{item.name}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>

<style>
	/* Adjust sidebar styles for smooth transitions */
	aside {
		transition: transform 0.3s ease-in-out;
	}
</style>
