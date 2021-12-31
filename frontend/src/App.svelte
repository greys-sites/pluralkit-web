<script>
	import SystemCard from './components/system-card.svelte';
	import MemberList from './components/member-list.svelte';
	import Login from './components/login.svelte';

	let user;
	let fetched = false;
	$: fetch('/api/user')
		.then((d) => d.json())
		.then((u) => {
			user = u;
			fetched = true;
			user.system.count = user.members.length;
		})
		.catch(e => fetched = true);
</script>

<header>
	<h3>Pluralkit Web</h3>
	<button>login</button>
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

<style>
	header {
		width: 100%;
		background: #333;
		padding: 2px 8px;
		height: 3em;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
	}
	header h3 {
		color: white;
		opacity: .75;
		float: left;
		margin:  0;
	}

	main {
		text-align: left;
		margin: 0 auto;
		width: 90%;
	}

	h1 {
		color: #ddd;
		text-transform: uppercase;
		font-size: 1.5em;
		font-weight: bold;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>