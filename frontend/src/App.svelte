<script>
	import { onMount } from 'svelte';

	import SystemCard from './components/system-card.svelte';
	import MemberList from './components/member-list.svelte';
	import Login from './components/login.svelte';

	let user;
	let fetched = false;

	onMount(async () => {
		try {
			const resp = await fetch('/api/user');
			const json = await resp.json();
			user = json;
			user.system.count = user.members.length;
		} catch(e) { }

		fetched = true;
	})

	async function logout() {
		await fetch('/api/logout');
		window.location = '/';
	}
</script>

<header>
	<h3>Pluralkit Web</h3>
	{#if user}
		<button on:click={logout}>logout</button>
	{/if}
</header>

<main>
	{#if user}
		<h1>System</h1>
		<SystemCard sys={user.system} fr={user.fronters}/>
		<h1>Members ({user.members.length})</h1>
		<MemberList members={user.members}/>
	{:else if fetched}
		<Login />
	{:else}
		<h1>Loading...</h1>
	{/if}
</main>

<footer>
	<h3>
		PluralKit by <a href="https://github.com/xske/pluralkit">xSke</a> |{" "}
		<a href="https://github.com/greysdawn/pluralkit-web">site source</a>
	</h3>
</footer>

<style>
	header, footer {
		width: 100%;
		background: #333;
		padding: 2px 8px;
		height: 3em;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
	}

	header h3, footer h3 {
		color: white;
		opacity: .75;
		float: left;
		margin: 0;
	}

	main {
		text-align: left;
		margin: 0 auto;
		width: 90%;
		min-height: calc(100% - 6em);
		padding: 20px;
		box-sizing: border-box;
	}

	h1 {
		color: #ddd;
		text-transform: uppercase;
		font-size: 1.5em;
		font-weight: bold;
		margin: 0;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>